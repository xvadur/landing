# Katalóg · Rozloženie a navigácia (29. 9. 2026)

Stránka `/kit/rozlozenie/` (`src/pages/kit/rozlozenie.astro`, noindex, islands="full"), ostrovy v
`src/components/v7/kit/rozlozenie/`: `Kontajnery.tsx` (client:load), `Karusel.tsx`, `Navigacia.tsx`, `Drobnosti.tsx`,
`ReceptyBio.tsx`, `ReceptyProjekty.tsx` (client:visible), spoločné `Kus.tsx` (rám ukážky) a `data.ts` (bio a projekty).
21 kusov, 78 buniek s variantmi (v nich ~150 variantov a stavov), 4 recepty bio a 2 recepty projektov.

Obsah: `src/data/cesta.ts`, `src/components/v54/Anamneza.astro` (citáty doslovne), `src/data/fakty.ts` (DOKAZY,
PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, KORPUS, ZIVE_CISLA, VYSLEDKY), `src/data/ponuka.ts`. Žiadne ukážkové čísla nie sú
potrebné (preto ani badge „ukážkové dáta“ na stránke nie je).

## Bio: zastávky a otvorené otázky pre Adama
Poradie podľa zadania: elektrotechnická (Bratislava) → viera v Boha (2017) → nemocnica, urgentný príjem → psychológia →
odchod → AI → agenti → XVADUR. `data.ts → BIO`.
- **Bez textu na webe** (badge „text doplní Adam“, žiadny detail navyše): elektrotechnická, viera v Boha, psychológia.
  Pri elektrotechnickej a psychológii nie je ani rok (na karte „—“).
- **Rozpor s cesta.ts:** komentár v `src/data/cesta.ts` hovorí „bez viet, ktoré znižujú (maturita, viera)“ a STATUS
  zamietol „vety, ktoré znižujú (Biblia)“. Nové zadanie vieru do bio pridáva → treba Adamovo potvrdenie, či viera ide na web.
- **Odchod:** zadanie hovorí „odchod 07/2025“, web (cesta.ts) „Jún 2025 · Vyhodili ma“, fakty.ts ROZPOR 3 (posledný deň
  1. 7. 2025). Ukážky držia dnešné znenie webu.
- **Rola a dĺžka:** zadanie „10 rokov zdravotná sestra na urgentnom príjme“; web „10 rokov · Nemocnica“, fakty.ts ROZPOR 1
  a 2 (necelých 8 rokov, PPVZ/sanitár). Ukážky: nadpis „Nemocnica“, podnázov „urgentný príjem“ (z Adamovho zadania), text z cesta.ts.
- „AI, agenti, XVADUR (asi 2 roky)“: na webe AI = 2025, agenti = 2026, XVADUR od marca 2026 — nechané tak.

## Kusy

### card (`card.tsx`)
- **Čo robí:** doska s rámom 3 px a tieňom 4/4, Header (čiara dole), Title (h3), Description, Content, Footer (čiara hore, bg-muted/50).
- **Props:** `interactive` (hover/active posun o 4 px a zmiznutie tieňa), `role` (predvolene `article`), všetko ostatné cez className.
- **Ukázané:** holá, plná skladba s CTA, interactive (role=link, tabIndex), bg-yellow, bg-ink, rounded-lg + shadow-brutal.
- **Na web:** ponuka (produkty), chorobopisy, zastávky bio, vyšetrenie.
- **Hriech/Netopier:** karta článku / karta tvrdenia s pätičkou „overené / neoverené“.
- **Problémy:** `role="article"` natvrdo ako predvolené (card.tsx:7) — mriežka 20 kariet = 20 článkov pre čítačku; pri
  dekoratívnej doske daj `role={undefined}`/`"group"`. Bez `rounded` (zákon webu chce rounded-lg) → className. CardTitle je h3,
  dedí Bricolage z global.css (dobré), ale veľkosť drží `text-xl`.

### accordion (`accordion.tsx`)
- **Čo robí:** Radix Accordion; položky s rámom a tieňom, trigger s chevronom.
- **Props:** `type="single" | "multiple"`, `collapsible`, `value/defaultValue/onValueChange`, `disabled` (celý aj položka),
  `orientation`, `dir`.
