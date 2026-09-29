# V7 · Opravy stavebnice pri zdroji (29. 9. 2026)

Zdroj chýb: `formulare.md`, `grafy.md`, `prekrytia.md`, `rozlozenie.md`, `tvary.md`, `vendor.md` (sekcie „problémy“).
Kusy v `src/components/ui/` teraz fungujú bez obchádzok; katalógové obchádzky v `src/components/v7/kit/**` a
`src/pages/kit/*.astro` sú odstránené a texty katalógu opisujú nový stav. Hranaté rohy BoldKitu **nemenené** (rozhodne Adam, pozri koniec).

## 1. Farby (hot iba na CTA a X, text na hot vždy ink, bez pastelov)

| Čo | Súbor | Oprava |
|---|---|---|
| `text-accent-foreground` bolo paper na hot (3,2 : 1) | `src/styles/boldkit.css` `@theme` | `--color-accent-foreground: var(--color-ink)`; tokens.css netreba meniť (boldkit.css ho prepíše) |
| **Neobrutalism `theme.css` prepisoval v `:root` `--background/--foreground/--border/--ring/--chart-*` farbou** → `hsl(var(--foreground))` v BoldKite bolo neplatné na každej stránke s neobrutalism kusom (domov, /konzultacia/, /kviz/, /kit/vendor/) | `src/components/vendor/neobrutalism/theme.css` | kolidujúce (nepoužívané) premenné a pastelové `--chart-*` odstránené; nič iné ich nečítalo |
| Overlay `bg-black/70` neexistuje (tokens resetujú `--color-*`) → dialógy, sheety, zásuvky a tour boli bez stmavenia | dialog, alert-dialog, sheet, drawer, tour | `bg-overlay` (token ink 80 %) |
| Grafy: `--chart-1` = hot ako predvolená séria | boldkit.css | chart-1 ink, 2 žltá, 3 stamp, 4 biela, 5 sivá (HSL aj `--color-chart-*`) |
| Stav výberu/fokusu = hot | accordion (open), dropdown/context-menu/menubar/select (fokus, open), navigation-menu, sidebar (active), tree-view, table/data-table (selected), tag-input návrh, combobox čip, calendar today + range_middle, date-range predvoľba | `bg-secondary` (žltá) + `text-secondary-foreground` (ink) |
| Palety grafov s hot a pevnými HSL (`bold`, `vibrant`, `pastel`), variant kontajnera `accent` s hot tieňom | chart.tsx | palety iba z tokenov (bez hot a pastelov, kľúče ostali kvôli API); `accent` = žltá plocha s ink tieňom; monochrome 1 / .7 / .5 / .35 / .2 / .1 |
| Treemap / funnel / sankey palety s hot | treemap-chart, funnel-chart, sankey-chart | palety z tokenov bez hot |
| ASCII `multicolor` (biela a žltá na papieri) | ascii-shapes.tsx | ink, stamp, ink, sivá |
| Tvary: východzia `text-accent` (hot) pri 10 tvaroch | shapes.tsx | `text-secondary` (žltá) |
| Sticker `default` = hot, `neon` = hex `#ff2d78`, páska hot, tiene `colored/double` = ink | sticker.tsx | default žltá, nový `accent` (hot + ink), `neon` = token hot, páska žltá, tiene žlté |
| StickyNote mená nesedeli (yellow = hot, pink = ink …) | sticker.tsx | varianty `yellow, white, paper, ink, accent` (pastelové mená zrušené; katalóg prepísaný) |
| empty-state predvoľba „Čoskoro“ = hot | empty-state.tsx | `secondary` |
| Site Toaster pastely (`bg-lime/sky/pink`), error hot | `src/components/site/Toaster.tsx` | success žltá, info biela, warning biela so stamp okrajom, error stamp + paper, loading biela |
| Vendor: Stepper hotový `bg-lime`, aktívny hot | reactbits/Stepper.tsx | hotový žltý, aktívny ink + paper |
| Vendor: confetti `TOKEN_COLORS` s pastelmi, terminál `bg-lime-deep`, input/textarea `aria-invalid:bg-pink` | magicui/confetti, magicui/terminal, neobrutalism/input + textarea | žltá/hot/žltá-deep; biela bodka; chyba = stamp rám + stamp tieň na bielej |
| Vendor predvolené hot: Progress `tone`, ScrollProgress `color`, ClickSpark `sparkColor`, Tabs `line` linka | neobrutalism/progress, magicui/scroll-progress, reactbits/ClickSpark, neobrutalism/tabs | yellow, ink, ink, ink (živé stránky posielajú farbu explicitne, nemení sa) |
| Radio: bodka ink na ink | radio-group.tsx | bodka `fill-primary-foreground` (papier) |
| stat-card: ikona ink na ink pri `primary`, trend up žltý na bielom | stat-card.tsx | ikona paper pri primary/destructive; up = ink, down = stamp |
| sparkline: trend up žltá čiara | sparkline.tsx | up ink, down stamp, neutral sivá |
| Hex v `ui/` | | žiadna hex farba (jediné výskyty sú selektory na predvolené atribúty Recharts `[stroke="#ccc"]` v chart.tsx); žiadne `bg-lime/pink/sky/lilac` |

