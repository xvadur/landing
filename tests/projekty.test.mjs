// Dôkazy domova (src/data/projekty.ts): každé číslo má účtenku, smie na web, odkazy len https / null.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROJEKTY, UCTENKA_RIADKY, MARQUEE_UCTENKY, fakt, pouziteKluce } from '../src/data/projekty.ts';
import { naWeb, uctenka, UCTENKY } from '../src/data/uctenky.ts';

test('projekty: 8 kariet, unikátne id, odkazy https alebo null', () => {
  assert.equal(PROJEKTY.length, 8);
  assert.equal(new Set(PROJEKTY.map((p) => p.id)).size, PROJEKTY.length);
  for (const p of PROJEKTY) {
    assert.ok(p.nazov && p.preKoho && p.riadok && p.stav.label, p.id);
    if (p.url) assert.ok(p.url.startsWith('https://'), p.url);
    assert.ok(p.fakty.length >= 2, `${p.id}: málo faktov`);
  }
});

test('každý použitý kľúč existuje v účtenkách, smie na web a nie je V OPRAVE', () => {
  const kluce = pouziteKluce();
  assert.ok(kluce.length >= 40);
  for (const k of kluce) {
    const u = uctenka(k); // hodí pri neznámom kľúči
    assert.ok(naWeb(u), `${k} má kde=„${u.kde}“`);
    assert.notEqual(u.peciatka, 'V_OPRAVE', `${k} je V OPRAVE — na web bez čísla`);
  }
});

test('fakt(): formátovaná hodnota so slovenskými medzerami', () => {
  const vlakna = fakt({ label: 'x', kluc: 'stroj.vlakna' });
  assert.equal(vlakna.hodnota, '1\u00a0518'); // pevná medzera (U+00A0)
  assert.equal(vlakna.jednotka, 'vlákien');
  const f1 = fakt({ label: 'x', kluc: 'postavil.netopier.f1' });
  assert.equal(f1.hodnota, '0,909');
  for (const r of [...UCTENKA_RIADKY, ...MARQUEE_UCTENKY]) assert.ok(fakt(r).hodnota !== '—', r.kluc);
});

test('žiadny projekt neodkazuje na doménu bez účtenky o HTTP 200', () => {
  const statusy = UCTENKY.filter((u) => /^postavil\.web\..*\.status$/.test(u.kluc) && u.hodnota === 200).map((u) => u.tvrdenie);
  for (const p of PROJEKTY.filter((p) => p.url)) {
    const host = new URL(p.url).host;
    assert.ok(statusy.some((t) => t.includes(host)), `${p.id}: ${host} nemá účtenku so statusom 200`);
  }
});
