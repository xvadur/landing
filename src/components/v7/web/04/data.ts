/** V7-04 · Triáž — dáta variantu. Stránka je zoradená podľa naliehavosti: päť triážnych úrovní = päť farieb webu
 *  (alarm, hot, žltá, biela, ink). Texty sa berú doslovne zo súčasného webu (hero-data, cesta, ponuka, fakty,
 *  v54/Liecba, v54/Tezy, v54/Nastroje, v5/TextyHry, kit/rozlozenie/data), vlastné sú len krátke popisy úrovní.
 *  Čísla iba zo src/data/fakty.ts a /pulse.json. */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import { DOKAZY, KORPUS, KOTVY, POSTAVIL, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, type Dokaz } from '@/data/fakty';
import { PRIEBEH } from '@/components/konzultacia/data';

/* ---------------- triážne úrovne ---------------- */

export type Farba = 'stamp' | 'hot' | 'yellow' | 'white' | 'ink';
export type Zona = {
  n: 1 | 2 | 3 | 4 | 5;
  id: string;
  farba: Farba;
  /** názov úrovne (Manchesterská triáž, po slovensky) */
  uroven: string;
  nazov: string;
  veta: string;
  /** id záberu (druhé kolo, Higgsfield) */
  zaber: string;
  zaberPopis: string;
};

export const ZONY: Zona[] = [
  {
    n: 1,
    id: 'prijem',
    farba: 'stamp',
    uroven: 'Okamžite',
    nazov: 'Príjem',
    veta: 'Kto ťa prijíma a čo mu práve ukazuje monitor.',
    zaber: '04-T1-sanitka',
    zaberPopis: 'sanitka pred urgentom, risograf',
  },
  {
    n: 2,
    id: 'vysetrenie',
    farba: 'hot',
    uroven: 'Veľmi naliehavé',
    nazov: 'Vyšetrenie',
    veta: 'Termín na 30 minút. Zatiaľ zadarmo.',
    zaber: '04-T2-sestra',
    zaberPopis: 'triážna sestra s tabletom',
  },
  {
    n: 3,
    id: 'liecba',
    farba: 'yellow',
    uroven: 'Naliehavé',
    nazov: 'Liečba',
    veta: 'Čo s tebou urobím, keď je diagnóza jasná.',
    zaber: '04-T3-monitor',
    zaberPopis: 'monitor vitálnych funkcií',
  },
  {
    n: 4,
    id: 'anamneza',
    farba: 'white',
    uroven: 'Štandardné',
    nazov: 'Anamnéza a chorobopisy',
    veta: 'Odkiaľ prichádzam a čo som postavil.',
    zaber: '04-T4-cakaren',
    zaberPopis: 'čakáreň, rad stoličiek',
  },
  {
    n: 5,
    id: 'mimo',
    farba: 'ink',
    uroven: 'Nenaliehavé',
    nazov: 'Mimo ordinácie',
    veta: 'Hry, texty a vydanie raz za týždeň.',
    zaber: '04-T5-sprava',
    zaberPopis: 'prepúšťacia správa',
  },
];

/** Triedy pre farbu úrovne (pozadie + text). Text na hot je vždy ink, na stamp a ink papier. */
export const FARBA_TRIEDY: Record<Farba, string> = {
  stamp: 'bg-stamp text-paper',
  hot: 'bg-hot text-ink',
  yellow: 'bg-yellow text-ink',
  white: 'bg-white text-ink',
  ink: 'bg-ink text-paper',
};

/* ---------------- príjem ---------------- */

/** Rola pod menom (v54/Prijem.astro, ROLY[0]). */
export const ROLA = 'zdravotník, ktorý stavia AI agentov';

/* ---------------- anamnéza (bio) ---------------- */

export type Zastavka = { id: string; kedy: string; nazov: string; kde?: string; text?: string; citat?: string; doplni?: boolean };

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

/** Poradie podľa zadania (elektrotechnická → viera → nemocnica → psychológia → odchod → AI → agenti → XVADUR).
 *  Bez beatu 1 (maturita). Kde text na webe nie je, štítok „text doplní Adam“ (kit/rozlozenie/data.ts BIO). */
export const BIO: Zastavka[] = [
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'stredná škola, Bratislava', doplni: true },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text },
  { id: 'psychologia', kedy: 'Jung', nazov: 'Psychológia', text: psychologia?.text, doplni: !psychologia },
  { id: 'odchod', kedy: vyhodili.kedy, nazov: vyhodili.nazov, text: vyhodili.text, citat: vyhodili.citat },
  { id: 'ai', kedy: ai.kedy, nazov: ai.nazov, text: ai.text },
  { id: 'agenti', kedy: agenti.kedy, nazov: agenti.nazov, text: agenti.text },
  { id: 'xvadur', kedy: xvadur.kedy, nazov: xvadur.nazov, text: xvadur.text },
];

