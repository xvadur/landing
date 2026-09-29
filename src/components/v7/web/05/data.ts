/** V7-05 · Komiks — dáta strán a panelov. Texty doslovne zo src/data/{cesta,beaty,fakty,ponuka}.ts,
 *  src/components/hero/hero-data.ts a v54/Anamneza (ANAMNEZA). Poradie Bio podľa BUILD_ZADANIE (elektrotechnická →
 *  viera → nemocnica → psychológia → odchod → AI → agenti → XVADUR). Beat 1 z beaty.ts sa nepoužíva.
 *  Kde text na webe nie je, `doplni: true` → štítok „text doplní Adam“. Čísla iba z fakty.ts a /pulse.json. */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import {
  DOKAZY,
  KORPUS,
  KOTVY,
  POSTAVIL,
  PRIPAD_MAKLER,
  PRIPAD_TERAPEUTKA,
  type Dokaz,
} from '@/data/fakty';

const krok = (nazov: string): Krok => {
  const k = CESTA.find((c) => c.nazov === nazov);
  if (!k) throw new Error(`cesta.ts: chýba krok ${nazov}`);
  return k;
};

/* ---------------- Strana 2 · Pôvod hrdinu (bio) ---------------- */

export type Onomatopoja = { text: string; tvar: 'burst' | 'explozia' | 'splat'; farba: 'yellow' | 'white' | 'stamp' };

export type Panel = {
  id: string;
  kedy: string;
  nazov: string;
  kde?: string;
  text?: string;
  citat?: string;
  doplni?: boolean;
  /** rozloženie v mriežke 4 stĺpcov (lg) */
  span: string;
  plocha: 'bg-white' | 'bg-paper' | 'bg-yellow' | 'bg-ink';
  zvuk?: Onomatopoja;
  /** kresba v paneli (zástupná, bez obrázka) */
  kresba: 'skola' | 'viera' | 'ekg' | 'mysel' | 'dvere' | 'klik' | 'agenti' | 'x';
};

const nemocnica = krok('Nemocnica');
const vyhodili = krok('Vyhodili ma');
const ai = krok('AI');
const agenti = krok('Agenti');
const xvadur = krok('XVADUR');
const psychologia = BEATY.find((x) => x.titulok === 'Psychológia cez Junga');

export const POVOD: Panel[] = [
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'stredná škola, Bratislava', doplni: true, span: 'lg:col-span-1', plocha: 'bg-white', kresba: 'skola' },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true, span: 'lg:col-span-1', plocha: 'bg-paper', kresba: 'viera' },
  {
    id: 'nemocnica',
    kedy: nemocnica.kedy,
    nazov: nemocnica.nazov,
    kde: 'urgentný príjem',
    text: nemocnica.text,
    span: 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
    plocha: 'bg-white',
    zvuk: { text: 'BEEP!', tvar: 'burst', farba: 'yellow' },
    kresba: 'ekg',
  },
  {
    id: 'psychologia',
    kedy: 'Jung',
    nazov: 'Psychológia',
    text: psychologia?.text,
    doplni: !psychologia,
    span: 'sm:col-span-2 lg:col-span-2',
    plocha: 'bg-paper',
    kresba: 'mysel',
  },
  {
    id: 'odchod',
    kedy: vyhodili.kedy,
    nazov: vyhodili.nazov,
    text: vyhodili.text,
    citat: vyhodili.citat,
    span: 'sm:col-span-2 lg:col-span-2',
    plocha: 'bg-white',
    zvuk: { text: 'BUM!', tvar: 'splat', farba: 'stamp' },
    kresba: 'dvere',
  },
  { id: 'ai', kedy: ai.kedy, nazov: ai.nazov, text: ai.text, span: 'lg:col-span-1', plocha: 'bg-yellow', zvuk: { text: 'KLIK!', tvar: 'burst', farba: 'white' }, kresba: 'klik' },
  { id: 'agenti', kedy: agenti.kedy, nazov: agenti.nazov, text: agenti.text, span: 'lg:col-span-1', plocha: 'bg-white', kresba: 'agenti' },
  {
    id: 'xvadur',
    kedy: xvadur.kedy,
    nazov: xvadur.nazov,
    text: xvadur.text,
    span: 'sm:col-span-2 lg:col-span-2',
    plocha: 'bg-ink',
    zvuk: { text: 'ZAP!', tvar: 'explozia', farba: 'yellow' },
    kresba: 'x',
  },
];

