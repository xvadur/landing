/** POST /api/zapis/ (XDR-211): e-mail + zdroj (čakačka / lákadlo / newsletter) + produkt + UTM → úložisko, potvrdenie
 *  cez Resend (ak je nastavený). Honeypot `web` (vyplnený = tichý úspech bez zápisu). Duplicita e-mail+produkt = ok, bez
 *  nového zápisu. Odpoveď: { ok, novy, potvrdenie }. Chyby po slovensky. */
import type { APIRoute } from 'astro';
import { LAKADLO, NEWSLETTER, PRODUKTY, ZAPIS_PRODUKTY, ZAPIS_ZDROJE } from '@/data/ponuka';
import { chyba, citajJson, escapeHtml, id, json, kv, platnyEmail, posliEmail, PREFIX, text, utm, zapocitaj } from '@/lib/server/uloziste';

export const prerender = false;

export const GET: APIRoute = () => chyba('Použi POST.', 405);

export const POST: APIRoute = async ({ request }) => {
  const data = await citajJson(request);
  if (!data) return chyba('Neplatná požiadavka.');
  if (text(data.web, 100)) return json({ ok: true, novy: false, potvrdenie: 'nenastavene' });

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  if (!platnyEmail(email)) return chyba('Skontroluj e-mail, niečo v ňom chýba.');
  const zdroj = text(data.zdroj, 20);
  if (!(ZAPIS_ZDROJE as readonly string[]).includes(zdroj)) return chyba('Neznámy formulár.');
  const produkt = text(data.produkt, 40) || (zdroj === 'newsletter' ? NEWSLETTER.id : zdroj === 'lakadlo' ? LAKADLO.id : '');
  if (!ZAPIS_PRODUKTY.includes(produkt)) return chyba('Neznámy produkt.');

  const store = kv();
  if (!store) return chyba('Úložisko práve nie je dostupné. Napíš mi na adam@xvadur.com.', 503);

  const dupKey = `${PREFIX}zapis-email:${email}:${produkt}`;
  if (await store.get(dupKey)) return json({ ok: true, novy: false, potvrdenie: 'uz-zapisany' });

  const zaznam = {
    email,
    zdroj,
    produkt,
    utm: utm(data.utm),
    stranka: text(data.stranka, 200),
    cas: new Date().toISOString(),
    krajina: (request as Request & { cf?: { country?: string } }).cf?.country ?? null,
  };
  await store.put(`${PREFIX}zapis:${zaznam.cas}:${id()}`, JSON.stringify(zaznam));
  await store.put(dupKey, '1');
  await zapocitaj(`zapis_${zdroj}`);

  const nazov =
    PRODUKTY.find((p) => p.id === produkt)?.nazov ?? (produkt === LAKADLO.id ? LAKADLO.nazov : NEWSLETTER.nazov);
  const veta =
    zdroj === 'lakadlo'
      ? `Návod „${escapeHtml(LAKADLO.nazov)}“ ti pošlem hneď, ako ho dopíšem.`
      : zdroj === 'newsletter'
        ? 'Vydanie ti príde raz za týždeň. Odhlásiš sa jedným klikom v každom e-maile.'
        : `Keď bude „${escapeHtml(nazov)}“ pripravené, dozvieš sa to ako prvý.`;
  const potvrdenie = await posliEmail({
    to: email,
    subject: zdroj === 'newsletter' ? 'Si vo Vydaní' : `Zapísané: ${nazov}`,
    replyTo: 'adam@xvadur.com',
    html: `<p>Ahoj,</p><p>ďakujem, zapísal som si ťa. ${veta}</p><p>Ak máš otázku, stačí odpovedať na tento e-mail.</p><p>Adam<br>xvadur.com</p>`,
  });
  return json({ ok: true, novy: true, potvrdenie });
};
