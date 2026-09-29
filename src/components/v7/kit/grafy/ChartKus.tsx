/** V7 katalóg · chart.tsx + chart-toolbar.tsx: ChartContainer (7 variantov), typy Recharts, tooltip, legenda, stavy,
 *  anotácie, palety a export. Denné rady sú ukážkové (badge), čísla trhového datasetu sú skutočné (fakty.ts). */
import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Moon, Sun } from 'lucide-react';
import {
  ChartContainer,
  ChartEmpty,
  ChartLegend,
  ChartLegendContent,
  ChartLoading,
  ChartTooltip,
  ChartTooltipContent,
  createChartConfig,
  renderChartAnnotations,
  type ChartConfig,
} from '@/components/ui/chart';
import { ChartToolbar } from '@/components/ui/chart-toolbar';
import { POSTAVIL } from '@/data/fakty';
import { DNI_UKAZKA, FARBA, Kus, Mriezka, Podnadpis, SkutocneData, Varianta, fmt } from './spolocne';

/* ---------- dáta ---------- */

/** 12 týždňov: slová v pracovné dni a cez víkend (ukážka). */
const TYZDNE = (() => {
  const dni = DNI_UKAZKA.slice(-84);
  const out: { tyzden: string; pracovne: number; vikend: number; prompty: number }[] = [];
  dni.forEach(([d, s, p], i) => {
    const dt = new Date(`${d}T12:00:00Z`);
    if (i % 7 === 0) out.push({ tyzden: `${dt.getUTCDate()}. ${dt.getUTCMonth() + 1}.`, pracovne: 0, vikend: 0, prompty: 0 });
    const t = out[out.length - 1];
    const wd = dt.getUTCDay();
    if (wd === 0 || wd === 6) t.vikend += s;
    else t.pracovne += s;
    t.prompty += p;
  });
  return out;
})();

/** 30 dní: slová + kĺzavý priemer 7 dní (ukážka). */
const MESIAC = (() => {
  const dni = DNI_UKAZKA.slice(-37);
  return dni.slice(7).map(([d, s], i) => {
    const okno = dni.slice(i + 1, i + 8).map((x) => x[1]);
    const dt = new Date(`${d}T12:00:00Z`);
    return {
      den: `${dt.getUTCDate()}. ${dt.getUTCMonth() + 1}.`,
      slova: s,
      priemer: Math.round(okno.reduce((a, b) => a + b, 0) / okno.length),
    };
  });
})();

/** Skutočné čísla: Trhový dataset (fakty.ts → POSTAVIL, zdroj spec05). */
const TRH = (() => {
  const p = POSTAVIL.find((x) => x.id === 'trhovy-dataset');
  const cislo = (label: string) => Number((p?.fakty.find((f) => f.label === label)?.value ?? '0').replace(/\s/g, ''));
  return [
    { co: 'Makléri', pocet: cislo('Makléri') },
    { co: 'Kancelárie', pocet: cislo('Realitné kancelárie') },
    { co: 'Weby', pocet: cislo('Weby') },
  ];
})();

const CFG_TYZDEN: ChartConfig = {
  pracovne: { label: 'Pracovné dni', color: FARBA.ink },
  vikend: { label: 'Víkend', color: FARBA.zlta },
};
const CFG_PROMPTY: ChartConfig = { prompty: { label: 'Prompty', color: FARBA.zlta } };
const CFG_MESIAC: ChartConfig = {
  slova: { label: 'Slová za deň', color: FARBA.zlta },
  priemer: { label: 'Priemer 7 dní', color: FARBA.ink },
};
/** Pre čiary: ChartContainer nasilu farbí každý path na ink (3 px). Farbu čiary vráti iba !important cez triedu série. */
const CFG_MESIAC_L: ChartConfig = {
  slova: { label: 'Slová za deň', color: FARBA.ink },
  priemer: { label: 'Priemer 7 dní', color: FARBA.alarm },
};
const OPRAVA_CIAR = '[&_.l-priemer_.recharts-line-curve]:![stroke:var(--color-priemer)]';
const CFG_TRH: ChartConfig = { pocet: { label: 'Počet', color: FARBA.zlta } };

const OS = { tickLine: false, axisLine: false, tickMargin: 8, fontSize: 11, minTickGap: 32 } as const;
/** Os Y: 25 200 → 25k, aby sa číslo zmestilo do 40 px. */
const kilo = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);
const CONT = 'aspect-auto h-[240px] w-full font-mono';

/* ---------- malé stavebné grafy ---------- */

