/** Katalóg vendor · Fancy Components (MIT, Daniel Petho) + vlastný StickerPeel: MarqueeAlongSvgPath, StickerPeel, ImageTrail
 *  (+ ImageTrailItem), ScrambleHover, VerticalCutReveal, hooky (useDetectBrowser, useDimensions, useMousePosition,
 *  useScreenSize). Gravity + MatterBody (matter-js siaha na window) sú v FancyGravity.tsx a načítajú sa lenivo. */
import { lazy, Suspense, useRef, useState } from 'react';
import { MarqueeAlongSvgPath } from '@/components/vendor/fancy/blocks/marquee-along-svg-path';
import { StickerPeel } from '@/components/vendor/fancy/blocks/sticker-peel';
import { ImageTrail, ImageTrailItem } from '@/components/vendor/fancy/image/image-trail';
import { ScrambleHover } from '@/components/vendor/fancy/text/scramble-hover';
import { VerticalCutReveal, type VerticalCutRevealRef } from '@/components/vendor/fancy/text/vertical-cut-reveal';
import useDetectBrowser from '@/components/vendor/fancy/hooks/use-detect-browser';
import { useDimensions } from '@/components/vendor/fancy/hooks/use-dimensions';
import { useMousePosition } from '@/components/vendor/fancy/hooks/use-mouse-position';
import { useScreenSize } from '@/components/vendor/fancy/hooks/use-screen-size';
import { Button } from '@/components/ui/button';
import { XZnak } from '@/components/v5/Symboly';
import { NALEPKA_NEMOCNICA } from '@/components/hero/hero-data';
import { CESTA } from '@/data/cesta';
import { DOKAZY, MARQUEE_FAKTY } from '@/data/fakty';
import { NAV } from '@/data/nav';
import { Kus, Mriezka, Pozn, Realne, Varianta, Znova, useDesktopFx, useMounted } from './shared';

const FancyGravity = lazy(() => import('./FancyGravity'));

/** EKG úder (rovnaký tvar ako v5/Symboly ekgPath) posunutý o dy — dráha pre marquee. */
function ekg(sirka: number, uder: number, dy: number): string {
  const y = (v: number) => v + dy;
  let d = `M0 ${y(24)}`;
  for (let x = 0; x < sirka; x += uder) {
    d += ` L${x + 70} ${y(24)} L${x + 80} ${y(20)} L${x + 88} ${y(24)} L${x + 96} ${y(24)} L${x + 102} ${y(30)} L${x + 110} ${y(2)} L${x + 118} ${y(38)} L${x + 124} ${y(24)} L${x + 140} ${y(24)} L${x + 152} ${y(17)} L${x + 164} ${y(24)} L${x + uder} ${y(24)}`;
  }
  return d;
}

const KRUH = 'M60,150 a90,90 0 1,0 180,0 a90,90 0 1,0 -180,0';
const VLNA = 'M0,80 C100,0 200,160 300,80 S500,0 600,80';
const schody = (n: number) => (t: number) => Math.min(1, Math.ceil(t * n) / n);

function Hooky() {
  const ref = useRef<HTMLDivElement>(null);
  const browser = useDetectBrowser();
  const dim = useDimensions(ref);
  const mys = useMousePosition(ref);
  const screen = useScreenSize();
  return (
    <div ref={ref} className="w-full rounded-lg border-3 border-ink bg-ink p-4 font-mono text-sm text-paper">
      <p>useDetectBrowser() → {browser || '…'}</p>
      <p>
        useDimensions(ref) → {Math.round(dim.width)} × {Math.round(dim.height)} px
      </p>
      <p>
        useMousePosition(ref) → x {Math.round(mys.x)}, y {Math.round(mys.y)}
      </p>
      <p>
        useScreenSize() → {screen.toString()} · lessThan('lg'): {String(screen.lessThan('lg'))}
      </p>
    </div>
  );
}

