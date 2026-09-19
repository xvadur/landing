// Testy Škrtacieho testu (node --test): čistá funkcia skrtni() zo src/components/hry/skrtni.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skrtni, UKAZKA, VYNIMKY, pocetSlov } from '../src/components/hry/skrtni.ts';
import { FRAZY_RODINY } from '../src/data/frazy.ts';

test('ukážka: 11 škrtov, zostane menej slov než pôvodne, segmenty pokrývajú celý text', () => {
  const r = skrtni(UKAZKA);
  assert.equal(r.skrtov, 11);
  assert.equal(r.povodneSlova, pocetSlov(UKAZKA));
  assert.ok(r.zostaloSlov < r.povodneSlova);
  assert.equal(r.segmenty.map((s) => s.text).join(''), UKAZKA, 'segmenty = pôvodný text bez straty');
  assert.equal(r.skrtnute.length, r.skrtov);
  // každá škrtnutá fráza má rodinu zo zoznamu
  for (const s of r.segmenty.filter((x) => x.typ === 'fraza')) {
    assert.ok(FRAZY_RODINY.some((f) => f.rodina === s.rodina), `rodina ${s.rodina}`);
  }
});

test('veta Dňa 2 („Predaj držím osobne. Za mnou pracuje celý aparát.“) = 0 škrtov (výnimka osobne)', () => {
  assert.ok(VYNIMKY.has('osobne'));
  const r = skrtni('Predaj držím osobne. Za mnou pracuje celý aparát.');
  assert.equal(r.skrtov, 0);
  assert.equal(r.zostalo, 'Predaj držím osobne. Za mnou pracuje celý aparát.');
});

test('frázy majú prednosť pred prídavnými menami: žiadne prekrytie, rozsahy zoradené', () => {
  const veta = 'Individuálny prístup a skúsený tím.';
  const r = skrtni(veta);
  const frazy = r.segmenty.filter((s) => s.typ === 'fraza');
  const pridavne = r.segmenty.filter((s) => s.typ === 'pridavne');
  assert.equal(frazy.length, 1, JSON.stringify(r.segmenty));
  assert.equal(frazy[0].text.toLowerCase(), 'individuálny prístup');
  assert.equal(frazy[0].rodina, 'individuálny prístup');
  assert.equal(pridavne.length, 1, JSON.stringify(r.segmenty));
  assert.equal(pridavne[0].text.toLowerCase(), 'skúsený');
  assert.equal(r.skrtov, 2);
  let pos = 0;
  for (const s of r.segmenty) {
    assert.ok(s.text.length > 0);
    pos += s.text.length;
  }
  assert.equal(pos, veta.length);
  assert.equal(r.zostalo, 'a tím.');
});

test('okraje: prázdny text, interpunkcia po škrte, nový riadok', () => {
  const p = skrtni('');
  assert.equal(p.skrtov, 0);
  assert.equal(p.zostalo, '');
  const r = skrtni('Ponúkame komplexný servis, rýchlo.\nZavolajte.');
  assert.ok(r.skrtov >= 1);
  assert.ok(!/\s,/.test(r.zostalo), r.zostalo);
  assert.ok(r.zostalo.includes('\n'));
});
