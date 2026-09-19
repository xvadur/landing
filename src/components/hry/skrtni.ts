/** Škrtací test — čistá funkcia skrtni(text) bez DOM. Relatívne importy s príponou .ts, aby ju čítal aj `node --test`
 *  (tests/skrtni.test.mjs) rovnako ako ostrov SkrtaciTest.tsx. */
import { frazyRegex, pridavneRegex, rodinaPreVzor, PRAZDNE_PRIDAVNE_VYNIMKY } from '../../data/frazy.ts';

/* ---------- ukážka: poskladaná len z fráz a prídavných mien zo src/data/frazy.ts (pack 13 §1), bez mien a čísel ---------- */
export const UKAZKA = [
  'Sme realitná kancelária s dlhoročnými skúsenosťami a profesionálnym prístupom.',
  'Ponúkame komplexné služby pod jednou strechou a individuálny prístup ku každému klientovi.',
  'Vašu nehnuteľnosť predáme rýchlo, bez starostí a za čo najlepšiu možnú cenu.',
  'Perfektná znalosť prostredia, kompletný realitný servis na kľúč a osobný prístup sú pre nás samozrejmosťou.',
  'Kontaktujte nás.',
].join(' ');

/** Slová, ktoré kmeňový regex prídavných mien zachytí, ale nie sú prídavné meno: vzorová veta z Dňa 2 packu
 *  („Predaj držím osobne. Za mnou pracuje celý aparát.“) musí prejsť s 0 škrtmi. Zoznam žije v src/data/frazy.ts. */
export const VYNIMKY = new Set(PRAZDNE_PRIDAVNE_VYNIMKY);

export type Segment = { text: string; typ: 'text' | 'fraza' | 'pridavne'; rodina?: string };

export type Skrt = {
  segmenty: Segment[];
  skrtov: number;
  skrtnuteSlova: number;
  zostaloSlov: number;
  povodneSlova: number;
  zostalo: string;
  skrtnute: string[];
};

export function pocetSlov(s: string): number {
  const m = s.match(/\p{L}[\p{L}\p{N}'’-]*/gu);
  return m ? m.length : 0;
}

/** Čistá funkcia: text → segmenty + čísla. Frázy majú prednosť pred prídavnými menami (žiadne prekrytie). */
export function skrtni(text: string): Skrt {
  type R = { start: number; end: number; typ: 'fraza' | 'pridavne'; rodina?: string };
  const ranges: R[] = [];
  for (const m of text.matchAll(frazyRegex())) {
    const start = m.index ?? 0;
    ranges.push({ start, end: start + m[0].length, typ: 'fraza', rodina: rodinaPreVzor(m[0])?.rodina });
  }
  for (const m of text.matchAll(pridavneRegex())) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (VYNIMKY.has(m[0].toLowerCase())) continue;
    if (ranges.some((r) => start < r.end && end > r.start)) continue;
    ranges.push({ start, end, typ: 'pridavne' });
  }
  ranges.sort((a, b) => a.start - b.start);

  const segmenty: Segment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) segmenty.push({ text: text.slice(cursor, r.start), typ: 'text' });
    segmenty.push({ text: text.slice(r.start, r.end), typ: r.typ, rodina: r.rodina });
    cursor = r.end;
  }
  if (cursor < text.length) segmenty.push({ text: text.slice(cursor), typ: 'text' });

  const skrtnute = ranges.map((r) => text.slice(r.start, r.end));
  const zostalo = segmenty
    .filter((s) => s.typ === 'text')
    .map((s) => s.text)
    .join(' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();

  return {
    segmenty,
    skrtov: ranges.length,
    skrtnuteSlova: skrtnute.reduce((a, s) => a + pocetSlov(s), 0),
    zostaloSlov: pocetSlov(zostalo),
    povodneSlova: pocetSlov(text),
    zostalo,
    skrtnute,
  };
}
