/** POST /api/skore  { url } → JSON výsledok analyze(html, url).
 *  Beží vo workerd (Cloudflare adaptér, `prerender = false`), bez node:*.
 *  Pravidlá: len http(s), žiadne lokálne/privátne adresy (aj po presmerovaní), 8 s timeout, UA „XVADUR-skore/1.0“,
 *  max 1 MB HTML, telo požiadavky max 8 kB, kódovanie podľa Content-Type / <meta charset>.
 *  GET → 405. Chyby ako JSON { chyba: string } po slovensky. Analyzuje sa presne vložená stránka (nie nutne domov). */
import type { APIRoute } from 'astro';
import { analyze, dekodujHtml, jeZakazanyHost, normalizujUrl } from '@/lib/skore-analyzer';

export const prerender = false;

const UA = 'XVADUR-skore/1.0 (+https://xvadur.com/skore/)';
const TIMEOUT_MS = 8_000;
const MAX_BYTES = 1_000_000;
const MAX_BODY = 8_192;
const MAX_REDIRECTS = 5;
/** Vzorová adresa v chybovej hláške — doména bez záznamu (overené 19. 9. 2026: curl → bez odpovede), nie web tretej strany. */
const PRIKLAD_ADRESY = 'https://www.vas-web.sk';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

function chyba(text: string, status: number): Response {
  return json({ chyba: text }, status);
}


/** Prečíta telo odpovede po limit bajtov (stream), zvyšok zahodí. */
async function precitajDoLimitu(res: Response, limit: number): Promise<{ bajty: Uint8Array; orezane: boolean }> {
  const reader = res.body?.getReader();
  if (!reader) {
    const buf = new Uint8Array(await res.arrayBuffer());
    return { bajty: buf.subarray(0, limit), orezane: buf.byteLength > limit };
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  let orezane = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    if (total + value.byteLength > limit) {
      chunks.push(value.subarray(0, limit - total));
      total = limit;
      orezane = true;
      await reader.cancel().catch(() => {});
      break;
    }
    chunks.push(value);
    total += value.byteLength;
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.byteLength;
  }
  return { bajty: buf, orezane };
}

/** Fetch s ručným sledovaním presmerovaní: každý cieľ prejde normalizáciou a zákazom hostov. */
async function stiahni(start: URL, signal: AbortSignal): Promise<{ res: Response; url: URL } | { chyba: string; status: number }> {
  let url = start;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await fetch(url.href, {
      method: 'GET',
      redirect: 'manual',
      signal,
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
        'accept-language': 'sk-SK,sk;q=0.9,cs;q=0.8,en;q=0.5',
      },
    });
    const presmerovanie = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null;
    if (!presmerovanie) return { res, url };
    await res.body?.cancel().catch(() => {});
    let dalsia: URL | null;
    try {
      dalsia = normalizujUrl(new URL(presmerovanie, url).href);
    } catch {
      dalsia = null;
    }
    if (!dalsia) return { chyba: 'Web presmerúva na adresu, ktorú neviem prečítať.', status: 502 };
    if (jeZakazanyHost(dalsia.hostname)) return { chyba: 'Web presmerúva na adresu, ktorú neviem analyzovať. Zadajte verejný web s doménou.', status: 400 };
    url = dalsia;
  }
  return { chyba: 'Web presmerúva príliš veľakrát. Zadajte konečnú adresu.', status: 502 };
}

export const POST: APIRoute = async ({ request }) => {
  const cl = Number(request.headers.get('content-length') ?? 0);
  if (cl > MAX_BODY) return chyba('Požiadavka je príliš veľká. Pošlite len { "url": "https://…" }.', 413);

  let telo: unknown;
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const text = await request.text();
      if (text.length > MAX_BODY) return chyba('Požiadavka je príliš veľká. Pošlite len { "url": "https://…" }.', 413);
      telo = JSON.parse(text);
    } else {
      const fd = await request.formData();
      telo = { url: fd.get('url') };
    }
  } catch {
    return chyba('Nerozumiem požiadavke. Pošlite JSON { "url": "https://…" }.', 400);
  }

  const url = normalizujUrl((telo as { url?: unknown })?.url);
  if (!url) return chyba(`Zadajte platnú adresu webu, napríklad ${PRIKLAD_ADRESY}.`, 400);
  if (jeZakazanyHost(url.hostname)) return chyba('Túto adresu neviem analyzovať. Zadajte verejný web s doménou.', 400);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res: Response;
  let finalUrl: URL;
  try {
    const r = await stiahni(url, ctrl.signal);
    if ('chyba' in r) {
      clearTimeout(timer);
      return chyba(r.chyba, r.status);
    }
    res = r.res;
    finalUrl = r.url;
  } catch (e) {
    clearTimeout(timer);
    const aborted = (e as { name?: string })?.name === 'AbortError';
    return chyba(
      aborted
        ? 'Web neodpovedal do 8 sekúnd. Skúste to o chvíľu alebo zadajte inú adresu.'
        : 'Web sa nepodarilo načítať. Skontrolujte adresu (existuje doména, beží https?).',
      502,
    );
  }

  if (!res.ok) {
    clearTimeout(timer);
    await res.body?.cancel().catch(() => {});
    return chyba(`Web odpovedal chybou ${res.status}. Stránka sa nedá prečítať.`, 502);
  }
  const typ = (res.headers.get('content-type') ?? '').toLowerCase();
  if (typ && !typ.includes('html') && !typ.includes('xml') && !typ.includes('text/plain')) {
    clearTimeout(timer);
    await res.body?.cancel().catch(() => {});
    return chyba('Adresa nevracia HTML stránku. Zadajte adresu stránky webu.', 415);
  }

  let bajty: Uint8Array;
  let orezane = false;
  try {
    const r = await precitajDoLimitu(res, MAX_BYTES);
    bajty = r.bajty;
    orezane = r.orezane;
  } catch {
    clearTimeout(timer);
    return chyba('Web neodpovedal do 8 sekúnd. Skúste to o chvíľu.', 502);
  } finally {
    clearTimeout(timer);
  }

  const { html, kodovanie } = dekodujHtml(bajty, typ);
  const vysledok = analyze(html, finalUrl.href);
  return json({
    ok: true,
    url: finalUrl.href,
    orezane,
    bajty: bajty.byteLength,
    kodovanie,
    analyzovane: new Date().toISOString(),
    ...vysledok,
  });
};

const nepovolene: APIRoute = () =>
  json({ chyba: 'Použite POST s JSON { "url": "https://…" }.' }, 405, { allow: 'POST, OPTIONS' });

export const GET = nepovolene;
export const PUT = nepovolene;
export const DELETE = nepovolene;
export const PATCH = nepovolene;

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { allow: 'POST, OPTIONS', 'cache-control': 'no-store' } });
