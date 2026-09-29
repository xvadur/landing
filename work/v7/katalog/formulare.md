# V7 · Katalóg · Formuláre a rezervácia (29. 9. 2026)

Stránka `/kit/formulare/` (noindex, `islands="full"`) → `src/pages/kit/formulare.astro`.
Komponenty `src/components/v7/kit/formulare/`:
`Spolocne.tsx` (rámy Kus/Mriezka/Bunka/Recept/Stav, toaster katalógu, `KAL_OPRAVA`, `useKlient`, Lenis háčik) ·
`Tlacidla.tsx` (button, button-group, toggle, toggle-group; `client:load`, nesie toaster) · `Vstupy.tsx` (input, input-group, input-otp, textarea, field, label) ·
`Volby.tsx` (checkbox, radio-group, switch, slider, rating) · `Vybery.tsx` (select, native-select, combobox, tag-input) ·
`Subory.tsx` (dropzone + FileList) · `Cas.tsx` (calendar, date-picker, date-range-picker, time-picker) · `Kroky.tsx` (stepper, multi-step-form) ·
`Vysetrenie.tsx` (kombinovaná ukážka rezervácie, bez API).

26 kusov, ~170 variantov/stavov v mriežkach, 22 receptov s Adamovým obsahom + 1 kombinovaná ukážka.
Obsah: `v5/Konzultacia.astro`, `v5/Rezervacia.tsx`, `konzultacia/data.ts` (PRIEBEH, RIESENIA, VSTUP_TEXT), `data/ponuka.ts`, `data/cesta.ts`, `data/terminy.ts`, `v54/Nastroje.astro`. Žiadne čísla mimo pravidiel termínov; ukážky, ktoré nič neodosielajú, majú `<Badge>`.

## Spoločné zistenia (platia pre viac kusov)

1. **`text-accent-foreground` = paper na hot.** `tokens.css` má `--color-accent-foreground: var(--color-paper)`, `boldkit.css` ho v `@theme` neprepisuje (iba HSL `--accent-foreground` v `:root`). Overené v prehliadači: `Button variant="accent"` bez opravy = paper na `#ed4e26` (3,2 : 1, porušenie zákona). Týka sa: button accent, badge accent, calendar `today` a `range_middle`, select položka vo fokuse (`focus:bg-accent`), date-range-picker vybraná predvoľba, combobox čip (bg-accent). **Oprava:** do `@theme` v `src/styles/boldkit.css` pridať `--color-accent-foreground: var(--color-ink);`. Potom sa dá zmazať `text-ink` obchádzka v ukážkach.
2. **Chýbajúce keyframes a utility.** V buildnutom CSS nie je `@keyframes brutal-pulse|bounce|shake|wiggle|pop|dots`, `caret-blink`, `slide-in-from-bottom`, trieda `bk-interactive`, ani `tw-animate-css` (`animate-in`, `fade-in-0`, `zoom-in-95`…; balík je v node_modules, ale nie je importovaný). Dôsledok: Button `animation` nič nerobí, Spinner dots stojí, kurzor v InputOTP nebliká, StepperContent nevchádza, popovery sa otvárajú bez prechodu, hover „zatlačenie“ tlačidiel je skok (bez `transition`). **Oprava:** v `motion.css` doplniť keyframes brutal-* a `.bk-interactive { transition: translate, box-shadow, background-color var(--bk-dur-snap) var(--bk-ease-snap) }`, `@import 'tw-animate-css'` (alebo mapovať na `nb-*` ako vendor neobrutalism). Všetko s `prefers-reduced-motion` → 120 ms fade.
3. **`ui/sonner.tsx` v Tailwinde 4 nevyzerá ako BoldKit.** Triedy `group-[.toaster]:…` sú v `@layer utilities`, sonner vkladá svoje CSS mimo vrstiev → vyhrá sonner (toast je biely zaoblený predvolený). Navyše `useTheme()` hodí chybu bez `ThemeProvider`. Obchádzka v `Spolocne.tsx`: `ThemeProvider` + `toastOptions={{ unstyled: true, classNames }}` v tokenoch. **Oprava:** v `sonner.tsx` pridať `unstyled: true` a triedy bez `group-[.toaster]`; `useTheme` nahradiť pevným `theme="light"` (web je light only).
4. **Dva toastery naraz.** Base (`islands` full/lite) montuje site Toaster (`site/Toaster.tsx`, ten má pastely `bg-lime/sky/pink` pre success/info/warning — porušenie V5.3). Katalóg preto používa `toasterId: 'kit-formulare'` (sonner 2 filtruje: Toaster s `id` ukáže iba svoje, bez id iba toasty bez `toasterId`). **Oprava site Toasteru:** success `bg-yellow`, info `bg-white`, warning `bg-yellow`, error `bg-stamp text-paper`.
5. **Lenis vs. Radix portály.** Popover/select/combobox/time-picker sú portálované do `body`, Lenis (`Smooth.tsx`) im zoberie koliesko. Obchádzka: `MutationObserver` v `Spolocne.tsx` pridá `data-lenis-prevent` každému `[data-radix-popper-content-wrapper]`. Patrí to do `site/Smooth.tsx` (`prevent: (el) => el.closest('[data-radix-popper-content-wrapper]')`).
6. **Hranaté rohy.** BoldKit kusy nemajú `rounded-*`, zákon dizajnu hovorí `rounded-lg`. Na stránke to spolu s v5 prvkami (zaoblené) pôsobí ako dva systémy. Rozhodnúť: buď `rounded-lg` do kusov, alebo priznať hranatý BoldKit.
7. **Anglické texty natvrdo** (placeholdre, hlášky, aria): date-picker, date-range-picker, time-picker, dropzone, tag-input, combobox, rating, slider, stepper. Kde je prop, ukážky ho prepisujú; kde nie je, je to v zozname nižšie.
8. **Ciele < 44 px:** button sm 36, toggle default 40 / sm 36, checkbox a radio 20, switch 28, calendar deň 36 a šípky 28, time-picker riadky ~30, rating ikony 16–32, FileList odobrať 32. Recept: celý riadok ako `<Label className="min-h-11 …">`.
9. **Dátum v statickom HTML.** Ostrovy s „dnes“ (kalendáre, vyšetrenie, FileList) sa vykreslia až po hydratácii (`useKlient`), inak nesedí SSR z času buildu s prehliadačom.

