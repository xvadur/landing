/** V7-10 · Podnos 01 · Príjem. Bento: hero (motto, veta, CTA) + fotka Adama 4:5 (zástupná, lesk ako Glare Card)
 *  + svietiaci Korpus (4 skutočné čísla z /pulse.json) + pás faktov. Texty: hero-data.ts, v54/Prijem.astro, fakty.ts. */
import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import DecryptedText from '@/components/vendor/reactbits/DecryptedText';
import { Magnetic } from '@/components/vendor/motionprimitives/magnetic';
import { NumberTicker } from '@/components/vendor/magicui/number-ticker';
import { ShineBorder } from '@/components/vendor/magicui/shine-border';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sticker, Stamp } from '@/components/ui/sticker';
import { Sparkline } from '@/components/ui/sparkline';
import { Marquee, MarqueeItem, MarqueeSeparator } from '@/components/ui/marquee';
import { CrossShape, Star4Shape } from '@/components/ui/shapes';
import { ZdravotnikPlaceholder, ekgPath } from '@/components/v5/Symboly';
import { CTA_HLAVNE, MENO, MOTTO_1, MOTTO_2, NALEPKA_NEMOCNICA, PECIATKA, VETA } from '@/components/hero/hero-data';
import { KORPUS, MARQUEE_FAKTY, VYSLEDKY } from '@/data/fakty';
import { useReducedMotionFlag } from '@/components/vendor/motionprimitives/hooks/use-reduced-motion';
import { Dlazdica, Etiketa } from './Dlazdica';
import { POPIS, usePulz } from './pulz';
import { ROLY } from './data';

/** Motto trvalo čitateľné; každé 4 s (iba v obraze, nie reduced) prebehne dešifrovanie zo stredu (React Bits). */
function Motto() {
  const reduced = useReducedMotionFlag();
  const ref = React.useRef<HTMLDivElement>(null);
  const [kolo, setKolo] = React.useState(0);
  React.useEffect(() => {
    if (reduced || !ref.current) return;
    let vObraze = false;
    const io = new IntersectionObserver(([e]) => (vObraze = !!e?.isIntersecting), { threshold: 0.4 });
    io.observe(ref.current);
    const t = window.setInterval(() => vObraze && setKolo((k) => k + 1), 4000);
    return () => {
      io.disconnect();
      window.clearInterval(t);
    };
  }, [reduced]);
  const riadok = 'block pb-[0.04em] whitespace-nowrap';
  return (
    <div ref={ref} lang="en" className="v10-motto font-display leading-[0.86] font-extrabold tracking-[-0.045em] uppercase">
      <span className="sr-only">
        {MOTTO_1} {MOTTO_2}
      </span>
      <span aria-hidden="true" className={riadok}>
        <DecryptedText key={`a${kolo}`} text={MOTTO_1} animateOn={kolo ? 'view' : 'hover'} sequential revealDirection="center" speed={34} encryptedClassName="text-stamp" />
      </span>
      <span aria-hidden="true" className={riadok}>
        <DecryptedText key={`b${kolo}`} text={MOTTO_2} animateOn={kolo ? 'view' : 'hover'} sequential revealDirection="center" speed={30} encryptedClassName="text-stamp" />
      </span>
    </div>
  );
}

