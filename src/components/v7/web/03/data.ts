/** V7-03 · Rozložený nástroj — dáta variantu. Texty sa preberajú doslovne zo src/data/** a súčasných blokov
 *  (v54/Liecba.astro, v54/Chorobopisy.astro, v5/TextyHry.astro); recepty z katalógu (v7/kit/**) sú sem skopírované,
 *  nie importované. Čísla iba zo src/data/fakty.ts a /pulse.json. */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import { DOKAZY, KORPUS, KOTVY, POSTAVIL, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, type Dokaz } from '@/data/fakty';
import { PRODUKTY, VLAJKA } from '@/data/ponuka';

/* ---------------------------------------------------------------- súčiastky rozloženého nástroja */

export type CastId = 'hlavica' | 'hadicka' | 'olivky' | 'veko' | 'piny' | 'cip' | 'doska';

/** Jedna súčiastka = jedna služba alebo projekt. Súradnice sú v rovine objektu (400 × 400), posuny v px.
 *  `z0` = výška v zloženom stave, `dz`/`dx`/`dy` = posun pri úplnom rozložení, `ax`/`ay` = kotva značky. */
export type Cast = {
  id: CastId;
  cislo: number;
  /** názov súčiastky (čo to fyzicky je) */
  suciastka: string;
  /** čo súčiastka znamená na webe */
  druh: 'Liečba' | 'Chorobopis';
  nazov: string;
  /** krátky riadok pod názvom */
  riadok: string;
  /** hlavné číslo / nálepka */
  cislo2: string;
  cisloPopis: string;
  /** cieľ po kliknutí: záložka liečby alebo detail projektu (id z DOKAZY) */
  ciel: { typ: 'liecba'; tab: '01' | '02' | '03' } | { typ: 'projekt'; id: string };
  z0: number;
  dz: number;
  dx: number;
  dy: number;
  ax: number;
  ay: number;
  /** stĺpec štítku pri rozložení na desktope */
  strana: 'l' | 'p';
  /** výrez roviny pre plochú ikonu (viewBox) */
  vb: string;
};

const agent = PRODUKTY.find((p) => p.id === 'agent-pre-teba')!;
const dokaz = (id: string): Dokaz => {
  const d = DOKAZY.find((x) => x.id === id);
  if (!d) throw new Error(`fakty.ts: chýba dôkaz ${id}`);
  return d;
};
const jakub = dokaz('system-pre-maklera');
const lucia = dokaz('terapeutka');
const hriech = dokaz('hriech');
const korpus = dokaz('korpus');

export const CASTI: Cast[] = [
  {
    id: 'hlavica',
    cislo: 1,
    suciastka: 'Hlavica',
    druh: 'Liečba',
    nazov: '01 · Triáž',
    riadok: `${VLAJKA.nazov} · ${VLAJKA.trvanie} · ${VLAJKA.cena}`,
    cislo2: '30 min',
    cisloPopis: 'vyšetrenie',
    ciel: { typ: 'liecba', tab: '01' },
    z0: 46,
    dz: 150,
    dx: 96,
    dy: 96,
    ax: 322,
    ay: 322,
    strana: 'p',
    vb: '262 262 124 124',
  },
  {
    id: 'hadicka',
    cislo: 2,
    suciastka: 'Hadička',
    druh: 'Liečba',
    nazov: '02 · Zásah',
    riadok: `${agent.nazov} · ${agent.nalepka}`,
    cislo2: '90 dní',
    cisloPopis: 'ladenia agenta',
    ciel: { typ: 'liecba', tab: '02' },
    z0: 40,
    dz: 200,
    dx: 22,
    dy: 22,
    ax: 292,
    ay: 262,
    strana: 'l',
    vb: '40 40 320 320',
  },
  {
    id: 'olivky',
    cislo: 3,
    suciastka: 'Olivky',
    druh: 'Liečba',
    nazov: '03 · Odovzdanie',
    riadok: 'Naučím ťa robiť to, čo robím ja.',
    cislo2: '3',
    cisloPopis: 'spôsoby, ako sa to naučiť',
    ciel: { typ: 'liecba', tab: '03' },
    z0: 52,
    dz: 250,
    dx: -96,
    dy: -96,
    ax: 58,
    ay: 70,
    strana: 'l',
    vb: '22 22 120 120',
  },
  {
    id: 'veko',
    cislo: 4,
    suciastka: 'Veko čipu',
    druh: 'Chorobopis',
    nazov: jakub.nazov,
    riadok: jakub.riadok,
    cislo2: jakub.cislo,
    cisloPopis: jakub.cisloPopis,
    ciel: { typ: 'projekt', id: jakub.id },
    z0: 30,
    dz: 112,
    dx: 0,
    dy: 0,
    ax: 250,
    ay: 150,
    strana: 'p',
    vb: '128 128 144 144',
  },
  {
    id: 'cip',
    cislo: 5,
    suciastka: 'Jadro čipu',
    druh: 'Chorobopis',
    nazov: korpus.nazov,
    riadok: korpus.riadok,
    cislo2: korpus.cislo,
    cisloPopis: korpus.cisloPopis,
    ciel: { typ: 'projekt', id: korpus.id },
    z0: 18,
    dz: 36,
    dx: 0,
    dy: 0,
    ax: 236,
    ay: 236,
    strana: 'p',
    vb: '144 144 112 112',
  },
  {
    id: 'piny',
    cislo: 6,
    suciastka: 'Piny',
    druh: 'Chorobopis',
    nazov: lucia.nazov,
    riadok: lucia.riadok,
    cislo2: lucia.cislo,
    cisloPopis: lucia.cisloPopis,
    ciel: { typ: 'projekt', id: lucia.id },
    z0: 10,
    dz: -70,
    dx: 0,
    dy: 0,
    ax: 118,
    ay: 200,
    strana: 'l',
    vb: '108 108 184 184',
  },
  {
    id: 'doska',
    cislo: 7,
    suciastka: 'Doska',
    druh: 'Chorobopis',
    nazov: hriech.nazov,
    riadok: hriech.riadok,
    cislo2: hriech.cislo,
    cisloPopis: hriech.cisloPopis,
    ciel: { typ: 'projekt', id: hriech.id },
    z0: 0,
    dz: -165,
    dx: 0,
    dy: 0,
    ax: 60,
    ay: 330,
    strana: 'l',
    vb: '30 30 340 340',
  },
];

