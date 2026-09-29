/** Katalóg V7 · skupina vendor — spoločné kúsky stránky /kit/vendor/ (29. 9. 2026).
 *  Rám sekcie, karta kusu, mriežka variantov, stráže pohybu, farby z tokenov pre canvas/WebGL a živý pulz Korpusu.
 *  Žiadny hex: farby pre canvas-confetti a shadery sa čítajú z tokenov za behu (getComputedStyle → 1 px canvas → rgb). */
import { useEffect, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ZIVE_CISLA, ZIVE_CISLA_SNIMKA, ZIVE_CISLA_ZDROJ } from '@/data/fakty';

/* ---------- stráže pohybu ---------- */

export const MQ_REDUCED = '(prefers-reduced-motion: reduce)';
/** ťažké efekty (shadery, kurzor, ImageTrail, pin): iba desktop s myšou ≥ 1024 px */
export const MQ_DESKTOP_FX = '(hover: hover) and (pointer: fine) and (min-width: 1024px)';

export function useMedia(query: string, initial = false): boolean {
  const [ok, setOk] = useState(initial);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    const update = () => setOk(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return ok;
}

/** true až po hydratácii (SSR a prvý render = false) — brána pre lenivé GSAP / matter / WebGL moduly */
export function useMounted(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** true = pohyb vypnutý (SSR aj pred hydratáciou true, aby prvý obraz bol statický) */
export function useReduced(): boolean {
  return useMedia(MQ_REDUCED, true);
}

/** true = smú bežať ťažké efekty (desktop s myšou, bez reduced motion) */
export function useDesktopFx(): boolean {
  const reduced = useReduced();
  const desktop = useMedia(MQ_DESKTOP_FX, false);
  return desktop && !reduced;
}

/* ---------- farby z tokenov pre canvas / WebGL ---------- */

/** Token (`ink`, `yellow`, `hot`, `paper`, `white`, `stamp`) → [r, g, b] 0–255. OKLCH aj hex prejdú cez 1 px canvas. */
export function tokenBytes(name: string): [number, number, number] | null {
  if (typeof document === 'undefined') return null;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
  if (!raw) return null;
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0] ?? 0, d[1] ?? 0, d[2] ?? 0];
}

/** `rgb(r, g, b)` pre @paper-design/shaders (parser nepozná oklch ani var()) */
export function tokenRgb(name: string, fallback = 'rgb(0, 0, 0)'): string {
  const b = tokenBytes(name);
  return b ? `rgb(${b[0]}, ${b[1]}, ${b[2]})` : fallback;
}

/** `#rrggbb` pre canvas-confetti (berie iba hex) — hodnota sa vypočíta z tokenu, v zdroji hex nie je */
export function tokenHex(name: string): string | null {
  const b = tokenBytes(name);
  if (!b) return null;
  return '#' + b.map((n) => n.toString(16).padStart(2, '0')).join('');
}

/** Hook: farby tokenov po hydratácii (na serveri prázdne). */
export function useTokenRgb(names: string[]): Record<string, string> | null {
  const [colors, setColors] = useState<Record<string, string> | null>(null);
  const key = names.join('|');
  useEffect(() => {
    const out: Record<string, string> = {};
    key.split('|').forEach((n) => (out[n] = tokenRgb(n)));
    setColors(out);
  }, [key]);
  return colors;
}

/* ---------- živý pulz Korpusu (/pulse.json) ---------- */

export type Pulz = {
  words_month: number;
  prompts_today: number;
  streak_days: number;
  projects_active: number;
  updated_at: string | null;
  zive: boolean;
};

const SNIMKA: Pulz = {
  words_month: ZIVE_CISLA.find((c) => c.kluc === 'words_month')?.value ?? 0,
  prompts_today: ZIVE_CISLA.find((c) => c.kluc === 'prompts_today')?.value ?? 0,
  streak_days: ZIVE_CISLA.find((c) => c.kluc === 'streak_days')?.value ?? 0,
  projects_active: ZIVE_CISLA.find((c) => c.kluc === 'projects_active')?.value ?? 0,
  updated_at: null,
  zive: false,
};

export const PULZ_SNIMKA_TEXT = ZIVE_CISLA_SNIMKA;

