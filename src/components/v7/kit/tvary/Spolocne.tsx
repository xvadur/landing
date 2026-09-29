/** Katalóg V7 · skupina tvary: spoločné kúsky pre všetky sekcie (hlavička kusu, bunka variantu, prepínače, farby z tokenov).
 *  Farby iba cez CSS premenné z tokens.css / boldkit.css, nikde hex. */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/** Farby, ktoré smie dostať prop `color` (tvary, ASCII, krivky). Hodnota = CSS premenná tokenu. */
export const FARBY = [
  { id: 'ink', label: 'ink', css: 'var(--color-ink)' },
  { id: 'paper', label: 'paper', css: 'var(--color-paper)' },
  { id: 'white', label: 'white', css: 'var(--color-white)' },
  { id: 'yellow', label: 'yellow', css: 'var(--color-yellow)' },
  { id: 'stamp', label: 'stamp (alarm)', css: 'var(--color-stamp)' },
  { id: 'hot', label: 'hot · iba X a CTA', css: 'var(--color-hot)' },
] as const;
export type FarbaId = (typeof FARBY)[number]['id'];
export const farbaCss = (id: FarbaId | 'vychodzia'): string | undefined =>
  id === 'vychodzia' ? undefined : FARBY.find((f) => f.id === id)?.css;

/** Sekcia jedného kusu: nadpis (meno súboru, Geist Mono), jedna veta, zdroj, obsah. */
export function Kus({
  id,
  meno,
  subor,
  veta,
  pocet,
  children,
  className,
}: {
  id: string;
  meno: string;
  subor: string;
  veta: string;
  pocet?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={cn('scroll-mt-24 border-t-3 border-ink pt-8', className)}>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id={`${id}-h`} className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
            {meno}
          </h2>
          {pocet ? <Badge variant="secondary">{pocet}</Badge> : null}
        </div>
        <p className="max-w-3xl text-base">{veta}</p>
        <p className="font-mono text-xs text-ink/70">{subor}</p>
      </div>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}

/** Podnadpis vnútri kusu. */
export function Pod({ children, poznamka }: { children: React.ReactNode; poznamka?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="eyebrow font-bold">{children}</h3>
      {poznamka ? <p className="max-w-3xl text-sm text-ink/80">{poznamka}</p> : null}
    </div>
  );
}

/** Bunka mriežky: ukážka + popis variantu (props) v Geist Mono. */
export function Bunka({
  popis,
  children,
  className,
  tmava = false,
}: {
  popis: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tmava?: boolean;
}) {
  return (
    <figure
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-lg border-3 border-ink',
        tmava ? 'bg-ink text-paper' : 'bg-white',
        className
      )}
    >
      <div className="flex min-h-28 flex-1 items-center justify-center p-4">{children}</div>
      <figcaption
        className={cn(
          'border-t-3 border-ink px-3 py-2 font-mono text-[0.72rem] leading-snug break-words',
          tmava ? 'bg-ink text-paper border-paper/40' : 'bg-paper'
        )}
      >
        {popis}
      </figcaption>
    </figure>
  );
}

/** Upozornenie na chybu kusu alebo záplatu katalógu. */
export function Chyba({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex max-w-3xl items-start gap-2 rounded-lg border-3 border-ink bg-yellow px-3 py-2 text-sm">
      <span className="font-mono font-bold">!</span>
      <span>{children}</span>
    </p>
  );
}

/** Poznámka: chyba kusu je opravená pri zdroji (src/components/ui, src/styles). Zoznam: work/v7/katalog/OPRAVY.md */
export function Opravene({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex max-w-3xl items-start gap-2 rounded-lg border-3 border-ink bg-white px-3 py-2 text-sm">
      <span className="font-mono font-bold">✓</span>
      <span>{children}</span>
    </p>
  );
}

/** Skupina tlačidiel na výber jednej hodnoty (ciele ≥ 44 px). */
export function Vyber<T extends string>({
  label,
  hodnoty,
  hodnota,
  onZmena,
}: {
  label: string;
  hodnoty: NoInfer<readonly T[] | readonly { id: T; label: string }[]>;
  hodnota: T;
  onZmena: (v: NoInfer<T>) => void;
}) {
  const polozky = (hodnoty as readonly (T | { id: T; label: string })[]).map((h) =>
    typeof h === 'string' ? { id: h, label: h } : h
  );
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5 font-mono text-xs font-bold uppercase tracking-wider">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {polozky.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={hodnota === p.id}
            onClick={() => onZmena(p.id)}
            className={cn(
              'min-h-11 rounded-md border-2 border-ink px-3 font-mono text-xs font-bold',
              hodnota === p.id ? 'bg-ink text-paper' : 'bg-white hover:bg-yellow'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Posuvník s hodnotou. */
export function Posuvnik({
  label,
  min,
  max,
  step = 1,
  hodnota,
  onZmena,
  jednotka = '',
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  hodnota: number;
  onZmena: (v: number) => void;
  jednotka?: string;
}) {
  const id = React.useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs font-bold uppercase tracking-wider">
        {label}: <span className="font-normal">{hodnota}{jednotka}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={hodnota}
        onChange={(e) => onZmena(Number(e.target.value))}
        className="h-11 w-full accent-ink"
      />
    </div>
  );
}

/** Prepínač áno/nie ako tlačidlo. */
export function Prepinac({ label, zap, onZmena }: { label: string; zap: boolean; onZmena: (v: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={zap}
      onClick={() => onZmena(!zap)}
      className={cn(
        'min-h-11 self-end rounded-md border-2 border-ink px-3 font-mono text-xs font-bold',
        zap ? 'bg-ink text-paper' : 'bg-white hover:bg-yellow'
      )}
    >
      {label}: {zap ? 'áno' : 'nie'}
    </button>
  );
}

/** Ovládací panel (sticky na desktope, aby sa dal meniť pri scrolle mriežkou). */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'grid gap-4 rounded-lg border-3 border-ink bg-paper p-4 shadow-brutal-sm sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------
 * Canvas: prevod tokenu na RGB (canvas nevie čítať CSS premenné). Hodnota sa vezme z vypočítaného štýlu
 * (--color-ink …), prehliadač ju cez fillStyle prevedie na sRGB. Žiadny hex v kóde.
 * ------------------------------------------------------------------------------------------- */
export type RGB = [number, number, number];
const cache = new Map<string, RGB>();
export function rgbTokenu(meno: string): RGB {
  const hit = cache.get(meno);
  if (hit) return hit;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--color-${meno}`).trim();
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx || !raw) return [0, 0, 0];
  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  const rgb: RGB = [d[0], d[1], d[2]];
  cache.set(meno, rgb);
  return rgb;
}
export const cssRgb = ([r, g, b]: RGB, a = 1) => `rgb(${r} ${g} ${b} / ${a})`;
