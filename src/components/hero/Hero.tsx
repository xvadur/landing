/** Hero V5 (XDR-205, dohodnuté 26. 9. 2026). Kompozícia po vzore Svojtka a Dymasa Alfina (work/V5_KONKURENCIA.md):
 *  hore menu v jednom riadku + stále tlačidlo „Konzultácia“ (hot); obrí XVADUR cez takmer celú šírku (≈ o štvrtinu
 *  menší než v4) s čiarou XVA | DUR a náklonom za kurzorom; pod ním motto „DIVIDED, WE ARE USELESS.“, ktoré sa po
 *  otvorení opony dešifruje (React Bits DecryptedText); napravo fotka ako okrúhla nálepka s hrubým obrysom a tvrdým
 *  tieňom cez písmená D-U-R (zástupná, XDR-199); naľavo veta + „Dohodni si konzultáciu“ + „Kto som ↓“; spodok = čierna
 *  lišta so živými číslami a zelenou diódou (XDR-203, do dodania snímka z fakty.ts); po okrajoch symboly (X, šípka,
 *  hviezdička, pečiatka OVERENÉ, nálepka 10 ROKOV V NEMOCNICI) s parallaxom cez CSS scroll timeline; ClickSpark na klik.
 *  Preč z v4: pilulky, stavový pás, znak ako vodoznak, menu pod wordmarkom.
 *  Mobil: XVADUR cez šírku, fotka pod ním zasahuje do písmen, motto, veta, tlačidlo, živý pás ako bežiaci riadok.
 *  Reduced motion: statický text, bez parallaxu, čísla hneď (CountUp), opona sa nezobrazí. SSR = plný statický obsah. */
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import DecryptedText from '@/components/vendor/reactbits/DecryptedText';
import ClickSpark from '@/components/vendor/reactbits/ClickSpark';
import Magnet from '@/components/vendor/reactbits/Magnet';
import CountUp from '@/components/vendor/reactbits/CountUp';
import { MQ_DESKTOP_POINTER, MQ_REDUCED, useMediaQuery } from '@/components/vendor/reactbits/motion-guards';
import { cn } from '@/lib/utils';
import { KONZULTACIA_CTA, NAV } from '@/data/nav';
import { OVERENE_DNA_TEXT, ZIVE_CISLA, ZIVE_CISLA_ZDROJ, type ZiveCislo } from '@/data/fakty';
import { ListIcon } from '@phosphor-icons/react';
import { Hviezda, Peciatka, Sipka, XZnak, Blesk } from '@/components/v5/Symboly';
import {
  BTN,
  CTA_HLAVNE,
  CTA_KTO,
  FOTKA,
  MENO,
  MOTTO_1,
  MOTTO_2,
  MOTTO_CLASS,
  MOTTO_LINE_CLASS,
  NALEPKA_NEMOCNICA,
  PECIATKA,
  VETA,
} from './hero-data';
import Wordmark from './Wordmark';

function Riadok({ text, hidden }: { text: string; hidden?: boolean }) {
  return (
    <span className={MOTTO_LINE_CLASS} style={hidden ? { visibility: 'hidden' } : undefined}>
      {text}
    </span>
  );
}

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

/** Náklon wordmarku za kurzorom (v4): cieľ z pointeru, rAF lerp, zápis do transform. */
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
    if (el.current) el.current.style.transform = '';
  }, [active]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { el, set };
}

