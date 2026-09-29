/** V7-07 · Orientačný systém nemocnice — dáta variantu.
 *  Miesta (pavilóny) sú kostra webu: každé má písmeno, názov na tabuľu (split-flap), piktogram a smer.
 *  Texty iba zo src/data/* (cesta, fakty, ponuka, beaty — bez beatu 1), src/components/v54/* a hero-data.ts.
 *  Bio a projekty sú skopírované a upravené z katalógu (src/components/v7/kit/rozlozenie/data.ts), nie importované. */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import { DOKAZY, KORPUS, KOTVY, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, ZIVE_CISLA, ZIVE_CISLA_SNIMKA, type Dokaz } from '@/data/fakty';

/* ---------------- miesta (pavilóny) ---------------- */

export type MiestoId = 'recepcia' | 'anamneza' | 'chorobopisy' | 'liecba' | 'herna' | 'kniznica' | 'vysetrenie' | 'vychod';

export type Miesto = {
  id: MiestoId;
  /** písmeno pavilónu na tabuli a v tlačidle výťahu */
  pismeno: string;
  /** názov na split-flap tabuli (VEĽKÉ, max 11 znakov) */
  tabula: string;
  /** názov v menu */
  nazov: string;
  /** čo tam je, jednou vetou (priama veta, metafora iba obaľuje) */
  co: string;
  /** zástupná plocha statického záberu pavilónu (druhé kolo) */
  zaber: string;
};

export const MIESTA: Miesto[] = [
  { id: 'recepcia', pismeno: 'R', tabula: 'RECEPCIA', nazov: 'Recepcia', co: 'Kto je Adam a kam môžeš vojsť.', zaber: '07-recepcia' },
  { id: 'anamneza', pismeno: 'A', tabula: 'ANAMNÉZA', nazov: 'Anamnéza', co: 'Kto som: z nemocnice k agentom.', zaber: '07-pav-a' },
  { id: 'chorobopisy', pismeno: 'B', tabula: 'CHOROBOPISY', nazov: 'Chorobopisy', co: 'Čo som postavil: Jakub, Lucia, Hriech, Korpus.', zaber: '07-pav-b' },
  { id: 'liecba', pismeno: 'C', tabula: 'LIEČBA', nazov: 'Liečba', co: 'Služby: triáž, zásah, odovzdanie.', zaber: '07-pav-c' },
  { id: 'herna', pismeno: 'D', tabula: 'HERŇA', nazov: 'Herňa', co: 'Hry, ktoré si vyskúšaš namiesto brožúry.', zaber: '07-pav-d' },
  { id: 'kniznica', pismeno: 'E', tabula: 'KNIŽNICA', nazov: 'Knižnica', co: 'Texty, Hriech a Netopier.', zaber: '07-pav-e' },
  { id: 'vysetrenie', pismeno: 'F', tabula: 'VYŠETRENIE', nazov: 'Vyšetrenie', co: 'Rezervácia 30 minút s Adamom. Cieľ chodby.', zaber: '07-pav-f' },
  { id: 'vychod', pismeno: 'V', tabula: 'VÝCHOD', nazov: 'Východ', co: 'Návod a newsletter do e-mailu.', zaber: '07-vychod' },
];

export const miesto = (id: MiestoId) => MIESTA.find((m) => m.id === id)!;
/** Pavilóny vo vodorovnej chodbe (desktop). */
export const CHODBA: MiestoId[] = ['anamneza', 'chorobopisy', 'liecba', 'herna', 'kniznica'];
export const dalsie = (id: MiestoId): Miesto | null => {
  const i = MIESTA.findIndex((m) => m.id === id);
  return MIESTA[i + 1] ?? null;
};

/* ---------------- bio (Anamnéza) ---------------- */

export type Zastavka = {
  id: string;
  kedy: string;
  nazov: string;
  kde?: string;
  text?: string;
  citat?: string;
  /** text na webe zatiaľ nie je → štítok „text doplní Adam“ */
  doplni?: boolean;
  /** dátum s hviezdičkou sa ešte overuje (fakty.ts ROZPOR 3) */
  overuje?: boolean;
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
/** Beat 3 (Adamova ratifikovaná veta 19. 9. 2026). Beat 1 sa nepoužíva. */
const psychologia = BEATY.find((x) => x.titulok === 'Psychológia cez Junga')!;

export const BIO: Zastavka[] = [
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'stredná škola, Bratislava', doplni: true },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text },
  { id: 'psychologia', kedy: psychologia.rok, nazov: 'Psychológia', text: psychologia.text },
  { id: 'odchod', kedy: vyhodili.kedy, nazov: vyhodili.nazov, text: vyhodili.text, citat: vyhodili.citat, overuje: true },
  { id: 'ai', kedy: ai.kedy, nazov: ai.nazov, text: ai.text },
  { id: 'agenti', kedy: agenti.kedy, nazov: agenti.nazov, text: agenti.text },
  { id: 'xvadur', kedy: xvadur.kedy, nazov: xvadur.nazov, text: xvadur.text },
];

