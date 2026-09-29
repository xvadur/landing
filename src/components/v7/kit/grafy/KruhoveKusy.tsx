/** V7 katalóg · kruhové grafy: donut-chart, radar-chart, radial-bar-chart. */
import { DonutChart, DonutChartCenter, type DonutChartData } from '@/components/ui/donut-chart';
import { RadarChart } from '@/components/ui/radar-chart';
import { RadialBarChart } from '@/components/ui/radial-bar-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { MARQUEE_FAKTY, POSTAVIL } from '@/data/fakty';
import { DNI_UKAZKA, FARBA, Kus, Mriezka, Podnadpis, SkutocneData, Varianta, fmt, usePulz } from './spolocne';

/* ---------- dáta ---------- */

/** Skutočné: 459 prehľadaných webov (MARQUEE_FAKTY, pack13), 441 z nich s textovými blokmi (POSTAVIL, spec05). */
const prehladane = Number((MARQUEE_FAKTY.find((f) => f.label === 'Realitné weby')?.value ?? '459').replace(/\D/g, '')) || 459;
const sTextom = Number(
  (POSTAVIL.find((p) => p.id === 'trhovy-dataset')?.fakty.find((f) => f.label === 'Weby')?.value ?? '441').replace(/\D/g, ''),
);
const WEBY: DonutChartData[] = [
  { name: 'stextom', value: sTextom, fill: FARBA.zlta },
  { name: 'beztextu', value: prehladane - sTextom, fill: FARBA.ink },
];
const CFG_WEBY: ChartConfig = {
  stextom: { label: 'S textovými blokmi', color: FARBA.zlta },
  beztextu: { label: 'Bez textu', color: FARBA.ink },
};

/** Ukážka: prompty podľa projektu. */
const PROJEKTY: DonutChartData[] = [
  { name: 'xvadur', value: 412, fill: FARBA.ink },
  { name: 'hriech', value: 236, fill: FARBA.zlta },
  { name: 'netopier', value: 188, fill: FARBA.alarm },
  { name: 'klienti', value: 141, fill: FARBA.siva },
  { name: 'ine', value: 64, fill: FARBA.biela },
];
const CFG_PROJEKTY: ChartConfig = {
  xvadur: { label: 'xvadur.com', color: FARBA.ink },
  hriech: { label: 'Hriech', color: FARBA.zlta },
  netopier: { label: 'Netopier', color: FARBA.alarm },
  klienti: { label: 'Klienti', color: FARBA.siva },
  ine: { label: 'Iné', color: FARBA.biela },
};

/** Ukážka: priemerné slová podľa dňa v týždni, posledné 4 týždne vs. 4 týždne pred nimi (z ukážkovej rady). */
const DNI_TYZDNA = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
const RADAR = (() => {
  const priemer = (od: number, po?: number) => {
    const sucty = Array(7).fill(0);
    const pocty = Array(7).fill(0);
    DNI_UKAZKA.slice(od, po).forEach(([d, s]) => {
      const wd = (new Date(`${d}T12:00:00Z`).getUTCDay() + 6) % 7;
      sucty[wd] += s;
      pocty[wd] += 1;
    });
    return sucty.map((x, i) => Math.round(x / Math.max(1, pocty[i])));
  };
  const teraz = priemer(-28);
  const predtym = priemer(-56, -28);
  return DNI_TYZDNA.map((subject, i) => ({ subject, teraz: teraz[i], predtym: predtym[i] }));
})();
const CFG_RADAR: ChartConfig = {
  teraz: { label: 'Posledné 4 týždne', color: FARBA.zlta },
  predtym: { label: 'Predtým', color: FARBA.ink },
};

