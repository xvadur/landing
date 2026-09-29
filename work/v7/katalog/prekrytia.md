# Kit · Prekrytia (29. 9. 2026)

Stránka `/kit/prekrytia/` (`src/pages/kit/prekrytia.astro`, noindex, islands="full").
Ostrovy v `src/components/v7/kit/prekrytia/`: `Dialogy` (client:load, nesie aj `KitToaster`), `Sheety`, `Plavajuce`,
`Menu`, `Paleta`, `Hlasenia`, `Sprievodca`, `Recepty` (client:visible). Spoločné: `spolocne.tsx` (rám Kus/Blok/Stav,
`useMaloOkno`, trieda `POLOZKA`, dáta HRY/PROJEKTY z fakty.ts), `KitToaster.tsx`.
Každý kus je na stránke zatvorený (spúšťač so štítkom „zatvorené“). Otvorené stavy sú na screenshotoch
`work/screens/kit-prekrytia-open-{d,m}-*.png`. Inline `Command` je otvorený staticky priamo na stránke.

Pravidlo, ktoré platí pre všetky Radix prekrytia: obsah ide do portálu na `body` a má `position: fixed`. Statický
„otvorený“ náhľad v toku stránky preto nejde bez duplikovania tried (ui nepustí `container` do Portal). Otvorené stavy
dokladá Playwright klikom.

---

## dialog — `src/components/ui/dialog.tsx`
- **Čo robí:** modálne okno (Radix Dialog). Zamkne scroll a fokus, zatvára sa cez Esc, klik mimo alebo krížik. Overlay `bg-black/70`, tvrdý tieň 8/8.
- **Časti a props:** `Dialog` (open, defaultOpen, onOpenChange, modal), `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogClose`, `DialogContent` (+ všetky props Radix Content: onInteractOutside, onEscapeKeyDown, onOpenAutoFocus …), `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`. Varianty (cva) nemá, všetko ide cez className.
- **Ukázané:** základ (Header/Title/Description/Footer/Close), formulár, dlhý obsah so scrollom, široký s obrázkom bez krížika, kontrolovaný (bez Triggeru), nemodálny (`modal={false}` bez overlayu).
- **Na čo:** vyšetrenie (detail VLAJKA), zápis do čakárne, náhľad hry (recept 1), posledný text (recept 3), Hriech s obrázkom.
- **Hriech/Netopier:** detail redakcie alebo človeka z mapy (558 ľudí) bez opustenia mapy. V Netopierovi overenie tvrdenia: citát, zdroj a verdikt v dialógu.
- **Problémy:**
  - r. 38: `w-full` → na mobile okno od okraja po okraj, bez 16 px okrajov. Obchádzka `w-[calc(100%-2rem)]`. Návrh: `w-[calc(100%-2rem)]` priamo v ui.
  - Chýba `max-h` a `overflow-y-auto`. Dlhý obsah na mobile vytečie mimo obrazovky. Návrh: `max-h-[88dvh] overflow-y-auto`.
  - r. 44–46: krížik má ~28 px (pod cieľom 44 px) a sr-only text „Close“ je po anglicky. Návrh: `h-11 w-11` a `Zavrieť`.
  - Krížik sa nedá vypnúť propom, iba cez `[&>button:last-child]:hidden`. Návrh: prop `hideClose`.
  - Focus ring = `ring-ring` = hot, takže hot sa objaví aj mimo CTA. Rieši to token `--ring` v boldkit.css, nie ui.

