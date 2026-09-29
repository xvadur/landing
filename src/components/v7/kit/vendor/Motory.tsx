/** Katalóg vendor · pohybové motory z package.json, každý 2–3 ukážky v neobrutalizme (tvrdé, stupňovité, nie plávajúce):
 *  Motion, Lenis, CSS animation-timeline view()/scroll(), @number-flow/react, canvas-confetti.
 *  GSAP (ScrollTrigger + SplitText) a @paper-design/shaders-react sú v MotoryGsap.tsx / MotoryShadery.tsx (lenivo). */
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import NumberFlow, { NumberFlowGroup, continuous } from '@number-flow/react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Peciatka, XZnak } from '@/components/v5/Symboly';
import { CESTA } from '@/data/cesta';
import { KORPUS } from '@/data/fakty';
import { PRODUKTY } from '@/data/ponuka';
import { Kus, Mriezka, Pozn, Realne, Varianta, Znova, datumSk, tokenHex, useMounted, usePulz, useReduced } from './shared';

const MotoryGsap = lazy(() => import('./MotoryGsap'));
const MotoryShadery = lazy(() => import('./MotoryShadery'));

const schody = (n: number) => (t: number) => Math.min(1, Math.ceil(t * n) / n);
const X_D = 'M0 0H26L53 43L80 0H106L66 65L106 130H79L53 87L27 130H0L40 65Z';

/* ============================== Motion ============================== */

function MotionTriaz() {
  const [rad, setRad] = useState(() => PRODUKTY.map((p) => p.nazov));
  return (
    <Varianta props="layout · transition={{ type: 'tween', duration: 0.3, ease: schody(4) }}">
      <div className="grid w-full gap-3">
        <Button variant="secondary" className="w-fit" onClick={() => setRad((r) => [...r.slice(1), r[0]!])}>
          Ďalší pacient
        </Button>
        <ol className="grid gap-2">
          {rad.map((n, i) => (
            <motion.li
              key={n}
              layout
              transition={{ type: 'tween', duration: 0.3, ease: schody(4) }}
              className={
                i === 0
                  ? 'rounded-lg border-3 border-ink bg-yellow px-4 py-2 font-display font-extrabold uppercase shadow-brutal-sm'
                  : 'rounded-lg border-3 border-ink bg-white px-4 py-2 font-mono text-sm'
              }
            >
              {i === 0 ? '▶ ' : `${i}. `}
              {n}
            </motion.li>
          ))}
        </ol>
      </div>
    </Varianta>
  );
}

function MotionTlacidlo() {
  return (
    <Varianta props="whileHover {x:-4,y:-4} · whileTap {x:6,y:6} · tieň = samostatná vrstva (Motion hýbe len tvárou)">
      <div className="relative inline-block">
        <span aria-hidden="true" className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg bg-ink" />
        <motion.button
          type="button"
          whileHover={{ x: -4, y: -4 }}
          whileTap={{ x: 6, y: 6 }}
          transition={{ type: 'tween', duration: 0.12, ease: schody(2) }}
          className="relative min-h-12 rounded-lg border-3 border-ink bg-hot px-6 font-display text-lg font-extrabold uppercase text-ink"
        >
          Objednaj sa
        </motion.button>
      </div>
    </Varianta>
  );
}

function MotionPeciatka() {
  const [on, setOn] = useState(true);
  return (
    <Varianta props="AnimatePresence · initial {scale:2.2, rotate:-30, opacity:0} → {scale:1, rotate:-12} ease schody(3)">
      <div className="flex w-full items-center gap-4">
        <Button variant="outline" onClick={() => setOn((o) => !o)}>
          {on ? 'Zmazať' : 'Opečiatkovať'}
        </Button>
        <div className="grid size-28 place-items-center">
          <AnimatePresence>
            {on ? (
              <motion.div
                key="p"
                initial={{ scale: 2.2, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: -12, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.24, ease: schody(3) }}
              >
                <Peciatka className="size-28 text-stamp" text="Overené" id="kit-peciatka" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </Varianta>
  );
}

/* ============================== Lenis ============================== */

function useLenisStav() {
  const [stav, setStav] = useState({ bezi: false, v: 0, p: 0 });
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const l = window.__lenis;
      setStav({ bezi: !!l, v: l ? Math.round(l.velocity) : 0, p: l ? Math.round(l.progress * 100) : 0 });
      raf = window.setTimeout(tick, 120) as unknown as number;
    };
    tick();
    return () => window.clearTimeout(raf);
  }, []);
  return stav;
}

