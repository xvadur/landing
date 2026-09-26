/** Dôkazy domova v6 („Čo som postavil“, #postavil) — 26. 9. 2026.
 *  Každé číslo ide cez účtenku (src/data/uctenky.ts, koncept 13 §4): kľúč → hodnota, pečiatka, zdroj, dátum.
 *  Neznámy kľúč = chyba pri builde, kľúč označený „NIKDE“ = test padne (tests/projekty.test.mjs). V texte kariet
 *  nie je žiadne číslo, ktoré by nebolo zároveň v `fakty` alebo v `hlavne` — čísla sa nepíšu ručne.
 *  Odkazy: len domény, ktoré účtenka `postavil.web.*.status` eviduje s HTTP 200 (20. 9. 2026); meno klienta sa
 *  neuvádza (`kde: „doména je verejná; meno až po súhlase“`). fakty.ts ostáva zdrojom pre /makleri/ a /skore/ (KOTVY). */
import { formatHodnota, naWeb, uctenka, type Uctenka } from './uctenky.ts';

export type Ton = 'yellow' | 'white' | 'pink' | 'sky' | 'lime' | 'lilac' | 'paper';

export type Stav = {
  label: 'Naživo' | 'Beží' | 'V dielni' | 'Vypnuté' | 'Nástroj';
  /** farba nálepky (literálna trieda kvôli Tailwindu) */
  bg: 'bg-lime' | 'bg-yellow' | 'bg-sky' | 'bg-pink' | 'bg-white';
};

export type ProjektFakt = {
  label: string;
  /** kľúč účtenky */
  kluc: string;
};

export type Projekt = {
  id: string;
  nazov: string;
  /** pre koho / čo to je — jeden riadok pod názvom */
  preKoho: string;
  stav: Stav;
  /** veľké číslo karty */
  hlavne: ProjektFakt;
  /** jedna–dve vety: čo to je a prečo to je dôkaz (bez ručných čísel) */
  riadok: string;
  fakty: ProjektFakt[];
  /** čo treba opraviť — poctivý riadok (koncept: „ukazujem aj to, čo treba opraviť“) */
  oprava?: string;
  /** živý odkaz (len HTTP 200 podľa účtenky) alebo null */
  url: string | null;
  /** doména ako text (aj keď url je null) */
  domena?: string;
  /** interný odkaz (nástroj postavený nad projektom) */
  interny?: { href: string; label: string };
  bg: `bg-${Ton}`;
};

const NAZIVO: Stav = { label: 'Naživo', bg: 'bg-lime' };
const BEZI: Stav = { label: 'Beží', bg: 'bg-yellow' };
const DIELNA: Stav = { label: 'V dielni', bg: 'bg-sky' };
const VYPNUTE: Stav = { label: 'Vypnuté', bg: 'bg-pink' };
const NASTROJ: Stav = { label: 'Nástroj', bg: 'bg-white' };

/** Hodnota účtenky ako text (na skladanie viet v tomto súbore — číslo stále pochádza z účtenky). */
const h = (kluc: string) => formatHodnota(uctenka(kluc));

