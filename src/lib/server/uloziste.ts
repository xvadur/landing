/** Serverová vrstva V5 pre formuláre (XDR-210, XDR-211): úložisko, validácia, odpovede, Resend. Beží vo workerd.
 *
 *  Úložisko: KV binding `LEADS`, ak je v wrangler.jsonc; inak dočasne existujúci namespace `SESSION` s prefixom `v5:`
 *  (žiadny nový Cloudflare zdroj bez Adamovho pokynu). Kľúče:
 *   v5:zapis:<iso>:<id>           → JSON zápisu e-mailu (čakačka / lákadlo / newsletter)
 *   v5:zapis-email:<email>:<prod> → „1“ (duplicita)
 *   v5:rezervacia:<slot>:<id>     → JSON rezervácie
 *   v5:slot:<slot>                → id rezervácie (obsadený termín)
 *   v5:udalost:<YYYY-MM-DD>:<n>   → počet udalostí za deň
 *  Resend: iba ak sú nastavené secrets `RESEND_API_KEY` a `RESEND_FROM` (napr. „Adam z XVADUR <adam@xvadur.com>“);
 *  bez nich sa zápis uloží a odpoveď povie `potvrdenie: 'nenastavene'`. Kópia rezervácie ide na `NOTIFY_EMAIL`
 *  (default adam@xvadur.com). */
import { env as cfEnv } from 'cloudflare:workers';

export type KV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  list(opts?: { prefix?: string; limit?: number }): Promise<{ keys: { name: string }[] }>;
};

type Env = {
  LEADS?: KV;
  SESSION?: KV;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  NOTIFY_EMAIL?: string;
};

export const env = cfEnv as unknown as Env;
export const PREFIX = 'v5:';

export function kv(): KV | null {
  return env.LEADS ?? env.SESSION ?? null;
}

export const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
export const chyba = (text: string, status = 400) => json({ ok: false, chyba: text }, status);

const MAX_BODY = 4096;
/** Telo POST ako JSON objekt, max 4 kB; iné = null. */
export async function citajJson(request: Request): Promise<Record<string, unknown> | null> {
  const typ = request.headers.get('content-type') ?? '';
  if (!typ.includes('application/json')) return null;
  const text = await request.text();
  if (!text || text.length > MAX_BODY) return null;
  try {
    const data = JSON.parse(text);
    return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[^\s@<>()[\]\\,;:"]{1,190}\.[a-z]{2,24}$/i;
export function platnyEmail(v: unknown): v is string {
  return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v.trim());
}
export function text(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';
}

/** UTM a odkiaľ prišiel (klient posiela objekt utm z sessionStorage). */
export function utm(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!v || typeof v !== 'object') return out;
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'ttclid', 'gclid', 'ref']) {
    const val = text((v as Record<string, unknown>)[k], 200);
    if (val) out[k] = val;
  }
  return out;
}

export function id(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Odošle e-mail cez Resend. Vráti 'odoslane' | 'nenastavene' | 'chyba'. */
export async function posliEmail(msg: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
}): Promise<'odoslane' | 'nenastavene' | 'chyba'> {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) return 'nenastavene';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        reply_to: msg.replyTo,
        attachments: msg.attachments,
      }),
    });
    return r.ok ? 'odoslane' : 'chyba';
  } catch {
    return 'chyba';
  }
}

export const NOTIFY = () => env.NOTIFY_EMAIL || 'adam@xvadur.com';

/** Zvýši denný počítadlo udalosti (nie atomické; na meranie reklamy stačí, presné čísla drží pixel/analytika). */
export async function zapocitaj(nazov: string): Promise<void> {
  const store = kv();
  if (!store) return;
  const den = new Date().toISOString().slice(0, 10);
  const kluc = `${PREFIX}udalost:${den}:${nazov}`;
  const n = Number((await store.get(kluc)) ?? '0') || 0;
  await store.put(kluc, String(n + 1), { expirationTtl: 60 * 60 * 24 * 400 });
}
