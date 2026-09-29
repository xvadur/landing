/** V7-05 · Komiks — panel „BEEP!“: svietiaci monitor Korpusu. Štyri skutočné čísla z /pulse.json (fetch na klientovi,
 *  SSR = snímka ZIVE_CISLA z fakty.ts), Korpus celkom z fakty.ts (CountUp), ASCII tep (BoldKit ascii-shapes),
 *  denná rada = zástupná (nuly) so štítkom „Korpus sa napojí neskôr“ (Sparkline sa načíta lenivo, Recharts),
 *  odkaz „štatistiky →“ na /vitalne/ (stránka zatiaľ neexistuje). Ostrov: client:visible. */
import * as React from 'react';
import { Activity, Flame, FolderKanban, PenLine } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AsciiPulse } from '@/components/ui/ascii-shapes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CountUp from '@/components/vendor/reactbits/CountUp';
import { KORPUS, ZIVE_CISLA, ZIVE_CISLA_SNIMKA, ZIVE_CISLA_ZDROJ } from '@/data/fakty';

const Sparkline = React.lazy(() => import('@/components/ui/sparkline').then((m) => ({ default: m.Sparkline })));

type Kluc = 'words_month' | 'prompts_today' | 'streak_days' | 'projects_active';
type Pulz = Record<Kluc, number> & { cas: string };

const zaklad: Pulz = {
  ...(Object.fromEntries(ZIVE_CISLA.map((z) => [z.kluc, z.value])) as Record<Kluc, number>),
  cas: ZIVE_CISLA_SNIMKA,
};

const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');

/** Živý pulz Korpusu (prevzaté z katalógu grafov, usePulz). */
function usePulz(): { p: Pulz; zivy: boolean } {
  const [p, setP] = React.useState<Pulz>(zaklad);
  const [zivy, setZivy] = React.useState(false);
  React.useEffect(() => {
    if (!ZIVE_CISLA_ZDROJ) return;
    const ctrl = new AbortController();
    fetch(ZIVE_CISLA_ZDROJ, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Record<string, unknown> | null) => {
        if (!d) return;
        const num = (k: Kluc, f: number) => (typeof d[k] === 'number' ? (d[k] as number) : f);
        setP((s) => ({
          words_month: num('words_month', s.words_month),
          prompts_today: num('prompts_today', s.prompts_today),
          streak_days: num('streak_days', s.streak_days),
          projects_active: num('projects_active', s.projects_active),
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
        setZivy(true);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return { p, zivy };
}

const IKONY: Record<Kluc, React.ReactNode> = {
  words_month: <PenLine aria-hidden="true" />,
  prompts_today: <Activity aria-hidden="true" />,
  streak_days: <Flame aria-hidden="true" />,
  projects_active: <FolderKanban aria-hidden="true" />,
};

const RADA = Array.from({ length: 30 }, () => 0);

export default function Korpus05() {
  const { p, zivy } = usePulz();
  const celkom = Number(KORPUS.slova.replace(/\s/g, ''));

  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs font-bold tracking-[0.14em] uppercase sm:text-sm">
            <span className="inline-flex items-center gap-2 text-yellow">
              <span aria-hidden="true" className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-yellow opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow" />
              </span>
              Vitálne funkcie · {zivy ? 'naživo' : 'snímka'}
            </span>
            <span className="text-paper/70">{p.cas}</span>
          </div>
          <div className="k-monitor relative overflow-hidden border-3 border-paper/40 bg-ink p-2">
            <AsciiPulse size="md" charset="dots" color="var(--color-yellow)" speed="slow" className="block w-full border-0 bg-transparent p-0 text-center text-[7px] shadow-none sm:text-[9px]" />
          </div>
          <div>
            <p className="k-svieti font-display text-[clamp(2.6rem,1.6rem+4vw,4.5rem)] leading-none font-extrabold tabular-nums">
              <CountUp to={celkom} duration={2.2} />
            </p>
            <p className="mt-1 font-mono text-xs font-bold tracking-[0.12em] text-paper/80 uppercase sm:text-sm">
              vlastných slov od {KORPUS.od} · {KORPUS.prompty} promptov
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <dl className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            {ZIVE_CISLA.map((z) => (
              <div key={z.kluc} className="min-w-0">
                <dt className="sr-only">{z.label}</dt>
                <dd>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div tabIndex={0} className="outline-none focus-visible:ring-3 focus-visible:ring-yellow" aria-label={`${z.label}: ${fmt(p[z.kluc as Kluc])}. ${z.note}`}>
                        <StatCard
                          variant="compact"
                          colorScheme="secondary"
                          title={z.label}
                          value={fmt(p[z.kluc as Kluc])}
                          icon={IKONY[z.kluc as Kluc]}
                          className="h-full shadow-[5px_5px_0_0_var(--color-yellow)] [&_.stat-content]:p-4 [&_p.text-3xl]:tabular-nums"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">{z.note}</TooltipContent>
                  </Tooltip>
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3 border-3 border-paper/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs font-bold tracking-[0.12em] text-paper/80 uppercase sm:text-sm">Denná rada slov</p>
              <Badge variant="secondary" className="shrink-0">
                zástupné · Korpus sa napojí neskôr
              </Badge>
            </div>
            <div className="h-14 border-b-3 border-dashed border-paper/40 text-paper">
              <React.Suspense fallback={<Skeleton variant="stamp" className="h-14 w-full border-0 bg-paper/10" />}>
                <Sparkline data={RADA} type="bar" height={56} width="100%" color="var(--color-yellow)" animated={false} ariaLabel="Denná rada slov: zástupná, Korpus sa napojí neskôr" />
              </React.Suspense>
            </div>
            <Button asChild variant="secondary" className="self-start">
              <a href="/vitalne/">štatistiky →</a>
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
