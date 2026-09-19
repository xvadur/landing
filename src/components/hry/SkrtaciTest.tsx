/** Škrtací test (Deň 1 packu 13) — čisto klientsky ostrov.
 *  Textarea → „ŠKRTNI“ → každá klišé rodina (frazyRegex) a prázdne prídavné meno (pridavneRegex) sa zabalí do
 *  <mark class="skrt"> (prečiarknutie v hot) → panel „Čo zostalo“ (Motion layout) → počítadlá (NumberFlow, 0 → hodnota) →
 *  konfety pri 0 škrtoch (Magic UI Confetti, lazy import) → zdieľateľná karta 1080×1080 (Canvas 2D v tokenoch).
 *  Ostrov: <SkrtaciTest client:idle />. Reduced motion: MotionConfig reducedMotion="user" + useReducedMotion → 120 ms fade,
 *  scrollIntoView bez smooth. Čistá logika skrtni() je v ./skrtni.ts (testy: tests/skrtni.test.mjs). */
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { toast } from 'sonner';
import { ArrowCounterClockwiseIcon, CopyIcon, DownloadSimpleIcon, ScissorsIcon } from '@phosphor-icons/react';

import { Textarea } from '@/components/vendor/neobrutalism/textarea';
import { Button } from '@/components/vendor/neobrutalism/button';
import { cn } from '@/lib/utils';
import { UKAZKA, pocetSlov, skrtni, type Skrt } from './skrtni';

export { UKAZKA, VYNIMKY, skrtni, type Segment, type Skrt } from './skrtni';

const URL_HRY = 'xvadur.com/hry/skrtaci-test/';

