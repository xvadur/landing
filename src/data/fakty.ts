/** Overené čísla pre web. Každý záznam má zdroj (dokument), nič iné sa na web nedáva.
 *  Zdroje:
 *   spec05  = xvadur_brand/xvadur_web_v4/05_WEB_V4_SPECIFIKACIA.md §2 bod 3 „Čo som postavil"
 *   doc10   = xvadur_brand/xvadur_web_v4/10_VYBER_KNIZNIC_A_KOMPONENTOV.md §3 #7 (marquee)
 *   pack13  = xvadur_brand/01_current_personal_brand/13_NEVIDITELNY_MAKLER_LAUNCH_2026-09-15.md §1
 *  Odkazy: len tie, ktoré 19. 9. 2026 vrátili HTTP 200 (curl). senior.xvadur.com a gramata.xvadur.com
 *  sa neresolvovali → bez odkazu (url: null). */

export type Fakt = {
  /** krátky názov karty / položky */
  label: string;
  /** hodnota tak, ako sa má vypísať (so slovenskými medzerami tisícov) */
  value: string;
  /** jeden riadok pod hodnotou */
  note: string;
  /** zdrojový dokument */
  source: 'spec05' | 'doc10' | 'pack13';
};

export type Projekt = {
  id: string;
  nazov: string;
  /** hlavné číslo karty */
  cislo: string;
  /** jeden riadok */
  riadok: string;
  /** všetky čísla projektu ako fakty */
  fakty: Fakt[];
  /** live odkaz, len ak vrátil 200 (overené 19. 9. 2026), inak null */
  url: string | null;
  /** čo zobraziť namiesto odkazu, keď url je null */
  domena?: string;
};

/** Sekcia „Čo som postavil" (spec05 §2.3) — poradie záväzné. */
export const POSTAVIL: Projekt[] = [
  {
    id: 'system-pre-maklera',
    nazov: 'Systém pre makléra',
    cislo: '47 / 47',
    riadok: 'Web, rezervácie, CRM s 23 tabuľkami, follow-upy, Telegram. 47 zo 47 kontrol pred vydaním.',
    fakty: [
      { label: 'Kontroly pred vydaním', value: '47 / 47', note: 'prešli všetky', source: 'spec05' },
      { label: 'Tabuľky v CRM', value: '23', note: 'vlastné CRM', source: 'spec05' },
    ],
    url: null,
  },
  {
    id: 'netopier',
    nazov: 'Netopier',
    cislo: '2,3 mil.',
    riadok: 'Engine na sledovanie a overovanie mediálnych tvrdení. Mapa 10 redakcií a 558 ľudí, 397 prepisov, 2,3 milióna slov.',
    fakty: [
      { label: 'Redakcie v mape', value: '10', note: 'mapa médií', source: 'spec05' },
      { label: 'Ľudia v mape', value: '558', note: 'redaktori a autori', source: 'spec05' },
      { label: 'Prepisy', value: '397', note: 'spracované prepisy', source: 'spec05' },
      { label: 'Slová', value: '2,3 milióna', note: 'v prepisoch', source: 'spec05' },
    ],
    url: null,
  },
  {
    id: 'hriech',
    nazov: 'Hriech',
    cislo: '59',
    riadok: 'Mediálna kritika, 59 stránok.',
    fakty: [{ label: 'Stránky', value: '59', note: 'hriech.xvadur.com', source: 'spec05' }],
    url: 'https://hriech.xvadur.com',
    domena: 'hriech.xvadur.com',
  },
  {
    id: 'senior-atlas',
    nazov: 'Senior atlas',
    cislo: '1 553',
    riadok: '79 okresov, 1 553 služieb pre seniorov.',
    fakty: [
      { label: 'Okresy', value: '79', note: 'celé Slovensko', source: 'spec05' },
      { label: 'Služby', value: '1 553', note: 'služby pre seniorov', source: 'spec05' },
    ],
    url: null,
    domena: 'senior.xvadur.com',
  },
  {
    id: 'gramata',
    nazov: 'gramata',
    cislo: 'V2',
    riadok: 'Osobný dashboard.',
    fakty: [],
    url: null,
    domena: 'gramata.xvadur.com',
  },
  {
    id: 'trhovy-dataset',
    nazov: 'Trhový dataset',
    cislo: '275 333',
    riadok: '739 realitných kancelárií, 2 034 maklérov, 275 333 textových blokov zo 441 webov.',
    fakty: [
      { label: 'Realitné kancelárie', value: '739', note: 'v trhovom datasete', source: 'spec05' },
      { label: 'Makléri', value: '2 034', note: 'Bratislavský kraj', source: 'spec05' },
      { label: 'Textové bloky', value: '275 333', note: 'zo 441 webov', source: 'spec05' },
      { label: 'Weby', value: '441', note: 'weby s textovými blokmi (prehľadaných 459)', source: 'spec05' },
    ],
    url: null,
  },
  {
    id: 'vlastne-data',
    nazov: 'Vlastné dáta',
    cislo: '2 483 965',
    riadok: '2 483 965 záznamov z vlastných zdravotných dát. 969 139 vlastných slov za 246 dní.',
    fakty: [
      { label: 'Záznamy', value: '2 483 965', note: 'vlastné zdravotné dáta', source: 'spec05' },
      { label: 'Vlastné slová', value: '969 139', note: 'za 246 dní', source: 'spec05' },
      { label: 'Dni', value: '246', note: 'písania', source: 'spec05' },
    ],
    url: null,
  },
  {
    id: 'agentovy-system',
    nazov: 'Agentový systém',
    cislo: '947',
    riadok: '30 vlastných skillov, kontrakty pre agentov, 947 pracovných vlákien od mája 2026.',
    fakty: [
      { label: 'Vlastné skilly', value: '30', note: 'pre agentov', source: 'spec05' },
      { label: 'Pracovné vlákna', value: '947', note: 'od mája 2026', source: 'spec05' },
    ],
    url: null,
  },
];

