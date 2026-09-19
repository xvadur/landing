/** FancyLab — ranná ukážka + kompilačný test vendorovaných Fancy komponentov (src/components/vendor/fancy/).
 *  Montovať ako `<FancyLab client:only="react" />` (Gravity = matter-js, siaha na window pri importe).
 *  Texty: motto, NAV, BEATY, MARQUEE_FAKTY, POSTAVIL, FRAZY_RODINY — nič vymyslené. */
import { useRef, useState } from 'react';

import { BEATY } from '@/data/beaty';
import { MARQUEE_FAKTY, POSTAVIL } from '@/data/fakty';
import { FRAZY_RODINY } from '@/data/frazy';
import { NAV } from '@/data/nav';
import { cn } from '@/lib/utils';

import { MarqueeAlongSvgPath } from '@/components/vendor/fancy/blocks/marquee-along-svg-path';
import { StickerPeel } from '@/components/vendor/fancy/blocks/sticker-peel';
import { ImageTrail, ImageTrailItem } from '@/components/vendor/fancy/image/image-trail';
import decomp from 'poly-decomp';
import { Gravity, MatterBody, type GravityRef } from '@/components/vendor/fancy/physics/gravity';
import { ScrambleHover } from '@/components/vendor/fancy/text/scramble-hover';
import { VerticalCutReveal } from '@/components/vendor/fancy/text/vertical-cut-reveal';

const MOTTO = ['DIVIDED,', 'WE ARE USELESS.'];

/** X znak (public/brand/x.svg) ako inline SVG s currentColor. */
function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M0 0H26L53 43L80 0H106L66 65L106 130H79L53 87L27 130H0L40 65Z"
        transform="translate(63,48) scale(1.23)"
      />
    </svg>
  );
}

function LabSection({
  id,
  title,
  note,
  bg = 'bg-paper',
  children,
  className,
}: {
  id: string;
  title: string;
  note: string;
  bg?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('border-b-3 border-ink', bg)}>
      <div className={cn('mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10', className)}>
        <p className="eyebrow mb-2">{id}</p>
        <h2 className="font-display text-display-sm font-extrabold uppercase tracking-tight">{title}</h2>
        <p className="mt-2 mb-8 max-w-2xl text-ink/70">{note}</p>
        {children}
      </div>
    </section>
  );
}

