/** V7-07 · navigácia po pavilónoch. Chodba je na desktope pinnutá a posúva sa vodorovne, takže kotva (#anamneza)
 *  by skočila na zlé miesto. `chod(id)` sa preto najprv opýta chodby (window.__v707chodba), kde v scrolli daný pavilón
 *  leží; inak skočí na prvok. Všetky odkazy s [data-chod="<id>"] (aj statické v Astro) obslúži delegovaný klik
 *  (zapnutý v ostrove Tabula). Udalosti medzi ostrovmi: v707:otvor (hra / projekt), v707:miesto (kde práve si). */
import type { MiestoId } from './data';

declare global {
  interface Window {
    __v707chodba?: { pozicia: (id: string) => number | null } | null;
  }
}

export const HORNA_LISTA = 64;

export type Otvor = { typ: 'hra' } | { typ: 'projekt'; id: string };
export const OTVOR = 'v707:otvor';
export const MIESTO = 'v707:miesto';

export function otvor(o: Otvor) {
  window.dispatchEvent(new CustomEvent<Otvor>(OTVOR, { detail: o }));
}

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function chod(id: MiestoId | string) {
  const cielChodby = window.__v707chodba?.pozicia(id) ?? null;
  const lenis = window.__lenis;
  const okamzite = reduced();
  if (cielChodby != null) {
    if (lenis) lenis.scrollTo(cielChodby, { immediate: okamzite, duration: 1.2 });
    else window.scrollTo({ top: cielChodby, behavior: okamzite ? 'auto' : 'smooth' });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -HORNA_LISTA + 1, immediate: okamzite, duration: 1.2 });
  else {
    const top = el.getBoundingClientRect().top + window.scrollY - HORNA_LISTA + 1;
    window.scrollTo({ top, behavior: okamzite ? 'auto' : 'smooth' });
  }
  // fokus pre klávesnicu a čítačku (bez ďalšieho skoku)
  window.setTimeout(() => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }, okamzite ? 0 : 900);
}

/** Delegovaný klik pre [data-chod] a [data-otvor-hru]. Vráti funkciu na odpojenie. */
export function zapniOdkazy(): () => void {
  const onClick = (e: MouseEvent) => {
    if (!(e.target instanceof Element)) return;
    const a = e.target.closest<HTMLElement>('[data-chod]');
    if (a) {
      e.preventDefault();
      chod(a.dataset.chod!);
      return;
    }
    const h = e.target.closest<HTMLElement>('[data-otvor-hru]');
    if (h) {
      e.preventDefault();
      otvor({ typ: 'hra' });
    }
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