/** Doslovne z src/components/v54/Anamneza.astro. */
export const ANAMNEZA = {
  nadpis: 'Z nemocnice k agentom',
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  cta: 'Ďalší pacient: ty →',
  peciatka: '8 rokov pri lôžku',
};

/* ---------------- chorobopisy (projekty) ---------------- */

export type Projekt = {
  id: string;
  nazov: string;
  stitky: string[];
  cislo: string;
  cisloPopis: string;
  riadok: string;
  obrazok: string | null;
  url: string | null;
  stav: Dokaz['stav'];
  poznamka?: string;
  mal?: readonly string[];
  dostal?: readonly string[];
  stavText?: string;
  cisla?: { value: string; label: string }[];
};

export const STAV: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };

const dokaz = (id: string): Dokaz => {
  const d = DOKAZY.find((x) => x.id === id);
  if (!d) throw new Error(`fakty.ts: chýba dôkaz ${id}`);
  return d;
};
const zDokazu = (d: Dokaz): Projekt => ({
  id: d.id,
  nazov: d.nazov,
  stitky: [...d.stitky],
  cislo: d.cislo,
  cisloPopis: d.cisloPopis,
  riadok: d.riadok,
  obrazok: d.obrazok,
  url: d.url,
  stav: d.stav,
  poznamka: d.poznamka,
});

const sk = (n: number) => n.toLocaleString('sk-SK').replace(/[  ]/g, ' ');
const korpusCisla = ZIVE_CISLA.filter((z) => z.kluc === 'words_month' || z.kluc === 'streak_days').map((z) => ({ value: sk(z.value), label: z.label }));

/** Poradie ako Chorobopisy V5.4 (bez „čoskoro“ a bez zdravotných dát): Jakub, Hriech, Netopier, Lucia, Korpus, dataset, agentový systém, tento web. */
export const PROJEKTY: Projekt[] = [
  { ...zDokazu(dokaz('system-pre-maklera')), mal: PRIPAD_MAKLER.mal, dostal: PRIPAD_MAKLER.dostal, stavText: PRIPAD_MAKLER.stav, cisla: [...PRIPAD_MAKLER.cisla] },
  { ...zDokazu(dokaz('terapeutka')), mal: PRIPAD_TERAPEUTKA.mal, dostal: PRIPAD_TERAPEUTKA.dostal, stavText: PRIPAD_TERAPEUTKA.stav },
  {
    ...zDokazu(dokaz('hriech')),
    cisla: [
      { value: '59', label: 'stránok mediálnej kritiky' },
      { value: '10', label: 'redakcií v mape' },
      { value: '558', label: 'ľudí v mape' },
    ],
  },
  {
    ...zDokazu(dokaz('korpus')),
    stavText: `Za prihlásením (adam.xvadur.com). Pulz: snímka ${ZIVE_CISLA_SNIMKA}.`,
    cisla: [{ value: KORPUS.slova, label: `vlastných slov od ${KORPUS.od}` }, { value: KORPUS.prompty, label: 'promptov' }, ...korpusCisla],
  },
  {
    ...zDokazu(dokaz('netopier')),
    cisla: [
      { value: '397', label: 'prepisov' },
      { value: '10', label: 'redakcií v mape' },
      { value: '558', label: 'ľudí v mape' },
    ],
  },
  zDokazu(dokaz('trhovy-dataset')),
  zDokazu(dokaz('agentovy-system')),
  zDokazu(dokaz('xvadur-com')),
];

/** Trh maklérov (pack13, fakty.ts KOTVY) — skutočné čísla pre lievik v chorobopise Jakuba. */
export const LIEVIK_TRH = [
  { name: 'prehľadané realitné weby', value: 459 },
  { name: 'webov s analyzovaným prvým krokom', value: KOTVY.prvyKrokKontakt.z },
  { name: 'webov s použiteľným dôkazom', value: KOTVY.dokazNaWebe.value },
  { name: 'webov s rezerváciou ako prvým krokom', value: KOTVY.prvyKrokRezervacia.value },
];

export const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* ---------------- hry ---------------- */

export const HRA = {
  nazov: 'Škrtací test',
  href: '/hry/skrtaci-test/',
  /** src/components/v5/TextyHry.astro */
  titulok: 'Veci, ktoré si vyskúšaš namiesto brožúry.',
  text: 'Ďalšie hry staviam. Jedna už beží: vlož svoj text a škrtneme frázy, ktoré má každý.',
  fraza: KOTVY.kancelarieSFrazou,
};

/** src/pages/hry/index.astro — hry v stavbe (bez popisu, ten doplní Adam). */
export const HRY_V_STAVBE = [
  { id: 'miliarda-bilion', cislo: '02', nazov: 'Miliarda → bilión' },
  { id: 'strach-o-meter', cislo: '03', nazov: 'Strach-o-meter' },
];
