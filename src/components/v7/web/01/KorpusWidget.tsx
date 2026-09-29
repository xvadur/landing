/** V7-01 · svietiaci widget Korpusu v príjme: 4 skutočné čísla z /pulse.json (fetch na klientovi, SSR = snímka
 *  z fakty.ts), zástupná denná rada (plochá čiara, štítok „Korpus sa napojí neskôr“) a odkaz na štatistiky.
 *  Podpis: pri alarme obrazovky čísla spadnú na nulu a po schodoch (NumberFlow steps) skočia na živé hodnoty.
 *  Ostrov: <KorpusWidget client:visible />. */
import NumberFlow from '@number-flow/react';
import { ArrowRight } from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PULZ_KLUCE, PULZ_POPIS, type PulzKluc } from './data';
import { FARBA, useAlarm, usePulz, useSkok } from './klient';

const KROKY = { duration: 900, easing: 'steps(9, end)' };
/** Zástupná denná rada: 30 dní bez dát (nuly = plochá čiara), kým sa nenapojí pulz v3 (work/v7/KORPUS_DATA.md). */
const RADA_ZASTUPNA = Array.from({ length: 30 }, () => 0);
const KRATKO: Record<PulzKluc, string> = {
  words_month: 'slov / mesiac',
  prompts_today: 'promptov dnes',
  streak_days: 'dní v rade',
  projects_active: 'projektov beží',
};

function Cislo({ k, hodnota, tik }: { k: PulzKluc; hodnota: number; tik: number }) {
  const v = useSkok(hodnota, tik);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="flex min-h-11 flex-col items-start border-l-3 border-yellow pl-3 text-left outline-offset-4">
          <NumberFlow
            value={v}
            locales="sk-SK"
            transformTiming={KROKY}
            spinTiming={KROKY}
            className="m01-svieti font-display text-3xl leading-none font-extrabold tabular-nums text-yellow sm:text-4xl"
          />
          <span className="mt-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.1em] text-paper/80">{KRATKO[k]}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-60">
        {PULZ_POPIS[k].label}: {PULZ_POPIS[k].note}
      </TooltipContent>
    </Tooltip>
  );
}

export default function KorpusWidget() {
  const pulz = usePulz();
  const tik = useAlarm('prijem');
  return (
    <TooltipProvider delayDuration={120}>
      <div className="m01-widget relative flex flex-col gap-4 border-3 border-ink bg-ink p-4 text-paper shadow-[6px_6px_0_0_var(--color-yellow)] sm:p-5">
        <div className="flex items-center justify-between gap-3 font-mono text-xs font-bold uppercase tracking-[0.14em]">
          <span className="flex items-center gap-2">
            <span className="m01-bod m01-bod-zlta" aria-hidden="true" /> Korpus · naživo
          </span>
          <span className="text-paper/60">{pulz.cas}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {PULZ_KLUCE.map((k) => (
            <Cislo key={k} k={k} hodnota={pulz[k]} tik={tik} />
          ))}
        </div>
        <div className="flex flex-col gap-1.5 border-t-3 border-paper/20 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.7rem] font-bold uppercase text-paper/75">
            <span>slová · 30 dní</span>
            <Badge variant="secondary" className="shadow-none hover:translate-x-0 hover:translate-y-0">
              Korpus sa napojí neskôr
            </Badge>
          </div>
          <Sparkline
            data={RADA_ZASTUPNA}
            type="line"
            color={FARBA.zlta}
            height={40}
            animated={false}
            ariaLabel="Denná rada slov: zástupná plochá čiara, Korpus sa napojí neskôr"
          />
        </div>
        <a
          href="/vitalne/"
          className="inline-flex min-h-11 items-center justify-between gap-2 border-3 border-paper px-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-paper hover:bg-paper hover:text-ink"
        >
          štatistiky <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </TooltipProvider>
  );
}