export const PROJEKTY: Projekt[] = [
  {
    id: 'makler',
    nazov: 'Web a systém pre makléra',
    preKoho: 'Realitný maklér v Bratislave · klient',
    stav: NAZIVO,
    hlavne: { label: 'tabuliek v CRM', kluc: 'postavil.makler.crm.tabulky' },
    riadok:
      'Web, rezervácia termínu, vlastné CRM s auditom každého kroku, follow-upy a Telegram. Maklér existuje na vlastnej doméne, nie ako riadok pod logom kancelárie.',
    fakty: [
      { label: 'Commity', kluc: 'postavil.makler.commity' },
      { label: 'Obdobie', kluc: 'postavil.makler.rozsah' },
      { label: 'Stránky', kluc: 'postavil.makler.stranky' },
      { label: 'Cloudflare Workers', kluc: 'postavil.makler.workers' },
      { label: 'Release audity', kluc: 'postavil.makler.audity' },
      { label: 'Pozorovania dev-labu', kluc: 'postavil.makler.devlab.pozorovania' },
    ],
    oprava: `Brána pred menovaným výsledkom je zatiaľ NO_GO: OAuth invalid_grant od ${h('postavil.makler.gate.od')}; ${h('postavil.makler.devlab.fail')} z ${h('postavil.makler.devlab.pozorovania')} pozorovaní dev-labu má stav fail.`,
    url: 'https://jakubolsa.sk',
    domena: 'jakubolsa.sk',
    bg: 'bg-yellow',
  },
  {
    id: 'terapeutka',
    nazov: 'Web pre terapeutku',
    preKoho: 'Individuálna prax · klientka',
    stav: NAZIVO,
    hlavne: { label: 'dni od prvého commitu po odovzdanie', kluc: 'postavil.terapeutka.dni' },
    riadok:
      'Web s troma variantmi vstupného wizardu, článkami, recenziami a FAQ. Postavený, nasadený a odovzdaný počas dvoch dní — git log je účtenka.',
    fakty: [
      { label: 'Obdobie stavby', kluc: 'postavil.terapeutka.rozsah' },
      { label: 'Commity', kluc: 'postavil.terapeutka.commity' },
      { label: 'Varianty wizardu', kluc: 'postavil.terapeutka.wizardVarianty' },
      { label: 'Články', kluc: 'postavil.terapeutka.clanky' },
      { label: 'Recenzie', kluc: 'postavil.terapeutka.recenzie' },
      { label: 'FAQ', kluc: 'postavil.terapeutka.faq' },
    ],
    url: 'https://picung.xvadur.com',
    domena: 'picung.xvadur.com',
    bg: 'bg-white',
  },
  {
    id: 'hriech',
    nazov: 'Hriech — mapa redakcií',
    preKoho: 'Vlastný projekt · mediálna kritika',
    stav: NAZIVO,
    hlavne: { label: 'osôb v mape slovenských redakcií', kluc: 'postavil.hriech.osoby' },
    riadok: 'Kto píše, pre koho a odkiaľ berie zdroje. Mapa redakcií, ľudí a ich rolí — verejná, prehľadávateľná, s citovanými zdrojmi.',
    fakty: [
      { label: 'Redakcie', kluc: 'postavil.hriech.redakcie' },
      { label: 'Roly', kluc: 'postavil.hriech.roly' },
      { label: 'Zdroje', kluc: 'postavil.hriech.zdroje' },
      { label: 'HTML stránok v builde', kluc: 'postavil.hriech.html' },
    ],
    oprava: `Reálnych článkov: ${h('postavil.hriech.clanky')}. Mapa beží, redakcia ešte nie.`,
    url: 'https://hriech.xvadur.com/mapy/redakcie',
    domena: 'hriech.xvadur.com',
    bg: 'bg-pink',
  },
  {
    id: 'agenti',
    nazov: 'Firma jedného človeka',
    preKoho: 'Môj agentový systém · to isté staviam klientom',
    stav: BEZI,
    hlavne: { label: 'pracovných vlákien s agentmi', kluc: 'stroj.vlakna' },
    riadok:
      'Agenti ako zamestnanci: oddelenia, vlastné skilly a kontrakty, každé vlákno v ledgeri. Nie „robím AI“ — konkrétny stroj, ktorý viem ukázať.',
    fakty: [
      { label: 'Rozsah ledgeru', kluc: 'stroj.vlakna.rozsah' },
      { label: 'Skilly', kluc: 'stroj.stack.skilly' },
      { label: 'MCP servery', kluc: 'stroj.stack.mcp' },
      { label: 'Cloudflare Workers', kluc: 'stroj.stack.workers' },
      { label: 'Repozitáre na GitHube', kluc: 'stroj.stack.repozitare' },
      { label: 'Oddelenia', kluc: 'stroj.stack.oddelenia' },
    ],
    url: null,
    bg: 'bg-sky',
  },
  {
    id: 'dataset',
    nazov: 'Trhový dataset realít',
    preKoho: 'Podklad pre Skóre webu a Škrtací test',
    stav: NASTROJ,
    hlavne: { label: 'textových blokov z realitných webov', kluc: 'trh.bloky' },
    riadok:
      'Čo píšu realitné weby, slovo po slove. Z toho sú kotvy: koľko webov má ako prvý krok „Kontakt“ a koľko má skutočný dôkaz namiesto „20 rokov skúseností“.',
    fakty: [
      { label: 'Realitné kancelárie', kluc: 'trh.kancelarie' },
      { label: 'Makléri', kluc: 'trh.makleri' },
      { label: 'Prehľadané weby', kluc: 'trh.hosty' },
      { label: 'Stiahnuté strany', kluc: 'trh.strany' },
      { label: 'Screenshoty', kluc: 'trh.screenshoty' },
    ],
    url: null,
    interny: { href: '/skore/', label: 'Skóre webu makléra' },
    bg: 'bg-lime',
  },
  {
    id: 'netopier',
    nazov: 'Netopier',
    preKoho: 'Vlastný engine · overovanie mediálnych tvrdení',
    stav: VYPNUTE,
    hlavne: { label: 'F1 klasifikátora tvrdení', kluc: 'postavil.netopier.f1' },
    riadok: 'Engine, ktorý sleduje zdroje a klasifikuje tvrdenia. Runtime je poctivo vypnutý — beží, keď ho zapnem, nie natrvalo na webe.',
    fakty: [
      { label: 'Riadky kódu', kluc: 'postavil.netopier.riadky' },
      { label: 'Testy', kluc: 'postavil.netopier.testy' },
      { label: 'Sledované zdroje', kluc: 'postavil.netopier.zdroje' },
      { label: 'Vypnutý od', kluc: 'postavil.netopier.vypnuty' },
    ],
    url: null,
    bg: 'bg-white',
  },
  {
    id: 'senior',
    nazov: 'Senior atlas',
    preKoho: 'Služby pre seniorov po okresoch Slovenska',
    stav: DIELNA,
    hlavne: { label: 'služieb pre seniorov', kluc: 'postavil.senior.sluzby' },
    riadok: 'Mapa služieb pre seniorov po okresoch. Dáta sú hotové, doména momentálne nebeží — preto bez odkazu.',
    fakty: [
      { label: 'Okresy', kluc: 'postavil.senior.okresy' },
      { label: 'Commity', kluc: 'postavil.senior.commity' },
    ],
    url: null,
    domena: 'senior.xvadur.com',
    bg: 'bg-yellow',
  },
  {
    id: 'data',
    nazov: 'Vlastné dáta',
    preKoho: 'Desať rokov v nemocnici a rok písania',
    stav: BEZI,
    hlavne: { label: 'záznamov v exporte Apple Health', kluc: 'telo.health.zaznamy' },
    riadok: 'Kroky z nemocničných rokov a korpus vlastných slov. Na tomto sa učím, ako sa z dát robí dôkaz — a nie príbeh.',
    fakty: [
      { label: 'Kroky v nemocničnom okne', kluc: 'telo.kroky.nemocnica' },
      { label: 'Vlastné slová', kluc: 'hlas.korpus.slova' },
      { label: 'Aktívne dni písania', kluc: 'hlas.korpus.dni' },
      { label: 'Export Apple Health', kluc: 'telo.health.exportDatum' },
    ],
    url: null,
    bg: 'bg-lilac',
  },
];