function scrollNa(ciel: string, stupne: boolean) {
  const l = window.__lenis;
  if (l) {
    l.scrollTo(ciel, { duration: stupne ? 1.2 : 1, easing: stupne ? schody(6) : (t: number) => 1 - Math.pow(1 - t, 3), offset: -80 });
  } else {
    document.querySelector(ciel)?.scrollIntoView({ block: 'start' });
  }
}

function LenisUkazky() {
  const stav = useLenisStav();
  return (
    <Mriezka cols={3}>
      <Varianta props="window.__lenis · velocity · progress (odčítané každých 120 ms = stupňovito)" plocha="bg-ink text-paper">
        <dl className="grid w-full grid-cols-3 gap-2 font-mono text-paper">
          <div>
            <dt className="text-xs opacity-70">beží</dt>
            <dd className="text-2xl font-bold">{stav.bezi ? 'áno' : 'nie'}</dd>
          </div>
          <div>
            <dt className="text-xs opacity-70">rýchlosť</dt>
            <dd className="text-2xl font-bold tabular-nums">{stav.v}</dd>
          </div>
          <div>
            <dt className="text-xs opacity-70">priebeh</dt>
            <dd className="text-2xl font-bold tabular-nums">{stav.p} %</dd>
          </div>
        </dl>
      </Varianta>
      <Varianta props="lenis.scrollTo('#…', { easing: schody(6) }) vs. cubic ease-out">
        <Button variant="secondary" onClick={() => scrollNa('#podpisy', true)}>
          Schodmi na podpisy
        </Button>
        <Button variant="outline" onClick={() => scrollNa('#podpisy', false)}>
          Plynulo
        </Button>
        <Pozn>Bez Lenisu (reduced motion) skočí cez scrollIntoView.</Pozn>
      </Varianta>
      <Varianta props="data-lenis-prevent (vľavo) · bez neho (vpravo)">
        <div className="grid w-full grid-cols-2 gap-2">
          {[true, false].map((prevent) => (
            <div
              key={String(prevent)}
              {...(prevent ? { 'data-lenis-prevent': '' } : {})}
              tabIndex={0}
              className="h-40 overflow-y-auto rounded-lg border-3 border-ink bg-paper p-2 font-mono text-xs"
              aria-label={prevent ? 'Vnútorný scroll s data-lenis-prevent' : 'Vnútorný scroll bez data-lenis-prevent'}
            >
              <p className="mb-2 font-bold">{prevent ? 'prevent' : 'bez prevent'}</p>
              {CESTA.map((k) => (
                <p key={k.nazov} className="mb-3">
                  {k.kedy}: {k.text}
                </p>
              ))}
            </div>
          ))}
        </div>
      </Varianta>
    </Mriezka>
  );
}

/* ============================== CSS animation-timeline ============================== */

function CssTimeline() {
  return (
    <Mriezka cols={3}>
      <Varianta props=".kv-tl-drop · animation-timeline: view() · entry 0–60 % · steps(4)">
        <div className="grid w-full gap-3">
          {['Príjem', 'Anamnéza', 'Liečba'].map((t) => (
            <div key={t} className="kv-tl-drop rounded-lg border-3 border-ink bg-yellow px-4 py-3 font-display text-xl font-extrabold uppercase">
              {t}
            </div>
          ))}
        </div>
      </Varianta>
      <Varianta props=".kv-tl-bar · animation-timeline: scroll(nearest block) · steps(10)">
        <div className="kv-tl-box relative h-56 w-full overflow-y-auto rounded-lg border-3 border-ink bg-white" data-lenis-prevent tabIndex={0} aria-label="Scroll box s priebehom">
          <div className="sticky top-0 z-10 h-3 border-b-3 border-ink bg-paper">
            <div className="kv-tl-bar h-full origin-left bg-ink" />
          </div>
          <div className="grid gap-3 p-3">
            {CESTA.map((k) => (
              <p key={k.nazov} className="text-sm">
                <strong className="font-display uppercase">{k.nazov}.</strong> {k.text}
              </p>
            ))}
          </div>
        </div>
      </Varianta>
      <Varianta props=".kv-tl-par · view() · translate po schodoch steps(6) · --par">
        <div className="relative flex h-40 w-full items-end justify-around overflow-hidden rounded-lg border-3 border-ink bg-paper tx-dots">
          {[-80, -140, -40].map((p, i) => (
            <span key={p} className="kv-tl-par block" style={{ ['--par' as string]: `${p}px` }}>
              <XZnak className={i === 1 ? 'w-14 text-hot' : 'w-10 text-yellow'} />
            </span>
          ))}
        </div>
      </Varianta>
    </Mriezka>
  );
}

