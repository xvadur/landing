/** V7-01 · Monitor JIS — dáta webu. Texty sa preberajú doslovne zo súčasného webu (v54, v5, src/data), čísla iba zo
 *  src/data/fakty.ts a /pulse.json. Bio a projekty sú skopírované z katalógu (src/components/v7/kit/rozlozenie/data.ts,
 *  prekrytia/spolocne.tsx) a upravené, aby variant nezávisel od katalógu. */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import {
  DOKAZY,
  KORPUS,
  KOTVY,
  POSTAVIL,
  PRIPAD_MAKLER,
  PRIPAD_TERAPEUTKA,
  ZIVE_CISLA,
  ZIVE_CISLA_SNIMKA,
  type Dokaz,
} from '@/data/fakty';

/* ---------------- obrazovky monitora (poradie = poradie na stránke = kmity EKG navigácie) ---------------- */

export type Obrazovka = { id: string; nazov: string; kratko: string };

export const OBRAZOVKY: Obrazovka[] = [
  { id: 'prijem', nazov: 'Príjem', kratko: 'Príjem' },
  { id: 'vitalne', nazov: 'Vitálne funkcie', kratko: 'Vitálne' },
  { id: 'anamneza', nazov: 'Anamnéza', kratko: 'Anamnéza' },
  { id: 'nastroje', nazov: 'Inštrumentár', kratko: 'Nástroje' },
  { id: 'liecba', nazov: 'Liečba', kratko: 'Liečba' },
  { id: 'chorobopisy', nazov: 'Chorobopisy', kratko: 'Pacienti' },
  { id: 'hry', nazov: 'Hry', kratko: 'Hry' },
  { id: 'vysetrenie', nazov: 'Vyšetrenie', kratko: 'Vyšetrenie' },
  { id: 'zapis', nazov: 'Zápis', kratko: 'Zápis' },
  { id: 'texty', nazov: 'Texty a záznamy', kratko: 'Texty' },
];

export const cisloObrazovky = (id: string) => String(OBRAZOVKY.findIndex((o) => o.id === id) + 1).padStart(2, '0');
export const POCET = String(OBRAZOVKY.length).padStart(2, '0');

/* ---------------- príjem (hero) — src/components/v54/Prijem.astro ---------------- */

export const ROLY = [
  'zdravotník, ktorý stavia AI agentov',
  '8 rokov pri lôžku',
  'každý deň s AI od januára 2025',
  'autor Hriechu',
  'firma jedného človeka a jeho agentov',
];

/* ---------------- anamnéza / bio (kópia z katalógu rozlozenie/data.ts) ---------------- */

export type Zastavka = {
  id: string;
  kedy: string;
  nazov: string;
  kde?: string;
  text?: string;
  citat?: string;
  doplni?: boolean;
  kapitola: 'zaklad' | 'sluzba' | 'stavba';
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

/** Poradie podľa Adamovho zadania: elektrotechnická → Boh → nemocnica → psychológia → odchod → AI → agenti → XVADUR.
 *  Beat 1 (maturita) sa nepoužíva; zastávky bez textu na webe majú štítok „text doplní Adam“. */
export const BIO: Zastavka[] = [
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'stredná škola, Bratislava', doplni: true, kapitola: 'zaklad' },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true, kapitola: 'zaklad' },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text, kapitola: 'sluzba' },
  {
    id: 'psychologia',
    kedy: 'Jung',
    nazov: 'Psychológia',
    text: BEATY.find((x) => x.titulok === 'Psychológia cez Junga')!.text,
    kapitola: 'sluzba',
  },
  { id: 'odchod', kedy: vyhodili.kedy, nazov: vyhodili.nazov, text: vyhodili.text, citat: vyhodili.citat, kapitola: 'sluzba' },
  { id: 'ai', kedy: ai.kedy, nazov: ai.nazov, text: ai.text, kapitola: 'stavba' },
  { id: 'agenti', kedy: agenti.kedy, nazov: agenti.nazov, text: agenti.text, kapitola: 'stavba' },
  { id: 'xvadur', kedy: xvadur.kedy, nazov: xvadur.nazov, text: xvadur.text, kapitola: 'stavba' },
];

export const KAPITOLY = [
  { id: 'zaklad', nazov: 'Základ', veta: 'Škola a viera.' },
  { id: 'sluzba', nazov: 'Služba', veta: 'Nemocnica, psychológia, odchod.' },
  { id: 'stavba', nazov: 'Stavba', veta: 'AI, agenti, XVADUR.' },
] as const;

/** Doslovné vety z v54/Anamneza.astro. */
export const ANAMNEZA = {
  nadpis: 'Z nemocnice k agentom',
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  cta: 'Ďalší pacient: ty →',
  peciatka: '8 rokov pri lôžku',
};

/* ---------------- nástroje — src/components/v54/Nastroje.astro ---------------- */

