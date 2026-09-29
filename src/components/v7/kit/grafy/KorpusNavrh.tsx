/** V7 katalóg · Korpus — návrh. Štyri podania dát Korpusu (písanie s AI) pre hero, bio a stránku štatistík.
 *  Skutočné: 4 čísla z /pulse.json (words_month, prompts_today, streak_days, projects_active) a KORPUS z fakty.ts.
 *  Ukážkové: denné rady (DNI_UKAZKA) v tvare pulzu v3 (work/v7/KORPUS_DATA.md) — všade badge „ukážkové dáta“. */
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Flame, PenLine, Activity } from 'lucide-react';
import { HeatmapChart, type HeatmapCellData } from '@/components/ui/heatmap-chart';
import { Sparkline } from '@/components/ui/sparkline';
import { GaugeChart } from '@/components/ui/gauge-chart';
import { RadialBarChart } from '@/components/ui/radial-bar-chart';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KORPUS } from '@/data/fakty';
import { DNI_UKAZKA, FARBA, Kus, SkutocneData, UkazkoveData, fmt, usePulz, type Den } from './spolocne';
import { TEP_ZONY } from './MaleKusy';

/* ---------- príprava rady ---------- */

const DNI_SK = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
const MES = ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'];
const datum = (d: string) => {
  const dt = new Date(`${d}T12:00:00Z`);
  return `${dt.getUTCDate()}. ${dt.getUTCMonth() + 1}. ${dt.getUTCFullYear()}`;
};

/** Kalendár: stĺpec = týždeň (od pondelka), riadok = deň. Vracia bunky pre HeatmapChart + mapu dňa. */
function kalendar(dni: Den[]) {
  const prvy = new Date(`${dni[0][0]}T12:00:00Z`);
  const posun = (prvy.getUTCDay() + 6) % 7; // koľko dní pred prvým dňom má prvý týždeň
  const cols: string[] = [];
  const mesiace: { col: number; nazov: string }[] = [];
  const cells: HeatmapCellData[] = [];
  const podla = new Map<string, Den>();
  dni.forEach((den, i) => {
    const k = i + posun;
    const w = Math.floor(k / 7);
    const r = k % 7;
    const dt = new Date(`${den[0]}T12:00:00Z`);
    if (r === 0 || i === 0) {
      const pon = new Date(dt);
      pon.setUTCDate(dt.getUTCDate() - r);
      cols[w] = `týždeň od ${pon.getUTCDate()}. ${pon.getUTCMonth() + 1}.`;
    }
    if (dt.getUTCDate() === 1) mesiace.push({ col: w, nazov: MES[dt.getUTCMonth()] });
    cells.push({ row: DNI_SK[r], col: cols[w], value: den[1] });
    podla.set(`${DNI_SK[r]}__${cols[w]}`, den);
  });
  return { cols, cells, mesiace, podla };
}

const KAL = kalendar(DNI_UKAZKA);
const AKTIVNE_DNI = DNI_UKAZKA.filter((d) => d[1] > 0).length;
const SLOVA_ROK = DNI_UKAZKA.reduce((a, d) => a + d[1], 0);
const DNES_UKAZKA = DNI_UKAZKA[DNI_UKAZKA.length - 1];
const RADA30 = DNI_UKAZKA.slice(-30).map((d) => d[1]);

/** Svietiaca stupnica na ink: 0 = tmavá bunka, max = žltá. Iba tokeny cez color-mix, žiadny hex. */
const NIZKA = 'color-mix(in srgb, var(--color-paper) 12%, var(--color-ink))';
const VYSOKA = 'var(--color-yellow)';
const STUPNE = [0, 25, 50, 75, 100].map((p) => `color-mix(in srgb, ${VYSOKA} ${p}%, ${NIZKA})`);

