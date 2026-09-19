// Testy analyzéra Skóre webu (node --test). Bez Astra: node 26 číta .ts natívne.
// Fixtúry: (1) web plný fráz z packu 13 §1, (2) čistý web s dôkazom, (3) web s rezervačným widgetom.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyze,
  extractText,
  decodeEntities,
  najdiKlise,
  najdiBooking,
  najdiVendor,
  spocitajFormulare,
  bodyZaFrazy,
  verdiktSkore,
  zistiKodovanie,
  dekodujHtml,
  normalizujUrl,
  jeZakazanyHost,
} from '../src/lib/skore-analyzer.ts';
import { CITACIE, FRAZY_RODINY } from '../src/data/frazy.ts';
import { KOTVY } from '../src/data/fakty.ts';

/* ---------- fixtúry ---------- */

/** (1) Stránka poskladaná z doslovných citácií webov kancelárií (pack 13 §1) + „už 20 rokov“, prvý krok Kontakt. */
const KLISE_HTML = `<!doctype html>
<html lang="sk"><head><meta charset="utf-8"><title>Realitná kancelária</title>
<meta name="generator" content="WordPress 6.6.1">
<script>window.dataLayer = [];</script>
<style>.hero { color: red }</style>
</head><body>
<header><nav><a href="/">Domov</a><a href="/ponuka">Ponuka</a><a href="/kontakt">Kontakt</a></nav></header>
<main>
  <h1>${CITACIE[0].text}</h1>
  <p>${CITACIE[5].text}. ${CITACIE[7].text}.</p>
  <p>${CITACIE[8].text} &mdash; ${CITACIE[11].text}. Predaj bez starostí, u&nbsp;n&aacute;s u&#382; 20 rokov.</p>
  <ul><li>Kompletn&yacute; realitn&yacute; servis</li><li>Osobn&yacute; pr&iacute;stup</li></ul>
  <form action="/kontakt" method="post"><label>E-mail <input type="email" name="email"></label><button>Odoslať</button></form>
</main>
<footer><a href="tel:+421900000000">+421 900 000 000</a></footer>
<script src="/wp-content/themes/x/app.js"></script>
</body></html>`;

/** (2) Čistý web: veta z Dňa 2 packu, dôkaz s číslom, pomenovaný prvý krok ako text (bez widgetu). */
const CISTY_HTML = `<!doctype html>
<html lang="sk"><head><meta charset="utf-8"><title>Maklér</title></head><body>
<main>
  <h1>Predaj držím osobne. Za mnou pracuje celý aparát.</h1>
  <p>Byt v Petržalke: majiteľ chcel predať do konca leta. Zmenili sme poradie fotiek a cenu sme nastavili podľa troch porovnateľných predajov. Predaný za 21 dní, 4 % nad pôvodný odhad.</p>
  <a href="/predajny-scenar">Rezervujte si predajný scenár: 30 minút</a>
</main>
</body></html>`;

/** (3) Web s rezervačným widgetom (Calendly) a formulárom; jedna fráza. */
const BOOKING_HTML = `<!doctype html>
<html lang="sk"><head><meta charset="utf-8"><title>Maklérka</title></head><body>
<main>
  <h1>Meno Priezvisko</h1>
  <p>Dlhoročné skúsenosti v realitách. Zavolajte.</p>
  <div class="calendly-inline-widget" data-url="https://calendly.com/priklad/30min"></div>
  <script src="https://assets.calendly.com/assets/external/widget.js" async></script>
  <form action="/newsletter"><input name="email"><button>Odoberať</button></form>
</main>
</body></html>`;

/* ---------- pomocné ---------- */

test('extractText: preč so skriptmi, štýlmi, tagmi, entitami', () => {
  const t = extractText(KLISE_HTML);
  assert.ok(!t.includes('dataLayer'));
  assert.ok(!t.includes('color: red'));
  assert.ok(!t.includes('<'));
  assert.ok(t.includes('Predaj bez starostí, u nás už 20 rokov'));
  assert.ok(t.includes('Kompletný realitný servis'));
  assert.equal(decodeEntities('&amp;&#x41;&#66;&hellip;'), '&AB…');
});

