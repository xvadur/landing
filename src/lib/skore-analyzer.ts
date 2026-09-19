/** Skóre webu makléra — čistá funkcia analyze(html, url) bez závislosti na DOM alebo node:*.
 *  Beží v testoch (node --test), v Cloudflare workeri (/api/skore) aj v prehliadači.
 *
 *  Zdroje pravidiel:
 *   - klišé rodiny: src/data/frazy.ts (6 základných rodín z packu 13 §1 / Deň 1)
 *   - kotvy trhu: src/data/fakty.ts KOTVY = pack 13 §1
 *       31 / 47   kancelárií má v texte aspoň jednu zo 6 rodín fráz
 *       267 / 416 webov má prvý krok „Kontakt" / telefón / všeobecný formulár (64 %)
 *       15 / 416  webov ponúka rezerváciu termínu ako prvý krok (3,6 %)
 *       96 / 416  webov má použiteľný dôkaz (prípad, nie „20 rokov")
 *
 *  Vzorec (0–100, viac = web je menej zameniteľný), dokumentovaný aj v src/components/skore/AkoSaPocita.astro:
 *   1. Frázy (kotva 31/47) ....... 0–40 b.  40 × (6 − zasiahnuté rodiny) / 6
 *   2. Prvý krok (267/416, 15/416)  0–30 b.  rezervácia 30 · kontakt 10 · žiadny 0
 *   3. Dôkaz (96/416) ............ 0–20 b.  prípad s číslom / prípadová štúdia 20 · inak 0
 *   4. Nástroj prvého kroku ...... 0–10 b.  booking widget 10 · aspoň jeden formulár 4 · nič 0
 */
import { FRAZY_RODINY, type FrazaRodina } from '../data/frazy.ts';
import { KOTVY } from '../data/fakty.ts';

export type KliseZasah = {
  rodina: string;
  pocet: number;
  priklady: string[];
};

export type PrvyKrok = 'kontakt' | 'rezervacia' | 'ziadny';

export type SkoreDetaily = {
  /** koľko slov malo analyzované telo stránky */
  slova: number;
  /** koľko zo 6 základných rodín sa na webe vyskytlo */
  rodinyZasiahnute: number;
  /** celkový počet výskytov fráz */
  frazySpolu: number;
  /** našiel sa použiteľný dôkaz (prípad s číslom, prípadová štúdia) */
  dokaz: boolean;
  /** prečo sme rozhodli o prvom kroku */
  prvyKrokDovod: string;
  /** prečo sme rozhodli o dôkaze */
  dokazDovod: string;
  /** body za jednotlivé zložky */
  body: { frazy: number; prvyKrok: number; dokaz: number; nastroj: number };
  /** kotvy trhu, proti ktorým sa web porovnáva (pack 13 §1) */
  kotvy: typeof KOTVY;
  /** hostiteľ analyzovanej adresy */
  host: string;
};

export type SkoreVysledok = {
  klise: KliseZasah[];
  prvyKrok: PrvyKrok;
  formulare: number;
  bookingWidget: boolean;
  vendor: string | null;
  skore: number;
  detaily: SkoreDetaily;
};

/* ---------- pomocné: text z HTML bez DOM ---------- */

const ENTITY: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  bdquo: '„',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
  euro: '€',
  copy: '©',
  reg: '®',
  trade: '™',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', yacute: 'ý',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Yacute: 'Ý',
  auml: 'ä', Auml: 'Ä', ouml: 'ö', Ouml: 'Ö', uuml: 'ü', Uuml: 'Ü', ocirc: 'ô', Ocirc: 'Ô',
  scaron: 'š', Scaron: 'Š', zcaron: 'ž', Zcaron: 'Ž', ccedil: 'ç', ntilde: 'ñ',
};

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n: string) => ENTITY[n] ?? ENTITY[n.toLowerCase()] ?? m);
}

