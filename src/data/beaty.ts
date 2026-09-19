/** „Kto som" — 7 beatov verbatim zo spec 05 §2 bod 2 [A, 18. 9.]. Ratifikované 19. 9.: všetkých 7 ide na web,
 *  ako mechanizmus, nie krivda, bez mien ľudí a inštitúcií. Text sa nemení.
 *  `rok` a `text` sú verbatim; `titulok` je pri beatoch 1 a 4 prvé slovo zo spec („Elektrotechnik", „Nemocnica"),
 *  pri ostatných krátky štítok zložený zo slov toho istého beatu (žiadny nový obsah). */
export type Beat = { rok: string; titulok: string; text: string };

export const BEATY: Beat[] = [
  {
    rok: '17',
    titulok: 'Elektrotechnik',
    text: 'Pred štvrtým ročníkom ma vyhodili z domu. Uveril som v Boha a s ním som sa naučil učiť sa. Zmaturoval som dobre.',
  },
  {
    rok: '18',
    titulok: 'Domov seniorov',
    text: 'Nastúpil som do domova seniorov. Chcel som sa dokázať.',
  },
  {
    rok: 'Jung',
    titulok: 'Psychológia cez Junga',
    text: 'Zistil som, čo je manipulácia a čo je sekta. Odišiel som a študoval psychológiu cez Junga.',
  },
  {
    rok: '10 rokov',
    titulok: 'Nemocnica',
    text: 'Pomocný pracovník v zdravotníctve, 1 500 € za 18 služieb mesačne. Popri tom pokusy o medicínu, druhá zdravotnícka škola, v roku 2026 maturita praktickej sestry.',
  },
  {
    rok: '1 notebook',
    titulok: 'Hra s AI',
    text: 'Notebook, na ktorom som sa začal hrať s AI. Z hry sa stal biznis cez agentov.',
  },
  {
    rok: 'Jún 2025',
    titulok: 'Po desiatich rokoch',
    text: 'Po desiatich rokoch ma vyhodili, hoci som patril k najlepším v celej nemocnici. Od marca 2026 podnikám.',
  },
  {
    rok: 'XVADUR',
    titulok: 'Staviam systémy',
    text: 'Staviam systémy pre ľudí, ktorí ich potrebujú, a všetko ukazujem: vstup, postup, výsledok aj to, čo treba opraviť.',
  },
];

/** Koniec časovej osi (spec 05): „CELÝ PRÍBEH" → /texty/ */
export const BEATY_CTA = { label: 'CELÝ PRÍBEH', href: '/texty/' };