- **Ukázané:** single+collapsible kontrolovaný, multiple s defaultValue a disabled, pôvodný vzhľad (hot), bez tieňa s medzerami.
- **Na web:** FAQ, liečba 01–03, detail chorobopisu (recept 05), „čo mal / čo dostal“.
- **Hriech/Netopier:** rozbalenie dôkazov k tvrdeniu, zdroje pod článkom.
- **Problémy:**
  1. Open stav `[&[data-state=open]]:bg-accent` (accordion.tsx:28) = **hot** → porušuje „hot iba CTA“. Obídené className `[&[data-state=open]]:bg-yellow`. Návrh: v kuse `bg-secondary`.
  2. Radix obalí trigger do `<h3>`; `global.css:63–74` dáva h3 display font a `--text-display-xs` → trigger má obrie
     písmo. Obídené `text-base` na triggeri. Návrh: v accordion.tsx pridať `text-base` do triggera (alebo `AccordionPrimitive.Header className="flex text-base"`).
  3. `animate-accordion-down/up` (accordion.tsx:46) sa neskompilujú — `tw-animate-css` je v node_modules, ale nie je
     importovaný v `src/styles/` → otvára sa bez animácie. Návrh: `@import 'tw-animate-css';` v boldkit.css alebo vlastné keyframes.

### collapsible (`collapsible.tsx`)
- **Čo robí:** Radix Collapsible, jeden blok, šípka v triggeri sa otočí (`[&[data-state=open]>svg]:rotate-180`).
- **Props:** `open/defaultOpen/onOpenChange`, `disabled`, Trigger `asChild`.
- **Ukázané:** nekontrolované s Button asChild, defaultOpen, kontrolované + disabled.
- **Na web:** citát pri zastávke, „celý záznam“ (recept 06), dovetok Anamnézy.
- **Hriech/Netopier:** „ukáž prepis“ pod citátom politika.
- **Problémy:** rovnaké neskompilované `animate-collapsible-*` (collapsible.tsx:29).

### tabs (`tabs.tsx`)
- **Čo robí:** Radix Tabs; List s rámom a tieňom, aktívna záložka bg-primary (ink) s rámom.
- **Props:** `value/defaultValue/onValueChange`, `orientation` (horizontal/vertical), `activationMode` (automatic/manual), `dir`, Trigger `disabled`.
- **Ukázané:** vodorovne, s ikonami + disabled + grid na celú šírku + aktívna žltá, zvisle (flex-col), manual.
- **Na web:** kapitoly bio (recept 03), prepínač pacientov (recept 05), liečba.
- **Hriech/Netopier:** redakcie ako záložky, „tvrdenie / dôkaz / verdikt“.
- **Problémy:** List má `h-12` a triggre `py-1.5` → ciele ≈ 38 px; na mobile pridaj `min-h-11`. `justify-center` +
  `inline-flex` pri zvislej orientácii treba prepísať (`h-auto flex-col`). Veľa záložiek na 375 px → obal `overflow-x-auto`.

### separator (`separator.tsx`)
- **Čo robí:** Radix Separator, 3 px ink.
- **Props:** `orientation`, `decorative` (true = bez role).
- **Ukázané:** vodorovne, zvislo v páse čísel, decorative={false} + stamp 6 px s textom, prerušovaný, žltý na tmavom.
- **Na web:** pás čísel (Vitálne), rytmus v bio, riadky čísel v spise.
- **Hriech/Netopier:** „✚ záznam“ oddeľovač medzi časťami textu.
- **Problémy:** žiadne. Zvislý potrebuje rodiča s výškou.

### aspect-ratio (`aspect-ratio.tsx`)
- **Čo robí:** holý Radix AspectRatio (bez štýlu).
- **Props:** `ratio`.
- **Ukázané:** 16/9 (Hriech), 4/3 (Lucia), 1, 3/4 (Adam), 21/9 typografický panel (Korpus), 9/16 miesto na video.
- **Na web:** obrázky chorobopisov, portrét v bio, miesta pre Higgsfield video (druhé kolo).
- **Hriech/Netopier:** náhľady článkov a snímky obrazovky.
- **Problémy:** žiadne; rám a tieň treba dať na obal.

