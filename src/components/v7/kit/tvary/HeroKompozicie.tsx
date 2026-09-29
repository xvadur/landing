/** Katalóg V7 · tri kompozície hero pozadia / rámu okolo zástupnej fotky Adama (4 : 5, štítok FOTKA ADAMA).
 *  Na webe hero nasleduje po opone (src/components/home/Opona.astro) — každá kompozícia má tlačidlo „Prehrať oponu“,
 *  ktoré oponu zjednodušene zopakuje nad kompozíciou. Zdravotnícka línia: monitor, EKG, triáž, fonendoskop. */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Stamp, Sticker, StickyNote } from '@/components/ui/sticker';
import { LayeredCard } from '@/components/ui/layered-card';
import { Marquee, MarqueeItem, MarqueeSeparator } from '@/components/ui/marquee';
import { MathCurveBackground } from '@/components/ui/math-curve-background';
import { AsciiPulse } from '@/components/ui/ascii-shapes';
import { CrossShape, PillShape, SealShape, ScribbleUnderline, Star4Shape, BurstShape } from '@/components/ui/shapes';
import { XZnak, Peciatka, ekgPath } from '@/components/v5/Symboly';
import { CTA_HLAVNE, MOTTO_1, MOTTO_2, NALEPKA_NEMOCNICA, VETA } from '@/components/hero/hero-data';
import { ZIVE_CISLA, POSTAVIL } from '@/data/fakty';
import { CESTA } from '@/data/cesta';
import { VLAJKA } from '@/data/ponuka';
import { CanvasEfekt } from './CanvasEfekty';
import { Kus, Pod } from './Spolocne';

/** Zástupná plocha pre fotku (XDR-199): pomer 4 : 5, štítok FOTKA ADAMA. */
function FotkaAdama({ className, tmava = false }: { className?: string; tmava?: boolean }) {
  return (
    <div
      role="img"
      aria-label="Zástupná plocha pre fotku Adama, pomer 4 : 5"
      className={cn('relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem] border-4 border-ink', tmava ? 'bg-ink' : 'bg-white', className)}
    >
      <div className={cn('absolute inset-0 tx-halftone', tmava && 'opacity-60 invert')} />
      <svg viewBox="0 0 80 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M0 0 L80 100 M80 0 L0 100"
          stroke={tmava ? 'var(--color-paper)' : 'var(--color-ink)'}
          strokeOpacity="0.18"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-3 rounded-md border-3 border-ink bg-yellow px-3 py-1.5 font-mono text-sm font-bold tracking-[0.14em] whitespace-nowrap uppercase shadow-brutal-sm">
        Fotka Adama
      </span>
      <span className={cn('absolute right-3 bottom-2 font-mono text-[0.65rem]', tmava ? 'text-paper' : 'text-ink')}>4 : 5</span>
    </div>
  );
}

