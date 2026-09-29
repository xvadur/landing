/** V7 katalóg · toky a mriežky: funnel-chart, sankey-chart, treemap-chart, heatmap-chart. */
import * as React from 'react';
import { FunnelChart, type FunnelChartData } from '@/components/ui/funnel-chart';
import { SankeyChart, type SankeyLink, type SankeyNode } from '@/components/ui/sankey-chart';
import { TreemapChart, type TreemapChartData } from '@/components/ui/treemap-chart';
import { HeatmapChart, type HeatmapCellData } from '@/components/ui/heatmap-chart';
import { MARQUEE_FAKTY, POSTAVIL } from '@/data/fakty';
import { FARBA, Kus, Mriezka, Podnadpis, SkutocneData, Varianta, rng } from './spolocne';

/* ---------- dáta ---------- */

const cislo = (s: string | undefined, f: number) => Number((s ?? '').replace(/\D/g, '')) || f;
const PREHLADANE = cislo(MARQUEE_FAKTY.find((f) => f.label === 'Realitné weby')?.value, 459);
const S_TEXTOM = cislo(POSTAVIL.find((p) => p.id === 'trhovy-dataset')?.fakty.find((f) => f.label === 'Weby')?.value, 441);

/** Ukážka: lievik webu (skóre → zápis → vyšetrenie). */
const LIEVIK: FunnelChartData[] = [
  { name: 'Návšteva webu', value: 2400, fill: FARBA.biela },
  { name: 'Skóre webu', value: 860, fill: FARBA.tlmena },
  { name: 'Zápis e-mailu', value: 310, fill: FARBA.zlta },
  { name: 'Vyšetrenie', value: 42, fill: FARBA.siva },
  { name: 'Liečba', value: 9, fill: FARBA.alarm },
];
/** Skutočné: 459 prehľadaných webov → 441 s textovými blokmi. */
const SITO: FunnelChartData[] = [
  { name: `Prehľadané weby`, value: PREHLADANE, fill: FARBA.biela },
  { name: `S textovými blokmi`, value: S_TEXTOM, fill: FARBA.zlta },
];

/** Ukážka: odkiaľ prompty prichádzajú → do ktorého projektu → aký typ práce. */
const S_UZLY: SankeyNode[] = [
  { id: 'cc', label: 'Claude Code', color: FARBA.ink },
  { id: 'chat', label: 'Chat', color: FARBA.siva },
  { id: 'tg', label: 'Telegram', color: FARBA.biela },
  { id: 'web', label: 'xvadur.com', color: FARBA.zlta },
  { id: 'hriech', label: 'Hriech', color: FARBA.alarm },
  { id: 'netopier', label: 'Netopier', color: FARBA.siva },
  { id: 'klienti', label: 'Klienti', color: FARBA.zlta },
  { id: 'kod', label: 'Kód', color: FARBA.ink },
  { id: 'text', label: 'Text', color: FARBA.zlta },
  { id: 'data', label: 'Dáta', color: FARBA.biela },
];
const S_TOKY: SankeyLink[] = [
  { source: 'cc', target: 'web', value: 320 },
  { source: 'cc', target: 'netopier', value: 140 },
  { source: 'cc', target: 'klienti', value: 110 },
  { source: 'chat', target: 'hriech', value: 190 },
  { source: 'chat', target: 'web', value: 70 },
  { source: 'tg', target: 'klienti', value: 60 },
  { source: 'web', target: 'kod', value: 290 },
  { source: 'web', target: 'text', value: 100 },
  { source: 'hriech', target: 'text', value: 170 },
  { source: 'hriech', target: 'data', value: 20 },
  { source: 'netopier', target: 'data', value: 110 },
  { source: 'netopier', target: 'kod', value: 30 },
  { source: 'klienti', target: 'kod', value: 120 },
  { source: 'klienti', target: 'text', value: 50 },
];
const SITO_UZLY: SankeyNode[] = [
  { id: 'all', label: `Prehľadané (${PREHLADANE})`, color: FARBA.ink },
  { id: 'ok', label: `S textom (${S_TEXTOM})`, color: FARBA.zlta },
  { id: 'no', label: `Bez textu (${PREHLADANE - S_TEXTOM})`, color: FARBA.siva },
];
const SITO_TOKY: SankeyLink[] = [
  { source: 'all', target: 'ok', value: S_TEXTOM },
  { source: 'all', target: 'no', value: PREHLADANE - S_TEXTOM },
];

