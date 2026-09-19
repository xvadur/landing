# NOTES_lab — katalóg vendorovaných komponentov xvadur.com v4 (19. 9. 2026, vetva `v4`)

Lab agent. Stránka `/lab/` (`src/pages/lab.astro`, noindex, `islands="lite"`) montuje 5 galérií `src/components/lab/*Lab.tsx`
každú ako `client:only="react"`. Hore zoznam všetkých ciest z `routes.ts` (nepostavené vrátia 404). `npx astro check` = 0 chýb,
`npx astro build` = zelený, `npm test` = OK. QA: `python3 -m http.server 4180 -d dist/client & node work/qa/lab.mjs`
(1440×900, 375×812 dotyk, reduced motion; 0 page errorov, 0 vendor console errorov — jediné console chyby sú prefetch 404 na
nepostavené cesty; scrollWidth = viewport; screenshoty `work/screens/lab-desktop.png`, `lab-mobile.png` v mierke 0,5 — Chromium
kreslí celostránkový screenshot len do ≈ 16 384 px). Playwright 1.63 + Chromium 1243 nainštalované.

## Nainštalované (package.json, presné verzie)
- `canvas-confetti@1.9.4` + dev `@types/canvas-confetti@1.9.0` (Magic UI Confetti) · `poly-decomp@0.3.0` (Fancy Gravity, konkávne SVG telesá;
  typy v `src/components/vendor/fancy/physics/poly-decomp.d.ts`). Žiadny balík nechýba, nič nebolo odstránené.

## Opravy v labe
- `magicuiLab.tsx`: vnútorné `<h1>` → `<p>` (stránka má jediný h1). · `fancyLab.tsx`: Gravity dostal `decomp={decomp}` (X ako presné SVG teleso);
  MarqueeAlongSvgPath: dráha v px (viewBox 520 × 520) + `responsive` — bez toho `offset-path` berie jednotky viewBoxu ako px a položky sa zhŕknu v rohu.

## Spoločné pravidlá (platí pre všetko nižšie)
Retheme len cez tokeny/utility (`brutal`, `border-3 border-ink rounded-lg shadow-brutal`, `bg-*`/`text-*`), žiadny hex. `client:visible` default;
`client:only="react"` všade, kde je GSAP plugin, matter-js, canvas alebo `window` pri importe. Reduced motion: každý komponent má vlastnú stráž
(120 ms fade / statický stav). Importovať po súboroch, nie z barrelu (inak sa ťahá GSAP/matter/confetti). Váha gz (bez React 65 kB):
Motion runtime ≈ 40 kB raz na stránku (TiltedCard, Stepper, CountUp, motion-primitives, Fancy, Magic UI Dock/Ticker); GSAP vetva ≈ 50 kB (SplitText + ScrambledText);
matter-js ≈ 27 kB (Gravity); lab chunky: reactbits 61, fancy 43, neobrutalism 36, magicui 17, motionprimitives 8 kB gz.

## 1 · neobrutalism.dev (`@/components/vendor/neobrutalism/*`, Radix verzia, MIT) — client:visible, SSR OK
| Komponent | Import | Kľúčové props | Pozor |
|---|---|---|---|
| Button | `…/button` | variant default/noShadow/neutral/reverse/ghost; tone 9 farieb; size sm/default/lg/xl/icon*; asChild | výšky ≥ 44 px; `buttonVariants` export |
| Badge | `…/badge` | variant default/flat/sticker; tone; tilt none/left/right | sticker+tilt = „V STAVBE“ |
| Card (+Header/Title/Description/Action/Content/Footer) | `…/card` | tone; variant default/flat/lg; interactive; stamp; size; CardTitle as h2–h4 | CardAction a stamp naraz sa prekrývajú |
| Dialog (+Trigger/Content/Header/Footer/Title/Description/Close) | `…/dialog` | DialogContent showCloseButton, tone, size sm/default/lg | data-lenis-prevent; z-[100]; mobil dole, desktop stred |
| Sheet | `…/sheet` | SheetContent side right/left/top/bottom, showCloseButton | mobilná nav ostáva vaul Drawer |
| Input / Textarea | `…/input`, `…/textarea` | natívne props; aria-invalid = hot rám + pink | label dodáva stránka |
| Select (+Group/Value/Trigger/Content/Label/Item/…) | `…/select` | SelectTrigger tone white/yellow/paper; SelectContent popper | popover z-[110]; položky min-h-11 |
| RadioGroup (+Item, RadioGroupCard) | `…/radio-group` | RadioGroupCard {value, disabled, id, children} = celá karta label | kruh 24 px + 44 px dotyk cez ::before (QA hlási 24×24, je to OK) |
| Progress (+Label/Value) | `…/progress` | value, max, tone, size | dodať aria-label |
| Command (+Dialog/Input/List/Empty/Group/Item/Shortcut/Separator) | `…/command` | CommandDialog {title, description, open, onOpenChange}; CommandInput eyebrow | Lab má vlastný ⌘K listener → na stránke s ⌘K v Base nepoužívať dva |
| Tabs (+List/Trigger/Content) | `…/tabs` | TabsList variant default/line; orientation | dlhé názvy scrollujú vodorovne |
| Tooltip (+Trigger/Content/Provider) | `…/tooltip` | TooltipContent tone yellow/ink/white | len hover/fokus — na dotyku nesmie niesť jedinú informáciu |
| Separator | `…/separator` | orientation, decorative, variant default/x, label | shadcn MIT |
| theme.css | `…/theme.css` | — | importujú ho komponenty; data-state animácie + reduced fade |