/* ============================== NumberFlow ============================== */

function NumberFlowUkazky() {
  const pulz = usePulz();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [prompty, setPrompty] = useState(pulz.prompts_today);
  const [dni, setDni] = useState(pulz.streak_days);
  useEffect(() => setPrompty(pulz.prompts_today), [pulz.prompts_today]);
  useEffect(() => setDni(pulz.streak_days), [pulz.streak_days]);
  const [kluc, setKluc] = useState(0);
  const [slova, setSlova] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setSlova(pulz.words_month), 60);
    return () => window.clearTimeout(t);
  }, [inView, pulz.words_month, kluc]);

  return (
    <div ref={ref} className="grid gap-4">
      <div className="flex justify-end">
        <Znova
          onClick={() => {
            setSlova(0);
            setKluc((k) => k + 1);
          }}
        />
      </div>
      <Mriezka cols={3}>
        <Varianta props="transformTiming/spinTiming { duration: 900, easing: 'steps(9, end)' } · locales='sk-SK'">
          <NumberFlow
            value={slova}
            locales="sk-SK"
            transformTiming={{ duration: 900, easing: 'steps(9, end)' }}
            spinTiming={{ duration: 900, easing: 'steps(9, end)' }}
            className="font-display text-4xl font-extrabold"
          />
          <Badge variant="outline">{pulz.zive ? 'pulse.json' : 'snímka'}</Badge>
        </Varianta>
        <Varianta props="trend={(staré, nové) => Math.sign(nové − staré)} · prefix · suffix · format={{ signDisplay: 'never' }}">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Menej promptov" onClick={() => setPrompty((p) => Math.max(0, p - 1))}>
              −
            </Button>
            <NumberFlow value={prompty} trend={(o: number, n: number) => Math.sign(n - o)} prefix="× " suffix=" promptov" format={{ signDisplay: 'never' }} locales="sk-SK" className="font-mono text-2xl font-bold" />
            <Button variant="outline" size="icon" aria-label="Viac promptov" onClick={() => setPrompty((p) => p + 1)}>
              +
            </Button>
          </div>
        </Varianta>
        <Varianta props="NumberFlowGroup · plugins={[continuous]} · animated · respectMotionPreference (default true)">
          <NumberFlowGroup>
            <div className="flex items-baseline gap-2 font-display text-3xl font-extrabold">
              <NumberFlow value={dni} plugins={[continuous]} suffix=" dní" />
              <span className="font-mono text-base">/</span>
              <NumberFlow value={dni * 7} plugins={[continuous]} suffix=" dní × 7" className="font-mono text-base" />
            </div>
          </NumberFlowGroup>
          <Button variant="outline" onClick={() => setDni((d) => d + 10)}>
            +10 dní
          </Button>
        </Varianta>
      </Mriezka>
      <Pozn>animated={'{false}'} = skok bez animácie; respectMotionPreference=true znamená, že pri reduced motion NumberFlow skočí sám.</Pozn>
      <Varianta props="animated={false}">
        <NumberFlow value={prompty} animated={false} className="font-mono text-2xl font-bold" />
      </Varianta>
    </div>
  );
}

/* ============================== canvas-confetti ============================== */

function ConfettiUkazky() {
  const reduced = useReduced();
  const vystrel = (fn: () => void) => {
    if (reduced) return;
    fn();
  };
  return (
    <Mriezka cols={3}>
      <Varianta props="shapeFromPath({ path: X }) · flat · colors z tokenov (yellow, hot)">
        <Button
          variant="accent"
          onClick={() =>
            vystrel(() => {
              const x = confetti.shapeFromPath({ path: X_D });
              const colors = ['yellow', 'hot'].map(tokenHex).filter((c): c is string => !!c);
              void confetti({ shapes: [x], colors, flat: true, scalar: 2, particleCount: 40, spread: 90, origin: { y: 0.7 }, disableForReducedMotion: true });
            })
          }
        >
          X konfety
        </Button>
      </Varianta>
      <Varianta props="shapeFromText({ text: '×', color: ink }) · scalar 3 · gravity 2">
        <Button
          variant="outline"
          onClick={() =>
            vystrel(() => {
              const t = confetti.shapeFromText({ text: '×', scalar: 3, color: tokenHex('ink') ?? undefined });
              void confetti({ shapes: [t], scalar: 3, gravity: 2, particleCount: 30, spread: 60, origin: { y: 0.7 }, disableForReducedMotion: true });
            })
          }
        >
          Krížiky
        </Button>
      </Varianta>
      <Varianta props="salva 4× po 120 ms (stupňovito) · square · ticks 80 · flat">
        <Button
          variant="secondary"
          onClick={() =>
            vystrel(() => {
              const colors = ['ink', 'yellow', 'white'].map(tokenHex).filter((c): c is string => !!c);
              [0.2, 0.4, 0.6, 0.8].forEach((x, i) =>
                window.setTimeout(
                  () => void confetti({ shapes: ['square'], colors, flat: true, ticks: 80, gravity: 1.8, particleCount: 24, startVelocity: 32, spread: 40, origin: { x, y: 0.8 }, disableForReducedMotion: true }),
                  i * 120,
                ),
              );
            })
          }
        >
          Salva
        </Button>
      </Varianta>
    </Mriezka>
  );
}