/** Ukážka: slová podľa projektu (vnorené). */
const STROM: TreemapChartData[] = [
  {
    name: 'xvadur.com',
    children: [
      { name: 'V5', value: 38000 },
      { name: 'V5.4', value: 26000 },
      { name: 'V7', value: 17000 },
    ],
  },
  {
    name: 'Hriech',
    children: [
      { name: 'Články', value: 41000 },
      { name: 'Analýzy', value: 22000 },
    ],
  },
  { name: 'Netopier', children: [{ name: 'Engine', value: 24000 }, { name: 'Mapa', value: 11000 }] },
  { name: 'Klienti', children: [{ name: 'Jakub', value: 15000 }, { name: 'Lucia', value: 9000 }] },
];
const PLOCHY: TreemapChartData[] = [
  { name: 'xvadur.com', value: 81000 },
  { name: 'Hriech', value: 63000 },
  { name: 'Netopier', value: 35000 },
  { name: 'Klienti', value: 24000 },
  { name: 'Korpus', value: 12000 },
];

/** Ukážka: prompty podľa dňa a časti dňa / hodiny. */
const DNI = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
const CASTI = ['ráno', 'obed', 'poobede', 'večer', 'noc'];
const HEAT_CASTI: HeatmapCellData[] = (() => {
  const r = rng(7);
  return DNI.flatMap((d, i) =>
    CASTI.map((c, j) => ({ row: d, col: c, value: Math.round((i < 5 ? 1 : 0.5) * (j === 3 || j === 4 ? 14 : 5) * (0.4 + r())) })),
  );
})();
const HODINY = Array.from({ length: 24 }, (_, h) => `${h}`);
const HEAT_HODINY: HeatmapCellData[] = (() => {
  const r = rng(24);
  return DNI.flatMap((d) =>
    HODINY.map((h) => {
      const x = Number(h);
      const vaha = x >= 20 || x <= 2 ? 1 : x >= 9 && x <= 17 ? 0.45 : 0.15;
      return { row: d, col: h, value: Math.round(vaha * 12 * r()) };
    }),
  );
})();

