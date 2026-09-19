/** Pomôcky pre /texty/: čas čítania z počtu slov, slovenský dátum. */

/** Odvodený údaj, nie fakt z packov: bežný orientačný odhad 200 slov/min. Spec 05 čas čítania nepýta;
 *  je to pomôcka pre čitateľa na karte a v hlavičke textu („5 min čítania“). Nepatrí do fakty.ts. */
const SLOV_ZA_MINUTU = 200;

/** Počet slov v markdown tele (bez frontmatteru; markdown značky sa nepočítajú zvlášť). */
export function pocetSlov(body: string): number {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`[\]()]/g, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Minúty čítania, minimálne 1. */
export function minutyCitania(body: string): number {
  return Math.max(1, Math.round(pocetSlov(body) / SLOV_ZA_MINUTU));
}

export function citanieLabel(body: string): string {
  return `${minutyCitania(body)} min čítania`;
}

/** 11. 9. 2026 */
export function datumSk(date: Date): string {
  return `${date.getUTCDate()}. ${date.getUTCMonth() + 1}. ${date.getUTCFullYear()}`;
}

export function datumIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const SUBSTACK_URL = 'https://substack.com/@xvadur';
export const VYDANIE_LABEL = 'Vydanie — týždenný text o AI po slovensky';

/** „Krátka vložka do článku“ — verbatim z packu 05 (05_OBSAH_A_DISTRIBUCIA.md). */
export const VLOZKA =
  'Ak podobnú úlohu riešiš vo vlastnej práci, môžeme sa pozrieť na jeden príklad na bezplatnej konzultácii.';