/* ---------------------------------------------------------------- bio (kópia receptu z v7/kit/rozlozenie/data.ts) */

export type Zastavka = {
  id: string;
  kedy: string;
  nazov: string;
  kde?: string;
  text?: string;
  citat?: string;
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

/** Poradie podľa zadania: elektrotechnická → viera → nemocnica → psychológia → odchod → AI → agenti → XVADUR.
 *  Bez beatu 1 (beaty.ts) a bez viet o škole: pri elektrotechnickej iba miesto a štítok „text doplní Adam“. */
export const BIO: Zastavka[] = [
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'Bratislava', doplni: true },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text },
  { id: 'psychologia', kedy: 'Jung', nazov: 'Psychológia', text: BEATY.find((x) => x.titulok === 'Psychológia cez Junga')?.text },
  { id: 'odchod', kedy: vyhodili.kedy, nazov: vyhodili.nazov, text: vyhodili.text, citat: vyhodili.citat },
  { id: 'ai', kedy: ai.kedy, nazov: ai.nazov, text: ai.text },
  { id: 'agenti', kedy: agenti.kedy, nazov: agenti.nazov, text: agenti.text },
  { id: 'xvadur', kedy: xvadur.kedy, nazov: xvadur.nazov, text: xvadur.text },
];

/** Doslovné vety z v54/Anamneza.astro. */
export const ANAMNEZA = {
  eyebrow: '✚ Anamnéza',
  nadpis: 'Z nemocnice k agentom',
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  peciatka: '8 rokov pri lôžku',
};

/* ---------------------------------------------------------------- hry (kópia z v7/kit/prekrytia/spolocne.tsx) */

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

/* ---------------------------------------------------------------- projekty pre detail (sheet) */

export type ProjektDetail = Dokaz & {
  fakty: { label: string; value: string; note: string }[];
  mal?: readonly string[];
  dostal?: readonly string[];
  stavText?: string;
};

export const STAV_TEXT: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };

export const PROJEKTY: ProjektDetail[] = [
  'system-pre-maklera',
  'terapeutka',
  'hriech',
  'korpus',
  'netopier',
  'trhovy-dataset',
  'agentovy-system',
].map((id) => {
  const d = dokaz(id);
  const p = POSTAVIL.find((x) => x.id === id);
  let fakty: { label: string; value: string; note: string }[] = p?.fakty.map(({ label, value, note }) => ({ label, value, note })) ?? [];
  if (id === 'korpus')
    fakty = [
      { label: 'Vlastné slová', value: KORPUS.slova, note: `od ${KORPUS.od}` },
      { label: 'Prompty', value: KORPUS.prompty, note: `k ${KORPUS.kDatumu}` },
    ];
  if (id === 'system-pre-maklera') return { ...d, fakty, mal: PRIPAD_MAKLER.mal, dostal: PRIPAD_MAKLER.dostal, stavText: PRIPAD_MAKLER.stav };
  if (id === 'terapeutka') return { ...d, fakty, mal: PRIPAD_TERAPEUTKA.mal, dostal: PRIPAD_TERAPEUTKA.dostal, stavText: PRIPAD_TERAPEUTKA.stav };
  return { ...d, fakty };
});

export const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* ---------------------------------------------------------------- udalosti medzi ostrovmi */

/** Ostrovy sa volajú cez udalosti na window (paleta, scéna, karty → prekrytia v Nav03). */
export type Udalost =
  | { typ: 'projekt'; id: string }
  | { typ: 'hra' }
  | { typ: 'text' }
  | { typ: 'paleta' }
  | { typ: 'liecba'; tab: '01' | '02' | '03' };

export const UDALOST = 'v703:otvor';

export function otvor(u: Udalost) {
  window.dispatchEvent(new CustomEvent<Udalost>(UDALOST, { detail: u }));
}

/** Plynulý skok na kotvu (Lenis, ak beží; inak natívne). */
export function skoc(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: { offset?: number }) => void } }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

export const SEKCIE = [
  { id: 'nastroj', label: 'Nástroj' },
  { id: 'liecba', label: 'Liečba' },
  { id: 'chorobopisy', label: 'Chorobopisy' },
  { id: 'anamneza', label: 'Anamnéza' },
  { id: 'hry', label: 'Hry' },
  { id: 'texty', label: 'Texty' },
];