/** Ukážka: aktívne dni v posledných piatich mesiacoch (z ukážkovej rady). */
const MESIACE_SK = ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'];
const FARBY_KRUH = [FARBA.zlta, FARBA.siva, FARBA.biela, FARBA.alarm, FARBA.tlmena];
const AKTIVNE = (() => {
  const m = new Map<string, number>();
  DNI_UKAZKA.forEach(([d, s]) => {
    const k = d.slice(0, 7);
    m.set(k, (m.get(k) ?? 0) + (s > 0 ? 1 : 0));
  });
  return [...m.entries()].slice(-5).map(([k, v], i) => ({ name: MESIACE_SK[Number(k.slice(5, 7)) - 1], value: v, fill: FARBY_KRUH[i] }));
})();
const CFG_AKTIVNE: ChartConfig = Object.fromEntries(AKTIVNE.map((a) => [a.name, { label: a.name, color: a.fill }]));

export default function KruhoveKusy() {
  const pulz = usePulz();
  const seria = [{ name: 'seria', value: pulz.streak_days, fill: FARBA.zlta }];
  const CFG_SERIA: ChartConfig = { seria: { label: 'Dní v rade', color: FARBA.zlta } };

  return (
    <div className="flex flex-col gap-16">
      {/* ---------------- donut-chart ---------------- */}
      <Kus
        id="donut-chart"
        meno="donut-chart"
        subor="donut-chart.tsx"
        veta="Koláč s dierou a obsahom v strede: podiel celku, napríklad kam idú prompty alebo koľko webov prešlo sitom."
      >
        <Mriezka>
          <Varianta nazov="Stred + legenda" props="centerContent · DonutChartCenter">
            <DonutChart
              data={WEBY}
              config={CFG_WEBY}
              centerContent={<DonutChartCenter value={fmt(sTextom)} label={`z ${prehladane} webov`} />}
              aria-label="Trhový dataset: weby s textovými blokmi"
            />
            <SkutocneData zdroj="fakty.ts · 441 z 459 webov" />
          </Varianta>
          <Varianta nazov="Popisy vonku" props='showLabels="outside"' ukazka>
            <DonutChart data={PROJEKTY} config={CFG_PROJEKTY} showLabels="outside" outerRadius="62%" innerRadius="40%" aria-label="Prompty podľa projektu, ukážka" />
          </Varianta>
          <Varianta nazov="Popisy vnútri" props='showLabels="inside"' ukazka>
            <DonutChart data={PROJEKTY} config={CFG_PROJEKTY} showLabels="inside" innerRadius="45%" aria-label="Prompty podľa projektu, ukážka" />
          </Varianta>
          <Varianta nazov="Oddelené" props='variant="separated"' ukazka>
            <DonutChart data={PROJEKTY} config={CFG_PROJEKTY} variant="separated" aria-label="Prompty podľa projektu, ukážka" />
          </Varianta>
          <Varianta nazov="Plný koláč, bez tooltipu" props="innerRadius={0} · showTooltip={false} · animated={false}" ukazka>
            <DonutChart data={PROJEKTY} config={CFG_PROJEKTY} innerRadius={0} showTooltip={false} animated={false} aria-label="Prompty podľa projektu, ukážka" />
          </Varianta>
          <Varianta nazov="Tenký prstenec" props='innerRadius="72%" · outerRadius="88%"'>
            <DonutChart
              data={WEBY}
              config={CFG_WEBY}
              innerRadius="72%"
              outerRadius="88%"
              centerContent={<DonutChartCenter value={`${Math.round((sTextom / prehladane) * 100)} %`} label="s textom" />}
              aria-label="Podiel webov s textom"
            />
          </Varianta>
          <Varianta nazov="Prázdne dáta" props="data={[]} · emptyState">
            <DonutChart data={[]} config={CFG_PROJEKTY} emptyState="Zatiaľ žiadne prompty" />
          </Varianta>
        </Mriezka>
        <p className="text-sm">Bez vlastného <code>fill</code> berie <code>--chart-1…5</code> (ink, žltá, stamp, biela, sivá); popisy sú ink, na tmavom výseku papierové.</p>
      </Kus>

      {/* ---------------- radar-chart ---------------- */}
      <Kus
        id="radar-chart"
        meno="radar-chart"
        subor="radar-chart.tsx"
        veta="Pavučina: viac rozmerov naraz, porovnanie dvoch profilov. Týždenný rytmus písania, profil klienta pri vyšetrení."
      >
        <Mriezka>
          {(['default', 'filled', 'outlined'] as const).map((v) => (
            <Varianta key={v} nazov={v} props={`variant="${v}"`} ukazka>
              <RadarChart data={RADAR} dataKeys={['predtym', 'teraz']} config={CFG_RADAR} variant={v} aria-label="Slová podľa dňa v týždni, ukážka" />
            </Varianta>
          ))}
          <Varianta nazov="Bez mriežky a legendy" props="showGrid={false} · showLegend={false}" ukazka>
            <RadarChart data={RADAR} dataKeys={['teraz']} config={CFG_RADAR} showGrid={false} showLegend={false} aria-label="Slová podľa dňa v týždni, ukážka" />
          </Varianta>
          <Varianta nazov="Priesvitnosť, bez tooltipu" props="fillOpacity={0.25} · showTooltip={false} · animated={false}" ukazka>
            <RadarChart data={RADAR} dataKeys={['predtym', 'teraz']} config={CFG_RADAR} fillOpacity={0.25} showTooltip={false} animated={false} aria-label="Slová podľa dňa v týždni, ukážka" />
          </Varianta>
          <Varianta nazov="Prázdne" props="dataKeys={[]}">
            <RadarChart data={RADAR} dataKeys={[]} config={CFG_RADAR} emptyState="Chýba séria" />
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- radial-bar-chart ---------------- */}
      <Kus
        id="radial-bar-chart"
        meno="radial-bar-chart"
        subor="radial-bar-chart.tsx"
        veta="Sústredné oblúky: niekoľko podielov k maximu, alebo jeden oblúk ako prsteň aktivity."
      >
        <Podnadpis>variant=</Podnadpis>
        <Mriezka>
          {(['default', 'stacked', 'nested'] as const).map((v) => (
            <Varianta key={v} nazov={v} props={`variant="${v}" · maxValue={31}`} ukazka>
              <RadialBarChart data={AKTIVNE} config={CFG_AKTIVNE} variant={v} maxValue={31} showLegend aria-label="Aktívne dni po mesiacoch, ukážka" />
            </Varianta>
          ))}
        </Mriezka>
        <Podnadpis>Uhly, pozadie, popisy</Podnadpis>
        <Mriezka>
          <Varianta nazov="Polkruh" props="startAngle={180} · endAngle={0}" ukazka>
            <RadialBarChart data={AKTIVNE} config={CFG_AKTIVNE} startAngle={180} endAngle={0} maxValue={31} innerRadius="40%" aria-label="Aktívne dni, ukážka" />
          </Varianta>
          <Varianta nazov="Bez pozadia a popisov" props="showBackground={false} · showLabel={false}" ukazka>
            <RadialBarChart data={AKTIVNE} config={CFG_AKTIVNE} showBackground={false} showLabel={false} maxValue={31} aria-label="Aktívne dni, ukážka" />
          </Varianta>
          <Varianta nazov="Prsteň série" props="1 položka · maxValue={100} · innerRadius=70%">
            <div className="relative">
              <RadialBarChart
                data={seria}
                config={CFG_SERIA}
                maxValue={100}
                innerRadius="72%"
                outerRadius="100%"
                showLabel={false}
                showTooltip={false}
                aria-label={`Séria ${pulz.streak_days} dní z míľnika 100`}
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-5xl font-extrabold tabular-nums">{pulz.streak_days}</span>
                <span className="font-mono text-xs uppercase">dní v rade</span>
              </div>
            </div>
            <SkutocneData zdroj="pulse.json · míľnik 100 = návrh" />
          </Varianta>
        </Mriezka>
      </Kus>
    </div>
  );
}