## 2. Animácie

| Čo | Súbor | Oprava |
|---|---|---|
| tw-animate-css nebol importovaný (animate-in/out, fade/zoom/slide-in-from-*, accordion-*, collapsible-*, caret-blink) | boldkit.css | `@import 'tw-animate-css'` (je v package.json) |
| `@keyframes brutal-pulse/bounce/shake/wiggle/pop` (button `animation`), `brutal-dots/bars/blocks/shadow-spin` (spinner) | motion.css | doplnené |
| `fadeIn / bounceIn / scaleIn` (empty-state) | motion.css | doplnené |
| Plynulé animácie tvarov `shape-animate-{spin,pulse,float,wiggle,bounce,glitch}[-slow|-fast]` | motion.css | doplnené (prenesené zo záplaty `tvary.astro`, záplata zmazaná) |
| Marquee: `animate-marquee-slow/-fast` neexistovali, slučka poskočila o pol medzery | marquee.tsx + motion.css | vlastné `bk-marquee` (posun −100 % − medzera, medzera aj medzi stopami), rýchlosť = násobok `--marquee-duration` (slow 4×, normal 2×, fast 0,8×), pauza hover/focus na celom páse |
| `bk-interactive` nebolo definované (hover „zatlačenie“ bol skok) | motion.css (`@layer components`) | prechod translate/transform/box-shadow/farby, `--bk-dur-snap` + `--bk-ease-snap` |
| `bk-pulse-shadow` ::after so z-index −1 (neviditeľný / prekrýval obsah) | motion.css | animácia `box-shadow` priamo na prvku |
| Stepper `animate-[slide-in-from-bottom…]` (keyframes neexistujú) | stepper.tsx | `animate-in fade-in-0 slide-in-from-bottom-2` |
| Spinner `blocks` bez rozmeru, `brutal` tieň ink na ink | spinner.tsx | obal má rozmer, tieň žltý; `steps()` pohyb |
| `--bk-*` easingy/trvania dvakrát (boldkit `@theme` + motion `:root`) | boldkit.css | ostal jediný zdroj `motion.css :where(:root)` |
| boldkit.css prepisoval Tailwind `--ease-in/-out/-in-out` a `--default-transition-timing-function` pre celý web | boldkit.css | odstránené (pomenované krivky `--ease-out-quart` … ostali). Domov sa tým vrátil na predvoľbu ako na `main` |
| Dialog/alert-dialog: `slide-in-from-left-1/2 / top-[48%]` sa v TW4 skladalo s translate → okno letelo z rohu | dialog, alert-dialog | iba fade + zoom |
| Reduced motion | motion.css | slučky (tvary, marquee, spinner/button brutal-*, pulse-shadow) stoja; vstupy dobehnú za 120 ms cez globálny guard; `bk-interactive` iba farby. Slider: bez pružiny (jazdec ide rovno na cieľ) |

## 3. Sonner
`src/components/ui/sonner.tsx`: `unstyled: true` + triedy z tokenov (štýl sa naozaj prejaví, sonner CSS mimo @layer už nevyhráva),
žiadny `useTheme` (funguje bez ThemeProvider, `theme="light"`), zlúčenie vlastných `toastOptions.classNames`. success žltá, warning
biela s 12 px stamp okrajom, error stamp + paper, info papier; tlačidlá akcie 44 px. Overené v prehliadači (farby, rám 3 px, rohy 0).

## 4. Funkčné chyby

