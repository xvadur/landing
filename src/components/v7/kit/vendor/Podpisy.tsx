/** Katalóg vendor · 4 podpisové pohyby pre Adamov domov: BoldKit (src/components/ui/) + vendor kity.
 *  1 Opona po schodoch (CSS; variant home/Opona.astro) → hero (Motion) · 2 Motto sa dešifruje každé 4 s (React Bits
 *  DecryptedText / Motion Primitives TextScramble / Fancy ScrambleHover) · 3 Živé číslo Korpusu z /pulse.json (NumberFlow +
 *  Magic UI NumberTicker + React Bits CountUp) · 4 Scroll-pinnutá vodorovná cesta (GSAP ScrollTrigger, mobil = natívny snap).
 *  Pravidlo: na jednom prvku nikdy GSAP aj Motion — opona = CSS, obsah hera = Motion, pás cesty = GSAP, karty = CSS hover. */
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import DecryptedText from '@/components/vendor/reactbits/DecryptedText';
import CountUp from '@/components/vendor/reactbits/CountUp';
import { TextScramble } from '@/components/vendor/motionprimitives/text-scramble';
import { ScrambleHover } from '@/components/vendor/fancy/text/scramble-hover';
import { NumberTicker } from '@/components/vendor/magicui/number-ticker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sticker, Stamp } from '@/components/ui/sticker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CTA_HLAVNE, MENO, MOTTO_1, MOTTO_2, NALEPKA_NEMOCNICA, VETA } from '@/components/hero/hero-data';
import { CESTA } from '@/data/cesta';
import { KORPUS, ZIVE_CISLA } from '@/data/fakty';
import { ekgPath } from '@/components/v5/Symboly';
import { Kus, Pozn, Znova, datumSk, useMedia, usePulz, useReduced } from './shared';

const schody = (n: number) => (t: number) => Math.min(1, Math.ceil(t * n) / n);
const MOTTO = `${MOTTO_1} ${MOTTO_2}`;
const EKG_D = 'M0 24 L70 24 L80 20 L88 24 L96 24 L102 30 L110 2 L118 38 L124 24 L140 24 L152 17 L164 24 L200 24 L270 24 L280 20 L288 24 L296 24 L302 30 L310 2 L318 38 L324 24 L340 24 L352 17 L364 24 L400 24 L470 24 L480 20 L488 24 L496 24 L502 30 L510 2 L518 38 L524 24 L540 24 L552 17 L564 24 L600 24';

/* ======================= 1 · Opona po schodoch ======================= */

