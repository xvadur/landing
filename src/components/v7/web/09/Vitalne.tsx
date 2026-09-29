/** V7-09 · Vitálne funkcie (Korpus) ako lekársky nález nalepený na obrazovke „DUR“.
 *  Svietiaci monitor (ink, CRT riadky, EKG stopa = BoldKit Sparkline, AsciiPulse) + 4 skutočné čísla z /pulse.json
 *  (fetch na klientovi, SSR = snímka z fakty.ts) v BoldKit StatCard + gauge „promptov dnes“ + Korpus celkom
 *  (Magic UI NumberTicker) + zástupná denná rada (Skeleton) so štítkom „Korpus sa napojí neskôr“ + odkaz na /vitalne/.
 *  PODPIS: keď sa čísla načítajú, na list udrie pečiatka OVERENÉ (Stamp + SplatShape, CSS .z9-uder) a list sa otrasie.
 *  Pri chybe fetchu ostane snímka a pečiatka povie „SNÍMKA“ (poctivo). Reduced motion: pečiatka sa iba ukáže. */
import * as React from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { Sparkline } from '@/components/ui/sparkline';
import { GaugeChart, type GaugeChartZone } from '@/components/ui/gauge-chart';
import { Stamp } from '@/components/ui/sticker';
import { SplatShape } from '@/components/ui/shapes';
import { AsciiPulse } from '@/components/ui/ascii-shapes';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { NumberTicker } from '@/components/vendor/magicui/number-ticker';
import DecryptedText from '@/components/vendor/reactbits/DecryptedText';
import { KORPUS, ZIVE_CISLA, ZIVE_CISLA_SNIMKA, ZIVE_CISLA_ZDROJ } from '@/data/fakty';
import { cn } from '@/lib/utils';
import { EKG_STOPA, PULZ_SNIMKA, type Pulz } from './data';
import { fmt } from './spolocne';

/** Stupnica „tep dňa“ 0–150 promptov: hranice pásiem sú dizajnový návrh (na stránke tak označené). */
const TEP: GaugeChartZone[] = [
  { from: 0, to: 60, color: 'hsl(var(--muted))', label: 'pokoj' },
  { from: 60, to: 110, color: 'hsl(var(--secondary))', label: 'záťaž' },
  { from: 110, to: 150, color: 'hsl(var(--destructive))', label: 'tachykardia' },
];

const label = (k: string) => ZIVE_CISLA.find((z) => z.kluc === k)?.label ?? k;
const korpusSlova = Number(KORPUS.slova.replace(/\D/g, ''));

type Stav = 'caka' | 'zive' | 'snimka';

