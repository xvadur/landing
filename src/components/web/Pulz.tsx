/** Pulz Korpusu: 4 skutočné čísla z /pulse.json (fallback fakty.ts ZIVE_CISLA). Denná rada (heatmapa) sa napojí neskôr
 *  (Adam 29. 9. 2026, work/v7/KORPUS_DATA.md) — dovtedy prázdna mriežka so štítkom, žiadne vymyslené čísla.
 *  variant="pas" = úzky pás pod hero · variant="velky" = sekcia Vitálne funkcie. Ostrov: client:visible. */
import * as React from 'react';
import NumberFlow from '@number-flow/react';
import { Badge } from '@/components/ui/badge';
import { ZIVE_CISLA, KORPUS } from '@/data/fakty';
import { cn } from '@/lib/utils';

type Pulz = { words_month: number; prompts_today: number; streak_days: number; projects_active: number; updated_at?: string };

const ZALOHA = Object.fromEntries(ZIVE_CISLA.map((c) => [c.kluc, c.value])) as unknown as Pulz;
const POPIS: Record<keyof Omit<Pulz, 'updated_at'>, string> = Object.fromEntries(ZIVE_CISLA.map((c) => [c.kluc, c.label])) as never;
const PORADIE = ['streak_days', 'prompts_today', 'words_month', 'projects_active'] as const;

const cas = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bratislava' }).format(new Date(iso))
    : null;

function usePulz() {
  const [p, setP] = React.useState<Pulz | null>(null);
  React.useEffect(() => {
    let zije = true;
    fetch('/pulse.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: Pulz) => zije && setP(j))
      .catch(() => zije && setP(ZALOHA));
    return () => {
      zije = false;
    };
  }, []);
  return p;
}

function Bodka() {
  return (
    <span className="relative inline-flex h-3 w-3" aria-hidden="true">
      <span className="absolute inset-0 animate-ping rounded-full bg-yellow opacity-70 motion-reduce:hidden" />
      <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-ink bg-yellow" />
    </span>
  );
}

/** Kalendár aktívnych dní: 53 × 7 prázdnych buniek, kým sa nenapojí denná rada Korpusu. */
function Kalendar() {
  return (
    <div className="relative">
      <div className="overflow-x-auto pb-2" data-lenis-prevent>
        <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]" aria-hidden="true">
          {Array.from({ length: 53 * 7 }).map((_, i) => (
            <span key={i} className="h-3 w-3 border border-paper/15 bg-paper/5 sm:h-3.5 sm:w-3.5" />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Badge variant="secondary" className="pointer-events-auto -rotate-2 text-sm">
          kalendár aktívnych dní · napojí sa neskôr
        </Badge>
      </div>
    </div>
  );
}

export default function PulzKorpusu({ variant = 'pas' }: { variant?: 'pas' | 'velky' }) {
  const p = usePulz();
  const hodnoty = p ?? ZALOHA;
  const kedy = cas(p?.updated_at);

  if (variant === 'pas') {
    return (
      <div className="flex flex-col gap-3 border-3 border-ink bg-ink p-4 text-paper shadow-brutal sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <p className="flex shrink-0 items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.14em]">
          <Bodka /> Korpus · naživo
        </p>
        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {PORADIE.map((k) => (
            <div key={k} className="flex flex-col">
              <dd className="order-1 font-display text-3xl font-extrabold tabular-nums text-yellow">
                <NumberFlow value={p ? hodnoty[k] : 0} locales="sk-SK" />
              </dd>
              <dt className="order-2 font-mono text-xs uppercase tracking-wider text-paper/70">{POPIS[k]}</dt>
            </div>
          ))}
        </dl>
        <a href="#vitalne" className="press inline-flex min-h-11 shrink-0 items-center justify-center border-3 border-paper px-4 font-display text-sm font-extrabold uppercase">
          Vitálne funkcie ↓
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.14em] text-paper">
          <Bodka /> Korpus · naživo {kedy && <span className="font-normal text-paper/60">· {kedy}</span>}
        </p>
        <Badge variant="outline" className="bg-transparent text-paper">
          štatistiky čoskoro
        </Badge>
      </div>
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {PORADIE.map((k, i) => (
          <div
            key={k}
            className={cn(
              'flex flex-col gap-2 border-3 border-paper p-5',
              i === 0 ? 'bg-yellow text-ink' : 'bg-transparent text-paper',
            )}
          >
            <dd className="order-1 font-display text-[clamp(2.5rem,1.5rem+3vw,4.5rem)] font-extrabold leading-none tabular-nums">
              <NumberFlow value={p ? hodnoty[k] : 0} locales="sk-SK" />
            </dd>
            <dt className={cn('order-2 font-mono text-sm uppercase tracking-wider', i === 0 ? 'text-ink/75' : 'text-paper/70')}>
              {POPIS[k]}
            </dt>
          </div>
        ))}
      </dl>
      <Kalendar />
      <p className="font-mono text-sm text-paper/70">
        Spolu {KORPUS.slova} vlastných slov a {KORPUS.prompty} promptov od {KORPUS.od}, stav k {KORPUS.kDatumu}.
      </p>
    </div>
  );
}
