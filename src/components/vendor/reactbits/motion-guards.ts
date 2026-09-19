/** Spoločné stráže pohybu pre vendorované React Bits ostrovy (xvadur.com v4).
 *  Pravidlá z doc 10: prefers-reduced-motion → statický render (globálne CSS už robí 120 ms fade),
 *  efekty za kurzorom (magnet, tilt, scramble) len na jemnom ukazovateli s hoverom.
 *  Všetko je SSR-bezpečné: bez window vracia false, hooky štartujú na false a doplnia sa v useEffect. */
import { useEffect, useState } from 'react';

export const MQ_REDUCED = '(prefers-reduced-motion: reduce)';
export const MQ_FINE_POINTER = '(hover: hover) and (pointer: fine)';
export const MQ_DESKTOP_POINTER = '(hover: hover) and (pointer: fine) and (min-width: 1024px)';

function matches(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(query).matches;
}

/** true = používateľ nechce pohyb (alebo sme na serveri → true, aby SSR bol statický). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return matches(MQ_REDUCED);
}

/** true = myš/trackpad s hoverom (nie dotyk). */
export function hasFinePointer(): boolean {
  return matches(MQ_FINE_POINTER);
}

/** true = desktop s hoverom ≥ 1024 px (kurzorové efekty). */
export function isDesktopPointer(): boolean {
  return matches(MQ_DESKTOP_POINTER);
}

/** Reaktívny media query; na serveri a pred hydratáciou vracia `initial` (default false). */
export function useMediaQuery(query: string, initial = false): boolean {
  const [ok, setOk] = useState(initial);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    const update = () => setOk(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return ok;
}

/** true, kým nevieme inak (SSR, prvý render) → efekt sa zapne až po hydratácii. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(MQ_REDUCED, true);
}

/** Efekt smie bežať: hydratované, bez reduced motion, jemný ukazovateľ. */
export function usePointerEffectAllowed(desktopOnly = false): boolean {
  const reduced = usePrefersReducedMotion();
  const pointer = useMediaQuery(desktopOnly ? MQ_DESKTOP_POINTER : MQ_FINE_POINTER, false);
  return !reduced && pointer;
}

/** Prečíta farbu z tokenu (`hot` → `--color-hot`) pre canvas/JS, kde CSS var() nefunguje.
 *  Ak hodnota nie je názov tokenu, vráti ju tak, ako je (ľubovoľný CSS reťazec farby). */
export function resolveTokenColor(value: string, el?: Element | null): string {
  if (typeof window === 'undefined') return value;
  if (!/^[a-z][a-z0-9-]*$/.test(value)) return value;
  const target = el ?? document.documentElement;
  const css = getComputedStyle(target).getPropertyValue(`--color-${value}`).trim();
  return css || value;
}
