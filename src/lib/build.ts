/** Údaje o builde pre pätičku („web vypisuje účtenku sám na seba", koncept §3.2 #10): dátum buildu, krátky hash
 *  a poradové číslo commitu. Hodnoty vkladá astro.config.mjs cez `vite.define` (git rev-parse pri builde);
 *  keď git nie je k dispozícii, ostane „—". Nikdy sa nepíšu ručne. */
declare const __BUILD_DATUM__: string;
declare const __BUILD_COMMIT__: string;
declare const __BUILD_COMMITY__: number;

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export const BUILD = {
  /** ISO čas buildu */
  datum: safe(() => __BUILD_DATUM__, ''),
  /** krátky commit hash (git rev-parse --short HEAD) */
  commit: safe(() => __BUILD_COMMIT__, ''),
  /** major verzia z package.json (`4.0.0` → 4) */
  commity: safe(() => __BUILD_COMMITY__, 0),
};

const NBSP = ' ';

/** „20. 9. 2026 21:04" v Europe/Bratislava; prázdny vstup → „—". */
export function buildDatumText(iso: string = BUILD.datum): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = new Intl.DateTimeFormat('sk-SK', {
    timeZone: 'Europe/Bratislava',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return `${g('day')}.${NBSP}${g('month')}.${NBSP}${g('year')} ${g('hour')}:${g('minute')}`;
}