## Kus po kuse

### button — `ui/button.tsx`
- Čo robí: tlačidlo s tvrdým tieňom, hover/active ho zatlačí (translate 4 px, tieň 0).
- Props: `variant` default · secondary (žltá) · accent (hot) · destructive (stamp) · outline · ghost · link · noShadow · reverse (tieň sa objaví pri hoveri, prvok vyskočí) · `size` sm 36 · default 44 · lg 48 · xl 56 · icon 44×44 · `animation` none · pulse · bounce (trvalé) · shake · wiggle · pop (hover) · `asChild` (Slot, napr. `<a>`) · všetky button atribúty.
- Potreby webu: CTA vyšetrenia (accent+ink, xl), navigácia, hry (reverse = „vyskoč“), zápis.
- Hriech/Netopier: reverse ako „odhaľ“ tlačidlo pri tvrdení; destructive = „nepravda“ pečiatka.
- Problémy: accent text paper (bod 1); animation bez keyframes (bod 2); `bk-interactive` neexistuje; sm < 44 px; loading stav chýba (skladá sa `Loader2 animate-spin` + `disabled`).

### button-group — `ui/button-group.tsx`
- Spojí deti do jedného bloku (-3 px margin, jeden tieň, deťom vypne tieň a translate). `orientation` horizontal | vertical.
- Potreby: segmentová navigácia sekcií (Príjem · Diagnóza · Liečba), počítadlo (− n +), stránkovanie textov.
- Hriech: prepínač „Médium A | B | C“.
- Problémy: nemá stav „vybraté“ (na prepínanie toggle-group); dlhý rad pretečie na mobile → `overflow-x-auto`.

### toggle — `ui/toggle.tsx`
- Radix Toggle, `aria-pressed`; zapnutý = ink, zatlačený. `variant` default (priehľadný) | outline · `size` sm 36 · default 40 · lg 44 · `pressed`/`defaultPressed`/`onPressedChange` · disabled.
- Potreby: pripomienka pred vyšetrením, „zvuk EKG“ na domove, filter textov.
- Problémy: default a sm < 44 px.

### toggle-group — `ui/toggle-group.tsx`
- Radix ToggleGroup: `type` single | multiple, `variant`/`size` dedí z kontextu, `orientation`, `rovingFocus`, `loop`, disabled položka.
- Potreby: **sloty 14:00–19:00** (lepšie ako time-picker, keď sú pevné časy), dni Po–Pi, fázy liečby.
- Hriech: filter redakcií (multiple).
- Problémy: `single` dovolí odznačiť (vráti "") → v `onValueChange` ignoruj prázdnu hodnotu; vertikálne treba `className="flex-col"` (orientation mení iba klávesnicu).