/** SSR = snímka z fakty.ts, po načítaní čerstvý /pulse.json (ak zlyhá, ostáva snímka). */
export function usePulz(): Pulz {
  const [p, setP] = useState<Pulz>(SNIMKA);
  useEffect(() => {
    if (!ZIVE_CISLA_ZDROJ) return;
    const ctrl = new AbortController();
    fetch(ZIVE_CISLA_ZDROJ, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: Partial<Pulz> | null) => {
        if (!j) return;
        setP((prev) => ({
          words_month: typeof j.words_month === 'number' ? j.words_month : prev.words_month,
          prompts_today: typeof j.prompts_today === 'number' ? j.prompts_today : prev.prompts_today,
          streak_days: typeof j.streak_days === 'number' ? j.streak_days : prev.streak_days,
          projects_active: typeof j.projects_active === 'number' ? j.projects_active : prev.projects_active,
          updated_at: typeof j.updated_at === 'string' ? j.updated_at : null,
          zive: true,
        }));
      })
      .catch(() => {
        /* offline / abort: snímka ostáva */
      });
    return () => ctrl.abort();
  }, []);
  return p;
}

export function datumSk(iso: string | null): string {
  if (!iso) return PULZ_SNIMKA_TEXT;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return PULZ_SNIMKA_TEXT;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()} ${hh}:${mm}`;
}

/* ---------- rám stránky ---------- */

/** Jeden kus: meno (Geist Mono), jedna veta, mriežka variantov, reálna kombinácia. */
export function Kus({
  id,
  nazov,
  subor,
  veta,
  children,
}: {
  id?: string;
  nazov: string;
  subor?: string;
  veta: string;
  children: ReactNode;
}) {
  return (
    <article id={id} className="min-w-0 scroll-mt-24">
      <header className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-3 border-ink pb-3">
        <h3 className="font-mono text-xl font-bold normal-case tracking-tight sm:text-2xl">{nazov}</h3>
        {subor ? <code className="min-w-0 break-all font-mono text-xs text-ink/60">{subor}</code> : null}
      </header>
      <p className="mb-6 max-w-3xl text-base font-medium">{veta}</p>
      <div className="grid min-w-0 gap-6">{children}</div>
    </article>
  );
}

export function Mriezka({ children, cols = 3, className }: { children: ReactNode; cols?: 1 | 2 | 3 | 4; className?: string }) {
  const c = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[cols];
  return <div className={cn('grid min-w-0 gap-4', c, className)}>{children}</div>;
}

/** Dlaždica variantu: mono štítok s props, pod ním živý kus. */
export function Varianta({
  props,
  children,
  className,
  plocha = 'bg-white',
}: {
  props: string;
  children: ReactNode;
  className?: string;
  plocha?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col rounded-lg border-3 border-ink', plocha, className)}>
      <code className="block border-b-3 border-ink bg-paper px-3 py-2 font-mono text-[11px] leading-snug break-words text-ink/80">{props}</code>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 p-4">{children}</div>
    </div>
  );
}

/** Reálna kombinácia s Adamovým obsahom. */
export function Realne({ children, zdroj }: { children: ReactNode; zdroj: string }) {
  return (
    <div className="min-w-0 rounded-lg border-3 border-dashed border-ink bg-paper p-4 sm:p-6">
      <p className="eyebrow mb-4">
        Reálne · <span className="normal-case tracking-normal">{zdroj}</span>
      </p>
      {children}
    </div>
  );
}

export function Ukazkove() {
  return <Badge variant="outline">ukážkové dáta</Badge>;
}

/** Poznámka o stráži (reduced / desktop / zákon). */
export function Pozn({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs leading-relaxed text-ink/70">{children}</p>;
}

/** Text-only zoznam tónov, ktoré kus má, ale zákon V5.3 ich zakazuje (pastely) — farba sa nevykreslí. */
export function Zakazane({ tony, prop = 'tone' }: { tony: string[]; prop?: string }) {
  return (
    <p className="font-mono text-xs text-ink/70">
      Existuje aj: {tony.map((t) => `${prop}="${t}"`).join(' · ')} — pastely, od V5.3 zakázané (STACK.md, zákon 1), preto sa nevykresľujú.
    </p>
  );
}

/** Tlačidlo „znova“ na prehratie ukážky (≥ 44 px). */
export function Znova({ onClick, children = 'Prehrať znova' }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press inline-flex min-h-11 items-center gap-2 rounded-lg border-3 border-ink bg-white px-4 font-display text-sm font-extrabold uppercase shadow-brutal-sm hover:bg-white-hover"
    >
      {children}
    </button>
  );
}
