/** Ponuka domova v6 (#ponuka) — 26. 9. 2026, rozhodnutie 25. 9.: web je hlavný web a obchod, zameraný na AI agentov
 *  a konzultácie. Každá karta odpovedá na tri otázky, ktoré Adam vyžaduje od každej AI ponuky (extrakcia „Rozčúlenie
 *  v chate“, work/media_business_extraction.md): ČO TO JE · KDE BEŽÍ · ČO TI OTVORÍ — mechanizmus, nie „robím AI“.
 *  Ceny sa neuvádzajú (pack 04: „pripravím samostatný rozsah a cenu“ po zmapovaní úlohy). Register: domov tyká. */

export type PonukaKarta = {
  id: string;
  cislo: string;
  nazov: string;
  preKoho: string;
  co: string;
  kde: string;
  otvori: string;
  priklad: { label: string; href: string };
  bg: 'bg-yellow' | 'bg-pink' | 'bg-sky';
};

export const PONUKA: PonukaKarta[] = [
  {
    id: 'agent',
    cislo: '01',
    nazov: 'AI agent, ktorý odpovedá a zapisuje',
    preKoho: 'Prax, kancelária alebo obchod, kde sa dopyty strácajú v telefóne a v e-mailoch.',
    co: 'Asistent na webe, v chate alebo na telefóne. Odpovie klientovi z tvojich podkladov, ponúkne termín, zapíše ho do kalendára aj do CRM a pošle potvrdenie s pripomienkou.',
    kde: 'Na tvojich nástrojoch: kalendár, e-mail, WhatsApp alebo Telegram. Logika v n8n alebo v Cloudflare Workeri, každý krok zapísaný v logu.',
    otvori: 'Nikto nečaká na odpoveď do rána a ty nič neprepisuješ. Vidíš, čo agent povedal a čo urobil, a vieš ho kedykoľvek zastaviť.',
    priklad: { label: 'Rezervácie a CRM v systéme pre makléra', href: '#postavil' },
    bg: 'bg-yellow',
  },
  {
    id: 'web',
    cislo: '02',
    nazov: 'Web a systém, ktorý ťa predáva sám',
    preKoho: 'Maklér, terapeut, remeselník — ktokoľvek, kto dnes existuje len ako riadok pod cudzím logom.',
    co: 'Rýchly web na vlastnej doméne, jasný prvý krok (termín, nie „Kontakt“), vlastné CRM a follow-upy. Texty bez prázdnych fráz — škrtám ich rovnakým testom, aký si tu môžeš spustiť.',
    kde: 'Astro a Cloudflare, dáta v Supabase s prístupovými pravidlami. Doménu, kód aj dáta vlastníš ty.',
    otvori: 'Klient ťa nájde a objedná sa bez sprostredkovateľa. Každý dopyt má stopu: odkiaľ prišiel, čo chcel a čo sa s ním stalo.',
    priklad: { label: 'Dva klientske weby naživo', href: '#postavil' },
    bg: 'bg-pink',
  },
  {
    id: 'automatizacia',
    cislo: '03',
    nazov: 'Automatizácia toho, čo robíš každý týždeň ručne',
    preKoho: 'Firma alebo autor, kde sa rovnaká práca opakuje: prepisy, tabuľky, e-maily, reporty.',
    co: 'Zmapujem jeden opakovaný proces — vstup, kroky, rozhodnutie, výsledok — a postavím najmenšie riešenie, ktoré ho zoberie: šablónu, skill, jednoduchú automatizáciu alebo agenta s kontrolou človeka.',
    kde: 'n8n, skripty a agenti pod dohľadom. Kritický výsledok vždy prejde človekom, nič neodchádza bez kliku.',
    otvori: 'Hodiny týždenne späť. Koľko presne, ti za tri minúty spočíta kvíz.',
    priklad: { label: 'Spočítať, koľko ťa stojí opakovanie', href: '/kviz/' },
    bg: 'bg-sky',
  },
];

