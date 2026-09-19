/** Klišé rodiny a prázdne prídavné mená pre Škrtací test (/hry/skrtaci-test/) a Skóre webu (/skore/).
 *  Zdroj: xvadur_brand/01_current_personal_brand/13_NEVIDITELNY_MAKLER_LAUNCH_2026-09-15.md
 *   — §1 „Dôkazy" (6 rodín fráz, 31/47; výskyty na 416 weboch; 14 citácií webov kancelárií; inserty reelov)
 *   — §2 Deň 1 „Škrtací test" (škrtnúť 6 fráz + každé prídavné meno bez čísla alebo mena za ním).
 *  Vzory sú skloňované tvary tých istých fráz z packu, nič nové. Porovnávať bez ohľadu na veľkosť písmen. */

export type FrazaRodina = {
  /** názov rodiny tak, ako je v packu */
  rodina: string;
  /** vzory (lowercase), skloňované tvary + doslovné citácie z webov kancelárií */
  vzory: string[];
  /** koľko zo 47 kancelárií (top50-copy-evidence, 16. 8. 2026); null = mimo šestice, len výskyty na 416 weboch */
  z47: number | null;
  /** výskyty na 416 weboch (copy-intelligence, 16. 8. 2026), ak pack uvádza */
  na416?: number;
  /** patrí medzi 6 základných rodín z Dňa 1 */
  zakladna: boolean;
};

export const FRAZY_RODINY: FrazaRodina[] = [
  {
    rodina: 'komplexný / kompletný servis',
    z47: 21,
    na416: 64,
    zakladna: true,
    vzory: [
      'komplexný servis',
      'komplexné služby',
      'komplexného servisu',
      'komplexných služieb',
      'komplexný realitný servis',
      'komplexné služby na jednom mieste',
      'komplexné služby pod jednou strechou',
      'kompletný servis',
      'kompletné služby',
      'kompletného servisu',
      'kompletný realitný servis',
      'služby pod jednou strechou',
      'servis na kľúč',
      'na kľúč',
    ],
  },
  {
    rodina: 'dlhoročné skúsenosti',
    z47: 11,
    na416: 92,
    zakladna: true,
    vzory: [
      'dlhoročné skúsenosti',
      'dlhoročných skúseností',
      'dlhoročnými skúsenosťami',
      'dlhoročné skúsenosti v realitách',
      'dlhoročné skúsenosti našich maklérov',
      'rokov skúseností',
      'roky skúseností',
      'ročnými skúsenosťami',
      'ročné skúsenosti',
      '20 rokov',
      'už 20 rokov',
    ],
  },
  {
    rodina: 'profesionálny prístup',
    z47: 7,
    na416: 98,
    zakladna: true,
    vzory: [
      'profesionálny prístup',
      'profesionálneho prístupu',
      'profesionálnym prístupom',
      'profesionalita',
      'profesionalitu',
      'profesionality',
      'profesionálne služby',
      'profesionálny',
    ],
  },
  {
    rodina: 'individuálny prístup',
    z47: 7,
    na416: 40,
    zakladna: true,
    vzory: [
      'individuálny prístup',
      'individuálneho prístupu',
      'individuálnym prístupom',
      'osobný prístup',
      'osobného prístupu',
      'osobným prístupom',
      'osobitný prístup',
      'osobitným prístupom',
    ],
  },
  {
    rodina: 'najlepšia / najvyššia cena',
    z47: 7,
    zakladna: true,
    vzory: [
      'najlepšia cena',
      'najlepšiu cenu',
      'najlepšej ceny',
      'najlepšie ceny',
      'najlepšia možná cena',
      'za čo najlepšiu možnú cenu',
      'dosiahnuť najlepšiu cenu',
      'najvyššia cena',
      'najvyššiu cenu',
      'za čo najvyššiu cenu',
    ],
  },
  {
    rodina: 'bez starostí',
    z47: 2,
    zakladna: true,
    vzory: ['bez starostí', 'bez starosti'],
  },
  /* — mimo šestice: ďalšie výskyty z 416 webov a z reklám (pack §1, R1) — */
  {
    rodina: 'ocenenia / najlepší',
    z47: null,
    na416: 59,
    zakladna: false,
    vzory: ['ocenenia', 'ocenená', 'ocenený', 'najlepšia kancelária', 'najlepšia realitná kancelária'],
  },
  {
    rodina: 'proces / stratégia',
    z47: null,
    na416: 86,
    zakladna: false,
    vzory: ['predajná stratégia', 'stratégia predaja', 'predajný proces', 'proces predaja'],
  },
  {
    rodina: 'rýchlosť',
    z47: null,
    na416: 49,
    zakladna: false,
    vzory: ['rýchlosť', 'rýchly predaj', 'rýchlo predať', 'rýchle'],
  },
  {
    rodina: 'vysnívané bývanie',
    z47: null,
    zakladna: false,
    vzory: ['vysnívané bývanie', 'vysnívané'],
  },
];

