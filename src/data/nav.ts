/** Hlavná navigácia V5 (26. 9. 2026): menu v jednom riadku, predajné sekcie domova + texty a hry.
 *  Makléri, kvíz a skóre webu ostávajú na svojich URL, z menu ustúpili (sú v pätičke a v ⌘K).
 *  Konzultácia nie je položka menu, ale stále tlačidlo (KONZULTACIA_CTA). */
export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: '/#kto-som', label: 'KTO SOM' },
  { href: '/#dokazy', label: 'DÔKAZY' },
  { href: '/#ponuka', label: 'PONUKA' },
  { href: '/texty/', label: 'TEXTY' },
  { href: '/hry/', label: 'HRY' },
];

/** Stále tlačidlo „Konzultácia“ (hot): na domove skočí na rezerváciu v sekcii, inde na /konzultacia/#termin. */
export const KONZULTACIA_CTA = { label: 'Konzultácia', href: '/konzultacia/#termin', hrefDomov: '#konzultacia' };

/** Ďalšie stránky, ktoré z menu ustúpili, ale žijú (pätička, ⌘K). */
export const DALSIE: NavItem[] = [
  { href: '/makleri/', label: 'MAKLÉRI' },
  { href: '/kviz/', label: 'KVÍZ' },
  { href: '/skore/', label: 'SKÓRE WEBU' },
  { href: '/konzultacia/', label: 'KONZULTÁCIA' },
];

/** Položky ⌘K palety: domov + menu + ďalšie stránky. */
export const COMMAND_ITEMS: NavItem[] = [{ href: '/', label: 'DOMOV' }, ...NAV, ...DALSIE];