function StlpceTyzden({ variant }: { variant?: 'default' | 'elevated' | 'flat' | 'filled' | 'minimal' | 'primary' }) {
  return (
    <ChartContainer config={CFG_PROMPTY} variant={variant} className="aspect-auto h-[180px] w-full font-mono" aria-label="Prompty za týždeň, ukážka">
      <BarChart data={TYZDNE} margin={{ left: 0, right: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="tyzden" {...OS} />
        <YAxis {...OS} width={40} tickFormatter={kilo} />
        <Bar dataKey="prompty" fill="var(--color-prompty)" />
      </BarChart>
    </ChartContainer>
  );
}

function TooltipUkazka({
  indicator,
  hideLabel,
  hideIndicator,
  formatovany,
}: {
  indicator?: 'dot' | 'line' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  formatovany?: boolean;
}) {
  return (
    <ChartContainer config={CFG_TYZDEN} className="aspect-auto h-[220px] w-full font-mono" aria-label="Slová za týždeň, ukážka">
      <BarChart data={TYZDNE.slice(-6)} margin={{ left: 0, right: 4, top: 8 }}>
        <XAxis dataKey="tyzden" {...OS} />
        <YAxis {...OS} width={40} tickFormatter={kilo} />
        <ChartTooltip
          defaultIndex={3}
          cursor={{ fill: 'hsl(var(--muted))' }}
          content={
            <ChartTooltipContent
              indicator={indicator}
              hideLabel={hideLabel}
              hideIndicator={hideIndicator}
              labelFormatter={formatovany ? (l) => `Týždeň od ${String(l ?? '')}` : undefined}
              formatter={
                formatovany
                  ? (v, n) => (
                      <span className="flex w-full justify-between gap-3">
                        <span>{n === 'pracovne' ? 'Po–Pi' : 'So–Ne'}</span>
                        <b className="font-mono tabular-nums">{fmt(Number(v))} slov</b>
                      </span>
                    )
                  : undefined
              }
            />
          }
        />
        <Bar dataKey="pracovne" stackId="a" fill="var(--color-pracovne)" />
        <Bar dataKey="vikend" stackId="a" fill="var(--color-vikend)" />
      </BarChart>
    </ChartContainer>
  );
}

function LegendaUkazka({ hore, bezIkony, ikony }: { hore?: boolean; bezIkony?: boolean; ikony?: boolean }) {
  const cfg: ChartConfig = ikony
    ? {
        pracovne: { label: 'Deň', color: FARBA.ink, icon: Sun },
        vikend: { label: 'Víkend', color: FARBA.zlta, icon: Moon },
      }
    : CFG_TYZDEN;
  return (
    <ChartContainer config={cfg} className="aspect-auto h-[240px] w-full font-mono" aria-label="Slová za týždeň, ukážka">
      <AreaChart data={TYZDNE} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="tyzden" {...OS} />
        <YAxis {...OS} width={40} tickFormatter={kilo} />
        <Area dataKey="pracovne" stackId="a" type="step" fill="var(--color-pracovne)" stroke={FARBA.ink} fillOpacity={1} />
        <Area dataKey="vikend" stackId="a" type="step" fill="var(--color-vikend)" stroke={FARBA.ink} fillOpacity={1} />
        <ChartLegend
          verticalAlign={hore ? 'top' : 'bottom'}
          content={<ChartLegendContent verticalAlign={hore ? 'top' : 'bottom'} hideIcon={bezIkony} />}
        />
      </AreaChart>
    </ChartContainer>
  );
}

/* ---------- sekcia ---------- */

export default function ChartKus() {
  const [nacitava, setNacitava] = React.useState(true);
  const maxDen = MESIAC.reduce((m, d) => (d.slova > m.slova ? d : m), MESIAC[0]);
  const priemer = Math.round(MESIAC.reduce((a, d) => a + d.slova, 0) / MESIAC.length);

  return (
    <div className="flex flex-col gap-16">
      <Kus
        id="chart"
        meno="chart"
        subor="chart.tsx"
        veta="Obal nad Recharts: rám, farby zo ChartConfig ako CSS premenné (--color-kľúč), brutálny tooltip a legenda, stavy načítavania a prázdna, anotácie a palety. Z neho sa skladá každý graf s osami."
      >
        <Podnadpis>Typy grafov v ChartContainer</Podnadpis>
        <Mriezka>
          <Varianta nazov="Plocha, skladaná" props="AreaChart · stackId · type=monotone" ukazka>
            <ChartContainer config={CFG_TYZDEN} className={CONT} aria-label="Slová za týždeň, ukážka">
              <AreaChart data={TYZDNE} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="tyzden" {...OS} />
                <YAxis {...OS} width={40} tickFormatter={kilo} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="pracovne" stackId="a" type="monotone" fill="var(--color-pracovne)" fillOpacity={1} stroke={FARBA.ink} />
                <Area dataKey="vikend" stackId="a" type="monotone" fill="var(--color-vikend)" fillOpacity={1} stroke={FARBA.ink} />
              </AreaChart>
            </ChartContainer>
          </Varianta>
          <Varianta nazov="Čiara + priemer" props="LineChart · 2 série · Line className + oprava farby" ukazka>
            <ChartContainer config={CFG_MESIAC_L} className={`${CONT} ${OPRAVA_CIAR}`} aria-label="Slová za deň za 30 dní, ukážka">
              <LineChart data={MESIAC} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="den" {...OS} />
                <YAxis {...OS} width={40} tickFormatter={kilo} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line dataKey="slova" type="monotone" stroke="var(--color-slova)" strokeWidth={3} dot={false} />
                <Line dataKey="priemer" className="l-priemer" type="monotone" stroke="var(--color-priemer)" strokeWidth={2} strokeDasharray="6 4" dot={false} />
              </LineChart>
            </ChartContainer>
          </Varianta>
          <Varianta nazov="Stĺpce + čiara" props="ComposedChart · Bar + Line" ukazka>
            <ChartContainer config={CFG_MESIAC} className={CONT} aria-label="Slová za deň a priemer, ukážka">
              <ComposedChart data={MESIAC} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="den" {...OS} />
                <YAxis {...OS} width={40} tickFormatter={kilo} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="slova" fill="var(--color-slova)" />
                <Line dataKey="priemer" type="monotone" stroke="var(--color-priemer)" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ChartContainer>
          </Varianta>
          <Varianta nazov="Stĺpce, zvislé" props="BarChart · jedna séria" ukazka>
            <StlpceTyzden />
          </Varianta>
          <Varianta nazov="Stĺpce, vodorovné" props='BarChart layout="vertical"'>
            <ChartContainer config={CFG_TRH} className="aspect-auto h-[180px] w-full font-mono" aria-label="Trhový dataset: makléri, kancelárie, weby">
              <BarChart data={TRH} layout="vertical" margin={{ left: 8, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="co" {...OS} width={80} />
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="co" />} />
                <Bar dataKey="pocet" fill="var(--color-pocet)" label={{ position: 'right', fill: FARBA.ink, fontWeight: 700, fontSize: 12 }} />
              </BarChart>
            </ChartContainer>
            <div className="flex flex-wrap items-center gap-2">
              <SkutocneData zdroj="fakty.ts · Trhový dataset" />
            </div>
          </Varianta>
          <Varianta nazov="Farby podľa témy" props="config: { theme: { light, dark } }" ukazka>
            <ChartContainer
              config={{ prompty: { label: 'Prompty', theme: { light: FARBA.ink, dark: FARBA.zlta } } }}
              className="aspect-auto h-[180px] w-full font-mono"
              aria-label="Prompty za týždeň, ukážka"
            >
              <BarChart data={TYZDNE} margin={{ left: 0, right: 4 }}>
                <XAxis dataKey="tyzden" {...OS} />
                <YAxis {...OS} width={40} tickFormatter={kilo} />
                <Bar dataKey="prompty" fill="var(--color-prompty)" />
              </BarChart>
            </ChartContainer>
            <p className="text-sm">Svetlá téma = ink, trieda <code>.dark</code> = žltá. Web tmavú tému nemá, hodí sa pre Netopiera.</p>
          </Varianta>
        </Mriezka>

        <Podnadpis>Varianty kontajnera · variant=</Podnadpis>
        <Mriezka>
          {(['default', 'elevated', 'flat', 'filled', 'minimal', 'primary'] as const).map((v) => (
            <Varianta key={v} nazov={v} props={`variant="${v}"`} ukazka>
              <StlpceTyzden variant={v} />
            </Varianta>
          ))}
        </Mriezka>
        <p className="text-sm">
          <b>accent</b> vynechaný: tieň aj pozadie sú hot, zákon ju dovoľuje iba na CTA a X.
        </p>

        <Podnadpis>Tooltip · ChartTooltipContent (otvorený cez defaultIndex)</Podnadpis>
        <Mriezka>
          <Varianta nazov="indicator=dot" props="predvolený" ukazka>
            <TooltipUkazka indicator="dot" />
          </Varianta>
          <Varianta nazov="indicator=line" props='indicator="line"' ukazka>
            <TooltipUkazka indicator="line" />
          </Varianta>
          <Varianta nazov="indicator=dashed" props='indicator="dashed"' ukazka>
            <TooltipUkazka indicator="dashed" />
          </Varianta>
          <Varianta nazov="bez nadpisu" props="hideLabel" ukazka>
            <TooltipUkazka hideLabel />
          </Varianta>
          <Varianta nazov="bez značky" props="hideIndicator" ukazka>
            <TooltipUkazka hideIndicator />
          </Varianta>
          <Varianta nazov="vlastný text" props="labelFormatter · formatter" ukazka>
            <TooltipUkazka formatovany />
          </Varianta>
        </Mriezka>

        <Podnadpis>Legenda · ChartLegendContent</Podnadpis>
        <Mriezka>
          <Varianta nazov="dole" props='verticalAlign="bottom"' ukazka>
            <LegendaUkazka />
          </Varianta>
          <Varianta nazov="hore" props='verticalAlign="top"' ukazka>
            <LegendaUkazka hore />
          </Varianta>
          <Varianta nazov="ikony z configu" props="config.icon" ukazka>
            <LegendaUkazka ikony />
          </Varianta>
        </Mriezka>

        <Podnadpis>Stavy</Podnadpis>
        <Mriezka>
          <Varianta nazov="načítava sa" props="loading · loadingLabel">
            <ChartContainer config={CFG_PROMPTY} loading={nacitava} loadingLabel="Načítavam pulz Korpusu" className="aspect-auto h-[180px] w-full font-mono" aria-label="Prompty za týždeň, ukážka">
              <BarChart data={TYZDNE} margin={{ left: 0, right: 4 }}>
                <XAxis dataKey="tyzden" {...OS} />
                <Bar dataKey="prompty" fill="var(--color-prompty)" />
              </BarChart>
            </ChartContainer>
            <button
              type="button"
              onClick={() => setNacitava((x) => !x)}
              className="brutal press min-h-11 self-start bg-white px-4 font-mono text-sm font-bold uppercase"
            >
              {nacitava ? 'Ukáž dáta' : 'Späť na načítavanie'}
            </button>
          </Varianta>
          <Varianta nazov="ChartLoading samostatne" props="bars={12}">
            <div className="h-[180px] border-3 border-ink">
              <ChartLoading bars={12} label="Načítavam" className="h-full" />
            </div>
          </Varianta>
          <Varianta nazov="ChartEmpty" props='message="…"'>
            <ChartEmpty message="Dnes ešte žiadny prompt" className="h-[180px]" />
          </Varianta>
        </Mriezka>

        <Podnadpis>Anotácie · renderChartAnnotations()</Podnadpis>
        <Varianta nazov="Referenčné čiary, callout, šípka" props="kind: referenceLine | callout | arrow" ukazka>
          <ChartContainer config={CFG_MESIAC} variant="flat" className="aspect-auto h-[300px] w-full font-mono" aria-label="Slová za 30 dní s anotáciami, ukážka">
            <LineChart data={MESIAC} margin={{ left: -8, right: 24, top: 40 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="den" {...OS} />
              <YAxis {...OS} width={40} tickFormatter={kilo} />
              <Line dataKey="slova" type="monotone" stroke={FARBA.ink} strokeWidth={3} dot={false} />
              {renderChartAnnotations([
                { kind: 'referenceLine', axis: 'y', value: priemer, label: 'priemer', dash: true },
                { kind: 'referenceLine', axis: 'x', value: MESIAC[9].den, label: 'deň 10', color: FARBA.alarm },
                { kind: 'callout', x: maxDen.den, y: maxDen.slova, text: 'rekord', placement: 'top' },
                { kind: 'arrow', from: { x: MESIAC[2].den, y: priemer * 0.35 }, to: { x: MESIAC[6].den, y: MESIAC[6].slova }, label: 'skok' },
              ])}
            </LineChart>
          </ChartContainer>
        </Varianta>

        <Podnadpis>Palety · CHART_PALETTES a createChartConfig()</Podnadpis>
        <Mriezka className="xl:grid-cols-2">
          <Varianta nazov="monochrome" props="createChartConfig(keys, labels, 'monochrome')" ukazka>
            <ChartContainer
              config={createChartConfig(['pracovne', 'vikend'], ['Pracovné dni', 'Víkend'], 'monochrome')}
              className={CONT}
              aria-label="Slová za týždeň, ukážka"
            >
              <BarChart data={TYZDNE} margin={{ left: 0, right: 4 }}>
                <XAxis dataKey="tyzden" {...OS} />
                <YAxis {...OS} width={40} tickFormatter={kilo} />
                <Bar dataKey="pracovne" fill="var(--color-pracovne)" />
                <Bar dataKey="vikend" fill="var(--color-vikend)" />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </Varianta>
          <Varianta nazov="xvadur (vlastná)" props="ink · žltá · alarm · sivá" ukazka>
            <ChartContainer
              config={{
                pracovne: { label: 'Pracovné dni', color: FARBA.ink },
                vikend: { label: 'Víkend', color: FARBA.zlta },
                prompty: { label: 'Prompty ×10', color: FARBA.alarm, icon: Activity },
              }}
              className={CONT}
              aria-label="Slová a prompty za týždeň, ukážka"
            >
              <BarChart data={TYZDNE.map((t) => ({ ...t, prompty: t.prompty * 10 }))} margin={{ left: 0, right: 4 }}>
                <XAxis dataKey="tyzden" {...OS} />
                <YAxis {...OS} width={40} tickFormatter={kilo} />
                <Bar dataKey="pracovne" fill="var(--color-pracovne)" />
                <Bar dataKey="vikend" fill="var(--color-vikend)" />
                <Bar dataKey="prompty" fill="var(--color-prompty)" />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </Varianta>
        </Mriezka>
        <p className="text-sm">
          <b>bold</b> (obsahuje hot a trikrát žltú), <b>vibrant</b> a <b>pastel</b> (pevné HSL mimo tokenov) sa na web nehodia, preto tu nie sú.
        </p>
      </Kus>

      <Kus
        id="chart-toolbar"
        meno="chart-toolbar"
        subor="chart-toolbar.tsx"
        veta="Lišta nad grafom: export do PNG, SVG, CSV a celá obrazovka. Funguje s každým grafom, ktorý kreslí <svg> alebo <canvas>."
      >
        <Mriezka className="xl:grid-cols-2">
          <Varianta nazov="Všetko" props='data · filename="korpus-tyzdne"' ukazka>
            <ChartToolbar data={TYZDNE} filename="korpus-tyzdne">
              <ChartContainer config={CFG_TYZDEN} className="aspect-auto h-[260px] w-full pt-14 font-mono" aria-label="Slová za týždeň, ukážka">
                <BarChart data={TYZDNE} margin={{ left: 0, right: 4 }}>
                  <XAxis dataKey="tyzden" {...OS} />
                  <YAxis {...OS} width={40} tickFormatter={kilo} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pracovne" stackId="a" fill="var(--color-pracovne)" />
                  <Bar dataKey="vikend" stackId="a" fill="var(--color-vikend)" />
                </BarChart>
              </ChartContainer>
            </ChartToolbar>
          </Varianta>
          <Varianta nazov="Iba CSV a celá obrazovka" props="png={false} svg={false}">
            <ChartToolbar data={TRH} filename="trhovy-dataset" png={false} svg={false}>
              <ChartContainer config={CFG_TRH} variant="filled" className="aspect-auto h-[260px] w-full pt-14 font-mono" aria-label="Trhový dataset">
                <BarChart data={TRH} layout="vertical" margin={{ left: 8, right: 48 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="co" {...OS} width={80} />
                  <Bar dataKey="pocet" fill="var(--color-pocet)" label={{ position: 'right', fill: FARBA.ink, fontWeight: 700, fontSize: 12 }} />
                </BarChart>
              </ChartContainer>
            </ChartToolbar>
            <SkutocneData zdroj="fakty.ts · Trhový dataset" />
          </Varianta>
          <Varianta nazov="Iba obrázok" props="svg={false} fullscreen={false}, bez data" ukazka>
            <ChartToolbar filename="korpus-mesiac" svg={false} fullscreen={false}>
              <ChartContainer config={CFG_MESIAC} variant="elevated" className="aspect-auto h-[220px] w-full pt-14 font-mono" aria-label="Slová za 30 dní, ukážka">
                <AreaChart data={MESIAC} margin={{ left: 0, right: 8 }}>
                  <XAxis dataKey="den" {...OS} />
                  <Area dataKey="slova" type="monotone" fill="var(--color-slova)" fillOpacity={1} stroke={FARBA.ink} />
                </AreaChart>
              </ChartContainer>
            </ChartToolbar>
          </Varianta>
        </Mriezka>
      </Kus>
    </div>
  );
}
