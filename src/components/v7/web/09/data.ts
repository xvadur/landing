/** V7-09 · Plagát a zin — dáta variantu. Texty sa preberajú doslovne zo súčasného webu:
 *  src/data/{cesta,beaty,fakty,ponuka}.ts, src/components/hero/hero-data.ts, v54/{Anamneza,Tezy,Chorobopisy}.astro,
 *  v5/TextyHry.astro. Čísla iba z src/data/fakty.ts a /pulse.json. Žiadny import z src/components/v7/kit/**.
 *  Bio: poradie z BUILD_ZADANIE (elektrotechnická → viera → nemocnica → psychológia → odchod → AI → agenti → XVADUR).
 *  Beat 1 z beaty.ts sa nepoužíva (zakázané „Zmaturoval som dobre“), žiadne vety o škole a známkach. */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import { DOKAZY, KOTVY, KORPUS, POSTAVIL, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, ZIVE_CISLA, type Dokaz } from '@/data/fakty';

/* ---------------- bio (Kto som) ---------------- */

export type Zastavka = {
  id: string;
  kedy: string;
  nazov: string;
  kde?: string;
  text?: string;
  citat?: string;
  /** text na webe zatiaľ nie je → štítok „text doplní Adam“ */
  doplni?: boolean;
  kapitola: 'Základ' | 'Služba' | 'Stavba';
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

export const BIO: Zastavka[] = [
  { id: 'elektro', kedy: '—', nazov: 'Elektrotechnická', doplni: true, kapitola: 'Základ' },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true, kapitola: 'Základ' },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text, kapitola: 'Služba' },
  psychologia
    ? { id: 'psychologia', kedy: 'Jung', nazov: 'Psychológia', text: psychologia.text, kapitola: 'Služba' }
    : { id: 'psychologia', kedy: '—', nazov: 'Psychológia', doplni: true, kapitola: 'Služba' },
  { id: 'odchod', kedy: vyhodili.kedy, nazov: vyhodili.nazov, text: vyhodili.text, citat: vyhodili.citat, kapitola: 'Služba' },
  { id: 'ai', kedy: ai.kedy, nazov: ai.nazov, text: ai.text, kapitola: 'Stavba' },
  { id: 'agenti', kedy: agenti.kedy, nazov: agenti.nazov, text: agenti.text, kapitola: 'Stavba' },
  { id: 'xvadur', kedy: xvadur.kedy, nazov: xvadur.nazov, text: xvadur.text, kapitola: 'Stavba' },
];

/** Doslovne z v54/Anamneza.astro. */
export const ANAMNEZA = {
  nadpis: 'Z nemocnice k agentom',
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  cta: 'Ďalší pacient: ty →',
  peciatka: '8 rokov pri lôžku',
};

/* ---------------- tézy (manifest) — doslovne z v54/Tezy.astro ---------------- */

export const TEZY: { veta: string; kedy: string; zvyraznit: string }[] = [
  { veta: 'Výborný opatrovateľ nie je výborný zamestnanec.', kedy: 'o nemocnici', zvyraznit: 'nie je' },
  { veta: 'Zdravotnícky systém sa strašne spolieha na iniciatívu zamestnancov a je to neudržateľné.', kedy: '8. 9. 2025', zvyraznit: 'neudržateľné' },
  { veta: 'AI nemá robiť veci za človeka, AI má prinášať veci, ktoré by inak nemohli byť reálne.', kedy: 'o AI', zvyraznit: 'nemohli byť reálne' },
  { veta: 'AI je sandbox, ako Minecraft. Tá istá hra je v rukách dvoch ľudí absolútne odlišná.', kedy: '3. 8. 2025', zvyraznit: 'absolútne odlišná' },
  { veta: 'Svet sa tak zmenil, že už to, že sa zmenil, nie je vidno.', kedy: 'o dnešku', zvyraznit: 'nie je vidno' },
  { veta: 'Keď som mohol po slovensky rozprávať k počítaču, radikálne sa mi zmenil život. Mohol som začať tvoriť digitálne.', kedy: '22. 3. 2026', zvyraznit: 'po slovensky' },
  { veta: 'Ja som neni chlapec, ktorý sa hrá s AI. Ja som podnikateľ, ktorý reálne robí veci s AI.', kedy: '1. 7. 2026', zvyraznit: 'reálne robí' },
  { veta: 'Ľudia sa boja, že AI ovládne svet. Ja sa bojím, že AI bude za paywallom.', kedy: 'o AI', zvyraznit: 'za paywallom' },
];

/* ---------------- chorobopisy (projekty) ---------------- */

