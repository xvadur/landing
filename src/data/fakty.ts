/** Overené čísla pre web. Každý záznam má zdroj, nič iné sa na web nedáva.
 *  Zdroje (názvy dokumentov, nie cesty — dokumenty žijú mimo repa, v repe platí tento súbor):
 *   spec05  = špecifikácia webu v4 (18. 9. 2026), §2 bod 3 „Čo som postavil“
 *   doc10   = výber knižníc a komponentov v4 (zákon dizajnu, dnes zhrnutý v STACK.md), §3 #7 marquee
 *   pack13  = launch pack „Neviditeľný maklér“ (15. 9. 2026), §1
 *   jadro   = register diela a fakty v jadre XVADUR (xvadur_core, stav 24. 9. 2026)
 *   korpus  = Korpus v2 (adam.xvadur), tabuľka `days`, snímka 26. 9. 2026 večer
 *  Odkazy: len tie, ktoré vrátili HTTP 200 (curl, dátum pri odkaze). senior.xvadur.com a gramata.xvadur.com
 *  26. 9. 2026 neodpovedajú → bez odkazu (url: null).
 *
 *  ROZPORY (XDR-200, čaká na Adama) — na webe ostáva dnešné znenie, kým Adam nerozhodne:
 *   1. Dĺžka praxe: web hovorí „10 rokov“ (hero veta, marquee, beat 4 a 6, nálepka). Jadro: v zdravotníctve
 *      necelých 8 rokov (7/2017 – 7/2025), z toho v nemocniciach asi 4,5 roka.
 *   2. Rola: web „pomocný pracovník v zdravotníctve“ (beat 4). Jadro: v DSS opatrovateľ, v nemocniciach PPVZ
 *      (sanitár); sestra až od maturity 26. 5. 2026. Inde o sebe „zdravotná sestra“.
 *   3. „Vyhodili“ vs. „odišiel“: web „Po desiatich rokoch ma vyhodili“ (beat 6, jún 2025). Jadro: podal výpoveď,
 *      posledný deň 1. 7. 2025; sám to často nazýva „vyhodili ma“.
 *   4. Začiatok s AI / kódom: jadro — denná práca s AI od 1. 1. 2025, kódové prostredie (IDE) okolo 11/2025.
 *      Web dátum nemá (beat 5 „1 notebook“), rozpor sa webu netýka, kým sa dátum nepridá.
 *   5. Netopier: 397 prepisov a 2,3 mil. slov (spec05) patria podľa jadra korpusu cudzích prepisov, nie Netopieru;
 *      web ich dnes pripisuje Netopieru.
 *   6. 47 / 47 = „47 zo 47 kontrol pred vydaním“, nie „beží v prevádzke“ (jadro: gate NO_GO pre kalendár od 6. 8.).
 */

