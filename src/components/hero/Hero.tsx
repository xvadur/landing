/** Hero V5.3 (XDR-267: zdravotnícka línia, návrat k V5 s opravami). Pôvodne V5 (XDR-205, dohodnuté 26. 9. 2026).
 *  V5.3: XVADUR podčiarknutý EKG čiarou (žiadna zvislá čiara), motto trvalo čitateľné a jeho dešifrovanie sa opakuje
 *  každé 4 s (reduced motion statické), zástupná fotka = zdravotník od ramien hore s fonendoskopom (XDR-199), R voľné,
 *  živý pás = monitor vitálnych funkcií s EKG krivkou, čísla z /pulse.json. Bez pastelov. Kompozícia po vzore Svojtka a Dymasa Alfina (work/V5_KONKURENCIA.md):
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
import { ZIVE_CISLA, ZIVE_CISLA_SNIMKA, ZIVE_CISLA_ZDROJ, type ZiveCislo } from '@/data/fakty';
import { ListIcon } from '@phosphor-icons/react';
import { Hviezda, Kriz, Peciatka, Sipka, XZnak, ZdravotnikPlaceholder, ekgPath } from '@/components/v5/Symboly';
import {
  BTN,
  CTA_HLAVNE,
  CTA_KTO,
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

function Riadok({ text }: { text: string }) {
  return (
    <span className={MOTTO_LINE_CLASS}>
      {text}
    </span>
  );
}

function Desifruj({ text, speed }: { text: string; speed: number }) {
  return (
    <DecryptedText
      text={text}
      animateOn="view"
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

/** Čísla monitora: snímka z fakty.ts (SSR), po načítaní prepíše čerstvý pulz Korpusu z /pulse.json. */
function useZiveCisla(): { cisla: ZiveCislo[]; cas: string } {
  const [cisla, setCisla] = useState(ZIVE_CISLA);
  const [cas, setCas] = useState(ZIVE_CISLA_SNIMKA);
  useEffect(() => {
    if (!ZIVE_CISLA_ZDROJ) return;
    const ctrl = new AbortController();
    fetch(ZIVE_CISLA_ZDROJ, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, number | string> | null) => {
        if (!data) return;
        setCisla((c) => c.map((z) => (typeof data[z.kluc] === 'number' ? { ...z, value: data[z.kluc] as number } : z)));
        if (typeof data.updated_at === 'string')
          setCas(
            new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bratislava' }).format(new Date(data.updated_at)),
          );
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return { cisla, cas };
}

/** Monitor vitálnych funkcií: EKG krivka beží zľava doprava (CSS), čísla ako kanály monitora. */
function Monitor({ go }: { go: boolean }) {
  const { cisla, cas } = useZiveCisla();
  const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');
  const KANAL = ['text-lime-deep', 'text-yellow', 'text-paper', 'text-hot'];
  return (
    <div className="relative z-20 border-t-3 border-ink bg-ink text-paper" aria-label="Vitálne funkcie">
      <div className="mx-auto grid w-full max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(360px,1fr)_2.2fr] lg:items-center lg:gap-8 lg:px-10">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-xs font-bold uppercase tracking-[0.16em] sm:text-sm">
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <span aria-hidden="true" className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-stamp opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-stamp" />
              </span>
              Vitálne funkcie · naživo
            </span>
            <span className="whitespace-nowrap text-paper/55">{cas}</span>
          </div>
          <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="ekg h-10 w-full" aria-hidden="true">
            <path d={ekgPath(1200)} fill="none" stroke="var(--color-lime-deep)" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {cisla.map((z, i) => (
            <div key={z.kluc} className="flex flex-col border-l-3 border-paper/20 pl-3" title={z.note}>
              <dt className="order-2 font-mono text-[0.7rem] uppercase leading-tight tracking-[0.1em] text-paper/75 sm:text-xs">{z.label}</dt>
              <dd className={cn('order-1 font-display text-3xl font-extrabold tabular-nums tracking-tight whitespace-nowrap sm:text-4xl xl:text-5xl', KANAL[i])}>
                {go ? <CountUp to={z.value} duration={1.6} /> : fmt(z.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="sr-only">Stav k {cas}. Zdroj: Korpus v2, vlastné meranie písania.</p>
    </div>
  );
}

export default function Hero() {
  const desktop = useMediaQuery(MQ_DESKTOP_POINTER, false);
  const reduced = useMediaQuery(MQ_REDUCED, true);
  const animated = desktop && !reduced;

  /* motto: statické a čitateľné; po otvorení opony sa každé 4 s krátko dešifruje (remount DecryptedText cez key).
     Reduced motion: iba statický text. */
  const [go, setGo] = useState(false);
  const [cyklus, setCyklus] = useState(0);
  useEffect(() => {
    let iv = 0;
    const start = () => {
      setGo(true);
      if (window.matchMedia(MQ_REDUCED).matches) return;
      setCyklus(1);
      iv = window.setInterval(() => setCyklus((c) => c + 1), 4000);
    };
    if (!document.getElementById('opona')) start();
    else window.addEventListener('opona:done', start, { once: true });
    return () => {
      window.removeEventListener('opona:done', start);
      clearInterval(iv);
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
            <Kriz className="par absolute bottom-[30%] left-[58%] hidden h-14 w-14 rotate-[-8deg] text-stamp lg:block" style={{ ['--par' as string]: '-140' }} />
            <Hviezda className="par absolute top-[18%] right-[2%] h-14 w-14 rotate-12 text-yellow sm:h-20 sm:w-20 lg:top-[52%] lg:right-[2%] lg:h-24 lg:w-24" style={{ ['--par' as string]: '-220' }} />
            <Sipka className="par absolute bottom-[3%] left-[42%] hidden h-24 w-24 text-yellow lg:block" smer="dole" style={{ ['--par' as string]: '-90' }} />
            <XZnak className="par absolute right-[14%] bottom-[10%] hidden h-16 w-14 rotate-12 text-hot xl:block" style={{ ['--par' as string]: '-180' }} />
            <Peciatka id="hero-peciatka" text={PECIATKA} className="par peciatka-toc absolute right-[31%] bottom-[8%] hidden h-28 w-28 text-white lg:block" style={{ ['--par' as string]: '-60' }} />
          </div>

          {/* ---------- scéna: wordmark + fotka nálepka ---------- */}
          <div className="relative z-10">
            <h1 className="relative w-full lg:w-[68%]" style={{ perspective: 1200 }} data-hero-wordmark>
              <span className="sr-only">XVADUR — {MENO}</span>
              <Wordmark
                ref={naklon.el}
                className="h-auto w-full origin-center will-change-transform [--wm-shadow:5px] sm:[--wm-shadow:9px]"
              />
            </h1>
            {/* podčiarknutie: hrubá čiara s jedným úderom EKG pod písmenami (žiadna zvislá čiara v mene) */}
            <svg viewBox="0 0 680 40" preserveAspectRatio="none" className="podciarknutie mt-2 h-[clamp(20px,3vw,40px)] w-full sm:mt-3 lg:w-[68%]" aria-hidden="true">
              <path d="M0 26 H300 L312 20 L322 26 L330 26 L338 36 L350 3 L362 38 L370 26 L386 26 L398 18 L410 26 H680" fill="none" stroke="var(--color-ink)" strokeWidth="7" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* fotka ako nálepka (zástupná, XDR-199): zdravotník od ramien hore s fonendoskopom; desktop napravo vedľa
                wordmarku (R ostáva voľné), mobil pod ním */}
            <figure className="nalepka-foto relative z-20 mx-auto mt-4 w-[56vw] max-w-[300px] sm:w-[38vw] lg:absolute lg:top-[-6%] lg:right-[1%] lg:mt-0 lg:w-[min(27vw,400px)] lg:max-w-none">
              <div className="nalepka-telo relative aspect-square rotate-[4deg] overflow-hidden rounded-[28%] border-4 border-ink bg-white shadow-brutal-xl">
                <ZdravotnikPlaceholder className="h-full w-full" />
              </div>
              {/* nálepka 10 ROKOV V NEMOCNICI (ROZPOR 1, XDR-200) */}
              <span className="sticker absolute -bottom-3 -left-4 bg-white text-sm sm:text-base lg:-bottom-2 lg:-left-10 lg:text-lg" style={{ ['--sticker-rotate' as string]: '-9deg' }}>
                <span className="mr-1 text-stamp" aria-hidden="true">✚</span>
                {NALEPKA_NEMOCNICA}
              </span>
            </figure>
          </div>

          {/* ---------- motto + veta + tlačidlá ---------- */}
          <div className="relative z-10 mt-6 grid gap-5 sm:mt-8 lg:mt-5 lg:w-[66%]">
            <p lang="en" className={MOTTO_CLASS} style={{ fontVariationSettings: "'wdth' 100" }}>
              {cyklus > 0 && !reduced ? <Desifruj key={`a${cyklus}`} text={MOTTO_1} speed={38} /> : <Riadok text={MOTTO_1} />}
              {cyklus > 0 && !reduced ? <Desifruj key={`b${cyklus}`} text={MOTTO_2} speed={30} /> : <Riadok text={MOTTO_2} />}
            </p>
            <p className="max-w-2xl font-display text-xl leading-snug font-bold sm:text-2xl">{VETA}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Magnet padding={70} magnetStrength={3} disabled={!animated} className="w-full sm:w-auto">
                <a
                  href={CTA_HLAVNE.href}
                  data-cursor="termín"
                  data-track="konzultacia_klik"
                  data-track-miesto="hero"
                  className={cn(BTN, 'w-full bg-yellow sm:w-auto')}
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

      <Monitor go={go} />
    </section>
  );
}