### input — `ui/input.tsx`
- Pole s tieňom, fokus = zatlačenie. Všetky `type` (text, email, password, number, search, file…), disabled, readOnly.
- Potreby: meno/e-mail v rezervácii a zápise, hľadanie v textoch.
- Problémy: `aria-invalid` nemá štýl (ručne `border-stamp`); `md:text-sm` = 14 px na desktope; type=file potrebuje `h-auto py-2`.

### input-group — `ui/input-group.tsx`
- `InputGroup` (rám, zatlačí sa pri `focus-within`), `InputGroupInput`, `InputGroupAddon position="leading|trailing"` (ikona, text, Kbd, tlačidlo).
- Potreby: **zápis do Vydania** (ikona + e-mail + hot tlačidlo v jednom), URL skóre webu (`https://` + doména), trvanie („30 min“).
- Netopier: hľadanie v prepisoch s ⌘K.
- Problémy: addon uppercase natvrdo; `InputGroupInput` text-sm aj na mobile (iOS zoom pod 16 px → daj `text-base`); disabled nemá vizuál na rámiku.

### input-otp — `ui/input-otp.tsx` (knižnica input-otp 1.5)
- `InputOTP maxLength pattern onComplete`, `InputOTPGroup`, `InputOTPSlot index`, `InputOTPSeparator`. Vzory `REGEXP_ONLY_DIGITS`, `…_AND_CHARS`.
- Potreby: overenie e-mailu pred termínom, kód do hry / tajnej sekcie.
- Hriech: „zadaj kód z článku“ ako paywall-hra.
- Problémy: `animate-caret-blink` neexistuje; sloty v skupine bez medzery → tiene sa prekrývajú (daj `gap-2` na group).

### textarea — `ui/textarea.tsx`
- Viacriadkové pole, rovnaký fokus. Props = natívne (rows, maxLength, resize).
- Potreby: „S čím prichádzaš?“ (600 znakov), správa v zápise.
- Problémy: bez počítadla a auto-výšky (počítadlo cez FieldDescription).

### field — `ui/field.tsx`
- `FieldGroup` (gap-5), `Field` (gap-1.5), `FieldLabel` (Label text-xs), `FieldDescription`, `FieldError` (role=alert, **nevykreslí sa bez textu**).
- Potreby: každý formulár (rezervácia, zápis, kvíz).
- Problémy: nič sa neprepája samo (`htmlFor`, `aria-describedby`, `aria-invalid` ručne).

### label — `ui/label.tsx`
- Radix Label, uppercase bold, `peer-disabled` stlmí popis za vypnutým súrodencom.
- Problémy: uppercase natvrdo (pre vety `normal-case tracking-normal font-medium`); `labelVariants` nemá varianty.

### checkbox — `ui/checkbox.tsx`
- Radix Checkbox: checked, unchecked, `indeterminate`, disabled; zaškrtnutý = ink s paper fajkou.
- Potreby: súhlas, „čo si priniesť“ zoznam, výber viac produktov.
- Problémy: 20 px; `indeterminate` ukazuje fajku (má byť pomlčka — `CheckboxPrimitive.Indicator` by mal prepnúť `Check`/`Minus` podľa `data-state`).

### radio-group — `ui/radio-group.tsx`
- Radix RadioGroup: `orientation`, disabled na skupine aj položke, šípky.
- Potreby: **triáž** (RIESENIA → diagnóza), výber produktu v čakárni, kvíz.
- Problémy: **vybraté = `bg-primary` + bodka `fill-primary` = čierna bodka na čiernom** (riadky 28 a 34 v `radio-group.tsx`). Oprava: `data-[state=checked]:bg-background` alebo bodka `fill-primary-foreground`. V ukážke obídené `className="bg-white data-[state=checked]:bg-white"`.

### switch — `ui/switch.tsx`
- Radix Switch, zapnutý = ink, jazdec sa posunie.
- Potreby: pripomienka, zápis do Vydania po rezervácii, prepínač režimu (tmavá ordinácia).
- Problémy: 28 px výška → cieľ riadkom.

