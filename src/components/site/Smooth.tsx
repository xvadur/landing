import { useEffect } from 'react';
import Lenis from 'lenis';

/** Lenis smooth scroll. Ostrov: <Smooth client:only="react" transition:persist />
 *  Vzniká na astro:page-load, zaniká na astro:before-swap; pri prefers-reduced-motion sa nespúšťa.
 *  Kto potrebuje inštanciu (GSAP ScrollTrigger), nájde ju vo window.__lenis. */
declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function create() {
  if (window.__lenis || reduced()) return;
  window.__lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    anchors: true,
  });
}

function destroy() {
  window.__lenis?.destroy();
  window.__lenis = null;
}

export default function Smooth() {
  useEffect(() => {
    create();
    const onLoad = () => create();
    const onSwap = () => destroy();
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => (mq.matches ? destroy() : create());
    document.addEventListener('astro:page-load', onLoad);
    document.addEventListener('astro:before-swap', onSwap);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('astro:page-load', onLoad);
      document.removeEventListener('astro:before-swap', onSwap);
      mq.removeEventListener('change', onMq);
      destroy();
    };
  }, []);
  return null;
}
