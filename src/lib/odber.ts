/** Odber (newsletter / lákadlo) — čistá logika bez Astra a bez siete (testy: tests/odber.test.mjs).
 *  POST /api/odber { email, zdroj?, web? } → validácia → payload pre n8n webhook (ODBER_WEBHOOK_URL) alebo Resend
 *  (RESEND_API_KEY + voliteľne RESEND_AUDIENCE_ID). `web` je honeypot: vyplnené pole = bot → API odpovie 200 a nič neuloží. */

export const EMAIL_MAX = 254;
export const ZDROJ_MAX = 40;
export const BODY_MAX = 4_096;

/** Praktický tvar e-mailu: jedna @, doména s bodkou, bez medzier (RFC 5322 v plnej šírke tu nikto nepotrebuje). */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(?:\.[^\s@.]+)+$/u;

export type OdberVstup = { email: string; zdroj: string };

export type Parsovanie =
  | { ok: true; vstup: OdberVstup; bot: boolean }
  | { ok: false; chyba: string; status: number };

export function normalizujEmail(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase();
  if (!s || s.length > EMAIL_MAX || !EMAIL_RE.test(s)) return null;
  return s;
}

/** Zdroj = odkiaľ formulár prišiel („domov“, „texty“, „hry/skrtaci-test“); len bezpečné znaky, max 40. */
export function normalizujZdroj(v: unknown): string {
  if (typeof v !== 'string') return 'web';
  const s = v.trim().toLowerCase().replace(/[^a-z0-9/_#.-]/g, '').slice(0, ZDROJ_MAX);
  return s || 'web';
}

export function parsujVstup(body: unknown): Parsovanie {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, chyba: 'Pošli JSON objekt s poľom „email“.', status: 400 };
  }
  const o = body as Record<string, unknown>;
  const bot = typeof o.web === 'string' && o.web.trim().length > 0;
  const email = normalizujEmail(o.email);
  if (!email) return { ok: false, chyba: 'Toto nevyzerá ako e-mailová adresa. Skús to znova.', status: 400 };
  return { ok: true, vstup: { email, zdroj: normalizujZdroj(o.zdroj) }, bot };
}

/** Telo pre n8n / ľubovoľný webhook. */
export function webhookPayload(vstup: OdberVstup, cas: string) {
  return { typ: 'odber', web: 'xvadur.com', email: vstup.email, zdroj: vstup.zdroj, cas };
}

export type ResendEnv = { RESEND_API_KEY: string; RESEND_AUDIENCE_ID?: string };

/** Požiadavka na Resend: s audience → POST /audiences/{id}/contacts, bez → POST /contacts. */
export function resendRequest(vstup: OdberVstup, env: ResendEnv): { url: string; init: RequestInit } {
  const audience = env.RESEND_AUDIENCE_ID?.trim();
  const url = audience
    ? `https://api.resend.com/audiences/${encodeURIComponent(audience)}/contacts`
    : 'https://api.resend.com/contacts';
  return {
    url,
    init: {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ email: vstup.email, unsubscribed: false }),
    },
  };
}

/** Stav konfigurácie podľa env: čo API použije. */
export type Kanal = 'webhook' | 'resend' | 'nic';
export function kanal(env: Record<string, unknown>): Kanal {
  if (typeof env.ODBER_WEBHOOK_URL === 'string' && /^https:\/\//.test(env.ODBER_WEBHOOK_URL)) return 'webhook';
  if (typeof env.RESEND_API_KEY === 'string' && env.RESEND_API_KEY.trim()) return 'resend';
  return 'nic';
}

/** Fallback pre návštevníka, keď kanál nie je nastavený: mailto s predvyplneným predmetom. */
export function mailtoFallback(email: string, adresa = 'adam@xvadur.com'): string {
  const subject = encodeURIComponent('Odber — Vydanie');
  const body = encodeURIComponent(`Ahoj Adam, chcem odoberať Vydanie. Môj e-mail: ${email}`);
  return `mailto:${adresa}?subject=${subject}&body=${body}`;
}
