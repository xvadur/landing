/** Katalóg V7 · motion.tsx (Reveal, Motion, Stagger, useShake, useViewTransition, prefersReducedMotion), CSS recepty bk-*
 *  z motion.css a easingy / trvania z boldkit.css, motion.css a tokens.css ako živé ukážky. */
import * as React from 'react';
import { flushSync } from 'react-dom';
import { Reveal, Motion, Stagger, useShake, useViewTransition, prefersReducedMotion } from '@/components/ui/motion';
import type { RevealDirection } from '@/components/ui/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CESTA } from '@/data/cesta';
import { VLAJKA, PRECO_NIE_CHATGPT } from '@/data/ponuka';
import { Bunka, Kus, Opravene, Pod, Posuvnik } from './Spolocne';

const SMERY: RevealDirection[] = ['up', 'down', 'left', 'right'];

const EASINGY: { v: string; zdroj: string; co: string }[] = [
  { v: '--bk-ease-snap', zdroj: 'motion.css', co: 'tlačidlá, press, reveal (mierny prekmit)' },
  { v: '--bk-ease-step', zdroj: 'motion.css', co: 'steps(4): slide-hard, skeleton-scan' },
  { v: '--bk-ease-step-2', zdroj: 'motion.css', co: 'steps(2): shake, skeleton-stamp' },
  { v: '--bk-ease-stamp', zdroj: 'motion.css', co: 'pečiatka: pomaly a potom úder' },
  { v: '--bk-ease-rubber', zdroj: 'motion.css', co: 'guma: veľký prekmit' },
  { v: '--bk-ease-linear', zdroj: 'motion.css', co: 'pásy, progress' },
  { v: '--ease-spring', zdroj: 'tokens.css', co: 'linear() pružina, card-drop' },
  { v: '--ease-out-hard', zdroj: 'tokens.css', co: 'tvrdý dobeh' },
  { v: '--ease-out', zdroj: 'Tailwind (predvoľba)', co: 'ease-out utility' },
  { v: '--ease-in-out', zdroj: 'Tailwind (predvoľba)', co: 'ease-in-out utility' },
  { v: '--ease-in', zdroj: 'Tailwind (predvoľba)', co: 'iba na odchod' },
  { v: '--ease-out-quad', zdroj: 'boldkit.css', co: 'najslabší dobeh' },
  { v: '--ease-out-cubic', zdroj: 'boldkit.css', co: '' },
  { v: '--ease-out-quart', zdroj: 'boldkit.css', co: '' },
  { v: '--ease-out-quint', zdroj: 'boldkit.css', co: '' },
  { v: '--ease-out-expo', zdroj: 'boldkit.css', co: 'najsilnejší dobeh' },
  { v: '--ease-in-out-quad', zdroj: 'boldkit.css', co: '' },
  { v: '--ease-in-out-cubic', zdroj: 'boldkit.css', co: '' },
  { v: '--ease-in-out-quart', zdroj: 'boldkit.css', co: '' },
  { v: '--ease-in-out-quint', zdroj: 'boldkit.css', co: '' },
];

const TRVANIA = ['--bk-dur-instant', '--bk-dur-snap', '--bk-dur-quick', '--bk-dur-base', '--bk-dur-slow', '--duration-fast', '--duration-base', '--duration-slow'];

/** Hodnota premennej z :root (po hydratácii), inak prázdne. */
function useCssVar(names: string[]) {
  const [vals, setVals] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setVals(Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return vals;
}

/** Easing → body grafu (x, y) v 0–1. Podporuje cubic-bezier(), steps(), linear a linear(). */
function krivka(val: string): [number, number][] {
  const v = val.replace(/\s+/g, ' ').trim();
  const n = 48;
  const cb = v.match(/^cubic-bezier\(([^)]+)\)$/);
  if (cb) {
    const [x1, y1, x2, y2] = cb[1].split(',').map(Number);
    const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const mt = 1 - t;
      pts.push([3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t, 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t]);
    }
    return pts;
  }
  const st = v.match(/^steps\((\d+)(?:, ?(\S+))?\)$/);
  if (st) {
    const k = Number(st[1]);
    const start = st[2] === 'start' || st[2] === 'jump-start';
    const pts: [number, number][] = [[0, start ? 1 / k : 0]];
    for (let i = 1; i <= k; i++) {
      const y0 = (i - (start ? 0 : 1)) / k;
      pts.push([i / k, Math.min(1, y0)], [i / k, Math.min(1, y0 + 1 / k)]);
    }
    return pts;
  }
  const lin = v.match(/^linear\((.+)\)$/);
  if (lin) {
    const raw = lin[1].split(',').map((s) => s.trim().split(' '));
    const pts: [number, number | null][] = raw.map(([y, p], i) => [Number(y), p ? parseFloat(p) / 100 : i === 0 ? 0 : i === raw.length - 1 ? 1 : null]);
    // doplň chýbajúce x rovnomerne
    for (let i = 0; i < pts.length; i++) {
      if (pts[i][1] !== null) continue;
      let j = i;
      while (pts[j][1] === null) j++;
      const a = pts[i - 1][1] as number;
      const b = pts[j][1] as number;
      for (let k = i; k < j; k++) pts[k][1] = a + ((b - a) * (k - i + 1)) / (j - i + 1);
      i = j;
    }
    return pts.map(([y, x]) => [x as number, y]);
  }
  return [
    [0, 0],
    [1, 1],
  ];
}

