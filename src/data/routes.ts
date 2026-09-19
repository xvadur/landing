/** Všetky plánované cesty webu — jediný zdroj pre OG karty (src/pages/og/[slug].png.ts),
 *  sitemap a title/description v Base.astro. Slug = názov PNG v /og/<slug>.png. */
export type Route = {
  path: string;
  slug: string;
  title: string;
  description: string;
  /** noindex stránky (napr. /makleri/plan/) */
  noindex?: boolean;
};

export const ROUTES: Route[] = [
  {
    path: '/',
    slug: 'domov',
    title: 'Adam Rudavský — XVADUR',
    description:
      'Vysvetľujem AI, staviam agentové systémy a nástroje, ukazujem ako. Hry, kvíz, texty, konzultácia.',
  },
  {
    path: '/makleri/',
    slug: 'makleri',
    title: 'Neviditeľný maklér — XVADUR',
    description: '7 dní, po ktorých vás klient nájde bez loga kancelárie.',
  },
  {
    path: '/makleri/plan/',
    slug: 'makleri-plan',
    title: 'Neviditeľný maklér — plán Deň 1–8',
    description: 'Sedem úloh, sedem vecí, ktoré budú existovať. Deň 8 je zadarmo.',
    noindex: true,
  },
  {
    path: '/kviz/',
    slug: 'kviz',
    title: 'Ako pripravený si na AI? — XVADUR',
    description: 'Kvíz pre malú firmu: čo sa opakuje, koľko to stojí a aký je prvý krok.',
  },
  {
    path: '/skore/',
    slug: 'skore',
    title: 'Skóre webu makléra — XVADUR',
    description: 'Vložte URL. Zistíte, koľko z vášho webu by mohlo byť kohokoľvek.',
  },
  {
    path: '/hry/',
    slug: 'hry',
    title: 'Hry — XVADUR',
    description: 'Škrtací test, Miliarda → bilión, Strach-o-meter. Veci, ktoré si vyskúšate namiesto brožúry.',
  },
  {
    path: '/hry/skrtaci-test/',
    slug: 'skrtaci-test',
    title: 'Škrtací test — XVADUR',
    description: 'Vložte svoj text. Škrtneme frázy, ktoré má každý. Prečítajte, čo zostalo.',
  },
  {
    path: '/konzultacia/',
    slug: 'konzultacia',
    title: 'Konzultácia — XVADUR',
    description: 'Prines jednu úlohu. Pozrieme sa, čo s ňou dokáže AI. Bezplatný úvod, 30 minút.',
  },
  {
    path: '/texty/',
    slug: 'texty',
    title: 'Texty — XVADUR',
    description: 'Texty o AI po slovensky. Vydanie — týždenný text na Substacku.',
  },
  {
    path: '/texty/co-zostane-ked-zavriem-chat/',
    slug: 'co-zostane-ked-zavriem-chat',
    title: 'Čo zostane, keď zavriem chat — XVADUR',
    description:
      'AI mi otvorila cestu od poznámok k vlastným systémom. Rozhodujúce bolo, keď sa práca prestala končiť odpoveďou. Text z 11. 9. 2026.',
  },
];

export function routeByPath(path: string): Route | undefined {
  return ROUTES.find((r) => r.path === path);
}

export function ogUrlFor(path: string): string {
  const r = routeByPath(path);
  return `/og/${r ? r.slug : 'default'}.png`;
}
