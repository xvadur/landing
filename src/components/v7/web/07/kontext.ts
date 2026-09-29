/** V7-07 · kontext chodby: či je aktívny vodorovný režim (desktop, výška ≥ 700 px, bez reduced motion). */
import * as React from 'react';

export const MQ_VODOROVNE = '(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)';

export const ChodbaKontext = React.createContext<{ vodorovne: boolean }>({ vodorovne: false });
export const useChodba = () => React.useContext(ChodbaKontext);

/** SSR a prvé vykreslenie = zvislý tok (mobil); po hydratácii sa desktop prepne na vodorovnú chodbu. */
export function useVodorovne(): boolean {
  const [v, setV] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(MQ_VODOROVNE);
    const nastav = () => setV(mq.matches);
    nastav();
    mq.addEventListener('change', nastav);
    return () => mq.removeEventListener('change', nastav);
  }, []);
  return v;
}

/** Malé okno (drawer namiesto dialógu, sheet zdola). */
export function useMaloOkno(): boolean {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const nastav = () => setM(mq.matches);
    nastav();
    mq.addEventListener('change', nastav);
    return () => mq.removeEventListener('change', nastav);
  }, []);
  return m;
}
