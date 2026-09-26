/** Termíny konzultácie (XDR-210). Pravidlá dostupnosti — NÁVRH, Adam potvrdí: pondelok až piatok, poobede a večer
 *  (Adam pracuje hlavne poobede a večer), 30 minút, najskôr o 24 hodín, najďalej 14 dní dopredu. Čas Europe/Bratislava.
 *  Obsadené termíny drží úložisko (API /api/rezervacia/), tu sú len pravidlá. Zdieľa server (API) aj klient (widget). */

export const TERMINY = {
  dni: [1, 2, 3, 4, 5] as number[], // 1 = pondelok … 5 = piatok
  casy: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  trvanieMin: 30,
  najskorHodin: 24,
  dopreduDni: 14,
  zona: 'Europe/Bratislava',
};

/** Posun časovej zóny Bratislavy voči UTC v minútach pre daný UTC okamih (CET +60 / CEST +120). */
function posunMin(d: Date): number {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: TERMINY.zona,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(d);
  const g = (t: string) => Number(f.find((p) => p.type === t)!.value);
  const lokal = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'));
  return Math.round((lokal - d.getTime()) / 60000);
}

/** „2026-10-01“ + „17:00“ v Bratislave → UTC ISO. */
export function slotIso(datum: string, cas: string): string {
  const [y, m, d] = datum.split('-').map(Number);
  const [h, min] = cas.split(':').map(Number);
  const odhad = new Date(Date.UTC(y!, m! - 1, d!, h!, min!));
  const posun = posunMin(odhad);
  return new Date(odhad.getTime() - posun * 60000).toISOString();
}

export type Den = { datum: string; sloty: string[] };

/** Všetky termíny podľa pravidiel (bez obsadenosti), od `teraz`. Vracia dni v Bratislavskom kalendári. */
export function vsetkyTerminy(teraz = new Date()): Den[] {
  const dni: Den[] = [];
  const min = teraz.getTime() + TERMINY.najskorHodin * 3600_000;
  for (let i = 0; i <= TERMINY.dopreduDni; i++) {
    const t = new Date(teraz.getTime() + i * 86400_000);
    const datum = new Intl.DateTimeFormat('en-CA', { timeZone: TERMINY.zona }).format(t); // YYYY-MM-DD
    if (dni.some((d) => d.datum === datum)) continue;
    const [y, m, d] = datum.split('-').map(Number);
    const denTyzdna = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
    if (!TERMINY.dni.includes(denTyzdna)) continue;
    const sloty = TERMINY.casy.map((c) => slotIso(datum, c)).filter((iso) => new Date(iso).getTime() >= min);
    if (sloty.length) dni.push({ datum, sloty });
  }
  return dni;
}

export function jePlatnySlot(iso: string, teraz = new Date()): boolean {
  return vsetkyTerminy(teraz).some((d) => d.sloty.includes(iso));
}