/* ============================== skladba ============================== */

export default function Motory() {
  const mounted = useMounted();
  const pulz = usePulz();
  return (
    <>
      <Kus id="mo-gsap" nazov="gsap · ScrollTrigger · SplitText" subor="gsap 3.15 (Standard licencia, pluginy zadarmo)" veta="Časová os a scroll: pinnuté scény, scrub, snap, rozdelenie textu. Motor pre hero a veľké scény.">
        {mounted ? (
          <Suspense fallback={<Pozn>Načítavam GSAP…</Pozn>}>
            <MotoryGsap />
          </Suspense>
        ) : (
          <Pozn>GSAP sa načíta po hydratácii.</Pozn>
        )}
      </Kus>

      <Kus id="mo-motion" nazov="motion/react" subor="motion 13.4" veta="Stavy komponentov: layout, hover / tap, vstup a odchod (AnimatePresence). Easing ako funkcia = schody.">
        <Mriezka cols={3}>
          <MotionTriaz />
          <MotionTlacidlo />
          <MotionPeciatka />
        </Mriezka>
      </Kus>

      <Kus id="mo-lenis" nazov="lenis" subor="lenis 1.3 · site/Smooth.tsx → window.__lenis" veta="Plynulý scroll celej stránky (Base islands='full'); pri reduced motion sa nespúšťa. Vie scrollTo s vlastným easingom a pustiť vnútorné scrollovanie.">
        <LenisUkazky />
      </Kus>

      <Kus id="mo-css" nazov="CSS animation-timeline: view() / scroll()" subor="vendor-kit.css (0 JS)" veta="Pohyb viazaný na scroll bez JavaScriptu; timing steps(n) = tvrdé schody. Kde to prehliadač nevie, prvky stoja.">
        <CssTimeline />
      </Kus>

      <Kus id="mo-shaders" nazov="@paper-design/shaders-react" subor="0.0.81 (WebGL)" veta="Shadery ako React komponenty; farby iba rgb/hex (tokeny sa prekladajú za behu). Len desktop ≥ 1024 px, inak statická textúra.">
        {mounted ? (
          <Suspense fallback={<Pozn>Načítavam shadery…</Pozn>}>
            <MotoryShadery />
          </Suspense>
        ) : (
          <Pozn>Shadery sa načítajú po hydratácii.</Pozn>
        )}
      </Kus>

      <Kus id="mo-numberflow" nazov="@number-flow/react" subor="0.6.2" veta="Číslice sa pretáčajú ako na počítadle; vlastný timing (aj steps), trend, prefix / sufix, skupiny a plugin continuous.">
        <NumberFlowUkazky />
        <Realne zdroj={`public/pulse.json (${datumSk(pulz.updated_at)}) + fakty.ts KORPUS`}>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Korpus tento mesiac</CardTitle>
            </CardHeader>
            <CardContent>
              <NumberFlow value={pulz.words_month} locales="sk-SK" suffix=" slov" className="font-display text-4xl font-extrabold" />
              <p className="mt-2 font-mono text-sm">
                Celkom {KORPUS.slova} slov od {KORPUS.od}.
              </p>
            </CardContent>
          </Card>
        </Realne>
      </Kus>

      <Kus id="mo-confetti" nazov="canvas-confetti" subor="1.9.4 (priamo, bez Magic UI obalu)" veta="Oslava úspechu (zápis, kvíz): vlastné tvary z cesty X alebo znaku, flat = bez kolísania, salvy po krokoch.">
        <ConfettiUkazky />
        <Pozn>Reduced motion: nič nevystrelí (disableForReducedMotion + vlastná stráž).</Pozn>
      </Kus>
    </>
  );
}
