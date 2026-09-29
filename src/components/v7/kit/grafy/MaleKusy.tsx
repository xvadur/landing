/** V7 katalóg · malé ukazovatele: gauge-chart, sparkline, stat-card, progress, math-curve-progress.
 *  Skutočné čísla = pulz Korpusu (/pulse.json) a fakty.ts; trend a rady sú ukážkové (badge). */
import * as React from 'react';
import { Activity, FolderKanban, Flame, PenLine, BookOpen } from 'lucide-react';
import { GaugeChart, type GaugeChartZone } from '@/components/ui/gauge-chart';
import { Sparkline } from '@/components/ui/sparkline';
import { StatCard } from '@/components/ui/stat-card';
import { Progress } from '@/components/ui/progress';
import { MathCurveProgress } from '@/components/ui/math-curve-progress';
import { Slider } from '@/components/ui/slider';
import type { ProgressCurveKey } from '@/lib/math-curves';
import { KORPUS } from '@/data/fakty';
import { FARBA, Kus, Mriezka, Podnadpis, SkutocneData, UkazkoveData, Varianta, fmt, poslednych, usePulz } from './spolocne';

/** Stupnica „tep dňa“ = prompty dnes na škále 0–150. Hranice pásiem sú dizajnový návrh, nie fakt. */
export const TEP_ZONY: GaugeChartZone[] = [
  { from: 0, to: 60, color: FARBA.tlmena, label: 'pokoj' },
  { from: 60, to: 110, color: FARBA.zlta, label: 'záťaž' },
  { from: 110, to: 150, color: FARBA.alarm, label: 'tachykardia' },
];

const KRIVKY: ProgressCurveKey[] = ['spiral', 'heart', 'lissajous', 'cardioid', 'rose', 'astroid', 'superellipse', 'deltoid', 'nephroid'];
const RADA30 = poslednych(30);
const RADA14 = poslednych(14);
const KLES = [...RADA14].reverse();

function Tlacidla({ hodnoty, value, onChange, pripona = '' }: { hodnoty: number[]; value: number; onChange: (v: number) => void; pripona?: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Zmeň hodnotu">
      {hodnoty.map((h) => (
        <button
          key={h}
          type="button"
          aria-pressed={value === h}
          onClick={() => onChange(h)}
          className="brutal press min-h-11 min-w-11 bg-white px-3 font-mono text-sm font-bold aria-pressed:bg-yellow"
        >
          {h}
          {pripona}
        </button>
      ))}
    </div>
  );
}