/** Účtenka v hero (Uctenka.astro): riadky = kľúče účteniek; „10 rokov“ je z ratifikovaného marquee (fakty.ts doc10). */
export const UCTENKA_RIADKY: ProjektFakt[] = [
  { label: 'Weby naživo', kluc: 'postavil.zive.pocet' },
  { label: 'Vlákna s agentmi', kluc: 'stroj.vlakna' },
  { label: 'Skilly', kluc: 'stroj.stack.skilly' },
  { label: 'MCP servery', kluc: 'stroj.stack.mcp' },
  { label: 'Cloudflare Workers', kluc: 'stroj.stack.workers' },
  { label: 'Repozitáre', kluc: 'stroj.stack.repozitare' },
];

/** Marquee domova (nahrádza MARQUEE_FAKTY z doc10 — čísla z účteniek, žiadne V OPRAVE). */
export const MARQUEE_UCTENKY: ProjektFakt[] = [
  { label: 'webov naživo', kluc: 'postavil.zive.pocet' },
  { label: 'vlákien s agentmi', kluc: 'stroj.vlakna' },
  { label: 'skillov', kluc: 'stroj.stack.skilly' },
  { label: 'maklérov v datasete', kluc: 'trh.makleri' },
  { label: 'textových blokov', kluc: 'trh.bloky' },
  { label: 'osôb v mape redakcií', kluc: 'postavil.hriech.osoby' },
];

/** Všetky kľúče, ktoré domov používa (test: každý existuje a smie na web). */
export function pouziteKluce(): string[] {
  const k = new Set<string>();
  for (const p of PROJEKTY) {
    k.add(p.hlavne.kluc);
    for (const f of p.fakty) k.add(f.kluc);
  }
  for (const f of [...UCTENKA_RIADKY, ...MARQUEE_UCTENKY]) k.add(f.kluc);
  // kľúče interpolované do viet (oprava)
  for (const x of ['postavil.makler.gate.od', 'postavil.makler.devlab.fail', 'postavil.makler.devlab.pozorovania', 'postavil.hriech.clanky']) k.add(x);
  return [...k];
}

/** Účtenka projektu na výpis: hodnota (+ jednotka), pečiatka, zdroj, dátum. */
export function fakt(f: ProjektFakt): { label: string; hodnota: string; jednotka: string; u: Uctenka } {
  const u = uctenka(f.kluc);
  if (!naWeb(u)) throw new Error(`projekty.ts: „${f.kluc}" nesmie na web (${u.kde})`);
  return { label: f.label, hodnota: formatHodnota(u), jednotka: u.jednotka ?? '', u };
}