function Graf({ val }: { val: string }) {
  const pts = krivka(val);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(4 + x * 52).toFixed(1)} ${(52 - y * 40).toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14 shrink-0 rounded-md border-2 border-ink bg-paper" aria-hidden="true">
      <path d="M4 52 H56 M4 12 H56" stroke="var(--color-ink)" strokeOpacity="0.2" strokeWidth="1" />
      <path d={d} fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function Draha({ easing, trvanie = '1.6s' }: { easing: string; trvanie?: string }) {
  return (
    <div className="kit-draha relative h-8 min-w-0 flex-1 rounded-md border-2 border-ink bg-paper">
      <span
        className="kit-draha-kocka absolute top-0.5 left-0.5 h-6 w-6 rounded-sm border-2 border-ink bg-yellow"
        style={{ animationTimingFunction: `var(${easing})`, animationDuration: trvanie }}
      />
    </div>
  );
}

export default function Pohyb() {
  const [kolo, setKolo] = React.useState(0);
  const [stagger, setStagger] = React.useState(90);
  const [email, setEmail] = React.useState('');
  const [chyba, setChyba] = React.useState('');
  const [stav, setStav] = React.useState(0);
  const [progress, setProgress] = React.useState(40);
  const [reduced, setReduced] = React.useState<boolean | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const shake = useShake();
  const vt = useViewTransition();
  const easVals = useCssVar(EASINGY.map((e) => e.v));
  const durVals = useCssVar(TRVANIA);

  React.useEffect(() => setReduced(prefersReducedMotion()), []);

  const odoslat = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setChyba('Toto nie je e-mail. Skús znova.');
      await shake(inputRef.current);
    } else setChyba('Zapísané (ukážka, nič sa neodoslalo).');
  };

  const karty = [
    { nadpis: 'Triáž', text: VLAJKA.body[0] },
    { nadpis: 'Diagnóza', text: VLAJKA.body[1] },
    { nadpis: 'Plán liečby', text: VLAJKA.body[2] },
  ];
  const prejdi = (recept: 'hard-wipe' | 'color-block' | 'stamp') =>
    vt(() => {
      flushSync(() => setStav((s) => (s + 1) % karty.length));
    }, recept);

  return (
    <Kus
      id="motion"
      meno="motion"
      subor="src/components/ui/motion.tsx + src/lib/motion-core.ts + src/styles/motion.css · boldkit.css · tokens.css"
      pocet="3 komponenty · 2 hooky · 14 CSS receptov · 20 easingov"
      veta="Pohybové primitívy BoldKitu: vstup pri scrolle, tlak tlačidla, pečiatka, sekvencia, zatrasenie pri chybe, prechod celej stránky. Všetko CSS triedy bk-*, React iba prepína triedy — preto to rešpektuje reduced motion bez JS logiky."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={reduced ? 'destructive' : 'outline'} className="font-mono normal-case">
          prefersReducedMotion() = {reduced === null ? '…' : String(reduced)}
        </Badge>
        <Button variant="outline" className="min-h-11" onClick={() => setKolo((k) => k + 1)}>
          Prehrať vstupy znova
        </Button>
      </div>

      <Pod poznamka="IntersectionObserver pridá .bk-reveal-in (posun 16 px, 240 ms, ease-snap). Props: direction, delay, threshold, rootMargin, once, as.">
        Reveal
      </Pod>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" key={`r${kolo}`}>
        {SMERY.map((s, i) => (
          <Reveal key={s} direction={s} delay={i * 120} className="rounded-lg border-3 border-ink bg-white p-4 shadow-brutal-sm">
            <p className="font-mono text-xs">direction=&quot;{s}&quot; delay={i * 120}</p>
            <p className="mt-2 font-display text-xl font-extrabold uppercase">{CESTA[i].nazov}</p>
          </Reveal>
        ))}
      </div>

      <Pod poznamka="Deklaratívne recepty: press (tieň sa zdvihne na hover, zatlačí na klik), stamp (vstup ako pečiatka), pulse (tieň pulzuje). Dajú sa kombinovať, as mení tag.">
        Motion
      </Pod>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" key={`m${kolo}`}>
        <Bunka popis='<Motion as="button" press>'>
          <Motion as="button" press className="min-h-12 rounded-lg border-3 border-ink bg-yellow px-5 font-display font-extrabold uppercase">
            Objednaj sa
          </Motion>
        </Bunka>
        <Bunka popis="<Motion stamp>">
          <Motion stamp className="rounded-full border-4 border-ink bg-stamp px-5 py-3 font-mono font-bold text-paper uppercase">
            Overené
          </Motion>
        </Bunka>
        <Bunka popis="<Motion pulse> · rodič potrebuje isolate" className="[&>div]:isolate">
          <Motion pulse className="rounded-lg border-3 border-ink bg-white px-5 py-3 font-mono font-bold uppercase">
            Monitor
          </Motion>
        </Bunka>
        <Bunka popis="<Motion press stamp pulse> · chyba: transform zo stamp/press urobí stacking context a ::after tieňa (z-index −1) prekryje obsah" className="[&>div]:isolate">
          <Motion as="button" press stamp pulse className="min-h-12 rounded-lg border-3 border-ink bg-white px-5 font-display font-extrabold uppercase">
            Všetko
          </Motion>
        </Bunka>
      </div>

      <Pod poznamka="Stagger nastaví animation-delay deťom (delay, initialDelay, selector). Deti tu majú bk-stamp-in.">Stagger</Pod>
      <div className="max-w-md">
        <Posuvnik label="delay" min={0} max={300} step={10} hodnota={stagger} onZmena={setStagger} jednotka=" ms" />
      </div>
      <Stagger key={`s${kolo}-${stagger}`} delay={stagger} initialDelay={100} className="flex flex-wrap gap-3">
        {CESTA.map((k) => (
          <div key={k.nazov} className="bk-stamp-in rounded-lg border-3 border-ink bg-yellow px-4 py-3 shadow-brutal-sm">
            <p className="font-mono text-xs">{k.kedy}</p>
            <p className="font-display text-lg font-extrabold uppercase">{k.nazov}</p>
          </div>
        ))}
      </Stagger>

      <Pod poznamka="useShake() vráti funkciu, ktorá prvku pridá .bk-shake-x a počká na animationend. Skús odoslať zlý e-mail.">useShake</Pod>
      <form onSubmit={odoslat} className="flex max-w-xl flex-col gap-2 rounded-lg border-3 border-ink bg-white p-4 shadow-brutal-sm" noValidate>
        <label htmlFor="kit-email" className="font-display text-lg font-extrabold uppercase">
          Zápis do čakárne
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            ref={inputRef}
            id="kit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tvoj@email.sk"
            aria-invalid={chyba.startsWith('Toto') || undefined}
            aria-describedby="kit-email-stav"
            className="min-h-12 flex-1 rounded-lg border-3 border-ink bg-paper px-3 font-mono"
          />
          <Button type="submit" variant="accent" className="min-h-12">
            Chcem vedieť ako prvý
          </Button>
        </div>
        <p id="kit-email-stav" className="min-h-5 font-mono text-xs" role="status">
          {chyba}
        </p>
      </form>

      <Pod poznamka="useViewTransition() obalí document.startViewTransition a na jeden prechod nastaví <html data-bk-transition>. Recepty hard-wipe, color-block, stamp idú cez celú stránku (root). Firefox a reduced motion = okamžitá zmena.">
        useViewTransition
      </Pod>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-lg border-3 border-ink bg-yellow p-5 shadow-brutal">
          <p className="eyebrow">
            {stav + 1} / {karty.length} · {VLAJKA.nazov}
          </p>
          <p className="mt-2 font-display text-display-xs font-extrabold uppercase">{karty[stav].nadpis}</p>
          <p className="mt-2 max-w-xl">{karty[stav].text}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-col">
          {(['hard-wipe', 'color-block', 'stamp'] as const).map((r) => (
            <Button key={r} variant="outline" className="min-h-11 font-mono normal-case" onClick={() => prejdi(r)}>
              {r}
            </Button>
          ))}
        </div>
      </div>

      <Pod poznamka="Triedy z motion.css, ktoré sa dajú dať čomukoľvek (aj v .astro bez Reactu).">CSS recepty bk-*</Pod>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4" key={`c${kolo}`}>
        <Bunka popis=".bk-stamp-in-quick">
          <span className="bk-stamp-in bk-stamp-in-quick rounded-md border-3 border-ink bg-white px-3 py-2 font-mono font-bold">240 ms</span>
        </Bunka>
        <Bunka popis=".bk-stamp-in-slow">
          <span className="bk-stamp-in bk-stamp-in-slow rounded-md border-3 border-ink bg-white px-3 py-2 font-mono font-bold">700 ms</span>
        </Bunka>
        <Bunka popis=".bk-shake-x (raz)">
          <span className="bk-shake-x rounded-md border-3 border-stamp bg-white px-3 py-2 font-mono font-bold text-stamp">Chyba</span>
        </Bunka>
        <Bunka popis=".bk-press (hover / klik)">
          <button type="button" className="bk-press min-h-11 rounded-md border-3 border-ink bg-yellow px-4 font-mono font-bold">
            Stlač
          </button>
        </Bunka>
        <Bunka popis=".bk-slide-hard-x (steps 4)">
          <div className="w-full overflow-hidden rounded-md border-3 border-ink bg-paper">
            <div className="bk-slide-hard-x bg-ink px-3 py-2 font-mono text-sm text-paper">zásuvka</div>
          </div>
        </Bunka>
        <Bunka popis=".bk-slide-hard-y (steps 4)">
          <div className="h-12 w-full overflow-hidden rounded-md border-3 border-ink bg-paper">
            <div className="bk-slide-hard-y h-full bg-yellow px-3 py-2 font-mono text-sm">karta</div>
          </div>
        </Bunka>
        <Bunka popis=".bk-progress-marquee (neurčitý)">
          <div className="h-5 w-full overflow-hidden rounded-md border-3 border-ink bg-paper">
            <div className="bk-progress-marquee h-full bg-ink" />
          </div>
        </Bunka>
        <Bunka popis={`.bk-progress-stepped (${progress} %)`}>
          <div className="flex w-full flex-col gap-2">
            <div className="h-5 w-full overflow-hidden rounded-md border-3 border-ink bg-paper">
              <div className="bk-progress-stepped h-full bg-yellow transition-[width] duration-700" style={{ width: `${progress}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              aria-label="Postup"
              className="h-11 w-full accent-ink"
            />
          </div>
        </Bunka>
      </div>

      <Pod poznamka="Každá dráha = rovnaký pohyb (1,6 s tam a späť), mení sa iba timing function. Graf vľavo je vykreslený zo skutočnej hodnoty premennej v prehliadači.">
        Easingy
      </Pod>
      <ul className="grid gap-2 lg:grid-cols-2" aria-label="Easingy">
        {EASINGY.map((e) => (
          <li key={e.v} className="flex items-center gap-3 rounded-lg border-2 border-ink bg-white p-2">
            <Graf val={easVals[e.v] ?? ''} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="font-mono text-[0.72rem] leading-tight break-all">
                <strong>{e.v}</strong> · {e.zdroj}
                {e.co ? ` · ${e.co}` : ''}
              </p>
              <Draha easing={e.v} />
            </div>
          </li>
        ))}
      </ul>

      <Pod poznamka="Trvania: bk-* z boldkit.css / motion.css, duration-* z tokens.css (ease-snap).">Trvania</Pod>
      <ul className="grid gap-2 sm:grid-cols-2" aria-label="Trvania">
        {TRVANIA.map((t) => (
          <li key={t} className="flex items-center gap-3 rounded-lg border-2 border-ink bg-white p-2">
            <p className="w-44 shrink-0 font-mono text-[0.72rem]">
              <strong>{t}</strong> · {durVals[t] || '…'}
            </p>
            <div className="kit-draha relative h-8 min-w-0 flex-1 rounded-md border-2 border-ink bg-paper">
              <span
                className="kit-draha-kocka absolute top-0.5 left-0.5 h-6 w-6 rounded-sm border-2 border-ink bg-ink"
                style={{ animationDuration: `calc(var(${t}) * 4)`, animationTimingFunction: 'var(--bk-ease-snap)' }}
              />
            </div>
          </li>
        ))}
      </ul>
      <Opravene>
        <code>--bk-*</code> easingy a trvania sú definované raz (motion.css <code>:where(:root)</code>). Trvania v dráhach sú 4× spomalené,
        aby bolo vidieť rozdiel. BoldKit už neprepisuje Tailwind <code>--ease-out / --ease-in-out / --ease-in</code>; silnejšie krivky sú
        pomenované (<code>--ease-out-quart</code> …).
      </Opravene>

      <Pod poznamka="Reveal + Stagger na bloku „prečo nie iba ChatGPT“ (ponuka.ts).">Kombinácia s Adamovým obsahom</Pod>
      <Stagger key={`k${kolo}`} delay={120} className="grid gap-3 md:grid-cols-2">
        {PRECO_NIE_CHATGPT.map((r) => (
          <div key={r.chat} className="bk-stamp-in grid grid-cols-2 overflow-hidden rounded-lg border-3 border-ink shadow-brutal-sm">
            <p className="bg-paper p-3 text-sm text-ink/70 line-through decoration-2">{r.chat}</p>
            <p className="bg-yellow p-3 text-sm font-bold">{r.agent}</p>
          </div>
        ))}
      </Stagger>
    </Kus>
  );
}
