// Termíny konzultácie (XDR-210): časové pásmo Bratislavy (CET/CEST), pravidlá dní a hodín.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slotIso, vsetkyTerminy, jePlatnySlot, TERMINY } from '../src/data/terminy.ts';

test('slotIso: leto CEST (+2) a zima CET (+1)', () => {
  assert.equal(slotIso('2026-09-28', '14:00'), '2026-09-28T12:00:00.000Z');
  assert.equal(slotIso('2026-11-02', '14:00'), '2026-11-02T13:00:00.000Z');
});

test('vsetkyTerminy: iba pracovné dni, najskôr o 24 h, najďalej 14 dní', () => {
  const teraz = new Date('2026-09-26T18:00:00Z'); // sobota večer
  const dni = vsetkyTerminy(teraz);
  assert.ok(dni.length >= 9 && dni.length <= 11, `dni: ${dni.length}`);
  for (const d of dni) {
    const [y, m, dd] = d.datum.split('-').map(Number);
    assert.ok(TERMINY.dni.includes(new Date(Date.UTC(y, m - 1, dd)).getUTCDay()), d.datum);
    for (const s of d.sloty) assert.ok(new Date(s).getTime() >= teraz.getTime() + 24 * 3600_000);
  }
  assert.equal(dni[0].datum, '2026-09-28');
  assert.ok(jePlatnySlot('2026-09-28T12:00:00.000Z', teraz));
  assert.ok(!jePlatnySlot('2026-09-27T12:00:00.000Z', teraz)); // nedeľa
  assert.ok(!jePlatnySlot('2026-09-28T12:30:00.000Z', teraz)); // mimo mriežky
});