### scroll-area (`scroll-area.tsx`)
- **Čo robí:** Radix ScrollArea, štvorcový čierny palec 12 px.
- **Props:** Root `type` (auto/always/scroll/hover), `scrollHideDelay`, `dir`; `ScrollBar orientation`.
- **Ukázané:** zvislý záznam cesty, vodorovný pás výsledkov, `type="always"` so žltým palcom na tmavom.
- **Na web:** register spisov (recept 06), pás čísel, dlhý záznam v karte.
- **Hriech/Netopier:** zoznam 558 ľudí v mape, prepisy.
- **Problémy:** farba palca nemá prop (ScrollAreaThumb bez className, scroll-area.tsx ~39) → prepis selektorom
  `[&_[data-orientation=vertical]>div]:bg-yellow`. Vodorovný posuvník treba pridať ručne ako dieťa.

### resizable (`resizable.tsx`)
- **Čo robí:** react-resizable-panels 2: PanelGroup, Panel, Handle (3 px čiara, voliteľná rukoväť).
- **Props:** Group `direction`, `autoSaveId`, `onLayout`; Panel `defaultSize`, `minSize`, `maxSize`, `collapsible`, `collapsedSize`, `order`; Handle `withHandle`, `disabled`.
- **Ukázané:** vodorovne „Mal / Dostal“, zvislo, vnorené + zbaliteľný register.
- **Na web:** „pred a po“ (Jakub), porovnanie verzií webu.
- **Hriech/Netopier:** článok vs. zdroj vedľa seba, editor prepisov.
- **Problémy:** rukoväť 12×24 px — na dotyk malá (a11y); na mobile skôr nepoužívať. Zvislá rukoväť otáča ikonu cez `[&[data-panel-group-direction=vertical]>div]:rotate-90` — funguje.

### carousel (`carousel.tsx`)
- **Čo robí:** Embla 8 + kontext; šípky, bodky, ←/→ z klávesnice (neberie ich formulárom).
- **Props:** `opts` (loop, align, dragFree, containScroll, …), `plugins`, `orientation`, `setApi`; export `useCarousel`, `CarouselDots`.
- **Ukázané:** predvolený + bodky, loop + align start + basis-4/5, setApi (počítadlo 01/09 a skok), vertikálny, dragFree + basis-auto.
- **Na web:** vodorovná cesta (recept 02), chorobopisy na mobile, pás výsledkov.
- **Hriech/Netopier:** galéria titulných strán, časová os kauzy.
- **Problémy:**
  1. Šípky sú `absolute -left-12 / -right-12` (carousel.tsx:236) a 40 px → na mobile mimo obrazovky a pod 44 px. Obídené `static translate-x-0 translate-y-0 h-11 w-11`.
  2. Bodky 12×12 px (carousel.tsx:302) — ciele pod 44 px; aria-label po anglicky „Go to slide…“.
  3. `aria-label="Carousel"`, „Previous slide / Next slide“ natvrdo po anglicky (carousel.tsx:165 a sr-only texty) — dá sa prepísať propom `aria-label`, sr-only text nie.
  4. Autoplay plugin nie je nainštalovaný (embla-carousel-autoplay chýba).

### sidebar (`sidebar.tsx`)
- **Čo robí:** Provider so stavom (expanded/collapsed, cookie `sidebar:state`), pod 768 px Sheet, Ctrl/⌘+B.
- **Props:** Provider `defaultOpen/open/onOpenChange`; Sidebar `collapsible` (icon/none/hidden), `side` (left/right);
  Item `variant` (default/active), `icon`, `tooltip`; Toggle, Header, Content, Footer, Group, GroupLabel, Separator, Inset; hook `useSidebar`.