export default function MaleKusy() {
  const pulz = usePulz();
  const [g, setG] = React.useState(65);
  const [p, setP] = React.useState(65);
  const [m, setM] = React.useState(65);

  return (
    <div className="flex flex-col gap-16">
      {/* ---------------- gauge-chart ---------------- */}
      <Kus
        id="gauge-chart"
        meno="gauge-chart"
        subor="gauge-chart.tsx"
        veta="Budík s ručičkou alebo oblúkom: jedno číslo na stupnici s pásmami. V zdravotníckej línii je to tlakomer, tep, saturácia."
      >
        <Podnadpis>variant × size</Podnadpis>
        <div className="grid gap-6 sm:grid-cols-3">
          {(['semicircle', 'full', 'meter'] as const).map((v) => (
            <Varianta key={v} nazov={v} props={`variant="${v}" · sm / md / lg`}>
              <div className="flex flex-wrap items-end justify-center gap-3">
                {(['sm', 'md', 'lg'] as const).map((s) => (
                  <GaugeChart key={s} value={pulz.streak_days} variant={v} size={s} label="dní v rade" className="w-full" />
                ))}
              </div>
            </Varianta>
          ))}
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm">
          Hodnota = séria dní z pulzu ({pulz.streak_days}) na predvolenej stupnici 0–100 s predvolenými pásmami. <SkutocneData zdroj="pulse.json · streak_days" />
        </p>

        <Podnadpis>Pásma, formát, ryšky, animácia</Podnadpis>
        <Mriezka>
          <Varianta nazov="Tep dňa" props="zones · min/max · valueFormatter">
            <GaugeChart
              value={pulz.prompts_today}
              min={0}
              max={150}
              zones={TEP_ZONY}
              size="lg"
              label="promptov dnes"
              valueFormatter={(v) => `${v} / min`}
              className="mx-auto"
            />
            <p className="flex flex-wrap items-center gap-2 text-sm">
              Prompty dnes ako tep. Pásma pokoj / záťaž / tachykardia sú návrh stupnice. <SkutocneData zdroj="pulse.json" />
            </p>
          </Varianta>
          <Varianta nazov="Bez ryšiek" props="showTicks={false} · variant=full">
            <GaugeChart value={pulz.projects_active} min={0} max={10} variant="full" showTicks={false} size="lg" label="bežiace projekty" className="mx-auto" />
            <SkutocneData zdroj="pulse.json · projects_active" />
          </Varianta>
          <Varianta nazov="Naživo" props="animated · value sa mení">
            <GaugeChart value={g} variant="meter" size="lg" label="posuň" className="mx-auto" />
            <GaugeChart value={g} size="md" label="bez animácie" animated={false} className="mx-auto" />
            <Slider value={[g]} onValueChange={(v) => setG(v[0] ?? 0)} min={0} max={100} step={1} aria-label="Hodnota budíka" />
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- sparkline ---------------- */}
      <Kus
        id="sparkline"
        meno="sparkline"
        subor="sparkline.tsx"
        veta="Drobný graf bez osí do riadku textu, karty alebo hero: trend posledných dní na jeden pohľad."
      >
        <Podnadpis>type × trend</Podnadpis>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-3 border-ink bg-white font-mono text-sm">
            <thead>
              <tr className="border-b-3 border-ink bg-paper">
                <th className="p-3 text-left">type \ trend</th>
                {(['up', 'down', 'neutral'] as const).map((t) => (
                  <th key={t} className="p-3 text-left">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['line', 'area', 'bar'] as const).map((ty) => (
                <tr key={ty} className="border-b-2 border-ink/20">
                  <td className="p-3 font-bold">{ty}</td>
                  {(['up', 'down', 'neutral'] as const).map((t) => (
                    <td key={t} className="p-3">
                      <Sparkline data={t === 'down' ? KLES : RADA14} type={ty} trend={t} height={40} ariaLabel={`Ukážka ${ty} ${t}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm">
          up = žltá (success), down = alarm (destructive), neutral = ink (primary). <UkazkoveData />
        </p>

        <Podnadpis>Ďalšie props</Podnadpis>
        <Mriezka>
          <Varianta nazov="Koncová bodka" props="showEndDot · strokeWidth={4}" ukazka>
            <Sparkline data={RADA30} type="line" showEndDot strokeWidth={4} height={56} ariaLabel="Slová za 30 dní, ukážka" />
          </Varianta>
          <Varianta nazov="Vlastná farba, pevná šírka" props='color · width={160} · height={24}' ukazka>
            <div className="flex items-center gap-3 font-mono text-sm">
              <span>30 dní</span>
              <Sparkline data={RADA30} type="area" color={FARBA.alarm} width={160} height={24} ariaLabel="Slová za 30 dní, ukážka" />
            </div>
          </Varianta>
          <Varianta nazov="Bez animácie" props="animated={false}" ukazka>
            <Sparkline data={RADA30} type="bar" animated={false} color={FARBA.ink} height={56} ariaLabel="Slová za 30 dní, ukážka" />
          </Varianta>
          <Varianta nazov="Na ink (svieti)" props="type=area · color=žltá · na bg-ink" ukazka>
            <div className="rounded-lg bg-ink p-4">
              <Sparkline data={RADA30} type="area" color={FARBA.zlta} showEndDot height={64} ariaLabel="Slová za 30 dní, ukážka" />
            </div>
          </Varianta>
          <Varianta nazov="V riadku textu" props="width=5em · height=1em" ukazka>
            <div className="text-lg">
              Za posledných 14 dní <Sparkline data={RADA14} type="line" width="5em" height={18} strokeWidth={2} color={FARBA.ink} className="align-middle" ariaLabel="Trend 14 dní, ukážka" /> písanie rastie.
            </div>
            <p className="text-sm">Sparkline je &lt;div&gt;, vnútri &lt;p&gt; rozbije hydratáciu. Obal musí byť div alebo span s display.</p>
          </Varianta>
          <Varianta nazov="Prázdna rada" props="data={[]}">
            <Sparkline data={[]} height={40} width={200} />
            <p className="text-sm">Prerušovaná čiara, aria-label „Sparkline, no data“.</p>
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- stat-card ---------------- */}
      <Kus
        id="stat-card"
        meno="stat-card"
        subor="stat-card.tsx"
        veta="Karta s jedným číslom, trendom, ikonou a voliteľným progresom. Hotový dlaždicový pás pre dôkaz a čísla Korpusu."
      >
        <Podnadpis>Skutočné čísla (pulz + fakty.ts)</Podnadpis>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Slová tento mesiac" value={fmt(pulz.words_month)} colorScheme="secondary" icon={<PenLine />} />
          <StatCard title="Prompty dnes" value={pulz.prompts_today} colorScheme="destructive" icon={<Activity className="text-paper" />} />
          <StatCard
            title="Dní v rade"
            value={pulz.streak_days}
            colorScheme="primary"
            icon={<Flame className="text-paper" />}
            progress={{ value: Math.min(100, pulz.streak_days), label: 'k míľniku 100 dní (návrh)' }}
          />
          <StatCard title="Bežiace projekty" value={pulz.projects_active} colorScheme="info" icon={<FolderKanban />} />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <StatCard variant="large" title="Korpus celkom" value={`${KORPUS.slova} slov`} colorScheme="secondary" icon={<BookOpen />} change={`${KORPUS.prompty} promptov`} trend="neutral" comparison={`od ${KORPUS.od}`} />
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <SkutocneData zdroj={`pulse.json · ${pulz.cas}`} /> <SkutocneData zdroj="fakty.ts · KORPUS" />
        </p>

        <Podnadpis>variant × trend × colorScheme</Podnadpis>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard variant="default" title="default · up" value="4 210" change="+12 %" trend="up" colorScheme="secondary" icon={<PenLine />} comparison="oproti minulému týždňu" />
          <StatCard variant="compact" title="compact · down" value="61" change="−8 %" trend="down" colorScheme="destructive" icon={<Activity className="text-paper" />} comparison="oproti včerajšku" />
          <StatCard variant="default" title="neutral · bez ikony" value="5 120" change="0 %" trend="neutral" colorScheme="info" comparison="rovnako ako vlani" />
          <StatCard title="primary (opravená ikona)" value="42" colorScheme="primary" icon={<Flame className="text-paper" />} />
          <StatCard title="success" value="42" colorScheme="success" icon={<Flame />} />
          <StatCard title="warning" value="42" colorScheme="warning" icon={<Flame />} progress={{ value: 42 }} />
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <UkazkoveData /> Čísla v tejto mriežke sú ukážka tvaru. <b>accent</b> (hot) vynechaný. success = warning = secondary = žltá, info = biela.
        </p>
      </Kus>

      {/* ---------------- progress ---------------- */}
      <Kus
        id="progress"
        meno="progress"
        subor="progress.tsx"
        veta="Pruh priebehu (Radix): plynulý, po desiatich zárezoch alebo nekonečný. Hodí sa na sériu, zápis, načítavanie."
      >
        <Mriezka>
          <Varianta nazov="smooth" props='variant="smooth" (predvolený)'>
            <Progress value={p} aria-label="Plynulý priebeh" />
            <Tlacidla hodnoty={[0, 33, 65, 100]} value={p} onChange={setP} pripona=" %" />
          </Varianta>
          <Varianta nazov="stepped" props='variant="stepped"'>
            <Progress value={p} variant="stepped" aria-label="Priebeh po zárezoch" />
            <p className="text-sm">Plnenie skáče po 10 krokoch (steps(10)). Rovnaké tlačidlá vľavo.</p>
          </Varianta>
          <Varianta nazov="marquee" props='variant="marquee" (bez value)'>
            <Progress variant="marquee" aria-label="Načítavam pulz" />
            <p className="text-sm">Neurčitý stav: blok putuje dráhou. Pri reduced motion stojí na 60 % sýtosti.</p>
          </Varianta>
          <Varianta nazov="Séria k míľniku" props="value · max={100}">
            <div className="flex items-baseline justify-between font-mono text-sm">
              <span>dní v rade</span>
              <b>{pulz.streak_days} / 100</b>
            </div>
            <Progress value={pulz.streak_days} max={100} className="h-8 [&>div]:bg-yellow" aria-label="Séria dní k míľniku 100" />
            <SkutocneData zdroj="pulse.json · míľnik 100 = návrh" />
          </Varianta>
          <Varianta nazov="Iný max" props="max={200}">
            <Progress value={pulz.prompts_today} max={200} className="[&>div]:bg-destructive" aria-label="Prompty dnes zo 200" />
            <p className="text-sm">
              {pulz.prompts_today} z 200 → pruh na {Math.round((pulz.prompts_today / 200) * 100)} %, aria-valuenow = {pulz.prompts_today}.
            </p>
          </Varianta>
          <Varianta nazov="Výšky a farby" props="className h-2 / h-5 / h-10 · [&>div]:bg-…">
            <Progress value={30} className="h-2" aria-label="Tenký pruh" />
            <Progress value={55} className="[&>div]:bg-yellow" aria-label="Žltý pruh" />
            <Progress value={80} className="h-10 bg-white [&>div]:bg-ink" aria-label="Hrubý pruh" />
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- math-curve-progress ---------------- */}
      <Kus
        id="math-curve-progress"
        meno="math-curve-progress"
        subor="math-curve-progress.tsx"
        veta="Priebeh po matematickej krivke: štvorček sa posúva po špirále, srdci či ruži. Srdce = zdravotnícka línia bez slova."
      >
        <Podnadpis>Všetkých 9 kriviek · curve=</Podnadpis>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
          {KRIVKY.map((c) => (
            <figure key={c} className="flex flex-col items-center gap-2 rounded-lg border-3 border-ink bg-white p-2 text-ink">
              <MathCurveProgress value={m} curve={c} size="lg" showValue className="h-20 w-20" />
              <figcaption className="font-mono text-xs">{c}</figcaption>
            </figure>
          ))}
        </div>
        <Tlacidla hodnoty={[0, 25, 50, 65, 100]} value={m} onChange={setM} pripona=" %" />

        <Mriezka>
          <Varianta nazov="size" props="sm · md · lg">
            <div className="flex items-end gap-4 text-ink">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <MathCurveProgress key={s} value={pulz.streak_days} curve="heart" size={s} />
              ))}
            </div>
          </Varianta>
          <Varianta nazov="Farby a hrúbka" props="fillColor · trackColor · strokeWidth">
            <div className="flex flex-wrap items-end gap-4 text-ink">
              <MathCurveProgress value={pulz.streak_days} curve="heart" size="lg" fillColor={FARBA.alarm} strokeWidth={6} />
              <MathCurveProgress value={pulz.streak_days} curve="rose" size="lg" fillColor={FARBA.zlta} strokeWidth={2} />
              <MathCurveProgress value={pulz.streak_days} curve="spiral" size="lg" trackColor={FARBA.alarm} fillColor={FARBA.ink} />
            </div>
          </Varianta>
          <Varianta nazov="Na ink" props="text-paper → currentColor">
            <div className="flex items-center gap-4 rounded-lg bg-ink p-4 text-paper">
              <MathCurveProgress value={pulz.streak_days} curve="heart" size="lg" fillColor={FARBA.zlta} showValue />
              <p className="font-mono text-sm">
                {pulz.streak_days} dní v rade
                <br />
                <span className="text-paper/60">srdce = cesta k 100</span>
              </p>
            </div>
          </Varianta>
        </Mriezka>
      </Kus>
    </div>
  );
}
