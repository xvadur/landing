/** V7-05 · Komiks — hlavný motor a podpis strany (Motion, vanilla `motion`, bez Reactu):
 *  1. Panely [data-panel] „vpadnú“ pri vstupe do obrazu: pád zhora s prekmitom (y, scale, rotate), potom krátke
 *     zatrasenie (x). Po štarte dostane panel [data-in] → CSS nafúkne bubliny a onomatopoje (--bk-ease-rubber).
 *  2. Podpis „tlač s posunom farieb“: pri rýchlejšom scrollovaní sa na zlomok sekundy (200 ms) posunú farebné platne
 *     rámov (stamp a žltá) proti ink rámu podľa smeru scrollu (.k05[data-tlac], --k-reg); potom zacvaknú späť.
 *  GSAP sa na strane nepoužíva; Motion hýbe iba obalmi panelov, CSS iba ich pseudo-prvkami a deťmi.
 *  Reduced motion: panely hneď viditeľné, žiadna tlač. */
import { animate, inView } from 'motion';

type Stop = () => void;
let stopy: Stop[] = [];

function init() {
  zrus();
  (window as unknown as { __k05motion?: boolean }).__k05motion = true;
  const strana = document.querySelector<HTMLElement>('.k05');
  if (!strana) return;
  const panely = Array.from(strana.querySelectorAll<HTMLElement>('[data-panel]'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    panely.forEach((p) => p.setAttribute('data-in', ''));
    return;
  }

  panely.forEach((p, i) => {
    const r = Number(p.dataset.rot ?? (i % 2 ? 1.6 : -1.6));
    const stop = inView(
      p,
      () => {
        p.setAttribute('data-in', '');
        animate(
          p,
          { opacity: [0, 1, 1], y: [-70, 10, 0], scale: [1.06, 0.98, 1], rotate: [r * 2.2, -r * 0.6, 0] },
          { duration: 0.46, times: [0, 0.72, 1], ease: ['easeIn', 'easeOut'] },
        ).then(() => animate(p, { x: [0, -5, 5, -3, 2, 0] }, { duration: 0.26, ease: 'linear' }));
      },
      { amount: 0.18 },
    );
    stopy.push(stop);
  });

  // podpis: posun farebných platní pri scrollovaní
  let posledneY = window.scrollY;
  let posledneT = performance.now();
  let aktivne = false;
  let chladne = 0;
  let casovac = 0;
  const onScroll = () => {
    const t = performance.now();
    const y = window.scrollY;
    const dt = Math.max(8, t - posledneT);
    const v = (y - posledneY) / dt; // px / ms
    posledneY = y;
    posledneT = t;
    if (aktivne || t < chladne || Math.abs(v) < 0.35) return;
    aktivne = true;
    const smer = Math.sign(v) * Math.min(1, Math.abs(v) / 1.6 + 0.4);
    strana.style.setProperty('--k-reg', smer.toFixed(2));
    strana.setAttribute('data-tlac', '');
    window.clearTimeout(casovac);
    casovac = window.setTimeout(() => {
      strana.removeAttribute('data-tlac');
      strana.style.setProperty('--k-reg', '0');
      aktivne = false;
      chladne = performance.now() + 420;
    }, 200);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  stopy.push(() => {
    window.removeEventListener('scroll', onScroll);
    window.clearTimeout(casovac);
  });
}

function zrus() {
  stopy.forEach((s) => s());
  stopy = [];
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', zrus);
