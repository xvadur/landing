/** V7-01 · obrazovka Vitálne funkcie: dashboard Korpusu ako monitor JIS. Skutočné: 4 čísla z /pulse.json a KORPUS
 *  z fakty.ts. Zástupné: denná rada (heatmapa 12 týždňov, samé nuly) so štítkom „Korpus sa napojí neskôr“.
 *  Stupnica „tep dňa“ 0–150 a míľnik 100 dní sú návrh dizajnu a tak sú aj označené.
 *  Podpis: alarm obrazovky → čísla spadnú na nulu a po schodoch sa prekreslia na živé hodnoty.
 *  Kusy: stat-card, gauge-chart, heatmap-chart, math-curve-progress, math-curve-background, table, tooltip, badge,
 *  progress + Magic UI NumberTicker. Ostrov: <Vitalne client:visible />. */
import NumberFlow from '@number-flow/react';
import { Activity, CalendarCheck, Flame, FolderKanban } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { GaugeChart, type GaugeChartZone } from '@/components/ui/gauge-chart';
import { HeatmapChart, type HeatmapCellData } from '@/components/ui/heatmap-chart';
import { MathCurveProgress } from '@/components/ui/math-curve-progress';
import { MathCurveBackground } from '@/components/ui/math-curve-background';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { NumberTicker } from '@/components/vendor/magicui/number-ticker';
import { KORPUS, PULZ_KLUCE, PULZ_POPIS, type PulzKluc } from './data';
import { FARBA, fmt, useAlarm, usePulz, useSkok } from './klient';

const KROKY = { duration: 900, easing: 'steps(9, end)' };
const ZONY: GaugeChartZone[] = [
  { from: 0, to: 60, color: FARBA.tlmena, label: 'pokoj' },
  { from: 60, to: 110, color: FARBA.zlta, label: 'záťaž' },
  { from: 110, to: 150, color: FARBA.alarm, label: 'tachykardia' },
];
const IKONA: Record<PulzKluc, React.ReactNode> = {
  words_month: <Activity />,
  prompts_today: <CalendarCheck />,
  streak_days: <Flame />,
  projects_active: <FolderKanban />,
};
const SCHEMA: Record<PulzKluc, 'primary' | 'secondary' | 'info'> = {
  words_month: 'primary',
  prompts_today: 'secondary',
  streak_days: 'info',
  projects_active: 'info',
};

/* zástupná heatmapa: 12 týždňov × 7 dní, samé nuly (Korpus sa napojí neskôr) */
const DNI = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
const TYZDNE = Array.from({ length: 12 }, (_, i) => `t${String(i + 1).padStart(2, '0')}`);
const BUNKY: HeatmapCellData[] = TYZDNE.flatMap((col) => DNI.map((row) => ({ row, col, value: 0 })));
const TLMENA = 'color-mix(in srgb, var(--color-paper) 14%, var(--color-ink))';

const SLOVA_CELKOM = Number(KORPUS.slova.replace(/\s/g, ''));
const MILNIK = 100;

function Kanal({ k, hodnota, tik }: { k: PulzKluc; hodnota: number; tik: number }) {
  const v = useSkok(hodnota, tik);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div tabIndex={0} className="min-w-0 outline-offset-4" aria-label={`${PULZ_POPIS[k].label}: ${fmt(hodnota)}`}>
          <StatCard
            title={PULZ_POPIS[k].label}
            value={(<NumberFlow value={v} locales="sk-SK" transformTiming={KROKY} spinTiming={KROKY} className="tabular-nums" />) as unknown as string}
            icon={IKONA[k]}
            colorScheme={SCHEMA[k]}
            change="skutočné · pulse.json"
            trend="neutral"
            comparison=""
            className="h-full [&_.text-3xl]:font-display [&_.text-3xl]:text-4xl [&_.text-3xl]:font-extrabold"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64">
        {PULZ_POPIS[k].note}
      </TooltipContent>
    </Tooltip>
  );
}

