/** V7-09 · spoločné kúsky ostrovov: udalosti medzi ostrovmi (paleta ⌘K otvára hru, chorobopis, vyšetrenie),
 *  id vlastného toastera a malé háčiky. */
import { useEffect, useState } from 'react';

/** Toaster variantu (BoldKit sonner v Navigacia.tsx) — site Toaster z Base tieto hlásenia neukáže. */
export const TOASTER = 'z9';

export const UDALOST = {
  hra: 'z9:hra',
  projekt: 'z9:projekt',
  paleta: 'z9:paleta',
} as const;

export function posli(nazov: string, detail?: string) {
  window.dispatchEvent(new CustomEvent(nazov, { detail }));
}

/** Posun na kotvu cez Lenis (ak beží), inak natívne. */
export function scrollNa(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } | null }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -64 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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

export function useReduced() {
  const [r, setR] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return r;
}

/** Dátumy sa kreslia až v prehliadači (statické HTML by malo „dnes“ z času buildu). */
export function useKlient() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}

export const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');
