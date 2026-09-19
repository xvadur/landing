/** Hero xvadur.com v4 (doc 10 §4, ratifikácie 19. 9.): papier + dither (desktop) / zrno (mobil), obrí wordmark
 *  s náklonom ±2° za kurzorom (CSS transform + rAF lerp, bez Motion), motto „DIVIDED," / „WE ARE USELESS." — písmená
 *  vstupujú po znakoch (GSAP SplitText, wdth 75 → 100) a potom šírka dýcha (utilita wdth-breathe); CTA VSTÚP (Magnet +
 *  ClickSpark) vpravo dole; pilulky na sekcie. Ostrov: <Hero client:load> — SSR z tohto súboru (statická vetva) je
 *  zároveň no-JS/SEO HTML, žiadny duplicitný fallback.
 *  Rozpočet: GSAP (SplitText) aj shader sa ťahajú lazy a len na desktope ≥ 1024 px s hoverom bez reduced motion;
 *  mobil dostane statické motto, statické zrno, 0 kB GSAP a 0 kB Motion. Pravidlo enginov: CSS = wordmark, GSAP = motto —
 *  nikdy oba na jednom prvku (po skončení GSAP sa inline hodnoty vyčistia a až potom nastúpi CSS dýchanie).
 *  Odolnosť: lazy chunky majú `.catch` → statický variant; Hranica (error boundary) drží obsah pri chybe za behu. */
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
  WORDMARK,
} from './hero-data';

/** Statický riadok motta — SSR, mobil, reduced motion a fallback, keď GSAP chunk nepríde. */
function Riadok({ text }: { text: string }) {
  return <span className={MOTTO_LINE_CLASS}>{text}</span>;
}

type SplitProps = import('@/components/vendor/reactbits/SplitText').SplitTextProps;
/** Náhrada za SplitText, keď chunk nepríde: statický riadok, ktorý hneď ohlási „hotovo" (aby nastúpil 2. riadok a dýchanie). */
function RiadokNahrada({ text, onLetterAnimationComplete }: SplitProps) {
  useEffect(() => {
    onLetterAnimationComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Riadok text={text} />;
}
/** Keď chunk SplitText zlyhá (sieť, starý HTML po deployi), riadok ostane statický — hero nikdy nezmizne. */
const SplitText = lazy(() =>
  import('@/components/vendor/reactbits/SplitText').catch(() => ({ default: RiadokNahrada })),
);
const Dither = lazy(() => import('./Dither').catch(() => ({ default: () => null })));

const SPLIT_FROM = { opacity: 0, y: 48, fontVariationSettings: "'wdth' 75" };
const SPLIT_TO = { opacity: 1, y: 0, fontVariationSettings: "'wdth' 100" };

/** Náklon wordmarku za kurzorom: cieľ z pointeru, rAF lerp k cieľu (pružina bez knižnice), zápis do transform. */
function useNaklon(active: boolean) {
  const el = useRef<HTMLImageElement>(null);
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

  /* fonty: motto sa ukáže až po načítaní Bricolage (SplitText čaká na to isté) */
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    if (!('fonts' in document)) {
      setFontsReady(true);
      return;
    }
    let alive = true;
    document.fonts.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  /* motto: riadok 2 nastúpi, keď riadok 1 dokončí vstup (callback SplitText, nie časovač); po skončení → CSS dýchanie */
  const [line2, setLine2] = useState(false);
  const [breathe, setBreathe] = useState(false);
  const mottoRef = useRef<HTMLParagraphElement>(null);
  const onLine1Done = useCallback(() => setLine2(true), []);
  const onMottoDone = useCallback(() => {
    // GSAP je hotový: vyčistiť inline font-variation-settings na znakoch, aby sa dedilo CSS dýchanie z rodiča
    mottoRef.current?.querySelectorAll<HTMLElement>('.split-char').forEach((c) => {
      c.style.fontVariationSettings = '';
    });
    setBreathe(true);
  }, []);

  /* wordmark: náklon ±2° za kurzorom, len desktop s myšou */
  const naklon = useNaklon(animated);
  const sectionRef = useRef<HTMLElement>(null);
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!animated || e.pointerType !== 'mouse' || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    naklon.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onPointerLeave = () => naklon.set(0, 0);

  const mottoVisible = !animated || fontsReady;

  return (
    <section
      ref={sectionRef}
      className="tx-grain relative overflow-hidden border-b-3 border-ink bg-paper"
      aria-label="Úvod"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      data-hero={animated ? 'animated' : 'static'}
    >
      {animated && (
        <Hranica>
          <Suspense fallback={null}>
            <Dither />
          </Suspense>
        </Hranica>
      )}

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-7xl flex-col px-4 pt-5 pb-6 sm:px-6 sm:pt-8 sm:pb-8 lg:px-10 lg:pb-10">
        <p className="eyebrow">{EYEBROW}</p>

        <h1 className="mt-4 w-full max-w-[52rem] sm:mt-6" style={{ perspective: 1200 }}>
          <img
            ref={naklon.el}
            src={WORDMARK.src}
            alt="XVADUR"
            width={WORDMARK.width}
            height={WORDMARK.height}
            className="h-auto w-full origin-center drop-shadow-[8px_8px_0_var(--color-ink)] will-change-transform sm:drop-shadow-[11px_11px_0_var(--color-ink)]"
            fetchPriority="high"
            decoding="async"
          />
        </h1>

        <p
          ref={mottoRef}
          lang="en"
          className={cn('mt-6 sm:mt-8', MOTTO_CLASS, breathe && 'wdth-breathe')}
          style={{
            visibility: mottoVisible ? 'visible' : 'hidden',
            fontVariationSettings: "'wdth' 100",
            animationDirection: breathe ? 'alternate-reverse' : undefined,
          }}
        >
          {animated ? (
            <Hranica
              fallback={
                <>
                  <Riadok text={MOTTO_1} />
                  <Riadok text={MOTTO_2} />
                </>
              }
            >
              {/* fallback Suspense = viditeľný statický text; SplitText si pri mount-e nastaví `from` sám */}
              <Suspense fallback={<Riadok text={MOTTO_1} />}>
                <SplitText
                  text={MOTTO_1}
                  tag="span"
                  className={cn(MOTTO_LINE_CLASS, 'overflow-visible')}
                  splitType="chars"
                  delay={45}
                  duration={0.9}
                  ease="power3.out"
                  from={SPLIT_FROM}
                  to={SPLIT_TO}
                  immediate
                  onLetterAnimationComplete={onLine1Done}
                />
              </Suspense>
              {line2 ? (
                <Suspense fallback={<Riadok text={MOTTO_2} />}>
                  <SplitText
                    text={MOTTO_2}
                    tag="span"
                    className={cn(MOTTO_LINE_CLASS, 'overflow-visible')}
                    splitType="chars"
                    delay={40}
                    duration={0.9}
                    ease="power3.out"
                    from={SPLIT_FROM}
                    to={SPLIT_TO}
                    immediate
                    onLetterAnimationComplete={onMottoDone}
                  />
                </Suspense>
              ) : (
                <span className={cn(MOTTO_LINE_CLASS, 'invisible')} aria-hidden="true">
                  {MOTTO_2}
                </span>
              )}
            </Hranica>
          ) : (
            <>
              <Riadok text={MOTTO_1} />
              <Riadok text={MOTTO_2} />
            </>
          )}
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
