/** Ponuka V5 (V5.3 XDR-267: konzultácia = vyšetrenie, čakačka = čakáreň, bez pastelov; XDR-209, dohoda 26. 9. 2026): vlajka = konzultácia 30 min, produkty ako čakačky („Chcem vedieť ako prvý“).
 *  Ceny zatiaľ nie sú (rebríček produktov rieši Adam neskôr); keď budú, pribudne cenník v tvare troch stĺpcov (vzor Nexana).
 *  Termíny a rozsah produktov sú z popisu XDR-209; jadro ich zatiaľ nemá (štart kohorty v januári, „Agent pre teba“ 90 dní). */

export type Produkt = {
  id: string;
  nazov: string;
  /** krátka nálepka (termín, formát) */
  nalepka: string;
  pre: string;
  popis: string;
  body: string[];
  farba: 'bg-yellow' | 'bg-white' | 'bg-paper';
};

export const VLAJKA = {
  nazov: 'Vyšetrenie',
  trvanie: '30 minút',
  cena: 'Zatiaľ zadarmo',
  titulok: 'Prídeš s problémom. Odídeš s diagnózou a plánom liečby.',
  body: [
    'Triáž: jedna úloha z tvojej práce, čo sa opakuje a kde sa stráca čas.',
    'Diagnóza: vhodný postup ukážem na bezpečnej vzorke.',
    'Plán liečby: písomný ďalší krok. Ak treba niečo postaviť, pripravím rozsah a cenu.',
  ],
};

export const PRODUKTY: Produkt[] = [
  {
    id: 'kohorta',
    nazov: 'Postav si prvého agenta',
    nalepka: 'Kohorta · štart v januári',
    pre: 'Pre neprogramátorov',
    popis: 'Skupina, ktorá za pár týždňov postaví vlastného agenta na vlastnej úlohe. Po slovensky, od človeka, ktorý sám nebol programátor.',
    body: ['po slovensky', 'vlastná úloha, nie cvičenie', 'agent, ktorý ti ostane'],
    farba: 'bg-yellow',
  },
  {
    id: 'agent-pre-teba',
    nazov: 'Agent pre teba',
    nalepka: 'Telegram · 90 dní',
    pre: 'Pre živnostníka a malú firmu',
    popis: 'Postavím ti agenta, s ktorým sa bavíš cez Telegram, a 90 dní ho so mnou ladíš na tvojej práci.',
    body: ['agent cez Telegram', '90 dní ladenia', 'tvoje dáta ostávajú tvoje'],
    farba: 'bg-white',
  },
  {
    id: 'harness-kit',
    nazov: 'Harness kit',
    nalepka: 'Balík na stiahnutie',
    pre: 'Pre toho, kto už používa Claude Code',
    popis: 'Moje pravidlá, skills a kontrakty pre agentov, s ktorými denne pracujem. Skopíruješ a upravíš.',
    body: ['pravidlá pre agentov', 'hotové skills', 'návod po slovensky'],
    farba: 'bg-white',
  },
  {
    id: 'webinar',
    nazov: 'Claude Code po slovensky',
    nalepka: 'Webinár',
    pre: 'Pre neprogramátorov',
    popis: 'Ako pracovať s Claude Code, keď nie si programátor. Naživo, na skutočnej úlohe, s otázkami.',
    body: ['naživo', 'od nuly', 'na skutočnej úlohe'],
    farba: 'bg-yellow',
  },
];

/** Lákadlo za e-mail (XDR-211). Obsah pripraví agent z Adamových materiálov, Adam schváli — do schválenia sa
 *  e-mail zapíše do čakačky „lakadlo“ a potvrdenie sľúbi doručenie, keď bude návod hotový. */
export const LAKADLO = {
  id: 'lakadlo-prvy-agent',
  nazov: 'Prvý agent za večer',
  popis: 'Krátky návod po slovensky: jedna úloha, jeden prompt, jeden agent. Pošlem ti ho e-mailom, keď ho dopíšem.',
  stav: 'pripravujem',
};

export const NEWSLETTER = {
  id: 'newsletter',
  nazov: 'Vydanie',
  popis: 'Raz za týždeň text o AI po slovensky: čo som postavil, čo nefungovalo, čo z toho plynie.',
};

/** Blok „prečo nie iba ChatGPT“ (vzor Nexana). */
export const PRECO_NIE_CHATGPT: { chat: string; agent: string }[] = [
  { chat: 'Odpovie a zabudne. Zajtra začínaš odznova.', agent: 'Má chorobopis: pamätá si tvoje pravidlá, kontakty, históriu.' },
  { chat: 'Čaká, kým mu napíšeš.', agent: 'Koná sám: pošle follow-up, zapíše kontakt, dá vedieť.' },
  { chat: 'Vidí iba to, čo doňho skopíruješ.', agent: 'Pracuje priamo v tvojich nástrojoch: kalendár, CRM, e-mail.' },
  { chat: 'Výsledok je text na obrazovke.', agent: 'Výsledok je hotová vec: termín, záznam, odoslaná správa.' },
];

/** Povolené zdroje zápisu (API /api/zapis/ overuje proti tomuto zoznamu). */
export const ZAPIS_ZDROJE = ['cakacka', 'lakadlo', 'newsletter'] as const;
export type ZapisZdroj = (typeof ZAPIS_ZDROJE)[number];
export const ZAPIS_PRODUKTY = [...PRODUKTY.map((p) => p.id), LAKADLO.id, NEWSLETTER.id];
