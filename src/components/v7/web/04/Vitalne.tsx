/** V7-04 · Vitálne funkcie (Korpus naživo) v triáži 1: svietiaci monitor so 4 skutočnými číslami z /pulse.json
 *  (fetch v prehliadači, SSR = snímka ZIVE_CISLA z fakty.ts), tep dňa (gauge, stupnica = návrh), prsteň série
 *  (radial-bar k míľniku 100 = návrh) a denná rada ako plochá čiara so štítkom „Korpus sa napojí neskôr“
 *  (Adam 29. 9.: denná rada príde s pulzom v3). Čísla naskočia cez React Bits CountUp. Ostrov: client:visible. */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';
import { GaugeChart, type GaugeChartZone } from '@/components/ui/gauge-chart';
import { RadialBarChart } from '@/components/ui/radial-bar-chart';
import { Badge } from '@/components/ui/badge';
import { AsciiPulse } from '@/components/ui/ascii-shapes';
import CountUp from '@/components/vendor/reactbits/CountUp';
import { ZIVE_CISLA, ZIVE_CISLA_SNIMKA, ZIVE_CISLA_ZDROJ } from '@/data/fakty';
import { cn } from '@/lib/utils';

type Pulz = { words_month: number; prompts_today: number; streak_days: number; projects_active: number; cas: string };

const zaklad: Pulz = {
  words_month: ZIVE_CISLA.find((z) => z.kluc === 'words_month')?.value ?? 0,
  prompts_today: ZIVE_CISLA.find((z) => z.kluc === 'prompts_today')?.value ?? 0,
  streak_days: ZIVE_CISLA.find((z) => z.kluc === 'streak_days')?.value ?? 0,
  projects_active: ZIVE_CISLA.find((z) => z.kluc === 'projects_active')?.value ?? 0,
  cas: ZIVE_CISLA_SNIMKA,
};

function usePulz() {
  const [p, setP] = useState<Pulz>(zaklad);
  const [nacitane, setNacitane] = useState(false);
  useEffect(() => {
    if (!ZIVE_CISLA_ZDROJ) return;
    const ctrl = new AbortController();
    fetch(ZIVE_CISLA_ZDROJ, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Record<string, unknown> | null) => {
        if (!d) return;
        const num = (k: keyof Pulz, f: number) => (typeof d[k] === 'number' ? (d[k] as number) : f);
        setP((s) => ({
          words_month: num('words_month', s.words_month as number),
          prompts_today: num('prompts_today', s.prompts_today as number),
          streak_days: num('streak_days', s.streak_days as number),
          projects_active: num('projects_active', s.projects_active as number),
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
        }));
        setNacitane(true);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return { p, nacitane };
}

/** Pásma „tepu dňa“ (prompty dnes) — dizajnový návrh z katalógu, na stránke tak označený. */
const TEP_ZONY: GaugeChartZone[] = [
  { from: 0, to: 60, color: 'hsl(var(--muted))', label: 'pokoj' },
  { from: 60, to: 110, color: 'hsl(var(--secondary))', label: 'záťaž' },
  { from: 110, to: 150, color: 'hsl(var(--destructive))', label: 'tachykardia' },
];

export default function Vitalne() {
  const { p, nacitane } = usePulz();
  const cisla = [
    { k: 'words_month', v: p.words_month, label: 'slov tento mesiac', note: 'napísané s AI' },
    { k: 'prompts_today', v: p.prompts_today, label: 'promptov dnes', note: 'do večera' },
    { k: 'streak_days', v: p.streak_days, label: 'dní v rade', note: 'každý deň aspoň jeden prompt' },
    { k: 'projects_active', v: p.projects_active, label: 'bežiacich projektov', note: 'rozpracované v Lineari' },
  ];
  return (
    <div className="relative flex flex-col gap-5 border-3 border-ink bg-ink p-4 text-paper shadow-[8px_8px_0_0_var(--color-yellow)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs font-bold uppercase tracking-[0.14em]">
        <span className="flex items-center gap-2">
          <span className="relative flex h-3 w-3" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-stamp opacity-70 motion-safe:animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-paper bg-stamp" />
          </span>
          Vitálne funkcie · Korpus naživo
        </span>
        <span className="text-paper/70">
          {nacitane ? 'pulse.json' : 'snímka'} · {p.cas}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="list">
        {cisla.map((c, i) => (
          <li key={c.k} className={cn('flex flex-col gap-1 border-3 border-paper/80 p-3', i === 0 ? 'bg-yellow text-ink' : 'bg-ink')}>
            <span className={cn('font-display text-[clamp(1.7rem,1.2rem+2vw,2.6rem)] leading-none font-extrabold tabular-nums', i === 0 ? '' : 'text-yellow')}>
              <CountUp key={`${c.k}-${c.v}`} to={c.v} duration={1.2} />
            </span>
            <span className="font-mono text-[0.7rem] leading-tight font-bold uppercase">{c.label}</span>
            <span className={cn('text-xs leading-snug', i === 0 ? 'text-ink/70' : 'text-paper/65')}>{c.note}</span>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
        <figure className="flex min-w-0 flex-col gap-2 border-3 border-paper/80 p-3">
          <figcaption className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.7rem] font-bold uppercase">
            <span>Slová · 30 dní</span>
            <Badge variant="secondary" className="shadow-none hover:translate-x-0 hover:translate-y-0">
              Korpus sa napojí neskôr
            </Badge>
          </figcaption>
          <div className="relative flex min-h-[72px] items-center">
            <Sparkline data={[]} height={64} color="hsl(var(--secondary))" ariaLabel="Denná rada slov: zatiaľ prázdna, Korpus sa napojí neskôr" />
            <AsciiPulse size="sm" color="var(--color-yellow)" className="pointer-events-none absolute right-0 hidden border-0 bg-transparent p-0 text-[6px] leading-[6px] opacity-60 shadow-none sm:block" />
          </div>
          <p className="text-xs text-paper/65">Zástupná rada: plochá čiara, kým Korpus nepošle denné dáta.</p>
        </figure>
        <figure className="flex flex-col items-center gap-1 border-3 border-paper/80 bg-paper p-3 text-ink">
          <GaugeChart value={p.prompts_today} min={0} max={150} zones={TEP_ZONY} size="sm" label="tep dňa" valueFormatter={(v) => `${v}`} />
          <figcaption className="text-center font-mono text-[0.65rem] uppercase">prompty dnes · stupnica 0–150 = návrh</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-1 border-3 border-paper/80 bg-paper p-3 text-ink">
          <div className="relative w-full max-w-[180px]">
            <RadialBarChart
              data={[{ name: 'seria', value: p.streak_days, fill: 'hsl(var(--secondary))' }]}
              config={{ seria: { label: 'Dní v rade', color: 'hsl(var(--secondary))' } }}
              maxValue={100}
              innerRadius="68%"
              showLabel={false}
              showTooltip={false}
              className="mx-auto aspect-square max-h-[150px]"
              aria-label={`Séria ${p.streak_days} dní z míľnika 100`}
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-extrabold tabular-nums">{p.streak_days}</span>
              <span className="font-mono text-[0.6rem] uppercase">dní v rade</span>
            </div>
          </div>
          <figcaption className="text-center font-mono text-[0.65rem] uppercase">prsteň k míľniku 100 = návrh</figcaption>
        </figure>
      </div>

      <a
        href="/vitalne/"
        className="press inline-flex min-h-11 w-fit items-center gap-2 self-end border-3 border-paper bg-paper px-4 font-display text-base font-extrabold text-ink uppercase shadow-[4px_4px_0_0_var(--color-yellow)]"
      >
        štatistiky <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}