### slider — `ui/slider.tsx` (582 riadkov, vlastný, bez Radixu)
- Jeden alebo viac jazdcov (`value`/`defaultValue` pole), `min/max/step`, `orientation`, `disabled`, `onValueChange`/`onValueCommit`, **pružina** `stiffness` · `damping` · `mass` (jazdec sa pri rýchlom pohybe „rozpľasne“ a nakloní). Klávesnica: šípky, Home/End, PageUp/Down.
- Potreby: anamnéza (hodiny týždenne), okno termínu 14–19, hry (nastav hodnotu, odhad).
- Hriech: „Ako veľmi je titulok klamlivý?“ s rosolom.
- Problémy: `aria-valuetext` „6 of 20“ po anglicky; pružina beží aj pri reduced motion; bez `name` / skrytého inputu do formulára.

### rating — `ui/rating.tsx`
- `icon` star | heart | circle, `size` sm/md/lg/xl, `max`, `precision` 1 | 0.5 (polovičná hviezda gradientom), `readOnly`, `disabled`, `onChange`, `onHoverChange`. Roving tabindex, šípky, Home/End.
- Potreby: **škála bolesti 0–10** (kruhy, stamp), spätná väzba po vyšetrení, hodnotenie článkov.
- Hriech: hodnotenie dôveryhodnosti médií kruhmi.
- Problémy: hover nevyplní náhľad (iba callback); polovičky len klávesnicou; aria po anglicky; ikony < 44 px (v recepte `[&_button]:min-h-11`).

### select — `ui/select.tsx`
- Radix Select: `SelectTrigger/Value/Content/Group/Label/Item/Separator/ScrollUp/Down`, `position` popper | item-aligned, disabled položka aj celý výber.
- Potreby: téma vyšetrenia (Vyšetrenie + produkty z čakárne), jazyk, filter.
- Problémy: fokus položky `bg-accent` + paper (bod 1; v ukážke `focus:bg-yellow focus:text-ink`); `SelectLabel` má `pl-8` aj bez ikony.

### native-select — `ui/native-select.tsx`
- Natívny `<select>` v rámčeku so šípkou; optgroup, disabled, funguje bez JS a na mobile otvorí systémový zoznam.
- Potreby: záložný formulár bez JS, jednoduché filtre.
- Problémy: `uppercase` natvrdo aj pre hodnoty (prepíš `normal-case`).

### combobox — `ui/combobox.tsx`
- Popover + cmdk: `Combobox` (=Popover), `ComboboxTrigger` (value, placeholder, open), `ComboboxMultiTrigger` (čipy mimo tlačidla, `onRemove`), `ComboboxContent/Input/List/Empty/Group/Item/Separator`. Fuzzy hľadanie cmdk.
- Potreby: „v čom dnes pracuješ“ (nástroje), výber makléra/kancelárie z datasetu, vyhľadávanie textov.
- Netopier: výber redaktora z 558 ľudí.
- Problémy: hodnotu, popis a zatvorenie skladáš sám; čip `bg-accent` (hot) mimo CTA (v ukážke `[&>span]:bg-yellow`); predvolené „Select...“.

### tag-input — `ui/tag-input.tsx`
- `value/defaultValue/onChange`, `suggestions` (listbox s klávesnicou, aria), `maxTags`, `allowDuplicates`, `delimiter` (string alebo RegExp), `validateTag` (true | text chyby), disabled; Backspace zmaže posledný; vkladanie viacerých naraz.
- Potreby: nástroje klienta, témy do Vydania, tagy textov.
- Problémy: hlášky „Maximum N tags allowed“, „Tag already exists“, „Invalid tag“ po anglicky (natvrdo, riadky 103, 107, 113); štítky uppercase; ref je `TagInputHandle`, nie input.

### dropzone — `ui/dropzone.tsx`
- `Dropzone` (`accept` MIME→prípony, `maxSize`, `maxFiles`, `disabled`, `variant` default | compact | minimal, `onFilesAccepted`, `onFilesRejected`, children alebo **render-prop so stavom** `isDragging/acceptedFiles/rejectedFiles/reset`), `FileList` + položky s `progress`, `uploading` (Spinner), `error`, `onRemove`.
- Potreby: príloha k vyšetreniu (nepovinná), podklady pre skóre webu.
- Hriech: nahraj screenshot titulku na rozbor.
- Problémy: predvolený obsah a hlášky po anglicky („Drag & drop files“, „File is larger than…“, „File type not accepted“); `aria-label="File upload area"` (dá sa prepísať, props idú po ňom); dragging `bg-primary/10` = sivá; `formatBytes` s bodkou („177.73 KB“); tlačidlo odobrať 32 px.

