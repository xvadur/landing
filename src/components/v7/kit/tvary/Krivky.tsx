/** Katalóg V7 · math-curve-background.tsx a math-curve-loader.tsx: parametrické krivky (src/lib/math-curves.ts),
 *  po ktorých beží štvorcová „hlava“, dráha pulzuje (detailScale). */
import * as React from 'react';
import { MathCurveBackground } from '@/components/ui/math-curve-background';
import { MathCurveLoader } from '@/components/ui/math-curve-loader';
import type { BackgroundCurveKey, LoaderCurveKey } from '@/lib/math-curves';
import { CESTA } from '@/data/cesta';
import { VLAJKA } from '@/data/ponuka';
import { TERMINY } from '@/data/terminy';
import { Bunka, Chyba, FARBY, farbaCss, Kus, Panel, Pod, Posuvnik, Vyber, type FarbaId } from './Spolocne';

const BG: BackgroundCurveKey[] = ['rose', 'lissajous', 'fourier', 'spiral', 'triskelion', 'involute', 'epicycloid'];
const LOADER: LoaderCurveKey[] = [
  'rose',
  'lissajous',
  'butterfly',
  'hypotrochoid',
  'cardioid',
  'lemniscate',
  'fourier',
  'rose3',
  'astroid',
  'deltoid',
  'nephroid',
  'epicycloid',
  'superellipse',
  'triskelion',
  'involute',
  'spiral',
  'heart',
];
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const SPEEDS = ['slow', 'normal', 'fast'] as const;
const FARBY_VYBER = [{ id: 'vychodzia' as const, label: 'východzia' }, ...FARBY.filter((f) => f.id !== 'hot').map((f) => ({ id: f.id, label: f.label }))];

