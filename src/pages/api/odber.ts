/** POST /api/odber  { email, zdroj?, web? } → JSON { ok: true } | { chyba, fallback? }.
 *  Beží vo workerd (Cloudflare adaptér, `prerender = false`), bez node:*. Logika bez siete je v src/lib/odber.ts.
 *  Kanál podľa env Workera (Cloudflare → Settings → Variables and Secrets):
 *    ODBER_WEBHOOK_URL   https URL (n8n Webhook node) — dostane JSON { typ, web, email, zdroj, cas }   [prednosť]
 *    RESEND_API_KEY      + voliteľne RESEND_AUDIENCE_ID — kontakt sa vytvorí v Resend
 *  Bez nastavenia → 503 { chyba, fallback: mailto } a formulár ponúkne e-mail ručne. Honeypot `web` → 200 bez uloženia.
 *  GET → 405. Telo max 4 kB. Chyby po slovensky. */
import type { APIRoute } from 'astro';
import { BODY_MAX, kanal, mailtoFallback, parsujVstup, resendRequest, webhookPayload, type ResendEnv } from '@/lib/odber';

export const prerender = false;

const TIMEOUT_MS = 8_000;
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

/** Env Workera z adaptéra (locals.runtime.env); lokálne / v teste prázdny objekt. */
function envZ(locals: unknown): Record<string, unknown> {
  const rt = (locals as { runtime?: { env?: Record<string, unknown> } } | undefined)?.runtime;
  return rt?.env ?? {};
}

async function fetchTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export const GET: APIRoute = () =>
  json({ chyba: 'Použi POST s JSON telom { email }.' }, 405);

export const POST: APIRoute = async ({ request, locals }) => {
  const len = Number(request.headers.get('content-length') ?? 0);
  if (len > BODY_MAX) return json({ chyba: 'Príliš veľká požiadavka.' }, 413);
  const text = await request.text();
  if (text.length > BODY_MAX) return json({ chyba: 'Príliš veľká požiadavka.' }, 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ chyba: 'Telo požiadavky nie je platný JSON.' }, 400);
  }

  const p = parsujVstup(body);
  if (!p.ok) return json({ chyba: p.chyba }, p.status);
  if (p.bot) return json({ ok: true });

  const env = envZ(locals);
  const k = kanal(env);
  const cas = new Date().toISOString();

  try {
    if (k === 'webhook') {
      const res = await fetchTimeout(env.ODBER_WEBHOOK_URL as string, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(webhookPayload(p.vstup, cas)),
      });
      if (!res.ok) return json({ chyba: 'Odber sa teraz nepodarilo uložiť. Skús o chvíľu.' }, 502);
      return json({ ok: true });
    }
    if (k === 'resend') {
      const { url, init } = resendRequest(p.vstup, env as unknown as ResendEnv);
      const res = await fetchTimeout(url, init);
      // 409 = kontakt už existuje → pre návštevníka je to úspech
      if (!res.ok && res.status !== 409) return json({ chyba: 'Odber sa teraz nepodarilo uložiť. Skús o chvíľu.' }, 502);
      return json({ ok: true });
    }
  } catch {
    return json({ chyba: 'Odber neodpovedá. Skús o chvíľu, alebo napíš e-mail.' , fallback: mailtoFallback(p.vstup.email) }, 502);
  }

  return json({ chyba: 'Odber sa ešte pripravuje. Napíš mi e-mail a zapíšem ťa ručne.', fallback: mailtoFallback(p.vstup.email) }, 503);
};
