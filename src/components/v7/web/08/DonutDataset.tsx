/** V7-08 · donut Trhového datasetu (441 zo 459 webov, fakty.ts). Načíta sa dynamicky až pri otvorení karty
 *  (Recharts nejde do úvodného JS stránky). */
import { DonutChart, DonutChartCenter, type DonutChartData } from '@/components/ui/donut-chart';
import type { ChartConfig } from '@/components/ui/chart';

const F = { ink: 'hsl(var(--foreground))', zlta: 'hsl(var(--secondary))' };

export default function DonutDataset({ sTextom, prehladane }: { sTextom: number; prehladane: number }) {
  const data: DonutChartData[] = [
    { name: 'stextom', value: sTextom, fill: F.zlta },
    { name: 'beztextu', value: prehladane - sTextom, fill: F.ink },
  ];
  const config: ChartConfig = {
    stextom: { label: 'S textovými blokmi', color: F.zlta },
    beztextu: { label: 'Bez textu', color: F.ink },
  };
  return (
    <DonutChart
      data={data}
      config={config}
      className="h-56 w-full"
      centerContent={<DonutChartCenter value={String(sTextom)} label={`z ${prehladane} webov`} />}
      aria-label={`Trhový dataset: ${sTextom} z ${prehladane} prehľadaných webov malo textové bloky`}
    />
  );
}
