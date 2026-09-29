/** V7-02 · Scroll-film — dáta variantu (29. 9. 2026). Iba prevzaté texty a čísla:
 *  bio = src/data/cesta.ts + beaty.ts (rovnaké odvodenie ako kit rozlozenie/data.ts BIO, skopírované, nie importované),
 *  chorobopisy = src/data/fakty.ts (DOKAZY, PRIPAD_*, KORPUS, KOTVY), liečba = src/data/ponuka.ts, tézy = v54/Tezy.astro,
 *  nástroje = v54/Nastroje.astro, hry = v5/TextyHry.astro + src/pages/hry/. Nič vymyslené. */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import { DOKAZY, KORPUS, KOTVY, POSTAVIL, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, type Dokaz } from '@/data/fakty';

/* ------------------------------------------------------------------ bio (anamnéza) */

export type Zastavka = {
  id: string;
  kedy: string;
  nazov: string;
  kde?: string;
  text?: string;
  citat?: string;
  /** text na webe zatiaľ nie je → štítok „text doplní Adam“ */
  doplni?: boolean;
};

const krok = (nazov: string): Krok => {
  const k = CESTA.find((c) => c.nazov === nazov);
  if (!k) throw new Error(`cesta.ts: chýba krok ${nazov}`);
  return k;
};
const nemocnica = krok('Nemocnica');
const vyhodili = krok('Vyhodili ma');
const ai = krok('AI');
const agenti = krok('Agenti');
const xvadur = krok('XVADUR');
const psychologia = BEATY.find((b) => b.titulok === 'Psychológia cez Junga');

/** Poradie podľa zadania: elektrotechnická → viera → nemocnica → psychológia → odchod → AI → agenti → XVADUR.
 *  Beat 1 (maturita) sa nepoužíva. Bez textu na webe = doplni. */
export const BIO: Zastavka[] = [
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'stredná škola, Bratislava', doplni: true },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text },
  psychologia
    ? { id: 'psychologia', kedy: 'Jung', nazov: 'Psychológia', text: psychologia.text }
    : { id: 'psychologia', kedy: '—', nazov: 'Psychológia', doplni: true },
  { id: 'odchod', kedy: vyhodili.kedy, nazov: vyhodili.nazov, text: vyhodili.text, citat: vyhodili.citat },
  { id: 'ai', kedy: ai.kedy, nazov: ai.nazov, text: ai.text },
  { id: 'agenti', kedy: agenti.kedy, nazov: agenti.nazov, text: agenti.text },
  { id: 'xvadur', kedy: xvadur.kedy, nazov: xvadur.nazov, text: xvadur.text },
];

/** Doslovné vety z v54/Anamneza.astro. */
export const ANAMNEZA = {
  nadpis: 'Z nemocnice k agentom',
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  peciatka: '8 rokov pri lôžku',
};

/* ------------------------------------------------------------------ chorobopisy */

export type Chorobopis = Dokaz & {
  fakty: { label: string; value: string; note: string }[];
  mal?: readonly string[];
  dostal?: readonly string[];
  stavText?: string;
};

const STAV_POPIS: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };
export const stavPopis = (s: Dokaz['stav']) => STAV_POPIS[s];

/** Jakub, Lucia, Hriech, Korpus + ďalšie z DOKAZY (bez „čoskoro“ domén a bez zdravotných dát). */
const PORADIE = ['system-pre-maklera', 'terapeutka', 'hriech', 'korpus', 'netopier', 'agentovy-system', 'trhovy-dataset'];

export const CHOROBOPISY: Chorobopis[] = PORADIE.map((id) => {
  const d = DOKAZY.find((x) => x.id === id);
  if (!d) throw new Error(`fakty.ts: chýba dôkaz ${id}`);
  const p = POSTAVIL.find((x) => x.id === id);
  let fakty = p?.fakty.map(({ label, value, note }) => ({ label, value, note })) ?? [];
  let extra: Partial<Chorobopis> = {};
  if (id === 'korpus')
    fakty = [
      { label: 'Vlastné slová', value: KORPUS.slova, note: `od ${KORPUS.od}` },
      { label: 'Prompty', value: KORPUS.prompty, note: `k ${KORPUS.kDatumu}` },
    ];
  if (id === 'system-pre-maklera') extra = { mal: PRIPAD_MAKLER.mal, dostal: PRIPAD_MAKLER.dostal, stavText: PRIPAD_MAKLER.stav };
  if (id === 'terapeutka') extra = { mal: PRIPAD_TERAPEUTKA.mal, dostal: PRIPAD_TERAPEUTKA.dostal, stavText: PRIPAD_TERAPEUTKA.stav };
  return { ...d, fakty, ...extra };
});

/** Trhová kotva k Jakubovi (pack13): koľko webov ponúka rezerváciu termínu ako prvý krok. */
export const KOTVA_REZERVACIA = KOTVY.prvyKrokRezervacia;

/* ------------------------------------------------------------------ tézy (v54/Tezy.astro, doslovne) */

