# Katalóg V7 · skupina VENDOR (29. 9. 2026)

Stránka `/kit/vendor/` (`src/pages/kit/vendor.astro`, noindex, `islands="full"` = Lenis + X kurzor bežia ako na domove; 9 ostrovov:
`NeoZaklad` `client:load`, ostatné `client:visible`). Komponenty `src/components/v7/kit/vendor/`:
`shared.tsx` (karta kusu, mriežka variantov, stráže pohybu, token → rgb/hex pre canvas a WebGL, `usePulz` pre `/pulse.json`),
`NeoZaklad.tsx`, `NeoFormular.tsx`, `NeoOverlay.tsx`, `MagicUI.tsx`, `ReactBits.tsx`, `ReactBitsGsap.tsx` (lenivo), `MotionPrimitives.tsx`,
`Fancy.tsx`, `FancyGravity.tsx` (lenivo), `Motory.tsx`, `MotoryGsap.tsx` (lenivo), `MotoryShadery.tsx` (lenivo), `Podpisy.tsx`, `vendor-kit.css`.

GSAP, matter-js a WebGL moduly sa načítajú až po hydratácii (`React.lazy` + `useMounted`), nie `client:only` — ostrov ostáva `client:visible`
a SSR vykreslí zvyšok. Obsah iba zo `src/data/{fakty,cesta,ponuka,nav}.ts`, `src/components/hero/hero-data.ts` a `public/pulse.json`.
Pastelové tóny (pink / lilac / lime / sky) kity majú, zákon V5.3 ich zakazuje → na stránke sú len textom („Existuje aj…“), nevykresľujú sa
(výnimka: Stepper ich kreslí sám pri hotovom kroku, pozri nižšie). Hot len na CTA a X.

Rozsah: **43 vendor kusov + 4 hooky Fancy, 7 pohybových knižníc (20 ukážok), 4 podpisové pohyby; 188 dlaždíc variantov, 26 reálnych kombinácií.**

---

## A · neobrutalism.dev (MIT, Radix verzia) — `src/components/vendor/neobrutalism/`

### Button — `button.tsx`
- **Čo robí:** tlačidlo aj odkaz (`asChild` → Radix Slot) v brutal ráme, press / lift preset.
- **Props:** `variant` = default | noShadow | neutral (biela) | reverse (tieň pri hoveri) | ghost; `tone` = yellow | hot | white | paper | ink (+ pink/lilac/lime/sky); `size` = sm (44) | default (48) | lg (56) | xl (64) | icon-sm | icon | icon-lg; `asChild`; `disabled` / `aria-disabled`; compound: neutral+yellow → biela, ghost+yellow → priehľadné.
- **Na čo:** všetky CTA (rezervácia, zápis), navigácia, ikony zatvorenia.
- **Hriech / Netopier:** Hriech `tone="ink"` + reverse na „Čítaj prípad“; Netopier `size="icon"` v lište nástrojov.
- **Problémy:** `whitespace-nowrap` v základe → dlhé CTA („Objednaj sa na vyšetrenie →“) na 375 px pretečú; v ukážkach `className="max-w-full whitespace-normal py-2 text-left"`. Návrh: pridať `size="wrap"` alebo `whitespace-normal` pod `sm:`.

### Badge — `badge.tsx`
- **Čo robí:** mono štítok alebo display nálepka, voliteľne natočená.
- **Props:** `variant` = default | flat | sticker; `tone` = yellow | hot | white | paper | ink (+ pastely); `tilt` = none | left (−6°) | right (3°); `asChild`.
- **Na čo:** termíny a formáty produktov (`PRODUKTY[].nalepka`), stav „V stavbe“, štítky dôkazov.
- **Hriech / Netopier:** štítky redakcií; Netopier stav overenia tvrdenia (ink = overené, white = čaká).
- **Problémy:** `tone="hot"` existuje, ale zákon ho mimo CTA/X zakazuje — v kóde webu nepoužívať.

### Card (+ CardHeader, CardTitle `as`, CardDescription, CardAction, CardContent, CardFooter) — `card.tsx`
- **Čo robí:** brutal karta so skladačkou; `[.border-b]` na Header / `[.border-t]` na Footer dá deliace linky.
- **Props:** `variant` = default (6/6) | flat | lg (9/9); `tone` = white | paper | yellow | ink (+ pastely); `interactive` (lift); `size` = default | sm (`--card-spacing`); `stamp` (X pečiatka); CardTitle `as` = h2 | h3 | h4 | div.
- **Na čo:** ponuka (Vyšetrenie), produkty, prípadové štúdie, dôkazy.
- **Hriech / Netopier:** karta článku s `stamp` = „overené“; Netopier karta tvrdenia s CardAction = verdikt.
- **Problémy:** žiadne; pozor, BoldKit má vlastný `Card` s iným API (4/4 tieň, `interactive` = translate) — nemiešať v jednej sekcii.