test('pomocné: booking, vendor, formuláre', () => {
  assert.equal(najdiBooking(BOOKING_HTML), 'Calendly');
  assert.equal(najdiBooking(KLISE_HTML), null);
  assert.equal(najdiVendor(KLISE_HTML), 'WordPress');
  assert.equal(najdiVendor(CISTY_HTML), null);
  assert.equal(najdiVendor('<meta name="generator" content="Webnode 2">'), 'Webnode');
  assert.equal(najdiVendor('<html><body><script src="https://static.parastorage.com/x.js"></script><meta name="generator" content="Wix.com Website Builder"></body></html>'), 'Wix');
  assert.equal(spocitajFormulare(KLISE_HTML), 1);
  assert.equal(spocitajFormulare(CISTY_HTML), 0);
});

test('bodyZaFrazy: 0 rodín = 40, 6 rodín = 0, klesá monotónne', () => {
  assert.equal(bodyZaFrazy(0), 40);
  assert.equal(bodyZaFrazy(6), 0);
  for (let i = 1; i <= 6; i++) assert.ok(bodyZaFrazy(i) < bodyZaFrazy(i - 1));
});

/* ---------- fixtúra 1: klišé ---------- */

test('klišé web: 5–6 rodín zasiahnutých, prvý krok Kontakt, bez dôkazu, WordPress, nízke skóre', () => {
  const r = analyze(KLISE_HTML, 'https://www.priklad-realitka.sk/');
  const rodiny = r.klise.map((k) => k.rodina);
  assert.ok(r.klise.length >= 5, `rodiny: ${rodiny.join(', ')}`);
  assert.ok(rodiny.includes('komplexný / kompletný servis'));
  assert.ok(rodiny.includes('dlhoročné skúsenosti'));
  assert.ok(rodiny.includes('najlepšia / najvyššia cena'));
  assert.ok(rodiny.includes('bez starostí'));
  for (const k of r.klise) {
    assert.ok(k.pocet >= 1);
    assert.ok(k.priklady.length >= 1 && k.priklady.length <= 3);
    assert.ok(FRAZY_RODINY.some((f) => f.rodina === k.rodina && f.zakladna), `nezákladná rodina ${k.rodina}`);
  }
  assert.equal(r.prvyKrok, 'kontakt');
  assert.equal(r.formulare, 1);
  assert.equal(r.bookingWidget, false);
  assert.equal(r.vendor, 'WordPress');
  assert.equal(r.detaily.dokaz, false);
  assert.match(r.detaily.dokazDovod, /20 rokov/);
  assert.ok(r.skore <= 25, `skóre ${r.skore}`);
  assert.equal(r.detaily.host, 'priklad-realitka.sk');
  assert.equal(r.detaily.kotvy.kancelarieSFrazou.value, KOTVY.kancelarieSFrazou.value);
});

/* ---------- fixtúra 2: čistý ---------- */

test('čistý web: 0 rodín, dôkaz s číslom, prvý krok rezervácia (text), vysoké skóre', () => {
  const r = analyze(CISTY_HTML, 'https://makler.sk');
  assert.deepEqual(r.klise, []);
  assert.equal(r.detaily.dokaz, true);
  assert.match(r.detaily.dokazDovod, /21 dní|4 %/);
  assert.equal(r.prvyKrok, 'rezervacia');
  assert.equal(r.bookingWidget, false);
  assert.equal(r.formulare, 0);
  assert.equal(r.vendor, null);
  assert.equal(r.skore, 40 + 30 + 20 + 0);
});

/* ---------- fixtúra 3: booking widget ---------- */

test('booking widget: rezervácia cez Calendly, 1 rodina, formulár, body za nástroj 10', () => {
  const r = analyze(BOOKING_HTML, 'http://priklad.sk/');
  assert.equal(r.bookingWidget, true);
  assert.equal(r.prvyKrok, 'rezervacia');
  assert.match(r.detaily.prvyKrokDovod, /Calendly/);
  assert.equal(r.klise.length, 1);
  assert.equal(r.klise[0].rodina, 'dlhoročné skúsenosti');
  assert.equal(r.formulare, 1);
  assert.equal(r.detaily.body.nastroj, 10);
  assert.equal(r.detaily.body.prvyKrok, 30);
  assert.equal(r.skore, bodyZaFrazy(1) + 30 + 0 + 10);
});

