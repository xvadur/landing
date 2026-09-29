# Katalóg · grafy a dáta (29. 9. 2026)

Stránka `/kit/grafy/` (`src/pages/kit/grafy.astro`, noindex, islands full). Ostrovy v `src/components/v7/kit/grafy/`:
`ChartKus.tsx` (chart, chart-toolbar, `client:load`) · `MaleKusy.tsx` (gauge, sparkline, stat-card, progress, math-curve-progress) ·
`KruhoveKusy.tsx` (donut, radar, radial-bar) · `TokyKusy.tsx` (funnel, sankey, treemap, heatmap) · `TabulkyKusy.tsx` (table, data-table) ·
`KorpusNavrh.tsx` (Korpus — návrh) · `spolocne.tsx` (rám kusu, farby z tokenov, ukážková denná rada, `usePulz()`).

Dáta: skutočné sú iba `/pulse.json` (načíta sa po hydratácii, SSR = `ZIVE_CISLA` z fakty.ts) a `fakty.ts` (KORPUS, POSTAVIL,
MARQUEE_FAKTY: 459 → 441 webov, 739 kancelárií, 2 034 maklérov). Všetky denné/týždenné rady sú deterministická ukážka
(`ukazkoveDni()`, seed, tvar pulzu v3 `[dátum, slová, prompty]`, posledných 65 dní aktívnych, aby sedeli so skutočnou sériou) a nesú
badge „ukážkové dáta“. Stupnice „tep dňa 0–150“ a „míľnik 100 dní“ sú dizajnový návrh a na stránke sú tak označené.

Farby: všetko cez `hsl(var(--foreground|secondary|destructive|card|chart-5|muted))` alebo `var(--color-*)`. hot (`--accent`, `--chart-1`)
v dátach nie je nikde; jediný hot na stránke je CTA „Pozri vitálne funkcie“ vo widgete (b).

---

## chart (`chart.tsx`)
- **Čo robí:** obal nad Recharts 3. `ChartContainer` (rám, `--color-<kľúč>` z configu, `role="img"`), `ChartTooltipContent`,
  `ChartLegendContent`, `ChartEmpty`, `ChartLoading`, anotácie, palety.
- **Props/varianty:** `variant` default · elevated · flat · filled · minimal · accent · primary; `loading` + `loadingLabel`;
  config `{ label, color | theme: {light, dark}, icon }`; tooltip `indicator` dot/line/dashed, `hideLabel`, `hideIndicator`,
  `labelFormatter`, `formatter`, `nameKey`, `labelKey`, `color`; legenda `verticalAlign` top/bottom, `hideIcon`, `nameKey`;
  `ChartLoading bars`, `ChartEmpty message`; `renderChartAnnotations([{kind: referenceLine | callout | arrow}])`;
  `CHART_PALETTES` bold/vibrant/pastel/monochrome + `createChartConfig(keys, labels, palette)`.
- **Ukázané:** plocha skladaná, čiara + priemer, stĺpce + čiara (Composed), stĺpce zvislé, vodorovné (skutočný dataset), theme config;
  6 variantov kontajnera; 6 režimov tooltipu (otvorené cez `defaultIndex`); 3 legendy; 3 stavy; anotácie; monochrome + vlastná paleta.