## 2 · React Bits (`@/components/vendor/reactbits/*`, MIT + Commons Clause, hlavičky (c) David Haz ostávajú)
| Komponent | Ostrov | Props | Pozor |
|---|---|---|---|
| SplitText (default export) | **client:only** | text, tag, splitType chars/words/lines, delay, duration, ease, from/to (aj fontVariationSettings wdth), immediate (hero bez ScrollTriggeru), threshold, className | GSAP core+ScrollTrigger+SplitText ≈ 50 kB gz; reduced = statický text; bez Motion/presetov na tom istom prvku |
| ScrambledText (default) | **client:only** | children text, as, radius, duration, speed, scrambleChars, className | len myš+hover, bez reduced (data-scrambled) |
| DecryptedText (default) | client:visible/idle | text, animateOn view/hover/inViewHover/click, sequential, revealDirection, speed, maxIterations, characters | 2,4 kB, bez GSAP — pre lite podstránky; sr-only pôvodný text |
| Magnet (default) | client:idle | children, padding, magnetStrength, disabled | len jemný ukazovateľ + hover + bez reduced; CTA: Magnet > ClickSpark > `<a class="press …">` |
| ClickSpark (default) | client:idle | children, sparkColor (názov tokenu), sparkSize, sparkRadius, sparkCount, duration | canvas z-10 vo wrapperi; reduced = bez iskier |
| TiltedCard (default) | client:visible | children, imageSrc?, captionText, rotateAmplitude, scaleOnHover, surfaceClassName | Motion ≈ 45 kB; tilt len myš, inak lift/press |
| CountUp (default) | client:visible | to, from, duration, separator (NBSP), decimal ',', prefix, suffix, as | sk formát „2 034“; reduced = cieľ hneď; SSR vypíše štart |
| Stepper (default) + `Step` | client:visible | initialStep, onStepChange, onFinalStepCompleted, back/next/completeButtonText (sk), completedContent, *ClassName | Motion; indikátory 44 px; reduced fade |
| Noise (default) | client:visible | patternSize, patternRefreshInterval, patternAlpha, animate | rodič relative overflow-hidden, obsah relative z-10 |
| motion-guards | — | prefersReducedMotion(), hasFinePointer(), isDesktopPointer(), usePrefersReducedMotion(), usePointerEffectAllowed(), resolveTokenColor() | spoločné stráže |

## 3 · Fancy (`@/components/vendor/fancy/**`, MIT) — bez barrelu (matter-js nesmie do lite ostrovov)
| Komponent | Ostrov | Props | Pozor |
|---|---|---|---|
| ScrambleHover | client:visible | text, scrambleSpeed, maxIterations, sequential, revealDirection, characters, active?, as | hover aj fokus; reduced = statický |
| VerticalCutReveal | client:visible | children string, splitBy words/characters/lines, staggerDuration, staggerFrom, startOnView, autoStart, reverse; ref {startAnimation, reset} | reduced = viditeľné hneď; Intl.Segmenter('sk') |
| MarqueeAlongSvgPath | client:visible | path (px!), viewBox, **responsive**, baseVelocity, direction, repeat, slowdownOnHover, draggable, grabCursor, showPath, pathStrokeWidth | dráhu písať v px viewBoxu + responsive (inak zhluk v rohu); deti `-translate-x-1/2 -translate-y-1/2`; reduced = stojí |
| StickerPeel (**partial**, vlastná implementácia nad Motion) | client:visible | children, colorClassName, rotate, peelSize, restPeel, draggable, dragConstraints, shadow, label | Fancy originál neexistuje (doc 10 omyl) |
| ImageTrail + ImageTrailItem | client:visible | threshold, intensity, keyframes, repeatChildren, enabled?; Item as/className | beží len hover+fine pointer+≥ 1024 px, bez reduced; inak 0 práce |
| Gravity + MatterBody | **client:only** | gravity, grabCursor, addTopWall, autoStart, startOnView, resetOnResize, decomp (poly-decomp); MatterBody x/y/angle/bodyType rectangle/circle/svg/isDraggable/matterBodyOptions; ref {start, stop, reset} | rodič relative + pevná výška; matter-js ≈ 27 kB; dotyk len nad telesom; reduced = kopa stojí |
| hooks/utils | — | use-media, use-mouse-position, use-dimensions, use-screen-size, use-detect-browser; calculate-position, svg-path-to-vertices | — |

