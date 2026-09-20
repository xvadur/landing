/** Hero xvadur.com v4 — verzia 20. 9. (Adam): opona ako úvod, typografické hero, motto sa pred očami návštevníka
 *  „dešifruje" (React Bits DecryptedText, čistý React ~2 kB): po otvorení opony sa „DIVIDED," poskladá z rozmiešaných
 *  znakov, o 700 ms za ním „WE ARE USELESS." — raz, bez kurzora. Vracajúci sa návštevník (bez opony) to vidí hneď.
 *  Papier + zrno + jemné bodky ako pozadie; obrí wordmark (h1) s náklonom ±2° za kurzorom; CTA VSTÚP (Magnet +
 *  ClickSpark); pilulky. Ostrov <Hero client:load>, SSR = statické motto (Google, no-JS). Reduced motion: statický
 *  text (DecryptedText to rieši sám), opona sa nezobrazí. ASCII/shader vrstvy z 19.–20. 9. sú preč. */
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import DecryptedText from '@/components/vendor/reactbits/DecryptedText';
import Magnet from '@/components/vendor/reactbits/Magnet';
import ClickSpark from '@/components/vendor/reactbits/ClickSpark';
import { MQ_DESKTOP_POINTER, MQ_REDUCED, useMediaQuery } from '@/components/vendor/reactbits/motion-guards';
import { cn } from '@/lib/utils';
import {
  CTA,
  CTA_CLASS,
  INTRO,
  MOTTO_1,
  MOTTO_2,
  MOTTO_CLASS,
  MOTTO_LINE_CLASS,
  PILL_CLASS,
  PILULKY,
  TEZA,
  SCENA_SRC,
} from './hero-data';

import Wordmark from './Wordmark';
import Scena from './Scena';

/** Statický riadok motta — SSR, no-JS, reduced motion a stav pred otvorením opony. */
function Riadok({ text, hidden }: { text: string; hidden?: boolean }) {
  return (
    <span className={MOTTO_LINE_CLASS} style={hidden ? { visibility: 'hidden' } : undefined}>
      {text}
    </span>
  );
}

/** Riadok, ktorý sa dešifruje: sekvenčne od stredu, znaky brandu (X × . :) + veľké písmená. */
function Desifruj({ text, speed }: { text: string; speed: number }) {
  return (
    <DecryptedText
      text={text}
      animateOn="view"
      initialEncrypted
      sequential
      revealDirection="center"
      speed={speed}
      characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789X×.:;+-=/\\|_*#%&@$§¤¦<>[]{}()?!ÆØÐÞÅÄÖÜŠŽČŘŁ"
      parentClassName={MOTTO_LINE_CLASS}
      encryptedClassName="text-ink/40"
    />
  );
}