/** Marquee pás na domove (doc10 §3 #7): 459 webov · 2 034 maklérov · 47/47 · 10 rokov.
 *  459 = prehľadané realitné weby (pack13 §1 a Deň 2); 441 z nich malo textové bloky (spec05 §2.3) — preto karta Trhový dataset
 *  hovorí „zo 441 webov“ a marquee „459 webov“. Kraj sa v zdrojoch viaže len na 2 034 maklérov, nie na 739 kancelárií. */
export const MARQUEE_FAKTY: Fakt[] = [
  { label: 'Realitné weby', value: '459 webov', note: 'prehľadané realitné weby (pack13 §1, Deň 2)', source: 'doc10' },
  { label: 'Makléri', value: '2 034 maklérov', note: 'Bratislavský kraj', source: 'doc10' },
  { label: 'Kontroly', value: '47 / 47', note: 'systém pre makléra', source: 'doc10' },
  { label: 'Nemocnica', value: '10 rokov', note: 'zdravotníctvo', source: 'doc10' },
];

/** Trhové kotvy pre /skore/ a /makleri/ (pack13 §1). */
export const KOTVY = {
  kancelarieSFrazou: { value: 31, z: 47, note: 'kancelárií má v texte aspoň jednu zo 6 rodín fráz', source: 'pack13' as const },
  prvyKrokKontakt: { value: 267, z: 416, note: 'webov má prvý krok „Kontakt“ / telefón / všeobecný formulár (64 %)', source: 'pack13' as const },
  prvyKrokRezervacia: { value: 15, z: 416, note: 'webov ponúka rezerváciu termínu ako prvý krok (3,6 %)', source: 'pack13' as const },
  dokazNaWebe: { value: 96, z: 416, note: 'webov má použiteľný dôkaz (prípad, nie „20 rokov“)', source: 'pack13' as const },
  makleriPodLogom: { value: 2006, z: 2034, note: 'maklérov existuje online len ako riadok pod logom kancelárie', source: 'pack13' as const },
  webyBezVety: { value: 0, z: 459, note: 'výskytov vety „jeden človek + celý aparát“', source: 'pack13' as const },
};

/** Ploché pole všetkých čísel (na marquee, štatistiky, testy). */
export const FAKTY: Fakt[] = [...POSTAVIL.flatMap((p) => p.fakty), ...MARQUEE_FAKTY];
