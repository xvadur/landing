/** Spoločný strážca pohybu pre vendorované Motion Primitives (xvadur.com v4).
 *  Pravidlo doc 10: pri prefers-reduced-motion je všetko 120 ms fade, efekty statické.
 *  SSR-stabilné: pri renderi na serveri vracia false, po mounte sa prepne podľa matchMedia. */
import { useEffect, useState } from 'react';

export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 1024px)';

/** 120 ms — zhoduje sa s --duration-fast v tokens.css. */
export const REDUCED_TRANSITION = { duration: 0.12, ease: 'linear' } as const;

export function useMediaFlag(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** true = používateľ chce menej pohybu. */
export function useReducedMotionFlag(): boolean {
  return useMediaFlag(REDUCED_QUERY);
}

/** true = desktop s myšou (≥ 1024 px, hover, jemný ukazovateľ) — kurzorové efekty len tu. */
export function useFinePointer(): boolean {
  return useMediaFlag(FINE_POINTER_QUERY);
}