/* ---------- okraje ---------- */

test('okraje: prázdne HTML, ne-string, skóre v 0..100, verdikt pre každé pásmo', () => {
  const p = analyze('', 'https://x.sk');
  assert.equal(p.klise.length, 0);
  assert.equal(p.prvyKrok, 'ziadny');
  assert.ok(p.skore >= 0 && p.skore <= 100);
  const n = analyze(/** @type {any} */ (null), 'nie-url');
  assert.equal(n.detaily.host, 'nie-url');
  for (const s of [0, 29, 30, 54, 55, 79, 80, 100]) {
    const v = verdiktSkore(s);
    assert.ok(v.titul.length > 5 && v.text.length > 10);
    assert.ok(!/rodín|Kontakt|termín/.test(v.text), 'bez detailov nič netvrdí o frázach ani prvom kroku');
  }
  const k = najdiKlise('KOMPLEXNÝ SERVIS a komplexný servis a Komplexný Servis.');
  assert.equal(k[0].pocet, 3);
  assert.equal(k[0].priklady.length, 1, 'príklady bez ohľadu na veľkosť písmen');
});

/* ---------- verdikt: bez kontradikcií s nameranými zložkami ---------- */

test('verdiktSkore: text vychádza z dát (rezervácia ≠ „Kontakt“, 0 rodín ≠ „frázy“)', () => {
  const a = verdiktSkore(40, { rodinyZasiahnute: 6, dokaz: false, prvyKrok: 'rezervacia' });
  assert.match(a.text, /6 zo 6 rodín/);
  assert.match(a.text, /termín/);
  assert.ok(!a.text.includes('Kontakt'), a.text);
  const b = verdiktSkore(54, { rodinyZasiahnute: 0, dokaz: false, prvyKrok: 'kontakt' });
  assert.match(b.text, /Ani jedna/);
  assert.match(b.text, /Kontakt/);
  assert.match(b.text, /Dôkaz chýba/);
  const c = verdiktSkore(60, { rodinyZasiahnute: 0, dokaz: true, prvyKrok: 'ziadny' });
  assert.match(c.text, /Ani jedna/);
  assert.match(c.text, /Dôkaz s číslom je tu/);
  assert.match(c.text, /nie je pomenovaný/);
  // výsledok analyze sa dá podať priamo
  const r = analyze(CISTY_HTML, 'https://makler.sk');
  const v = verdiktSkore(r.skore, { ...r.detaily, prvyKrok: r.prvyKrok });
  assert.equal(v.titul, 'Váš web nie je zameniteľný.');
  assert.match(v.text, /termín/);
});

/* ---------- prvý krok: generická konzultácia nie je termín ---------- */

test('„nezáväzná / bezplatná konzultácia“ bez termínu = kontakt (10 b.), nie rezervácia (30 b.)', () => {
  const r = analyze('<p>Ponúkame nezáväznú konzultáciu a komplexný servis.</p><a href="/kontakt">Kontakt</a>', 'https://x.sk');
  assert.equal(r.prvyKrok, 'kontakt');
  assert.equal(r.detaily.body.prvyKrok, 10);
  assert.match(r.detaily.prvyKrokDovod, /nezáväznú konzultáciu/);
  const b = analyze('<a href="/x">Bezplatná konzultácia</a>', 'https://x.sk');
  assert.equal(b.prvyKrok, 'kontakt');
  // termín konzultácie je rezervácia
  const t = analyze('<a href="/x">Dohodnite si termín konzultácie</a>', 'https://x.sk');
  assert.equal(t.prvyKrok, 'rezervacia');
});

/* ---------- kódovanie: windows-1250 ---------- */