- **Na čo:** dôkaz/čísla Korpusu, stránka štatistík, liečba (pred/po), ponuka pre maklérov (skóre webu v čase).
- **Hriech/Netopier:** Netopier = časová os tvrdení redakcie s callout „overené/vyvrátené“; `theme.dark` na tmavý Netopier.
- **Problémy:**
  1. `chart.tsx:127` — `[&_.recharts-layer_path]:[stroke:hsl(var(--foreground))]` + `stroke-width:3` + `fill-opacity:1` prebije
     **každú** čiaru: Line série sú vždy ink 3 px, farba z configu sa ignoruje, na tmavom podklade čiary zmiznú. Obchádzka na stránke:
     `className` na `<Line>` + `[&_.l-priemer_.recharts-line-curve]:![stroke:var(--color-priemer)]`. Návrh: obmedziť selektor na
     `.recharts-bar-rectangle path, .recharts-sector, .recharts-area-area` a čiary nechať.
  2. `chart.tsx:377` — `toLocaleString()` bez jazyka → „25,200“ (en-US v prehliadači); v tooltipe sa názov a číslo slepia
     („Pracovné dni25,200“) pri úzkom boxe. Návrh: `toLocaleString('sk-SK')` a `gap-3` v riadku.
  3. Palety `bold` (obsahuje accent = hot a 3× žltú), `vibrant`, `pastel` (pevné HSL mimo tokenov) sa nesmú použiť; variant
     `accent` kontajnera má hot tieň. Na stránke vynechané. `monochrome` kroky 1.0/0.8 sú na pohľad rovnaké.
  4. Anotácie sú natvrdo ink (`FOREGROUND`), na ink podklade neviditeľné. Callout šírka odhadnutá `text.length * 7`.
  5. `ChartEmpty` default „No data“ (`:505`), `ChartLoading` „Loading chart“ (`:541`) — anglicky, treba vždy podať text.
  6. Osi dedia `text-xs` bez `font-mono`; na stránke `font-mono` na kontajneri. Os Y potrebuje `tickFormatter` (25k), inak orezáva.
  7. Recharts 3: `Legend verticalAlign` hlási deprecated (astro check warning).

## chart-toolbar (`chart-toolbar.tsx`)
- **Čo robí:** lišta nad grafom: PNG, SVG, CSV (keď má `data`), celá obrazovka (`src/lib/chart-export.ts`).
- **Props:** `data`, `filename`, `png`, `svg`, `fullscreen` (bool, default true).
- **Ukázané:** všetko; iba CSV + fullscreen; iba PNG.
- **Na čo:** stránka štatistík Korpusu (stiahni si moje dáta), Netopier (export grafu do článku v Hriechu).
- **Problémy:** tlačidlá `h-8 w-8` (`:55` ďalej) = 32 px < 44 px cieľ; `aria-label`/`title` anglicky; lišta je `absolute` cez graf —
  kontajner potrebuje `pt-14`. SVG export na grafoch z `<div>` (heatmap) nemá čo exportovať.

## gauge-chart (`gauge-chart.tsx`)
- **Čo robí:** budík (SVG) s pásmami, ručičkou alebo oblúkom, `role="meter"`.
- **Props:** `variant` semicircle · full · meter; `size` sm · md · lg; `value`, `min`, `max`, `zones[{from,to,color,label}]`,
  `label`, `valueFormatter`, `showTicks`, `animated`.
- **Ukázané:** 3 × 3 mriežka (séria 65 zo pulzu), „tep dňa“ (prompty dnes na 0–150, pásma pokoj/záťaž/tachykardia),
  full bez ryšiek (projekty 6 z 10), naživo so Sliderom + bez animácie.
- **Na čo:** hero/bio „vitálne funkcie“, skóre webu (/skore) ako tlakomer, vyšetrenie.
- **Hriech/Netopier:** „teplomer manipulácie“ článku, dôveryhodnosť redakcie.
- **Problémy:** hodnota je na `centerY + 20` (`:344`) — pri ručičke sa prekrýva s čapom, pri `full` sedí cez ručičku;
  `sm` semicircle má výšku 90 (`:107`) a popis sa oreže; číslo `min` vľavo sa na okraji oreže; ručička má rozmazaný
  `drop-shadow` s rgba (`:298`) — zákon chce tvrdé tiene; `label` pásiem sa nikde nekreslí. Predvolené pásma: destructive/warning/success
  = alarm/žltá/žltá.

## sparkline (`sparkline.tsx`)
- **Čo robí:** mini graf bez osí (Recharts), `role="img"` so zhrnutím.
- **Props:** `type` line · area · bar; `trend` up · down · neutral (farba success/destructive/primary); `color`, `height`,
  `width` (číslo alebo CSS), `showEndDot`, `strokeWidth`, `animated`, `ariaLabel`; prázdne `data` = prerušovaná čiara.
