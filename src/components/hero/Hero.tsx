/** Hero xvadur.com v4 — verzia 19. 9. večer (Adam: ASCII namiesto ditheru, motto bez dýchania, opona ako úvod webu).
 *  Papier + zrno, cez celý hero ASCII šumové pole (Ascii.tsx, Canvas 2D, 0 kB knižníc), v ktorom sa pod wordmarkom
 *  skladá motto „DIVIDED," / „WE ARE USELESS." zo znakov, drží a rozpadá sa v slučke — bez kurzora. Obrí wordmark
 *  s náklonom ±2° za kurzorom (CSS transform + rAF lerp). Typografické motto stojí staticky na wdth 100 (kondenzované
 *  75 pôsobilo stiesnene); keď ASCII beží, <p> sa schová cez opacity — layout, Google aj čítačky ho majú ďalej.
 *  CTA VSTÚP (Magnet + ClickSpark) vpravo dole; pilulky na sekcie. Ostrov: <Hero client:load> — SSR z tohto súboru
 *  je zároveň no-JS/SEO HTML. Reduced motion: bez ASCII, statické motto. Ascii sa ťahá lazy s `.catch`; Hranica
 *  (error boundary) drží obsah pri chybe za behu. GSAP/SplitText/Dither už hero nepoužíva. */
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Magnet from '@/components/vendor/reactbits/Magnet';
import ClickSpark from '@/components/vendor/reactbits/ClickSpark';
import { MQ_DESKTOP_POINTER, MQ_REDUCED, useMediaQuery } from '@/components/vendor/reactbits/motion-guards';
import Hranica from '@/components/home/Hranica';
import { cn } from '@/lib/utils';
import {
  CTA,
  CTA_CLASS,
  EYEBROW,
  INTRO,
  MOTTO_1,
  MOTTO_2,
  MOTTO_CLASS,
  MOTTO_LINE_CLASS,
  PILL_CLASS,
  PILULKY,
  TEZA,
} from './hero-data';

/** Statický riadok motta — SSR aj klient (motto je typograficky statické; pohyb robí ASCII vrstva). */
function Riadok({ text }: { text: string }) {
  return <span className={MOTTO_LINE_CLASS}>{text}</span>;
}

import Wordmark from './Wordmark';

/** ASCII vrstva lazy; keď chunk nepríde, hero ostane s typografickým mottom. */
type AsciiProps = import('./Ascii').AsciiProps;
const Ascii = lazy(() =>
  import('./Ascii').catch(() => ({ default: (_p: AsciiProps) => null as unknown as React.JSX.Element })),
);

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

  /* ASCII beží všade okrem reduced motion (aj mobil — Canvas 2D je lacný); po prvom frame schováme typografické motto */
  const ascii = !reduced;
  const [asciiOn, setAsciiOn] = useState(false);
  const onAsciiReady = useCallback(() => setAsciiOn(true), []);
  const mottoRef = useRef<HTMLParagraphElement>(null);

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
      className="tx-grain relative overflow-hidden border-b-3 border-ink bg-paper"
      aria-label="Úvod"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      data-hero={animated ? 'animated' : 'static'}
      data-ascii={asciiOn ? 'on' : 'off'}
    >
      {ascii && (
        <Hranica>
          <Suspense fallback={null}>
            <Ascii host={sectionRef} motto={mottoRef} onReady={onAsciiReady} />
          </Suspense>
        </Hranica>
      )}

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-7xl flex-col px-4 pt-5 pb-6 sm:px-6 sm:pt-8 sm:pb-8 lg:px-10 lg:pb-10">
        <p className="eyebrow">{EYEBROW}</p>

        <h1 className="mt-4 w-full max-w-[52rem] sm:mt-6" style={{ perspective: 1200 }}>
          <Wordmark
            ref={naklon.el}
            className="h-auto w-full origin-center will-change-transform [--wm-shadow:6px] sm:[--wm-shadow:11px]"
          />
        </h1>

        <p
          ref={mottoRef}
          lang="en"
          className={cn('mt-6 transition-opacity duration-300 sm:mt-8', MOTTO_CLASS, asciiOn && 'opacity-0')}
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <Riadok text={MOTTO_1} />
          <Riadok text={MOTTO_2} />
        </p>

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
