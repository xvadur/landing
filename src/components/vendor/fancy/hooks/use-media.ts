/** Pomocné hooky pre Fancy ostrovy (vlastné, xvadur.com v4).
 *  SSR-stabilné: na serveri vracajú `ssrDefault`, na klientovi sa po mount-e prepnú na skutočnú hodnotu. */
import { useEffect, useState } from 'react';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/** Desktop s myšou: jediné miesto, kde beží ImageTrail / kurzorové efekty (doc 10: nič pod 1024 px / na dotyku). */
export const FINE_POINTER_DESKTOP_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 1024px)';

/** Synchrónne (len v prehliadači) — pre efekty, ktoré sa rozhodujú mimo Reactu. */
export function matches(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(query).matches;
}

export function prefersReducedMotion(): boolean {
  return matches(REDUCED_MOTION_QUERY);
}

export function useMediaQuery(query: string, ssrDefault = false): boolean {
  const [value, setValue] = useState(ssrDefault);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    const update = () => setValue(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return value;
}

/** `true`, keď používateľ chce menej pohybu → komponent sa vykreslí staticky. */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY, false);
}

/** `true` len na desktope s myšou (≥ 1024 px, hover, jemný ukazovateľ). */
export function useFinePointerDesktop(): boolean {
  return useMediaQuery(FINE_POINTER_DESKTOP_QUERY, false);
}