### Separator — `separator.tsx`
- **Props:** `orientation` = horizontal | vertical; `variant` = default | x (X delič); `label` (mono štítok pri x); `decorative`.
- **Na čo:** deliče sekcií domova (01 · Príjem …), zvislé deliče v monitore.
- **Hriech / Netopier:** X delič medzi kapitolami prípadu.
- **Problémy:** variant x je len vodorovný (orientation sa ignoruje).

### Tabs (+ TabsList `variant`, TabsTrigger, TabsContent) — `tabs.tsx`
- **Props:** TabsList `variant` = default (lišta) | line (horúca linka 6 px); Tabs `orientation` = horizontal | vertical; TabsTrigger `disabled`; `defaultValue` / `value`.
- **Na čo:** produkty v Liečbe, Triáž / Zásah / Odovzdanie, filtre Pacientov.
- **Hriech / Netopier:** prepínanie médium / redakcia / autor.
- **Problémy:** line variant kreslí linku `bg-hot` (after:) — hot mimo CTA; návrh: `after:bg-ink`.

### Tooltip (+ TooltipProvider, TooltipTrigger, TooltipContent) — `tooltip.tsx`
- **Props:** TooltipContent `tone` = yellow | ink | white, `side` = top | right | bottom | left, `sideOffset` (8); Provider `delayDuration` (0).
- **Na čo:** vysvetlivky čísel (459 webov → „prehľadané realitné weby“), zdroj faktu.
- **Hriech / Netopier:** zdroj citátu pri tvrdení.
- **Problémy:** len hover / fokus — na dotyku sa neukáže; nikdy nesmie niesť jedinú informáciu.

### Input — `input.tsx`
- **Props:** všetky `<input>`; stavy `disabled`, `aria-invalid` (hot rám + pink plocha), `type="file"` (display písmo).
- **Na čo:** zápis e-mailu, rezervácia.
- **Problémy:** `aria-invalid:bg-pink` = pastel; návrh `aria-invalid:bg-white` + hot rám.

### Textarea — `textarea.tsx`
- **Props:** ako Input (min-h 8 rem). Rovnaký problém s `bg-pink`.

### Select (+ Group, Value, Trigger `tone`, Content `position`, Label, Item, Separator, ScrollUp/Down) — `select.tsx`
- **Props:** SelectTrigger `tone` = white | yellow | paper; SelectContent `position` = popper | item-aligned, `sideOffset`; SelectItem `disabled`; Select `disabled`, `defaultValue`.
- **Na čo:** výber termínu, produktu v čakárni.
- **Problémy:** žiadne.

### RadioGroup, RadioGroupItem, RadioGroupCard — `radio-group.tsx`
- **Props:** RadioGroup `orientation`, `defaultValue`; Item `disabled`, `aria-invalid`; Card = celý riadok ako cieľ ≥ 48 px (`value`, `disabled`).
- **Na čo:** kvíz, voľba „čo chceš“ pri zápise.
- **Problémy:** `orientation="horizontal"` nemení layout (grid) — treba className `grid-flow-col`.

### Progress (+ ProgressLabel, ProgressValue) — `progress.tsx`
- **Props:** `value`, `max`, `tone` = hot | yellow | ink (+ pastely-deep), `size` = sm | default | lg; posun spring (theme.css), reduced = skok.
- **Na čo:** krok zápisu / kvízu, rozpočet.
- **Problémy:** default tón `hot` → mimo CTA porušuje zákon; na webe `tone="yellow"` alebo `ink`.

### Dialog (+ Trigger, Content `tone`/`size`/`showCloseButton`, Header, Footer, Title, Description, Close) — `dialog.tsx`
- **Props:** DialogContent `tone` = white | paper | yellow (+ pastely), `size` = sm 480 | default 640 | lg 760, `showCloseButton`.
- **Na čo:** „Prečo nie iba ChatGPT“, detail produktu, potvrdenie rezervácie. Mobil od spodu, desktop v strede, otvorenie card-drop.
- **Problémy:** žiadne.

### Sheet (+ Trigger, Content `side`/`showCloseButton`, Header, Footer, Title, Description, Close) — `sheet.tsx`
- **Props:** `side` = top | right | bottom | left; `showCloseButton`.
- **Na čo:** Anamnéza v paneli, filtre, košík lákadiel.
- **Problémy:** žiadne.