/** Náklon wordmarku za kurzorom: cieľ z pointeru, rAF lerp k cieľu (pružina bez knižnice), zápis do transform. */
function useNaklon(active: boolean) {
  const el = useRef<SVGSVGElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  const tick = useCallback(() => {
    const c = current.current;
    const t = target.current;
    c.x += (t.x - c.x) * 0.12;
    c.y += (t.y - c.y) * 0.12;
    if (el.current) el.current.style.transform = `rotateX(${(-c.y * 2.5).toFixed(3)}deg) rotate(${(c.x * 2).toFixed(3)}deg)`;
    if (Math.abs(t.x - c.x) > 0.002 || Math.abs(t.y - c.y) > 0.002) raf.current = requestAnimationFrame(tick);
    else raf.current = 0;
  }, []);

  const set = useCallback(
    (x: number, y: number) => {
      if (!active) return;
      target.current = { x, y };
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    },
    [active, tick],
  );

  useEffect(() => {
    if (active) return;
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    current.current = { x: 0, y: 0 };
    target.current = { x: 0, y: 0 };
    if (el.current) el.current.style.transform = '';
  }, [active]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return { el, set };
}

export default function Hero() {
  const desktop = useMediaQuery(MQ_DESKTOP_POINTER, false);
  const reduced = useMediaQuery(MQ_REDUCED, true);
  const animated = desktop && !reduced;

  /* motto štartuje až po opone (Opona.astro posiela `opona:done`); bez opony (druhá návšteva, reduced motion) hneď.
     Pred štartom je text v layoute, ale neviditeľný, aby sa po otvorení opony naozaj skladal pred očami. */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const [go, setGo] = useState(false);
  const [line2, setLine2] = useState(false);
  useEffect(() => {
    let t = 0;
    const start = () => {
      setGo(true);
      t = window.setTimeout(() => setLine2(true), 700);
    };
    if (!document.getElementById('opona')) start();
    else window.addEventListener('opona:done', start, { once: true });
    return () => {
      window.removeEventListener('opona:done', start);
      clearTimeout(t);
    };
  }, []);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);

  /* wordmark: náklon ±2° za kurzorom, len desktop s myšou */
  const naklon = useNaklon(animated);
  const sectionRef = useRef<HTMLElement>(null);
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!animated || e.pointerType !== 'mouse' || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    naklon.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onPointerLeave = () => naklon.set(0, 0);

  return (
    <section
      ref={sectionRef}
      className="tx-grain tx-dots relative overflow-hidden border-b-3 border-ink bg-paper [--tx:12%]"
      aria-label="Úvod"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      data-hero={animated ? 'animated' : 'static'}
    >

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-7xl flex-col px-4 pt-5 pb-6 sm:px-6 sm:pt-8 sm:pb-8 lg:px-10 lg:pb-10">
        {/* eyebrow vypustený (20. 9.): wordmark je h1, meno je v téze, pätičke a titulku */}
        <h1 ref={wordmarkRef} className="w-full max-w-[52rem]" style={{ perspective: 1200 }} data-hero-wordmark>
          <Wordmark
            ref={naklon.el}
            className="h-auto w-full origin-center will-change-transform [--wm-shadow:6px] sm:[--wm-shadow:11px]"
          />
        </h1>

        <p lang="en" className={cn('mt-6 sm:mt-8', MOTTO_CLASS)} style={{ fontVariationSettings: "'wdth' 100" }}>
          {go ? <Desifruj text={MOTTO_1} speed={70} /> : <Riadok text={MOTTO_1} hidden={hydrated} />}
          {line2 ? <Desifruj text={MOTTO_2} speed={55} /> : <Riadok text={MOTTO_2} hidden={hydrated} />}
        </p>

        {/* scéna: Adam s nástrojmi nad hlavou vypĺňa priestor medzi claimom a tézou */}
        <Scena src={SCENA_SRC} className="mt-8 sm:mt-10 lg:mt-6" />

        <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-8 lg:mt-auto lg:grid-cols-[1fr_auto] lg:items-end lg:pt-8">
          <div className="max-w-4xl lg:grid lg:grid-cols-2 lg:gap-x-8">
            <p className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{TEZA}</p>
            <p className="mt-3 max-w-xl text-base sm:mt-4 sm:text-lg lg:mt-0">{INTRO}</p>
            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-3 sm:mt-8 sm:gap-x-4 lg:col-span-2" role="list" aria-label="Sekcie">
              {PILULKY.map((p) => (
                <li key={p.href}>
                  <a href={p.href} className={cn(PILL_CLASS, p.bg, p.rotate)}>
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:justify-self-end">
            <Magnet padding={80} magnetStrength={3} className="w-full sm:w-auto">
              <ClickSpark sparkColor="hot" sparkSize={14} sparkRadius={28} sparkCount={8} className="w-full sm:w-auto">
                <a href={CTA.href} data-cursor="vstup" className={CTA_CLASS}>
                  {CTA.label}
                </a>
              </ClickSpark>
            </Magnet>
          </div>
        </div>
      </div>
    </section>
  );
}