export default function TokyKusy() {
  const [bunka, setBunka] = React.useState<HeatmapCellData | null>(null);

  return (
    <div className="flex flex-col gap-16">
      {/* ---------------- funnel-chart ---------------- */}
      <Kus
        id="funnel-chart"
        meno="funnel-chart"
        subor="funnel-chart.tsx"
        veta="Lievik: koľko ľudí prejde z kroku do kroku. Presne tvar ponuky pre maklérov (skóre → zápis → vyšetrenie)."
      >
        <Mriezka className="xl:grid-cols-2">
          <Varianta nazov="Lievik webu" props="data[].fill · showLabels · showTooltip" ukazka>
            <div className="w-[calc(100%-7rem)] [&_svg]:!overflow-visible">
              <FunnelChart data={LIEVIK} ariaLabel="Lievik webu, ukážka" />
            </div>
          </Varianta>
          <Varianta nazov="Sito datasetu" props="2 kroky · height={200}">
            <div className="w-[calc(100%-8.5rem)] [&_svg]:!overflow-visible">
              <FunnelChart data={SITO} height={200} ariaLabel="Trhový dataset: prehľadané weby a weby s textom" />
            </div>
            <SkutocneData zdroj="fakty.ts · 459 → 441" />
          </Varianta>
          <Varianta nazov="Bez popisov, bez tooltipu" props="showLabels={false} · showTooltip={false} · animated={false}" ukazka>
            <FunnelChart data={LIEVIK} showLabels={false} showTooltip={false} animated={false} height={220} ariaLabel="Lievik, ukážka" />
          </Varianta>
          <Varianta nazov="Prázdny" props="data={[]} · emptyState">
            <FunnelChart data={[]} emptyState="Lievik ešte nemá dáta" />
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- sankey-chart ---------------- */}
      <Kus
        id="sankey-chart"
        meno="sankey-chart"
        subor="sankey-chart.tsx"
        veta="Toky medzi stĺpcami: odkiaľ čo prichádza a kam to tečie. Vlastné rozloženie bez knižnice, šírka cez ResizeObserver."
      >
        <Varianta nazov="Prompty: nástroj → projekt → práca" props="nodes · links · node.color · height={360}" ukazka>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <SankeyChart nodes={S_UZLY} links={S_TOKY} height={360} ariaLabel="Toky promptov, ukážka" />
            </div>
          </div>
        </Varianta>
        <Mriezka className="xl:grid-cols-2">
          <Varianta nazov="Sito datasetu" props="3 uzly · height={200}">
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <SankeyChart nodes={SITO_UZLY} links={SITO_TOKY} height={200} ariaLabel="Trhový dataset: sito webov" />
              </div>
            </div>
            <SkutocneData zdroj="fakty.ts · 459 → 441 + 18" />
          </Varianta>
          <Varianta nazov="Bez popisov, bez tooltipu" props="showLabels={false} · showTooltip={false}" ukazka>
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <SankeyChart nodes={S_UZLY} links={S_TOKY} height={200} showLabels={false} showTooltip={false} ariaLabel="Toky promptov, ukážka" />
              </div>
            </div>
          </Varianta>
          <Varianta nazov="Prázdny" props="links={[]}">
            <SankeyChart nodes={S_UZLY} links={[]} emptyState="Žiadne toky" />
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- treemap-chart ---------------- */}
      <Kus
        id="treemap-chart"
        meno="treemap-chart"
        subor="treemap-chart.tsx"
        veta="Plochy podľa veľkosti: kde je najviac práce. Vnorené deti sa kreslia ako menšie dlaždice."
      >
        <Mriezka className="xl:grid-cols-2">
          <Varianta nazov="Vnorený" props="children · height={360}" ukazka>
            <div>
              <TreemapChart data={STROM} height={360} ariaLabel="Slová podľa projektu, ukážka" />
            </div>
          </Varianta>
          <Varianta nazov="Plochý" props="value · height={260}" ukazka>
            <div>
              <TreemapChart data={PLOCHY} height={260} ariaLabel="Slová podľa projektu, ukážka" />
            </div>
          </Varianta>
          <Varianta nazov="Bez tooltipu a animácie" props="showTooltip={false} · animated={false}" ukazka>
            <div>
              <TreemapChart data={PLOCHY} height={200} showTooltip={false} animated={false} ariaLabel="Slová podľa projektu, ukážka" />
            </div>
          </Varianta>
          <Varianta nazov="Prázdny" props="data={[]}">
            <TreemapChart data={[]} emptyState="Nič na rozdelenie" />
          </Varianta>
        </Mriezka>
        <p className="text-sm">
          Farba dlaždice ide z <code>fill</code> v dátach, inak z palety tokenov bez hot; na tmavej dlaždici (ink, stamp) je text papierový.
        </p>
      </Kus>

      {/* ---------------- heatmap-chart ---------------- */}
      <Kus
        id="heatmap-chart"
        meno="heatmap-chart"
        subor="heatmap-chart.tsx"
        veta="Mriežka buniek, farba = hodnota. Kedy píšeš (deň × hodina) aj celý rok po dňoch (pozri Korpus nižšie)."
      >
        <Mriezka className="xl:grid-cols-2">
          <Varianta nazov="Predvolená" props="primary s priesvitnosťou · cellSize=40" ukazka>
            <HeatmapChart data={HEAT_CASTI} rows={DNI} cols={CASTI} ariaLabel="Prompty podľa dňa a časti dňa, ukážka" />
          </Varianta>
          <Varianta nazov="Papier → žltá" props="colorLow · colorHigh" ukazka>
            <HeatmapChart data={HEAT_CASTI} rows={DNI} cols={CASTI} colorLow={FARBA.papier} colorHigh={FARBA.zlta} ariaLabel="Prompty podľa dňa a časti dňa, ukážka" />
          </Varianta>
          <Varianta nazov="Ink → žltá (svieti)" props="colorLow=ink · colorHigh=žltá · na bg-ink" ukazka>
            <div className="rounded-lg bg-ink p-3 text-paper">
              <HeatmapChart data={HEAT_CASTI} rows={DNI} cols={CASTI} colorLow={FARBA.ink} colorHigh={FARBA.zlta} cellSize={36} ariaLabel="Prompty podľa dňa a časti dňa, ukážka" />
            </div>
          </Varianta>
          <Varianta nazov="Klik na bunku" props="onCellClick → role=button, Tab + Enter" ukazka>
            <HeatmapChart
              data={HEAT_CASTI}
              rows={DNI}
              cols={CASTI}
              colorLow={FARBA.biela}
              colorHigh={FARBA.alarm}
              onCellClick={setBunka}
              ariaLabel="Prompty podľa dňa a časti dňa, klikateľné, ukážka"
            />
            <p className="min-h-6 font-mono text-sm" aria-live="polite">
              {bunka ? `Vybrané: ${bunka.row}, ${bunka.col} → ${bunka.value} promptov` : 'Klikni na bunku.'}
            </p>
          </Varianta>
        </Mriezka>
        <Varianta nazov="Deň × hodina, bez popisov" props="24 stĺpcov · cellSize={22} · showLabels={false} · showTooltip={false}" ukazka>
          <HeatmapChart data={HEAT_HODINY} rows={DNI} cols={HODINY} cellSize={22} showLabels={false} showTooltip={false} ariaLabel="Prompty podľa hodiny, ukážka" />
        </Varianta>
        <Mriezka className="xl:grid-cols-2">
          <Varianta nazov="Deň × hodina s popismi" props="cellSize={22} · stĺpce otočené o −45°" ukazka>
            <HeatmapChart data={HEAT_HODINY} rows={DNI} cols={HODINY} cellSize={22} colorLow={FARBA.papier} colorHigh={FARBA.ink} ariaLabel="Prompty podľa hodiny, ukážka" />
          </Varianta>
          <Varianta nazov="Prázdna" props="data={[]} · emptyState">
            <HeatmapChart data={[]} rows={DNI} cols={CASTI} emptyState="Zatiaľ žiadne dni" />
          </Varianta>
        </Mriezka>
        <Podnadpis>Rok po dňoch je v sekcii Korpus — návrh (a)</Podnadpis>
      </Kus>
    </div>
  );
}