- **Ukázané:** jeden živý panel s prepínačmi collapsible × side, aktívna položka, tooltip v zbalenom stave, disabled, Sheet na mobile.
- **Na web:** kit/katalóg, texty (zoznam článkov), osobný dashboard.
- **Hriech/Netopier:** hlavná navigácia Netopiera (redakcie, ľudia, tvrdenia).
- **Problémy:**
  1. `SidebarItem tooltip` používa Radix Tooltip (sidebar.tsx:385), ktorý **hodí chybu bez `TooltipProvider`** — kus ho nemá. Ukážka obalená `TooltipProvider`.
  2. Skratka Ctrl/⌘+B je na `window` (sidebar.tsx:117) → dva Provideri na stránke sa prepnú naraz; tiež koliduje s „bold“ v textových poliach.
  3. `min-h-screen` na obale (sidebar.tsx:148) → v ukážke prepísané `h-[440px] min-h-0`.
  4. Aktívna položka `bg-accent` (= hot) → prepísané na žltú.
  5. `side="right"` mení len rám; poradie v DOM treba otočiť rodičom (`flex-row-reverse`).
  6. Na mobile Sheet ignoruje `collapsible`; zavrieť tlačidlo je `sr-only „Close“`, `Toggle Sidebar` po anglicky.

### navigation-menu (`navigation-menu.tsx`)
- **Čo robí:** Radix NavigationMenu bez viewportu: panel sa kreslí priamo pod položkou; hover aj klik, šípky.
- **Props:** Root `value/defaultValue/onValueChange`, `orientation`, `delayDuration`, `skipDelayDuration`; Item `value`;
  Trigger `disabled`; `navigationMenuTriggerStyle()` pre obyčajné odkazy; Indicator.
- **Ukázané:** defaultValue="liecba" (otvorený panel s produktmi), panel so zoznamom cesty, odkaz, disabled, zvislá orientácia.
- **Na web:** hlavička ekosystému (xvadur.com / Hriech / Netopier), ponuka v menu.
- **Hriech/Netopier:** „Redakcie ▾“ s mriežkou 10 redakcií.
- **Problémy:** open/focus `bg-accent text-accent-foreground` (navigation-menu.tsx:45) = hot s **paper** textom (tokens.css:65
  prebíja HSL ink z boldkit.css:87) → porušuje „text na hot je ink“. V ukážke Liečba prepísaná na žltú, Anamnéza ostala
  pôvodná na porovnanie. Absolútny panel na mobile prekryje zalomené položky pod ním. Trigger `h-10` < 44 px.

### menubar (`menubar.tsx`)
- **Čo robí:** Radix Menubar s portálovými menu.
- **Props:** Root `value/defaultValue/onValueChange`, `loop`; Item `inset`, `disabled`, `onSelect`; CheckboxItem `checked/onCheckedChange`; RadioGroup/RadioItem; Sub/SubTrigger/SubContent; Label, Separator, Group, Shortcut.
- **Ukázané:** všetky časti; checkboxy a rádio sú kontrolované a vypisujú stav.
- **Na web:** hry (menu hry), „operačný systém“ labáku.
- **Hriech/Netopier:** pracovná lišta editora Netopiera (Súbor/Zobraziť/Overiť).
- **Problémy:** focus/open `bg-accent text-accent-foreground` (menubar.tsx:34, 51, 107, 123, 146) = hot + paper text. Lišta `h-10`, položky `py-1.5` < 44 px; na mobile obal `overflow-x-auto`, `h-auto`, `min-h-11`.

### breadcrumb (`breadcrumb.tsx`)
- **Čo robí:** nav > ol s oddeľovačmi.
- **Props:** Link `asChild`; Separator `children` (vlastný oddeľovač); Ellipsis; Page (`aria-current="page"`).
- **Ukázané:** predvolený, `/` + výpustka, „mini-príbeh“ cez asChild s ✚ oddeľovačom; v recepte 02 ako navigátor karuselu.
- **Na web:** texty, chorobopisy, spis (recept 06), bio ako jedna veta.
- **Hriech/Netopier:** cesta Redakcia › Autor › Článok.
- **Problémy:** `BreadcrumbLink` pridáva `font-medium`; pri `asChild` Slot triedy len spája (bez tailwind-merge), takže
  vlastná váha prehrá → treba `font-extrabold!`. Ellipsis sr-only „More“ po anglicky (breadcrumb.tsx:101). Odkazy nemajú výšku 44 px.

