/** V7-09 · dva výstrižky s grafmi v Chorobopisoch (iba skutočné čísla):
 *  1. BoldKit DonutChart — koľko chorobopisov je pre koho (počíta sa z DOKAZY vo fakty.ts),
 *  2. BoldKit ChartContainer + Recharts BarChart — diagnóza trhu: 416 realitných webov (pack13, KOTVY vo fakty.ts). */
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { DonutChart, DonutChartCenter, type DonutChartData } from '@/components/ui/donut-chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { PRIPAD_MAKLER } from '@/data/fakty';
import { PODLA_PRE, TRH_416, TRH_Z, CHOROBOPISY } from './data';

const FARBY = ['hsl(var(--secondary))', 'hsl(var(--foreground))', 'hsl(var(--destructive))', 'hsl(var(--card))'];

const DONUT: DonutChartData[] = PODLA_PRE.map((x, i) => ({ name: x.kluc, value: x.pocet, fill: FARBY[i % FARBY.length]! }));
const CFG_DONUT: ChartConfig = Object.fromEntries(PODLA_PRE.map((x, i) => [x.kluc, { label: x.nazov, color: FARBY[i % FARBY.length] }]));
const CFG_TRH: ChartConfig = { pocet: { label: 'Webov', color: 'hsl(var(--secondary))' } };

export default function Grafy() {
  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-8">
      <figure className="z9-list relative" style={{ ['--r' as string]: '-1.5deg', ['--r0' as string]: '10deg' }}>
        <span className="z9-paska" style={{ ['--pr' as string]: '-6deg', left: '30%', top: '-0.85rem' }} />
        <div className="z9-papier z9-biely p-4 sm:p-5">
          <figcaption className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Triáž chorobopisov · pre koho</figcaption>
          <DonutChart
            data={DONUT}
            config={CFG_DONUT}
            innerRadius="58%"
            outerRadius="86%"
            centerContent={<DonutChartCenter value={String(CHOROBOPISY.length)} label="chorobopisov" />}
            aria-label="Chorobopisy podľa toho, pre koho sú"
            className="mx-auto mt-2 max-w-[360px]"
          />
          <ul className="mt-3 grid gap-2 sm:grid-cols-2" role="list">
            {PODLA_PRE.map((x, i) => (
              <li key={x.kluc} className="flex items-center gap-2 text-sm font-bold">
                <span aria-hidden="true" className="inline-block h-4 w-4 shrink-0 border-2 border-ink" style={{ background: FARBY[i % FARBY.length] }} />
                {x.nazov} · {x.pocet}
              </li>
            ))}
          </ul>
        </div>
      </figure>
      <figure className="z9-list relative md:mt-12" style={{ ['--r' as string]: '1.2deg', ['--r0' as string]: '-10deg' }}>
        <span className="z9-paska" style={{ ['--pr' as string]: '5deg', left: '55%', top: '-0.85rem' }} />
        <div className="z9-papier z9-biely p-4 sm:p-5">
          <figcaption className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Diagnóza trhu · {TRH_Z} realitných webov</figcaption>
          <ChartContainer config={CFG_TRH} variant="minimal" className="mt-3 aspect-auto h-[260px] w-full font-mono" aria-label={`Diagnóza trhu: z ${TRH_Z} realitných webov`}>
            <BarChart data={TRH_416} layout="vertical" margin={{ left: 0, right: 36, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, TRH_Z]} tickLine={false} axisLine={false} fontSize={11} />
              <YAxis type="category" dataKey="co" width={112} tickLine={false} axisLine={false} fontSize={11} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="pocet" fill="var(--color-pocet)" barSize={30}>
                <LabelList dataKey="pocet" position="right" className="fill-foreground font-mono text-sm font-bold" />
              </Bar>
            </BarChart>
          </ChartContainer>
          <p className="mt-2 text-sm leading-snug">
            {TRH_416[2]!.pocet} z {TRH_Z} {TRH_416[2]!.pozn}. Jakub dostal: {PRIPAD_MAKLER.dostal[0]!.toLowerCase()}
          </p>
        </div>
      </figure>
    </div>
  );
}