/** Prídavné mená, za ktorými v textoch kancelárií nie je číslo ani meno (Deň 1). Základné tvary;
 *  na porovnanie použite PRAZDNE_PRIDAVNE_STONKY (pokryjú rod, číslo, pád). */
export const PRAZDNE_PRIDAVNE: string[] = [
  'komplexný',
  'kompletný',
  'dlhoročný',
  'profesionálny',
  'individuálny',
  'osobný',
  'osobitný',
  'perfektný',
  'najlepší',
  'najvyšší',
  'vysnívaný',
  'rýchly',
  'skúsený',
  'ocenený',
];

/** Kmene prídavných mien (lowercase). Slovo sa škrtne, keď sa začína kmeňom a pokračuje príponou. */
export const PRAZDNE_PRIDAVNE_STONKY: string[] = [
  'komplexn',
  'kompletn',
  'dlhoročn',
  'profesionáln',
  'individuáln',
  'osobn',
  'osobitn',
  'perfektn',
  'najlepš',
  'najvyšš',
  'vysnívan',
  'rýchl',
  'skúsen',
  'ocenen',
];

/** Slová, ktoré kmeňový regex prídavných mien zachytí, ale nie sú prídavné meno (príslovka „osobne“ vo vzorovej vete
 *  Dňa 2 packu 13: „Predaj držím osobne.“ musí prejsť s 0 škrtmi). Používa skrtni.ts aj každý ďalší spotrebiteľ pridavneRegex(). */
export const PRAZDNE_PRIDAVNE_VYNIMKY: string[] = ['osobne'];

/** Doslovné citácie webov kancelárií (verejný text, august 2026) — na dôkazy v /makleri/ a v hre. */
export const CITACIE: { kto: string; text: string }[] = [
  { kto: '1.BCR', text: 'Komplexné služby na jednom mieste' },
  { kto: 'KARIN & PARTNERS', text: 'Komplexné služby pod jednou strechou' },
  { kto: '1. realitná a aukčná spoločnosť', text: 'KOMPLETNÝ REALITNÝ SERVIS' },
  { kto: 'Omnireal', text: 'Kompletné služby ktoré poskytuje Omnireal' },
  { kto: 'TeEq', text: 'zabezpečenie kompletného servisu pre klienta ‚na kľúč‘' },
  { kto: 'GRAVITAS', text: 'profesionalita, individuálny prístup a perfektná znalosť prostredia' },
  { kto: 'Relax Properties', text: 'Individuálny prístup' },
  { kto: 'Moderný maklér', text: 'Profesionálny prístup s viac ako 20-ročnými skúsenosťami' },
  { kto: 'ARCHEUS', text: 'ZA ČO NAJLEPŠIU MOŽNÚ CENU' },
  { kto: 'Maxim Real', text: 'za čo najvyššiu cenu' },
  { kto: 'Wealth Group', text: 'dosiahnuť najlepšiu cenu' },
  { kto: '1.BCR', text: 'Dlhoročné skúsenosti v realitách' },
  { kto: 'TeEq', text: 'dlhoročné skúsenosti našich maklérov' },
  { kto: 'Slovak Estate', text: 'Dlhoročné skúsenosti so všetkými druhmi nehnuteľností' },
];

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Regex na všetky vzory (najdlhšie prvé), unicode, bez rozlíšenia veľkosti písmen, globálny. */
export function frazyRegex(rodiny: FrazaRodina[] = FRAZY_RODINY): RegExp {
  const vzory = rodiny
    .flatMap((r) => r.vzory)
    .sort((a, b) => b.length - a.length)
    .map(escapeRe);
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${vzory.join('|')})(?![\\p{L}])`, 'giu');
}

/** Regex na prázdne prídavné mená podľa kmeňov (slovo začínajúce kmeňom + prípona). */
export function pridavneRegex(stonky: string[] = PRAZDNE_PRIDAVNE_STONKY): RegExp {
  const k = stonky.sort((a, b) => b.length - a.length).map(escapeRe);
  return new RegExp(`(?<![\\p{L}])(?:${k.join('|')})\\p{L}{1,4}(?![\\p{L}])`, 'giu');
}

/** Ktorá rodina obsahuje daný nájdený vzor (lowercase). */
export function rodinaPreVzor(vzor: string): FrazaRodina | undefined {
  const v = vzor.toLowerCase();
  return FRAZY_RODINY.find((r) => r.vzory.some((x) => x === v));
}
