/** V7 katalóg · grafy: spoločné kúsky (rám kusu, farby z tokenov, ukážkové rady, živý pulz).
 *  Farby = odkazy na tokeny (boldkit.css :root), žiadny hex. hot (--accent, --chart-1) sa v dátach nepoužíva. */
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ZIVE_CISLA, ZIVE_CISLA_SNIMKA, ZIVE_CISLA_ZDROJ, OVERENE_DNA } from '@/data/fakty';

/** Farby pre SVG atribúty (Recharts, vlastné SVG). Všetko ukazuje na tokeny. */
export const FARBA = {
  ink: 'hsl(var(--foreground))',
  papier: 'hsl(var(--background))',
  biela: 'hsl(var(--card))',
  zlta: 'hsl(var(--secondary))',
  alarm: 'hsl(var(--destructive))',
  siva: 'hsl(var(--chart-5))',
  tlmena: 'hsl(var(--muted))',
  tlmenaText: 'hsl(var(--muted-foreground))',
} as const;

/** Kategorické poradie pre dáta (pevné, necyklované): ink → žltá → alarm → sivá → biela. */
export const PORADIE = [FARBA.ink, FARBA.zlta, FARBA.alarm, FARBA.siva, FARBA.biela] as const;

export const fmt = (n: number) => new Intl.NumberFormat('sk-SK').format(n).replace(/\s/g, ' ');

/* ---------- rám stránky ---------- */

export function UkazkoveData({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" className={cn('shrink-0', className)}>
      ukážkové dáta
    </Badge>
  );
}

export function SkutocneData({ zdroj }: { zdroj: string }) {
  return (
    <Badge variant="outline" className="shrink-0">
      skutočné · {zdroj}
    </Badge>
  );
}

export function Kus({
  id,
  meno,
  veta,
  subor,
  children,
}: {
  id: string;
  meno: string;
  veta: string;
  subor?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-6 border-t-3 border-ink pt-10" aria-labelledby={`${id}-h`}>
      <header className="flex flex-col gap-2">
        <h2 id={`${id}-h`} className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
          {meno}
        </h2>
        <p className="max-w-3xl text-base">{veta}</p>
        {subor && <p className="font-mono text-xs text-ink/60">src/components/ui/{subor}</p>}
      </header>
      {children}
    </section>
  );
}

/** Jedna bunka mriežky variantov: popis (props) + ukážka. */
export function Varianta({
  nazov,
  props,
  ukazka,
  className,
  children,
}: {
  nazov: string;
  props?: string;
  ukazka?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={cn('flex min-w-0 flex-col gap-3 rounded-lg border-3 border-ink bg-white p-4', className)}>
      <figcaption className="flex flex-wrap items-start justify-between gap-2">
        <span className="flex min-w-0 flex-col">
          <span className="font-display text-lg font-extrabold uppercase leading-tight">{nazov}</span>
          {props && <code className="break-words font-mono text-xs text-ink/70">{props}</code>}
        </span>
        {ukazka && <UkazkoveData />}
      </figcaption>
      {children}
    </figure>
  );
}

export function Mriezka({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('grid gap-6 md:grid-cols-2 xl:grid-cols-3', className)}>{children}</div>;
}

export function Podnadpis({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-sm font-bold uppercase tracking-[0.14em]">{children}</h3>;
}

/* ---------- ukážkové rady (deterministické, rovnaké na serveri aj v prehliadači) ---------- */

export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tvar dennej rady podľa návrhu pulzu v3 (work/v7/KORPUS_DATA.md): [dátum, slová, prompty]. */
export type Den = [string, number, number];

export type PulzV3 = {
  version: 3;
  updated_at: string;
  words_month: number;
  prompts_today: number;
  streak_days: number;
  projects_active: number;
  words_today?: number;
  words_total?: number;
  active_days_total?: number;
  days?: Den[];
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** 365 ukážkových dní končiacich dňom snímky (OVERENE_DNA). Posledných `seria` dní je aktívnych, deň pred nimi prázdny,
 *  aby ukážka sedela so skutočnou sériou z pulzu. Hodnoty sú vymyslené a všade nesú badge „ukážkové dáta“. */
export function ukazkoveDni(seria = 65, koniec = OVERENE_DNA): Den[] {
  const r = rng(29092026);
  const end = new Date(`${koniec}T12:00:00Z`);
  const out: Den[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    const wd = d.getUTCDay(); // 0 = nedeľa
    const vSerii = i < seria;
    const pauza = i === seria || (!vSerii && r() < 0.16);
    if (pauza) {
      out.push([iso(d), 0, 0]);
      continue;
    }
    const vikend = wd === 0 || wd === 6 ? 0.55 : 1;
    const rast = 0.55 + 0.45 * ((364 - i) / 364);
    const slova = Math.round((500 + r() * 4600) * vikend * rast);
    out.push([iso(d), slova, Math.max(1, Math.round(slova / (48 + r() * 30)))]);
  }
  return out;
}

export const DNI_UKAZKA: Den[] = ukazkoveDni();

/** Posledných n dní (slová). */
export const poslednych = (n: number, dni: Den[] = DNI_UKAZKA) => dni.slice(-n).map((d) => d[1]);

/** Týždenné súčty (pondelok = začiatok týždňa). */
export function tyzdne(dni: Den[] = DNI_UKAZKA) {
  const out: { tyzden: string; slova: number; prompty: number; aktivne: number }[] = [];
  for (const [d, s, p] of dni) {
    const dt = new Date(`${d}T12:00:00Z`);
    const wd = (dt.getUTCDay() + 6) % 7;
    if (wd === 0 || out.length === 0) {
      out.push({ tyzden: `${dt.getUTCDate()}. ${dt.getUTCMonth() + 1}.`, slova: 0, prompty: 0, aktivne: 0 });
    }
    const t = out[out.length - 1];
    t.slova += s;
    t.prompty += p;
    t.aktivne += s > 0 ? 1 : 0;
  }
  return out;
}

/* ---------- živý pulz: snímka z fakty.ts, po načítaní /pulse.json ---------- */

export type Pulz = { words_month: number; prompts_today: number; streak_days: number; projects_active: number; cas: string };

const zaklad: Pulz = {
  words_month: ZIVE_CISLA.find((z) => z.kluc === 'words_month')?.value ?? 0,
  prompts_today: ZIVE_CISLA.find((z) => z.kluc === 'prompts_today')?.value ?? 0,
  streak_days: ZIVE_CISLA.find((z) => z.kluc === 'streak_days')?.value ?? 0,
  projects_active: ZIVE_CISLA.find((z) => z.kluc === 'projects_active')?.value ?? 0,
  cas: ZIVE_CISLA_SNIMKA,
};

export function usePulz(): Pulz {
  const [p, setP] = React.useState<Pulz>(zaklad);
  React.useEffect(() => {
    if (!ZIVE_CISLA_ZDROJ) return;
    const ctrl = new AbortController();
    fetch(ZIVE_CISLA_ZDROJ, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Record<string, unknown> | null) => {
        if (!d) return;
        const num = (k: keyof Pulz, f: number) => (typeof d[k] === 'number' ? (d[k] as number) : f);
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
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return p;
}