## alert-dialog — `src/components/ui/alert-dialog.tsx`
- **Čo robí:** otázka, ktorá si vyžaduje odpoveď. Nezatvorí sa klikom mimo, iba cez Cancel, Action alebo Esc.
- **Časti:** Root, Trigger, Portal, Overlay, Content, Header, Footer, Title, Description, `AlertDialogAction` (buttonVariants default), `AlertDialogCancel` (outline).
- **Ukázané:** deštruktívny (Action + `bg-destructive`), potvrdenie odchodu z hry, async s čakaním (`e.preventDefault()` na Action, spinner, Cancel disabled).
- **Na čo:** zrušenie alebo presun termínu v rezervácii, odchod z rozohranej hry, vymazanie zápisu.
- **Hriech/Netopier:** „Zverejniť diagnózu?“ pred publikovaním. „Označiť tvrdenie ako nepravdivé?“
- **Problémy:** r. 36 je ten istý `w-full` ako pri dialógu. Action nemá variant `destructive`, treba className. Návrh: prop `variant` na Action cez buttonVariants.

## sheet — `src/components/ui/sheet.tsx`
- **Čo robí:** panel z okraja obrazovky (Radix Dialog + cva `sheetVariants`).
- **Varianty:** `side`: `top | right (default) | bottom | left`. Left/right majú `w-3/4 sm:max-w-sm`, top/bottom `inset-x-0` a výšku podľa obsahu. Časti: Sheet, Trigger, Close, Portal, Overlay, Content, Header, Footer, Title, Description.
- **Ukázané:** všetky 4 strany. Right = detail Hriechu, left = mobilné menu (NAV + DALSIE, `SheetClose asChild` okolo odkazov), top = vitálne funkcie (ZIVE_CISLA, snímka 26. 9. 2026 20:31), bottom = produkty liečby vo vodorovnom scrolle. Recept 2: right na desktope, bottom na mobile (`useMaloOkno`).
- **Na čo:** projekty a chorobopisy (detail vedľa zoznamu), navigácia na mobile, filter, rýchly prehľad čísel Korpusu.
- **Hriech/Netopier:** profil redakcie so zoznamom ľudí. Zoznam článkov ostáva viditeľný pod panelom.
- **Problémy:** r. 64–66: krížik ~28 px a „Close“ po anglicky. Right/left na mobile majú `w-3/4`, pre detail projektu je to úzke. Recept preto na mobile prepína na bottom. `sm:max-w-sm` sa dá prebiť (`sm:max-w-md`).

## drawer — `src/components/ui/drawer.tsx` (vaul 1.1.2)
- **Čo robí:** zásuvka, ktorú prstom stiahneš preč.
- **Props (vaul Root):** `direction` (top/right/bottom/left), `snapPoints`, `activeSnapPoint` + `setActiveSnapPoint`, `fadeFromIndex`, `dismissible`, `modal`, `handleOnly`, `closeThreshold`, `shouldScaleBackground`, `setBackgroundColorOnScale`, `noBodyStyles`, `repositionInputs`, `container`, `onDrag`, `onRelease`, `onClose`, `nested`. ui exportuje Drawer, Trigger, Portal, Close, Overlay, Content, Header, Footer, Title, Description.
- **Ukázané:** základ zdola (objednať vyšetrenie), snapPoints `[0.45, 1]` s kontrolovaným bodom (anamnéza), `direction="right"` s prebitými triedami, `dismissible={false}` (kontrolovaný). Recept 1: na mobile drawer namiesto dialógu.
- **Na čo:** mobilná rezervácia, náhľad hry na mobile, filter izby dôkazov.
- **Hriech/Netopier:** na mobile „čítať viac“ pri tvrdení. Snap body: najprv verdikt, potiahnutím celý dôkaz.
- **Problémy:**
  - **`dismissible={false}` + `DrawerClose` nezavrie nič.** vaul (`index.mjs` ~r. 1344) má `if (!dismissible && !open) return;` a ignoruje aj Close. Zásuvka musí byť kontrolovaná (`open` + `setOpen(false)`). Ukážka to tak robí.
  - r. 6: `shouldScaleBackground = true` bez efektu, lebo na webe nie je `[data-vaul-drawer-wrapper]`. Keby sa wrapper pridal, vaul dá `body` čierne pozadie. Návrh: default false.
  - r. 48: úchyt je obyčajný `div`, nie `Drawer.Handle`. S `handleOnly` sa zásuvka nedá ťahať vôbec a pri `direction` left/right ostáva úchyt vodorovne hore.
  - Content má natvrdo `inset-x-0 bottom-0 mt-24 border-b-0`. Pre iné strany treba prepísať inset aj rám cez className.
  - `NestedRoot` z vaulu ui neexportuje.

