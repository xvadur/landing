/** V7-01 · spoločné háčiky ostrovov: živý pulz Korpusu (/pulse.json), signál „alarm“ z monitora (podpisový pohyb),
 *  reduced motion, malé okno. Farby pre SVG a canvas iba cez tokeny. */
import * as React from 'react';
import { ZIVE_CISLA_ZDROJ } from '@/data/fakty';
import { PULZ_ZAKLAD, ZIVE_CISLA_SNIMKA, type PulzKluc } from './data';

export type Pulz = Record<PulzKluc, number> & { cas: string; nacitane: boolean };

const ZAKLAD: Pulz = { ...PULZ_ZAKLAD, cas: ZIVE_CISLA_SNIMKA, nacitane: false };

/** Jeden fetch na stránku, zdieľaný všetkými ostrovmi. */
let sluz: Promise<Pulz | null> | null = null;
function nacitajPulz(): Promise<Pulz | null> {
  if (!ZIVE_CISLA_ZDROJ) return Promise.resolve(null);
  sluz ??= fetch(ZIVE_CISLA_ZDROJ, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: Record<string, unknown> | null) => {
      if (!d) return null;
      const num = (k: PulzKluc) => (typeof d[k] === 'number' ? (d[k] as number) : ZAKLAD[k]);
      return {
        words_month: num('words_month'),
        prompts_today: num('prompts_today'),
        streak_days: num('streak_days'),
        projects_active: num('projects_active'),
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
            : ZAKLAD.cas,
        nacitane: true,
      };
    })
    .catch(() => null);
  return sluz;
}

export function usePulz(): Pulz {
  const [p, setP] = React.useState<Pulz>(ZAKLAD);
  React.useEffect(() => {
    let zive = true;
    nacitajPulz().then((n) => zive && n && setP(n));
    return () => {
      zive = false;
    };
  }, []);
  return p;
}

declare global {
  interface Window {
    __m01Alarm?: Record<string, number>;
  }
}

/** Počet „alarmov“ obrazovky (príchod na blok). Monitor (skript v stránke) vysiela `m01:alarm` s `{ id }`
 *  a počíta ich vo window.__m01Alarm, aby ostrov hydratovaný neskôr vedel, že alarm už zaznel. */
export function useAlarm(id: string): number {
  const [tik, setTik] = React.useState(0);
  React.useEffect(() => {
    const uz = window.__m01Alarm?.[id] ?? 0;
    if (uz) setTik(uz);
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ id: string; n: number }>).detail;
      if (d?.id === id) setTik(d.n);
    };
    window.addEventListener('m01:alarm', on);
    return () => window.removeEventListener('m01:alarm', on);
  }, [id]);
  return tik;
}

/** Číslo, ktoré pri alarme skočí na nulu a po krokoch sa prekreslí na živú hodnotu (NumberFlow so steps()). */
export function useSkok(hodnota: number, tik: number): number {
  const [v, setV] = React.useState(hodnota);
  const posledny = React.useRef(0);
  React.useEffect(() => {
    if (tik === posledny.current) {
      setV(hodnota);
      return;
    }
    posledny.current = tik;
    if (redukovane()) {
      setV(hodnota);
      return;
    }
    setV(0);
    const t = window.setTimeout(() => setV(hodnota), 380);
    return () => window.clearTimeout(t);
  }, [hodnota, tik]);
  return v;
}

export function redukovane() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useRedukovane() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return r;
}

/** true pod 640 px — sheet zdola, drawer namiesto dialógu. */
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

export const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');

/** Farby pre SVG atribúty (Recharts, gauge) — odkazy na tokeny BoldKitu, žiadny hex. */
export const FARBA = {
  ink: 'hsl(var(--foreground))',
  papier: 'hsl(var(--background))',
  biela: 'hsl(var(--card))',
  zlta: 'hsl(var(--secondary))',
  alarm: 'hsl(var(--destructive))',
  siva: 'hsl(var(--chart-5))',
  tlmena: 'hsl(var(--muted))',
} as const;

/** Toaster tohto variantu (site Toaster z Base nemá id, hlásenia monitora idú sem). */
export const TOASTER = 'm01';

/** Skok na obrazovku: Lenis (ak beží) inak natívne; scroll-margin-top rieši horný pás. */
export function skocNa(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as Window & { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } | null }).__lenis;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: redukovane() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', `#${id}`);
}
