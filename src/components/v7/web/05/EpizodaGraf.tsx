/** V7-05 · Komiks — grafy v detaile epizódy (načíta sa lenivo, až keď sa otvorí sheet; Recharts nejde do prvého JS).
 *  Iba skutočné čísla z fakty.ts: 47 / 47 kontrol (Jakub), 441 z 459 webov, prvý krok na 416 webov (trhový dataset). */
import { GaugeChart } from '@/components/ui/gauge-chart';
import { DonutChart, DonutChartCenter } from '@/components/ui/donut-chart';
import { RadialBarChart } from '@/components/ui/radial-bar-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { TRH, type Graf } from './data';

const F = {
  ink: 'hsl(var(--foreground))',
  zlta: 'hsl(var(--secondary))',
  alarm: 'hsl(var(--destructive))',
  tlmena: 'hsl(var(--muted))',
} as const;
const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');

const CFG_WEBY: ChartConfig = {
  stextom: { label: 'S textovými blokmi', color: F.zlta },
  beztextu: { label: 'Bez textu', color: F.ink },
};
const CFG_KROK: ChartConfig = {
  kontakt: { label: 'Kontakt / telefón / formulár', color: F.ink },
  rezervacia: { label: 'Rezervácia termínu', color: F.alarm },
};

function Rama({ nazov, zdroj, children }: { nazov: string; zdroj: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col gap-2 border-3 border-ink bg-white p-3">
      <figcaption className="font-mono text-xs font-bold tracking-[0.1em] uppercase">{nazov}</figcaption>
      {children}
      <p className="font-mono text-[11px] text-ink/70">zdroj: {zdroj}</p>
    </figure>
  );
}

export default function EpizodaGraf({ druh }: { druh: Graf }) {
  if (druh === 'kontroly')
    return (
      <Rama nazov="Kontroly pred vydaním" zdroj="fakty.ts · spec05">
        <GaugeChart
          value={47}
          min={0}
          max={47}
          size="md"
          label="kontrol prešlo"
          valueFormatter={(v) => `${v} / 47`}
          zones={[{ from: 0, to: 47, color: F.zlta, label: 'prešli' }]}
          className="w-full"
        />
      </Rama>
    );
  if (druh === 'trh')
    return (
      <div className="grid gap-3">
        <Rama nazov="Weby s textovými blokmi" zdroj="fakty.ts · 441 z 459 webov">
          <DonutChart
            data={[
              { name: 'stextom', value: TRH.weby.s, fill: F.zlta },
              { name: 'beztextu', value: TRH.weby.spolu - TRH.weby.s, fill: F.ink },
            ]}
            config={CFG_WEBY}
            innerRadius="58%"
            centerContent={<DonutChartCenter value={fmt(TRH.weby.s)} label={`z ${TRH.weby.spolu} webov`} />}
            aria-label={`Trhový dataset: ${TRH.weby.s} z ${TRH.weby.spolu} webov má textové bloky`}
          />
        </Rama>
        <Rama nazov={`Prvý krok na webe (z ${TRH.kontakt.z} webov)`} zdroj="fakty.ts KOTVY · pack13">
          <RadialBarChart
            data={[
              { name: 'kontakt', value: TRH.kontakt.value, fill: F.ink },
              { name: 'rezervacia', value: TRH.rezervacia.value, fill: F.alarm },
            ]}
            config={CFG_KROK}
            maxValue={TRH.kontakt.z}
            innerRadius="30%"
            showLegend
            aria-label={`Prvý krok: ${TRH.kontakt.value} z ${TRH.kontakt.z} webov kontakt, ${TRH.rezervacia.value} z ${TRH.rezervacia.z} rezervácia termínu`}
          />
          <p className="text-sm">
            {TRH.kontakt.value} z {TRH.kontakt.z} webov má ako prvý krok kontakt, iba {TRH.rezervacia.value} ponúka rezerváciu termínu.
          </p>
        </Rama>
      </div>
    );
  return null;
}