function safeChar(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  try {
    return String.fromCodePoint(code);
  } catch {
    return '';
  }
}

/** Viditeľný text: preč so <script>, <style>, <noscript>, <svg>, <template>, komentármi a tagmi. */
export function extractText(html: string): string {
  const bezBlokov = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|section|article|br|tr|td|th|header|footer|nav|blockquote)\b[^>]*>/gi, ' \n ')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(bezBlokov)
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function regexRodiny(r: FrazaRodina): RegExp {
  const vzory = [...r.vzory].sort((a, b) => b.length - a.length).map(escapeRe);
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${vzory.join('|')})(?![\\p{L}])`, 'giu');
}

/* ---------- klišé ---------- */

export function najdiKlise(text: string): KliseZasah[] {
  const out: KliseZasah[] = [];
  for (const r of FRAZY_RODINY.filter((x) => x.zakladna)) {
    const re = regexRodiny(r);
    const priklady: string[] = [];
    let pocet = 0;
    for (const m of text.matchAll(re)) {
      pocet++;
      const p = m[0].trim();
      if (!priklady.some((x) => x.toLowerCase() === p.toLowerCase()) && priklady.length < 3) priklady.push(p);
    }
    if (pocet > 0) out.push({ rodina: r.rodina, pocet, priklady });
  }
  return out.sort((a, b) => b.pocet - a.pocet);
}

/* ---------- booking widget, formuláre, vendor ---------- */

const BOOKING_SIGNATURES: { re: RegExp; nazov: string }[] = [
  { re: /calendly\.com/i, nazov: 'Calendly' },
  { re: /cal\.com\/(?!.*calendly)/i, nazov: 'Cal.com' },
  { re: /calendar\.app\.google|calendar\.google\.com\/calendar\/(?:u\/\d+\/)?appointments/i, nazov: 'Google Calendar (rezervácia)' },
  { re: /reservio\.(?:com|sk|cz)/i, nazov: 'Reservio' },
  { re: /bookio\.(?:com|sk|cz)/i, nazov: 'Bookio' },
  { re: /reservanto\.(?:cz|sk)/i, nazov: 'Reservanto' },
  { re: /meetings\.hubspot\.com/i, nazov: 'HubSpot Meetings' },
  { re: /acuityscheduling\.com|as\.me\//i, nazov: 'Acuity' },
  { re: /youcanbook\.me/i, nazov: 'YouCanBookMe' },
  { re: /tidycal\.com/i, nazov: 'TidyCal' },
  { re: /zcal\.co/i, nazov: 'zcal' },
  { re: /simplybook\.(?:me|it)/i, nazov: 'SimplyBook' },
  { re: /setmore\.com/i, nazov: 'Setmore' },
  { re: /outlook\.office\.com\/book|outlook\.office365\.com\/owa\/calendar/i, nazov: 'Microsoft Bookings' },
  { re: /koalendar\.com/i, nazov: 'Koalendar' },
];

export function najdiBooking(html: string): string | null {
  for (const s of BOOKING_SIGNATURES) if (s.re.test(html)) return s.nazov;
  return null;
}

export function spocitajFormulare(html: string): number {
  const m = html.match(/<form\b/gi);
  return m ? m.length : 0;
}

const VENDOR_SIGNATURES: { re: RegExp; nazov: string }[] = [
  { re: /<meta[^>]+name=["']?generator["']?[^>]+content=["']?[^"'>]*wordpress/i, nazov: 'WordPress' },
  { re: /wp-content\/|wp-includes\//i, nazov: 'WordPress' },
  { re: /<meta[^>]+name=["']?generator["']?[^>]+content=["']?[^"'>]*webnode/i, nazov: 'Webnode' },
  { re: /webnode\.(?:sk|cz|com)|cdn\.myshoptet|\bwnd\.\w+\s*=/i, nazov: 'Webnode' },
  { re: /wix\.com|wixstatic\.com|X-Wix-/i, nazov: 'Wix' },
  { re: /webflow\.com|data-wf-page|data-wf-site/i, nazov: 'Webflow' },
  { re: /squarespace\.com|static1\.squarespace/i, nazov: 'Squarespace' },
  { re: /<meta[^>]+name=["']?generator["']?[^>]+content=["']?[^"'>]*joomla/i, nazov: 'Joomla' },
  { re: /<meta[^>]+name=["']?generator["']?[^>]+content=["']?[^"'>]*drupal/i, nazov: 'Drupal' },
  { re: /cdn\.shopify\.com|shopify\.com/i, nazov: 'Shopify' },
  { re: /cdn\.duda\.co|dudamobile/i, nazov: 'Duda' },
  { re: /weebly\.com/i, nazov: 'Weebly' },
  { re: /jimdo\.com|jimdostatic/i, nazov: 'Jimdo' },
  { re: /<meta[^>]+name=["']?generator["']?[^>]+content=["']?[^"'>]*next\.js/i, nazov: 'Next.js' },
  { re: /<meta[^>]+name=["']?generator["']?[^>]+content=["']?[^"'>]*astro/i, nazov: 'Astro' },
  { re: /<meta[^>]+name=["']?generator["']?[^>]+content=["']?([^"'>]+)/i, nazov: '$generator' },
];

export function najdiVendor(html: string): string | null {
  for (const s of VENDOR_SIGNATURES) {
    const m = html.match(s.re);
    if (!m) continue;
    if (s.nazov === '$generator') {
      const g = (m[1] ?? '').trim().split(/\s+/)[0];
      return g ? g.replace(/[^\p{L}\p{N}.\-]/gu, '') || null : null;
    }
    return s.nazov;
  }
  return null;
}

/* ---------- prvý krok ---------- */

/* Hranice slov: JS \b je len ASCII, slovenské znaky (ť, á, ý…) by ho rozbili → lookaround na \p{L}. */
const L0 = '(?<!\\p{L})';
const L1 = '(?!\\p{L})';
/* Rezervácia = konkrétny termín (nástroj, „rezervovať / dohodnúť termín“). Generické „bezplatná / nezáväzná konzultácia“
 * je bežná fráza bez termínu → patrí do zložky „kontakt“ (10 b.), nie k 15/416 webom s termínom ako prvým krokom. */
const REZERVACIA_TEXT = new RegExp(
  `${L0}(?:rezerv[aá]ci[aeiuoáä]\\p{L}*|rezervova[tť]|rezervujte|objedna[tť] sa|objednajte sa|term[ií]n (?:konzult|stretnut|obhliad)\\p{L}*|dohodn[uú][tť] (?:si )?(?:term[ií]n|stretnutie)|dohodnite si)${L1}`,
  'iu',
);
const KONZULTACIA_TEXT = new RegExp(`${L0}(?:bezplatn[áuúé] konzult\\p{L}*|nez[aá]v[aä]zn[áuúé] konzult\\p{L}*)${L1}`, 'iu');
const KONTAKT_TEXT = new RegExp(
  `${L0}(?:kontakt(?:ujte|uj|y|ova[tť]|n[ýy] formul[áa]r)?|nap[íi][šs]te n[áa]m|zavolajte|volajte|ozvite sa)${L1}`,
  'iu',
);

export function urciPrvyKrok(html: string, text: string, booking: string | null): { krok: PrvyKrok; dovod: string } {
  if (booking) return { krok: 'rezervacia', dovod: `Na stránke je rezervačný nástroj (${booking}).` };
  const odkazy = [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => extractText(m[1] ?? '')).filter(Boolean);
  const rezervOdkaz = odkazy.find((t) => REZERVACIA_TEXT.test(t));
  if (rezervOdkaz) return { krok: 'rezervacia', dovod: `Odkaz „${skrat(rezervOdkaz)}“ ponúka termín ako ďalší krok.` };
  if (REZERVACIA_TEXT.test(text)) {
    const m = text.match(REZERVACIA_TEXT);
    return { krok: 'rezervacia', dovod: `Text ponúka termín („${skrat(m?.[0] ?? '')}“), ale bez rezervačného nástroja.` };
  }
  const kontaktOdkaz = odkazy.find((t) => KONTAKT_TEXT.test(t));
  const telOdkaz = /<a\b[^>]*href=["']tel:/i.test(html);
  const formular = spocitajFormulare(html) > 0;
  const konzultacia = odkazy.find((t) => KONZULTACIA_TEXT.test(t)) ?? text.match(KONZULTACIA_TEXT)?.[0];
  if (konzultacia) return { krok: 'kontakt', dovod: `„${skrat(konzultacia)}“ je ponuka bez termínu — klient nevie, čo dostane a kedy.` };
  if (kontaktOdkaz) return { krok: 'kontakt', dovod: `Ďalší krok je „${skrat(kontaktOdkaz)}“ — klient nevie, čo dostane.` };
  if (telOdkaz) return { krok: 'kontakt', dovod: 'Ďalší krok je telefónne číslo.' };
  if (formular) return { krok: 'kontakt', dovod: 'Ďalší krok je všeobecný formulár.' };
  if (KONTAKT_TEXT.test(text)) return { krok: 'kontakt', dovod: 'Ďalší krok je výzva „kontaktujte nás“ bez tlačidla.' };
  return { krok: 'ziadny', dovod: 'Na stránke sme nenašli žiadny pomenovaný ďalší krok.' };
}

function skrat(s: string, n = 40): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

/* ---------- dôkaz ---------- */

const CISLO = '(?:\\d{1,3}(?:[ \\u00a0]\\d{3})+|\\d+(?:[.,]\\d+)?\\s*(?:€|eur|tis\\.|mil\\.)|\\d+\\s+dn[ií]|\\d+\\s*%|\\d+\\s+(?:týžd|mesiac)\\p{L}*)';
const PREDAJ = '(?:predan\\p{L}*|predali sme|predal[ai]?|predaj\\p{L}*|prenajat\\p{L}*|prenajali)';
const DOKAZ_PRIPAD = new RegExp(`pr[ií]padov[áa]\\s+[šs]t[úu]di[aeiu]|case stud(?:y|ies)|pr[ií]beh\\p{L}*\\s+predaj\\p{L}*|ako sme predali`, 'iu');
const DOKAZ_PREDAJ_CISLO = new RegExp(`${L0}${PREDAJ}${L1}[^.\\n]{0,120}?${L0}${CISLO}${L1}`, 'iu');
const DOKAZ_CISLO_PREDAJ = new RegExp(`${L0}${CISLO}${L1}[^.\\n]{0,80}?${L0}${PREDAJ}${L1}`, 'iu');
const PRAZDNY_DOKAZ = new RegExp(`(?:\\d{1,2}\\s*)?rok(?:ov|y)\\s+sk[úu]senost[ií]${L1}|${L0}u[žz]\\s+\\d{1,2}\\s+rokov${L1}|${L0}od roku \\d{4}${L1}`, 'iu');

export function najdiDokaz(text: string): { dokaz: boolean; dovod: string } {
  const pripad = text.match(DOKAZ_PRIPAD);
  if (pripad) return { dokaz: true, dovod: `Web má prípadovú štúdiu („${skrat(pripad[0])}“).` };
  const s1 = text.match(DOKAZ_PREDAJ_CISLO) ?? text.match(DOKAZ_CISLO_PREDAJ);
  if (s1) return { dokaz: true, dovod: `Predaj s číslom: „${skrat(s1[0], 60)}“.` };
  const prazdny = text.match(PRAZDNY_DOKAZ);
  if (prazdny) return { dokaz: false, dovod: `Jediný „dôkaz“ je „${skrat(prazdny[0])}“ — roky nie sú prípad.` };
  return { dokaz: false, dovod: 'Bez uzavretého predaja s číslom, bez prípadovej štúdie.' };
}

/* ---------- skóre ---------- */

export function bodyZaFrazy(rodinyZasiahnute: number): number {
  const r = Math.max(0, Math.min(6, rodinyZasiahnute));
  return Math.round((40 * (6 - r)) / 6);
}

export function bodyZaPrvyKrok(k: PrvyKrok): number {
  return k === 'rezervacia' ? 30 : k === 'kontakt' ? 10 : 0;
}

export function bodyZaDokaz(dokaz: boolean): number {
  return dokaz ? 20 : 0;
}

export function bodyZaNastroj(bookingWidget: boolean, formulare: number): number {
  return bookingWidget ? 10 : formulare > 0 ? 4 : 0;
}

function pocetSlov(text: string): number {
  const m = text.match(/\p{L}[\p{L}\p{N}'’-]*/gu);
  return m ? m.length : 0;
}

function hostZ(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Hlavná funkcia: HTML domovskej stránky + jej URL → výsledok. Nikdy nehádže, pri prázdnom HTML vráti nuly. */
export function analyze(html: string, url: string): SkoreVysledok {
  const src = typeof html === 'string' ? html : '';
  const text = extractText(src);
  const klise = najdiKlise(text);
  const booking = najdiBooking(src);
  const formulare = spocitajFormulare(src);
  const vendor = najdiVendor(src);
  const { krok, dovod: prvyKrokDovod } = urciPrvyKrok(src, text, booking);
  const { dokaz, dovod: dokazDovod } = najdiDokaz(text);

  const body = {
    frazy: bodyZaFrazy(klise.length),
    prvyKrok: bodyZaPrvyKrok(krok),
    dokaz: bodyZaDokaz(dokaz),
    nastroj: bodyZaNastroj(!!booking, formulare),
  };
  const skore = Math.max(0, Math.min(100, body.frazy + body.prvyKrok + body.dokaz + body.nastroj));

  return {
    klise,
    prvyKrok: krok,
    formulare,
    bookingWidget: !!booking,
    vendor,
    skore,
    detaily: {
      slova: pocetSlov(text),
      rodinyZasiahnute: klise.length,
      frazySpolu: klise.reduce((a, k) => a + k.pocet, 0),
      dokaz,
      prvyKrokDovod,
      dokazDovod,
      body,
      kotvy: KOTVY,
      host: hostZ(url),
    },
  };
}

/** Slovné hodnotenie: titul podľa pásma skóre, text poskladaný len z nameraných zložiek (rodiny, prvý krok, dôkaz).
 *  Bez `detaily` (napr. v teste pásiem) vráti text, ktorý nič netvrdí o frázach ani prvom kroku. */
export function verdiktSkore(
  skore: number,
  detaily?: Pick<SkoreDetaily, 'rodinyZasiahnute' | 'dokaz'> & { prvyKrok?: PrvyKrok },
): { titul: string; text: string } {
  const titul =
    skore >= 80
      ? 'Váš web nie je zameniteľný.'
      : skore >= 55
        ? 'Polovica webu je vaša.'
        : skore >= 30
          ? 'Väčšina webu by mohla byť kohokoľvek.'
          : 'Tento web by mohol byť kohokoľvek.';
  if (!detaily) return { titul, text: 'Skóre skladáme zo štyroch zložiek: frázy, prvý krok, dôkaz, nástroj.' };

  const r = detaily.rodinyZasiahnute;
  const frazy =
    r === 0
      ? 'Ani jedna zo 6 rodín fráz, ktoré má 31 zo 47 kancelárií.'
      : r === 1
        ? 'Jedna zo 6 rodín fráz, ktoré má 31 zo 47 kancelárií.'
        : r >= 5
          ? `${r} zo 6 rodín fráz — text sa zhoduje s tým, čo píše 31 zo 47 kancelárií.`
          : `${r} zo 6 rodín fráz, ktoré má 31 zo 47 kancelárií.`;
  const krok =
    detaily.prvyKrok === 'rezervacia'
      ? 'Prvý krok je pomenovaný termín.'
      : detaily.prvyKrok === 'kontakt'
        ? 'Prvý krok je „Kontakt“ — klient nevie, čo dostane.'
        : 'Prvý krok nie je pomenovaný.';
  const dokaz = detaily.dokaz ? 'Dôkaz s číslom je tu.' : 'Dôkaz chýba.';
  const zaver =
    skore >= 80 ? 'Zostáva to držať.' : skore >= 55 ? 'Chýba už len kúsok.' : 'Klient nájde kanceláriu, nie vás.';
  return { titul, text: `${frazy} ${krok} ${dokaz} ${zaver}` };
}

/* ---------- kódovanie odpovede (pre /api/skore; tu, aby to čítal aj node --test) ---------- */

/** Kódovanie HTML: `charset=` z Content-Type, inak `<meta charset>` / `<meta http-equiv="content-type">`
 *  z prvých 2 kB bajtov (čítaných ako latin1), inak utf-8. Vracia label, ktorý TextDecoder pozná. */
export function zistiKodovanie(bajty: Uint8Array, contentType: string | null | undefined): string {
  const zHlavicky = /charset\s*=\s*["']?([\w.:-]+)/i.exec(contentType ?? '')?.[1];
  let label = zHlavicky;
  if (!label) {
    let hlava = '';
    const n = Math.min(bajty.length, 2048);
    for (let i = 0; i < n; i++) hlava += String.fromCharCode(bajty[i] ?? 0);
    label =
      /<meta[^>]+charset\s*=\s*["']?([\w.:-]+)/i.exec(hlava)?.[1] ??
      /<meta[^>]+content\s*=\s*["'][^"']*charset=([\w.:-]+)/i.exec(hlava)?.[1];
  }
  if (!label) return 'utf-8';
  try {
    return new TextDecoder(label).encoding;
  } catch {
    return 'utf-8';
  }
}

/** Bajty → text podľa zisteného kódovania (windows-1250, iso-8859-2, utf-8 …), pri neznámom utf-8. */
export function dekodujHtml(bajty: Uint8Array, contentType: string | null | undefined): { html: string; kodovanie: string } {
  const kodovanie = zistiKodovanie(bajty, contentType);
  try {
    return { html: new TextDecoder(kodovanie, { fatal: false }).decode(bajty), kodovanie };
  } catch {
    return { html: new TextDecoder('utf-8', { fatal: false }).decode(bajty), kodovanie: 'utf-8' };
  }
}

/* ---------- validácia adresy (pre /api/skore; tu, aby to čítal aj node --test) ---------- */

/** Normalizuje vstup na absolútnu http(s) URL bez hash/credentials; vracia null, ak sa nedá. */
export function normalizujUrl(vstup: unknown): URL | null {
  if (typeof vstup !== 'string') return null;
  let s = vstup.trim();
  if (!s || s.length > 2048) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (!u.hostname || !u.hostname.includes('.')) return null;
  u.hash = '';
  u.username = '';
  u.password = '';
  return u;
}

/** Zakázané ciele: localhost, .local/.internal, IP literály (IPv4 v akomkoľvek zápise aj IPv6) — web makléra má doménu. */
export function jeZakazanyHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, '');
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (h.startsWith('[') || h.includes(':')) return true; // IPv6 literál
  // 127.0.0.1, 127.1, 2130706433, 0x7f.1, 0177.0.0.1 — každý label je číslo (dec / oct / hex)
  if (h.split('.').every((l) => /^(?:0x[0-9a-f]+|\d+)$/i.test(l))) return true;
  return false;
}