| Kus | Oprava |
|---|---|
| checkbox | `indeterminate` = pomlčka (Minus), fajka iba pri checked |
| stepper | `useId()` prefix pre `trigger/panel` id (viac stepperov na stránke), Slovenské StepperActions, separátory na mobile užšie |
| multi-step-form | `goTo` dopredu overí každý preskočený krok a zastaví na prvom neplatnom; `next/goTo/submit` vracajú `boolean`; `submit` overí všetky kroky |
| date-picker | `locale` (predvolene sk), `calendarProps` (disabled dni, startMonth, weekStartsOn…), `defaultMonth` = vybraný deň, formát `d. MMMM yyyy` |
| date-range-picker | `locale`, `dateFormat`, `presetsLabel`, slovenské predvoľby, šírka panela 11 rem |
| time-picker | prvý klik na hodinu bez hodnoty = celá hodina (:00); predvolene 24h; `labels`; stĺpce 44 px; po otvorení skok na vybranú/prvú povolenú hodnotu; **popover sa rozťahoval na celú šírku okna** (pevné stĺpce `w-20`) |
| calendar | predvolene `locale = sk` (pondelok prvý), Chevron hore/dole pre dropdown, štýl dropdownu mesiaca/roka, dni 44 px (v úzkom rodičovi sa zúžia na 36 px, výška ostáva), **šípky navigácie boli `absolute` voči stránke** (na kraji okna) → `months` je `relative` |
| chart.tsx (r. 127) | ink obrys a plná výplň iba pre stĺpce, výseky a plochy; čiary (Line) si nechávajú farbu série; tooltip `toLocaleString('sk-SK')` + medzera; legenda berie farbu zo série v configu |
| treemap | `fill` z dát má prednosť; na tmavej dlaždici (ink, stamp) papierový text; `sk-SK` čísla; font `var(--font-mono)` (namiesto neexistujúceho DM Mono aj v heatmap/sankey/funnel) |
| gauge | hodnota a popis pod čapom (neprekrývajú ručičku), výška SVG sa dopočíta (sm sa neoreže), min/max pod koncami oblúka, tvrdý tieň ručičky bez rgba, slovenské pásma |
| sparkline | koreň `<span>` (dá sa vložiť do `<p>`), graf sa vykreslí po hydratácii → bez React #418 |
| radar | `default` = obrys vo farbe série + priesvitná plocha; `filled` = plná plocha s ink obrysom (predtým identické) |
| radial-bar | číslo s papierovým lemom (čitateľné aj na ink oblúku) |
| donut | popisy ink (na tmavom výseku papier), vnútri v strede prstenca |
| command | predvolený filter bez diakritiky (`commandFilterSk`, cmdk skóre nad NFD textom); `CommandDialog` má `commandProps` (filter, loop, shouldFilter …) a `className`, na mobile 16 px okraje a výška do spodku obrazovky; položky 44 px |
| dialog / alert-dialog / sheet | na mobile `w-[calc(100%-2rem)]`, `max-h` + scroll; krížik 36 px s plochou 44 px, `closeLabel` („Zavrieť“), `hideClose`; hlavička dialógu nechá miesto pre krížik |
| hover-card | cez `Portal`, `collisionPadding` 16, `max-w` do šírky okna |
| popover | `collisionPadding` 16 (na mobile ostane okraj) |
| sidebar | `TooltipProvider` vnútri SidebarProvider (tooltip nepadá), skratka ignoruje textové polia a dá sa vypnúť `keyboardShortcut={false}`, aktívna položka žltá, Toggle `aria-label` sk + 44 px |
| drawer | `DrawerClose` zavrie aj pri `dismissible={false}` (Drawer drží stav/kontrolovaný open a zavrie cez kontext); `shouldScaleBackground` predvolene false |
| accordion | trigger nenafúkne globálne `h3` z global.css (Header má `font-sans text-base font-normal`) |
| tree-view | klik na rodiča pri výbere vyberie a rozbalí, nezbalí (zbalí šípka alebo ←); riadky 44 px |
| tour | reflektor = jeden obdĺžnik s tieňom v tokene overlay (predtým „+“ z dvoch gradientov), `labels` (sk), okno `max-w` do šírky okna, krížik 44 px |
| rating | náhľad pri hoveri, slovenské aria („Hodnotenie: 3 z 5“, 1 hviezdička / 2–4 hviezdičky / 5 hviezdičiek) |
| slider | `getValueText` (predvolene „6 z 20“), reduced motion bez pružiny |
| toLocaleString bez jazyka | chart, treemap, funnel, sankey → `'sk-SK'`; dropzone veľkosti s čiarkou |
| shapes | `ScribbleUnderline` nepúšťa `filled/strokeColor` do DOM, `strokeWidth - 1` nikdy záporné |
| input-otp | medzera medzi slotmi (tiene sa neprekrývajú), `caret-blink` z tw-animate-css |
| input / textarea | `aria-invalid` = stamp rám a stamp tieň |
| vendor DecryptedText | server a hydratácia = čistý text, `initialEncrypted` zamieša po mount-e (bez React #418) |
| vendor NumberTicker | obal `inline-block` → medzera v `prefix/suffix` ostane |
| vendor Stepper | obsah kroku dedí padding z `contentClassName` (`padding: inherit`) |
| Lenis vs. rolovacie zoznamy | `src/components/site/Smooth.tsx`: `prevent` pre `[data-radix-popper-content-wrapper]`, `[data-radix-scroll-area-viewport]`, `[cmdk-list]`, `[role=listbox|menu|dialog|alertdialog]`, `[data-vaul-drawer]`, `[data-sonner-toaster]` |

## 5. Slovenčina (predvolené texty, všetky sa dajú prepísať propom)
data-table (`labels`: Stĺpce, Vybraté x z y, Riadkov na stranu, Strana x z y, Späť/Ďalej, Filtrovať…, Žiadne výsledky.; výber stĺpcov ukazuje
`meta.label`/header namiesto id; lišta a stránkovanie sa zalomia na 375 px) · pagination (Späť/Ďalej cez `label`, aria, „Ďalšie strany“,
`disabled`) · carousel (Karusel, Predchádzajúca/Nasledujúca snímka cez `label`, bodky `getLabel`) · sidebar · breadcrumb („Ďalšie“) ·
empty-state (všetkých 14 predvolieb) · tour (`labels`) · tag-input (`messages`, „Pridaj štítok…“) · dropzone (`messages`) · date-picker,
date-range-picker, time-picker · combobox („Vyber…“, „Odobrať“) · rating · slider · stat-card („oproti minulému mesiacu“, „Priebeh“,
„42 %“) · chart (Žiadne dáta, Graf sa načítava) · chart-toolbar aria · dialog/sheet („Zavrieť“) · spinner a math-curve-loader
(„Načítava sa“) · gauge, heatmap, sankey (hlavička tabuľky), treemap, funnel (aria) · command dialog (Paleta príkazov).

## 6. Ciele ≥ 44 px
button `sm` a toggle `sm` (plocha cez `::before`), toggle default 44, checkbox/radio (plocha 50 px), switch, tabs trigger, menu položky
(dropdown, context, menubar, select, command, sidebar, tree-view), navigation-menu trigger, stepper triggery a akcie, karusel šípky 44 px
(na mobile vnútri karuselu, od `sm` vedľa) a bodky 44 × 44, dialog/sheet/tour/toast krížik, chart-toolbar, calendar dni a šípky, time-picker
riadky, date-range predvoľby, alert akcia, data-table tlačidlá a filter, rating (plocha 44 × 44 cez `::before`, vizuál sa nemení),
tag-input a FileList „odobrať“.

## 7. Katalóg: odstránené obchádzky
- `src/pages/kit/tvary.astro`: záplata CSS (tvary, spinner keyframes, marquee slow/fast) + trieda `kit-zaplata`.
- `src/pages/kit/prekrytia.astro`: CSS, ktoré skrývalo anglické tlačidlá tour.
- formulare: `KitToaster` bez ThemeProvider a vlastných tried, `useLenisPrevent`, `KAL_OPRAVA`, `DROPDOWN_OPRAVA` + `Sipka`,
  `POLOZKA` (select), `text-ink` na accent, radio `bg-white` prebitie, time-picker zarovnanie v onChange; červené štítky „pozor“ opravených chýb.
- prekrytia: dva toastery (pôvodný vs. oprava) → jeden, `POLOZKA` fokus, `MOBIL` (dialóg), `[&>button:last-child]:hidden` → `hideClose`,
  `filterSk` → predvolený filter, tour recept s vlastnými tlačidlami → `labels`, drawer „Rozumiem“ cez `DrawerClose`.
- rozlozenie: accordion `bg-yellow` + `text-base`, `TooltipProvider` okolo sidebaru, sidebar/menubar/navigation-menu žlté triedy a `min-h-11`,
  strom `min-h-11` + `bg-accent→yellow`, alert akcia `min-h-11`.
- grafy: `OPRAVA_CIAR`, `TREEMAP_OPRAVA`, `OPRAVA_VYBER`, `text-paper` na ikonách stat-card.
- tvary: `spinnerOprava` + prepínač, texty „záplata“.
- vendor: DecryptedText sa už nevykresľuje až po mount-e, `<Step className="px-5">`.
Ostali zámerné dizajnové triedy (napr. karusel so šípkami pod sebou `static`, žltá aktívna záložka ako variant).

## 8. Ostáva (a prečo)
- **Hranaté rohy BoldKitu vs. `rounded-lg` zo zákona** — nemenené, rozhodne Adam (hranatý kit ako odlíšenie od V5.4, alebo `rounded-lg` do kusov).
- **Focus ring = hot** (`--ring`, `ring-ring`) — nechané: zhoduje sa s globálnym `:focus-visible` outline v `global.css` (živý web). Ak má hot
  ostať iba na CTA a X, treba zmeniť oba naraz (global.css je mimo tohto zadania).
- `layered-card layerColor="accent"`, `stat-card colorScheme="accent"`, `badge/button variant="accent"`, `Stamp accent` — hot ostáva ako
  **explicitná** voľba (s ink textom), nie predvolená.
- Nie v zozname priorít: badge/avatar hover posun aj na neklikateľnom, `card role="article"`, skeleton rám 2 px, math-curve-background a
  -loader rAF aj mimo obrazovky, ASCII 3D tvary malé v `sm/md`, anotácie grafov natvrdo ink, heatmap bez kvantovaných úrovní, sankey
  padding 120 px, radial `stacked/nested` takmer ako default, `showEndDot` pri bar sparkline, drawer úchyt nie je `Drawer.Handle`,
  vaul `NestedRoot` neexportovaný, `SelectLabel pl-8`, uppercase natvrdo (label, native-select, tag-input štítky, input-group addon),
  `InputGroupInput text-sm` (iOS zoom), `md:text-sm` v inpute, menubar trigger 36 px (lišta 50 px), resizable rukoväť, breadcrumb odkazy bez
  44 px výšky, slider bez `name`/skrytého inputu, rating polovičky iba klávesnicou, time-picker kombinácia min/max s minútou ticho neprejde,
  `CardTitle`/`TimelineTitle` sú h3 (display písmo z global.css — veľkosť drží trieda), `Reveal` pred hydratáciou `opacity: 0`,
  `useViewTransition` animuje celú stránku. Vendor mimo „jasných chýb“ (ScrambledText slová, Gravity decomp, ShineBorder, MorphingDialog) — nemenené.
- Domov na statickom serveri hlási 404 `/api/terminy/` (Worker route, rovnaké pred aj po; na `wrangler dev` nie je).

## Overenie (29. 9. 2026)
- `npm run check`: 0 chýb, 0 varovaní · `node --test tests/*.*`: 23/23 · `npm run build`: prešiel.
- Playwright (`node work/qa/serve.mjs 4190 dist/client`, skript v scratchpade, `sessionStorage.opona=1`), 1440 aj 375 px, celá stránka
  prejdená (hydratácia `client:visible`): `/`, `/v7-kit/`, `/kit/formulare/`, `/kit/grafy/`, `/kit/tvary/`, `/kit/rozlozenie/`,
  `/kit/prekrytia/`, `/kit/vendor/` → pretečenie 0, pageerror 0, chyby konzoly 0 (okrem `/` : 404 `/api/terminy/`, rovnaké v stave pred opravou).
- Interakcie: toasty (success žltá, error stamp, rám 3 px, rohy 0), dropdown fokus = žltá s ink textom a výška 44 px, tour so slovenskými
  tlačidlami a obdĺžnikovým reflektorom, paleta nájde „Škrtací test“ na „skrtaci“, dialóg na 375 px 16/16 px okraje so scrollom a overlayom,
  `DrawerClose` zavrie nezatvárateľnú zásuvku, time-picker prvý klik na 15 = 15:00.
- Domov pred/po (`dist-pred` vs `dist`, 1440 a 375): rovnaká výška a počet prvkov; vypočítané farby, tiene, písmo a rámy všetkých 962 prvkov
  zhodné, jediný rozdiel `transition-timing-function` pri 11 prvkoch (Tailwind predvoľba namiesto BoldKit prepisu = stav ako na `main`).