/** Riadok pod kartami: ako sa začína a ako sa platí (pack 04). */
export const PONUKA_CENA = {
  text: 'Začíname bezplatnou konzultáciou: 30 minút, jedna tvoja úloha. Cenu a rozsah dostaneš písomne až po zmapovaní — nie z cenníka.',
  cta: { label: 'Bezplatná konzultácia', href: '/konzultacia/' },
};

/** Ako pracujem — tri kroky (nadpis „Rozmýšľam. Staviam. Ukazujem.“ ostáva z v4, texty prepísané na proces). */
export type KrokPrace = { cislo: string; sloveso: string; text: string; odkaz: { label: string; href: string }; bg: 'bg-white' | 'bg-lime' | 'bg-lilac' };
export const KROKY_PRACE: KrokPrace[] = [
  {
    cislo: '01',
    sloveso: 'Rozmýšľam',
    text: 'Tridsať minút, jedna tvoja úloha. Odkiaľ prichádzajú údaje, čo sa opakuje, kto rozhoduje. Odídeš s mapou vstup → kroky → rozhodnutie → výsledok a s písomným ďalším krokom.',
    odkaz: { label: 'Ako prebieha 30 minút', href: '/konzultacia/#priebeh' },
    bg: 'bg-white',
  },
  {
    cislo: '02',
    sloveso: 'Staviam',
    text: 'Najmenšie užitočné riešenie na tvojich nástrojoch. Žiadny white-label softvér, žiadny generický funnel. Kritický výsledok kontroluje človek, nie model.',
    odkaz: { label: 'Voľba najmenšieho riešenia', href: '/konzultacia/#riesenie' },
    bg: 'bg-lime',
  },
  {
    cislo: '03',
    sloveso: 'Ukazujem',
    text: 'Log, audit, čo funguje a čo treba opraviť — aj tu na webe, pri každom projekte. Odovzdám s návodom, aby si to vedel prevádzkovať sám.',
    odkaz: { label: 'Dôkazy s riadkom „čo treba opraviť“', href: '#postavil' },
    bg: 'bg-lilac',
  },
];

/** Nástroje namiesto brožúry (#nastroje). Popisy = description z routes.ts (jeden zdroj), tu len poradie a farby. */
export type Nastroj = { path: '/hry/skrtaci-test/' | '/kviz/' | '/skore/'; nazov: string; bg: 'bg-yellow' | 'bg-white' | 'bg-pink' };
export const NASTROJE: Nastroj[] = [
  { path: '/hry/skrtaci-test/', nazov: 'Škrtací test', bg: 'bg-yellow' },
  { path: '/kviz/', nazov: 'Ako pripravený si na AI?', bg: 'bg-white' },
  { path: '/skore/', nazov: 'Skóre webu makléra', bg: 'bg-pink' },
];

/** Pre koho — pilulky v hero. */
export const PRE_KOHO = ['Maklér', 'Terapeut', 'Autor', 'Malá firma', 'Živnostník'];

/** Odber (#vydanie): e-mail → /api/odber. Lákadlo za e-mail (rozhodnutie 25. 9.: prompt / návod / video) je placeholder —
 *  kým je `magnet.nazov` prázdny, sekcia sľubuje len to, čo existuje: prvý mail = text „Čo zostane, keď zavriem chat“. */
export const ODBER = {
  eyebrow: 'Vydanie / E-mail',
  nadpis: 'Jeden text o AI týždenne. Po slovensky.',
  text: 'Čo práve staviam, čo sa pokazilo a čo z toho zostane. Bez prázdnych fráz, bez spamu, odhlásenie jedným klikom.',
  prvyMail: { label: 'Ako prvé ti pošlem text', nazov: 'Čo zostane, keď zavriem chat', href: '/texty/co-zostane-ked-zavriem-chat/' },
  magnet: { nazov: '', popis: '', url: '' },
  substack: 'https://substack.com/@xvadur',
  cta: 'Chcem to',
  /** kam vedie fallback, keď API nie je nastavené */
  email: 'adam@xvadur.com',
};

export function magnetReady(): boolean {
  return ODBER.magnet.nazov.trim().length > 0 && ODBER.magnet.url.trim().length > 0;
}