function Schema({ children }: { children: string }) {
  return (
    <details className="rounded-lg border-3 border-ink bg-paper">
      <summary className="flex min-h-11 cursor-pointer items-center px-4 font-mono text-sm font-bold uppercase">Aké dáta to potrebuje (JSON)</summary>
      <pre className="overflow-x-auto border-t-3 border-ink p-4 font-mono text-xs leading-relaxed">{children}</pre>
    </details>
  );
}

function Hlavicka({ pismeno, nazov, veta }: { pismeno: string; nazov: string; veta: string }) {
  return (
    <header className="flex flex-col gap-1">
      <p className="font-mono text-sm font-bold uppercase tracking-[0.14em]">Podanie {pismeno}</p>
      <h3 className="font-display text-display-xs font-extrabold uppercase">{nazov}</h3>
      <p className="max-w-3xl">{veta}</p>
    </header>
  );
}

function Bodka() {
  return (
    <span aria-hidden="true" className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full rounded-full bg-yellow opacity-70 motion-safe:animate-ping" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow" />
    </span>
  );
}

/* ---------- (a) kalendárová heatmapa ---------- */

function Kalendar() {
  const pulz = usePulz();
  const ref = React.useRef<HTMLDivElement>(null);
  const [den, setDen] = React.useState<Den>(DNES_UKAZKA);
  // 15 px na mobile (scroll), 19 px od 1024 px (53 týždňov sa zmestí bez scrollu)
  const [cell, setCell] = React.useState(15);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const nastav = () => setCell(mq.matches ? 19 : 15);
    nastav();
    mq.addEventListener('change', nastav);
    return () => mq.removeEventListener('change', nastav);
  }, []);
  React.useEffect(() => {
    // na mobile ukáž najnovšie týždne (koniec rady), nie začiatok
    const el = ref.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [cell]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border-3 border-ink bg-ink p-4 text-paper shadow-brutal sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.14em]">
          <Bodka /> Aktívne dni · 12 mesiacov
        </p>
        <UkazkoveData />
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-l-3 border-paper/25 pl-3">
          <dt className="font-mono text-xs uppercase text-paper/70">aktívnych dní</dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">{AKTIVNE_DNI}</dd>
        </div>
        <div className="border-l-3 border-paper/25 pl-3">
          <dt className="font-mono text-xs uppercase text-paper/70">slov za rok</dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">{fmt(SLOVA_ROK)}</dd>
        </div>
        <div className="border-l-3 border-yellow pl-3">
          <dt className="font-mono text-xs uppercase text-paper/70">dní v rade · skutočné</dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl text-yellow">{pulz.streak_days}</dd>
        </div>
        <div className="border-l-3 border-yellow pl-3">
          <dt className="font-mono text-xs uppercase text-paper/70">promptov dnes · skutočné</dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl text-yellow">{pulz.prompts_today}</dd>
        </div>
      </dl>

      <div className="flex gap-2">
        <div className="flex shrink-0 flex-col pt-[26px] font-mono text-[10px] leading-none text-paper/70" aria-hidden="true">
          {DNI_SK.map((d, i) => (
            <span key={d} style={{ height: cell }} className="flex items-center">
              {i % 2 === 0 ? d : ''}
            </span>
          ))}
        </div>
        <div ref={ref} className="min-w-0 flex-1 overflow-x-auto pb-2">
          <div className="relative h-[18px] font-mono text-[10px] uppercase text-paper/70" style={{ width: 8 + KAL.cols.length * cell }} aria-hidden="true">
            {KAL.mesiace.map((m) => (
              <span key={`${m.col}-${m.nazov}`} className="absolute top-0" style={{ left: 8 + m.col * cell }}>
                {m.nazov}
              </span>
            ))}
          </div>
          <HeatmapChart
            data={KAL.cells}
            rows={DNI_SK}
            cols={KAL.cols}
            cellSize={cell}
            showLabels={false}
            colorLow={NIZKA}
            colorHigh={VYSOKA}
            onCellClick={(c) => {
              const d = KAL.podla.get(`${c.row}__${c.col}`);
              if (d) setDen(d);
            }}
            ariaLabel="Slová za deň, posledných 12 mesiacov, ukážka"
            className="overflow-visible [&_[role=button]]:border-ink"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <p aria-live="polite" className="text-paper/85">
          {datum(den[0])}: <b className="text-yellow">{fmt(den[1])}</b> slov · <b className="text-yellow">{den[2]}</b> promptov
        </p>
        <span className="flex items-center gap-1 text-paper/70" aria-hidden="true">
          menej
          {STUPNE.map((c) => (
            <span key={c} className="inline-block h-3 w-3 border border-ink" style={{ backgroundColor: c }} />
          ))}
          viac
        </span>
      </div>
    </div>
  );
}