/** Doslovne z v54/Anamneza.astro. */
export const ANAMNEZA = {
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  cta: 'Ďalší pacient: ty →',
};

/** Tézy — doslovne z v54/Tezy.astro. */
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

/** Inštrumentár — doslovne z v54/Nastroje.astro (názov + na čo). */
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
  { nazov: 'GitHub', na: 'záznam každej zmeny' },
];

/* ---------------- liečba: cesta klienta (lievik z PRIEBEH) ---------------- */

/** Minúty z tabuľky priebehu (konzultacia/data.ts): „0–5 min“ → začiatok 0. Lievik = koľko minút vyšetrenia ostáva
 *  na začiatku každej fázy (30 → 25 → 18 → 12 → 5). Žiadne nové číslo, iba prepočet časov z PRIEBEH. */
export const CESTA_KLIENTA = PRIEBEH.map((k) => {
  const [od, doo] = k.cas.replace(' min', '').split('–').map(Number);
  return { cas: k.cas, od: od!, trvanie: doo! - od!, zostava: 30 - od!, vznikne: k.vznikne, vedie: k.vedie };
});
export const CESTA_NAZVY = ['Úloha', 'Mapa', 'Kritérium', 'Návrh', 'Ďalší krok'];

/* ---------------- chorobopisy ---------------- */

export type Chorobopis = {
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
  fakty: { label: string; value: string; note: string }[];
  /** triážna úroveň karty (kto je pacient): pacient, verejnosť, vlastné */
  pre: Dokaz['pre'];
};

export const STAV_TEXT: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };
export const PRE_TEXT: Record<Dokaz['pre'], string> = {
  pacient: 'Pacient',
  verejnost: 'Diagnóza médií',
  vlastne: 'Vlastné vitálne funkcie',
  dalsie: 'Ďalší záznam',
};

const PORADIE = ['system-pre-maklera', 'terapeutka', 'hriech', 'korpus', 'netopier', 'agentovy-system', 'trhovy-dataset'];

export const CHOROBOPISY: Chorobopis[] = PORADIE.map((id) => {
  const d = DOKAZY.find((x) => x.id === id);
  if (!d) throw new Error(`fakty.ts: chýba dôkaz ${id}`);
  const p = POSTAVIL.find((x) => x.id === id);
  let fakty = p?.fakty.map((f) => ({ label: f.label, value: f.value, note: f.note })) ?? [];
  let extra: Partial<Chorobopis> = {};
  if (id === 'korpus')
    fakty = [
      { label: 'Vlastné slová', value: KORPUS.slova, note: `od ${KORPUS.od}` },
      { label: 'Prompty', value: KORPUS.prompty, note: `k ${KORPUS.kDatumu}` },
    ];
  if (id === 'system-pre-maklera') extra = { mal: PRIPAD_MAKLER.mal, dostal: PRIPAD_MAKLER.dostal, stavText: PRIPAD_MAKLER.stav };
  if (id === 'terapeutka') extra = { mal: PRIPAD_TERAPEUTKA.mal, dostal: PRIPAD_TERAPEUTKA.dostal, stavText: PRIPAD_TERAPEUTKA.stav };
  return {
    id: d.id,
    nazov: d.nazov,
    stitky: d.stitky,
    cislo: d.cislo,
    cisloPopis: d.cisloPopis,
    riadok: d.riadok,
    obrazok: d.obrazok,
    url: d.url,
    stav: d.stav,
    poznamka: d.poznamka,
    pre: d.pre,
    fakty,
    ...extra,
  };
});

/* ---------------- hry ---------------- */

export type Hra = { id: string; cislo: string; nazov: string; text: string | null; href: string | null };

/** Rovnaké ako /hry/ (src/pages/hry/index.astro): jedna beží, dve sa stavajú (bez popisu, doplní Adam). */
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

/** Udalosti medzi ostrovmi (paleta ⌘K otvára hru, chorobopis alebo prehliadku v inom ostrove). */
export const UDALOST = {
  hra: 'v704:hra',
  chorobopis: 'v704:chorobopis',
  prehliadka: 'v704:prehliadka',
} as const;

/** Toaster variantu (sonner filtruje podľa id, site Toaster bez id tieto hlásenia neukáže). */
export const TOASTER = 'v7-04';