## popover — `src/components/ui/popover.tsx`
- **Čo robí:** malé okno pri spúšťači, otvára sa klikom a môže obsahovať formulár.
- **Časti a props:** Popover (open, onOpenChange, modal), Trigger, `PopoverAnchor`, Content (`side`, `align` default center, `sideOffset` default 4, `alignOffset`, `avoidCollisions`, `collisionPadding` …). Šírka `w-72`.
- **Ukázané:** slovník pojmov v texte (Triáž → Diagnóza → Plán liečby z VLAJKA), formulár čakárne (kohorta), všetky 4 strany so `sideOffset=12`, 3 zarovnania, `PopoverAnchor` (okno sa prilepí k číslu 572 469, otvára ho ikonka). Recept 1: popover „Čo to bude?“ pri hrách v stavbe.
- **Na čo:** vysvetlivky v texte, rýchly zápis e-mailu, hry v stavbe (namiesto mŕtveho odkazu).
- **Hriech/Netopier:** pri mene redaktora „kde ešte písal“. PopoverAnchor prilepí vysvetlenie k zvýraznenej vete článku.
- **Problémy:** žiadne vážne. `w-72` pri 375 px sedí. Pri `w-80` treba `max-w-[calc(100vw-2rem)]`.

## hover-card — `src/components/ui/hover-card.tsx`
- **Čo robí:** náhľad pri prejdení myšou alebo pri fokuse klávesnicou.
- **Props:** Root `openDelay` (default 700), `closeDelay` (300), open/onOpenChange. Content side/align/sideOffset (default 4). Šírka `w-64`.
- **Ukázané:** náhľad Hriechu s obrázkom v texte, pacient Jakub (47 / 47), rýchly/default/pomalý delay a rôzne strany.
- **Na čo:** odkazy v texte (texty, bio), mená projektov v dôkazoch.
- **Hriech/Netopier:** meno človeka v článku → karta (redakcia, počet článkov). Silné pre mapu médií.
- **Problémy:** ui nemá Portal (na rozdiel od popoveru), takže obsah sa renderuje vedľa spúšťača a môže ho orezať `overflow-hidden` rodiča. Návrh: obaliť `HoverCardPrimitive.Portal`. Na dotyku sa neotvorí, preto obsah nesmie byť jediná cesta k informácii.

## tooltip — `src/components/ui/tooltip.tsx`
- **Čo robí:** krátky popis (ink štítok, paper text). Nad sebou potrebuje `TooltipProvider`.
- **Props:** Provider `delayDuration`, `skipDelayDuration`. Root `delayDuration`, open. Content side/align/`sideOffset` (default 6).
- **Ukázané:** ikonové tlačidlá karty Škrtacieho testu (s aria-label), 4 strany, obsah s `KbdCombo ⌘K`, vypnuté tlačidlo v `<span tabIndex=0>`, `delayDuration=0` proti 200 ms z Providera.
- **Na čo:** ikony, skratky, vysvetlenie vypnutých vecí (hra v stavbe).
- **Hriech/Netopier:** ikony stavu tvrdenia (overené, sporné, nepravdivé).
- **Problémy:** Kbd v tmavom tooltipe potrebuje `[&_kbd]:text-ink`. Vypnuté tlačidlo tooltip nespustí (pointer-events), treba obal.

