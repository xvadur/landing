/** Lístok návštevníka (koncept 13_ §2.4 „Lístok na stole", §3.2 Stolička): návštevník je udalosť sveta, nie cieľ
 *  lievika. Riadky žijú len v jeho prehliadači (localStorage), nástroje mu dopíšu výsledok a stolička ich odnesie
 *  do predvyplneného intake (/konzultacia/?z=listok&r=<base64url JSON>). Nič sa neodosiela bez kliku.
 *  Formát riadku: ČAS · TYP · OBSAH (· hodnota) — jazyk troch kruhov, nie Observera.
 *  Každý zápis vyšle `window` udalosť `listok:zmena` (detail = riadky), aby sa lístok na stole prekreslil. */

export type ListokRiadok = {
  /** poradové číslo od 1 */
  n: number;
  /** ISO čas (klient) */
  cas: string;
  /** typ udalosti: 'vstup' | 'nastroj' | 'sekcia' | 'stolicka' | vlastný */
  typ: string;
  /** krátky obsah, max 120 znakov („ŠKRTNUTÉ · 7 fráz") */
  obsah: string;
  /** voliteľná hodnota (číslo alebo text, max 60 znakov) */
  hodnota?: string | number;
};

export const LISTOK_KEY = 'xvadur.listok.v1';
export const LISTOK_MAX = 40;
export const LISTOK_UDALOST = 'listok:zmena';
export const VSTUP_OBSAH = 'vstup cez oponu';

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

function clean(s: unknown, max: number): string {
  return String(s ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

function validny(r: unknown): r is ListokRiadok {
  if (!r || typeof r !== 'object') return false;
  const o = r as Record<string, unknown>;
  return typeof o.n === 'number' && typeof o.cas === 'string' && typeof o.typ === 'string' && typeof o.obsah === 'string';
}

/** Očistí pole neznámeho pôvodu (localStorage alebo URL) na platné riadky, max LISTOK_MAX. */
export function normalizuj(vstup: unknown): ListokRiadok[] {
  if (!Array.isArray(vstup)) return [];
  const out: ListokRiadok[] = [];
  for (const r of vstup) {
    if (!validny(r)) continue;
    const riadok: ListokRiadok = {
      n: Math.max(1, Math.floor(r.n)),
      cas: clean(r.cas, 40),
      typ: clean(r.typ, 24) || 'riadok',
      obsah: clean(r.obsah, 120),
    };
    if (r.hodnota !== undefined && r.hodnota !== null && r.hodnota !== '') {
      riadok.hodnota = typeof r.hodnota === 'number' ? r.hodnota : clean(r.hodnota, 60);
    }
    out.push(riadok);
    if (out.length >= LISTOK_MAX) break;
  }
  return out;
}

/** Riadky lístka (prázdne pole, keď úložisko nie je alebo je prázdne). */
export function riadky(): ListokRiadok[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(LISTOK_KEY);
    return raw ? normalizuj(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function uloz(rows: ListokRiadok[]): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(LISTOK_KEY, JSON.stringify(rows));
  } catch {
    /* súkromné okno / plné úložisko: lístok sa neuloží, stránka beží ďalej */
    return false;
  }
  try {
    window.dispatchEvent(new CustomEvent(LISTOK_UDALOST, { detail: rows }));
  } catch {
    /* ignoruj */
  }
  return true;
}

/** Dopíše riadok (číslo a čas doplní sám). Vráti riadok alebo null, keď úložisko nie je. */
export function pridajRiadok(vstup: { typ: string; obsah: string; hodnota?: string | number }): ListokRiadok | null {
  const rows = riadky();
  const riadok: ListokRiadok = {
    n: rows.length ? rows[rows.length - 1]!.n + 1 : 1,
    cas: new Date().toISOString(),
    typ: clean(vstup.typ, 24) || 'riadok',
    obsah: clean(vstup.obsah, 120),
  };
  if (vstup.hodnota !== undefined && vstup.hodnota !== '') {
    riadok.hodnota = typeof vstup.hodnota === 'number' ? vstup.hodnota : clean(vstup.hodnota, 60);
  }
  rows.push(riadok);
  while (rows.length > LISTOK_MAX) rows.shift();
  return uloz(rows) ? riadok : null;
}

/** Prvý riadok pri vstupe („vstup cez oponu" s časom klienta) — idempotentné: pridá len ak lístok nemá žiadny riadok. */
export function zabezpecVstup(): ListokRiadok | null {
  const rows = riadky();
  if (rows.length) return rows[0]!;
  return pridajRiadok({ typ: 'vstup', obsah: VSTUP_OBSAH });
}

/** Vymaže lístok. */
export function vymaz(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(LISTOK_KEY);
  } catch {
    /* ignoruj */
  }
  try {
    window.dispatchEvent(new CustomEvent(LISTOK_UDALOST, { detail: [] }));
  } catch {
    /* ignoruj */
  }
}

/* ---------- base64url (UTF-8), bez paddingu; funguje v prehliadači aj v Node (testy) ---------- */
function utf8ToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}
function bytesToUtf8(b: Uint8Array): string {
  return new TextDecoder().decode(b);
}
export function base64urlEncode(s: string): string {
  const bytes = utf8ToBytes(s);
  let bin = '';
  for (const x of bytes) bin += String.fromCharCode(x);
  const b64 = typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function base64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytesToUtf8(bytes);
}

/** Riadky → parameter `r` (base64url JSON). */
export function zakodujRiadky(rows: ListokRiadok[]): string {
  return base64urlEncode(JSON.stringify(normalizuj(rows)));
}

/** Parameter `r` → riadky; neplatný vstup = prázdne pole (nikdy nehodí). */
export function dekodujRiadky(r: string | null | undefined): ListokRiadok[] {
  if (!r) return [];
  try {
    return normalizuj(JSON.parse(base64urlDecode(r)));
  } catch {
    return [];
  }
}

/** Query string pre /konzultacia/ (kontrakt payload.ts): `z=listok&r=<base64url JSON riadkov>`; bez riadkov ''.
 *  Použitie: `location.href = '/konzultacia/' + (q ? '?' + q : '')`. */
export function kInboxQuery(rows: ListokRiadok[] = riadky()): string {
  if (!rows.length) return '';
  return `z=listok&r=${zakodujRiadky(rows)}`;
}

/** Celá cesta na stoličku → intake. */
export function kInboxUrl(rows: ListokRiadok[] = riadky()): string {
  const q = kInboxQuery(rows);
  return q ? `/konzultacia/?${q}` : '/konzultacia/';
}

const NBSP = ' ';

/** ISO čas → „20. 9. · 03:41" (lokálny čas prehliadača; neplatný vstup = pôvodný text). */
export function formatCas(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()}.${NBSP}${d.getMonth() + 1}. · ${hh}:${mm}`;
}

/** Jeden riadok lístka ako text: „riadok 1 · 20. 9. · 03:41 · vstup · vstup cez oponu". */
export function riadokText(r: ListokRiadok): string {
  const h = r.hodnota !== undefined ? ` (${r.hodnota})` : '';
  return `riadok ${r.n} · ${formatCas(r.cas)} · ${r.typ} · ${r.obsah}${h}`;
}
