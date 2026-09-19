/** Landing /makleri/ — copy VERBATIM z packu 13 §3 (xvadur_brand/01_current_personal_brand/13_NEVIDITELNY_MAKLER_LAUNCH_2026-09-15.md).
 *  Nič sa neparafrázuje; poradie blokov je poradie packu. Čísla v texte sú čísla packu. */

export const LANDING = {
  hero: {
    eyebrow: 'XVADUR / PRE MAKLÉROV',
    h1: ['NEVIDITEĽNÝ', 'MAKLÉR.'],
    sub: [
      '31 zo 47 bratislavských realitiek používa v texte tie isté frázy.',
      '2 006 z 2 034 maklérov existuje online len pod logom kancelárie.',
      'Ak ste jeden z nich, klient vás nenájde. Nájde kanceláriu.',
    ],
    cta: 'CHCEM PLÁN — 9 €',
  },
  coDostanete: {
    eyebrow: 'ČO DOSTANETE',
    h2: '7 DNÍ. 7 ÚLOH. 7 VECÍ, KTORÉ BUDÚ EXISTOVAŤ.',
    body: [
      { n: '01', text: 'Škrtací test — čo zostane z vášho textu bez fráz, ktoré má každý' },
      { n: '02', text: 'Jedna veta, ktorú v 459 weboch nemá nikto' },
      { n: '03', text: 'Stránka, kde ste prvý vy, nie logo' },
      { n: '04', text: 'Prvý dôkaz namiesto „20 rokov skúseností“' },
      { n: '05', text: 'Video na tému, ktorú si pozrie aj človek, čo nepredáva' },
      { n: '06', text: 'Prvý krok, ktorý nie je tlačidlo „Kontakt“' },
      { n: '07', text: 'Test za 5 € a štyri čísla, ktoré vám povedia, či to funguje' },
    ],
    den8: 'Deň 8 je zadarmo a je o tom, čo robiť, keď to začne fungovať.',
  },
  precoJa: {
    eyebrow: 'PREČO JA',
    h2: 'NEHÁDAM. ZMERAL SOM TO.',
    text:
      '459 realitných webov. 275-tisíc textových blokov. 1 266 reklamných záznamov. 2 034 maklérov Bratislavského kraja. Jednému z nich som postavil systém, ktorý mu drží dopyty. Desať rokov predtým som držal zmeny na urgente — tam sa tiež nikto s nikým nerozprával a niekto to musel držať v hlave.',
  },
  coToNieJe: {
    eyebrow: 'ČO TO NIE JE',
    text: 'Nie je to kurz. Nie je to garancia. Je to sedem konkrétnych vecí, ktoré 31 zo 47 kancelárií neurobilo.',
  },
  foot: {
    cta: 'CHCEM PLÁN — 9 €',
    text: 'Platba cez Stripe. Stránka sa otvorí hneď.',
    otazky: 'Otázky:',
  },
} as const;

/** Produkt (pack §2, hlavička). */
export const PRODUKT = {
  nazov: 'NEVIDITEĽNÝ MAKLÉR',
  podtitul: '7 dní, po ktorých vás klient nájde bez loga kancelárie.',
  cena: '9 € jednorazovo',
  format: 'jedna neverejná stránka na xvadur.com s Dňom 1–8 + PDF export. Žiadne prihlásenie, žiadny e-mailový kurz. Stripe Payment Link → presmerovanie na stránku → hotovo.',
  /** Prvé dve vety formátu (pack §2) — na landingu, kým Stripe nebeží (tretia veta sľubuje Stripe presmerovanie). */
  formatBezPlatby: 'jedna neverejná stránka na xvadur.com s Dňom 1–8 + PDF export. Žiadne prihlásenie, žiadny e-mailový kurz.',
  preKoho: 'maklér v kancelárii alebo sólo, Bratislava a okolie, telefón + kalendár, žiadne CRM, „mám dopyty, ale nikto ma nepozná po mene“.',
} as const;
