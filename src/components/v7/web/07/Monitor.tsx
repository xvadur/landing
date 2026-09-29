/** V7-07 · Monitor vitálnych funkcií na stene recepcie (svietiaci widget Korpusu). 4 skutočné čísla z /pulse.json
 *  (fetch na klientovi, SSR = snímka z fakty.ts), prompty dnes ako tep na gauge-chart (pásma sú návrh stupnice),
 *  denná rada je zástupná (nuly) so štítkom „Korpus sa napojí neskôr“, odkaz „štatistiky →“ na /vitalne/.
 *  Ostrov: <Monitor client:idle />. */
import { Activity, ArrowRight, Flame } from 'lucide-react';
import { GaugeChart, type GaugeChartZone } from '@/components/ui/gauge-chart';
import { Sparkline } from '@/components/ui/sparkline';
import { Badge } from '@/components/ui/badge';
import CountUp from '@/components/vendor/reactbits/CountUp';
import { fmt, usePulz } from './pulz';

const FARBA = {
  tlmena: 'hsl(var(--muted))',
  zlta: 'hsl(var(--secondary))',
  alarm: 'hsl(var(--destructive))',
};
/** Návrh stupnice (katalóg grafy/MaleKusy TEP_ZONY): pokoj / záťaž / tachykardia. */
const TEP: GaugeChartZone[] = [
  { from: 0, to: 60, color: FARBA.tlmena, label: 'pokoj' },
  { from: 60, to: 110, color: FARBA.zlta, label: 'záťaž' },
  { from: 110, to: 150, color: FARBA.alarm, label: 'tachykardia' },
];
const RADA_ZASTUPNA = Array.from({ length: 30 }, () => 0);

function Bodka() {
  return (
    <span aria-hidden="true" className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full rounded-full bg-yellow opacity-70 motion-safe:animate-ping" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow" />
    </span>
  );
}

export default function Monitor() {
  const p = usePulz();
  return (
    <section
      aria-labelledby="monitor-h"
      className="v07-monitor relative flex w-full flex-col gap-4 overflow-hidden border-3 border-ink bg-ink p-4 text-paper shadow-[6px_6px_0_0_var(--color-yellow)] sm:p-5"
    >
      <div className="flex items-center justify-between gap-3 font-mono text-xs font-bold tracking-[0.14em] uppercase">
        <h2 id="monitor-h" className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.14em]">
          <Bodka /> Vitálne funkcie · Korpus
        </h2>
        <span className="text-paper/60" title={p.zive ? 'z /pulse.json' : 'snímka'}>
          {p.cas}
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-4">
        <div className="border-3 border-paper bg-paper px-1 pt-1 text-ink">
          <GaugeChart value={p.prompts_today} min={0} max={150} zones={TEP} size="sm" label="promptov dnes" valueFormatter={(v) => `${v}`} />
        </div>
        <dl className="grid gap-3">
          <div>
            <dt className="font-mono text-[11px] tracking-[0.1em] text-paper/70 uppercase">slov tento mesiac</dt>
            <dd className="font-display text-3xl leading-none font-extrabold text-yellow tabular-nums">
              <CountUp to={p.words_month} duration={1.2} />
            </dd>
          </div>
          <div className="flex gap-5">
            <div>
              <dt className="font-mono text-[11px] tracking-[0.1em] text-paper/70 uppercase">dní v rade</dt>
              <dd className="flex items-center gap-1 font-display text-2xl leading-none font-extrabold tabular-nums">
                <CountUp to={p.streak_days} duration={1} />
                <Flame className="h-5 w-5 text-yellow" aria-hidden="true" />
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-[0.1em] text-paper/70 uppercase">projektov</dt>
              <dd className="flex items-center gap-1 font-display text-2xl leading-none font-extrabold tabular-nums">
                <CountUp to={p.projects_active} duration={0.8} />
                <Activity className="h-5 w-5 text-yellow" aria-hidden="true" />
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="flex flex-col gap-1.5 border-t-3 border-paper/25 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[11px] tracking-[0.1em] text-paper/70 uppercase">denná rada · 30 dní</span>
          <Badge variant="secondary" className="text-[10px]">
            Korpus sa napojí neskôr
          </Badge>
        </div>
        <div className="border-2 border-dashed border-paper/40 px-2 py-1">
          <Sparkline data={RADA_ZASTUPNA} type="line" color="hsl(var(--secondary))" height={36} animated={false} ariaLabel="Denná rada slov, zástupná, napojí sa neskôr" />
        </div>
        <p className="font-mono text-[11px] text-paper/70">
          dnes — slov · mesiac <b className="text-paper">{fmt(p.words_month)}</b> {p.zive ? '(pulse.json)' : '(snímka)'}
        </p>
      </div>

      <a href="/vitalne/" className="inline-flex min-h-11 items-center justify-between gap-2 border-3 border-paper px-3 font-mono text-xs font-bold uppercase hover:bg-paper hover:text-ink">
        štatistiky <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </section>
  );
}
