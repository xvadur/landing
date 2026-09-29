/** V7-06 · Pokladňa na pulte = svietiaci widget Korpusu. Displej so 4 skutočnými číslami z /pulse.json (fetch na klientovi,
 *  SSR = snímka ZIVE_CISLA), z pokladne vyjde bloček s dennou radou — tá je zástupná („Korpus sa napojí neskôr“,
 *  prázdna rada = prerušovaná čiara) a odkaz „štatistiky →“ na /vitalne/. Kusy: sparkline, badge, separator, tooltip,
 *  CountUp (React Bits). Recept: v7/kit/grafy/KorpusNavrh.tsx (b) „karta vedľa fotky“, prerobený na pokladňu. */
import { ArrowRight } from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CountUp from '@/components/vendor/reactbits/CountUp';
import { KORPUS } from '@/data/fakty';
import { FARBA, usePulz } from './spolocne';

const RIADKY = [
  { k: 'words_month', label: 'slov tento mesiac' },
  { k: 'prompts_today', label: 'promptov dnes' },
  { k: 'streak_days', label: 'dní v rade' },
  { k: 'projects_active', label: 'bežiacich projektov' },
] as const;

export default function Pokladna() {
  const p = usePulz();
  return (
    <TooltipProvider delayDuration={150}>
      <div className="lek-pokladna relative w-full max-w-[22rem]">
        {/* telo pokladne */}
        <div className="relative z-[1] border-3 border-ink bg-ink p-3 text-paper shadow-brutal">
          <div className="flex items-center justify-between gap-2 px-1 pb-2 font-mono text-[11px] font-bold tracking-[0.14em] uppercase">
            <span className="flex items-center gap-2">
              <span className="lek-bodka" aria-hidden="true" /> Pokladňa · Korpus
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help text-paper/70 underline decoration-dotted underline-offset-2">
                  {p.zive ? 'naživo' : 'snímka'}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Snímka pulzu: {p.cas}</TooltipContent>
            </Tooltip>
          </div>
          <dl className="lek-displej grid grid-cols-2 gap-px border-3 border-paper/30 bg-paper/30" aria-live="polite">
            {RIADKY.map((r) => (
              <div key={r.k} className="flex min-w-0 flex-col-reverse justify-end gap-0.5 bg-ink px-3 py-2.5">
                <dt className="font-mono text-[10px] leading-tight tracking-[0.08em] text-paper/75 uppercase">{r.label}</dt>
                <dd className="lek-svieti truncate font-mono text-[clamp(1.35rem,1rem+1.2vw,1.9rem)] leading-none font-bold text-yellow">
                  <CountUp to={p[r.k]} duration={1.4} />
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] tracking-[0.1em] text-paper/60 uppercase">
            <span>pulse.json · {p.cas}</span>
            <span aria-hidden="true">✚</span>
          </div>
        </div>
        {/* bloček */}
        <div className="lek-blocek relative mx-3 -mt-1 border-x-3 border-ink bg-white px-4 pt-4 pb-7 text-ink">
          <p className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase">Bloček · denná rada slov</p>
          <div className="mt-2 border-2 border-dashed border-ink/40 px-2 py-1">
            <Sparkline data={[]} type="line" color={FARBA.ink} height={34} ariaLabel="Denná rada slov: zatiaľ prázdna, Korpus sa napojí neskôr" />
          </div>
          <Badge variant="secondary" className="mt-3 shadow-none hover:translate-x-0 hover:translate-y-0">
            Korpus sa napojí neskôr
          </Badge>
          <Separator className="my-3 h-[2px] border-dashed" />
          <p className="font-mono text-xs leading-snug">
            Spolu od {KORPUS.od}: <b>{KORPUS.slova}</b> slov · <b>{KORPUS.prompty}</b> promptov
          </p>
          <a
            href="/vitalne/"
            className="mt-3 inline-flex min-h-11 items-center gap-2 font-display text-base font-extrabold uppercase underline decoration-3 underline-offset-4 hover:decoration-hot"
          >
            štatistiky <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </TooltipProvider>
  );
}