### Command, CommandDialog (+ Input `eyebrow`, List, Empty, Group, Item, Separator, Shortcut) — `command.tsx`
- **Props:** CommandDialog `title`, `description`, `open`/`onOpenChange`; CommandInput `eyebrow`; CommandItem `disabled`, `onSelect`, `value`.
- **Na čo:** ⌘K paleta (už je `site/CommandK.tsx`), kartotéka sekcií.
- **Hriech / Netopier:** hľadanie v 558 ľuďoch mapy médií.
- **Problémy:** **inline `<Command>` na dlhej stránke strhne scroll** — cmdk pri mount-e plánuje `scrollIntoView({block:'nearest'})` na prvú položku
  (`node_modules/cmdk/dist/index.mjs`, `v(6, ne)`); keď sa ostrov hydratuje mimo obrazu, stránka skočí k palete (v QA z 32 900 px na 10 680 px).
  V katalógu sa inline paleta vykreslí až na klik. Na webe inline Command nepoužívať, len v dialógu.

---

## B · Magic UI (MIT) — `src/components/vendor/magicui/`

### Marquee — `marquee.tsx`
- **Props:** `reverse`, `pauseOnHover` (true), `vertical`, `repeat` (4; nepárne → +1), `duration` (40 s), `gap` ('2rem'), `bordered`.
- **Na čo:** pás faktov (459 webov × 2 034 maklérov × 47 / 47 × 10 rokov), zvislý pás výsledkov.
- **Hriech / Netopier:** pás titulkov redakcií.
- **Problémy:** vertikál potrebuje rodiča s pevnou výškou; pozn.: BoldKit má vlastný `ui/marquee.tsx` — vybrať jeden.

### Terminal, TypingAnimation, AnimatedSpan — `terminal.tsx`
- **Props:** Terminal `variant` = ink | white, `sequence`, `startOnView`, `title`; TypingAnimation `duration` (ms/znak), `delay`, `as`, `startOnView` (children iba string); AnimatedSpan `delay`, `startOnView`.
- **Na čo:** „ako vzniká agent“ (claude príkaz → ✔ 47 / 47), Korpus výpis.
- **Hriech / Netopier:** Netopier log overovania tvrdení.
- **Problémy:** bodka `bg-lime-deep` (terminal.tsx r. 268) = pastel; návrh `bg-white`.

### NumberTicker — `number-ticker.tsx`
- **Props:** `value`, `startValue`, `direction` = up | down, `delay` (s), `decimalPlaces`, `locale` ('sk-SK'), `prefix`, `suffix`.
- **Na čo:** Korpus celkom, čísla dôkazov.
- **Problémy:** **medzera v `prefix`/`suffix` zmizne** — obal je `inline-flex` (r. 81), flex položky orežú krajné medzery → „16,3mld.“, „0slov“.
  Obchádzka: `' mld.'`. Oprava: `inline-block` namiesto `inline-flex` alebo `&nbsp;` vnútri.

### ScrollProgress — `scroll-progress.tsx`
- **Props:** `color` = hot (default) | yellow | ink (+ pastely), `className`. Na stránke beží žltý hore.
- **Na čo:** články, dlhý domov.
- **Problémy:** default `hot` (r. 24) mimo CTA porušuje zákon → na webe `color="yellow"` alebo `ink`. Pre články (islands="none") radšej CSS `animation-timeline: scroll()` (ukážka v motoroch).

### Dock, DockIcon — `dock.tsx`
- **Props:** Dock `iconSize` (44), `iconMagnification` (64), `iconDistance` (140), `disableMagnification`, `direction` = top | middle | bottom, `bg` = white | paper | yellow | ink (+ pastely); DockIcon `href`, `label`, `external`, `color` = yellow | hot | white | paper (+ pastely).
- **Na čo:** plávajúca navigácia domova (NAV), sociálne odkazy v pätičke.
- **Hriech / Netopier:** lišta nástrojov Netopiera.
- **Problémy:** magnifikácia len myš; na dotyku je to obyčajná lišta (v poriadku).

### ShineBorder — `shine-border.tsx`
- **Props:** `borderWidth` (3), `duration` (14 s), `shineColor` (string | string[] — `var(--color-*)`).
- **Na čo:** zvýraznenie hlavnej ponuky (Vyšetrenie).
- **Problémy:** radiálny gradient (r. 44) je mäkký, „plávajúci“ — proti tvrdému neobrutalizmu; na webe skôr nepoužiť alebo s `shineColor="var(--color-ink)"` a krátkym `duration`.

