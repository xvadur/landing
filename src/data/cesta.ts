/** Kto som V5.3 (XDR-267): cesta na prvé čítanie — nemocnica → vyhodili → AI → agenti → XVADUR.
 *  Fakty: jadro (01_pribeh/fakty.md, kronika.md) a dnešné znenie webu. Bez viet, ktoré znižujú (maturita, viera).
 *  ROZPOR 1 a 3 (XDR-200): „10 rokov“ a „vyhodili“ ostávajú v dnešnom znení, kým Adam nerozhodne (fakty.ts).
 *  Citát: Adam, 26. 9. 2026 (línia pre web). */
export type Krok = { kedy: string; nazov: string; text: string; citat?: string };

export const CESTA: Krok[] = [
  {
    kedy: '10 rokov',
    nazov: 'Nemocnica',
    text: 'Zmeny, pacienti, ľudia, ktorí sa nevedia zastať sami seba. Naučil som sa čítať, čo systém nevidí. Patril som k najlepším v celej nemocnici.',
  },
  {
    kedy: 'Jún 2025',
    nazov: 'Vyhodili ma',
    text: 'Po desiatich rokoch. Nie pre prácu, ale pre systém.',
    citat: 'Ja som tú prácu miloval a tá práca milovala mňa. Akurát že systém ma nenávidel.',
  },
  {
    kedy: '2025',
    nazov: 'AI',
    text: 'Každý deň od januára 2025. Na nočných službách som si postavil prvý vlastný systém práce s AI.',
  },
  {
    kedy: '2026',
    nazov: 'Agenti',
    text: 'Z rozhovorov sa stali agenti: robia prácu, ktorú by inak niekto nosil v hlave. Rezervácie, follow-upy, dáta, médiá.',
  },
  {
    kedy: 'Od marca 2026',
    nazov: 'XVADUR',
    text: 'Podnikám. Starám sa o firmy a ľudí, ktorých technológia obchádza alebo im ubližuje. Postup ako na zmene: príjem, diagnóza, liečba.',
  },
];