export type Fakt = {
  /** krátky názov karty / položky */
  label: string;
  /** hodnota tak, ako sa má vypísať (so slovenskými medzerami tisícov) */
  value: string;
  /** jeden riadok pod hodnotou */
  note: string;
  /** zdrojový dokument */
  source: 'spec05' | 'doc10' | 'pack13' | 'jadro' | 'korpus';
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
    // ROZPOR 5 (XDR-200): prepisy a slová patria podľa jadra korpusu cudzích prepisov, nie Netopieru.
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
    // v4 karta (na domove V5 sa nepoužíva); 969 139 je staré číslo, aktuálne je KORPUS nižšie (XDR-266)
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
  // ROZPOR 1 (XDR-200): „10 rokov“ ostáva, jadro hovorí necelých 8 rokov v zdravotníctve.
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

/* ======================================================================================================
 * V5 (26. 9. 2026) — čísla pre hero, pred a po, izbu dôkazov. Rovnaké pravidlo: každé číslo má zdroj.
 * ==================================================================================================== */

/** Dátum poslednej kontroly odkazov a snímky korpusu. */
export const OVERENE_DNA = '2026-09-26';
export const OVERENE_DNA_TEXT = '26. 9. 2026';

export type ZiveCislo = { kluc: string; label: string; value: number; note: string; source: Fakt['source'] };

/** Živý pás v hero (XDR-205, XDR-266). Zdroj = verejný pulz Korpusu v2 (adam.xvadur, corpus/pulse.mjs): iba agregáty.
 *  Kým adam.xvadur.com/public/pulse.json nie je verejne dostupný (Access), web číta vlastnú snímku /pulse.json
 *  (public/pulse.json, obnoví `node scripts/pulse-snapshot.mjs` pri bežiacom démonovi). Tieto hodnoty = tá istá snímka
 *  ako statický fallback pre SSR. Kľúče = kľúče pulzu. */
export const ZIVE_CISLA_ZDROJ: string | null = '/pulse.json';
export const ZIVE_CISLA_SNIMKA = '26. 9. 2026 20:31';
export const ZIVE_CISLA: ZiveCislo[] = [
  { kluc: 'words_month', label: 'slov tento mesiac', value: 138921, note: 'napísané AI, september 2026', source: 'korpus' },
  { kluc: 'prompts_today', label: 'promptov dnes', value: 87, note: 'dnes do večera', source: 'korpus' },
  { kluc: 'streak_days', label: 'dní v rade', value: 65, note: 'každý deň aspoň jeden prompt', source: 'korpus' },
  { kluc: 'projects_active', label: 'bežiacich projektov', value: 6, note: 'projekty v stave rozpracované (Linear)', source: 'korpus' },
];

/** Korpus celkom (Korpus v2, iba napísané prompty, snímka 26. 9. 2026). Nahrádza staré 969 139 / 246 dní. */
export const KORPUS = { slova: '572 469', prompty: '7 869', od: 'januára 2026', kDatumu: OVERENE_DNA_TEXT };

/** Pás výsledkov pod „Pred a po“ (XDR-207). */
export const VYSLEDKY: Fakt[] = [
  { label: 'Kontroly pred vydaním', value: '47 / 47', note: 'systém pre makléra', source: 'spec05' },
  { label: 'Tabuľky v CRM', value: '23', note: 'vlastné CRM pre makléra', source: 'spec05' },
  { label: 'Makléri v datasete', value: '2 034', note: 'Bratislavský kraj', source: 'spec05' },
  { label: 'Ľudia v mape médií', value: '558', note: '10 redakcií', source: 'spec05' },
  { label: 'Tokeny', value: '16,3 mld.', note: 'verejne overené (Tokscale, 15. 9. 2026)', source: 'jadro' },
  { label: 'Vlastné slová', value: '572 469', note: 'Korpus, od januára 2026', source: 'korpus' },
];

export type Stitok = 'AI agent' | 'web' | 'dáta' | 'médiá';

export type Dokaz = {
  id: string;
  nazov: string;
  stitky: Stitok[];
  /** jedno číslo karty */
  cislo: string;
  /** čo to číslo je */
  cisloPopis: string;
  /** jeden riadok */
  riadok: string;
  /** obrázok v /public (webp), alebo null → karta ukáže typografický panel */
  obrazok: string | null;
  /** živý odkaz, len s overeným HTTP 200 (dátum v `overene`) */
  url: string | null;
  overene: string | null;
  /** stav karty: živé = odkaz funguje · interné = beží, ale nie je verejné · čoskoro = doména neodpovedá */
  stav: 'zive' | 'interne' | 'coskoro';
  /** text namiesto odkazu (doména / „za prihlásením“) */
  poznamka?: string;
};

/** Izba dôkazov (XDR-208). Poradie = poradie na webe. Mená klientov na webe nie sú (jadro: „mená iba so súhlasom“);
 *  prípadová štúdia makléra je bez mena a bez odkazu, kým Adam nepotvrdí súhlas. */
export const DOKAZY: Dokaz[] = [
  {
    id: 'system-pre-maklera',
    nazov: 'Systém pre makléra',
    stitky: ['AI agent', 'web', 'dáta'],
    cislo: '47 / 47',
    cisloPopis: 'kontrol pred vydaním', // ROZPOR 6: nie „beží“
    riadok: 'Web, rezervácie, CRM s 23 tabuľkami, follow-upy a Telegram pre makléra v Bratislave.',
    obrazok: null,
    url: null,
    overene: null,
    stav: 'interne',
    poznamka: 'prípadová štúdia nižšie',
  },
  {
    id: 'hriech',
    nazov: 'Hriech',
    stitky: ['médiá', 'web'],
    cislo: '59',
    cisloPopis: 'stránok mediálnej kritiky',
    riadok: 'Publikácia a mapa súvislostí: 10 redakcií, 558 ľudí.',
    obrazok: '/assets/dokazy/hriech.webp',
    url: 'https://hriech.xvadur.com/',
    overene: OVERENE_DNA,
    stav: 'zive',
  },
  {
    id: 'netopier',
    nazov: 'Netopier',
    stitky: ['AI agent', 'dáta', 'médiá'],
    cislo: '2,3 mil.',
    cisloPopis: 'slov v prepisoch', // ROZPOR 5
    riadok: 'Engine na sledovanie a overovanie mediálnych tvrdení. 397 prepisov.',
    obrazok: '/assets/media-ai.webp',
    url: null,
    overene: null,
    stav: 'interne',
    poznamka: 'backend Hriechu',
  },
  {
    id: 'terapeutka',
    nazov: 'Web pre terapeutku',
    stitky: ['web'],
    cislo: '2.',
    cisloPopis: 'oficiálny klient',
    riadok: 'Web s rezerváciami a vlastným publikovaním (Astro + Keystatic).',
    obrazok: '/assets/dokazy/terapeutka.webp',
    url: 'https://picung.xvadur.com/',
    overene: OVERENE_DNA,
    stav: 'zive',
    poznamka: 'demo',
  },
  {
    id: 'korpus',
    nazov: 'Korpus',
    stitky: ['dáta'],
    cislo: '572 469',
    cisloPopis: 'vlastných slov od januára 2026',
    riadok: 'Meranie vlastného písania: 7 869 promptov, každý deň, rytmus a slová.',
    obrazok: null,
    url: null,
    overene: null,
    stav: 'interne',
    poznamka: 'adam.xvadur.com, za prihlásením',
  },
  {
    id: 'trhovy-dataset',
    nazov: 'Trhový dataset',
    stitky: ['dáta'],
    cislo: '275 333',
    cisloPopis: 'textových blokov zo 441 webov',
    riadok: '739 realitných kancelárií, 2 034 maklérov v Bratislavskom kraji.',
    obrazok: null,
    url: null,
    overene: null,
    stav: 'interne',
  },
  {
    id: 'agentovy-system',
    nazov: 'Agentový systém',
    stitky: ['AI agent'],
    cislo: '947',
    cisloPopis: 'pracovných vlákien od mája 2026',
    riadok: '30 vlastných skillov, kontrakty pre agentov, 16,3 mld. tokenov (Tokscale, 15. 9. 2026).',
    obrazok: '/assets/billion-scale.webp',
    url: null,
    overene: null,
    stav: 'interne',
  },
  {
    id: 'vlastne-data',
    nazov: 'Vlastné zdravotné dáta',
    stitky: ['dáta'],
    cislo: '2 483 965',
    cisloPopis: 'záznamov',
    riadok: 'Vlastné zdravotné dáta 2018–2026 v jednej pipeline.',
    obrazok: null,
    url: null,
    overene: null,
    stav: 'interne',
  },
  {
    id: 'xvadur-com',
    nazov: 'Tento web',
    stitky: ['web'],
    cislo: 'V5',
    cisloPopis: 'piata verzia',
    riadok: 'Astro, React ostrovy, Cloudflare Worker. Postavené s AI, riadené človekom.',
    obrazok: null,
    url: 'https://xvadur.com/',
    overene: OVERENE_DNA,
    stav: 'zive',
  },
  {
    id: 'senior-atlas',
    nazov: 'Senior atlas',
    stitky: ['dáta', 'web'],
    cislo: '1 553',
    cisloPopis: 'služieb pre seniorov v 79 okresoch',
    riadok: 'Mapa služieb pre seniorov na celom Slovensku.',
    obrazok: '/assets/senior-map.webp',
    url: null,
    overene: null,
    stav: 'coskoro',
    poznamka: 'senior.xvadur.com',
  },
  {
    id: 'gramata',
    nazov: 'gramata',
    stitky: ['dáta'],
    cislo: 'V2',
    cisloPopis: 'osobný dashboard',
    riadok: 'Osobný dashboard, druhá verzia.',
    obrazok: null,
    url: null,
    overene: null,
    stav: 'coskoro',
    poznamka: 'gramata.xvadur.com',
  },
];

/** Prípadová štúdia (XDR-208), šablóna „čo mal → čo dostal → čísla“. Bez mena klienta (súhlas čaká na Adama). */
export const PRIPAD_MAKLER = {
  kto: 'Maklér v Bratislave',
  mal: [
    'Dopyty cez telefón a všeobecný formulár, bez termínu v kalendári.',
    'Kontakty a obchody v hlave, poznámkach a správach.',
    'Follow-up iba vtedy, keď si spomenul.',
  ],
  dostal: [
    'Web s rezerváciou termínu ako prvým krokom.',
    'Vlastné CRM s 23 tabuľkami: kontakty, nehnuteľnosti, obchody.',
    'Automatické follow-upy e-mailom a upozornenia na Telegram.',
    'Kontrolný zoznam pred vydaním: 47 zo 47 kontrol prešlo.',
  ],
  cisla: [
    { value: '47 / 47', label: 'kontrol pred vydaním' },
    { value: '23', label: 'tabuliek v CRM' },
    { value: '2 034', label: 'maklérov v trhovom datasete' },
  ],
  /** jadro: kalendár hlási chybu prihlásenia od 6. 8., preto „pred vydaním“, nie „v prevádzke“ */
  stav: 'Pred vydaním. Čísla sú z kontrol, nie z prevádzky.',
} as const;