/** Čísla lišty: snímka z fakty.ts; keď XDR-203 dodá verejný JSON (ZIVE_CISLA_ZDROJ), prepíšu sa živými. */
function useZiveCisla(): { cisla: ZiveCislo[]; zive: boolean } {
  const [cisla, setCisla] = useState(ZIVE_CISLA);
  const [zive, setZive] = useState(false);
  useEffect(() => {
    if (!ZIVE_CISLA_ZDROJ) return;
    const ctrl = new AbortController();
    fetch(ZIVE_CISLA_ZDROJ, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, number> | null) => {
        if (!data) return;
        setCisla((c) => c.map((z) => (typeof data[z.kluc] === 'number' ? { ...z, value: data[z.kluc]! } : z)));
        setZive(true);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return { cisla, zive };
}

function Dioda() {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.14em]">
      <span aria-hidden="true" className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-lime opacity-70 motion-safe:animate-ping" />
        <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-paper bg-lime-deep" />
      </span>
      Naživo
    </span>
  );
}

function ZivyPas({ go }: { go: boolean }) {
  const { cisla, zive } = useZiveCisla();
  const stav = zive ? 'Aktualizované teraz' : `Stav k ${OVERENE_DNA_TEXT}`;
  const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');
  return (
    <div className="relative z-20 border-t-3 border-ink bg-ink text-paper" aria-label="Živé čísla">
      {/* desktop: mriežka */}
      <div className="mx-auto hidden w-full max-w-[1600px] grid-cols-[auto_repeat(4,1fr)] items-center gap-6 px-10 py-5 lg:grid">
        <div className="flex flex-col gap-1 pr-4">
          <Dioda />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-paper/60">{stav}</span>
        </div>
        {cisla.map((z) => (
          <div key={z.kluc} className="flex items-baseline gap-3 border-l-3 border-paper/25 pl-6" title={z.note}>
            <span className="font-display text-5xl font-extrabold tabular-nums tracking-tight text-yellow">
              {go ? <CountUp to={z.value} duration={1.6} /> : fmt(z.value)}
            </span>
            <span className="font-mono text-sm uppercase leading-tight tracking-[0.1em]">{z.label}</span>
          </div>
        ))}
      </div>
      {/* mobil a tablet: bežiaci riadok (čisté CSS marquee z global.css) */}
      <div className="flex items-center lg:hidden">
        <div className="z-10 flex shrink-0 flex-col gap-0.5 border-r-3 border-paper/25 bg-ink px-4 py-3">
          <Dioda />
        </div>
        <div className="marquee min-w-0 flex-1 py-3" style={{ ['--marquee-duration' as string]: '22s' }}>
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div key={k} className="flex items-center" aria-hidden={k === 1 ? 'true' : undefined}>
                {[...cisla, ...cisla].map((z, i) => (
                  <span key={`${z.kluc}-${i}`} className="flex items-baseline gap-2 whitespace-nowrap pr-8">
                    <span className="font-display text-3xl font-extrabold tabular-nums text-yellow">{fmt(z.value)}</span>
                    <span className="font-mono text-xs uppercase tracking-[0.1em]">{z.label}</span>
                    <span aria-hidden="true" className="pl-6 text-hot">✱</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="sr-only">{stav}. Zdroj: Korpus v2, vlastné meranie písania.</p>
    </div>
  );
}

export default function Hero() {
  const desktop = useMediaQuery(MQ_DESKTOP_POINTER, false);
  const reduced = useMediaQuery(MQ_REDUCED, true);
  const animated = desktop && !reduced;

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

  const naklon = useNaklon(animated);
  const sectionRef = useRef<HTMLElement>(null);
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!animated || e.pointerType !== 'mouse' || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    naklon.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const navLink =
    'flex h-11 items-center rounded-lg border-3 border-transparent px-3 font-display text-base font-extrabold uppercase tracking-wide transition-colors duration-[var(--duration-base)] hover:border-ink hover:bg-yellow';

  return (
    <section
      ref={sectionRef}
      id="uvod"
      className="hero-v5 relative flex min-h-dvh flex-col overflow-hidden border-b-3 border-ink bg-paper"
      aria-label="Úvod"
      onPointerMove={onPointerMove}
      onPointerLeave={() => naklon.set(0, 0)}
      data-hero={animated ? 'animated' : 'static'}
    >
      <div aria-hidden="true" className="tx-dots pointer-events-none absolute inset-0 [--tx:16%]" />

      {/* ---------- menu v jednom riadku + stále tlačidlo Konzultácia ---------- */}
      <div className="relative z-30 border-b-3 border-ink bg-paper">
        <nav aria-label="Hlavná navigácia" className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
          <a href="/" className="flex min-h-11 items-center gap-2" aria-label="XVADUR — domov">
            <XZnak className="h-9 w-8 text-hot" />
            <span className="eyebrow hidden sm:inline">{MENO}</span>
          </a>
          <div className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href.replace(/^\/#/, '#')} className={navLink}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-commandk
              className="press hidden h-11 items-center rounded-lg border-3 border-ink bg-white px-3 font-mono text-sm shadow-brutal-sm lg:flex"
              aria-label="Otvoriť príkazovú paletu (⌘K)"
              title="⌘K / Ctrl K"
            >
              <span aria-hidden="true">⌘K</span>
            </button>
            <button
              type="button"
              data-nav-open
              aria-haspopup="dialog"
              aria-controls="mobilna-nav"
              className="press flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg border-3 border-ink bg-yellow px-3 font-display text-sm font-extrabold uppercase shadow-brutal-sm lg:hidden"
            >
              <ListIcon weight="bold" size={22} aria-hidden="true" />
              <span className="hidden min-[400px]:inline">Menu</span>
            </button>
            <a
              href={KONZULTACIA_CTA.hrefDomov}
              data-track="konzultacia_klik"
              data-track-miesto="hero-menu"
              className="press flex h-11 items-center rounded-lg border-3 border-ink bg-hot px-4 font-display text-sm font-extrabold uppercase text-ink shadow-brutal-sm sm:text-base"
            >
              {KONZULTACIA_CTA.label}
            </a>
          </div>
        </nav>
      </div>

      <ClickSpark sparkColor="hot" sparkSize={16} sparkRadius={34} sparkCount={10} className="relative z-10 block flex-1">
        <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col px-4 pt-6 pb-8 sm:px-6 sm:pt-8 lg:px-10 lg:pt-8 lg:pb-8">
          {/* ---------- symboly po okrajoch (parallax: .par + --par v global.css) ---------- */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <XZnak className="par absolute bottom-[30%] left-[58%] hidden h-16 w-14 rotate-[-12deg] text-hot lg:block" style={{ ['--par' as string]: '-140' }} />
            <Hviezda className="par absolute top-[20%] right-[2%] h-16 w-16 rotate-12 text-yellow sm:h-24 sm:w-24 lg:top-[50%] lg:right-[2%] lg:h-28 lg:w-28" style={{ ['--par' as string]: '-220' }} />
            <Sipka className="par absolute bottom-[3%] left-[42%] hidden h-24 w-24 text-lime lg:block" smer="dole" style={{ ['--par' as string]: '-90' }} />
            <Blesk className="par absolute right-[14%] bottom-[10%] hidden h-20 w-16 rotate-12 text-sky xl:block" style={{ ['--par' as string]: '-180' }} />
            <Peciatka id="hero-peciatka" text={PECIATKA} className="par peciatka-toc absolute right-[31%] bottom-[8%] hidden h-28 w-28 text-lime lg:block" style={{ ['--par' as string]: '-60' }} />
          </div>

          {/* ---------- scéna: wordmark + fotka nálepka ---------- */}
          <div className="relative z-10">
            <h1 className="relative w-full lg:w-[74%]" style={{ perspective: 1200 }} data-hero-wordmark>
              <span className="sr-only">XVADUR — {MENO}</span>
              <Wordmark
                ref={naklon.el}
                ciara
                className="h-auto w-full origin-center will-change-transform [--wm-shadow:5px] sm:[--wm-shadow:9px]"
              />
            </h1>

            {/* fotka ako nálepka: mobil pod wordmarkom (zasahuje do písmen), desktop napravo cez D-U-R */}
            <figure className="nalepka-foto relative z-20 mx-auto -mt-[9vw] w-[58vw] max-w-[320px] sm:-mt-[7vw] sm:w-[40vw] lg:absolute lg:top-[-8%] lg:right-[2%] lg:mt-0 lg:w-[min(28vw,420px)] lg:max-w-none">
              <div className="nalepka-telo relative aspect-square rotate-[5deg] rounded-full border-4 border-ink bg-white p-[3%] shadow-brutal-xl">
                <img
                  src={FOTKA.src}
                  alt={FOTKA.alt}
                  width={FOTKA.width}
                  height={FOTKA.height}
                  className="h-full w-full rounded-full border-3 border-ink object-cover"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              {/* nálepka 10 ROKOV V NEMOCNICI (ROZPOR 1, XDR-200) */}
              <span className="sticker absolute -bottom-3 -left-4 bg-pink text-sm sm:text-base lg:-bottom-2 lg:-left-10 lg:text-lg" style={{ ['--sticker-rotate' as string]: '-9deg' }}>
                {NALEPKA_NEMOCNICA}
              </span>
            </figure>
          </div>

          {/* ---------- motto + veta + tlačidlá ---------- */}
          <div className="relative z-10 mt-6 grid gap-5 sm:mt-8 lg:mt-5 lg:w-[64%]">
            <p lang="en" className={MOTTO_CLASS} style={{ fontVariationSettings: "'wdth' 100" }}>
              {go ? <Desifruj text={MOTTO_1} speed={70} /> : <Riadok text={MOTTO_1} hidden={hydrated} />}
              {line2 ? <Desifruj text={MOTTO_2} speed={55} /> : <Riadok text={MOTTO_2} hidden={hydrated} />}
            </p>
            <p className="max-w-2xl font-display text-xl leading-snug font-bold sm:text-2xl">{VETA}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Magnet padding={70} magnetStrength={3} disabled={!animated} className="w-full sm:w-auto">
                <a
                  href={CTA_HLAVNE.href}
                  data-cursor="termín"
                  data-track="konzultacia_klik"
                  data-track-miesto="hero"
                  className={cn(BTN, 'w-full bg-hot sm:w-auto')}
                >
                  {CTA_HLAVNE.label}
                </a>
              </Magnet>
              <a href={CTA_KTO.href} className={cn(BTN, 'w-full bg-white sm:w-auto')}>
                {CTA_KTO.label}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
      </ClickSpark>

      <ZivyPas go={go} />
    </section>
  );
}