export type Nastroj = { nazov: string; na: string; znak: string };
export const NASTROJE_A: Nastroj[] = [
  { nazov: 'Claude Code', na: 'hlavný operačný stôl: agenti, kód, dáta', znak: '✳' },
  { nazov: 'Codex', na: 'druhý chirurg: dlhé stavby cez noc', znak: '◎' },
  { nazov: 'Cloudflare', na: 'weby, Workers, domény, tunely', znak: '☁' },
  { nazov: 'Supabase', na: 'CRM a databázy pre klientov', znak: '⚡' },
  { nazov: 'Linear', na: 'každá úloha od príjmu po odovzdanie', znak: '▲' },
  { nazov: 'Telegram', na: 'agent vo vrecku klienta', znak: '➤' },
];
export const NASTROJE_B: Nastroj[] = [
  { nazov: 'Astro', na: 'rýchle weby, aj tento', znak: '✦' },
  { nazov: 'Resend', na: 'potvrdenia a follow-upy e-mailom', znak: '✉' },
  { nazov: 'Python', na: 'crawlery, korpusy, analýzy', znak: '§' },
  { nazov: 'Remotion', na: 'video z kódu', znak: '▶' },
  { nazov: 'Notion', na: 'archív a databázy', znak: 'N' },
  { nazov: 'GitHub', na: 'záznam každej zmeny', znak: '⌥' },
];
export const NASTROJE_VETA =
  'Nie som programátor. Po slovensky rozprávam k počítaču a tieto nástroje robia, čo poviem. Každý deň od januára 2025.';

/* ---------------- tézy — src/components/v54/Tezy.astro ---------------- */

export const TEZY: { veta: string; kedy: string }[] = [
  { veta: 'Výborný opatrovateľ nie je výborný zamestnanec.', kedy: 'o nemocnici' },
  { veta: 'Zdravotnícky systém sa strašne spolieha na iniciatívu zamestnancov a je to neudržateľné.', kedy: '8. 9. 2025' },
  { veta: 'AI nemá robiť veci za človeka, AI má prinášať veci, ktoré by inak nemohli byť reálne.', kedy: 'o AI' },
  { veta: 'AI je sandbox, ako Minecraft. Tá istá hra je v rukách dvoch ľudí absolútne odlišná.', kedy: '3. 8. 2025' },
  { veta: 'Svet sa tak zmenil, že už to, že sa zmenil, nie je vidno.', kedy: 'o dnešku' },
  {
    veta: 'Keď som mohol po slovensky rozprávať k počítaču, radikálne sa mi zmenil život. Mohol som začať tvoriť digitálne.',
    kedy: '22. 3. 2026',
  },
  { veta: 'Ja som neni chlapec, ktorý sa hrá s AI. Ja som podnikateľ, ktorý reálne robí veci s AI.', kedy: '1. 7. 2026' },
  { veta: 'Ľudia sa boja, že AI ovládne svet. Ja sa bojím, že AI bude za paywallom.', kedy: 'o AI' },
];

/* ---------------- chorobopisy (projekty) — v54/Chorobopisy.astro + fakty.ts ---------------- */

export type Pacient = Dokaz & {
  fakty: { label: string; value: string; note: string }[];
  mal?: readonly string[];
  dostal?: readonly string[];
  stavText?: string;
};

const STAV_DOKAZU: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };
export const stavText = (s: Dokaz['stav']) => STAV_DOKAZU[s];

/** Ako v54: bez domén, ktoré neodpovedajú (čoskoro), a bez zdravotných dát. Jakub, Hriech, Netopier, Lucia, Korpus,
 *  Trhový dataset, Agentový systém, Tento web. */
export const PACIENTI: Pacient[] = DOKAZY.filter((d) => d.stav !== 'coskoro' && !/zdravot/i.test(d.nazov)).map((d) => {
  const p = POSTAVIL.find((x) => x.id === d.id);
  let fakty = p?.fakty.map(({ label, value, note }) => ({ label, value, note })) ?? [];
  if (d.id === 'korpus')
    fakty = [
      { label: 'Vlastné slová', value: KORPUS.slova, note: `od ${KORPUS.od}` },
      { label: 'Prompty', value: KORPUS.prompty, note: `k ${KORPUS.kDatumu}` },
    ];
  const extra =
    d.id === 'system-pre-maklera'
      ? { mal: PRIPAD_MAKLER.mal, dostal: PRIPAD_MAKLER.dostal, stavText: PRIPAD_MAKLER.stav }
      : d.id === 'terapeutka'
        ? { mal: PRIPAD_TERAPEUTKA.mal, dostal: PRIPAD_TERAPEUTKA.dostal, stavText: PRIPAD_TERAPEUTKA.stav }
        : d.id === 'korpus'
          ? { stavText: `Za prihlásením (adam.xvadur.com). Pulz: snímka ${ZIVE_CISLA_SNIMKA}.` }
          : {};
  return { ...d, fakty, ...extra };
});

export const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* ---------------- hry — src/pages/hry/index.astro, v5/TextyHry.astro ---------------- */

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

/* ---------------- Korpus: skutočné čísla (SSR snímka, klient prepíše z /pulse.json) ---------------- */

export const PULZ_KLUCE = ['words_month', 'prompts_today', 'streak_days', 'projects_active'] as const;
export type PulzKluc = (typeof PULZ_KLUCE)[number];
export const PULZ_ZAKLAD = Object.fromEntries(ZIVE_CISLA.map((z) => [z.kluc, z.value])) as Record<PulzKluc, number>;
export const PULZ_POPIS = Object.fromEntries(ZIVE_CISLA.map((z) => [z.kluc, { label: z.label, note: z.note }])) as Record<
  PulzKluc,
  { label: string; note: string }
>;

export { KORPUS, ZIVE_CISLA_SNIMKA };