export default function SkrtaciTest({ className }: { className?: string }) {
  const id = useId();
  const [text, setText] = useState(UKAZKA);
  const [vysledok, setVysledok] = useState<Skrt | null>(null);
  const [kreslim, setKreslim] = useState(false);
  const vysledokRef = useRef<HTMLDivElement | null>(null);
  const rm = useReducedMotion() ?? false;

  const prazdne = text.trim().length === 0;

  function spusti() {
    if (prazdne) {
      toast('Vložte text, ktorý chcete škrtnúť.');
      return;
    }
    const r = skrtni(text);
    setVysledok(r);
    if (r.skrtov === 0) {
      void import('@/components/vendor/magicui/confetti').then(({ fireConfetti }) =>
        fireConfetti({ origin: { y: 0.55 }, particleCount: 160, spread: 90 }),
      );
      toast.success('Nula fráz. Text je váš.');
    }
  }

  useEffect(() => {
    if (!vysledok) return;
    // JS `behavior: 'smooth'` prebíja CSS scroll-behavior — pod reduced motion scrollujeme natívne.
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    vysledokRef.current?.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
  }, [vysledok]);

  function reset() {
    setVysledok(null);
    setText('');
  }

  function ukazka() {
    setVysledok(null);
    setText(UKAZKA);
  }

  async function kopiruj() {
    if (!vysledok) return;
    const t = [
      vysledok.zostalo || '(nezostalo nič)',
      '',
      `Škrtací test: ${vysledok.skrtov} škrtov, zostalo ${vysledok.zostaloSlov} z ${vysledok.povodneSlova} slov.`,
      URL_HRY,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(t);
      toast.success('Text je v schránke.');
    } catch {
      toast.error('Kopírovanie sa nepodarilo. Označte text ručne.');
    }
  }

  async function stiahni() {
    if (!vysledok || kreslim) return;
    setKreslim(true);
    try {
      const blob = await nakresliKartu(vysledok);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'skrtaci-test.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast.success('Karta 1080 × 1080 sa sťahuje.');
    } catch {
      toast.error('Kartu sa nepodarilo vykresliť.');
    } finally {
      setKreslim(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn('flex flex-col gap-10', className)}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            spusti();
          }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <label htmlFor={`${id}-text`} className="eyebrow">
              Váš text: profil, web, bio
            </label>
            <span className="font-mono text-sm text-ink/60">{pocetSlov(text)} slov</span>
          </div>
          <Textarea
            id={`${id}-text`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (vysledok) setVysledok(null);
            }}
            rows={8}
            spellCheck={false}
            className="min-h-48 text-lg leading-relaxed"
            aria-describedby={`${id}-pomoc`}
          />
          <p id={`${id}-pomoc`} className="max-w-prose text-sm text-ink/70">
            Predvyplnená ukážka je poskladaná z fráz, ktoré sa opakujú na weboch bratislavských kancelárií. Nahraďte ju
            svojím textom. Nič neodchádza z prehliadača.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="submit" tone="hot" size="xl" className="w-full sm:w-auto" disabled={prazdne}>
              Škrtni
              <ScissorsIcon weight="bold" aria-hidden="true" />
            </Button>
            <Button type="button" variant="neutral" onClick={ukazka} className="w-full sm:w-auto">
              Vložiť ukážku
            </Button>
            <Button type="button" variant="reverse" tone="paper" onClick={reset} className="w-full sm:w-auto">
              <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" />
              Vymazať
            </Button>
          </div>
        </form>

        <div ref={vysledokRef} className="scroll-mt-24">
          <AnimatePresence mode="wait">
            {vysledok && (
              <motion.div
                key="vysledok"
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={rm ? { duration: 0.12 } : { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                className="flex flex-col gap-8"
              >
                {/* počítadlá */}
                <motion.dl layout className="grid grid-cols-3 gap-[3px] overflow-hidden rounded-lg border-3 border-ink bg-ink shadow-brutal">
                  <Pocitadlo label="Škrtov" value={vysledok.skrtov} tone="bg-hot text-ink" />
                  <Pocitadlo label="Zostalo slov" value={vysledok.zostaloSlov} tone="bg-lime" />
                  <Pocitadlo label="Z pôvodných" value={vysledok.povodneSlova} tone="bg-white" />
                </motion.dl>

                {/* škrtnutý text */}
                <motion.section layout aria-labelledby={`${id}-skrtnute`} className="rounded-lg border-3 border-ink bg-white p-5 shadow-brutal sm:p-7">
                  <h2 id={`${id}-skrtnute`} className="eyebrow mb-4">
                    Škrtnutý text
                  </h2>
                  <p className="whitespace-pre-wrap break-words text-lg leading-relaxed sm:text-xl">
                    {vysledok.segmenty.map((s, i) =>
                      s.typ === 'text' ? (
                        <span key={i}>{s.text}</span>
                      ) : (
                        <mark key={i} className="skrt bg-transparent text-ink/60 line-through decoration-hot decoration-[3px]">
                          {s.text}
                          <span className="sr-only">
                            {s.typ === 'fraza' ? ` (škrtnuté — fráza: ${s.rodina ?? 'klišé'})` : ' (škrtnuté — prídavné meno bez čísla alebo mena)'}
                          </span>
                        </mark>
                      ),
                    )}
                  </p>
                  <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm uppercase tracking-[0.14em] text-ink/60">
                    <span>
                      <span className="inline-block h-[3px] w-4 bg-hot align-middle" aria-hidden="true" /> fráza zo 6 rodín alebo prídavné meno bez
                      čísla či mena
                    </span>
                  </p>
                </motion.section>

                {/* čo zostalo */}
                <motion.section
                  layout
                  aria-labelledby={`${id}-zostalo`}
                  className={cn(
                    'relative rounded-lg border-3 border-ink p-5 shadow-brutal-lg sm:p-7',
                    vysledok.skrtov === 0 ? 'bg-lime' : 'bg-yellow',
                  )}
                >
                  <span className="x-stamp" aria-hidden="true" />
                  <h2 id={`${id}-zostalo`} className="eyebrow mb-4">
                    Čo zostalo
                  </h2>
                  <motion.p
                    layout="position"
                    key={vysledok.zostalo}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={rm ? { duration: 0.12 } : { duration: 0.4, delay: 0.15 }}
                    className="whitespace-pre-wrap break-words font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl"
                  >
                    {vysledok.zostalo || '—'}
                  </motion.p>
                  <p className="mt-6 max-w-prose text-base">
                    {vysledok.skrtov === 0
                      ? 'Ani jedna fráza z tých, ktoré má každý. Toto je text, ktorý sa nedá zameniť.'
                      : vysledok.zostaloSlov <= 3
                        ? 'Väčšinou zostane meno, telefón a názov kancelárie. To je diagnóza.'
                        : 'Prečítajte, čo zostalo. Ak to môže povedať ktokoľvek, nie je to ešte vaše.'}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button type="button" tone="ink" onClick={stiahni} disabled={kreslim} className="w-full sm:w-auto">
                      <DownloadSimpleIcon weight="bold" aria-hidden="true" />
                      {kreslim ? 'Kreslím…' : 'Stiahnuť kartu'}
                    </Button>
                    <Button type="button" tone="white" onClick={kopiruj} className="w-full sm:w-auto">
                      <CopyIcon weight="bold" aria-hidden="true" />
                      Kopírovať text
                    </Button>
                  </div>
                </motion.section>

                {vysledok.skrtov > 0 && (
                  <motion.div layout className="flex flex-col gap-1 text-base">
                    <p>Deň 2 plánu Neviditeľný maklér: napíšte jednu vetu, ktorú nemá nikto.</p>
                    <a
                      href="/makleri/"
                      className="inline-flex min-h-11 items-center self-start font-display font-extrabold uppercase underline decoration-hot decoration-[3px] underline-offset-4"
                    >
                      Celý plán →
                    </a>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}

function Pocitadlo({ label, value, tone }: { label: string; value: number; tone: string }) {
  // NumberFlow animuje len zmenu hodnoty → mount na 0, ďalší frame cieľ (pod reduced motion NumberFlow skočí sám).
  const [v, setV] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setV(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <div className={cn('flex flex-col items-center gap-1 px-2 py-4 text-center sm:py-6', tone)}>
      <dt className="order-2 font-mono text-sm uppercase tracking-[0.14em]">{label}</dt>
      <dd className="order-1 font-display text-4xl font-extrabold tabular-nums tracking-tight sm:text-6xl">
        <NumberFlow value={v} locales="sk-SK" />
      </dd>
    </div>
  );
}

/* ---------- zdieľateľná karta 1080×1080 (Canvas 2D, farby z tokenov) ---------- */

function token(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
  return v || fallback;
}

function zalom(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const odsek of text.split('\n')) {
    const words = odsek.split(/\s+/).filter(Boolean);
    let line = '';
    for (const slovo of words) {
      // slovo širšie než riadok (URL, e-mail, zlepený text) → deliť po znakoch, aby karta nič neodrezala
      const kusy: string[] = [];
      let w = slovo;
      while (ctx.measureText(w).width > maxW && w.length > 1) {
        let k = w.length - 1;
        while (k > 1 && ctx.measureText(w.slice(0, k)).width > maxW) k--;
        kusy.push(w.slice(0, k));
        w = w.slice(k);
      }
      kusy.push(w);
      for (const [i, kus] of kusy.entries()) {
        if (i > 0 && line) {
          lines.push(line);
          line = '';
        }
        const t = line ? `${line} ${kus}` : kus;
        if (ctx.measureText(t).width > maxW && line) {
          lines.push(line);
          line = kus;
        } else line = t;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** X znak z /brand/x.svg. SVG bez width/height sa v canvase nevykreslí → doplníme rozmery a načítame ako data URL. */
async function nacitajX(): Promise<HTMLImageElement | null> {
  try {
    const res = await fetch('/brand/x.svg');
    if (!res.ok) return null;
    const svg = (await res.text()).replace(/<svg\b(?![^>]*\bwidth=)/, '<svg width="256" height="256"');
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
  } catch {
    return null;
  }
}

export async function nakresliKartu(v: Skrt): Promise<Blob> {
  const S = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');

  const DISPLAY = '"Bricolage Grotesque Variable", "Bricolage Grotesque", "Space Grotesk", sans-serif';
  const SANS = '"Space Grotesk", sans-serif';
  const MONO = '"Geist Mono Variable", "Geist Mono", monospace';
  try {
    await Promise.all([
      document.fonts.load(`800 120px ${DISPLAY}`),
      document.fonts.load(`700 40px ${SANS}`),
      document.fonts.load(`500 28px ${MONO}`),
    ]);
  } catch {
    /* fonty bez načítania → systémové */
  }

  const paper = token('paper', 'white');
  const ink = token('ink', 'black');
  const hot = token('hot', 'orangered');
  const yellow = token('yellow', 'yellow');
  const [xImg] = await Promise.all([nacitajX()]);

  // papier + rám 3 px × 4 (mierka karty) + tvrdý tieň vnútornej karty
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, S, S);
  const M = 48;
  ctx.fillStyle = ink;
  ctx.fillRect(M + 18, M + 18, S - 2 * M, S - 2 * M); // tieň
  ctx.fillStyle = paper;
  ctx.fillRect(M, M, S - 2 * M, S - 2 * M);
  ctx.lineWidth = 12;
  ctx.strokeStyle = ink;
  ctx.strokeRect(M, M, S - 2 * M, S - 2 * M);

  const L = M + 56;
  const W = S - 2 * L;

  // eyebrow
  ctx.fillStyle = ink;
  ctx.font = `500 26px ${MONO}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('XVADUR / HRY / DEŇ 1', L, M + 92);

  // titul
  ctx.font = `800 116px ${DISPLAY}`;
  ctx.fillText('ŠKRTACÍ', L, M + 220);
  ctx.fillText('TEST', L, M + 326);

  // hot linka pod titulom
  ctx.fillStyle = hot;
  ctx.fillRect(L, M + 352, W, 12);

  // čísla
  const y0 = M + 470;
  const stlpec = W / 3;
  const cisla: [number, string, string][] = [
    [v.skrtov, 'ŠKRTOV', hot],
    [v.zostaloSlov, 'ZOSTALO SLOV', ink],
    [v.povodneSlova, 'Z PÔVODNÝCH', ink],
  ];
  cisla.forEach(([n, label, farba], i) => {
    const x = L + i * stlpec;
    ctx.fillStyle = farba;
    ctx.font = `800 128px ${DISPLAY}`;
    ctx.fillText(n.toLocaleString('sk-SK'), x, y0);
    ctx.fillStyle = ink;
    ctx.font = `500 24px ${MONO}`;
    ctx.fillText(label, x, y0 + 44);
  });

  // čo zostalo (žltá plocha s rámom)
  const boxY = M + 560;
  const boxH = S - M - 96 - boxY;
  ctx.fillStyle = ink;
  ctx.fillRect(L + 10, boxY + 10, W, boxH);
  ctx.fillStyle = v.skrtov === 0 ? token('lime', yellow) : yellow;
  ctx.fillRect(L, boxY, W, boxH);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 9;
  ctx.strokeRect(L, boxY, W, boxH);

  ctx.fillStyle = ink;
  ctx.font = `500 22px ${MONO}`;
  ctx.fillText('ČO ZOSTALO', L + 36, boxY + 54);

  ctx.font = `700 38px ${SANS}`;
  const zostalo = v.zostalo || '—';
  const riadky = zalom(ctx, zostalo, W - 72);
  const maxRiadkov = Math.max(1, Math.floor((boxH - 100) / 48));
  const ukaz = riadky.slice(0, maxRiadkov);
  if (riadky.length > maxRiadkov) ukaz[maxRiadkov - 1] = ukaz[maxRiadkov - 1].replace(/\s+\S*$/, '') + ' …';
  ukaz.forEach((r, i) => ctx.fillText(r, L + 36, boxY + 110 + i * 48));

  // pätička: URL + X
  ctx.fillStyle = ink;
  ctx.font = `500 26px ${MONO}`;
  ctx.fillText(URL_HRY, L, S - M - 36);
  if (xImg) {
    const xs = 72;
    ctx.drawImage(xImg, S - L - xs, S - M - 36 - xs + 8, xs, xs);
  } else {
    ctx.font = `800 60px ${DISPLAY}`;
    ctx.fillText('X', S - L - 44, S - M - 36);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png');
  });
}