/** Mini-kodér do cp1250 pre test (len znaky, ktoré potrebujeme; ASCII prechádza). */
const CP1250 = { á: 0xe1, é: 0xe9, í: 0xed, ó: 0xf3, ú: 0xfa, ý: 0xfd, ä: 0xe4, ô: 0xf4, č: 0xe8, š: 0x9a, ž: 0x9e, ť: 0x9d, ď: 0xef, ľ: 0xbe, ň: 0xf2, ŕ: 0xe0, Š: 0x8a, Č: 0xc8 };
function cp1250(str) {
  return new Uint8Array([...str].map((ch) => (ch.charCodeAt(0) < 128 ? ch.charCodeAt(0) : CP1250[ch] ?? 0x3f)));
}
const CP_TEXT = 'Dlhoročné skúsenosti a komplexný servis. Predaj bez starostí. Individuálny prístup.';

test('windows-1250 z Content-Type aj z <meta charset>: diakritika sa dekóduje, rodiny sa nájdu', () => {
  const html = `<html><head><meta charset="windows-1250"></head><body><p>${CP_TEXT}</p></body></html>`;
  const bajty = cp1250(html);
  assert.equal(zistiKodovanie(bajty, 'text/html; charset=windows-1250'), 'windows-1250');
  assert.equal(zistiKodovanie(bajty, 'text/html'), 'windows-1250', 'z meta charset');
  assert.equal(zistiKodovanie(cp1250('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-2">'), null), 'iso-8859-2');
  assert.equal(zistiKodovanie(cp1250('<html><body>x</body></html>'), 'text/html'), 'utf-8');
  assert.equal(zistiKodovanie(bajty, 'text/html; charset=neexistuje-x'), 'utf-8');
  const { html: dek, kodovanie } = dekodujHtml(bajty, 'text/html; charset=windows-1250');
  assert.equal(kodovanie, 'windows-1250');
  assert.ok(dek.includes(CP_TEXT), dek);
  const utf = analyze(html, 'https://x.sk');
  const cp = analyze(dek, 'https://x.sk');
  assert.equal(cp.klise.length, utf.klise.length);
  assert.ok(cp.klise.length >= 4, `rodiny ${cp.klise.map((k) => k.rodina)}`);
  assert.equal(cp.skore, utf.skore);
  // bez dekódovania by mojibake rodiny nenašiel — to je chyba, ktorú opravujeme
  const mojibake = analyze(new TextDecoder('utf-8').decode(bajty), 'https://x.sk');
  assert.ok(mojibake.klise.length < cp.klise.length);
});

/* ---------- validácia adresy ---------- */

test('normalizujUrl + jeZakazanyHost: schémy, localhost, IP v každom zápise, dĺžka', () => {
  assert.equal(normalizujUrl('x.sk').href, 'https://x.sk/');
  assert.equal(normalizujUrl('https://user:pw@x.sk/a?b=1#c').href, 'https://x.sk/a?b=1');
  assert.equal(normalizujUrl('javascript:alert(1)'), null);
  assert.equal(normalizujUrl('ftp://x.sk'), null);
  assert.equal(normalizujUrl('http://[::1]/'), null);
  assert.equal(normalizujUrl('a'.repeat(2049)), null);
  assert.equal(normalizujUrl(42), null);
  assert.equal(normalizujUrl('bezbodky'), null);
  for (const h of ['localhost', 'app.localhost', 'x.local', 'y.internal', '127.0.0.1', '127.1', '2130706433', '0x7f.1', '0177.0.0.1', '[::1]', '::1', '10.0.0.5'])
    assert.equal(jeZakazanyHost(h), true, h);
  for (const h of ['example.com', 'jakubolsa.sk', '1a.sk', 'abc.de', 'www.bosen.sk']) assert.equal(jeZakazanyHost(h), false, h);
  // numerické vstupy URL parser normalizuje na IPv4 → zákaz platí aj po normalizácii
  assert.equal(jeZakazanyHost(normalizujUrl('2130706433').hostname), true);
  assert.equal(jeZakazanyHost(normalizujUrl('http://0x7f.1/').hostname), true);
});