### pagination (`pagination.tsx`)
- **Čo robí:** nav > ul z `buttonVariants` (outline / default pri `isActive`).
- **Props:** Link `isActive`, `size` (sm/default/lg/icon); Previous/Next; Ellipsis.
- **Ukázané:** pôvodné Previous/Next, všetky veľkosti, slovenská náhrada so stavom (listuje cestou), kompaktná verzia v recepte 06.
- **Na web:** texty, spisy, listovanie príbehu.
- **Hriech/Netopier:** stránkovanie 59 stránok Hriechu.
- **Problémy:** texty „Previous/Next“ a aria-label „Go to previous page“ natvrdo (pagination.tsx:72, 87) → náhrada cez `PaginationLink size="default"`. Kus nemá disabled stav (treba `aria-disabled` + `pointer-events-none`).

### timeline (`timeline.tsx`)
- **Čo robí:** skladačka: Timeline (orientation), Item (status), Dot (status × size), Connector (status), Content, Header, Title, Description, Time, Card.
- **Props:** `orientation` vertical/horizontal; `status` completed (žltá) / current (ink, scale-110) / upcoming (muted); Dot `size` sm/md/lg; Connector upcoming = prerušovaná.
- **Ukázané:** zvislá cesta so stavmi, tri veľkosti bodky s TimelineCard, vodorovná osem zastávok s badge „text doplní Adam“, recept 01.
- **Na web:** bio (srdce príbehu), postup liečby, história verzií.
- **Hriech/Netopier:** chronológia kauzy, kedy kto čo povedal.
- **Problémy:** spojnica má `ml-[14px]` (timeline.tsx:126) = stred iba pre Dot `md` → pre sm `ml-[10.5px]`, pre lg
  `ml-[18.5px]`. Rozloženie bodky so spojnicou si skladáš sám (kus nemá „rail“). TimelineTitle je h3 (display font z global.css).

### tree-view (`tree-view.tsx`)
- **Čo robí:** ARIA strom (jedna Tab zastávka, ↑↓ Home End ← →), výber, zaškrtávanie (kreslené), ikony.
- **Props:** `data: TreeNode[]` (id, label, icon, children, disabled), `selectionMode` none/single/multiple, `showCheckboxes`,
  `showIcons`, `expandedIds/defaultExpandedIds/onExpandedChange`, `selectedIds/defaultSelectedIds/onSelectedChange`.
- **Ukázané:** ekosystém XVADUR (none + disabled), single kontrolovaný s tlačidlami, multiple s checkboxmi bez ikon, recept 04.
- **Na web:** mapa ekosystému, strom rozhodnutí v bio, register.
- **Hriech/Netopier:** strom redakcia → ľudia → tvrdenia.
- **Problémy:** riadok `py-1.5` ≈ 32 px (tree-view.tsx:322) → obídené `[&_[role=treeitem]>div:first-child]:min-h-11`.
  Výber `bg-accent` = hot → prepísané na žltú. Klik na rodiča zároveň vyberie **aj zbalí** (tree-view.tsx:312) — v recepte 04
  je strom stále rozbalený. Riadok nemá className prop.

### avatar (`avatar.tsx`)
- **Čo robí:** Radix Avatar, štvorec 40 px s rámom a tieňom, fallback kým sa obrázok nenačíta.
- **Props:** Image `src/alt/onLoadingStatusChange`, Fallback `delayMs`; veľkosť a tvar cez className.
- **Ukázané:** tri veľkosti s fotkou (výrez tváre z hero-adam.webp), fallback J/L/X, okrúhla skupina s presahom, autor + rola.
- **Na web:** hlavička bio (recept 01), autor textu, pacienti.
- **Hriech/Netopier:** fotky redaktorov v mape.
- **Problémy:** hover posun o 4 px (avatar.tsx:12) aj keď avatar nie je klikateľný → `hover:translate-x-0 hover:translate-y-0`. Výrez tváre z širokej fotky len cez `scale` + `origin`.