/* ---------- 1. ScrambleHover (nav) ---------- */
function NavScramble() {
  return (
    <nav aria-label="Ukážka navigácie">
      <ul className="flex flex-wrap gap-3">
        {NAV.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="press inline-flex min-h-12 items-center rounded-lg border-3 border-ink bg-white px-4 font-display text-lg font-extrabold uppercase shadow-brutal-sm"
            >
              <ScrambleHover text={item.label} sequential revealDirection="start" scrambleSpeed={40} scrambledClassName="text-hot font-mono" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------- 2. VerticalCutReveal (motto + beaty) ---------- */
function BeatsReveal() {
  const [key, setKey] = useState(0);
  return (
    <div>
      <h3 className="font-display text-display font-extrabold uppercase leading-[0.9] tracking-tighter">
        {MOTTO.map((line, i) => (
          <span key={`${key}-${i}`} className="block">
            <VerticalCutReveal splitBy="characters" staggerDuration={0.03} staggerFrom="first" transition={{ type: 'spring', stiffness: 220, damping: 24, delay: i * 0.35 }}>
              {line}
            </VerticalCutReveal>
          </span>
        ))}
      </h3>
      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {BEATY.slice(0, 3).map((beat, i) => (
          <li key={`${key}-${beat.rok}`} className="brutal p-5" style={{ ['--i' as string]: i }}>
            <p className="eyebrow">{beat.rok}</p>
            <p className="mt-1 font-display text-2xl font-extrabold uppercase">
              <VerticalCutReveal splitBy="words" staggerDuration={0.08} transition={{ type: 'spring', stiffness: 190, damping: 22, delay: 0.1 * i }}>
                {beat.titulok}
              </VerticalCutReveal>
            </p>
            <p className="mt-3 text-ink/80">{beat.text}</p>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="press mt-6 inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-yellow px-5 font-display text-lg font-extrabold uppercase shadow-brutal"
      >
        Prehrať znova
      </button>
    </div>
  );
}

/* ---------- 3. MarqueeAlongSvgPath okolo X ---------- */
/** Dráha v px (viewBox 520 × 520 = šírka obalu na desktope); `offset-path` berie jednotky viewBoxu ako px,
 *  preto `responsive` — pod 520 px sa celý marquee zmenší (na 375 px ≈ 0,66×). */
const LOOP_SIZE = 520;
const LOOP_PATH = 'M 260 42 C 426 42, 489 135, 489 260 C 489 385, 426 478, 260 478 C 94 478, 31 385, 31 260 C 31 135, 94 42, 260 42 Z';

function FactsAroundX() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <XGlyph className="absolute inset-0 m-auto h-[46%] w-[46%] text-hot" />
      <MarqueeAlongSvgPath
        path={LOOP_PATH}
        viewBox={`0 0 ${LOOP_SIZE} ${LOOP_SIZE}`}
        responsive
        baseVelocity={6}
        repeat={2}
        slowdownOnHover
        draggable
        grabCursor
        showPath
        pathClassName="text-ink"
        pathStrokeWidth={4}
        className="absolute inset-0"
      >
        {MARQUEE_FAKTY.map((f) => (
          <span
            key={f.label}
            className="block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border-3 border-ink bg-yellow px-3 py-1 font-display text-base font-extrabold uppercase shadow-brutal-sm"
          >
            {f.value}
          </span>
        ))}
      </MarqueeAlongSvgPath>
    </div>
  );
}

/* ---------- 4. StickerPeel ---------- */
function Stickers() {
  const area = useRef<HTMLDivElement>(null);
  return (
    <div ref={area} className="relative flex min-h-[200px] flex-wrap items-center gap-8 rounded-lg border-3 border-ink bg-white p-8 shadow-brutal tx-dots">
      <StickerPeel colorClassName="bg-yellow" rotate={-6} dragConstraints={area}>
        V stavbe
      </StickerPeel>
      <StickerPeel colorClassName="bg-pink" rotate={4} dragConstraints={area}>
        Hra 2 · V stavbe
      </StickerPeel>
      <StickerPeel colorClassName="bg-lime" rotate={-2} peelSize={36} dragConstraints={area}>
        Hra 3 · V stavbe
      </StickerPeel>
      <StickerPeel colorClassName="bg-hot" rotate={8} dragConstraints={area} label="XVADUR">
        <span className="text-paper">XVADUR</span>
      </StickerPeel>
    </div>
  );
}

/* ---------- 5. ImageTrail (desktop, myš) ---------- */
function TrailBuilt() {
  return (
    <ImageTrail
      className="min-h-[360px] rounded-lg border-3 border-ink bg-lilac shadow-brutal"
      threshold={90}
      repeatChildren={2}
      keyframes={{ scale: [0, 1, 1, 0.9], rotate: [-8, 0, 0, 6], opacity: [0, 1, 1, 0] }}
      keyframesOptions={{ duration: 1.2, times: [0, 0.12, 0.85, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 grid place-items-center p-6 text-center">
        <p className="font-display text-display-xs font-extrabold uppercase leading-none">
          Prejdi myšou: čo som postavil
        </p>
      </div>
      {POSTAVIL.map((p) => (
        <ImageTrailItem key={p.id} className="w-56">
          <div className="rounded-lg border-3 border-ink bg-white p-4 shadow-brutal">
            <p className="font-display text-3xl font-extrabold tracking-tight">{p.cislo}</p>
            <p className="mt-1 font-display text-sm font-bold uppercase">{p.nazov}</p>
          </div>
        </ImageTrailItem>
      ))}
    </ImageTrail>
  );
}

/* ---------- 6. Gravity: prázdne frázy padajú ---------- */
const STICKER_COLORS = ['bg-yellow', 'bg-pink', 'bg-lilac', 'bg-lime', 'bg-sky', 'bg-white'];

function FallingPhrases() {
  const ref = useRef<GravityRef>(null);
  const basic = FRAZY_RODINY.filter((r) => r.zakladna);
  return (
    <div>
      <div className="relative h-[440px] overflow-hidden rounded-lg border-3 border-ink bg-white shadow-brutal tx-halftone">
        <Gravity ref={ref} gravity={{ x: 0, y: 1 }} grabCursor addTopWall decomp={decomp}>
          {basic.map((r, i) => (
            <MatterBody
              key={r.rodina}
              x={`${12 + ((i * 15) % 76)}%`}
              y={`${8 + (i % 3) * 12}%`}
              angle={(i % 2 ? 1 : -1) * (4 + i * 3)}
              matterBodyOptions={{ friction: 0.4, restitution: 0.25, density: 0.002 }}
            >
              <span className={cn('sticker whitespace-nowrap text-sm sm:text-base', STICKER_COLORS[i % STICKER_COLORS.length])} style={{ ['--sticker-rotate' as string]: '0deg' }}>
                {r.rodina}
              </span>
            </MatterBody>
          ))}
          <MatterBody x="50%" y="-10%" angle={12} bodyType="svg" isDraggable matterBodyOptions={{ friction: 0.3, restitution: 0.2, density: 0.003 }}>
            <XGlyph className="h-24 w-24 text-hot" />
          </MatterBody>
        </Gravity>
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <a
          href="/hry/skrtaci-test/"
          className="press inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-hot px-5 font-display text-lg font-extrabold uppercase text-ink shadow-brutal"
        >
          Škrtni ich
        </a>
        <button
          type="button"
          onClick={() => ref.current?.reset()}
          className="press inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-white px-5 font-display text-lg font-extrabold uppercase shadow-brutal"
        >
          Znova
        </button>
      </div>
    </div>
  );
}

export default function FancyLab() {
  return (
    <div className="font-sans text-ink">
      <LabSection id="scramble-hover" title="Scramble na navigácii" note="Fancy ScrambleHover na položkách NAV (doc 10 §3 #1). Hover aj fokus; pri prefers-reduced-motion stojí.">
        <NavScramble />
      </LabSection>

      <LabSection id="vertical-cut-reveal" title="Rez zdola: motto a beaty" note="Fancy VerticalCutReveal (doc 10 §3 #12) — spúšťa sa vo viewporte; reduced motion = okamžite viditeľné." bg="bg-yellow">
        <BeatsReveal />
      </LabSection>

      <LabSection id="marquee-along-svg-path" title="Fakty okolo X" note="Fancy MarqueeAlongSvgPath (doc 10 §3 #7): štyri fakty z fakty.ts obiehajú X; spomalí na hover, dá sa ťahať." bg="bg-pink">
        <FactsAroundX />
      </LabSection>

      <LabSection id="sticker-peel" title="Nálepky, ktoré sa odlepujú" note="StickerPeel (vlastná implementácia, Fancy ho nemá): roh sa odlepí na hover, nálepka sa dá ťahať v rámci plochy.">
        <Stickers />
      </LabSection>

      <LabSection id="image-trail" title="Stopa za kurzorom" note={'Fancy ImageTrail (doc 10 §3 #13): karty „Čo som postavil“ za myšou. Beží len na desktope s myšou ≥ 1024 px; na dotyku a pri reduced motion sa nevykreslí.'} bg="bg-sky">
        <TrailBuilt />
      </LabSection>

      <LabSection id="gravity" title="Prázdne frázy padajú" note="Fancy Gravity (matter-js, doc 10 §3 #15): šesť základných rodín prázdnych fráz z frazy.ts ako nálepky; hádže sa myšou aj prstom, stránka sa dá cez sekciu skrolovať. Reduced motion = kopa stojí." bg="bg-lime">
        <FallingPhrases />
      </LabSection>
    </div>
  );
}