/** Doslovné vety z v54/Anamneza.astro. */
export const ANAMNEZA = {
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  cta: 'Ďalší pacient: ty →',
  peciatka: '8 rokov pri lôžku',
};

/* ---------------- Strana 3 · Epizódy (chorobopisy) ---------------- */

export type Graf = 'kontroly' | 'trh' | 'korpus' | 'hriech';
export type Epizoda = Dokaz & {
  fakty: { label: string; value: string; note: string }[];
  mal?: readonly string[];
  dostal?: readonly string[];
  stavText?: string;
  graf?: Graf;
};

export const STAV_TEXT: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };

/** Poradie: Jakub, Lucia, Hriech, Korpus, potom ďalšie záznamy. Bez „čoskoro“ domén a bez zdravotných dát (ako Chorobopisy V5.4). */
const PORADIE = ['system-pre-maklera', 'terapeutka', 'hriech', 'korpus', 'netopier', 'trhovy-dataset', 'agentovy-system', 'xvadur-com'];

export const EPIZODY: Epizoda[] = PORADIE.map((id) => {
  const d = DOKAZY.find((x) => x.id === id);
  if (!d) throw new Error(`fakty.ts: chýba dôkaz ${id}`);
  const p = POSTAVIL.find((x) => x.id === id);
  const e: Epizoda = { ...d, fakty: p?.fakty.map(({ label, value, note }) => ({ label, value, note })) ?? [] };
  if (id === 'system-pre-maklera') {
    e.mal = PRIPAD_MAKLER.mal;
    e.dostal = PRIPAD_MAKLER.dostal;
    e.stavText = PRIPAD_MAKLER.stav;
    e.graf = 'kontroly';
  }
  if (id === 'terapeutka') {
    e.mal = PRIPAD_TERAPEUTKA.mal;
    e.dostal = PRIPAD_TERAPEUTKA.dostal;
    e.stavText = PRIPAD_TERAPEUTKA.stav;
  }
  if (id === 'hriech') {
    e.fakty = [
      { label: 'Stránky', value: '59', note: 'mediálnej kritiky' },
      { label: 'Redakcie v mape', value: '10', note: 'mapa médií' },
      { label: 'Ľudia v mape', value: '558', note: 'redaktori a autori' },
    ];
  }
  if (id === 'korpus') {
    e.fakty = [
      { label: 'Vlastné slová', value: KORPUS.slova, note: `od ${KORPUS.od}` },
      { label: 'Prompty', value: KORPUS.prompty, note: `k ${KORPUS.kDatumu}` },
    ];
    e.graf = 'korpus';
  }
  if (id === 'trhovy-dataset') e.graf = 'trh';
  return e;
});

/** Trhové kotvy pre graf epizódy „Trhový dataset“ (fakty.ts KOTVY, pack13). */
export const TRH = {
  weby: { s: 441, spolu: 459 },
  kontakt: KOTVY.prvyKrokKontakt,
  rezervacia: KOTVY.prvyKrokRezervacia,
  pod: KOTVY.makleriPodLogom,
};

/* ---------------- Strana 4 · Hry ---------------- */

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

/* ---------------- navigácia (strany zošita) ---------------- */

export const STRANY = [
  { id: 'prijem', cislo: '1', label: 'Príjem' },
  { id: 'povod', cislo: '2', label: 'Pôvod' },
  { id: 'epizody', cislo: '3', label: 'Epizódy' },
  { id: 'hry', cislo: '4', label: 'Hry' },
  { id: 'liecba', cislo: '5', label: 'Liečba' },
  { id: 'texty', cislo: '6', label: 'Texty' },
  { id: 'vysetrenie', cislo: '7', label: 'Vyšetrenie' },
] as const;

/** Udalosti medzi ostrovmi (paleta → epizódy / hry). Keď ostrov ešte nie je hydratovaný, cieľ čaká vo window. */
export type Ciel = { typ: 'projekt' | 'hra'; id: string };
export const UDALOST = 'k05:otvor';

export function otvor(ciel: Ciel) {
  (window as unknown as { __k05ciel?: Ciel }).__k05ciel = ciel;
  window.dispatchEvent(new CustomEvent<Ciel>(UDALOST, { detail: ciel }));
}

export function vezmiCiel(typ: Ciel['typ']): Ciel | null {
  const w = window as unknown as { __k05ciel?: Ciel };
  const c = w.__k05ciel;
  if (c && c.typ === typ) {
    w.__k05ciel = undefined;
    return c;
  }
  return null;
}

export function posunNa(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } | null }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ block: 'start' });
}

export const TOASTER = 'k05';