/** EKG čiara pod wordmarkom (zamknutá línia V5.3: XVADUR podčiarknutý EKG). CSS slučka po schodoch. */
function EkgPodciarknutie() {
  return (
    <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="v10-ekg h-7 w-full max-w-[560px] text-ink sm:h-9" aria-hidden="true">
      <path d={ekgPath(600, 200)} pathLength={1} fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Fotka Adama: presná zástupná plocha 4:5 (XDR-199, HIGGSFIELD: v710-hero-adam). Lesk ako Aceternity Glare Card,
 *  ale s tvrdými hranami (pás bez rozmazania) — iba jemná myš. */
function Fotka() {
  const ref = React.useRef<HTMLDivElement>(null);
  const lesk = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--gx', `${Math.round(((e.clientX - r.left) / r.width) * 100)}%`);
    ref.current.style.setProperty('--go', '1');
  };
  return (
    <figure className="relative flex h-full flex-col gap-3 p-4 sm:p-5">
      <div
        ref={ref}
        onPointerMove={lesk}
        onPointerLeave={() => ref.current?.style.setProperty('--go', '0')}
        className="v10-glare relative mx-auto aspect-[4/5] w-full max-w-[380px] rotate-[1.5deg] overflow-hidden border-3 border-ink bg-yellow shadow-[6px_6px_0_0_var(--color-ink)]"
      >
        <ZdravotnikPlaceholder className="absolute inset-0 h-full w-full" />
        <span className="v10-glare-pas" aria-hidden="true" />
        <Sticker variant="outline" size="lg" rotation="medium" className="absolute top-3 left-3 font-display font-extrabold">
          FOTKA ADAMA
        </Sticker>
        <span className="absolute right-2 bottom-2 left-2 border-2 border-ink bg-white px-2 py-1 font-mono text-[10px] font-bold tracking-wider uppercase">
          HIGGSFIELD: v710-hero-adam · 4:5 · Soul ID
        </span>
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold tracking-[0.12em] uppercase">{MENO}</span>
        <Sticker variant="default" size="sm" rotation="slight" tape>
          {NALEPKA_NEMOCNICA}
        </Sticker>
      </figcaption>
      <Stamp variant="destructive" size="default" rotation="slight" className="absolute top-12 right-2 z-10 hidden sm:flex">
        {PECIATKA}
      </Stamp>
    </figure>
  );
}

function Bodka() {
  return (
    <span aria-hidden="true" className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full rounded-full bg-yellow opacity-70 motion-safe:animate-ping" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow" />
    </span>
  );
}

/** Svietiaci widget Korpusu: 4 skutočné čísla z /pulse.json, denná rada je zástupná (Korpus sa napojí neskôr). */
function Korpus() {
  const p = usePulz();
  const cisla = [
    { k: 'words_month', v: p.words_month, velke: true },
    { k: 'prompts_today', v: p.prompts_today },
    { k: 'streak_days', v: p.streak_days },
    { k: 'projects_active', v: p.projects_active },
  ] as const;
  return (
    <div className="relative flex h-full flex-col gap-4 p-4 sm:p-5">
      <ShineBorder shineColor={['var(--color-yellow)', 'var(--color-white)']} duration={9} borderWidth={3} />
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pr-24 font-mono text-xs font-bold tracking-[0.14em] uppercase">
        <span className="flex items-center gap-2">
          <Bodka /> Korpus · naživo
        </span>
        <span className="text-paper/60">{p.cas}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {cisla.map((c) => (
          <div key={c.k} className={c.k === 'words_month' ? 'col-span-2 border-b-3 border-paper/20 pb-3' : 'border-l-3 border-yellow pl-3'}>
            <dt className="font-mono text-[11px] tracking-wider text-paper/70 uppercase">{POPIS[c.k]}</dt>
            <dd
              className={
                c.k === 'words_month'
                  ? 'v10-svieti font-display text-[clamp(2.6rem,1.6rem+3vw,4rem)] leading-none font-extrabold text-yellow tabular-nums'
                  : 'font-display text-3xl leading-none font-extrabold tabular-nums'
              }
            >
              <NumberTicker value={c.v} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2 border-3 border-paper/25 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] tracking-wider text-paper/75 uppercase">
          <span>slová · posledných 30 dní</span>
          <Badge variant="secondary" className="shadow-none hover:translate-x-0 hover:translate-y-0">
            Korpus sa napojí neskôr
          </Badge>
        </div>
        <Sparkline data={[]} height={44} color="var(--color-yellow)" ariaLabel="Denná rada slov: zástupná, Korpus sa napojí neskôr" />
      </div>
      <p className="font-mono text-xs text-paper/75">
        Korpus celkom <b className="text-paper">{KORPUS.slova}</b> slov od {KORPUS.od}
      </p>
      <a
        href="/vitalne/"
        className="mt-auto inline-flex min-h-11 items-center justify-between gap-2 border-3 border-paper bg-yellow px-4 font-display text-base font-extrabold text-ink uppercase shadow-[4px_4px_0_0_var(--color-paper)]"
      >
        štatistiky <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  );
}

export default function Prijem() {
  return (
    <div className="v10-mriezka">
      {/* hero: 5 × 4 */}
      <Dlazdica tone="paper" as="div" className="col-span-2 md:col-span-6 lg:col-span-5 lg:row-span-4" innerClassName="tx-dots [--tx:14%]" stitok="N-01 · príjem" bezMagnetu>
        <div className="relative flex h-full flex-col gap-5 p-5 sm:p-7">
          <Etiketa cislo="01" nazov="Príjem" />
          <div className="flex flex-col gap-1">
            <img src="/brand/xvadur-ink.svg" alt="XVADUR" width={678} height={130} className="h-auto w-full max-w-[560px]" />
            <EkgPodciarknutie />
          </div>
          <h1 className="font-display text-[clamp(2rem,1.2rem+2.6vw,3.4rem)] leading-[0.95] font-extrabold tracking-tight">
            Ahoj, som <span className="font-serif font-normal tracking-normal italic">Adam</span>
            <span className="text-hot">.</span>
            <span className="mt-2 block font-mono text-sm font-bold tracking-[0.14em] uppercase sm:text-base">✚ {ROLY[0]}</span>
          </h1>
          <Motto />
          <p className="max-w-xl text-lg leading-snug sm:text-xl">{VETA}</p>
          <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Magnetic intensity={0.35} range={140}>
              <Button asChild variant="accent" size="xl" className="w-full px-6 text-base sm:w-auto sm:text-lg">
                <a href="#vysetrenie" data-track="konzultacia_klik" data-track-miesto="v710-hero">
                  {CTA_HLAVNE.label} <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            </Magnetic>
            <Button asChild variant="outline" size="xl" className="px-6 text-base sm:text-lg">
              <a href="#anamneza">Kto som</a>
            </Button>
          </div>
          <CrossShape size={46} color="var(--color-stamp)" animation="spin-step" speed="slow" className="absolute top-14 right-5 hidden sm:block" aria-hidden="true" />
        </div>
      </Dlazdica>

      {/* fotka: 3 × 4 (hero dlaždica s obrazom Adama) */}
      <Dlazdica tone="white" as="div" className="col-span-2 md:col-span-3 lg:col-span-3 lg:row-span-4" stitok="N-02 · fotka">
        <Fotka />
        <Star4Shape size={54} color="var(--color-yellow)" animation="pulse-hard" className="absolute bottom-16 left-2 hidden lg:block" aria-hidden="true" />
      </Dlazdica>

      {/* Korpus: 4 × 4, svieti */}
      <Dlazdica tone="ink" className="col-span-2 md:col-span-3 lg:col-span-4 lg:row-span-4" stitok="N-03 · monitor" ariaLabel="Korpus naživo">
        <Korpus />
      </Dlazdica>

      {/* pás faktov: celá šírka */}
      <Dlazdica tone="yellow" as="div" className="col-span-2 md:col-span-6 lg:col-span-12" innerClassName="justify-center" bezMagnetu>
        <Marquee speed="slow" bordered={false} repeat={2} className="bg-transparent" aria-label="Fakty">
          {[...MARQUEE_FAKTY, ...VYSLEDKY.slice(3)].map((f) => (
            <React.Fragment key={f.label}>
              <MarqueeItem className="font-display text-xl font-extrabold sm:text-2xl">
                {f.value} <span className="font-mono text-xs font-bold tracking-wider text-ink/70">{f.note}</span>
              </MarqueeItem>
              <MarqueeSeparator className="text-ink">✚</MarqueeSeparator>
            </React.Fragment>
          ))}
        </Marquee>
      </Dlazdica>
    </div>
  );
}