/* ---------- (b) svietiaci widget do hero ---------- */

function WidgetKarta() {
  const pulz = usePulz();
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg border-3 border-ink bg-ink p-5 text-paper shadow-brutal">
      <div className="flex items-center justify-between gap-3 font-mono text-xs font-bold uppercase tracking-[0.14em]">
        <span className="flex items-center gap-2">
          <Bodka /> Korpus · naživo
        </span>
        <span className="text-paper/55">{pulz.cas}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-display text-5xl font-extrabold tabular-nums text-yellow">{pulz.prompts_today}</p>
          <p className="font-mono text-xs uppercase text-paper/75">promptov dnes</p>
        </div>
        <div>
          <p className="flex items-center gap-1 font-display text-5xl font-extrabold tabular-nums">
            {pulz.streak_days}
            <Flame className="h-7 w-7 text-yellow" aria-hidden="true" />
          </p>
          <p className="font-mono text-xs uppercase text-paper/75">dní v rade</p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between font-mono text-xs uppercase text-paper/75">
          <span>slová · 30 dní</span>
          <span className="rounded-sm bg-yellow px-1.5 text-ink">ukážka</span>
        </div>
        <Sparkline data={RADA30} type="area" color={FARBA.zlta} showEndDot height={56} ariaLabel="Slová za posledných 30 dní, ukážkové dáta" />
        <p className="font-mono text-xs text-paper/75">
          dnes {fmt(DNES_UKAZKA[1])} slov (ukážka) · mesiac <b className="text-paper">{fmt(pulz.words_month)}</b> (skutočné)
        </p>
      </div>
      <Button asChild variant="accent" className="shadow-[4px_4px_0_hsl(var(--background))]">
        <a href="#korpus-a">
          Pozri vitálne funkcie <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
    </div>
  );
}

function WidgetPilulka() {
  const pulz = usePulz();
  return (
    <a
      href="#korpus-a"
      className="brutal press inline-flex min-h-11 max-w-full items-center gap-3 rounded-full bg-ink py-2 pl-4 pr-3 font-mono text-sm font-bold text-paper"
    >
      <Bodka />
      <span className="whitespace-nowrap">
        <span className="text-yellow">{pulz.prompts_today}</span> promptov dnes
      </span>
      <span className="hidden whitespace-nowrap sm:inline">
        · <span className="text-yellow">{pulz.streak_days}</span> dní v rade
      </span>
      <Sparkline data={RADA30.slice(-14)} type="bar" color={FARBA.zlta} width={56} height={20} animated={false} className="shrink-0" ariaLabel="Slová za 14 dní, ukážka" />
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  );
}

function WidgetMriezka() {
  const pulz = usePulz();
  const posl = DNI_UKAZKA.slice(-84);
  const k = kalendar(posl);
  return (
    <a href="#korpus-a" className="brutal press flex w-fit max-w-full flex-col gap-2 bg-ink p-3 text-paper" aria-label="Posledných 12 týždňov písania, otvor štatistiky">
      <HeatmapChart
        data={k.cells}
        rows={DNI_SK}
        cols={k.cols}
        cellSize={11}
        showLabels={false}
        showTooltip={false}
        colorLow={NIZKA}
        colorHigh={VYSOKA}
        ariaLabel="12 týždňov, ukážka"
        className="pointer-events-none [&_[role=img]]:border-ink"
      />
      <span className="flex items-center justify-between gap-3 font-mono text-xs uppercase">
        <span>
          <b className="text-yellow">{pulz.streak_days}</b> dní v rade
        </span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </a>
  );
}

