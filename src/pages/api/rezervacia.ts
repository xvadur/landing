/** POST /api/rezervacia/ (XDR-210): { slot (UTC ISO z /api/terminy/), meno, email, tema, utm, web (honeypot) }
 *  → overí termín podľa pravidiel a obsadenosti, zapíše rezerváciu, obsadí slot, pošle potvrdenie klientovi a kópiu
 *  Adamovi (Resend, ak je nastavený; klientovi s pozvánkou .ics). Odpoveď: { ok, id, slot, potvrdenie }. */
import type { APIRoute } from 'astro';
import { jePlatnySlot, TERMINY } from '@/data/terminy';
import { chyba, citajJson, escapeHtml, id, json, kv, NOTIFY, platnyEmail, posliEmail, PREFIX, text, utm, zapocitaj } from '@/lib/server/uloziste';
import { ics, slotText } from '@/lib/ics';

export const prerender = false;

function base64(t: string): string {
  let bin = '';
  for (const b of new TextEncoder().encode(t)) bin += String.fromCharCode(b);
  return btoa(bin);
}

export const GET: APIRoute = () => chyba('Použi POST.', 405);

export const POST: APIRoute = async ({ request }) => {
  const data = await citajJson(request);
  if (!data) return chyba('Neplatná požiadavka.');
  if (text(data.web, 100)) return json({ ok: true, id: 'x', slot: null, potvrdenie: 'nenastavene' });

  const slot = text(data.slot, 40);
  const meno = text(data.meno, 80);
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const tema = text(data.tema, 600);
  if (!meno) return chyba('Napíš, ako ťa mám oslovovať.');
  if (!platnyEmail(email)) return chyba('Skontroluj e-mail, niečo v ňom chýba.');
  if (!jePlatnySlot(slot)) return chyba('Tento termín už nie je k dispozícii. Vyber iný.', 409);

  const store = kv();
  if (!store) return chyba('Rezervácia práve nejde. Napíš mi na WhatsApp alebo na adam@xvadur.com.', 503);
  const slotKey = `${PREFIX}slot:${slot}`;
  if (await store.get(slotKey)) return chyba('Tento termín si práve niekto zobral. Vyber iný.', 409);

  const rid = id();
  const zaznam = { id: rid, slot, meno, email, tema, utm: utm(data.utm), cas: new Date().toISOString() };
  await store.put(slotKey, rid);
  await store.put(`${PREFIX}rezervacia:${slot}:${rid}`, JSON.stringify(zaznam));
  await zapocitaj('rezervacia_ulozena');

  const kedy = slotText(slot);
  const pozvanka = ics({ id: rid, slot, trvanieMin: TERMINY.trvanieMin, meno, email });
  const potvrdenie = await posliEmail({
    to: email,
    subject: `Konzultácia: ${kedy}`,
    replyTo: 'adam@xvadur.com',
    html: `<p>Ahoj ${escapeHtml(meno)},</p><p>konzultácia je zapísaná: <strong>${escapeHtml(kedy)}</strong>, 30 minút. Odkaz na hovor ti pošlem deň vopred.</p><p>Priprav si jeden príklad úlohy, ktorú chceš zlepšiť. Netreba prezentáciu.</p><p>Adam<br>xvadur.com</p>`,
    attachments: [{ filename: 'konzultacia-xvadur.ics', content: base64(pozvanka) }],
  });
  await posliEmail({
    to: NOTIFY(),
    subject: `Nová rezervácia: ${kedy} — ${meno}`,
    replyTo: email,
    html: `<p><strong>${escapeHtml(kedy)}</strong></p><p>${escapeHtml(meno)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(tema || '—')}</p><pre>${escapeHtml(JSON.stringify(zaznam.utm))}</pre>`,
  });
  return json({ ok: true, id: rid, slot, potvrdenie });
};
