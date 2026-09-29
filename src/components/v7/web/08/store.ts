/** V7-08 · Nemocničný systém — spoločný stav okien pre všetky ostrovy stránky (ostrovy v Astre zdieľajú inštanciu modulu).
 *  Stav: otvorené / minimalizované / zatvorené, poradie navrchu (z), maximalizované okno. SSR = všetko otvorené,
 *  takže obsah je v HTML aj bez JS a bez klikania. Udalosti medzi ostrovmi idú cez window CustomEvent `v708:*`. */
import { useSyncExternalStore } from 'react';

export type OknoId =
  | 'prijem'
  | 'vitalne'
  | 'kamera'
  | 'dennik'
  | 'anamneza'
  | 'chorobopisy'
  | 'liecba'
  | 'hry'
  | 'vysetrenie'
  | 'zapis'
  | 'texty';

export type StavOkna = 'otvorene' | 'min' | 'zatvorene';

/** Poradie = poradie na ploche aj v paneli. `skratka` = názov v paneli a v ikonách. */
export const OKNA: { id: OknoId; nazov: string; skratka: string; subor: string }[] = [
  { id: 'prijem', nazov: 'Príjem', skratka: 'Príjem', subor: 'PRIJEM.EXE' },
  { id: 'vitalne', nazov: 'Vitálne funkcie', skratka: 'Vitálne', subor: 'KORPUS.MON' },
  { id: 'kamera', nazov: 'Kamera · sesterňa', skratka: 'Kamera', subor: 'KAMERA.CAM' },
  { id: 'dennik', nazov: 'Denník systému', skratka: 'Denník', subor: 'BOOT.LOG' },
  { id: 'anamneza', nazov: 'Anamnéza', skratka: 'Anamnéza', subor: 'ANAMNEZA.DIR' },
  { id: 'chorobopisy', nazov: 'Chorobopisy', skratka: 'Pacienti', subor: 'PACIENTI.DB' },
  { id: 'liecba', nazov: 'Liečba', skratka: 'Liečba', subor: 'LIECBA.DOC' },
  { id: 'hry', nazov: 'Hry', skratka: 'Hry', subor: 'HRY.EXE' },
  { id: 'vysetrenie', nazov: 'Vyšetrenie · formulár prijatia', skratka: 'Vyšetrenie', subor: 'PRIJATIE.FRM' },
  { id: 'zapis', nazov: 'Zápis', skratka: 'Zápis', subor: 'ZAPIS.FRM' },
  { id: 'texty', nazov: 'Texty', skratka: 'Texty', subor: 'TEXTY.TXT' },
];

export const nazovOkna = (id: OknoId) => OKNA.find((o) => o.id === id)?.nazov ?? id;

type Stav = {
  stav: Record<OknoId, StavOkna>;
  z: Record<OknoId, number>;
  max: OknoId | null;
  aktivne: OknoId | null;
};

const zaciatok = (): Stav => ({
  stav: Object.fromEntries(OKNA.map((o) => [o.id, 'otvorene'])) as Record<OknoId, StavOkna>,
  z: Object.fromEntries(OKNA.map((o, i) => [o.id, i + 1])) as Record<OknoId, number>,
  max: null,
  aktivne: null,
});

let stav: Stav = zaciatok();
const SSR = zaciatok();
let vrch = OKNA.length + 1;
const posluchaci = new Set<() => void>();

function zmen(f: (s: Stav) => Stav) {
  stav = f(stav);
  posluchaci.forEach((l) => l());
}

export function useSystem(): Stav {
  return useSyncExternalStore(
    (l) => {
      posluchaci.add(l);
      return () => posluchaci.delete(l);
    },
    () => stav,
    () => SSR,
  );
}

export function naVrch(id: OknoId) {
  if (stav.aktivne === id && stav.z[id] === vrch) return;
  vrch += 1;
  zmen((s) => ({ ...s, z: { ...s.z, [id]: vrch }, aktivne: id }));
}

export function nastavStav(id: OknoId, novy: StavOkna) {
  zmen((s) => ({
    ...s,
    stav: { ...s.stav, [id]: novy },
    max: novy !== 'otvorene' && s.max === id ? null : s.max,
    aktivne: novy === 'otvorene' ? id : s.aktivne === id ? null : s.aktivne,
  }));
  if (novy === 'otvorene') naVrch(id);
}

export function maximalizuj(id: OknoId | null) {
  zmen((s) => ({ ...s, max: id }));
  if (id) naVrch(id);
}

/** Otvorí okno (aj zatvorené/minimalizované), dá ho navrch a posunie stránku k nemu. */
export function otvorOkno(id: OknoId, { posun = true }: { posun?: boolean } = {}) {
  nastavStav(id, 'otvorene');
  if (!posun) return;
  window.setTimeout(() => {
    const el = document.getElementById(`okno-${id}`);
    if (!el) return;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenis) lenis.scrollTo(el, { offset: -72, immediate: reduced });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    window.dispatchEvent(new CustomEvent('v708:blik', { detail: id }));
  }, 40);
}

export function otvorVsetky() {
  zmen((s) => ({ ...s, stav: Object.fromEntries(OKNA.map((o) => [o.id, 'otvorene'])) as Record<OknoId, StavOkna> }));
}

/* ---------- udalosti medzi ostrovmi ---------- */

export type Udalost =
  | { typ: 'pacient'; id: string }
  | { typ: 'hra' }
  | { typ: 'paleta' }
  | { typ: 'prehliadka' }
  | { typ: 'hlasenie'; text: string; popis?: string; druh?: 'info' | 'success' | 'warning' | 'error' }
  | { typ: 'zapis'; zdroj: 'newsletter' | 'lakadlo' | 'cakacka'; produkt: string };

export function posli(u: Udalost) {
  window.dispatchEvent(new CustomEvent('v708', { detail: u }));
}

export function pocuvaj(f: (u: Udalost) => void) {
  const h = (e: Event) => f((e as CustomEvent<Udalost>).detail);
  window.addEventListener('v708', h);
  return () => window.removeEventListener('v708', h);
}
