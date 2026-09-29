/** V7-04 · zdieľaný stav medzi ostrovmi (páska vľavo, náramok hore): aktuálna triážna úroveň.
 *  ES modul je v prehliadači jeden, preto oba ostrovy čítajú ten istý stav cez useSyncExternalStore.
 *  Podpisový pohyb: keď do stredu obrazovky vojde zóna, páska sa prefarbí (CSS premenná podľa [data-z] na .t-ram)
 *  a na hlavičku zóny „udrie“ pečiatka (trieda .udrel → @keyframes t-uder s --bk-ease-stamp, t04.css). */
import { useEffect, useState, useSyncExternalStore } from 'react';

let zona = 1;
const odber = new Set<() => void>();
let spustene = false;
let posledneUdrel = 0;

function ohlas() {
  for (const f of odber) f();
}

function prihlas(f: () => void) {
  odber.add(f);
  return () => odber.delete(f);
}

export function useZona(): number {
  return useSyncExternalStore(
    prihlas,
    () => zona,
    () => 1,
  );
}

/** Pečiatka udrie na hlavičku zóny (znova pri každom vstupe). */
export function udri(n: number) {
  const sekcia = document.querySelector<HTMLElement>(`[data-zona="${n}"]`);
  const pec = sekcia?.querySelector<HTMLElement>('[data-peciatka]');
  if (!sekcia || !pec) return;
  pec.classList.remove('udrel');
  sekcia.classList.remove('otras');
  void pec.offsetWidth; // reštart animácie
  pec.classList.add('udrel');
  sekcia.classList.add('otras');
  posledneUdrel = n;
}

let pripravene = false;

function nastav(n: number) {
  const zmena = n !== zona;
  zona = n;
  const ram = document.querySelector<HTMLElement>('.t-ram');
  if (ram) ram.dataset.z = String(n);
  if (zmena) ohlas();
  if (pripravene && posledneUdrel !== n) udri(n);
}

/** Sledovanie zón: zóna je aktuálna, keď pretína vodorovnú čiaru v 40 % výšky okna. Spustí sa raz. */
export function spustiSledovanie() {
  if (spustene || typeof window === 'undefined') return;
  spustene = true;
  const sekcie = [...document.querySelectorAll<HTMLElement>('[data-zona]')];
  if (!sekcie.length) return;
  const viditelne = new Map<number, boolean>();
  const io = new IntersectionObserver(
    (zaznamy) => {
      for (const z of zaznamy) viditelne.set(Number((z.target as HTMLElement).dataset.zona), z.isIntersecting);
      const aktivne = [...viditelne.entries()].filter(([, v]) => v).map(([k]) => k);
      if (aktivne.length) nastav(Math.max(...aktivne));
    },
    { rootMargin: '-40% 0px -59% 0px', threshold: 0 },
  );
  sekcie.forEach((s) => io.observe(s));

  // prvá pečiatka až po opone (alebo hneď, keď opona nie je)
  const prva = () =>
    window.setTimeout(() => {
      pripravene = true;
      udri(zona);
    }, 120);
  if (document.getElementById('opona04')) window.addEventListener('opona:done', prva, { once: true });
  else prva();
}

/** Plynulý posun na kotvu (Lenis, ak beží; inak natívne). Odsadenie = výška náramku. */
export function chodNa(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: { offset?: number }) => void } | null }).__lenis;
  const offset = window.matchMedia('(min-width: 1024px)').matches ? -72 : -76;
  if (lenis) lenis.scrollTo(el, { offset });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });
}

/* ---------------- pomôcky ---------------- */

/** true pod 640 px — sheet zdola, drawer namiesto dialógu. */
export function useMaloOkno(query = '(max-width: 639px)') {
  const [malo, setMalo] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMalo(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return malo;
}

/** true až v prehliadači (dátumy „dnes“ sa nevykresľujú na serveri). */
export function useKlient() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}

export function useMedia(query: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}