- **Ukázané:** 3 × 3 tabuľka type × trend, koncová bodka, vlastná farba a šírka, bez animácie, na ink, v riadku textu, prázdna.
- **Na čo:** widget do hero (30 dní slov), stat-card, riadok v bio, zoznam textov (čítanosť).
- **Problémy:** koreň je `<div>` → vnútri `<p>` rozbije hydratáciu (React #418, overené, na stránke opravené obalom `div`).
  `trend="up"` = žltá čiara na bielom má takmer nulový kontrast; na ink svieti. `showEndDot` pre `bar` nefunguje.

## stat-card (`stat-card.tsx`)
- **Čo robí:** karta s číslom, zmenou a trendom, ikonou, voliteľným progresom.
- **Props:** `variant` default · compact · large (md:col-span-2); `colorScheme` primary · secondary · accent · success · warning · info ·
  destructive (+ zastaraný `color`); `title`, `value`, `change`, `trend`, `icon`, `progress {value, label}`, `comparison`.
- **Ukázané:** 4 skutočné čísla pulzu + Korpus celkom (large); mriežka variant × trend × schéma (ukážka). accent vynechaný.
- **Na čo:** pás „vitálnych funkcií“, bio, dôkaz, stránka štatistík.
- **Problémy:** `colorScheme="primary"`: ikona ink na ink pozadí (`:97` `text-foreground`) — neviditeľná; obchádzka
  `icon={<X className="text-paper" />}`. `comparison` default „vs last month“ (`:61`), progress default „Progress“ (`:108`) — anglicky.
  `trend="up"` text = `text-success` = žltá na bielom, nečitateľné. success = warning = secondary = žltá, info = biela.

## progress (`progress.tsx`)
- **Čo robí:** Radix progress, brutálny pruh.
- **Props:** `variant` smooth · stepped (steps(10)) · marquee (neurčitý); `value`, `max` (správne preráta %).
- **Ukázané:** všetky 3, tlačidlá 0/33/65/100, séria k míľniku 100, `max=200`, výšky a farby cez `[&>div]:bg-*`.
- **Na čo:** séria dní, viackrokový zápis, načítavanie pulzu, kohorta (koľko miest ostáva).
- **Problémy:** farba indikátora ide len cez `[&>div]:bg-…` (žiadny prop). Tieň 4px natvrdo, na mobile ok.

## math-curve-progress (`math-curve-progress.tsx`)
- **Čo robí:** štvorček putuje po krivke (SVG, `role="progressbar"`).
- **Props:** `curve` spiral · heart · lissajous · cardioid · rose · astroid · superellipse · deltoid · nephroid; `size` sm · md · lg;
  `value`, `showValue`, `trackColor`, `fillColor`, `strokeWidth`.
- **Ukázané:** všetkých 9 kriviek s prepínačom hodnoty, veľkosti, farby a hrúbky, na ink.
- **Na čo:** srdce = séria dní v bio („cesta k 100“), načítavanie, hry.
- **Problémy:** chýba vyplnená stopa — vidno len polohu hlavičky, nie „koľko je hotovo“; pri `heart` 0 % a 100 % sú na tom istom
  mieste. Stopa je `currentColor` s 20 % → treba nastaviť `text-*` na rodičovi.

## donut-chart (`donut-chart.tsx`)
- **Props:** `data[{name,value,fill}]`, `config`, `innerRadius`, `outerRadius`, `centerContent` (+ `DonutChartCenter {value,label}`),
  `showLabels` none · inside · outside, `variant` default · separated, `showTooltip`, `animated`, `emptyState`.
- **Ukázané:** 441 z 459 webov (skutočné) so stredom, popisy vonku/vnútri, oddelené, plný koláč, tenký prstenec, prázdne.
- **Na čo:** podiel (kam idú prompty, sito datasetu), ponuka (čas v konzultácii).
- **Problémy:** bez `fill` berie `--chart-1` = hot (`:91`). Popisy `outside/inside` majú farbu výseku → žltý/biely text na papieri
  nečitateľný.

## radar-chart (`radar-chart.tsx`)
- **Props:** `data[{subject, …}]`, `dataKeys`, `config`, `variant` default · filled · outlined, `showLegend`, `showGrid`, `showTooltip`,
  `fillOpacity`, `animated`, `emptyState`.
- **Ukázané:** 3 varianty, bez mriežky a legendy, priesvitnosť, prázdne (týždenný rytmus, ukážka).
- **Na čo:** rytmus písania podľa dňa, profil klienta pri vyšetrení (7 oblastí práce).
- **Problémy:** `default` a `filled` majú identický kód (`:69–82`). Pri default/filled je `stroke` ink, legenda berie farbu zo stroke →
  všetky štvorčeky v legende sú čierne. Popisy osi polomeru sa prekrývajú (6000 / 5351). Poradie `dataKeys` = poradie kreslenia (svetlá séria navrch).

## radial-bar-chart (`radial-bar-chart.tsx`)
- **Props:** `data`, `config`, `variant` default · stacked · nested, `innerRadius`, `outerRadius`, `showLabel`, `showBackground`,
  `showLegend`, `showTooltip`, `startAngle`, `endAngle`, `animated`, `maxValue`, `emptyState`.
- **Ukázané:** 3 varianty, polkruh 180→0, bez pozadia a popisov, prsteň série (65 zo 100, skutočné).
- **Na čo:** prsteň série v bio/hero, aktívne dni po mesiacoch.
- **Problémy:** `stacked` s jedným `<RadialBar>` nič neskladá (`:113`), `nested` mení len `barSize` → vizuálne takmer totožné s default.
  Popis hodnoty je ink → na ink oblúku neviditeľný. Bez `fill` hot (`:69`).

## funnel-chart (`funnel-chart.tsx`)
- **Props:** `data[{name,value,fill}]`, `showLabels`, `showTooltip`, `animated`, `height`, `ariaLabel`, `emptyState`.
- **Ukázané:** lievik webu (ukážka), sito 459 → 441 (skutočné), bez popisov, prázdny.
- **Na čo:** lievik pre maklérov (skóre → zápis → vyšetrenie → liečba), zber e-mailov.
- **Problémy:** popisy `position="right"` od pravého okraja lichobežníka → pri širokom prvom kroku idú mimo SVG a orežú sa. Obchádzka:
  obal `w-[calc(100%-7rem)] [&_svg]:!overflow-visible`. Paleta bez `fill` obsahuje accent = hot (`:26`). Písmo `'DM Mono'` natvrdo (nie je v repe → fallback).

## sankey-chart (`sankey-chart.tsx`)
- **Props:** `nodes[{id,label,color}]`, `links[{source,target,value}]`, `height`, `showTooltip`, `showLabels`, `ariaLabel`, `emptyState`;
  vlastné rozloženie, ResizeObserver, sr-only tabuľka tokov (dobré a11y).
- **Ukázané:** 3 stĺpce nástroj → projekt → práca (ukážka), sito datasetu (skutočné), bez popisov, prázdny.
- **Na čo:** kam tečie práca, Netopier (redakcia → autor → tvrdenie), trhový dataset (weby → bloky).
- **Problémy:** padding 120 px vľavo aj vpravo (`:65`) → na 343 px zostane 87 px, musí byť v `overflow-x-auto` s `min-w-[640px]`;
  popisy stredného stĺpca kreslí doprava cez toky; tooltip iba myšou; bez `color` paleta s hot (`:31`). Tooltip tieň ink natvrdo.

## treemap-chart (`treemap-chart.tsx`)
- **Props:** `data[{name,value,children}]`, `showTooltip`, `animated`, `height`, `ariaLabel`, `emptyState`.
- **Ukázané:** vnorený, plochý, bez tooltipu a animácie, prázdny.
- **Na čo:** kde je najviac práce (slová podľa projektu), Hriech (témy článkov podľa rozsahu).
- **Problémy:** `fill` v dátach sa **ignoruje**, farba ide z `NEUBRUTALISM_COLORS[(depth*7+index)%6]` (`:47`) a obsahuje accent = hot
  aj primary = ink (ink text na ink dlaždici). Obchádzka: obal s `[&_rect[style*=accent]]:!fill-white [&_rect[style*=primary]]:!fill-paper`.
  Návrh: `const fill = props.fill ?? …`. Čísla `toLocaleString()` bez jazyka (38,000).

## heatmap-chart (`heatmap-chart.tsx`)
- **Props:** `data[{row,col,value}]`, `rows`, `cols`, `colorLow`, `colorHigh` (color-mix, funguje s tokenmi), `showLabels`, `showTooltip`,
  `cellSize`, `ariaLabel`, `onCellClick` (bunky dostanú `role=button`, Tab, Enter/Space), `emptyState`.
- **Ukázané:** predvolená (primary s priesvitnosťou), papier → žltá, ink → žltá na ink, klik na bunku, deň × hodina bez aj s popismi,
  prázdna, a v Korpuse 53 × 7.
- **Na čo:** kalendár aktívnych dní Korpusu, kedy píšem (deň × hodina), obsadenosť termínov vyšetrenia.
- **Hriech/Netopier:** mapa redakcia × téma, koľko tvrdení overených.
- **Problémy:** lineárna stupnica min→max, žiadne kvantované úrovne (GitHub má 5); bunky mimo dát (pred prvým dňom) = 0, nedá sa
  povedať „prázdne“; stĺpcové popisy otočené −45° sa pri `cellSize < 30` prekrývajú → pre 53 týždňov treba `showLabels={false}` a
  vlastný riadok mesiacov; tooltip hodnotu nijako neformátuje; kľúč stĺpca = text popisu (musí byť unikátny); písmo `'DM Mono'`.

## table (`table.tsx`)
- **Props:** Table, TableHeader, TableBody, TableFooter, TableRow (`data-state=selected`), TableHead, TableCell, TableCaption; obal `overflow-auto`.
- **Ukázané:** vitálne funkcie (pulz + fakty, s pätičkou a popisom), hustá pruhovaná s vybraným riadkom (Čo som postavil).
- **Na čo:** chorobopis v číslach, cenník, porovnanie pred/po.
- **Problémy:** vybraný riadok `data-[state=selected]:bg-accent` (`:60`) = hot; na stránke `className="data-[state=selected]:bg-yellow"`.

## data-table (`data-table.tsx`)
- **Props:** `columns`, `data`, `enableSorting`, `enableFiltering`, `enableColumnVisibility`, `enableRowSelection`, `enablePagination`,
  `pageSize`, `pageSizeOptions`, `filterColumn`, `filterPlaceholder`, `emptyMessage`, `isLoading`, `onRowSelectionChange`;
  exporty `DataTableColumnHeader`, `DataTableToolbar`, `DataTablePagination`, `useDataTable`.
- **Ukázané:** všetko zapnuté (8 projektov z fakty.ts, pageSize 5, výber riadkov s výpisom), holá, načítavanie, prázdna.
- **Na čo:** stránka štatistík (dni Korpusu), archív textov, zoznam projektov, admin leadov.
- **Problémy:** natvrdo anglicky: „Columns“ (`:128`), „row(s) selected“ (`:171`), „Rows per page“ (`:177`), „Page x of y“,
  „Previous“/„Next“ (`:207`, `:215`), default „Filter...“ a „No results.“. Výber stĺpcov ukazuje `column.id` (kľúč), nie titulok.
  Vybraný riadok = hot (cez TableRow); obchádzka `[&_tr[data-state=selected]]:bg-yellow` na obale. Toolbar a stránkovanie (`space-x-6`, bez wrapu) sa na 375 px nezmestia →
  na stránke je celá tabuľka v `overflow-x-auto` s `min-w-[640px]`.

---

## Korpus — návrh (sekcia `#korpus`)
Skutočné: `words_month`, `prompts_today`, `streak_days`, `projects_active`, `updated_at` z `/pulse.json`; `KORPUS` (572 469 slov,
7 869 promptov, od januára 2026) z fakty.ts. Pozn.: „800 000+ slov“ z Adamovho zadania v repe nie je, na stránke je 572 469 (fakty.ts).
Kontrakt dát nadväzuje na `work/v7/KORPUS_DATA.md` (pulz v3).

### (a) Kalendár aktívnych dní — `#korpus-a`
53 × 7 heatmapa na ink (color-mix papier 12 % → žltá), riadok mesiacov, súhrn (aktívne dni, slová za rok — ukážka; séria a prompty dnes —
skutočné), klik na deň → detail, na mobile sa posunie na najnovšie týždne, bunka 15 px / 19 px od 1024 px. Srdce stránky `/vitalne/`.
```json
{
  "updated_at": "2026-09-29T18:00:00Z",
  "streak_days": 65,
  "prompts_today": 88,
  "days": [["2025-09-30", 5120, 41], ["2025-10-01", 0, 0]]
}
```
`days` = presne 365 dní od najstaršieho, dátum v Europe/Bratislava, neaktívny deň = nuly (nie chýbajúci riadok). Súčty počíta web.

### (b) Svietiaci widget do hero — `#korpus-b`
Tri veľkosti: karta (prompty dnes, séria, sparkline 30 dní, slová dnes, CTA hot „Pozri vitálne funkcie“), pilulka pod motto
(prompty · séria · 14 stĺpčekov), nálepka 12 týždňov (mini heatmapa). Všetko je odkaz na štatistiky.
```json
{
  "updated_at": "2026-09-29T18:00:00Z",
  "prompts_today": 88,
  "streak_days": 65,
  "words_today": 4210,
  "words_month": 138927,
  "spark_words": [5120, 0, 3890]
}
```
`words_today` dnes v pulse.json chýba (na stránke ukážka). `spark_words` = 30 čísel od najstaršieho; ak príde `days`, web si ho odreže sám.

### (c) Bio: anamnéza s tepom — `#korpus-c`
Veta + 2 stat-card (Korpus celkom, tento mesiac) + gauge „tep dňa“ (prompty dnes, 0–150, pásma návrh) + radial prsteň série k 100.
Ide hneď z dnešných dát, bez dennej rady.
```json
{
  "prompts_today": 88,
  "streak_days": 65,
  "streak_best": 65,
  "words_month": 138927,
  "projects_active": 6,
  "words_total": 572469,
  "prompts_total": 7869,
  "since": "2026-01-01"
}
```
`streak_best`, `words_total`, `prompts_total`, `since` sú voliteľné (dnes ručne v fakty.ts `KORPUS`).

### (d) EKG písania — `#korpus-d`
Denné slová za 90 dní ako krivka na monitore (ink, žltá, mriežka EKG papiera), čiara priemeru, značka začiatku série (skutočná dĺžka
zo pulzu), bodka dneška, tooltip. Recharts priamo, nie `ChartContainer` (ten farbí čiary a osi na ink).
```json
{ "updated_at": "2026-09-29T18:00:00Z", "streak_days": 65, "days": [["2026-07-01", 5120, 41]] }
```
Stačí 90 dní, ideálne zdieľaná 365-dňová rada z (a).

**Odporúčanie:** hero = pilulka (b) pod mottom + karta (b) na desktope pri fotke; bio = (c); `/vitalne/` = (a) navrchu, (d) pod ním,
data-table dní a toolbar s CSV. Všetko čaká na `days` v pulze v3 (démon adam.xvadur).

---

## Overenie (29. 9. 2026)
- `npx astro build --outDir dist-kit-grafy` OK.
- `astro check`: v mojich súboroch 0 chýb (1 varovanie: `Legend verticalAlign` deprecated v Recharts 3). 9 chýb v repe patrí
  iným skupinám (`kit/prekrytia`, `kit/tvary`).
- Playwright 1440×900 a 375×812: `scrollWidth − innerWidth` = 0, chyby konzoly/pageerror = 0 (po oprave `<p>` so sparkline).
  Screenshoty `work/screens/kit-grafy-{d,m}.png`.