/* ---------- (c) bio ---------- */

function Bio() {
  const pulz = usePulz();
  return (
    <div className="grid gap-6 rounded-lg border-3 border-ink bg-white p-4 shadow-brutal sm:p-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-4">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.14em]">Anamnéza · vitálne funkcie</p>
        <p className="font-display text-display-xs font-extrabold uppercase leading-none">Píšem s AI každý deň.</p>
        <p className="text-lg">
          Od {KORPUS.od} {KORPUS.slova} vlastných slov a {KORPUS.prompty} promptov. Toto je môj tep: meria ho Korpus, nie ja.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard variant="compact" title="Slov celkom" value={KORPUS.slova} colorScheme="secondary" icon={<PenLine />} change={`${KORPUS.prompty} promptov`} trend="neutral" comparison="" />
          <StatCard variant="compact" title="Slov tento mesiac" value={fmt(pulz.words_month)} colorScheme="info" icon={<Activity />} change={`${pulz.projects_active} projektov beží`} trend="neutral" comparison="" />
        </div>
        <p className="flex flex-wrap gap-2">
          <SkutocneData zdroj="fakty.ts · KORPUS" /> <SkutocneData zdroj={`pulse.json · ${pulz.cas}`} />
        </p>
      </div>
      <div className="grid grid-cols-2 items-center gap-4">
        <figure className="flex flex-col items-center gap-2">
          <GaugeChart value={pulz.prompts_today} min={0} max={150} zones={TEP_ZONY} size="lg" label="tep dňa" valueFormatter={(v) => `${v}`} />
          <figcaption className="text-center font-mono text-xs uppercase">prompty dnes · stupnica 0–150 = návrh</figcaption>
        </figure>
        <figure className="relative flex flex-col items-center gap-2">
          <div className="relative w-full">
            <RadialBarChart
              data={[{ name: 'seria', value: pulz.streak_days, fill: FARBA.zlta }]}
              config={{ seria: { label: 'Dní v rade', color: FARBA.zlta } }}
              maxValue={100}
              innerRadius="70%"
              showLabel={false}
              showTooltip={false}
              variant="default"
              className="mx-auto max-h-[200px]"
              aria-label={`Séria ${pulz.streak_days} dní z míľnika 100`}
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-extrabold tabular-nums">{pulz.streak_days}</span>
              <span className="font-mono text-[10px] uppercase">dní v rade</span>
            </div>
          </div>
          <figcaption className="text-center font-mono text-xs uppercase">prsteň k míľniku 100 (návrh)</figcaption>
        </figure>
      </div>
    </div>
  );
}

/* ---------- (d) EKG písania ---------- */

const EKG = DNI_UKAZKA.slice(-90).map(([d, s]) => {
  const dt = new Date(`${d}T12:00:00Z`);
  return { den: `${dt.getUTCDate()}. ${dt.getUTCMonth() + 1}.`, slova: s };
});
const EKG_PRIEMER = Math.round(EKG.reduce((a, d) => a + d.slova, 0) / EKG.length);

function EkgTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-3 border-paper bg-ink px-3 py-2 font-mono text-xs text-paper">
      <p className="font-bold">{label}</p>
      <p className="text-yellow">{fmt(Number(payload[0].value ?? 0))} slov</p>
    </div>
  );
}

