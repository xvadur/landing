/** V7-07 · živý pulz Korpusu: SSR = snímka ZIVE_CISLA z fakty.ts, po hydratácii fetch /pulse.json (4 skutočné čísla).
 *  Skopírované a upravené z katalógu (src/components/v7/kit/grafy/spolocne.tsx → usePulz). */
import * as React from 'react';
import { ZIVE_CISLA, ZIVE_CISLA_SNIMKA, ZIVE_CISLA_ZDROJ } from '@/data/fakty';

export type Pulz = { words_month: number; prompts_today: number; streak_days: number; projects_active: number; cas: string; zive: boolean };

const hodnota = (k: string) => ZIVE_CISLA.find((z) => z.kluc === k)?.value ?? 0;

export const PULZ_ZAKLAD: Pulz = {
  words_month: hodnota('words_month'),
  prompts_today: hodnota('prompts_today'),
  streak_days: hodnota('streak_days'),
  projects_active: hodnota('projects_active'),
  cas: ZIVE_CISLA_SNIMKA,
  zive: false,
};

export const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');

export function usePulz(): Pulz {
  const [p, setP] = React.useState<Pulz>(PULZ_ZAKLAD);
  React.useEffect(() => {
    if (!ZIVE_CISLA_ZDROJ) return;
    const ctrl = new AbortController();
    fetch(ZIVE_CISLA_ZDROJ, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Record<string, unknown> | null) => {
        if (!d) return;
        const num = (k: keyof Pulz, f: number) => (typeof d[k] === 'number' ? (d[k] as number) : f);
        setP((s) => ({
          words_month: num('words_month', s.words_month),
          prompts_today: num('prompts_today', s.prompts_today),
          streak_days: num('streak_days', s.streak_days),
          projects_active: num('projects_active', s.projects_active),
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
              : s.cas,
          zive: true,
        }));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return p;
}
