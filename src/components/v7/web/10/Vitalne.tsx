/** V7-10 · Podnos 02 · Vitálne funkcie. Monitor (EKG slučka), budík „tep dňa“ (prompty dnes), kalendár aktívnych dní
 *  (zástupný), 2 stat-card s Korpusom celkom (fakty.ts), srdce „cesta k 100 dňom“ (séria z pulzu), ASCII slučka ako
 *  zástupná plocha pre Higgsfield. Skutočné: iba /pulse.json a fakty.ts. Stupnice a míľnik 100 sú dizajnový návrh. */
import * as React from 'react';
import { Feather, MessageSquareText } from 'lucide-react';
import { GaugeChart, type GaugeChartZone } from '@/components/ui/gauge-chart';
import { HeatmapChart, type HeatmapCellData } from '@/components/ui/heatmap-chart';
import { StatCard } from '@/components/ui/stat-card';
import { MathCurveProgress } from '@/components/ui/math-curve-progress';
import { AsciiPulse } from '@/components/ui/ascii-shapes';
import { Badge } from '@/components/ui/badge';
import { ekgPath } from '@/components/v5/Symboly';
import { KORPUS } from '@/data/fakty';
import { Dlazdica, Etiketa } from './Dlazdica';
import { POPIS, usePulz } from './pulz';

const ZONY: GaugeChartZone[] = [
  { from: 0, to: 60, color: 'hsl(var(--muted))', label: 'pokoj' },
  { from: 60, to: 110, color: 'hsl(var(--secondary))', label: 'záťaž' },
  { from: 110, to: 150, color: 'hsl(var(--destructive))', label: 'tachykardia' },
];

const DNI = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
const TYZDNE = Array.from({ length: 12 }, (_, i) => `t${i + 1}`);
/** Zástupná rada: nuly, kým Korpus nepošle `days` (pulz v3). Žiadne vymyslené hodnoty. */
const PRAZDNE: HeatmapCellData[] = TYZDNE.flatMap((col) => DNI.map((row) => ({ row, col, value: 0 })));

const NIZKA = 'color-mix(in srgb, var(--color-paper) 12%, var(--color-ink))';

function Zastupne() {
  return (
    <Badge variant="secondary" className="shrink-0 shadow-none hover:translate-x-0 hover:translate-y-0">
      zástupné · Korpus sa napojí neskôr
    </Badge>
  );
}

function Monitor() {
  const p = usePulz();
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <Etiketa cislo="02" nazov="Vitálne funkcie" className="text-yellow" />
      <h2 className="font-display text-[clamp(2.2rem,1.4rem+2.4vw,3.4rem)] leading-[0.88] font-extrabold tracking-tighter uppercase">
        Vitálne funkcie naživo
      </h2>
      <div className="relative mt-auto overflow-hidden border-3 border-paper/25 bg-ink">
        <div className="v10-ekg-mriezka absolute inset-0" aria-hidden="true" />
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="v10-ekg-beh relative block h-16 w-[200%] max-w-none" aria-hidden="true">
          <path d={ekgPath(1200)} fill="none" stroke="var(--color-yellow)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <p className="font-mono text-xs text-paper/70">snímka pulzu {p.cas}</p>
    </div>
  );
}

function Tep() {
  const p = usePulz();
  return (
    <div className="flex h-full flex-col items-center gap-3 p-4 sm:p-5">
      <p className="self-start font-mono text-xs font-bold tracking-[0.14em] uppercase">Tep dňa</p>
      <GaugeChart value={p.prompts_today} min={0} max={150} zones={ZONY} size="md" label={POPIS.prompts_today} showTicks />
      <Badge variant="outline" className="mt-auto self-start shadow-none hover:translate-x-0 hover:translate-y-0">
        stupnica 0–150 = návrh
      </Badge>
    </div>
  );
}

function Kalendar() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [bunka, setBunka] = React.useState(18);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e?.contentRect.width ?? 300;
      setBunka(Math.max(14, Math.min(34, Math.floor((w - 12) / 12))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 pr-24">
        <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Aktívne dni · 12 týždňov</p>
        <Zastupne />
      </div>
      <div ref={ref} className="flex min-w-0 flex-1 items-center">
        <HeatmapChart
          data={PRAZDNE}
          rows={DNI}
          cols={TYZDNE}
          cellSize={bunka}
          showLabels={false}
          showTooltip={false}
          colorLow={NIZKA}
          colorHigh="var(--color-yellow)"
          ariaLabel="Aktívne dni za 12 týždňov: zástupné, Korpus sa napojí neskôr"
          className="overflow-visible"
        />
      </div>
      <p className="font-mono text-xs text-paper/70">Každá bunka bude jeden deň písania s AI. Rada príde z Korpusu.</p>
    </div>
  );
}