function Ekg({ seria }: { seria: number }) {
  const zaciatok = EKG[Math.max(0, EKG.length - seria)];
  return (
    <div className="relative flex flex-col gap-3 rounded-lg border-3 border-ink bg-ink p-4 text-paper shadow-brutal sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.14em]">
          <Bodka /> EKG písania · 90 dní
        </p>
        <UkazkoveData />
      </div>
      <div className="h-[240px] w-full font-mono text-[11px]" role="img" aria-label="Slová za deň za 90 dní ako EKG krivka, ukážkové dáta">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={EKG} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ekg-plocha" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={FARBA.zlta} stopOpacity={0.45} />
                <stop offset="100%" stopColor={FARBA.zlta} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-paper)" strokeOpacity={0.12} />
            <XAxis dataKey="den" tick={{ fill: 'var(--color-paper)', opacity: 0.6 }} tickLine={false} axisLine={false} interval={14} />
            <YAxis hide />
            <Tooltip content={<EkgTooltip />} cursor={{ stroke: 'var(--color-paper)', strokeOpacity: 0.4 }} />
            <ReferenceLine y={EKG_PRIEMER} stroke="var(--color-paper)" strokeDasharray="6 4" strokeOpacity={0.6} label={{ value: 'priemer', fill: 'var(--color-paper)', position: 'insideTopLeft', fontSize: 11 }} />
            <ReferenceLine x={zaciatok.den} stroke={FARBA.zlta} strokeWidth={2} label={{ value: `séria ${seria} dní`, fill: 'var(--color-yellow)', position: 'insideTopRight', fontSize: 11, fontWeight: 700 }} />
            <Area type="linear" dataKey="slova" stroke={FARBA.zlta} strokeWidth={2} fill="url(#ekg-plocha)" isAnimationActive={false} />
            <ReferenceDot x={EKG[EKG.length - 1].den} y={EKG[EKG.length - 1].slova} r={5} fill={FARBA.zlta} stroke="var(--color-ink)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="font-mono text-xs text-paper/75">Čiara série = skutočná dĺžka série z pulzu ({seria} dní), krivka pod ňou je ukážka.</p>
    </div>
  );
}

/* ---------- sekcia ---------- */

