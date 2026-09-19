/** Čistá logika kvízu (bez React, bez window) — vetvenie, skóre, strata, výber prvého kroku, payload.
 *  Testovateľné z node: import { vyhodnot } from './logika'. */
import { ZAKLADNE, DOPLNKOVE, type Otazka, type OtazkaId, type OtazkaCislo } from '@/data/kviz/otazky';
import { KROKY, SEGMENTY, TYZDNOV_ROCNE, type Krok, type Segment } from '@/data/kviz/kroky';

export type Odpovede = Partial<Record<OtazkaId, string | number>>;

/** Dlhšia vetva (+5): firma, prenos/rozhodovanie alebo už skúšaná automatizácia — treba vedieť o postupe, kontrole a prístupoch. */
export function dlhaVetva(o: Odpovede): boolean {
  return (
    o.kto === 'firma' ||
    o.opakuje === 'prenos' ||
    o.opakuje === 'rozhodovanie' ||
    o.skusal === 'automatizacia' ||
    o.skusal === 'nasadene'
  );
}

/** Poradie otázok podľa doterajších odpovedí: 5 základných + 2 alebo 5 doplnkových. */
export function otazkyPre(o: Odpovede): Otazka[] {
  // doplnkové „vždy“ sa ukazujú od začiatku (minimum je 7); dlhšia vetva sa rozhodne až po základných
  const zakladneHotove = ZAKLADNE.every((q) => o[q.id] !== undefined && o[q.id] !== '');
  const dlha = zakladneHotove && dlhaVetva(o);
  return [...ZAKLADNE, ...DOPLNKOVE.filter((q) => q.vzdy || dlha)];
}

export function pocetOtazok(o: Odpovede): number {
  return otazkyPre(o).length;
}

/** Celé nezáporné číslo (vstup je celočíselný: hodiny 0–80, sadzba 0–500; desatinné sa zaokrúhli). */
function cislo(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

/** Ročná strata v € = hodiny × 46 × sadzba (spec 05 §3). */
export function strataRocne(hodiny: number, sadzba: number): number {
  return Math.round(cislo(hodiny) * TYZDNOV_ROCNE * cislo(sadzba));
}

function bodyZa(q: Otazka, v: string | number | undefined): { body: number; max: number } {
  if (q.typ === 'cislo') {
    const c = q as OtazkaCislo;
    if (c.body === 0) return { body: 0, max: 0 };
    const plny = c.plnyBodPri ?? c.max;
    return { body: Math.min(cislo(v) / plny, 1) * c.body, max: c.body };
  }
  const max = Math.max(...q.moznosti.map((m) => m.body));
  const m = q.moznosti.find((x) => x.value === v);
  return { body: m ? m.body : 0, max };
}

/** Strop skóre bez vlastníka výsledku: pack 04 kladie vlastníka a kritérium pred všetko ostatné
 *  („Inak by sme automatizovali neistotu.“), preto bez vlastníka skóre nikdy nedosiahne pásmo „Prvý úsek“. */
export const STROP_BEZ_VLASTNIKA = 39;

/** Skóre 0–100 = súčet bodov za odpovede / maximum dosiahnuteľné v danej vetve × 100;
 *  ak výsledok nemá vlastníka (vlastnik = nikto), skóre je najviac STROP_BEZ_VLASTNIKA. */
export function skore(o: Odpovede): number {
  const otazky = otazkyPre(o);
  let sucet = 0;
  let max = 0;
  for (const q of otazky) {
    const b = bodyZa(q, o[q.id]);
    sucet += b.body;
    max += b.max;
  }
  if (max === 0) return 0;
  const s = Math.max(0, Math.min(100, Math.round((sucet / max) * 100)));
  return o.vlastnik === 'nikto' ? Math.min(s, STROP_BEZ_VLASTNIKA) : s;
}

/** Pásmo skóre — jedna veta, čo znamená. */
export function pasmo(s: number): { nazov: string; veta: string } {
  if (s < 40) return { nazov: 'Najprv poriadok', veta: 'Chýba vlastník, kritérium alebo podklady. AI by automatizovala neistotu.' };
  if (s < 70) return { nazov: 'Prvý úsek', veta: 'Jedna úloha sa dá ohraničiť a overiť. Začni ňou, nie celou firmou.' };
  return { nazov: 'Pripravený', veta: 'Opakuje sa, podklady sú, výsledok má vlastníka. Chýba len postaviť postup.' };
}

/** Jeden prvý krok z tabuľky packu 04. Poradie pravidiel: bez vlastníka → vlastník; nejasné zadanie → vstup + šablóna;
 *  text → kontext + prompt; prenos → automatizácia (ak je postup stabilný) alebo agent; rozhodovanie → agent
 *  (alebo automatizácia, ak sa ukáže, že postup je vždy rovnaký). */
export function prvyKrok(o: Odpovede): Krok {
  const by = (slug: Krok['slug']) => KROKY.find((k) => k.slug === slug)!;
  if (o.vlastnik === 'nikto') return by('vlastnik');
  if (o.opakuje === 'nejasne') return by('vstup-sablona');
  if (o.opakuje === 'text') return by('kontext-prompt');
  if (o.opakuje === 'prenos') return o.stabilny === 'kazdy' ? by('agent') : by('automatizacia');
  if (o.opakuje === 'rozhodovanie') return o.stabilny === 'ano' ? by('automatizacia') : by('agent');
  return by('vstup-sablona');
}

export function segment(o: Odpovede): Segment {
  return SEGMENTY.find((s) => s.slug === o.kto) ?? SEGMENTY[0];
}

export type Vysledok = {
  segment: Segment;
  hodiny: number;
  sadzba: number;
  strata: number;
  skore: number;
  pasmo: { nazov: string; veta: string };
  krok: Krok;
  pocetOtazok: number;
};

export function vyhodnot(o: Odpovede): Vysledok {
  const hodiny = cislo(o.hodiny);
  const sadzba = cislo(o.sadzba);
  const s = skore(o);
  return {
    segment: segment(o),
    hodiny,
    sadzba,
    strata: strataRocne(hodiny, sadzba),
    skore: s,
    pasmo: pasmo(s),
    krok: prvyKrok(o),
    pocetOtazok: pocetOtazok(o),
  };
}

/** Zdieľaný kontrakt s /konzultacia/: z=kviz&kto=<segment>&hodiny=<n>&sadzba=<n>&krok=<slug>. */
export function konzultaciaUrl(v: Vysledok): string {
  const p = new URLSearchParams({
    z: 'kviz',
    kto: v.segment.slug,
    hodiny: String(v.hodiny),
    sadzba: String(v.sadzba),
    krok: v.krok.slug,
  });
  return `/konzultacia/?${p.toString()}`;
}

export const SK = new Intl.NumberFormat('sk-SK', { maximumFractionDigits: 0 });
export function eur(n: number): string {
  return `${SK.format(n)} €`;
}

/** Text výsledku na kopírovanie. */
export function textVysledku(v: Vysledok): string {
  return [
    'AI-readiness kvíz — xvadur.com/kviz/',
    '',
    `Kto: ${v.segment.label}`,
    `Strata za rok: ${eur(v.strata)} (${SK.format(v.hodiny)} h × ${TYZDNOV_ROCNE} týždňov × ${SK.format(v.sadzba)} €)`,
    `Skóre pripravenosti: ${v.skore} / 100 — ${v.pasmo.nazov}`,
    `Prvý krok: ${v.krok.krok}`,
    `Dôvod: ${v.krok.dovod}`,
    '',
    `Konzultácia: https://xvadur.com${konzultaciaUrl(v)}`,
  ].join('\n');
}