## dropdown-menu — `src/components/ui/dropdown-menu.tsx`
- **Čo robí:** menu akcií alebo volieb pod tlačidlom, ovládané šípkami a písmenami.
- **Časti:** Root, Trigger, Content (sideOffset 4), Item (`inset`, disabled), CheckboxItem, RadioGroup + RadioItem, Label (`inset`), Separator, Shortcut, Group, Portal, Sub + SubTrigger (`inset`) + SubContent.
- **Ukázané:** filter izby dôkazov (4 štítky ako CheckboxItem s `onSelect={e => e.preventDefault()}`, RadioGroup poradia, výsledok naživo pod tlačidlom) a akcie hry (Group, Shortcut, Sub „Zdieľať“, inset + disabled pre hry v stavbe).
- **Na čo:** filter projektov, zdieľanie výsledku hry, menu účtu.
- **Hriech/Netopier:** filter redakcií a tém, export dát.
- **Problémy:**
  - r. 22, 76, 92, 115: `focus:bg-accent focus:text-accent-foreground`. **accent = hot**, takže každá položka pod kurzorom svieti horúcou (hot patrí iba CTA a X). `--color-accent-foreground` je v tokens.css (r. 65) **paper**, takže text je paper na hot (3,2 : 1, porušuje „text na hot je ink“). V HSL vrstve boldkit.css je accent-foreground ink, dve vrstvy si odporujú. Obchádzka `POLOZKA` = `focus:bg-yellow focus:text-ink`. Návrh: v boldkit.css `@theme { --color-accent-foreground: var(--color-ink) }` a v menu zmeniť `focus:bg-accent` na `focus:bg-secondary`.
  - Položky `py-1.5` merajú ~32 px, pod cieľom 44 px. Obchádzka `min-h-11`.

## context-menu — `src/components/ui/context-menu.tsx`
- **Čo robí:** to isté menu na pravý klik (na dotyku dlhé podržanie).
- **Časti:** zhodné s dropdownom (Item, CheckboxItem, RadioItem, Label, Separator, Shortcut, Group, Sub …).
- **Ukázané:** chorobopis Jakuba. Otvoriť detail, kopírovať číslo, Sub zdieľať, CheckboxItem „Pripnúť“ (karta zožltne a dostane nálepku), RadioGroup karta/riadok (mení rozloženie), disabled „Upraviť · iba Adam“.
- **Na čo:** skryté skratky pre pokročilých. Nikdy nie jediná cesta k akcii.
- **Hriech/Netopier:** pravý klik na vetu v článku → „overiť v Netopierovi“, „kopírovať citát so zdrojom“.
- **Problémy:** rovnaké ako dropdown (r. 22, 75, 91, 114: hot pri fokuse, 32 px položky).

## command — `src/components/ui/command.tsx` (cmdk 1.1.1)
- **Čo robí:** vyhľadávacia paleta: filtruje, šípky a Enter vyberú.
- **Časti:** `Command` (inline, všetky props cmdk: `filter`, `shouldFilter`, `loop`, `value`, `onValueChange`, `label`, `vimBindings`), `CommandDialog` (title, description, props Dialogu), Input, List (`max-h-[400px]`), Empty, Group (heading), Item (`value`, `keywords`, `disabled`, `onSelect`), Separator, Shortcut.
- **Ukázané:** inline Command stále otvorený s vlastným filtrom bez diakritiky, keywords, disabled, prázdnym stavom a loop. CommandDialog cez tlačidlo. Recept 3: ⌘K pre celý ekosystém.
- **Na čo:** navigácia celým ekosystémom, vyhľadávanie textov, výber termínu.
- **Hriech/Netopier:** vyhľadávanie ľudí a redakcií v mape (558 ľudí). Default filter cmdk tu zlyhá na diakritike.
- **Problémy:**
  - **Default filter cmdk nerieši diakritiku.** `commandScore('Škrtací test', 'skrtaci') = 0` a „medi“ nenájde keyword „médiá“ (overené v node). Slováci píšu bez mäkčeňov, takže je to vážne. Riešenie `filterSk` v `Paleta.tsx` (NFD + zhodenie `\p{M}`).
  - r. 38: **`CommandDialog` pošle všetky props do `Dialog`, nie do `Command`**, takže `filter`, `loop` ani `shouldFilter` sa nedajú nastaviť. Recept 3 preto skladá `Dialog` + `Command` sám. Návrh: prop `commandProps`.
  - r. 42: `w-full max-w-lg` → na mobile od okraja po okraj a `className` sa nedá poslať. Položky `py-2.5` merajú ~40 px (obchádzka `min-h-11`).
  - Site `CommandK` (Base, islands="full") počúva ⌘K na `document`. Recept ho na tejto stránke predbieha listenerom na `window` v capture fáze so `stopPropagation`. Na webe by recept site paletu nahradil, nie doplnil.

