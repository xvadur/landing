/** POST /api/udalost/ (XDR-210): meranie klikov a rezervácií pre analytiku a reklamu. { nazov, miesto, stranka, utm }
 *  → riadok do Workers Logs (observability je zapnutá) + denný počítadlo v úložisku. Posiela ho src/lib/meranie.ts
 *  cez sendBeacon. Povolené názvy sú v zozname nižšie (nič iné sa nezapíše). */
import type { APIRoute } from 'astro';
import { chyba, text, utm, zapocitaj } from '@/lib/server/uloziste';

export const prerender = false;

const POVOLENE = ['konzultacia_klik', 'konzultacia_rezervacia', 'zapis_odoslany', 'dokaz_klik', 'whatsapp_klik'];

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown> = {};
  try {
    const t = await request.text();
    if (t.length > 2048) return chyba('Príliš veľké.', 413);
    data = JSON.parse(t || '{}');
  } catch {
    return chyba('Neplatná požiadavka.');
  }
  const nazov = text(data.nazov, 40);
  if (!POVOLENE.includes(nazov)) return chyba('Neznáma udalosť.');
  console.log(JSON.stringify({ udalost: nazov, miesto: text(data.miesto, 60), stranka: text(data.stranka, 200), utm: utm(data.utm) }));
  await zapocitaj(nazov);
  return new Response(null, { status: 204 });
};