function OponaPoSchodoch() {
  const reduced = useReduced();
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { once: true, amount: 0.5 });
  const [beh, setBeh] = useState(0);
  const [otvorene, setOtvorene] = useState(false);
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (reduced) {
      setOtvorene(true);
      return;
    }
    if (!inView) return;
    setOtvorene(false);
    setGo(false);
    const t = window.setTimeout(() => setGo(true), 60);
    return () => window.clearTimeout(t);
  }, [inView, beh, reduced]);

  const vstup = (i: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: otvorene ? 1 : 0 }, transition: { duration: 0.12 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: otvorene ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
          transition: { duration: 0.24, delay: 0.08 * i, ease: schody(3) },
        };

  return (
    <Kus
      id="podpis-opona"
      nazov="1 · Opona po schodoch → hero"
      subor="CSS (krídla, EKG) + Motion (obsah hera) + BoldKit Badge / Button / Sticker / Stamp"
      veta="XVADUR sa rozdelí medzi A a D, pod ním sa po schodoch nakreslí EKG, krídla sa rozídu v piatich tvrdých krokoch a hero sa vyrazí na miesto."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pozn>Variant home/Opona.astro (nemenený): v javisku (cqw), štart vo viewporte, EKG namiesto rovnej čiary, steps(5), prehrať znova. Reduced motion = bez opony.</Pozn>
        <Znova onClick={() => setBeh((b) => b + 1)} />
      </div>
      <div ref={stage} className="kv-javisko aspect-[4/5] w-full rounded-lg border-3 border-ink bg-paper shadow-brutal sm:aspect-[16/9]">
        {/* hero pod oponou */}
        <div className="absolute inset-0 grid content-center gap-4 p-4 sm:gap-6 sm:p-10">
          <motion.div {...vstup(0)}>
            <Badge variant="secondary">Príjem otvorený</Badge>
          </motion.div>
          <motion.p {...vstup(1)} className="font-display text-[clamp(2rem,1rem+6cqw,6rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.04em]">
            <span lang="en" className="block">
              {MOTTO_1}
            </span>
            <span lang="en" className="block">
              {MOTTO_2}
            </span>
          </motion.p>
          <motion.p {...vstup(2)} className="max-w-xl text-base font-medium sm:text-lg">
            {VETA}
          </motion.p>
          <motion.div {...vstup(3)} className="flex flex-wrap items-center gap-3">
            <Button variant="accent" size="lg" asChild>
              <a href="#podpis-korpus">
                {CTA_HLAVNE.label} <ArrowRightIcon weight="bold" />
              </a>
            </Button>
            <Sticker variant="secondary" rotation="medium-right">
              {NALEPKA_NEMOCNICA}
            </Sticker>
          </motion.div>
          <motion.div {...vstup(4)} className="absolute top-4 right-4 hidden sm:block">
            <Stamp variant="destructive" size="default" rotation="slight" doubleRing>
              {MENO}
            </Stamp>
          </motion.div>
        </div>

        {/* opona */}
        {!reduced && !otvorene ? (
          <div key={beh} className={go ? 'kv-opona kv-go' : 'kv-opona'} aria-hidden="true">
            {(['l', 'r'] as const).map((s) => (
              <div
                key={s}
                className={`kv-kridlo kv-kridlo-${s} tx-dots`}
                onAnimationEnd={(e) => {
                  if (s === 'r' && e.animationName === 'kv-r') setOtvorene(true);
                }}
              >
                <div className={s === 'r' ? 'kv-vrstva kv-vrstva-r' : 'kv-vrstva'}>
                  <img className="kv-wm" src="/brand/xvadur-ink.svg" alt="" width="678" height="130" decoding="async" />
                  <svg className="kv-ekg" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true">
                    <path d={EKG_D} pathLength={1} vectorEffect="non-scaling-stroke" />
                  </svg>
                  <p lang="en" className={`kv-motto kv-motto-${s}`}>
                    {s === 'l' ? MOTTO_1 : MOTTO_2}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Kus>
  );
}

/* ======================= 2 · Motto sa dešifruje ======================= */

type Motor = 'reactbits' | 'motionprimitives' | 'fancy';

function MottoDesifra() {
  const reduced = useReduced();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [motor, setMotor] = useState<Motor>('reactbits');
  const [tik, setTik] = useState(0);
  const [hover, setHover] = useState(false);

  // každé 4 s nový prechod, len keď je motto v obraze a pohyb je povolený
  useEffect(() => {
    if (reduced || !inView) return;
    const t = window.setInterval(() => setTik((n) => n + 1), 4000);
    return () => window.clearInterval(t);
  }, [reduced, inView]);

  const riadky = [MOTTO_1, MOTTO_2];
  const cls = 'block font-display text-[clamp(2.4rem,1rem+6vw,6.5rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.04em]';

  return (
    <Kus
      id="podpis-motto"
      nazov="2 · DIVIDED, WE ARE USELESS. — dešifrovanie"
      subor="React Bits DecryptedText · Motion Primitives TextScramble · Fancy ScrambleHover + BoldKit Card / Badge / Stamp"
      veta="Motto je vždy čitateľné; každé 4 s ním prebehne krátka vlna šumu (sekvenčne zo stredu), čítačka dostane iba pôvodný text."
    >
      <div className="flex flex-wrap gap-2" role="group" aria-label="Motor dešifrovania">
        {(
          [
            ['reactbits', 'DecryptedText'],
            ['motionprimitives', 'TextScramble'],
            ['fancy', 'ScrambleHover'],
          ] as const
        ).map(([k, l]) => (
          <Button key={k} size="sm" variant={motor === k ? 'secondary' : 'outline'} aria-pressed={motor === k} className="min-h-11" onClick={() => setMotor(k)}>
            {l}
          </Button>
        ))}
      </div>
      <div ref={ref}>
        <Card className="relative overflow-hidden bg-ink text-paper">
          <CardHeader className="border-paper/30">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Motto</Badge>
              <CardDescription className="font-mono text-paper/70">
                {motor === 'fancy' ? 'hover / fokus' : reduced ? 'reduced motion: statické' : 'každé 4 s · sekvenčne'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div
              lang="en"
              tabIndex={motor === 'fancy' ? 0 : undefined}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onFocus={() => setHover(true)}
              onBlur={() => setHover(false)}
              className="min-h-[1.8em] text-yellow outline-none"
            >
              {riadky.map((r, i) =>
                motor === 'reactbits' ? (
                  <DecryptedText
                    key={`${r}-${tik}`}
                    text={r}
                    animateOn="view"
                    initialEncrypted={tik > 0}
                    sequential
                    revealDirection="center"
                    speed={28}
                    characters="X×.:ABCDEFGHIJKLMNOPRSTUVWYZ"
                    parentClassName={cls}
                    className={i === 1 ? 'text-paper' : 'text-yellow'}
                    encryptedClassName="text-stamp"
                  />
                ) : motor === 'motionprimitives' ? (
                  <TextScramble key={`${r}-${tik}`} as="span" trigger={tik > 0} duration={0.5} speed={0.03} className={`${cls} ${i === 1 ? 'text-paper' : 'text-yellow'}`}>
                    {r}
                  </TextScramble>
                ) : (
                  <ScrambleHover
                    key={r}
                    text={r}
                    as="div"
                    active={hover}
                    sequential
                    revealDirection="center"
                    scrambleSpeed={30}
                    scrambledClassName="text-stamp"
                    className={`${cls} ${i === 1 ? 'text-paper' : 'text-yellow'}`}
                  />
                ),
              )}
            </div>
          </CardContent>
          <Stamp variant="secondary" size="sm" rotation="slight" className="absolute right-4 bottom-4 hidden sm:flex">
            19. 9.
          </Stamp>
        </Card>
      </div>
      <p className="sr-only">{MOTTO}</p>
    </Kus>
  );
}

/* ======================= 3 · Živé číslo Korpusu ======================= */

function KorpusNazivo() {
  const pulz = usePulz();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [hodnota, setHodnota] = useState(0);
  const [beh, setBeh] = useState(0);
  const dni = ZIVE_CISLA.find((c) => c.kluc === 'streak_days');

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setHodnota(pulz.words_month), 80);
    return () => window.clearTimeout(t);
  }, [inView, pulz.words_month, beh]);

  return (
    <Kus
      id="podpis-korpus"
      nazov="3 · Korpus naživo"
      subor="NumberFlow (steps) + Magic UI NumberTicker + React Bits CountUp + BoldKit Card / Badge"
      veta="Monitor vitálnych funkcií: číslo slov tento mesiac z /pulse.json naskočí po schodoch ako počítadlo, pod ním Korpus celkom a dni v rade."
    >
      <div className="flex justify-end">
        <Znova
          onClick={() => {
            setHodnota(0);
            setBeh((b) => b + 1);
          }}
        />
      </div>
      <div ref={ref} className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden bg-ink text-paper">
          <CardHeader className="border-paper/30">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={pulz.zive ? 'secondary' : 'outline'}>{pulz.zive ? '● naživo' : 'snímka'}</Badge>
              <CardDescription className="font-mono text-paper/70">pulse.json · {datumSk(pulz.updated_at)}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="eyebrow text-paper/70">slov tento mesiac</p>
            <NumberFlow
              value={hodnota}
              locales="sk-SK"
              transformTiming={{ duration: 1100, easing: 'steps(11, end)' }}
              spinTiming={{ duration: 1100, easing: 'steps(11, end)' }}
              opacityTiming={{ duration: 120, easing: 'linear' }}
              className="font-display text-[clamp(3rem,1rem+8vw,7rem)] font-extrabold leading-none text-yellow"
            />
            <div className="mt-4 h-10 overflow-hidden border-t-3 border-paper/30" aria-hidden="true">
              <svg className="kv-monitor-ekg h-10 w-[200%]" viewBox="0 0 2400 40" preserveAspectRatio="none">
                <path d={ekgPath(2400, 200)} fill="none" stroke="var(--color-yellow)" strokeWidth={3} vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Korpus celkom</CardTitle>
              <CardDescription>od {KORPUS.od}, k {KORPUS.kDatumu}</CardDescription>
            </CardHeader>
            <CardContent>
              <NumberTicker key={beh} value={Number(KORPUS.slova.replace(/\s/g, ''))} suffix=" slov" className="font-display text-4xl font-extrabold" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{dni?.label ?? 'dní v rade'}</CardTitle>
              <CardDescription>{dni?.note}</CardDescription>
            </CardHeader>
            <CardContent>
              <CountUp key={beh} to={pulz.streak_days} suffix=" dní" duration={1.2} className="font-display text-4xl font-extrabold" />
            </CardContent>
          </Card>
        </div>
      </div>
    </Kus>
  );
}

/* ======================= 4 · Scroll-pinnutá vodorovná cesta ======================= */

const MQ_PIN = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

function CestaVodorovne() {
  const sekcia = useRef<HTMLDivElement>(null);
  const pas = useRef<HTMLOListElement>(null);
  const pocitadlo = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const pin = useMedia(MQ_PIN, false);

  useEffect(() => {
    if (!pin) return;
    const el = sekcia.current;
    const track = pas.current;
    if (!el || !track) return;
    let zrus: (() => void) | undefined;
    let zivy = true;
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (!zivy) return;
      gsap.registerPlugin(ScrollTrigger);
      const n = CESTA.length;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 71;
      const vzdialenost = () => Math.max(0, track.scrollWidth - el.clientWidth);
      const lenis = window.__lenis;
      const upd = () => ScrollTrigger.update();
      lenis?.on('scroll', upd);
      el.dataset.pin = '';
      const ctx = gsap.context(() => {
        gsap.to(track, {
          x: () => -vzdialenost(),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: `top top+=${header}`,
            end: () => `+=${vzdialenost()}`,
            pin: true,
            scrub: 0.4,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            // tvrdé zastávky: po dojazde scrollu skočí na najbližšiu stanicu cesty
            snap: { snapTo: 1 / (n - 1), duration: { min: 0.12, max: 0.28 }, ease: 'power4.inOut', delay: 0.04 },
            onUpdate: (st) => {
              const i = Math.round(st.progress * (n - 1));
              if (pocitadlo.current) pocitadlo.current.textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
              if (bar.current) bar.current.style.transform = `scaleX(${(i + 1) / n})`;
            },
          },
        });
      }, el);
      ScrollTrigger.refresh();
      zrus = () => {
        lenis?.off('scroll', upd);
        ctx.revert();
        delete el.dataset.pin;
      };
    })();
    return () => {
      zivy = false;
      zrus?.();
    };
  }, [pin]);

  return (
    <Kus
      id="podpis-cesta"
      nazov="4 · Cesta vodorovne (pin + snap)"
      subor="GSAP ScrollTrigger (pin, scrub, snap) + BoldKit Card / Sticker · mobil: CSS scroll-snap"
      veta="Anamnéza ako vodorovná cesta: sekcia sa prilepí, scroll ju posúva doľava a na každej stanici tvrdo zastane; počítadlo a pás idú po krokoch."
    >
      <Pozn>Desktop ≥ 1024 px bez reduced motion = pin; inak natívny vodorovný scroll so snapom (prstom). GSAP hýbe iba pásom, karty majú CSS hover.</Pozn>
      <div ref={sekcia} className="kv-cesta overflow-hidden rounded-lg border-3 border-ink bg-yellow tx-dots">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-ink bg-paper px-4 py-3">
          <p className="font-display text-xl font-extrabold uppercase">Anamnéza</p>
          <span ref={pocitadlo} className="font-mono text-sm font-bold tabular-nums">
            01 / {String(CESTA.length).padStart(2, '0')}
          </span>
        </div>
        <div className="h-2 border-b-3 border-ink bg-white">
          <div ref={bar} className="h-full origin-left bg-ink" style={{ transform: `scaleX(${1 / CESTA.length})` }} />
        </div>
        <ol ref={pas} className="kv-cesta-pas flex gap-6 overflow-x-auto p-4 sm:p-8 lg:gap-10 lg:py-14" aria-label="Cesta: nemocnica → XVADUR" tabIndex={0}>
          {CESTA.map((k, i) => (
            <li key={k.nazov} className="w-[82%] shrink-0 sm:w-[46%] lg:w-[38%]">
              <Card interactive className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Sticker variant={i === 1 ? 'destructive' : 'secondary'} rotation={i % 2 ? 'slight-right' : 'slight'} size="sm">
                      {k.kedy}
                    </Sticker>
                    <span className="font-mono text-sm font-bold">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <CardTitle className="pt-3 font-display text-3xl font-extrabold">{k.nazov}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{k.text}</p>
                  {k.citat ? <p className="mt-3 font-serif text-xl italic">„{k.citat}“</p> : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </Kus>
  );
}

export default function Podpisy() {
  return (
    <>
      <OponaPoSchodoch />
      <MottoDesifra />
      <KorpusNazivo />
      <CestaVodorovne />
    </>
  );
}