### badge (`badge.tsx`)
- **Čo robí:** štítok s tieňom, 8 variantov.
- **Props:** `variant` default/secondary/accent/destructive/success/warning/info/outline; `badgeVariants()` na iné prvky.
- **Ukázané:** všetky varianty, stavy chorobopisov, štítky dôkazov, odkaz s badgeVariants (44 px), veľký badge s číslom Korpusu.
- **Na web:** stav projektu, „text doplní Adam“, „ukážkové dáta“, štítky.
- **Hriech/Netopier:** verdikt tvrdenia (pravda / zavádzajúce).
- **Problémy:** secondary = success = warning (všetko žltá), info ≈ outline (biela) → reálne 4 farby. `accent` = hot s
  paper textom (tokens.css:65). Hover posun (badge.tsx:6) aj na neklikateľnom štítku.

### kbd (`kbd.tsx`)
- **Čo robí:** klávesa; KbdCombo skladá viac kláves s oddeľovačom.
- **Props:** `variant` default/outline/ghost, `size` sm/md/lg; KbdCombo `keys`, `separator`.
- **Ukázané:** mriežka 3 × 3, kombinácie ⌘K, Ctrl B, „G potom T“, šípky.
- **Na web:** nápoveda k ⌘K, hry, ovládanie karuselu a stromu.
- **Hriech/Netopier:** skratky v editore Netopiera.
- **Problémy:** žiadne. `ghost/sm` je veľmi malé (10 px).

### alert (`alert.tsx`)
- **Čo robí:** hlásenie s rámom, ikonou (svg sa automaticky odsadí), nadpisom a akciou.
- **Props:** `variant` default/destructive/success/warning/info; AlertAction `loading`, `disabled`.
- **Ukázané:** všetkých 5 variantov, akcia, loading, disabled, tmavá cez className.
- **Na web:** stav rezervácie (obsadený termín, zapísané), „pred vydaním“ (Jakub), snímka pulzu.
- **Hriech/Netopier:** „toto tvrdenie bolo opravené“.
- **Problémy:** success = warning (žltá), info ≈ default. Vstupná animácia `animate-in fade-in-0 slide-in-from-top-2`
  (alert.tsx:6) sa neskompiluje (tw-animate-css nie je importovaný). AlertAction `py-1` < 44 px → `min-h-11`. `role="alert"` natvrdo aj pri statickom texte.

### empty-state (`empty-state.tsx`)
- **Čo robí:** prázdny stav zo skladačky (Icon, Illustration, Title, Description, Actions) alebo 14 predvolieb.
- **Props:** `variant` default/filled/card, `size` compact/sm/md/lg, `layout` vertical/horizontal, `animation` none/fadeIn/bounce/scale;
  Icon `iconColor` × 8, `size` xs–xl, `iconSize`; Preset `preset`, `customTitle`, `customDescription`, `customIcon`, `illustration`, `action`.
- **Ukázané:** všetky varianty, veľkosti ikon, 8 farieb, 14 predvolieb so slovenskými titulkami, coming-soon s akciou.
- **Na web:** „čoskoro“ (Senior atlas, gramata), prázdna čakáreň, chyba formulára.
- **Hriech/Netopier:** „k tomuto tvrdeniu zatiaľ nemáme dôkaz“.
- **Problémy:** texty predvolieb po anglicky (empty-state.tsx:275+) → vždy `customTitle/customDescription`. Animácie
  `fadeIn/bounceIn/scaleIn` (empty-state.tsx:46) nemajú `@keyframes` v projekte → nič sa nehýbe. iconColor `accent` = hot s paper textom.

## Recepty
**Bio (`ReceptyBio.tsx`):**
1. **Zvislá os záznamov** — timeline (Dot lg, TimelineCard) + sticky bočný stĺpec s avatarom, citátom a nálepkou „10 rokov pri lôžku“. Najbližšie k dnešnej Anamnéze, najčitateľnejšie na mobile.
2. **Vodorovná cesta** — carousel s obrími kartami (názov cez container query `11cqi`), breadcrumb ako mapa/navigátor, pás priebehu. Tmavé pozadie, pohyb do strán ako aiaktivista.
3. **Vrstvy života** — tabs (Základ / Služba / Stavba) + layered-card; počet vrstiev rastie s kapitolou.
4. **Strom rozhodnutí** — tree-view (psychológia ako bočná vetva nemocnice) + karta detailu s „ďalej: …“.