### calendar — `ui/calendar.tsx` (react-day-picker 9.14)
- Všetky props DayPicker: `mode` single | multiple | range, `numberOfMonths`, `locale` (`import { sk } from 'react-day-picker/locale'`), `weekStartsOn`, `disabled` matchery (`{ dayOfWeek }`, `{ before }`, funkcia), `startMonth/endMonth`, `showOutsideDays`, `showWeekNumber`, `captionLayout="dropdown"`, `footer`, `modifiers` + `modifiersClassNames`, `classNames` (zlúči sa s BoldKitom), `components`.
- Potreby: **ordinačné dni** (iba dni z `vsetkyTerminy()` sú povolené), história Korpusu (multiple = dni písania).
- Problémy: `today` a `range_middle` hot + paper (`KAL_OPRAVA` v `Spolocne.tsx`); bez locale anglicky a nedeľa prvá; `captionLayout="dropdown"` bez štýlov (natívny select vedľa popisu) — oprava `DROPDOWN_OPRAVA` v `Cas.tsx`; `Chevron` pozná iba left/right, dropdown dostane šípku doprava (oprava `components={{ Chevron }}`); deň 36 px, šípky 28 px.

### date-picker — `ui/date-picker.tsx`
- Tlačidlo (všetky Button props: variant, size…) + Popover + Calendar single. `value`/`defaultValue`/`onChange` (controlled podľa prítomnosti `value`), `placeholder`, `dateFormat` (date-fns), `disabled`.
- Potreby: jednoduchý dátum bez pravidiel.
- Problémy: **neprepúšťa props kalendára** — nedá sa dať `locale`, zakázané dni, `weekStartsOn`, `startMonth` → pre rezerváciu nepoužiteľný; preto „Vyšetrenie“ skladá Popover + Button + Calendar samo (recept). Návrh: prop `calendarProps?: Omit<CalendarProps,'mode'|'selected'|'onSelect'>`. Predvolené „Pick a date“ a `LLL dd, y`; šírka 260 px natvrdo.

### date-range-picker — `ui/date-range-picker.tsx`
- Rozsah s predvoľbami: `presets` (`{label, value: DateRange}`), `showPresets`, `numberOfMonths` 1 | 2 (na < 640 px vždy 1, predvoľby hore), `minDate/maxDate`, `align`, `placeholder`, controlled/uncontrolled; export `getDefaultPresets`.
- Potreby: obdobie Korpusu / pulzu, filter textov podľa dátumu.
- Netopier: obdobie sledovania tvrdení.
- Problémy: nadpis „Presets“ a predvolené predvoľby po anglicky; formát v tlačidle vždy `LLL dd, y` (anglické mesiace); `range_middle` a vybraná predvoľba hot — **zvonka sa nedá prepísať** (Calendar tu nedostane `classNames`, oprava až bodom 1); panel predvolieb sa na desktope roztiahne na polovicu šírky popovera.

### time-picker — `ui/time-picker.tsx`
- Stĺpce hodín/minút/(sekúnd)/(AM-PM): `format` 12h | 24h, `minuteStep` 1/5/10/15/30, `showSeconds`, `minTime`/`maxTime` (mimo sú disabled), `placeholder`, Button props.
- Potreby: presný čas spätného zavolania; na pevné sloty je lepší toggle-group.
- Problémy: hlavičky „Hour/Min/Sec/Period“ natvrdo; **prvý klik na hodinu bez hodnoty zdedí aktuálne minúty** (14:37 pri kroku 30; obchádzka v onChange zarovná na :00); klik mimo min/max ticho nič neurobí; zoznam nescrolluje k povoleným hodinám (pri 19:00–19:00 treba zrolovať 00…18 sivých); riadky ~30 px; predvolený formát 12h.

### stepper — `ui/stepper.tsx`
- `Stepper` (activeStep/onStepChange controlled alebo interné, `orientation`, `totalSteps` pre dynamické), `StepperList`, `StepperItem index`, `StepperTrigger` (`size` sm/md/lg, `showStepNumber` alebo vlastná ikona v children; hotový = žltá s fajkou, aktívny = ink scale-110), `StepperSeparator` (hotový plná čiara, inak čiarkovaná), `StepperContent index`, `StepperActions` (prev/next/complete labels, `onComplete`, alebo vlastné children), `stepVariants`, `useStepperContext`.
- Potreby: rezervácia (4 kroky), **Kto som ako zvislá časová os** (CESTA), priebeh vyšetrenia, onboarding kohorty.
- Hriech: kroky rozboru článku (tvrdenie → zdroj → verdikt).
- Problémy: `id="stepper-trigger-N"` a `stepper-panel-N` natvrdo → pri viacerých stepperoch duplicitné id (použiť `useId`); StepperActions predvolene anglicky; klik na krok obíde validáciu, ak `onStepChange` nejde cez `goTo`; `StepperContent` animácia neexistuje (bod 2); 5 krokov vodorovne na 375 px pretečie (min-w-8 separátory).

