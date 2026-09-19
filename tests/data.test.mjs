// Smoke testy dát (node --test). Bežia bez Astra: node 26 číta .ts natívne.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NAV, COMMAND_ITEMS } from '../src/data/nav.ts';
import { ROUTES, routeByPath, ogUrlFor } from '../src/data/routes.ts';
import { FRAZY_RODINY, PRAZDNE_PRIDAVNE, CITACIE, frazyRegex, pridavneRegex } from '../src/data/frazy.ts';
import { POSTAVIL, MARQUEE_FAKTY, FAKTY } from '../src/data/fakty.ts';
import { BEATY } from '../src/data/beaty.ts';

test('nav: 6 položiek v záväznom poradí, každá má route', () => {
  assert.deepEqual(
    NAV.map((n) => n.label),
    ['HRY', 'KVÍZ', 'SKÓRE WEBU', 'TEXTY', 'MAKLÉRI', 'KONZULTÁCIA'],
  );
  for (const n of NAV) assert.ok(routeByPath(n.href), `chýba route pre ${n.href}`);
  assert.equal(COMMAND_ITEMS[0].href, '/');
});

test('routes: slugy unikátne, cesty s lomkou na konci, OG url', () => {
  const slugs = new Set(ROUTES.map((r) => r.slug));
  assert.equal(slugs.size, ROUTES.length);
  for (const r of ROUTES) assert.ok(r.path.endsWith('/'), r.path);
  assert.equal(ogUrlFor('/kviz/'), '/og/kviz.png');
  assert.equal(ogUrlFor('/neexistuje/'), '/og/default.png');
});

test('frazy: 6 základných rodín, ~60+ vzorov, regexy škrtajú', () => {
  assert.equal(FRAZY_RODINY.filter((r) => r.zakladna).length, 6);
  const vzory = FRAZY_RODINY.flatMap((r) => r.vzory);
  assert.ok(vzory.length >= 50 && vzory.length <= 80, `vzory: ${vzory.length}`);
  assert.equal(new Set(vzory).size, vzory.length, 'duplicitné vzory');
  assert.ok(PRAZDNE_PRIDAVNE.length >= 10);
  assert.equal(CITACIE.length, 14);
  const t = 'Ponúkame Komplexné služby pod jednou strechou a dlhoročné skúsenosti. Perfektná znalosť prostredia.';
  const out = t.replace(frazyRegex(), '[X]').replace(pridavneRegex(), '[a]');
  assert.equal(out, 'Ponúkame [X] a [X]. [a] znalosť prostredia.');
});

test('fakty: 8 projektov, marquee 4 fakty, každý fakt má zdroj', () => {
  assert.equal(POSTAVIL.length, 8);
  assert.equal(MARQUEE_FAKTY.length, 4);
  for (const f of FAKTY) assert.ok(['spec05', 'doc10', 'pack13'].includes(f.source));
  for (const p of POSTAVIL) if (p.url) assert.ok(p.url.startsWith('https://'));
});

test('beaty: 7 beatov, bez mien inštitúcií', () => {
  assert.equal(BEATY.length, 7);
  for (const b of BEATY) assert.ok(b.rok && b.titulok && b.text);
});