## sonner — `src/components/ui/sonner.tsx` (sonner 2.0.8)
- **Čo robí:** hlásenie v rohu, ktoré samo zmizne.
- **API:** `toast`, `.message`, `.success`, `.info`, `.warning`, `.error`, `.loading`, `.promise`, `.custom`, `.dismiss`. Voľby: description, action, cancel, closeButton, invert, duration (aj Infinity), id (update), position, toasterId, icon, richColors, dismissible. Toaster: id, position, expand, visibleToasts, closeButton, offset, mobileOffset, gap, hotkey, swipeDirections, icons, toastOptions.
- **Ukázané:** 13 typov a volieb, 6 pozícií (position na jednom hlásení, jeden Toaster), prepínač „pôvodný BoldKit“ proti oprave.
- **Na čo:** potvrdenie rezervácie, výsledok hry, chyba formulára, „skopírované“.
- **Hriech/Netopier:** „Nové tvrdenie overené“ ako promise (loading → výsledok).
- **Problémy:**
  - **Štýl BoldKitu sa neprejaví.** Sonner vkladá vlastné CSS mimo `@layer` a Tailwind 4 utility sú v `@layer utilities`, takže bez ohľadu na špecificitu vyhráva sonner. Hlásenia sú biele, zaoblené, s 1 px rámom a mäkkým tieňom (dôkaz `open-d-sonner-boldkit.png`, vľavo dole). Oprava v `KitToaster.tsx`: `toastOptions={{ unstyled: true, classNames: … }}` z tokenov (rovnaký princíp ako `site/Toaster.tsx`).
  - r. 7: `useTheme()` hádže chybu bez `ThemeProvider`, takže Toaster nejde použiť sám. ThemeProvider navyše zapisuje triedu `light` / `dark` na `<html>`. Návrh: Toaster bez závislosti na téme (`theme="light"`).
  - success aj warning = žltá (boldkit.css), líši ich iba ikona. Oprava dáva warningu červený ľavý okraj (stamp).
  - Dva Toastery na stránke = každé hlásenie dvakrát. Riešenie: `id` na Toasteri a `toasterId` na hlásení.
  - Mimo môjho rozsahu: `src/components/site/Toaster.tsx` používa pastely `bg-lime`, `bg-sky`, `bg-pink` (od V5.3 zakázané).