### multi-step-form — `ui/multi-step-form.tsx`
- Bez závislostí: `MultiStepForm steps initialValues onSubmit`, kroky `{ id, validate(values) → errors | null }`, `useMultiStepForm()` → values, setValue (maže chybu poľa, nastaví touched), errors, touched, activeStep, next, back, goTo, canGoNext, isStepValid, isFirstStep, isLastStep, submit. Stepper je iba obraz (`activeStep={f.activeStep} onStepChange={f.goTo}`).
- Potreby: rezervácia, zápis do čakárne, kvíz, skóre webu.
- Problémy: `next()`/`goTo()` nevracajú výsledok (hlásenie treba počítať cez validátor zvlášť); `goTo` dopredu overí iba aktuálny krok, **preskočenie viacerých krokov obíde ich validáciu** (v ukážke obmedzené na +1); chyby až po pokuse ísť ďalej.

## Kombinovaná ukážka „Vyšetrenie“ (`Vysetrenie.tsx`)
- Recept „rezervácia“: MultiStepForm (4 kroky: Deň → Čas → Príjem pacienta → Súhrn) + Stepper + Calendar v Popoveri (date-picker s pravidlami: `sk`, povolené iba dni z `vsetkyTerminy()` → Po–Pi, ≥ 24 h, ≤ 14 dní) + „Najbližšie voľné“ toggle-group + toggle-group slotov a TimePicker (24h, krok 30, minTime/maxTime z dňa) + Field/Input/Textarea + sonner (chyba pri neúplnom kroku, úspech po odoslaní) + panel „Hotovo ✓“ ako v `Rezervacia.tsx`.
- Validácia času: iba celé hodiny z dňa (`slotIso` + `casBratislava`), čas je bratislavský.
- Iba vizuálne: žiadny `fetch`, žiadny `.ics`, žiadne udalosti; toast aj panel to hovoria.
- Na preklopenie do ostrého: `onSubmit` → `POST /api/rezervacia/` s `slot: slotIso(datum, cas)`, dni z `GET /api/terminy/` namiesto `vsetkyTerminy()` (obsadenosť), 409 → späť na krok 2.

## Top objavy „vie viac, než by človek čakal“
1. **slider má fyziku pružiny** (`stiffness/damping/mass`) — z posuvníka je hračka do hier a „rosol“ efekt bez knižnice.
2. **multi-step-form je samostatný mozog formulára** bez závislostí; so stepperom a toastom je rezervácia na ~300 riadkov.
3. **Calendar vie `modifiers` + `disabled` funkciu** → ordinačné dni priamo z `src/data/terminy.ts`, aj čísla týždňov a dropdown mesiacov.
4. **dropzone má render-prop so stavom** (isDragging, accepted/rejected) + FileList s priebehom, chybou a spinnerom — celý upload UI bez ďalšieho kódu.
5. **rating s `icon="circle" max={10}`** je hotová škála bolesti 0–10 (zdravotnícky slovník); tag-input má návrhy s plnou a11y (listbox, aktívna možnosť, hlásenie chyby).

## Overenie (29. 9. 2026)
- `npx astro build --outDir dist-kit-formulare` OK.
- `npx astro check`: 0 chýb v `src/components/v7/kit/formulare/**` a `src/pages/kit/formulare.astro` (7 chýb v celom repe je v `src/components/v7/kit/tvary/**`, iná skupina).
- Playwright (scratch skript): 1440×900 aj 375×812 → `scrollWidth − innerWidth = 0`, 0 chýb konzoly, 0 pageerror. Screenshoty `work/screens/kit-formulare-{d,m}.png`.
- Interakcia vyšetrenia (desktop aj mobil): „Ďalej“ bez dňa → chybový toast; výber dňa v popoveri; čas; meno/e-mail; súhrn; odoslanie → panel „Hotovo ✓“ + toast; popovery bez pretečenia.