**Projekty (`ReceptyProjekty.tsx`):**
5. **Chorobopisy v záložkách** — tabs + aspect-ratio + accordion (diagnóza / liečba / čísla / stav) + odkaz s overeným 200.
6. **Spis s registrom** — breadcrumb + scroll-area (mobil vodorovne, desktop zvislo) + card + separator + collapsible + pagination.

## Súhrn problémov v kusoch (na opravu v `src/components/ui/` alebo v tokenoch)
1. **accent-foreground:** `tokens.css:65` `--color-accent-foreground: var(--color-paper)` vs. `boldkit.css:87` ink →
   `text-accent-foreground` = paper na hot (3,2 : 1). Oprava: v boldkit.css `@theme { --color-accent-foreground: var(--color-ink); }`.
2. **Hot ako stav výberu:** accordion open, navigation-menu/menubar focus a open, sidebar active, tree-view selected,
   layered-card `layerColor="accent"` → všetko bg-accent. Oprava: v týchto kusoch `bg-secondary` (žltá) namiesto `bg-accent`.
3. **tw-animate-css nie je importovaný** → `animate-in/out`, `fade-*`, `slide-in-*`, `zoom-*`, `animate-accordion-*`,
   `animate-collapsible-*` sú prázdne (overené v skompilovanom CSS). Chýbajú aj `@keyframes fadeIn/bounceIn/scaleIn` (empty-state) a `brutal-*` (button animation).
4. **global.css h3** mení veľkosť Radix Accordion triggera (a každého h3 bez vlastnej veľkosti).
5. **Tooltip bez Providera** v SidebarItem hodí chybu.
6. **Angličtina natvrdo:** pagination Previous/Next, carousel aria-labely, sidebar „Toggle Sidebar“, breadcrumb „More“, empty-state predvoľby.
7. **Ciele < 44 px:** tabs, carousel šípky (40) a bodky (12), tree riadky (32), menubar, navigation-menu (40), alert action, breadcrumb odkazy, resizable rukoväť.
8. **Hover posun na neklikateľných** badge a avatar.
9. **Hranaté rohy** vs. zákon `rounded-lg`: BoldKit je všade bez rádiusu; rozhodnúť, či kit ostane hranatý (odlíšenie od V5.4) alebo dostane `rounded-lg` v kusoch.

## Top objavy
1. **Timeline je skladačka**, nie hotový zoznam → z tých istých dielov vznikne zvislá os, vodorovná cesta aj „rail“ s kartami.
2. **Breadcrumb ako rozprávač:** osem zastávok v jednej vete s ✚ a zároveň navigátor karuselu (recept 02).
3. **Tree-view má plnú ARIA klávesnicu** (jedna Tab zastávka, Home/End, ←/→) — strom rozhodnutí je prístupný bez práce navyše.
4. **Carousel `setApi`** dáva celé Embla API: vlastné počítadlá, pás priebehu, skok z omrviniek; `dragFree` + `basis-auto` = pás čísel ťahaný prstom.
5. **Sidebar sa na mobile sám mení na Sheet** a pamätá si stav v cookie; NavigationMenu `defaultValue` otvorí panel bez kliknutia (dobré na ukážky a hero).

## Overenie (29. 9. 2026)
- `npx astro build --outDir dist-kit-rozlozenie` prešiel.
- `npx astro check`: 0 chýb v `src/components/v7/kit/rozlozenie/` a `src/pages/kit/rozlozenie.astro`.
- Playwright 1440×900 a 375×812: `scrollWidth - innerWidth = 0`, 0 chýb konzoly a pageerror, 0 HTTP ≥ 400; interakcie
  (menubar, sidebar toggle + tooltip, strom, karusel, záložky, spis, collapsible, alert loading) bez chýb.
- Screenshoty: `work/screens/kit-rozlozenie-d.png`, `work/screens/kit-rozlozenie-m.png`.
