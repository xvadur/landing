/** V7-06 Lekáreň — spoločné háčiky a farby (kópia a úprava receptov z v7/kit/grafy/spolocne.tsx a prekrytia/spolocne.tsx).
 *  Farby pre SVG/Recharts ukazujú na tokeny (boldkit.css :root), žiadny hex. */
import * as React from 'react';
import { ZIVE_CISLA, ZIVE_CISLA_SNIMKA, ZIVE_CISLA_ZDROJ } from '@/data/fakty';

export const FARBA = {
  ink: 'hsl(var(--foreground))',
  papier: 'hsl(var(--background))',
  biela: 'hsl(var(--card))',
  zlta: 'hsl(var(--secondary))',
  alarm: 'hsl(var(--destructive))',
  siva: 'hsl(var(--chart-5))',
  tlmena: 'hsl(var(--muted))',
} as const;

export const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');

export type Pulz = { words_month: number; prompts_today: number; streak_days: number; projects_active: number; cas: string; zive: boolean };

const zaklad: Pulz = {
  words_month: ZIVE_CISLA.find((z) => z.kluc === 'words_month')?.value ?? 0,
  prompts_today: ZIVE_CISLA.find((z) => z.kluc === 'prompts_today')?.value ?? 0,
  streak_days: ZIVE_CISLA.find((z) => z.kluc === 'streak_days')?.value ?? 0,
  projects_active: ZIVE_CISLA.find((z) => z.kluc === 'projects_active')?.value ?? 0,
  cas: ZIVE_CISLA_SNIMKA,
  zive: false,
};

/** /pulse.json na klientovi (SSR = snímka ZIVE_CISLA z fakty.ts). Jeden fetch na stránku, zdieľaný medzi ostrovmi. */
let pulzPromise: Promise<Pulz | null> | null = null;
function nacitajPulz(): Promise<Pulz | null> {
  if (!ZIVE_CISLA_ZDROJ) return Promise.resolve(null);
  pulzPromise ??= fetch(ZIVE_CISLA_ZDROJ, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: Record<string, unknown> | null) => {
      if (!d) return null;
      const num = (k: keyof Pulz, f: number) => (typeof d[k] === 'number' ? (d[k] as number) : f);
      return {
        words_month: num('words_month', zaklad.words_month),
        prompts_today: num('prompts_today', zaklad.prompts_today),
        streak_days: num('streak_days', zaklad.streak_days),
        projects_active: num('projects_active', zaklad.projects_active),
        cas:
          typeof d.updated_at === 'string'
            ? new Intl.DateTimeFormat('sk-SK', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Bratislava',
              }).format(new Date(d.updated_at))
            : zaklad.cas,
        zive: true,
      };
    })
    .catch(() => null);
  return pulzPromise;
}

export function usePulz(): Pulz {
  const [p, setP] = React.useState<Pulz>(zaklad);
  React.useEffect(() => {
    let zije = true;
    void nacitajPulz().then((n) => {
      if (zije && n) setP(n);
    });
    return () => {
      zije = false;
    };
  }, []);
  return p;
}

/** true pod 640 px — leták a hra idú zdola (drawer), inak sprava / v strede. */
export function useMaloOkno(query = '(max-width: 639px)') {
  const [malo, setMalo] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMalo(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return malo;
}

/** Ťažké efekty (naklápanie za myšou) iba ≥ 1024 px s myšou a bez reduced motion. */
export const JEMNY = '(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)';

export function useMedia(query: string) {
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setOk(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return ok;
}

/** Vykresliť až po hydratácii (dátumy „dnes“, portály). */
export function useKlient() {
  const [k, setK] = React.useState(false);
  React.useEffect(() => setK(true), []);
  return k;
}

/** Počúvaj udalosť z ⌘K (window CustomEvent s detail = id). */
export function useUdalost(meno: string, f: (id: string) => void) {
  const ref = React.useRef(f);
  ref.current = f;
  React.useEffect(() => {
    const on = (e: Event) => ref.current(String((e as CustomEvent).detail ?? ''));
    window.addEventListener(meno, on);
    return () => window.removeEventListener(meno, on);
  }, [meno]);
}

export function posli(meno: string, id: string) {
  window.dispatchEvent(new CustomEvent(meno, { detail: id }));
}

/** Plynulý posun na kotvu (Lenis, ak beží; inak natívne). */
export function posunNa(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
