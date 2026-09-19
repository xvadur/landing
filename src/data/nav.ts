/** Hlavná navigácia (spec 05 §4, Chrome.jsx NAV). Poradie je záväzné. */
export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: '/hry/', label: 'HRY' },
  { href: '/kviz/', label: 'KVÍZ' },
  { href: '/skore/', label: 'SKÓRE WEBU' },
  { href: '/texty/', label: 'TEXTY' },
  { href: '/makleri/', label: 'MAKLÉRI' },
  { href: '/konzultacia/', label: 'KONZULTÁCIA' },
];

/** Položky ⌘K palety: nav + domov + priama cesta na konzultáciu. */
export const COMMAND_ITEMS: NavItem[] = [
  { href: '/', label: 'DOMOV' },
  ...NAV,
];
