/** V7-10 Inštrumentár — dáta webu. Prevzaté (kópia, nie import) z receptov katalógu src/components/v7/kit/**
 *  a doslovne zo src/data/*, src/components/v54/*, src/components/v5/*. Žiadne vymyslené čísla: čísla iba z fakty.ts
 *  a /pulse.json (ZIVE_CISLA = tá istá snímka ako SSR záloha). Beat 1 z beaty.ts sa nepoužíva. */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import { DOKAZY, KORPUS, KOTVY, POSTAVIL, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, type Dokaz } from '@/data/fakty';

/* ---------------- podnosy (sekcie) ---------------- */

export const PODNOSY = [
  { id: 'prijem', cislo: '01', nazov: 'Príjem' },
  { id: 'vitalne', cislo: '02', nazov: 'Vitálne funkcie' },
  { id: 'anamneza', cislo: '03', nazov: 'Anamnéza' },
  { id: 'nastroje', cislo: '04', nazov: 'Inštrumentár' },
  { id: 'pacienti', cislo: '05', nazov: 'Chorobopisy' },
  { id: 'hry', cislo: '06', nazov: 'Hry' },
  { id: 'liecba', cislo: '07', nazov: 'Liečba' },
  { id: 'vysetrenie', cislo: '08', nazov: 'Vyšetrenie' },
  { id: 'zapis', cislo: '09', nazov: 'Zápis a texty' },
] as const;

/** Roly z v54/Prijem.astro (doslovne). */
export const ROLY = [
  'zdravotník, ktorý stavia AI agentov',
  '8 rokov pri lôžku',
  'každý deň s AI od januára 2025',
  'autor Hriechu',
  'firma jedného človeka a jeho agentov',
];

/* ---------------- anamnéza (bio) ---------------- */

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

/** Poradie podľa Adamovho zadania: elektrotechnická → viera → nemocnica → psychológia → odchod → AI → agenti → XVADUR.
 *  Kde text na webe nie je, `doplni` = štítok „text doplní Adam“. Psychológia = beat 3 (ratifikovaný 19. 9.). */
export const BIO: Zastavka[] = [
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'stredná škola, Bratislava', doplni: true },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text },
  { id: 'psychologia', kedy: 'Jung', nazov: 'Psychológia', text: BEATY.find((x) => x.titulok === 'Psychológia cez Junga')!.text },
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
  cta: 'Ďalší pacient: ty →',
  peciatka: '8 rokov pri lôžku',
};

/* ---------------- inštrumentár (v54/Nastroje.astro, doslovne; farby bez hot) ---------------- */

export type Nastroj = { nazov: string; na: string; tone: 'white' | 'yellow' | 'ink' | 'paper' | 'stamp'; znak: string };
export const NASTROJE: Nastroj[] = [
  { nazov: 'Claude Code', na: 'hlavný operačný stôl: agenti, kód, dáta', tone: 'ink', znak: '✳' },
  { nazov: 'Codex', na: 'druhý chirurg: dlhé stavby cez noc', tone: 'white', znak: '◎' },
  { nazov: 'Cloudflare', na: 'weby, Workers, domény, tunely', tone: 'yellow', znak: '☁' },
  { nazov: 'Supabase', na: 'CRM a databázy pre klientov', tone: 'white', znak: '⚡' },
  { nazov: 'Linear', na: 'každá úloha od príjmu po odovzdanie', tone: 'paper', znak: '▲' },
  { nazov: 'Telegram', na: 'agent vo vrecku klienta', tone: 'white', znak: '➤' },
  { nazov: 'Astro', na: 'rýchle weby, aj tento', tone: 'white', znak: '✦' },
  { nazov: 'Resend', na: 'potvrdenia a follow-upy e-mailom', tone: 'yellow', znak: '✉' },
  { nazov: 'Python', na: 'crawlery, korpusy, analýzy', tone: 'white', znak: '§' },
  { nazov: 'Remotion', na: 'video z kódu', tone: 'stamp', znak: '▶' },
  { nazov: 'Notion', na: 'archív a databázy', tone: 'paper', znak: 'N' },
  { nazov: 'GitHub', na: 'záznam každej zmeny', tone: 'yellow', znak: '⌥' },
];

/* ---------------- chorobopisy (DOKAZY + POSTAVIL + PRIPAD_*) ---------------- */

export type Chorobopis = Dokaz & {
  fakty: { label: string; value: string; note: string }[];
  mal?: readonly string[];
  dostal?: readonly string[];
  stavText?: string;
};

export const STAV_TEXT: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };

/** Bez domén, ktoré neodpovedajú (stav „čoskoro“), a bez zdravotných dát (ako v54/Chorobopisy.astro). */
export const CHOROBOPISY: Chorobopis[] = DOKAZY.filter((d) => d.stav !== 'coskoro' && d.id !== 'vlastne-data').map((d) => {
  const p = POSTAVIL.find((x) => x.id === d.id);
  let fakty = p?.fakty.map((f) => ({ label: f.label, value: f.value, note: f.note })) ?? [];
  if (d.id === 'korpus')
    fakty = [
      { label: 'Vlastné slová', value: KORPUS.slova, note: `od ${KORPUS.od}` },
      { label: 'Prompty', value: KORPUS.prompty, note: `k ${KORPUS.kDatumu}` },
    ];
  if (d.id === 'system-pre-maklera') return { ...d, fakty, mal: PRIPAD_MAKLER.mal, dostal: PRIPAD_MAKLER.dostal, stavText: PRIPAD_MAKLER.stav };
  if (d.id === 'terapeutka') return { ...d, fakty, mal: PRIPAD_TERAPEUTKA.mal, dostal: PRIPAD_TERAPEUTKA.dostal, stavText: PRIPAD_TERAPEUTKA.stav };
  return { ...d, fakty };
});

export const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* ---------------- hry (recept prekrytia/spolocne.tsx) ---------------- */

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

/* ---------------- udalosti medzi ostrovmi (⌘K otvára sheet / hru / paletu) ---------------- */

export const UDALOST = {
  paleta: 'v710:paleta',
  projekt: 'v710:projekt',
  hra: 'v710:hra',
} as const;

export const TOASTER_ID = 'v7-10';

/** Plynulý skok na podnos: Lenis (ak beží), inak natívne. */
export function skocNa(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } | null }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