function OdkazSoScramble({ href, label }: { href: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={() => setOn(false)}
      className="press inline-flex min-h-11 items-center rounded-lg border-3 border-ink bg-white px-4 font-display text-lg font-extrabold shadow-brutal-sm hover:bg-yellow"
    >
      <ScrambleHover text={label} active={on} sequential revealDirection="start" scrambleSpeed={30} scrambledClassName="text-stamp" />
    </a>
  );
}

export default function Fancy() {
  const mounted = useMounted();
  const desktopFx = useDesktopFx();
  const peelRef = useRef<HTMLDivElement>(null);
  const cutRef = useRef<VerticalCutRevealRef>(null);
  const [kluc, setKluc] = useState(0);
  const obrazky = DOKAZY.filter((d) => d.obrazok);

  return (
    <>
      {/* ---------------- MarqueeAlongSvgPath ---------------- */}
      <Kus
        id="fa-marquee-path"
        nazov="MarqueeAlongSvgPath"
        subor="vendor/fancy/blocks/marquee-along-svg-path.tsx"
        veta="Položky jazdia po ľubovoľnej SVG dráhe (CSS offset-path + Motion): rýchlosť, smer, ťahanie, spomalenie, scroll, z-index, CSS premenné."
      >
        <Mriezka cols={2}>
          <Varianta props="path=kruh showPath pathClassName='text-ink' baseVelocity=8 repeat=2 slowdownOnHover slowDownFactor=0.1">
            <div className="relative h-72 w-full overflow-hidden">
              <MarqueeAlongSvgPath path={KRUH} viewBox="0 0 300 300" showPath pathClassName="text-ink" baseVelocity={8} repeat={2} slowdownOnHover slowDownFactor={0.1} responsive className="h-full w-full">
                {['PRÍJEM', 'DIAGNÓZA', 'LIEČBA'].map((t) => (
                  <span key={t} className="block rounded-lg border-3 border-ink bg-yellow px-2 py-1 font-display text-sm font-extrabold">
                    {t}
                  </span>
                ))}
              </MarqueeAlongSvgPath>
            </div>
          </Varianta>
          <Varianta props="path=vlna direction='reverse' draggable grabCursor dragAwareDirection enableRollingZIndex={false} easing=schody(8)">
            <div className="relative h-72 w-full overflow-hidden">
              <MarqueeAlongSvgPath
                path={VLNA}
                viewBox="0 0 600 160"
                showPath
                pathClassName="text-ink/30"
                pathStrokeWidth={6}
                direction="reverse"
                draggable
                grabCursor
                dragAwareDirection
                enableRollingZIndex={false}
                easing={schody(8)}
                baseVelocity={6}
                repeat={4}
                responsive
                className="h-full w-full"
              >
                <span className="block">
                  <XZnak className="w-8 text-hot" />
                </span>
              </MarqueeAlongSvgPath>
            </div>
          </Varianta>
          <Varianta props="useScrollVelocity scrollAwareDirection · cssVariableInterpolation [{ --s 0.6 → 1.4 }] · zIndexBase=1 zIndexRange=20">
            <div className="relative h-56 w-full overflow-hidden">
              <MarqueeAlongSvgPath
                path={VLNA}
                viewBox="0 0 600 160"
                useScrollVelocity
                scrollAwareDirection
                cssVariableInterpolation={[{ property: '--s', from: 0.6, to: 1.4 }]}
                zIndexBase={1}
                zIndexRange={20}
                baseVelocity={3}
                repeat={3}
                responsive
                className="h-full w-full"
              >
                {['A', 'I'].map((t) => (
                  <span key={t} className="block scale-(--s) rounded-full border-3 border-ink bg-white px-3 py-1 font-display text-xl font-extrabold">
                    {t}
                  </span>
                ))}
              </MarqueeAlongSvgPath>
            </div>
          </Varianta>
          <Varianta props="preserveAspectRatio · width/height · pathId · pathStrokeWidth · slowDownSpringConfig · scrollSpringConfig · scrollContainer · dragSensitivity · dragVelocityDecay">
            <Pozn>
              Ďalšie ladiace props. Reduced motion: položky stoja na dráhe (baseVelocity 0), ťahanie vypnuté. Bez `responsive` je
              kontajner v px viewBoxu — na mobile pretečie, preto vo všetkých ukážkach responsive.
            </Pozn>
          </Varianta>
        </Mriezka>
        <Realne zdroj="fakty.ts (MARQUEE_FAKTY) po EKG krivke (v5/Symboly ekgPath)">
          <div className="ekg-rovno relative h-40 w-full overflow-hidden rounded-lg border-3 border-ink bg-ink sm:h-56">
            <MarqueeAlongSvgPath path={ekg(1200, 200, 30)} viewBox="0 0 1200 100" showPath pathClassName="text-yellow" pathStrokeWidth={3} baseVelocity={4} repeat={2} responsive className="h-full w-full">
              {MARQUEE_FAKTY.map((f) => (
                <span key={f.label} className="block -translate-y-[70%] whitespace-nowrap rounded-lg border-3 border-ink bg-yellow px-2 py-1 font-mono text-sm font-bold">
                  {f.value}
                </span>
              ))}
            </MarqueeAlongSvgPath>
          </div>
        </Realne>
      </Kus>

      {/* ---------------- StickerPeel ---------------- */}
      <Kus
        id="fa-sticker-peel"
        nazov="StickerPeel"
        subor="vendor/fancy/blocks/sticker-peel.tsx"
        veta="Nálepka s odlepeným rohom, ktorá sa pri hoveri odlepí viac a dá sa ťahať (Motion drag, aj dotykom)."
      >
        <div ref={peelRef} className="relative grid min-h-56 grid-cols-2 place-items-center gap-6 rounded-lg border-3 border-dashed border-ink bg-paper p-6 sm:grid-cols-4 tx-dots">
          <StickerPeel>V stavbe</StickerPeel>
          <StickerPeel colorClassName="bg-white" rotate={4} peelSize={40} restPeel={0.6} dragConstraints={peelRef}>
            peel 40
          </StickerPeel>
          <StickerPeel colorClassName="bg-paper" rotate={-12} shadow={8} restPeel={0} dragConstraints={peelRef}>
            tieň 8
          </StickerPeel>
          <StickerPeel draggable={false} rotate={0} label="Overené, nálepka">
            ✔ Overené
          </StickerPeel>
        </div>
        <Pozn>
          props: colorClassName (bg-yellow | bg-white | bg-paper) · rotate · peelSize · restPeel · draggable · dragConstraints (ref) · shadow · label.
          Posledná nálepka: draggable={'{false}'}. Reduced motion: bez pružiny a bez odlepenia, ťahanie ostáva.
        </Pozn>
        <Realne zdroj="hero-data.ts (NALEPKA_NEMOCNICA)">
          <div className="relative grid h-40 place-items-center overflow-hidden rounded-lg border-3 border-ink bg-yellow">
            <p className="font-display text-display-xs font-extrabold uppercase">Adam Rudavský</p>
            <div className="absolute right-4 bottom-4">
              <StickerPeel colorClassName="bg-white" rotate={-8}>
                {NALEPKA_NEMOCNICA}
              </StickerPeel>
            </div>
          </div>
        </Realne>
      </Kus>

      {/* ---------------- ImageTrail ---------------- */}
      <Kus
        id="fa-image-trail"
        nazov="ImageTrail · ImageTrailItem"
        subor="vendor/fancy/image/image-trail.tsx"
        veta="Stopa kariet za myšou (Motion useAnimate); beží iba na desktope ≥ 1024 px s myšou, inak sa nevykreslí nič."
      >
        {desktopFx ? (
          <Mriezka cols={2}>
            <Varianta props="threshold=100 intensity=0.3 repeatChildren=3 (default)">
              <div className="relative h-72 w-full rounded-lg border-3 border-ink bg-paper">
                <ImageTrail>
                  {obrazky.map((d) => (
                    <ImageTrailItem key={d.id}>
                      <img src={d.obrazok ?? ''} alt="" className="h-24 w-32 rounded-lg border-3 border-ink object-cover shadow-brutal-sm" />
                    </ImageTrailItem>
                  ))}
                </ImageTrail>
                <p className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-sm">hýb myšou</p>
              </div>
            </Varianta>
            <Varianta props="threshold=60 intensity=0.8 keyframes schody (scale 0 → 1 → 0) · zIndexDirection='old-on-top' · repeatChildren=2">
              <div className="relative h-72 w-full rounded-lg border-3 border-ink bg-yellow">
                <ImageTrail
                  threshold={60}
                  intensity={0.8}
                  repeatChildren={2}
                  zIndexDirection="old-on-top"
                  keyframes={{ scale: [0, 1, 1, 0], rotate: [-6, 0, 0, 6] }}
                  keyframesOptions={{ duration: 0.9, times: [0, 0.1, 0.8, 1], ease: schody(3) }}
                >
                  {MARQUEE_FAKTY.map((f) => (
                    <ImageTrailItem key={f.label}>
                      <span className="block whitespace-nowrap rounded-lg border-3 border-ink bg-white px-3 py-2 font-display text-xl font-extrabold shadow-brutal-sm">
                        {f.value}
                      </span>
                    </ImageTrailItem>
                  ))}
                </ImageTrail>
              </div>
            </Varianta>
          </Mriezka>
        ) : (
          <Pozn>
            Mobil, dotyk alebo reduced motion: ImageTrail sa zámerne nevykreslí (0 práce). Na desktope s myšou tu sú dve plochy: obrázky
            dôkazov (DOKAZY) a čísla (MARQUEE_FAKTY). Props: threshold · intensity · keyframes · keyframesOptions ·
            trailElementAnimationKeyframes · repeatChildren · baseZIndex · zIndexDirection · enabled · as.
          </Pozn>
        )}
      </Kus>

      {/* ---------------- ScrambleHover ---------------- */}
      <Kus
        id="fa-scramble-hover"
        nazov="ScrambleHover"
        subor="vendor/fancy/text/scramble-hover.tsx"
        veta="Text sa pri hoveri / fokuse rozmieša a zloží; vnútorne alebo riadený rodičom (active) — napr. položky menu."
      >
        <Mriezka cols={3}>
          <Varianta props="default (nesekvenčne, maxIterations=10, scrambleSpeed=50)">
            <ScrambleHover text="Hover na mňa" className="font-display text-xl font-extrabold" scrambledClassName="text-stamp" />
          </Varianta>
          <Varianta props="sequential revealDirection='end'">
            <ScrambleHover text="Od konca" sequential revealDirection="end" className="font-display text-xl font-extrabold" scrambledClassName="text-ink/40" />
          </Varianta>
          <Varianta props="sequential revealDirection='center' useOriginalCharsOnly">
            <ScrambleHover text="ANAMNÉZA" sequential revealDirection="center" useOriginalCharsOnly className="font-display text-xl font-extrabold" scrambledClassName="text-stamp" />
          </Varianta>
          <Varianta props="characters='X×' maxIterations=20 scrambleSpeed=25 as='div'">
            <ScrambleHover text="DIVIDED," characters="X×" maxIterations={20} scrambleSpeed={25} as="div" className="font-display text-xl font-extrabold" />
          </Varianta>
        </Mriezka>
        <Realne zdroj="nav.ts (NAV) · active riadi <a> (hover + focus)">
          <nav aria-label="Ukážka menu" className="flex flex-wrap gap-3">
            {NAV.map((n) => (
              <OdkazSoScramble key={n.href} href={n.href} label={n.label} />
            ))}
          </nav>
        </Realne>
      </Kus>

      {/* ---------------- VerticalCutReveal ---------------- */}
      <Kus
        id="fa-vertical-cut"
        nazov="VerticalCutReveal"
        subor="vendor/fancy/text/vertical-cut-reveal.tsx"
        veta="Slová / znaky / riadky vyjdú spod „rezu“ (overflow hidden), stagger od začiatku, konca, stredu, náhodne alebo od indexu."
      >
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={() => cutRef.current?.reset()}>
            ref.reset()
          </Button>
          <Button variant="outline" onClick={() => cutRef.current?.startAnimation()}>
            ref.startAnimation()
          </Button>
          <Znova onClick={() => setKluc((k) => k + 1)} />
        </div>
        <Mriezka cols={3} key={`vc-${kluc}`}>
          <Varianta props="splitBy='words' staggerFrom='first' (default spring)">
            <VerticalCutReveal containerClassName="font-display text-2xl font-extrabold uppercase">Prídeš s problémom.</VerticalCutReveal>
          </Varianta>
          <Varianta props="splitBy='characters' staggerFrom='last' staggerDuration=0.03 reverse">
            <VerticalCutReveal splitBy="characters" staggerFrom="last" staggerDuration={0.03} reverse containerClassName="font-display text-2xl font-extrabold uppercase">
              Odídeš s diagnózou.
            </VerticalCutReveal>
          </Varianta>
          <Varianta props="splitBy='characters' staggerFrom='center' transition={{ ease: schody(3), duration: 0.3 }}">
            <VerticalCutReveal splitBy="characters" staggerFrom="center" staggerDuration={0.04} transition={{ ease: schody(3), duration: 0.3 }} containerClassName="font-display text-2xl font-extrabold uppercase">
              PLÁN LIEČBY
            </VerticalCutReveal>
          </Varianta>
          <Varianta props="splitBy='characters' staggerFrom='random' elementLevelClassName">
            <VerticalCutReveal splitBy="characters" staggerFrom="random" staggerDuration={0.02} elementLevelClassName="text-stamp" containerClassName="font-display text-2xl font-extrabold uppercase">
              ALARM
            </VerticalCutReveal>
          </Varianta>
          <Varianta props="splitBy='lines' staggerFrom=1 (index) wordLevelClassName">
            <VerticalCutReveal splitBy="lines" staggerFrom={1} wordLevelClassName="border-b-3 border-ink" containerClassName="font-mono text-base">
              {'riadok 0\nriadok 1 (štart)\nriadok 2'}
            </VerticalCutReveal>
          </Varianta>
          <Varianta props="autoStart={false} ref (startAnimation / reset) · onStart · onComplete · viewMargin">
            <VerticalCutReveal ref={cutRef} autoStart={false} splitBy="words" containerClassName="font-display text-2xl font-extrabold uppercase">
              Riadené tlačidlami hore.
            </VerticalCutReveal>
          </Varianta>
        </Mriezka>
        <Realne zdroj="cesta.ts (citát, Jún 2025)">
          <VerticalCutReveal key={`c-${kluc}`} splitBy="words" staggerDuration={0.06} transition={{ type: 'spring', stiffness: 260, damping: 30 }} containerClassName="max-w-3xl font-serif text-3xl italic leading-tight sm:text-4xl">
            {`„${CESTA.find((k) => k.citat)?.citat ?? ''}“`}
          </VerticalCutReveal>
        </Realne>
      </Kus>

      {/* ---------------- Gravity (lenivo) ---------------- */}
      {mounted ? (
        <Suspense fallback={<Pozn>Načítavam matter-js…</Pozn>}>
          <FancyGravity />
        </Suspense>
      ) : (
        <Pozn>Gravity (matter-js) sa načíta po hydratácii.</Pozn>
      )}

      {/* ---------------- hooky ---------------- */}
      <Kus
        id="fa-hooky"
        nazov="useDetectBrowser · useDimensions · useMousePosition · useScreenSize"
        subor="vendor/fancy/hooks/*"
        veta="Pomocné hooky Fancy: prehliadač, rozmer prvku (ResizeObserver), pozícia myši / prsta voči prvku, Tailwind breakpoint."
      >
        <Hooky />
      </Kus>
    </>
  );
}
