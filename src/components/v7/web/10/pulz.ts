/** V7-10 · živý pulz Korpusu. Kópia receptu z katalógu (grafy/spolocne.tsx `usePulz`): SSR = snímka ZIVE_CISLA
 *  z fakty.ts, po hydratácii fetch /pulse.json (4 skutočné čísla + čas snímky). Jeden fetch na stránku (zdieľaný sľub). */
import * as React from 'react';
import { ZIVE_CISLA, ZIVE_CISLA_SNIMKA, ZIVE_CISLA_ZDROJ } from '@/data/fakty';

export type Pulz = { words_month: number; prompts_today: number; streak_days: number; projects_active: number; cas: string; zive: boolean };

const cislo = (k: string) => ZIVE_CISLA.find((z) => z.kluc === k)?.value ?? 0;
export const PULZ_ZAKLAD: Pulz = {
  words_month: cislo('words_month'),
  prompts_today: cislo('prompts_today'),
  streak_days: cislo('streak_days'),
  projects_active: cislo('projects_active'),
  cas: ZIVE_CISLA_SNIMKA,
  zive: false,
};

export const POPIS: Record<'words_month' | 'prompts_today' | 'streak_days' | 'projects_active', string> = {
  words_month: ZIVE_CISLA.find((z) => z.kluc === 'words_month')!.label,
  prompts_today: ZIVE_CISLA.find((z) => z.kluc === 'prompts_today')!.label,
  streak_days: ZIVE_CISLA.find((z) => z.kluc === 'streak_days')!.label,
  projects_active: ZIVE_CISLA.find((z) => z.kluc === 'projects_active')!.label,
};

let slub: Promise<Pulz | null> | null = null;

function nacitaj(): Promise<Pulz | null> {
  if (!ZIVE_CISLA_ZDROJ) return Promise.resolve(null);
  slub ??= fetch(ZIVE_CISLA_ZDROJ, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: Record<string, unknown> | null) => {
      if (!d) return null;
      const n = (k: keyof Pulz, f: number) => (typeof d[k] === 'number' ? (d[k] as number) : f);
      return {
        words_month: n('words_month', PULZ_ZAKLAD.words_month),
        prompts_today: n('prompts_today', PULZ_ZAKLAD.prompts_today),
        streak_days: n('streak_days', PULZ_ZAKLAD.streak_days),
        projects_active: n('projects_active', PULZ_ZAKLAD.projects_active),
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
            : PULZ_ZAKLAD.cas,
        zive: true,
      };
    })
    .catch(() => null);
  return slub;
}

export function usePulz(): Pulz {
  const [p, setP] = React.useState<Pulz>(PULZ_ZAKLAD);
  React.useEffect(() => {
    let ok = true;
    nacitaj().then((d) => ok && d && setP(d));
    return () => {
      ok = false;
    };
  }, []);
  return p;
}

export const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');
