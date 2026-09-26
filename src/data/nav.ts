/** Hlavná navigácia v6 (26. 9. 2026, rozhodnutie 25. 9.: web je hlavný web a obchod — predajný aj cool).
 *  Poradie = zákaznícka cesta: čo ponúkam → čím to dokazujem → čo si vyskúšaš → čo čítaš → produkt → vstup.
 *  KONZULTÁCIA je samostatné CTA tlačidlo v hlavičke (NAV_CTA), nie položka zoznamu. */
export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: '/#ponuka', label: 'PONUKA' },
  { href: '/#postavil', label: 'DÔKAZY' },
  { href: '/kviz/', label: 'KVÍZ' },
  { href: '/hry/', label: 'HRY' },
  { href: '/texty/', label: 'TEXTY' },
  { href: '/makleri/', label: 'MAKLÉRI' },
];

/** Hlavné CTA hlavičky a mobilného menu. */
export const NAV_CTA: NavItem = { href: '/konzultacia/', label: 'KONZULTÁCIA' };

/** Cesta bez kotvy („/#ponuka“ → „/“) — na route lookup a aria-current. */
export function navPath(href: string): string {
  return href.split('#')[0] || '/';
}

/** Položky ⌘K palety a pätičky: domov + nav + nástroj Skóre webu + konzultácia. */
export const COMMAND_ITEMS: NavItem[] = [
  { href: '/', label: 'DOMOV' },
  ...NAV,
  { href: '/skore/', label: 'SKÓRE WEBU' },
  NAV_CTA,
];