export default function Vitalne() {
  const pulz = usePulz();
  const tik = useAlarm('vitalne');
  const tep = useSkok(pulz.prompts_today, tik);
  const seria = useSkok(pulz.streak_days, tik);

  return (
    <TooltipProvider delayDuration={120}>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
        {/* kanály: 4 skutočné čísla */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4 lg:gap-5">
          {PULZ_KLUCE.map((k) => (
            <Kanal key={k} k={k} hodnota={pulz[k]} tik={tik} />
          ))}
        </div>

        {/* tep dňa (gauge) */}
        <figure className="flex flex-col gap-3 border-3 border-ink bg-white p-4 shadow-[6px_6px_0_0_var(--color-ink)] lg:col-span-4">
          <figcaption className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.14em]">Tep dňa · prompty dnes</span>
            <Badge variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
              stupnica je návrh
            </Badge>
          </figcaption>
          <GaugeChart value={tep} min={0} max={150} zones={ZONY} size="md" label="promptov dnes" valueFormatter={(n) => `${n}`} className="mx-auto" />
          <p className="text-sm">Prompty dnes ako tep. Pásma pokoj / záťaž / tachykardia sú návrh stupnice, číslo je skutočné.</p>
        </figure>

        {/* séria (srdce) */}
        <figure className="flex flex-col gap-3 border-3 border-ink bg-yellow p-4 shadow-[6px_6px_0_0_var(--color-ink)] lg:col-span-4">
          <figcaption className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.14em]">Séria · dní v rade</span>
            <Badge variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
              míľnik {MILNIK} je návrh
            </Badge>
          </figcaption>
          <div className="flex items-center gap-5">
            <MathCurveProgress curve="heart" value={Math.min(100, (seria / MILNIK) * 100)} size="lg" strokeWidth={5} fillColor={FARBA.alarm} className="shrink-0 text-ink" aria-label={`Séria ${pulz.streak_days} z ${MILNIK} dní`} />
            <p className="flex items-baseline gap-2 font-display font-extrabold">
              <NumberFlow value={seria} locales="sk-SK" transformTiming={KROKY} spinTiming={KROKY} className="text-6xl tabular-nums" />
              <span className="text-xl">/ {MILNIK}</span>
            </p>
          </div>
          <Progress variant="stepped" value={Math.min(100, (seria / MILNIK) * 100)} className="h-4 [&>div]:bg-ink" aria-label="Séria k míľniku" />
          <p className="text-sm">Každý deň aspoň jeden prompt. Srdce ukazuje cestu k míľniku.</p>
        </figure>

        {/* zástupná denná rada */}
        <figure className="flex flex-col gap-3 border-3 border-ink bg-ink p-4 text-paper shadow-[6px_6px_0_0_var(--color-yellow)] lg:col-span-4">
          <figcaption className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.14em]">Aktívne dni · 12 týždňov</span>
            <Badge variant="secondary" className="shadow-none hover:translate-x-0 hover:translate-y-0">
              Korpus sa napojí neskôr
            </Badge>
          </figcaption>
          <div className="flex gap-2 overflow-x-auto pb-1" data-lenis-prevent>
            <div className="flex shrink-0 flex-col justify-around font-mono text-[10px] text-paper/70" aria-hidden="true">
              {DNI.map((d) => (
                <span key={d} className="flex h-[18px] items-center">
                  {d}
                </span>
              ))}
            </div>
            <HeatmapChart
              data={BUNKY}
              rows={DNI}
              cols={TYZDNE}
              cellSize={18}
              showLabels={false}
              showTooltip={false}
              colorLow={TLMENA}
              colorHigh={TLMENA}
              ariaLabel="Slová za deň, 12 týždňov: zástupné, Korpus sa napojí neskôr"
              className="[&_*]:border-ink"
            />
          </div>
          <p className="text-sm text-paper/80">Denná rada slov príde s pulzom v3. Dovtedy je monitor na nule, nič sa nedomýšľa.</p>
        </figure>

        {/* Korpus celkom */}
        <div className="relative overflow-hidden border-3 border-ink bg-white shadow-[6px_6px_0_0_var(--color-ink)] lg:col-span-5">
          <MathCurveBackground curve="lissajous" speed="slow" opacity={0.18} strokeWidth={2} trackColor={FARBA.ink} headColor={FARBA.alarm} className="h-full">
            <div className="relative flex h-full flex-col gap-3 p-5">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">Korpus celkom · od {KORPUS.od}</p>
              <p className="font-display text-5xl leading-none font-extrabold tabular-nums sm:text-6xl">
                <NumberTicker value={SLOVA_CELKOM} className="tabular-nums" />
              </p>
              <p className="font-mono text-sm font-bold uppercase">vlastných slov · {KORPUS.prompty} promptov</p>
              <p className="mt-auto text-sm">Iba napísané prompty, snímka {KORPUS.kDatumu}. Za prihlásením na adam.xvadur.com.</p>
            </div>
          </MathCurveBackground>
        </div>

        {/* záznam vitálnych funkcií */}
        <div className="min-w-0 border-3 border-ink bg-white shadow-[6px_6px_0_0_var(--color-ink)] lg:col-span-7">
          <Table>
            <TableCaption className="px-3 pb-3 text-left font-mono text-xs">
              Snímka {pulz.cas}. Zdroj: /pulse.json (Korpus v2, iba agregáty) a fakty.ts.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Kanál</TableHead>
                <TableHead className="text-right">Hodnota</TableHead>
                <TableHead className="hidden sm:table-cell">Poznámka</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PULZ_KLUCE.map((k) => (
                <TableRow key={k}>
                  <TableCell className="font-bold">{PULZ_POPIS[k].label}</TableCell>
                  <TableCell className="text-right font-mono font-bold tabular-nums">{fmt(pulz[k])}</TableCell>
                  <TableCell className="hidden text-sm sm:table-cell">{PULZ_POPIS[k].note}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">vlastných slov celkom</TableCell>
                <TableCell className="text-right font-mono font-bold tabular-nums">{KORPUS.slova}</TableCell>
                <TableCell className="hidden text-sm sm:table-cell">od {KORPUS.od}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