export type Chorobopis = Dokaz & {
  fakty: { label: string; value: string; note: string }[];
  mal?: readonly string[];
  dostal?: readonly string[];
  stavText?: string;
};

/** Rovnaký výber ako v54/Chorobopisy.astro: bez domén, ktoré neodpovedajú, a bez zdravotných dát. */
export const CHOROBOPISY: Chorobopis[] = DOKAZY.filter((d) => d.stav !== 'coskoro' && !/zdravot/i.test(d.nazov)).map((d) => {
  const p = POSTAVIL.find((x) => x.id === d.id);
  let fakty: Chorobopis['fakty'] = p?.fakty.map(({ label, value, note }) => ({ label, value, note })) ?? [];
  let extra: Partial<Chorobopis> = {};
  if (d.id === 'korpus')
    fakty = [
      { label: 'Vlastné slová', value: KORPUS.slova, note: `od ${KORPUS.od}` },
      { label: 'Prompty', value: KORPUS.prompty, note: `k ${KORPUS.kDatumu}` },
    ];
  if (d.id === 'system-pre-maklera') extra = { mal: PRIPAD_MAKLER.mal, dostal: PRIPAD_MAKLER.dostal, stavText: PRIPAD_MAKLER.stav };
  if (d.id === 'terapeutka') extra = { mal: PRIPAD_TERAPEUTKA.mal, dostal: PRIPAD_TERAPEUTKA.dostal, stavText: PRIPAD_TERAPEUTKA.stav };
  return { ...d, fakty, ...extra };
});

export const STAV_TEXT: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };
export const PRE_TEXT: Record<Dokaz['pre'], string> = { pacient: 'Pacienti', verejnost: 'Diagnóza médií', vlastne: 'Vlastné vitálne funkcie', dalsie: 'Ďalšie záznamy' };

/** Graf: koľko chorobopisov je pre koho (počíta sa z DOKAZY, nič sa nevymýšľa). */
export const PODLA_PRE = (Object.keys(PRE_TEXT) as Dokaz['pre'][])
  .map((k) => ({ kluc: k, nazov: PRE_TEXT[k], pocet: CHOROBOPISY.filter((c) => c.pre === k).length }))
  .filter((x) => x.pocet > 0);

/** Graf: diagnóza trhu (pack13 §1, fakty.ts KOTVY) — 416 realitných webov. */
export const TRH_416 = [
  { co: 'Kontakt ako 1. krok', pocet: KOTVY.prvyKrokKontakt.value, pozn: KOTVY.prvyKrokKontakt.note },
  { co: 'Použiteľný dôkaz', pocet: KOTVY.dokazNaWebe.value, pozn: KOTVY.dokazNaWebe.note },
  { co: 'Rezervácia ako 1. krok', pocet: KOTVY.prvyKrokRezervacia.value, pozn: KOTVY.prvyKrokRezervacia.note },
];
export const TRH_Z = KOTVY.prvyKrokKontakt.z;

/* ---------------- hry — texty z v5/TextyHry.astro a /hry/ ---------------- */

export const HRY = [
  {
    id: 'skrtaci-test',
    cislo: '01',
    nazov: 'Škrtací test',
    text: `Vlož svoj text. Škrtneme frázy, ktoré má každý. ${KOTVY.kancelarieSFrazou.value} zo ${KOTVY.kancelarieSFrazou.z} kancelárií má v texte aspoň jednu zo šiestich fráz.`,
    href: '/hry/skrtaci-test/' as string | null,
  },
  { id: 'miliarda-bilion', cislo: '02', nazov: 'Miliarda → bilión', text: null, href: null },
  { id: 'strach-o-meter', cislo: '03', nazov: 'Strach-o-meter', text: null, href: null },
];

/* ---------------- pulz ---------------- */

export type Pulz = { words_month: number; prompts_today: number; streak_days: number; projects_active: number; updated_at?: string };
const z = (k: string) => ZIVE_CISLA.find((c) => c.kluc === k)?.value ?? 0;
/** SSR a záloha = snímka z fakty.ts (ZIVE_CISLA), na klientovi sa prepíše skutočným /pulse.json. */
export const PULZ_SNIMKA: Pulz = {
  words_month: z('words_month'),
  prompts_today: z('prompts_today'),
  streak_days: z('streak_days'),
  projects_active: z('projects_active'),
};

/** EKG krivka (ilustrácia, nie dáta): jeden úder = izolínia, P, QRS, T. Sparkline ju kreslí ako stopu monitora. */
const UDER = [0, 0, 0, 1, 0, 0, -2, 9, -4, 0, 0, 2, 3, 1, 0, 0];
export const EKG_STOPA = [...UDER, ...UDER, ...UDER, ...UDER];