export default function Vitalne() {
  const [p, setP] = React.useState<Pulz>(PULZ_SNIMKA);
  const [stav, setStav] = React.useState<Stav>('caka');
  const [cas, setCas] = React.useState(ZIVE_CISLA_SNIMKA);

  React.useEffect(() => {
    if (!ZIVE_CISLA_ZDROJ) {
      setStav('snimka');
      return;
    }
    const ctrl = new AbortController();
    fetch(ZIVE_CISLA_ZDROJ, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('pulz'))))
      .then((d: Record<string, unknown>) => {
        const num = (k: keyof Pulz, f: number) => (typeof d[k] === 'number' ? (d[k] as number) : f);
        setP((s) => ({
          words_month: num('words_month', s.words_month),
          prompts_today: num('prompts_today', s.prompts_today),
          streak_days: num('streak_days', s.streak_days),
          projects_active: num('projects_active', s.projects_active),
        }));
        if (typeof d.updated_at === 'string')
          setCas(
            new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bratislava' }).format(
              new Date(d.updated_at),
            ),
          );
        setStav('zive');
      })
      .catch((e: unknown) => {
        if ((e as { name?: string })?.name !== 'AbortError') setStav('snimka');
      });
    return () => ctrl.abort();
  }, []);

  const hotovo = stav !== 'caka';
  const tiles: { k: keyof Pulz; v: number }[] = [
    { k: 'words_month', v: p.words_month },
    { k: 'prompts_today', v: p.prompts_today },
    { k: 'streak_days', v: p.streak_days },
    { k: 'projects_active', v: p.projects_active },
  ];

  return (
    <div className={cn('relative', hotovo && 'z9-otras')}>
      {/* pečiatka OVERENÉ: udrie, keď prídu čísla */}
      <div className="pointer-events-none absolute -top-10 right-2 z-20 sm:-top-14 sm:right-6" aria-hidden={!hotovo}>
        <span className={cn('z9-fl absolute -inset-6 block text-ink opacity-0', hotovo && 'z9-uder')}>
          <SplatShape size={170} color="var(--color-ink)" strokeWidth={0} className="h-auto w-full" />
        </span>
        <span className={cn('z9-peciatka relative block', hotovo && 'z9-uder')}>
          <Stamp variant="destructive" size="lg" rotation="slight" doubleRing className="font-mono tracking-[0.18em] shadow-[5px_5px_0_0_var(--color-ink)]">
            {stav === 'snimka' ? 'Snímka' : 'Overené'}
          </Stamp>
        </span>
      </div>

      <div className="z9-papier z9-cierny z9-riadky overflow-hidden p-4 sm:p-6 lg:p-8" role="region" aria-label="Vitálne funkcie Korpusu" aria-busy={!hotovo}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-paper/25 pb-3 font-mono text-xs font-bold tracking-[0.16em] uppercase sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="z9-blik inline-block h-3 w-3 border-2 border-paper bg-yellow" />
            <DecryptedText text="Vitálne funkcie · naživo" animateOn="view" sequential speed={40} className="text-yellow" encryptedClassName="text-paper/60" />
          </span>
          <span className="text-paper/70" aria-live="polite">
            {stav === 'caka' ? 'meriam…' : stav === 'zive' ? `pulse.json · ${cas}` : `snímka · ${ZIVE_CISLA_SNIMKA}`}
          </span>
        </div>

        {/* EKG + tep */}
        <div className="mt-4 grid items-center gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative h-20 overflow-hidden border-3 border-paper/30 sm:h-24" aria-hidden="true">
            <div className="z9-ekg flex h-full w-[200%]">
              {[0, 1].map((i) => (
                <Sparkline key={i} data={EKG_STOPA} type="line" color="var(--color-yellow)" strokeWidth={3} height={96} animated={false} ariaLabel="EKG krivka, ilustrácia" className="h-full w-1/2" />
              ))}
            </div>
          </div>
          <div className="hidden overflow-hidden border-3 border-paper/30 px-2 lg:block" aria-hidden="true">
            <AsciiPulse size="sm" color="var(--color-yellow)" className="border-0 bg-transparent text-[10px] leading-[1.05] shadow-none" />
          </div>
        </div>

        {/* 4 skutočné čísla */}
        <div className="mt-5 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t, i) => (
            <StatCard
              key={t.k}
              title={label(t.k)}
              value={fmt(t.v)}
              colorScheme={i === 2 ? 'secondary' : 'primary'}
              variant="compact"
              className={cn(
                'text-ink [&_.stat-content>div>div>p:nth-child(2)]:font-display [&_.stat-content>div>div>p:nth-child(2)]:text-4xl [&_.stat-content>div>div>p:nth-child(2)]:tabular-nums',
                i % 2 ? 'rotate-1' : '-rotate-1',
                i === 2 && 'bg-yellow',
              )}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          {/* tep dňa */}
          <div className="z9-papier z9-biely p-4">
            <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Tep dňa · promptov dnes</p>
            <GaugeChart value={p.prompts_today} min={0} max={150} zones={TEP} size="md" label="promptov dnes" animated={false} className="mx-auto mt-2 w-full max-w-[280px]" />
            <p className="mt-1 text-xs text-ink/70">Stupnica 0–150 a pásma sú návrh, hodnota je skutočná.</p>
          </div>

          {/* Korpus celkom + zástupná denná rada */}
          <div className="z9-papier z9-biely flex flex-col gap-4 p-4">
            <div>
              <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Korpus celkom</p>
              <p className="font-display text-5xl leading-none font-extrabold tabular-nums sm:text-6xl">
                <NumberTicker value={korpusSlova} startValue={korpusSlova - 2000} />
              </p>
              <p className="text-sm">
                vlastných slov od {KORPUS.od} · {KORPUS.prompty} promptov
              </p>
            </div>
            <div className="relative border-3 border-ink bg-paper p-3" aria-label="Denná rada Korpusu, zatiaľ nenapojená" role="img">
              <div className="flex h-16 items-end gap-[3px]" aria-hidden="true">
                {Array.from({ length: 30 }, (_, i) => (
                  <Skeleton key={i} variant="stamp" className="flex-1 border-ink/25" style={{ height: `${30 + ((i * 37) % 60)}%` }} />
                ))}
              </div>
              <Badge variant="secondary" className="absolute top-2 left-2 shadow-none hover:translate-x-0 hover:translate-y-0">
                Korpus sa napojí neskôr
              </Badge>
            </div>
            <a
              href="/vitalne/"
              className="inline-flex min-h-11 w-fit items-center gap-2 border-3 border-ink bg-yellow px-4 font-mono text-sm font-bold tracking-[0.12em] uppercase shadow-[4px_4px_0_0_var(--color-ink)] hover:bg-yellow-hover"
            >
              štatistiky →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