function Srdce() {
  const p = usePulz();
  const k100 = Math.min(100, p.streak_days);
  return (
    <div className="flex h-full flex-col gap-2 p-4 sm:p-5">
      <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Cesta k 100 dňom</p>
      <div className="flex flex-1 items-center gap-3">
        <MathCurveProgress value={k100} curve="heart" size="lg" className="shrink-0 text-yellow" fillColor="var(--color-yellow)" trackColor="var(--color-paper)" strokeWidth={4} />
        <p className="flex flex-col">
          <span className="font-display text-5xl leading-none font-extrabold text-yellow tabular-nums">{p.streak_days}</span>
          <span className="font-mono text-xs text-paper/75 uppercase">{POPIS.streak_days}</span>
        </p>
      </div>
      <p className="font-mono text-[11px] text-paper/60">míľnik 100 = návrh</p>
    </div>
  );
}

function Slucka() {
  return (
    <div className="flex h-full flex-col gap-2 p-4 sm:p-5">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden border-3 border-ink bg-ink text-yellow">
        <AsciiPulse size="sm" color="var(--color-yellow)" speed="slow" className="text-[9px] leading-[1.05]" />
      </div>
      <p className="font-mono text-[10px] leading-tight font-bold tracking-wider uppercase">HIGGSFIELD: v710-slucka-ekg · 1:1 · 3 s</p>
    </div>
  );
}

export default function Vitalne() {
  return (
    <div className="v10-mriezka">
      <Dlazdica tone="ink" className="col-span-2 md:col-span-3 lg:col-span-3 lg:row-span-2" stitok="N-04 · EKG">
        <Monitor />
      </Dlazdica>
      <Dlazdica
        tone="white"
        className="col-span-2 md:col-span-3 lg:col-span-3 lg:row-span-2"
        stitok="N-05 · budík"
        detailNazov="Čo je tep dňa"
        detail={
          <p className="text-base leading-snug">
            Tep dňa sú prompty, ktoré som dnes napísal. Číslo je skutočné z pulzu Korpusu. Stupnica 0–150 a pásma pokoj, záťaž,
            tachykardia sú dizajnový návrh.
          </p>
        }
      >
        <Tep />
      </Dlazdica>
      <Dlazdica tone="ink" className="col-span-2 md:col-span-6 lg:col-span-6 lg:row-span-2" stitok="N-06 · kalendár">
        <Kalendar />
      </Dlazdica>
      <Dlazdica tone="white" className="col-span-1 md:col-span-3 lg:col-span-3 lg:row-span-2" innerClassName="[&_.stat-content]:p-4 sm:[&_.stat-content]:p-5">
        <StatCard
          className="h-full border-0 shadow-none"
          colorScheme="secondary"
          title="Vlastné slová"
          value={KORPUS.slova}
          icon={<Feather aria-hidden="true" />}
          change={`od ${KORPUS.od}`}
          comparison="· Korpus"
          trend="neutral"
        />
      </Dlazdica>
      <Dlazdica tone="white" className="col-span-1 md:col-span-3 lg:col-span-3 lg:row-span-2" innerClassName="[&_.stat-content]:p-4 sm:[&_.stat-content]:p-5">
        <StatCard
          className="h-full border-0 shadow-none"
          colorScheme="primary"
          title="Prompty"
          value={KORPUS.prompty}
          icon={<MessageSquareText aria-hidden="true" />}
          change={`k ${KORPUS.kDatumu}`}
          comparison="· Korpus"
          trend="neutral"
        />
      </Dlazdica>
      <Dlazdica tone="ink" className="col-span-1 md:col-span-3 lg:col-span-3 lg:row-span-2" stitok="N-07 · srdce">
        <Srdce />
      </Dlazdica>
      <Dlazdica tone="paper" className="col-span-1 md:col-span-3 lg:col-span-3 lg:row-span-2" stitok="N-08 · slučka">
        <Slucka />
      </Dlazdica>
    </div>
  );
}