/** Bežiaca EKG krivka (jeden úder = 200 jednotiek, posun o úder v slučke). */
function Ekg({ className, farba = 'var(--color-stamp)', hrubka = 4 }: { className?: string; farba?: string; hrubka?: number }) {
  return (
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className={className} aria-hidden="true">
      <g className="kit-ekg-beh">
        <path d={ekgPath(1400)} fill="none" stroke={farba} strokeWidth={hrubka} strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

/** Zjednodušená opona (žltá s bodkami, wordmark XVADUR, krídla sa rozídu do strán). */
function Opona({ hra, onKoniec }: { hra: boolean; onKoniec: () => void }) {
  const [faza, setFaza] = React.useState<'drzi' | 'ide'>('drzi');
  React.useEffect(() => {
    if (!hra) return;
    setFaza('drzi');
    const a = window.setTimeout(() => setFaza('ide'), 1100);
    const b = window.setTimeout(onKoniec, 1100 + 950);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [hra, onKoniec]);
  if (!hra) return null;
  const kridlo = (strana: 'l' | 'r') => (
    <div
      className={cn(
        'absolute inset-y-0 w-1/2 overflow-hidden bg-yellow text-ink tx-dots transition-transform duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)]',
        strana === 'l' ? 'left-0 border-r-3 border-ink' : 'right-0',
        faza === 'ide' && (strana === 'l' ? '-translate-x-full' : 'translate-x-full')
      )}
    >
      <div className={cn('absolute inset-y-0 flex w-[200%] flex-col items-center justify-center gap-3', strana === 'l' ? 'left-0' : 'right-0')}>
        <img src="/brand/xvadur-ink.svg" alt="" width={678} height={130} className="w-[min(70%,560px)]" />
        <p lang="en" className="font-display text-xl font-extrabold tracking-tight uppercase sm:text-3xl">
          {MOTTO_1} {MOTTO_2}
        </p>
      </div>
    </div>
  );
  return (
    <div className="absolute inset-0 z-50" aria-hidden="true">
      {kridlo('l')}
      {kridlo('r')}
    </div>
  );
}

function Scena({
  cislo,
  nazov,
  suroviny,
  children,
  className,
}: {
  cislo: string;
  nazov: string;
  suroviny: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [hra, setHra] = React.useState(false);
  const koniec = React.useCallback(() => setHra(false), []);
  const spusti = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setHra(true);
  };
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold">Kompozícia {cislo}</p>
          <p className="font-display text-display-xs font-extrabold uppercase">{nazov}</p>
          <p className="mt-1 max-w-3xl font-mono text-xs">{suroviny}</p>
        </div>
        <Button variant="outline" className="min-h-11" onClick={spusti}>
          Prehrať oponu
        </Button>
      </figcaption>
      <div className={cn('relative isolate overflow-hidden rounded-lg border-3 border-ink', className)}>
        {children}
        <Opona hra={hra} onKoniec={koniec} />
      </div>
    </figure>
  );
}

function Cta({ className }: { className?: string }) {
  return (
    <a
      href="/#konzultacia"
      className={cn(
        'press inline-flex min-h-13 items-center justify-center gap-2 rounded-full border-3 border-ink bg-hot px-6 font-display text-base font-extrabold whitespace-nowrap text-ink uppercase shadow-brutal sm:text-lg',
        className
      )}
    >
      {CTA_HLAVNE.label} <span aria-hidden="true">→</span>
    </a>
  );
}

/* 1 · MONITOR ------------------------------------------------------------------------------------------ */
function Monitor() {
  const zive = ZIVE_CISLA.slice(0, 3);
  return (
    <Scena
      cislo="01"
      nazov="Monitor"
      suroviny="CanvasEfekt crt (EKG s dosvitom) · Stamp destructive doubleRing · XZnak (cesta z public/brand/x.svg) · EKG pás · ZIVE_CISLA · Sticker"
      className="bg-ink text-paper"
    >
      <CanvasEfekt druh="crt" className="absolute inset-0 -z-10 opacity-55" />
      <div className="grid items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:px-12 lg:py-14">
        <div className="flex flex-col gap-5">
          <p className="eyebrow w-fit rounded-md border-2 border-ink bg-yellow px-2 py-1 text-ink">✚ Príjem · monitor zapnutý</p>
          <h3 className="font-display text-[clamp(2.6rem,1.4rem+4.6vw,5.2rem)] leading-[0.95] font-extrabold tracking-tight">
            Ahoj, som <span className="font-serif font-normal tracking-normal italic">Adam</span>
            <span className="text-yellow">.</span>
          </h3>
          <p className="max-w-lg text-lg text-paper/85">{VETA}</p>
          <ul className="grid max-w-lg grid-cols-3 gap-2">
            {zive.map((z) => (
              <li key={z.kluc} className="rounded-md border-2 border-paper/60 bg-ink/80 p-2">
                <p className="font-mono text-xl font-bold text-yellow tabular-nums sm:text-2xl">{z.value.toLocaleString('sk-SK')}</p>
                <p className="font-mono text-[0.65rem] leading-tight uppercase">{z.label}</p>
              </li>
            ))}
          </ul>
          <Cta className="w-full sm:w-fit" />
        </div>
        <div className="relative mx-auto mb-8 w-[min(70vw,340px)]">
          <div className="rounded-[1.6rem] border-4 border-ink bg-paper p-3 shadow-[10px_10px_0_0_var(--color-yellow)]">
            <FotkaAdama />
            <div className="mt-3 flex items-center justify-between gap-2 font-mono text-[0.7rem] text-ink uppercase">
              <span>Adam Rudavský · XVADUR</span>
              <span className="flex items-center gap-1">
                <span className="kit-blik inline-block h-2.5 w-2.5 rounded-full bg-stamp" /> naživo
              </span>
            </div>
          </div>
          <Ekg className="absolute -inset-x-16 top-[46%] h-16 w-[calc(100%+8rem)]" farba="var(--color-yellow)" hrubka={5} />
          <Stamp variant="destructive" doubleRing size="default" rotation="slight" className="absolute -top-6 -left-6 sm:-left-10">
            Overené
          </Stamp>
          <XZnak className="absolute -right-7 -bottom-16 w-14 rotate-12 text-hot sm:-right-12 sm:w-20" />
          <Sticker variant="outline" rotation="medium-right" size="sm" className="absolute top-6 -right-4 sm:-right-8">
            {NALEPKA_NEMOCNICA}
          </Sticker>
        </div>
      </div>
    </Scena>
  );
}

/* 2 · TRIÁŽ -------------------------------------------------------------------------------------------- */
function Triaz() {
  const system = POSTAVIL[0];
  return (
    <Scena
      cislo="02"
      nazov="Triáž"
      suroviny="CanvasEfekt halftone v kruhu · LayeredCard triple · shapes (CrossShape, PillShape, SealShape, Star4Shape, BurstShape, ScribbleUnderline) · StickyNote pin · Sticker tape · x.svg · Peciatka OVERENÉ"
      className="bg-yellow tx-dots"
    >
      <div className="grid items-center gap-12 px-4 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <div className="relative order-2 mx-auto w-[min(64vw,320px)] lg:order-1">
          <div className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-3 border-ink">
            <CanvasEfekt druh="halftone" paleta={['white', 'ink']} bunka={4} rychlost={0.6} className="h-full w-full" />
          </div>
          <LayeredCard layers="triple" layerColor="primary" offset="default" className="[&>div:last-child]:overflow-hidden [&>div:last-child]:rounded-[1.1rem] [&>div]:rounded-[1.1rem]">
            <FotkaAdama className="rounded-none border-0" />
          </LayeredCard>
          <CrossShape size={76} strokeWidth={4} color="var(--color-stamp)" animation="spin-step" speed="slow" className="absolute -top-9 -left-8" />
          <PillShape size={120} strokeWidth={4} color="var(--color-white)" className="absolute -right-12 -bottom-4 -rotate-[24deg]" />
          <Star4Shape size={44} strokeWidth={3} color="var(--color-white)" animation="pulse-hard" speed="slow" className="absolute top-1/3 -right-10" />
          <div className="absolute -bottom-10 -left-10 w-28">
            <Peciatka text="Overené" id="pec-triaz" className="w-full -rotate-12 text-white" />
          </div>
          <img src="/brand/x.svg" alt="" width={96} height={96} className="absolute -top-12 -right-10 w-24 rotate-12" />
        </div>
        <div className="order-1 flex flex-col gap-5 lg:order-2">
          <div className="flex flex-wrap items-center gap-3">
            <Sticker variant="primary" rotation="slight">
              ✚ Triáž
            </Sticker>
            <Sticker variant="outline" tape rotation="slight-right" className="mt-2">
              {VLAJKA.trvanie} · {VLAJKA.cena}
            </Sticker>
          </div>
          <h3 className="font-display text-[clamp(2.2rem,1.2rem+3.8vw,4.4rem)] leading-[0.92] font-extrabold tracking-tight uppercase">
            {VLAJKA.titulok}
          </h3>
          <ScribbleUnderline size={260} strokeWidth={5} color="var(--color-stamp)" />
          <div className="flex flex-wrap items-start gap-6">
            <Cta />
            <div className="relative">
              <SealShape size={112} strokeWidth={4} color="var(--color-white)" />
              <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-xl font-extrabold">{system.cislo}</span>
                <span className="font-mono text-[0.55rem] uppercase">kontrol</span>
              </span>
            </div>
          </div>
          <StickyNote variant="blue" pin rotation="left" size="sm" className="hidden max-w-xs sm:block">
            <p className="font-serif text-lg leading-snug italic">„{CESTA[1].citat}“</p>
          </StickyNote>
        </div>
      </div>
      <BurstShape size={180} strokeWidth={3} color="var(--color-white)" className="pointer-events-none absolute -right-16 -bottom-16 -z-10 opacity-80" />
    </Scena>
  );
}

/* 3 · FONENDOSKOP -------------------------------------------------------------------------------------- */
function Fonendoskop() {
  return (
    <Scena
      cislo="03"
      nazov="Fonendoskop"
      suroviny="MathCurveBackground lissajous · Marquee motto za fotkou · CanvasEfekt dither ako tieň fotky · SVG fonendoskop · AsciiPulse v hlavici · Peciatka OVERENÉ · XZnak · EKG"
      className="bg-paper"
    >
      <MathCurveBackground curve="lissajous" speed="slow" opacity={0.16} strokeWidth={1.2} headColor="var(--color-stamp)" className="py-12">
        <div className="relative flex flex-col items-center gap-8 px-4 sm:px-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="eyebrow">✚ Vyšetrenie počúva, kým radí</p>
            <h3 className="font-display text-[clamp(2.4rem,1.3rem+4.4vw,5rem)] leading-[0.95] font-extrabold tracking-tight">
              Ahoj, som <span className="font-serif font-normal tracking-normal italic">Adam</span>
              <span className="text-stamp">.</span>
            </h3>
          </div>
          <div className="relative w-full">
            {/* pás motta za fotkou */}
            <div className="pointer-events-none absolute inset-x-[-2rem] top-1/2 z-0 -translate-y-1/2 -rotate-3">
              <Marquee bordered={false} pauseOnHover={false} className="border-y-3 border-ink bg-yellow" style={{ ['--marquee-duration' as string]: '28s' }}>
                <MarqueeItem lang="en" className="font-display text-4xl font-extrabold sm:text-7xl">
                  {MOTTO_1} {MOTTO_2}
                </MarqueeItem>
                <MarqueeSeparator>
                  <CrossShape size={44} strokeWidth={4} color="var(--color-stamp)" />
                </MarqueeSeparator>
              </Marquee>
            </div>
            <div className="relative z-10 mx-auto w-[min(62vw,300px)]">
              {/* dithered tieň */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 overflow-hidden rounded-[1.25rem] border-4 border-ink">
                <CanvasEfekt druh="dither" paleta={['ink', 'stamp']} bunka={3} rychlost={0.7} className="h-full w-full" />
              </div>
              <FotkaAdama className="relative" />
              {/* fonendoskop: olivky hore, hadička okolo fotky, hlavica vpravo dole */}
              <svg viewBox="0 0 300 380" className="pointer-events-none absolute -inset-x-10 -top-12 h-[calc(100%+6rem)] w-[calc(100%+5rem)]" aria-hidden="true">
                <path
                  d="M96 28 C70 60 46 120 44 190 C42 262 70 330 150 352 C214 368 262 350 282 316"
                  fill="none"
                  stroke="var(--color-ink)"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <path
                  d="M96 28 C70 60 46 120 44 190 C42 262 70 330 150 352 C214 368 262 350 282 316"
                  fill="none"
                  stroke="var(--color-stamp)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <circle cx="96" cy="26" r="9" fill="var(--color-white)" stroke="var(--color-ink)" strokeWidth="4" />
              </svg>
              <div className="absolute -right-10 -bottom-12 overflow-hidden rounded-full border-4 border-ink bg-ink shadow-brutal sm:-right-14">
                <AsciiPulse size="sm" color="var(--color-yellow)" className="block border-0 bg-ink p-2 shadow-none" />
              </div>
              <div className="absolute -top-10 -left-12 w-28 sm:-left-16 sm:w-32">
                <Peciatka text="Overené" id="pec-fonendoskop" className="w-full -rotate-12 text-yellow" />
              </div>
              <XZnak className="absolute top-8 -right-10 w-14 -rotate-6 text-hot sm:-right-14 sm:w-16" />
            </div>
          </div>
          <Ekg className="h-10 w-full max-w-3xl" farba="var(--color-ink)" hrubka={3} />
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="max-w-xl text-lg">{VETA}</p>
            <Cta />
          </div>
        </div>
      </MathCurveBackground>
    </Scena>
  );
}

export default function HeroKompozicie() {
  return (
    <Kus
      id="hero-kompozicie"
      meno="hero · 3 kompozície"
      subor="src/components/v7/kit/tvary/HeroKompozicie.tsx · opona → hero s fotkou (zástupná plocha 4 : 5)"
      pocet="3 kompozície"
      veta="Ako by mohol vyzerať rám hera za oponou, keď príde Adamova fotka: tvary, nálepky, krivky a canvas efekty z tejto stránky poskladané okolo fotky. Tlačidlo Prehrať oponu ukáže prechod z opony."
    >
      <Pod poznamka="Texty z hero-data.ts, ponuka.ts, cesta.ts a fakty.ts. CTA je jediné miesto s hot (plus X znak).">
        Opona → hero
      </Pod>
      <Monitor />
      <Triaz />
      <Fonendoskop />
    </Kus>
  );
}