export default function Krivky() {
  const [speed, setSpeed] = React.useState<(typeof SPEEDS)[number]>('normal');
  const [opacity, setOpacity] = React.useState(0.35);
  const [sw, setSw] = React.useState(2);
  const [head, setHead] = React.useState<FarbaId | 'vychodzia'>('stamp');
  const [track, setTrack] = React.useState<FarbaId | 'vychodzia'>('vychodzia');
  const [headSize, setHeadSize] = React.useState(8);
  const [size, setSize] = React.useState<(typeof SIZES)[number]>('lg');

  return (
    <>
      <Kus
        id="math-curve-background"
        meno="math-curve-background"
        subor="src/components/ui/math-curve-background.tsx · 7 kriviek · children ležia nad SVG"
        pocet="7 kriviek"
        veta="Pozadie sekcie z jednej veľkej krivky, po ktorej beží hlava: tichý pohyb za textom (hero, vyšetrenie, zápis). SVG je preserveAspectRatio slice, takže vyplní akýkoľvek rám."
      >
        <Panel>
          <Vyber label="speed (9 / 5,5 / 3 s na obeh)" hodnoty={SPEEDS} hodnota={speed} onZmena={setSpeed} />
          <Posuvnik label="opacity" min={0.05} max={1} step={0.05} hodnota={opacity} onZmena={setOpacity} />
          <Posuvnik label="strokeWidth" min={0.5} max={6} step={0.5} hodnota={sw} onZmena={setSw} />
          <Vyber label="headColor" hodnoty={FARBY_VYBER} hodnota={head} onZmena={setHead} />
          <Vyber label="trackColor" hodnoty={FARBY_VYBER} hodnota={track} onZmena={setTrack} />
        </Panel>
        <Chyba>
          Pozadie beží v rAF aj mimo obrazovky (na rozdiel od ASCII a canvas efektov nemá IntersectionObserver) a každý snímok prestavia celú
          cestu <code>d</code>. Na stránke s viacerými pozadiami to stojí výkon. <code>opacity</code> platí pre celé SVG vrátane hlavy.
        </Chyba>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Krivky pozadia">
          {BG.map((c) => (
            <li key={c} className="min-w-0">
              <Bunka popis={<>curve=&quot;{c}&quot;</>} className="h-full [&>div]:p-0">
                <MathCurveBackground
                  curve={c}
                  speed={speed}
                  opacity={opacity}
                  strokeWidth={sw}
                  headColor={farbaCss(head)}
                  trackColor={farbaCss(track)}
                  className="h-44 w-full"
                >
                  <span className="sr-only">{c}</span>
                </MathCurveBackground>
              </Bunka>
            </li>
          ))}
        </ul>
        <Pod poznamka="Obsah ako children: pozadie triskelion za kartou vyšetrenia.">Kombinácia s Adamovým obsahom</Pod>
        <MathCurveBackground
          curve="triskelion"
          speed="slow"
          opacity={0.22}
          strokeWidth={1.5}
          headColor="var(--color-stamp)"
          className="overflow-hidden rounded-lg border-3 border-ink bg-yellow"
        >
          <div className="flex flex-col gap-3 p-6 sm:p-10">
            <p className="eyebrow">
              {VLAJKA.nazov} · {VLAJKA.trvanie}
            </p>
            <p className="max-w-2xl font-display text-display-xs font-extrabold uppercase">{VLAJKA.titulok}</p>
            <p className="max-w-xl">{CESTA[4].text}</p>
          </div>
        </MathCurveBackground>
      </Kus>

      <Kus
        id="math-curve-loader"
        meno="math-curve-loader"
        subor="src/components/ui/math-curve-loader.tsx · 17 kriviek · 5 veľkostí · role=status"
        pocet="17 kriviek"
        veta="Načítavanie ako matematická krivka: stopa 20 % priehľadná (na hover 40 %), hlava beží. Vhodné na stav „overujem termín“, „počítam skóre“."
      >
        <Panel>
          <Vyber label="size" hodnoty={SIZES} hodnota={size} onZmena={setSize} />
          <Posuvnik label="headSize" min={4} max={16} hodnota={headSize} onZmena={setHeadSize} />
          <Vyber label="speed" hodnoty={SPEEDS} hodnota={speed} onZmena={setSpeed} />
        </Panel>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" aria-label="Krivky načítavania">
          {LOADER.map((c) => (
            <li key={c} className="min-w-0">
              <Bunka popis={<>curve=&quot;{c}&quot;</>} className="h-full">
                <MathCurveLoader
                  curve={c}
                  size={size}
                  speed={speed}
                  headSize={headSize}
                  strokeWidth={sw * 2}
                  headColor={farbaCss(head)}
                  trackColor={farbaCss(track)}
                  aria-label={`Načítavam (${c})`}
                />
              </Bunka>
            </li>
          ))}
        </ul>
        <Pod poznamka="Všetkých 5 veľkostí (w-6 až w-24) na krivke heart.">Veľkosti</Pod>
        <div className="flex flex-wrap items-end gap-4 rounded-lg border-3 border-ink bg-white p-4">
          {SIZES.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <MathCurveLoader curve="heart" size={s} headColor="var(--color-stamp)" aria-label={`Načítavam (${s})`} />
              <span className="font-mono text-xs">{s}</span>
            </div>
          ))}
        </div>
        <Pod poznamka="Stav rezervácie: lemniskáta (∞) počas overovania termínu.">Kombinácia s Adamovým obsahom</Pod>
        <div className="flex flex-wrap items-center gap-4 rounded-lg border-3 border-ink bg-paper p-5 shadow-brutal-sm" role="status">
          <MathCurveLoader curve="lemniscate" size="lg" headColor="var(--color-stamp)" aria-label="Overujem voľný termín" />
          <div>
            <p className="font-display text-xl font-extrabold uppercase">Overujem voľný termín</p>
            <p className="text-sm">
              {VLAJKA.nazov} · {VLAJKA.trvanie} · Po–Pi {TERMINY.casy[0]}–{TERMINY.casy[TERMINY.casy.length - 1]} (návrh)
            </p>
          </div>
        </div>
      </Kus>
    </>
  );
}