### Confetti, ConfettiButton, fireConfetti, useConfetti — `confetti.tsx`
- **Props:** Confetti `ref` (`fire`), `manualstart`, `options`, `globalOptions` ({resize, useWorker}); ConfettiButton `options`; fireConfetti(opts); useConfetti() v potomkoch.
- **Na čo:** úspešný zápis / rezervácia, 0 fráz v Škrtacom teste.
- **Problémy:** `TOKEN_COLORS` (r. 22) obsahuje pastely → v ukážkach prebité `colors` z tokenov yellow/hot/ink/white (hex sa počíta za behu v `shared.tsx: tokenHex`).

---

## C · React Bits (MIT + Commons Clause, len ako súčasť webu) — `src/components/vendor/reactbits/`

### ClickSpark — `ClickSpark.tsx`
- **Props:** `sparkColor` (token alebo CSS; default hot), `sparkSize`, `sparkRadius`, `sparkCount`, `duration`, `easing` = linear | ease-in | ease-out | ease-in-out, `extraScale`, `lineWidth`.
- **Na čo:** klik na CTA, hry. Reduced = bez iskier.
- **Problémy:** default `hot` — pri ne-CTA prvkoch dať `ink`.

### CountUp — `CountUp.tsx`
- **Props:** `to`, `from`, `direction`, `delay`, `duration`, `startWhen`, `separator` (NBSP), `decimal` (','), `prefix`, `suffix`, `as` = span | strong | em | b | div, `onStart`, `onEnd`.
- **Na čo:** čísla faktov (MARQUEE_FAKTY), dni v rade. Najlepší slovenský formát z počítadiel (vlastný oddeľovač).
- **Problémy:** žiadne (prefix/suffix sú v texte, medzery ostávajú).

