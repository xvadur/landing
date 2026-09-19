/** Tabuľka „Voľba najmenšieho užitočného riešenia“ — pack 04 (01_current_personal_brand/pack-2026-09-11/04_KONZULTACIE_A_PONUKA.md),
 *  riadky VERBATIM (pozorovanie / prvý vhodný krok / dôvod). Kvíz z nej vyberá práve jeden prvý krok.
 *  `slug` je zdieľaný kontrakt s /konzultacia/ (query `krok=<slug>`). Poradie = poradie v packu. */
export type Krok = {
  slug: 'vstup-sablona' | 'kontext-prompt' | 'automatizacia' | 'agent' | 'vlastnik';
  pozorovanie: string;
  krok: string;
  dovod: string;
};

export const KROKY: Krok[] = [
  {
    slug: 'vstup-sablona',
    pozorovanie: 'Zadanie býva nejasné, dáta sú dostupné.',
    krok: 'Lepší vstup a pracovná šablóna.',
    dovod: 'Integrácia nevyrieši nejasný cieľ.',
  },
  {
    slug: 'kontext-prompt',
    pozorovanie: 'Rovnaký textový výsledok vzniká opakovane.',
    krok: 'Kontext + prompt/skill + kontrola.',
    dovod: 'Lacný a ľahko overiteľný prvý úsek.',
  },
  {
    slug: 'automatizacia',
    pozorovanie: 'Stabilný prenos medzi nástrojmi.',
    krok: 'Jednoduchá automatizácia.',
    dovod: 'Predvídateľné pravidlá nepotrebujú autonómne plánovanie.',
  },
  {
    slug: 'agent',
    pozorovanie: 'Treba vyberať kroky podľa kontextu.',
    krok: 'Agent s ohraničenými nástrojmi a oprávneniami.',
    dovod: 'Má dôvod rozhodovať o postupe.',
  },
  {
    slug: 'vlastnik',
    pozorovanie: 'Nikto nevlastní dáta alebo výsledok.',
    krok: 'Najprv určiť vlastníka a kritérium.',
    dovod: 'Inak by sme automatizovali neistotu.',
  },
];

export function krokBySlug(slug: string): Krok | undefined {
  return KROKY.find((k) => k.slug === slug);
}

/** Segmenty z verejnej ponuky packu 04 („Je to vhodné pre autora s poznámkami, človeka skladajúceho viac nástrojov
 *  aj firmu, ktorá uvažuje o agentovi.“). `slug` = query `kto=<slug>` pre /konzultacia/. */
export type Segment = {
  slug: 'autor' | 'nastroje' | 'firma';
  label: string;
};

export const SEGMENTY: Segment[] = [
  { slug: 'autor', label: 'Autor s poznámkami' },
  { slug: 'nastroje', label: 'Človek skladajúci viac nástrojov' },
  { slug: 'firma', label: 'Firma, ktorá uvažuje o agentovi' },
];

export function segmentBySlug(slug: string): Segment | undefined {
  return SEGMENTY.find((s) => s.slug === slug);
}

/** Vzorec ročnej straty (spec 05 §3): hodiny týždenne × 46 týždňov × hodinová sadzba. */
export const TYZDNOV_ROCNE = 46;