## tour — `src/components/ui/tour.tsx`
- **Čo robí:** sprievodca s reflektorom. Stmaví stránku, okno pri cieli, fokus drží v sebe, Esc zatvára a vracia fokus.
- **Props:** `steps` (target: selektor | element | ref, title, description, placement top/right/bottom/left/center, spotlightPadding, content), open, onOpenChange, onComplete, onSkip, showSkipButton, showProgress. Hook `useTour()` (currentStep, totalSteps, nextStep, prevStep, goToStep, close, skip) funguje v `content`.
- **Ukázané:** prehliadka katalógu v 5 krokoch (všetky 4 strany + center, spotlightPadding 20, content so skokom na krok cez `goToStep`), prepínače showProgress / showSkipButton, onComplete/onSkip → hlásenie. Recept 4: domov v 4 krokoch so slovenskými tlačidlami.
- **Na čo:** prvá návšteva domova, vysvetlenie hry pred štartom, onboarding klienta (Jakub, Lucia) v ich systéme.
- **Hriech/Netopier:** „ako čítať mapu médií“ v 4 krokoch.
- **Problémy:**
  - r. 331–342: **tlačidlá natvrdo po anglicky** (Skip Tour, Previous, Next, Finish) a r. 292 „Close“. Recept 4 ich nahrádza slovenskými cez `content` + `useTour()` a pôvodný riadok skrýva CSS v `prekrytia.astro` (`[role=dialog]:has([data-tour-sk]) > div:last-child`). Návrh: prop `labels`.
  - r. 151: reflektor tvoria **dva prekrížené linear-gradienty**, takže svieti celý riadok a stĺpec cieľa (tvar „+“), nie iba obdĺžnik (dobre vidno na `open-d-tour.png`). Návrh: jeden `div` s `box-shadow: 0 0 0 9999px rgb(0 0 0 / .7)` na mieste cieľa, alebo SVG maska.
  - `rgba(0,0,0,0.7)` a `bg-black/70` nie sú tokeny (overlay token je `--color-overlay`).
  - Na 375 px sa okno so stranou left/right prekrýva s cieľom (w-80 sa oreže o okraj). Recept 4 na mobile prepína left/right na bottom.
  - Smooth `scrollIntoView` trvá; okno sa vypočíta až po dojazde (s Lenisom okolo 1,5 s).

---

## Recepty (koniec stránky, `Recepty.tsx`)
1. **Hry ako showcase:** 3 karty z `/hry/`. Škrtací test otvorí hrateľný náhľad (`skrtni()` a `UKAZKA` zo `src/components/hry/skrtni.ts`, škrty `decoration-stamp`, počty), na desktope v dialógu, na mobile v draweri. Dve hry v stavbe dostanú popover namiesto mŕtveho odkazu. CTA „Celá hra“ (hot, text ink) + „Všetky hry“.
2. **Chorobopisy v sheete:** 6 projektov z `DOKAZY` + fakty z `POSTAVIL` (Korpus z `KORPUS`). Sheet sprava, na mobile zdola: číslo, štítky, fakty, obrázok. Odkaz iba ak `url` (overené 200), inak poznámka.
3. **Kam chceš ísť? ⌘K:** skupiny Hry, Médiá, Dáta a pacienti, Texty, Domov. Škrtací test otvorí dialóg hry, Hriech, Netopier, Korpus, Jakub a Lucia otvoria sheet, Vyšetrenie otvorí dialóg, posledný text (z kolekcie cez prop z Astro) otvorí dialóg, Prehliadka domova spustí tour. Von vedú iba /hry/, /texty/, /, Substack a hriech.xvadur.com. Paleta sa pred otvorením cieľa zavrie (60 ms), aby naraz nebežali dva fokus trapy. Filter bez diakritiky.
4. **Prehliadka domova v 4 krokoch:** zmenšený domov s id `#uvod`, `#anamneza`, `#liecba`, `#konzultacia` (tie isté id ako na skutočnom domove, recept sa dá preniesť bez zmeny cieľov). Slovenská navigácia (Preskočiť / Späť / Ďalej / Hotovo, „krok 3 zo 4“).

## Overenie
- `npx astro build --outDir dist-kit-prekrytia` ✓
- `astro check`: 0 chýb v `src/components/v7/kit/prekrytia` a `src/pages/kit/prekrytia` (zvyšné chyby v repe sú v `kit/tvary`).
- Playwright 1440×900 a 375×812: `scrollWidth - innerWidth = 0` pri celej stránke aj pri každom otvorenom prekrytí, 0 chýb konzoly a pageerror, anglické tlačidlá tour v recepte 0, ⌘K otvorí iba paletu receptu.
- Screenshoty: `work/screens/kit-prekrytia-{d,m}.png`, `work/screens/kit-prekrytia-open-{d,m}-*.png`.