export const TEZY: { veta: string; kedy: string }[] = [
  { veta: 'Výborný opatrovateľ nie je výborný zamestnanec.', kedy: 'o nemocnici' },
  { veta: 'Zdravotnícky systém sa strašne spolieha na iniciatívu zamestnancov a je to neudržateľné.', kedy: '8. 9. 2025' },
  { veta: 'AI nemá robiť veci za človeka, AI má prinášať veci, ktoré by inak nemohli byť reálne.', kedy: 'o AI' },
  { veta: 'AI je sandbox, ako Minecraft. Tá istá hra je v rukách dvoch ľudí absolútne odlišná.', kedy: '3. 8. 2025' },
  { veta: 'Svet sa tak zmenil, že už to, že sa zmenil, nie je vidno.', kedy: 'o dnešku' },
  { veta: 'Keď som mohol po slovensky rozprávať k počítaču, radikálne sa mi zmenil život. Mohol som začať tvoriť digitálne.', kedy: '22. 3. 2026' },
  { veta: 'Ja som neni chlapec, ktorý sa hrá s AI. Ja som podnikateľ, ktorý reálne robí veci s AI.', kedy: '1. 7. 2026' },
  { veta: 'Ľudia sa boja, že AI ovládne svet. Ja sa bojím, že AI bude za paywallom.', kedy: 'o AI' },
];

/* ------------------------------------------------------------------ nástroje (v54/Nastroje.astro, doslovne) */

export const NASTROJE: { nazov: string; na: string }[] = [
  { nazov: 'Claude Code', na: 'hlavný operačný stôl: agenti, kód, dáta' },
  { nazov: 'Codex', na: 'druhý chirurg: dlhé stavby cez noc' },
  { nazov: 'Cloudflare', na: 'weby, Workers, domény, tunely' },
  { nazov: 'Supabase', na: 'CRM a databázy pre klientov' },
  { nazov: 'Linear', na: 'každá úloha od príjmu po odovzdanie' },
  { nazov: 'Telegram', na: 'agent vo vrecku klienta' },
  { nazov: 'Astro', na: 'rýchle weby, aj tento' },
  { nazov: 'Resend', na: 'potvrdenia a follow-upy e-mailom' },
  { nazov: 'Python', na: 'crawlery, korpusy, analýzy' },
  { nazov: 'Remotion', na: 'video z kódu' },
  { nazov: 'Notion', na: 'archív a databázy' },
  { nazov: 'GitHub', na: 'záznam každej zmeny' },
];
export const NASTROJE_VETA =
  'Nie som programátor. Po slovensky rozprávam k počítaču a tieto nástroje robia, čo poviem. Každý deň od januára 2025.';

/* ------------------------------------------------------------------ hry (TextyHry.astro, src/pages/hry/) */

export type Hra = { id: string; cislo: string; nazov: string; text: string | null; href: string | null };
export const HRY: Hra[] = [
  {
    id: 'skrtaci-test',
    cislo: '01',
    nazov: 'Škrtací test',
    text: `Vlož svoj text. Škrtneme frázy, ktoré má každý. ${KOTVY.kancelarieSFrazou.value} zo ${KOTVY.kancelarieSFrazou.z} kancelárií má v texte aspoň jednu zo šiestich fráz.`,
    href: '/hry/skrtaci-test/',
  },
  { id: 'miliarda-bilion', cislo: '02', nazov: 'Miliarda → bilión', text: null, href: null },
  { id: 'strach-o-meter', cislo: '03', nazov: 'Strach-o-meter', text: null, href: null },
];

/* ------------------------------------------------------------------ film: časová os (jednotky = vh scrollu) */

/** Kapitoly filmu. Jednotky sú výška scrollu vo vh; súčet = dĺžka filmu. */
export const OS = {
  uvod: 40,
  a: BIO.length * 40,
  strih1: 70,
  b: 3 * 60,
  strih2: 70,
  c: CHOROBOPISY.length * 40,
  koniec: 70,
};
export const OS_SPOLU = Object.values(OS).reduce((s, v) => s + v, 0);
/** začiatky úsekov */
export const ZAC = (() => {
  let u = 0;
  const z: Record<keyof typeof OS, number> = { uvod: 0, a: 0, strih1: 0, b: 0, strih2: 0, c: 0, koniec: 0 };
  for (const k of Object.keys(OS) as (keyof typeof OS)[]) {
    z[k] = u;
    u += OS[k];
  }
  return z;
})();

export const ZABERY = [
  { id: 'F1', nazov: 'Chodba', kapitola: 'Anamnéza' },
  { id: 'F2', nazov: 'Dvere', kapitola: 'Liečba' },
  { id: 'F3', nazov: 'Dielňa', kapitola: 'Chorobopisy' },
] as const;

/** 24 snímok za sekundu, 5 s na záber = 120 snímok na záber. */
export const FPS = 24;
export const SNIMKY_NA_ZABER = 120;

export const tc = (snimka: number) => {
  const s = Math.floor(snimka / FPS);
  const f = snimka % FPS;
  const p = (n: number) => String(n).padStart(2, '0');
  return `00:00:${p(s)}:${p(f)}`;
};

/* ------------------------------------------------------------------ pomôcky */

export const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');

/** Deterministická zástupná rada (rovnaká na serveri aj v prehliadači). */
export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