### DecryptedText — `DecryptedText.tsx`
- **Props:** `text`, `speed`, `maxIterations`, `sequential`, `revealDirection` = start | end | center, `useOriginalCharsOnly`, `characters`, `className` / `encryptedClassName` / `parentClassName`, `animateOn` = view | hover | inViewHover | click, `clickMode` = once | toggle, `initialEncrypted`.
- **Na čo:** motto (podpis 2), odtajnenie diagnózy, „príjem otvorený“.
- **Problémy:** **`initialEncrypted` rozbije hydratáciu** (React #418): `useState` inicializátor (r. 53–61) mieša náhodné znaky aj na serveri, klient vygeneruje iné.
  Obchádzka v katalógu: vykresliť až po mount-e. Oprava: na serveri vrátiť `text` a zamiešať v `useEffect`.

### Magnet — `Magnet.tsx`
- **Props:** `padding`, `magnetStrength`, `disabled`, `activeTransition`, `inactiveTransition`, `wrapperClassName`, `innerClassName`.
- **Na čo:** hlavné CTA na desktope. `transition … steps(3)` dá tvrdý, stupňovitý ťah.
- **Problémy:** duplicita s Motion Primitives `Magnetic` — vybrať jeden (Magnet = CSS transition, ľahší; Magnetic = spring).

### Noise — `Noise.tsx`
- **Props:** `patternSize`, `patternRefreshInterval`, `patternAlpha`, `animate`.
- **Na čo:** zrno pod mottom, skeleton.
- **Problémy:** `mix-blend-multiply` (r. 87) — na `bg-ink` je zrno neviditeľné.

### ScrambledText (GSAP) — `ScrambledText.tsx`
- **Props:** `radius`, `duration`, `speed`, `scrambleChars`, `as`, `className`, `style`.
- **Na čo:** titulok ponuky, citát — len desktop s myšou.
- **Problémy:** **slová sa lámu uprostred** — SplitText `type: 'chars'` (r. 53) bez slov („DIAGN / ÓZOU“). Obchádzka: každé slovo v `whitespace-nowrap` spane
  (`ReactBitsGsap.tsx: Slova`). Oprava: `type: 'words, chars'`, `wordsClass: 'inline-block whitespace-nowrap'`.

### SplitText (GSAP) — `SplitText.tsx`
- **Props:** `text`, `splitType` = chars | words | lines | 'words, chars', `from`/`to` (aj `fontVariationSettings` wdth), `delay` (ms stagger), `duration`, `ease` (aj `steps(n)`), `threshold`, `rootMargin`, `tag`, `textAlign`, `immediate`, `onLetterAnimationComplete`.
- **Na čo:** nadpisy sekcií (Príjem, Diagnóza), hero nad ohybom (`immediate`).
- **Problémy:** žiadne; `ease: 'steps(4)'` dá presne „vyrazenie“ bez plávania.

### Stepper, Step — `Stepper.tsx`
- **Props:** `initialStep`, `onStepChange`, `onFinalStepCompleted`, `stepCircleContainerClassName`, `stepContainerClassName`, `contentClassName`, `footerClassName`, `backButtonProps`, `nextButtonProps`, `backButtonText` / `nextButtonText` / `completeButtonText`, `disableStepIndicators`, `renderStepIndicator`, `completedContent`.
- **Na čo:** kvíz, Triáž → Diagnóza → Plán liečby, viackrokový zápis.
- **Problémy:** (1) hotový krok `bg-lime` (r. 256) = pastel → návrh `bg-yellow`. (2) obsah kroku je `position:absolute; left:0; right:0` (r. 206), padding
  z `contentClassName` ho neodsadí → text lepí na rám; obchádzka `<Step className="px-5">`.

### TiltedCard — `TiltedCard.tsx`
- **Props:** `imageSrc`, `altText`, `captionText`, `containerHeight`/`containerWidth`, `imageHeight`/`imageWidth`, `scaleOnHover`, `rotateAmplitude`, `showTooltip`, `overlayContent` + `displayOverlayContent`, `surfaceClassName`, deti.
- **Na čo:** karty Pacientov (Hriech, Lucia) s obrázkom.
- **Hriech / Netopier:** titulná karta článku s nálepkou redakcie.
- **Problémy:** náklon 3D je „mäkký“ (spring mass 2) — v neobrutalizme skôr `rotateAmplitude` 6–8.

---

## D · Motion Primitives (MIT, ibelick) — `src/components/vendor/motionprimitives/`

### AnimatedNumber — `animated-number.tsx`
- **Props:** `value`, `springOptions`, `as`, `locale`, `format` (má prednosť).
- **Na čo:** číslo, ktoré sa mení za behu (pulz, výsledok kvízu).
- **Problémy:** štvrté počítadlo v repe (NumberFlow, NumberTicker, CountUp) — pozri odporúčanie motorov.

### Cursor — `cursor.tsx`
- **Props:** `attachToParent`, `springConfig`, `variants` {initial, animate, exit}, `transition`, `onPositionChange`.
- **Na čo:** lokálny kurzor v hre alebo nad dôkazom (X, štítok „Vstúp“). Len ≥ 1024 px s myšou.
- **Problémy:** bez `attachToParent` nastaví `document.body.style.cursor = 'none'` (r. 61) a bije sa so `site/Cursor.tsx` → na webe iba attachToParent.

### InView (+ inViewDropVariants) — `in-view.tsx`
- **Props:** `variants`, `transition`, `viewOptions` (margin, amount), `as`, `once`, `className`.
- **Na čo:** odhalenie kariet a zoznamov pri scrolle (PRIPAD_MAKLER.dostal). Easing ako funkcia `t => ceil(t·n)/n` = schody.
- **Problémy:** bez `once` sa pri odchode z obrazu zase skryje; x ±100 % pretečie rodiča → obal `overflow-hidden`.

### Magnetic — `magnetic.tsx`
- **Props:** `intensity`, `range`, `actionArea` = self | parent | global, `springOptions`.
- **Problémy:** duplicita s React Bits Magnet.

### MorphingDialog (Trigger, Container, Content, Image, Title, Subtitle, Description, Close, useMorphingDialog) — `morphing-dialog.tsx`
- **Props:** MorphingDialog `transition`; Trigger `aria-label`, `triggerRef`; Description `variants`, `disableLayoutAnimation`; Close `variants`, `aria-label`; Image `src`, `alt`.
- **Na čo:** Pacienti — karta dôkazu sa roztiahne do detailu (DOKAZY s obrázkom).
- **Problémy:** komentár v súbore (r. 88) radí triggeru `brutal lift press` — lift/press sú CSS transition na `transform`, layoutId morph tiež hýbe
  `transform` → bijú sa (dvojitý pohyb). Na triggeri iba `brutal` + farba pri hoveri.

### TextScramble (+ SCRAMBLE_CHARS_SK) — `text-scramble.tsx`
- **Props:** `duration`, `speed`, `characterSet`, `as`, `trigger` (false → true spustí), `onScrambleComplete`.
- **Na čo:** alternatíva motta (podpis 2), prepínanie titulkov. Najľahší scramble (~1 kB, bez Motion).

### TransitionPanel (+ transitionPanelSlideVariants) — `transition-panel.tsx`
- **Props:** `activeIndex`, `variants` {enter, center, exit}, `transition`, + MotionProps (`custom`).
- **Na čo:** kroky kvízu, cesta (CESTA) po záložkách.

---

## E · Fancy (MIT, Daniel Petho) + vlastný StickerPeel — `src/components/vendor/fancy/`

### MarqueeAlongSvgPath — `blocks/marquee-along-svg-path.tsx`
- **Props:** `path`, `viewBox`, `width`/`height`, `preserveAspectRatio`, `pathId`, `showPath`, `pathClassName`, `pathStrokeWidth`, `baseVelocity`, `direction`, `easing`, `slowdownOnHover` + `slowDownFactor` + `slowDownSpringConfig`, `useScrollVelocity` + `scrollAwareDirection` + `scrollSpringConfig` + `scrollContainer`, `repeat`, `draggable` + `dragSensitivity` + `dragVelocityDecay` + `dragAwareDirection` + `grabCursor`, `enableRollingZIndex` + `zIndexBase` + `zIndexRange`, `cssVariableInterpolation`, `responsive`.
- **Na čo:** fakty jazdia po EKG krivke (Vitálne funkcie), fázy Príjem → Liečba po kruhu.
- **Hriech / Netopier:** titulky po krivke „vplyvu“.
- **Problémy:** (1) položky sa natáčajú podľa dráhy (`offset-rotate: auto`, prop chýba) → na EKG hrotoch chaos; obchádzka CSS `.ekg-rovno [style*='offset-path'] { offset-rotate: 0deg }`.
  (2) `responsive` škáluje aj položky (na 375 px tretina veľkosti) → pre EKG počítam dráhu z reálnej šírky (`useDimensions`) bez responsive.

### StickerPeel — `blocks/sticker-peel.tsx` (vlastná implementácia)
- **Props:** `colorClassName` (bg-yellow | bg-white | bg-paper), `rotate`, `peelSize`, `restPeel`, `draggable`, `dragConstraints`, `shadow`, `label`.
- **Na čo:** nálepka „10 rokov v nemocnici“ na hero, „V stavbe“, „Overené“.
- **Problémy:** s `dragConstraints` (ref rodiča) nálepky v QA po zmene veľkosti okna odskočili do rohov rodiča → na webe bez neho alebo s pevným boxom.
  Veľký `peelSize` zakryje koniec textu.

### ImageTrail, ImageTrailItem — `image/image-trail.tsx`
- **Props:** `threshold`, `intensity`, `keyframes`, `keyframesOptions`, `trailElementAnimationKeyframes`, `repeatChildren`, `baseZIndex`, `zIndexDirection` = new-on-top | old-on-top, `enabled`, `as`.
- **Na čo:** stopa obrázkov dôkazov / čísel za myšou v sekcii Pacienti. Iba ≥ 1024 px s myšou (inak nič).

### Gravity, MatterBody — `physics/gravity.tsx`
- **Props:** Gravity `gravity` {x,y}, `debug`, `grabCursor`, `addTopWall`, `autoStart`, `startOnView`, `resetOnResize`, `decomp`, ref {start, stop, reset};
  MatterBody `x`/`y` (% alebo px), `angle`, `bodyType` = rectangle | circle | svg, `sampleLength`, `isDraggable`, `matterBodyOptions` (restitution, friction, isStatic…).
- **Na čo:** hry, „rozsypané“ fakty a motto (DIVIDED, padá a dá sa hodiť).
- **Problémy:** **`decomp` príde neskoro** — `Common.setDecomp` volá Gravity vo vlastnom `useEffect` (r. 269), ale MatterBody (dieťa) sa registruje skôr
  → konkávne X dostane konvexný obal + warning matter-js. Obchádzka: `Common.setDecomp(decomp)` pri importe (`FancyGravity.tsx`). Oprava: nastaviť decomp
  v `registerElement` alebo v `useLayoutEffect`. `debug` kreslí `rgba(…)` natvrdo (r. 174–175, len ladenie).

### ScrambleHover — `text/scramble-hover.tsx`
- **Props:** `text`, `scrambleSpeed`, `maxIterations`, `sequential`, `revealDirection`, `useOriginalCharsOnly`, `characters`, `scrambledClassName`, `active` (riadi rodič), `as` = span | div.
- **Na čo:** položky menu (NAV) — `active` z hover + focus odkazu.

### VerticalCutReveal — `text/vertical-cut-reveal.tsx`
- **Props:** `splitBy` = words | characters | lines | vlastný oddeľovač, `staggerFrom` = first | last | center | random | index, `staggerDuration`, `reverse`, `transition`, `containerClassName` / `wordLevelClassName` / `elementLevelClassName`, `autoStart`, `startOnView`, `viewMargin`, `onStart` / `onComplete` / `onClick`, ref {startAnimation, reset}.
- **Na čo:** citát z Cesty („Ja som tú prácu miloval…“), titulky Liečby.

### useDetectBrowser, useDimensions, useMousePosition, useScreenSize — `hooks/*`
- prehliadač, rozmer prvku (ResizeObserver), pozícia myši / prsta voči prvku, Tailwind breakpoint (`lessThan('lg')`). `useDimensions` použitý na EKG pás.

---

## F · Pohybové motory — ktorý na čo a ako sa nebiť

| Motor | Na čo | Ukážky na stránke |
|---|---|---|
| **GSAP + ScrollTrigger + SplitText** | časové osi, **pinnuté scény**, scrub, snap, delenie textu, hero intro | pečiatka (scrub, `steps(4)`, tieň cez CSS premennú `--sh`), písmená sa „vyrazia“ (`steps(1)` stagger), fázy so scrub `steps(4)`; pin v podpise 4 |
| **Motion (motion/react)** | **stavy komponentov**: hover/tap, layout presuny, vstup/odchod (AnimatePresence), drag, spring čísla | triáž (layout), tlačidlo s odlepenou tvárou (whileHover/Tap), pečiatka OVERENÉ (AnimatePresence) |
| **CSS animation-timeline view()/scroll()** | 0 JS reveal a parallax, priebeh čítania | karty padajú `steps(4)`, pás priebehu `scroll(nearest block)` `steps(10)`, X parallax `steps(6)` |
| **Lenis** | plynulý scroll celej stránky (už v Base), `scrollTo` na kotvy | stav (velocity/progress), `scrollTo` so schodmi vs. plynulo, `data-lenis-prevent` |
| **@paper-design/shaders-react** | pozadia pásov (WebGL), iba ≥ 1024 px | Dithering wave / sphere / ripple (1-bit), DotGrid square / circle, Waves cik-cak |
| **@number-flow/react** | **živé čísla** (pulz, Korpus) — pretáčanie číslic | `steps(9)` roll, trend + prefix/suffix, NumberFlowGroup + continuous, `animated={false}` |
| **canvas-confetti** | oslava úspechu | X z cesty (`shapeFromPath`, flat), × zo znaku (`shapeFromText`), salva 4× po 120 ms |

**Pravidlá, aby sa motory nebili:**
1. **Nikdy GSAP a Motion na jednom prvku.** Obaja píšu `transform` → posledný vyhrá každý snímok, druhý „trhá“. Rozdeľ prvky: GSAP hýbe obalom
   (pás, scéna), Motion vnútrom (karta, tlačidlo). V podpise 4 GSAP posúva `<ol>`, karty majú CSS hover. V podpise 1 opona = CSS, obsah hera = Motion.
2. **Ani CSS preset (`lift`, `press`, `card-drop`, `bk-press`) na prvku s GSAP alebo Motion `layout`/`layoutId`.** CSS `transition: transform` bojuje
   s JS transformom (MorphingDialogTrigger — pozri vyššie). Motion `whileHover` + tieň ako samostatná vrstva namiesto `press`.
3. **Lenis + ScrollTrigger:** `window.__lenis.on('scroll', ScrollTrigger.update)` a pri odchode `off` (MotoryGsap, podpis 4). Vnútorné scroll boxy
   (`overflow-auto`, dialógy, cmdk) potrebujú `data-lenis-prevent`, inak koliesko scrolluje stránku.
4. **CSS scroll-timeline vs. JS:** kde stačí reveal/parallax, CSS (0 JS, beží mimo hlavného vlákna). Do `animation-timeline` vždy cez `--tl`,
   inak ju minifikátor zlúči do skratky `animation` a Chrome ju zahodí. Skratku `animation` písať pred `animation-timeline`.
5. **Schody, nie plávanie:** GSAP `ease: 'steps(n)'`, CSS `steps(n, end)`, Motion `ease: t => Math.ceil(t*n)/n`, NumberFlow `easing: 'steps(n, end)'`,
   snap v ScrollTriggeri. Spring iba krátky a bez odrazu (`bounce: 0`).
6. **Počítadlá:** jeden motor na web. Odporúčam **NumberFlow** pre živé čísla (pulz, SSR hodnota, respektuje reduced motion sám) a **CountUp** pre
   jednorazové „naskočenie“ faktov (sk formát). NumberTicker (chyba s medzerou) a AnimatedNumber netreba.
7. **Scramble:** jeden motor. Motto = DecryptedText (sekvenčne, čítačka dostane text) po oprave hydratácie; menu = ScrambleHover (`active`);
   TextScramble tam, kde treba 1 kB. ScrambledText (GSAP, myš) len ako efekt pre desktop.
8. **Reduced motion:** global.css skráti všetko na 120 ms; JS motory sa strážia samé (gsap.matchMedia, useReducedMotion, disableForReducedMotion).
   Shadery pri reduced `speed={0}`, pin a ImageTrail sa nespúšťajú. **Ťažké efekty** (WebGL, ImageTrail, kurzor, pin) len
   `(hover:hover) and (pointer:fine) and (min-width:1024px)`.
9. **Farby pre canvas/WebGL:** shadery berú len hex/rgb/hsl (oklch → `console.error Unsupported color format`), canvas-confetti len hex.
   Tokeny ink/paper sú OKLCH → preklad cez 1 px canvas (`shared.tsx: tokenRgb / tokenHex`), žiadny hex v zdroji.

---

## G · Podpisové pohyby pre domov (recepty) — `Podpisy.tsx`

1. **Opona po schodoch → hero** (variant `src/components/home/Opona.astro`, ten ostal nezmenený). Krídla XVA | DUR v javisku s `container-type: inline-size`
   (jednotky `cqw` namiesto `vw` → funguje v ľubovoľnom boxe), pod wordmarkom sa EKG krivka nakreslí `steps(8)`, krídla sa rozídu `steps(5)` s tvrdým tieňom
   na hrane, štart až vo viewporte, tlačidlo „Prehrať znova“. Hero je pod oponou celý čas (opona ho odhalí), po `animationend` sa BoldKit Badge,
   Sticker a Stamp „vyrazia“ Motionom po schodoch. Motory: CSS (opona) + Motion (nálepky) + BoldKit Button/Badge/Sticker/Stamp. Reduced = bez opony.
   Na domov: vymeniť `vw` za `cqw` netreba (celá obrazovka), prevziať EKG a `steps(5)` do `Opona.astro`.
2. **Motto dešifrovanie.** Motto trvalo čitateľné; každé 4 s (len keď je v obraze) prebehne sekvenčná vlna zo stredu (DecryptedText, šum `text-stamp`).
   Prepínač ukazuje aj TextScramble (Motion Primitives) a ScrambleHover (Fancy, hover/fokus). BoldKit Card ink + Badge + Stamp. Čítačka má `sr-only` motto.
3. **Korpus naživo.** `usePulz()` číta `/pulse.json` (SSR = snímka `ZIVE_CISLA`), NumberFlow pretočí `words_month` z 0 v `steps(11)` pri vstupe do obrazu,
   EKG pás beží `steps(24)`; vedľa Korpus celkom (NumberTicker, `KORPUS.slova` 572 469) a dni v rade (CountUp). BoldKit Card + Badge „● naživo“ s časom snímky.
4. **Cesta vodorovne.** CESTA (5 staníc) ako BoldKit karty so Stickerom; ≥ 1024 px bez reduced motion GSAP pin + scrub + **snap na každú stanicu**,
   počítadlo 01 / 05 a pás idú po krokoch; mobil / reduced = natívny vodorovný scroll so `scroll-snap`. GSAP sa importuje dynamicky v efekte.

---

## H · Overenie (29. 9. 2026)
- `npx astro build --outDir dist-kit-vendor` ✔ · `npx astro check` 0 chýb (0 v mojich súboroch).
- Playwright (1440×900, 375×812 dotyk, 1440 reduced): `scrollWidth − innerWidth` = 0 / 0 / 0; pageerror 0, console error 0.
  Desktop hlási 4 warningy `GL Driver Message … GPU stall due to ReadPixels` — ovládač headless WebGL pri celostránkovom screenshote shaderov, nie chyba kódu.
- Screenshoty `work/screens/kit-vendor-{d,m}.png`. Opona overená po snímkach (zatvorená → krídla v polovici → hero) na 1440 aj 375 px.
- Opravené počas QA: hydratácia DecryptedText, decomp poradie, skok stránky z cmdk, medzery v NumberTicker, lámanie slov v ScrambledText/SplitText,
  padding Stepperu, pretekajúce CTA na 375 px, EKG pás na mobile.