export default function KorpusNavrh() {
  const pulz = usePulz();
  return (
    <Kus
      id="korpus"
      meno="Korpus — návrh"
      veta="Ako rozsvietiť písanie s AI na webe: štyri podania z kusov vyššie. Skutočné sú iba 4 čísla z pulse.json a súčty z fakty.ts; denné rady sú ukážkové, kým démon Korpusu nevráti dennú radu (pulz v3, work/v7/KORPUS_DATA.md)."
    >
      <div className="flex flex-wrap items-center gap-2">
        <SkutocneData zdroj={`pulse.json · ${pulz.cas}`} />
        <Badge variant="outline">words_month {fmt(pulz.words_month)}</Badge>
        <Badge variant="outline">prompts_today {pulz.prompts_today}</Badge>
        <Badge variant="outline">streak_days {pulz.streak_days}</Badge>
        <Badge variant="outline">projects_active {pulz.projects_active}</Badge>
      </div>

      {/* (a) */}
      <section id="korpus-a" className="flex scroll-mt-24 flex-col gap-4">
        <Hlavicka pismeno="(a)" nazov="Kalendár aktívnych dní" veta="53 × 7 ako GitHub contributions, svieti na ink. Klik na deň ukáže slová a prompty. Na mobile sa posunie na najnovšie týždne. Srdce stránky štatistík." />
        <Kalendar />
        <p className="text-sm">Kusy: heatmap-chart (showLabels=false, colorLow/High cez color-mix z tokenov, onCellClick) + vlastný riadok mesiacov a dní.</p>
        <Schema>{`// GET /api/pulz/  (pulz v3) — iba to, čo kalendár číta
{
  "updated_at": "2026-09-29T18:00:00Z",   // ISO, zobrazí sa „aktualizované …“
  "streak_days": 65,
  "prompts_today": 88,
  "days": [                                // presne 365 dní, od najstaršieho, bez dier
    ["2025-09-30", 5120, 41],              // [dátum YYYY-MM-DD v Europe/Bratislava, slová, prompty]
    ["2025-10-01", 0, 0]                   // neaktívny deň = nuly, nie chýbajúci riadok
  ]
}
// ~9 kB. Súčty (aktívne dni, slová za rok) počíta web z "days".`}</Schema>
      </section>

      {/* (b) */}
      <section id="korpus-b" className="flex flex-col gap-4">
        <Hlavicka pismeno="(b)" nazov="Svietiaci widget do hero" veta="Tri veľkosti toho istého pulzu: karta vedľa fotky, pilulka pod mottom, mriežka 12 týždňov ako nálepka. Každá vedie na štatistiky." />
        <div className="flex flex-col flex-wrap items-start gap-6 lg:flex-row">
          <WidgetKarta />
          <div className="flex min-w-0 max-w-full flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs uppercase">pilulka · pod motto</p>
              <WidgetPilulka />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs uppercase">
                mriežka 12 týždňov · nálepka <UkazkoveData className="ml-2" />
              </p>
              <WidgetMriezka />
            </div>
          </div>
        </div>
        <p className="text-sm">Kusy: sparkline (area, bar), heatmap-chart, button (accent = jediné CTA), lucide Flame.</p>
        <Schema>{`// GET /api/pulz/?rozsah=hero  (malý, cache 60 s)
{
  "updated_at": "2026-09-29T18:00:00Z",
  "prompts_today": 88,
  "streak_days": 65,
  "words_today": 4210,                     // CHÝBA v dnešnom pulse.json → dnes ukážka
  "words_month": 138927,
  "spark_words": [5120, 0, 3890, …]        // 30 čísel, slová za deň, od najstaršieho (alebo web vezme days.slice(-30))
}`}</Schema>
      </section>

      {/* (c) */}
      <section id="korpus-c" className="flex flex-col gap-4">
        <Hlavicka pismeno="(c)" nazov="Bio: anamnéza s tepom" veta="Do sekcie Kto som: veta, dve stat-card a dva ukazovatele. Bez dennej rady, ide hneď z dnešných čísel." />
        <Bio />
        <p className="text-sm">Kusy: gauge-chart (vlastné pásma pokoj / záťaž / tachykardia), radial-bar-chart (1 položka ako prsteň), stat-card compact.</p>
        <Schema>{`// stačí dnešný pulse.json + fakty.ts; voliteľne pre presnejšie podanie:
{
  "prompts_today": 88,
  "streak_days": 65,
  "streak_best": 65,                       // najdlhšia séria → prsteň „rekord“
  "words_month": 138927,
  "projects_active": 6,
  "words_total": 572469,                   // dnes je v fakty.ts ručne (KORPUS.slova)
  "prompts_total": 7869,
  "since": "2026-01-01"
}`}</Schema>
      </section>

      {/* (d) */}
      <section id="korpus-d" className="flex flex-col gap-4">
        <Hlavicka pismeno="(d)" nazov="EKG písania" veta="Denné slová ako krivka na monitore: 90 dní, čiara priemeru, značka začiatku série, bodka dneška. Najsilnejšie spojenie zdravotníckej línie s dátami." />
        <Ekg seria={pulz.streak_days} />
        <p className="text-sm">
          Recharts priamo (ResponsiveContainer + Area + ReferenceLine/Dot), nie ChartContainer: ten nasilu farbí čiary a osi na ink, na tmavom podklade by zmizli.
        </p>
        <Schema>{`// z tej istej rady ako (a), web vezme posledných 90 dní
{
  "updated_at": "2026-09-29T18:00:00Z",
  "streak_days": 65,                       // poloha čiary „séria“
  "days": [["2026-07-01", 5120, 41], …]    // stačí 90, ideálne 365 (zdieľané s kalendárom)
}`}</Schema>
      </section>
    </Kus>
  );
}
