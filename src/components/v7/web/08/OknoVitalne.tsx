/** V7-08 · okno Vitálne funkcie = svietiaci widget Korpusu. Štyri skutočné čísla z /pulse.json (fetch na klientovi,
 *  SSR = snímka ZIVE_CISLA z fakty.ts), budík „prompty dnes“ (stupnica 0–150 je návrh, na okne tak označená),
 *  zástupná denná rada so štítkom „Korpus sa napojí neskôr“ (žiadne čísla), odkaz štatistiky → /vitalne/. */
import * as React from 'react';
import { Activity, ArrowRight, CalendarCheck, FolderKanban, MessageSquareText, PenLine } from 'lucide-react';
import CountUp from '@/components/vendor/reactbits/CountUp';
import { StatCard } from '@/components/ui/stat-card';
import { GaugeChart } from '@/components/ui/gauge-chart';
import { Badge } from '@/components/ui/badge';
import { AsciiPulse } from '@/components/ui/ascii-shapes';
import { KORPUS, ZIVE_CISLA, ZIVE_CISLA_SNIMKA } from '@/data/fakty';
import Okno from './Okno';

export type Pulz = { words_month: number; prompts_today: number; streak_days: number; projects_active: number; updated_at: string | null };

const SNIMKA: Pulz = {
  words_month: ZIVE_CISLA.find((z) => z.kluc === 'words_month')!.value,
  prompts_today: ZIVE_CISLA.find((z) => z.kluc === 'prompts_today')!.value,
  streak_days: ZIVE_CISLA.find((z) => z.kluc === 'streak_days')!.value,
  projects_active: ZIVE_CISLA.find((z) => z.kluc === 'projects_active')!.value,
  updated_at: null,
};

let cache: Promise<Pulz> | null = null;
/** Jeden fetch pre všetky ostrovy (Vitálne aj panel dole). */
export function nacitajPulz(): Promise<Pulz> {
  cache ??= fetch('/pulse.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((d: Partial<Pulz>) => ({ ...SNIMKA, ...d }))
    .catch(() => SNIMKA);
  return cache;
}

export function usePulz() {
  const [p, setP] = React.useState<Pulz>(SNIMKA);
  const [nacitane, setNacitane] = React.useState(false);
  React.useEffect(() => {
    let zive = true;
    void nacitajPulz().then((d) => {
      if (!zive) return;
      setP(d);
      setNacitane(true);
    });
    return () => {
      zive = false;
    };
  }, []);
  return { p, nacitane };
}

export const sk = (n: number) => n.toLocaleString('sk-SK').replace(/[  ]/g, ' ');

const cas = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bratislava' }).format(new Date(iso))
    : ZIVE_CISLA_SNIMKA;

/** Zástupná denná rada: iba tvar (bez hodnôt, bez osí), aby bolo vidno, kam príde skutočná séria. */
const ZASTUPNE = Array.from({ length: 30 }, (_, i) => 28 + ((i * 37) % 61));

export default function OknoVitalne() {
  const { p, nacitane } = usePulz();
  const label = (k: string) => ZIVE_CISLA.find((z) => z.kluc === k)!.label;
  return (
    <Okno
      id="vitalne"
      ikona={<Activity />}
      className="lg:col-span-5 lg:mt-6"
      stav={
        <>
          <span className="inline-block h-2.5 w-2.5 animate-[v708-blik_1s_steps(2)_infinite] border-2 border-ink bg-stamp" aria-hidden="true" />
          {nacitane ? 'pulz načítaný' : 'načítavam pulz'} · /pulse.json · {cas(p.updated_at)}
        </>
      }
    >
      <div className="korpus relative flex flex-col gap-5 bg-ink p-4 text-paper sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="secondary" className="shadow-none hover:translate-x-0 hover:translate-y-0">
            ● naživo · Korpus
          </Badge>
          <a href="/vitalne/" className="inline-flex min-h-11 items-center gap-2 font-mono text-sm font-bold text-yellow uppercase underline decoration-2 underline-offset-4">
            štatistiky <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold tracking-[0.16em] text-paper/70 uppercase">{label('words_month')}</p>
            <p className="korpus-cislo font-display text-[clamp(2.6rem,1.4rem+4vw,4.4rem)] leading-none font-extrabold tabular-nums text-yellow">
              <CountUp to={p.words_month} from={0} duration={1.2} separator=" " />
            </p>
            <p className="mt-1 text-sm text-paper/75">
              Korpus celkom: {KORPUS.slova} vlastných slov od {KORPUS.od}.
            </p>
          </div>
          <AsciiPulse size="sm" color="var(--color-yellow)" className="hidden border-0 bg-transparent shadow-none sm:block" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-ink">
          <StatCard variant="compact" colorScheme="secondary" title={label('prompts_today')} value={sk(p.prompts_today)} icon={<MessageSquareText className="h-5 w-5" />} />
          <StatCard variant="compact" colorScheme="secondary" title={label('streak_days')} value={sk(p.streak_days)} icon={<CalendarCheck className="h-5 w-5" />} />
          <StatCard variant="compact" colorScheme="secondary" title={label('projects_active')} value={sk(p.projects_active)} icon={<FolderKanban className="h-5 w-5" />} />
          <StatCard variant="compact" colorScheme="secondary" title={label('words_month')} value={sk(p.words_month)} icon={<PenLine className="h-5 w-5" />} />
        </div>

        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <div className="mx-auto border-3 border-paper bg-white p-2 text-ink sm:mx-0">
            <GaugeChart
              size="sm"
              value={p.prompts_today}
              min={0}
              max={150}
              label="promptov dnes"
              zones={[
                { from: 0, to: 50, color: 'var(--color-paper)', label: 'pokoj' },
                { from: 50, to: 110, color: 'var(--color-yellow)', label: 'záťaž' },
                { from: 110, to: 150, color: 'var(--color-stamp)', label: 'tachykardia' },
              ]}
            />
            <p className="text-center font-mono text-[10px] font-bold uppercase">tep dňa · stupnica 0–150 je návrh</p>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs font-bold tracking-[0.14em] text-paper/70 uppercase">Denná rada slov</p>
              <Badge variant="outline" className="border-dashed shadow-none hover:translate-x-0 hover:translate-y-0">
                Korpus sa napojí neskôr
              </Badge>
            </div>
            <div className="mt-3 flex h-20 items-end gap-[3px] border-b-3 border-paper/60" role="img" aria-label="Zástupná denná rada, Korpus sa napojí neskôr. Bez skutočných hodnôt.">
              {ZASTUPNE.map((h, i) => (
                <span key={i} className="min-w-0 flex-1 border-2 border-b-0 border-dashed border-paper/35" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="mt-2 text-xs text-paper/60">Tvar je zástupný. Skutočná séria príde z Korpusu (pulz v3, pole days).</p>
          </div>
        </div>
      </div>
    </Okno>
  );
}