## 4 · Magic UI (`@/components/vendor/magicui/*`, MIT) — importovať po súboroch (confetti ťahá canvas-confetti)
| Komponent | Ostrov | Props | Pozor |
|---|---|---|---|
| Marquee | SSR/CSS | reverse, pauseOnHover, vertical, repeat, duration, gap, bordered, className (bg token) | horizontál cez globálne .marquee; reduced stojí; záloha k site/Marquee.astro |
| Terminal + TypingAnimation + AnimatedSpan | client:visible | sequence, startOnView, title, variant ink/white; TypingAnimation duration/delay/as | SSR vypíše prázdny text (až s JS) |
| Confetti + ConfettiButton + fireConfetti + useConfetti | **client:only** (canvas) | options, globalOptions, manualstart, ref.fire(); brandConfettiOptions() | farby z tokenov za behu; reduced = nič |
| ScrollProgress | client:idle | color token, className | fixed top; články majú islands none → radšej CSS animation-timeline |
| Dock + DockIcon | client:visible | iconSize 44, iconMagnification, iconDistance, disableMagnification, bg; DockIcon href/label/external/color | Motion; dotyk = statické 44 px |
| NumberTicker (+formatTicker) | client:visible | value, startValue, direction, delay, decimalPlaces, locale sk-SK, prefix, suffix | záloha k NumberFlow; reduced = skok |
| ShineBorder | client:visible | borderWidth, duration, shineColor (tokeny), className | rodič relative + rounded-lg; voliteľné |

## 5 · Motion Primitives (`@/components/vendor/motionprimitives/*`, MIT) — každý (okrem TextScramble) ťahá Motion ≈ 40 kB
| Komponent | Ostrov | Props | Pozor |
|---|---|---|---|
| Cursor | client:visible | children, springConfig, attachToParent, variants, onPositionChange | null pod 1024 px / dotyk / reduced; globálny X je site/Cursor.tsx |
| MorphingDialog (+Trigger/Container/Content/Close/Title/Subtitle/Description/Image) | client:visible | transition; Content className; Close aria-label | body overflow lock, Esc, fokus späť; data-lenis-prevent |
| TransitionPanel | client:visible | children[], activeIndex, variants, transition | pre kvíz; obal overflow-hidden; na lite stránke zváž CSS prechod (rozpočet 70 kB) |
| TextScramble (+SCRAMBLE_CHARS_SK) | client:visible | children string, duration, speed, characterSet, as, trigger, onScrambleComplete | 0,7 kB, bez Motion; SSR = finálny text |
| InView (+inViewDropVariants) | client:visible | children, variants, transition, viewOptions, as, once | pre 0 kB radšej utilita `reveal` |
| AnimatedNumber | client:visible | value, springOptions, as, locale, format | štart = hodnota pri mount (0 → cieľ po useInView) |
| Magnetic | client:idle | children, intensity, range, actionArea self/parent/global | záloha k Magnet |

## Rozbité / odstránené
Nič. Všetkých 5 knižníc kompiluje a beží v Labe. Jediný „partial“: Fancy StickerPeel = vlastná implementácia (originál v Fancy neexistuje).

## Otvorené
- `tsconfig.json` (read-only): priamy `npx tsc -p tsconfig.json` padá na TS5101 (`baseUrl` deprecated v TS 6) — `astro check` je OK; navrhujem `"ignoreDeprecations": "6.0"`.
- `src/components/vendor/README.md` (read-only) uvádza priečinok `react-bits/`, skutočný je `reactbits/`.
- Lab je ťažký (≈ 245 kB gz JS + zdieľané chunky) — je interný; page agenti nech berú po jednom komponente podľa rozpočtu doc 10.
- Prefetch odkazov na nepostavené cesty loguje 404 v konzole — zmizne, keď stránky vzniknú.
