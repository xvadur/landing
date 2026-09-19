import { lazy, Suspense, useEffect, useState } from 'react';

/** Ostrov: <Cursor client:only="react" transition:persist />
 *  Tenký obal: na desktope (hover + fine pointer + ≥ 1024 px, bez reduced motion) lazy načíta CursorX (Motion).
 *  Na mobile / dotyku / reduced motion nenačíta nič — nulový JS navyše. */
const CursorX = lazy(() => import('./CursorX'));

export function wantsCursor() {
  if (typeof window === 'undefined') return false;
  const desktop = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return desktop && !reduced;
}

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const update = () => setEnabled(wantsCursor());
    update();
    const mqs = [
      window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];
    mqs.forEach((m) => m.addEventListener('change', update));
    return () => mqs.forEach((m) => m.removeEventListener('change', update));
  }, []);
  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <CursorX />
    </Suspense>
  );
}
