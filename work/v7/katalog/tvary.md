# Katalóg V7 · skupina TVARY (29. 9. 2026)

Stránka `/kit/tvary/` (`src/pages/kit/tvary.astro`, noindex, 10 ostrovov: prvý `client:load`, ostatné `client:visible`).
Komponenty `src/components/v7/kit/tvary/`: `Spolocne.tsx` (hlavička kusu, bunka, prepínače, prevod tokenu na RGB pre canvas),
`Tvary.tsx`, `Ascii.tsx`, `CanvasEfekty.tsx`, `Nalepky.tsx`, `Vrstvy.tsx`, `Krivky.tsx`, `Nacitanie.tsx`, `Pas.tsx`, `Pohyb.tsx`, `HeroKompozicie.tsx`.

**Záplata katalógu** (`<style is:global>` v `tvary.astro`, trieda `.kit-zaplata` na `<main>`): dopĺňa CSS, ktoré kit volá, ale v repe chýba
(plynulé animácie tvarov, keyframes spinnera, marquee slow/fast). Na webe tieto veci dnes stoja — opravy nižšie v „Problémy“.

Obsah: texty a čísla iba z `src/data/{cesta,ponuka,fakty,terminy}.ts` a `src/components/hero/hero-data.ts`. Netopierove čísla (ROZPOR 5)
som vynechal, na kartách je Agentový systém, Trhový dataset, Systém pre makléra, Hriech, Korpus a ZIVE_CISLA.

---

## shapes — `src/components/ui/shapes.tsx`
- **Čo robí:** 55 SVG tvarov s tvrdým obrysom (nie 64): geometrické (12), matematické (6: Koch, Penrose, trojlístok, Fibonacci, Möbius, torus), hviezdy a výbuchy (7), organické (5), nebeské (5), odznaky (13: šípka, stuha, štít, cenovka, lístok, kupón, záložka, vlajka, **tabletka**, pečať, vlnitý obdĺžnik), ozubené koleso, komunikácia (bublina, kurzor, oko), dekorácia (čmáranica kruh / podčiarknutie, trhaný papier). Plus 11 skupinových objektov (`GeometricShapes` … `shapes` so všetkými 55).
- **Props (všetky tvary):** `size` (px, šírka; výška podľa pomeru 1 : 0,2 až 1 : 1), `strokeWidth`, `filled` (výplň vs. obrys), `color` (výplň, pri `filled=false` farba čiary), `strokeColor`, `animation` = `none | spin | pulse | float | wiggle | bounce | glitch | spin-step | pulse-hard | marquee-stamp`, `speed` = `slow | normal | fast`, + všetky SVG props (style, className). **Rotácia nie je prop** (style/className).
- **Na čo:** hero dekorácia (kríž, tabletka, štít, pečať), nosiče textu (tabletka „Vyšetrenie · 30 minút“, pečať „47 / 47“, bublina s citátom), podčiarknutie mena, pozadia sekcií, triáž.
- **Hriech / Netopier:** Hriech — `SpeechBubble` + `EyeShape` ako „čo médiá tvrdia / čo vidíme“, `SplatShape` ako pečiatka lži; Netopier — `EyeShape`, `KochSnowflakeShape` (sieť), `GearShape` (engine), `TrefoilShape` (prepojenia redakcií).
- **Problémy:**
  1. Plynulé animácie `spin/pulse/float/wiggle/bounce/glitch` nemajú CSS — `getAnimClass` (r. 44) generuje `shape-animate-*`, ale `src/styles/motion.css` má iba `spin-step`, `pulse-hard`, `marquee-stamp`. **Oprava:** preniesť keyframes a triedy z `tvary.astro` (sekcia 1 záplaty) do `motion.css` + pridať ich do reduced-motion guardu (r. ~321).
  2. Východzie farby sú triedy `text-accent` (= hot) pri 10 tvaroch → porušuje „hot iba na CTA a X“. Na webe vždy posielaj `color`.
  3. `ScribbleUnderline` (r. 1052) nemá `filled/color/strokeColor` v deštruktúre: `filled` a `strokeColor` padnú do DOM → varovanie Reactu v konzole; `color` náhodou funguje cez SVG atribút `color` → currentColor. **Oprava:** deštruktúrovať ako ostatné.
  4. `strokeWidth - 1` (r. 636, 1044, 1074) pri `strokeWidth=0` dá zápornú hodnotu → chyba SVG v konzole. **Oprava:** `Math.max(0, strokeWidth - 1)`.
  5. `RainbowShape`: `color` prefarbí všetky 3 oblúky rovnako (dúha zanikne); bez `color` sú oblúky stamp / yellow / white. `TagShape`, `EyeShape`, `AppleShape` majú časť natvrdo `--foreground`; `MobiusStripShape`, `TorusShape`, `GearShape` dieru `--background` (na inom pozadí ako paper je vidno „papierový“ otvor).
  6. `aria-hidden` natvrdo — ako nosič významu (štít s krížom) treba text vedľa.

## ascii-shapes — `src/components/ui/ascii-shapes.tsx`
- **Čo robí:** 17 animovaných ASCII tvarov v `<pre>`: Spiral, Rose, Wave, Vortex, **Pulse** (kruhy z centra), Matrix, Grid, Torus, Sphere, Cube, Helix, Donut, TrefoilKnot, GeodesicDome, Saturn, Hyperboloid, **DNA**. rAF prepisuje `textContent`, zastaví sa mimo obrazovky, v skrytom tabe a pri reduced motion (vždy nakreslí 1 snímok).
- **Props:** `size` = `sm (24×12) | md (48×24) | lg (72×36) | hero (120×60)`, `charset` = `blocks | braille | classic | line | dots` (každý tvar má vlastný východzí), `color`, `speed` = `slow | normal | fast` (0,4 / 1 / 2,2×), `animated`, `multicolor`, + HTML props `<pre>`.
- **Na čo:** živý „monitor“ (Pulse = tep, DNA = anamnéza, Wave = EKG textúra), pozadie hera bez obrázka, dôkaz/čísla Korpusu (ukážka: čierny rám so žltým Pulse + 572 469 slov).
- **Hriech / Netopier:** Netopier — `AsciiMatrix` (prepisy padajú), `AsciiGeodesicDome` (sieť redakcií); Hriech — `AsciiVortex` (vír dezinformácií), charset `line`.
- **Problémy:**
  1. 3D tvary (Torus, Cube, Helix, TrefoilKnot, GeodesicDome, Hyperboloid, DNA, čiastočne Rose) využijú len malý stred mriežky — aj pri `md` (48×24) sú drobné a pri `sm` skoro prázdne. Škála v draw funkciách (napr. `screenScale`, `aspect`) nezohľadňuje pomer znaku 1 : 2. Používaj `lg`/`hero` alebo oprav škálu; plošné tvary (Spiral, Vortex, Pulse, Matrix, Grid, Wave) vyplnia rám dobre.
  2. `hero` má pri `text-xs` ~870 px → na mobile pretečie; treba `overflow-x-auto` alebo menšie písmo cez className.
  3. `multicolor` (r. 47) strieda primary/secondary/accent/warning/info/success → v tokenoch ink, yellow, hot, yellow, **white**, yellow: na paper pozadí `<pre>` sú biele a žlté riadky neviditeľné. **Oprava:** paleta `[foreground, destructive, foreground, accent]` alebo vypnúť.
  4. Rám `shadow-[4px_4px_0px_hsl(var(--shadow-color))]` natvrdo 4 px (web má 6/6 desktop) — pri ploche bez rámu treba `border-0 shadow-none`.
  5. Každý snímok alokuje novú mriežku (`makeGrid`) — pri `hero` a viacerých naraz citeľné na slabom mobile.

## canvas efekty — `src/hooks/use-canvas-effect.ts` + `src/lib/canvas-effect-core.ts`
- **Čo robí:** hook `useCanvasEffect(ref, setup, options)` → `mountCanvasEffect`: veľkosť podľa `devicePixelContentBoxSize`, strop pixelov, `dt` orezané na 100 ms, pauza mimo obrazovky a v skrytom tabe, reduced motion = 1 statický snímok, `AbortSignal` na listenery.
- **Možnosti:** `maxPixelCount` (1920×1080×2), `minPixelRatio` (1), `respectReducedMotion` (true), `pauseOffscreen` (true), `coordinates` (`'device' | 'css'`).
- **Hotové efekty dither / halftone / CRT / plazma / aurora v repe NIE SÚ** (BoldKit priniesol iba hook a jadro). V katalógu je 6 receptov nad hookom (`CanvasEfekty.tsx`, komponent `<CanvasEfekt druh rychlost bunka paleta scanlines>`), farby = tokeny cez `rgbTokenu()` (vypočítaný `--color-*` → fillStyle → RGB):
  - `crt` — EKG stopa s dosvitom fosforu, mriežka monitora, hlava bliká alarmovou (stamp) pri QRS, riadky a vinetácia cez CSS vrstvu `.kit-scanlines`.
  - `dither` — 1-bit Bayer 4×4 pohyblivého kruhového poľa (2 farby).
  - `halftone` — rastrové bodky, polomer podľa vlny.
  - `plazma` — súčet 4 sínusov kvantovaný do palety s ditherom, stupňovitý čas (12 krokov/s).
  - `aurora` — vrstvené závesy s tvrdými hranami (bez prechodov, bez pastelov).
  - `sum` — šum „bez signálu“ s rolujúcim pruhom.
- **Na čo:** pozadie hera (monitor), tieň fotky (dither), rám pečiatky (halftone), prechod/načítanie (šum), sekcia Vitálne funkcie (CRT + ZIVE_CISLA).
- **Hriech / Netopier:** Hriech — `sum` a `dither` (rozbitý signál médií), Netopier — `halftone` ako novinový raster, `crt` ako monitor sledovania.
- **Problémy:** žiadne v hooku. Pozor: zmena palety/bunky vyžaduje remount (`key`), setup beží raz. Recepty per-pixel počítajú v nízkom rozlíšení (`bunka`), inak by 4K plátno stálo veľa JS. Návrh: preniesť `CanvasEfekty.tsx` do `src/components/ui/canvas-effects.tsx`.

## sticker — `src/components/ui/sticker.tsx`
- **Čo robí:** 3 komponenty. `Sticker` (štítok), `Stamp` (okrúhla pečiatka), `StickyNote` (lístoček). Exportuje aj `stickerVariants`, `stampVariants`, `stickyNoteVariants`.
- **Sticker:** `variant` = `default (hot) | primary (ink) | secondary (yellow) | destructive (stamp) | outline (paper) | neon`, `size` = `sm | default | lg | xl`, `rotation` = `none | slight | medium | heavy | slight-right | medium-right | heavy-right` (±2/6/12°), `shadow` = `none | default | colored | double`, `dashed`, `tape`, `interactive`.
- **Stamp:** `variant` = `default (ink) | secondary | accent | destructive | outline`, `size` = `sm (64) | default (96) | lg (128) | xl (160 px)`, `rotation` = `none | slight | medium | heavy` (−12/−25/−45°), `doubleRing`.
- **StickyNote:** `variant` = `yellow | pink | blue | green | purple`, `size` = `sm | default | lg`, `rotation` = `none | left | right | tilt-left | tilt-right`, `pin` (špendlík stamp), `folded` (zahnutý roh, default true).
- **Na čo:** pečiatka OVERENÉ na fotke, stav produktu (Kohorta · štart v januári, Telegram · 90 dní), „Zatiaľ zadarmo“, „10 rokov v nemocnici“, citát z cesty na lístočku, triáž.
- **Hriech / Netopier:** Hriech — `Stamp destructive` „NEPRAVDA / OVERENÉ“ na citátoch, `StickyNote` ako redakčná poznámka; Netopier — `Sticker outline dashed` pre neoverené tvrdenia.
- **Problémy:**
  1. `text-accent-foreground` = **paper na hot (3,2 : 1)** v Sticker `default` (r. 10), Stamp `accent`, StickyNote `yellow` (r. 160). Zákon: text na hot je ink. **Oprava:** v `src/styles/boldkit.css` `@theme` pridať `--color-accent-foreground: var(--color-ink);` (tokens.css r. 65 má paper; `:root --accent-foreground` v boldkit.css už je ink — dve vrstvy si odporujú).
  2. `neon` (r. 15) má natvrdo hex `#ff2d78` (pastelová ružová) → zmazať alebo namapovať na token.
  3. `tape` (r. 83) = `bg-accent/80` → hot páska; pre web lepšie `bg-yellow`.
  4. StickyNote mená farieb nesedia s tokenmi („yellow“ = hot, „pink“ = ink, „blue“ = biela, „green“/„purple“ = žltá). Premenovať na sémantické (`accent`, `ink`, `white`, `yellow`).
  5. Sticker `shadow="colored"`/`"double"` používajú `--primary` = ink → vyzerajú ako `default`.
  6. `interactive` nerobí z divu tlačidlo (bez role/tabIndex/klávesnice) — pri klikaní pridať `role="button" tabIndex={0}` alebo použiť `<button>`.

## layered-card — `src/components/ui/layered-card.tsx`
- **Čo robí:** karta so stohom 1–3 posunutých vrstiev (opacity 100/70/50 %), podkomponenty `LayeredCardHeader` (bg-muted), `Title`, `Description`, `Content`, `Footer` (bg-muted).
- **Props:** `layers` = `single | double | triple`, `offset` = `sm (6) | default (8) | lg (12 px na vrstvu)`, `layerColor` = `default | primary (ink) | secondary (yellow) | accent (hot) | muted`, `interactive` (hover −4 px).
- **Na čo:** chorobopisy projektov, karta Vyšetrenia s CTA, rám fotky v hero (kompozícia 02 Triáž), stoh „pacientov“.
- **Hriech / Netopier:** Hriech — stoh článkov (vydania), Netopier — spis redakcie (vrstvy = zdroje).
- **Problémy:** vrstvy presahujú kartu až o 36 px (triple + lg) bez rezervy → rodič potrebuje padding, inak pretečenie na mobile. Rohy natvrdo hranaté (pre zaoblený rám treba `[&>div]:rounded-*`). `interactive` len posunie hornú kartu, tieň sa nemení.

## math-curve-background — `src/components/ui/math-curve-background.tsx`
- **Čo robí:** jedna veľká parametrická krivka ako pozadie (SVG `slice`), hlava (štvorec) po nej beží, dráha „dýcha“; `children` ležia nad ňou.
- **Props:** `curve` = `rose | lissajous | fourier | spiral | triskelion | involute | epicycloid`, `speed` = `slow (9 s) | normal (5,5 s) | fast (3 s)`, `opacity` (0,15), `trackColor` (currentColor), `headColor` (primary = ink), `strokeWidth` (2).
- **Na čo:** tiché pozadie hera / vyšetrenia / zápisu (ukážka: triskelion za kartou Vyšetrenia), kompozícia 03 (lissajous).
- **Hriech / Netopier:** Netopier — `involute`/`spiral` ako sledovanie (kruh sa uzatvára).
- **Problémy:** rAF beží stále, aj mimo obrazovky (r. 85–97, bez IntersectionObserver na rozdiel od ASCII a canvas jadra) a každý snímok prestavia celé `d` → viac pozadí na stránke = zbytočná práca. **Oprava:** pauza cez IntersectionObserver ako v `canvas-effect-core`. `opacity` platí aj pre hlavu. `ErrorBoundary` fallback je veľká karta (nevhodná pre pozadie).

## math-curve-loader — `src/components/ui/math-curve-loader.tsx`
- **Čo robí:** načítavanie ako krivka s bežiacou hlavou, `role="status"`, stopa 20 % (hover 40 %).
- **Props:** `curve` = 17 kriviek (`rose, lissajous, butterfly, hypotrochoid, cardioid, lemniscate, fourier, rose3, astroid, deltoid, nephroid, epicycloid, superellipse, triskelion, involute, spiral, heart`), `size` = `xs | sm | md | lg | xl` (24–96 px), `speed`, `trackColor`, `headColor`, `strokeWidth` (4), `headSize` (8), `aria-label` (default „Loading“).
- **Na čo:** „Overujem voľný termín“ (lemniskáta), „počítam skóre“, `heart` ako tep.
- **Hriech / Netopier:** `butterfly`/`fourier` ako „analyzujem prepis“.
- **Problémy:** rovnaký rAF bez pauzy mimo obrazovky; anglický `aria-label` default.

## spinner — `src/components/ui/spinner.tsx`
- **Čo robí:** indikátor práce, `role="status"`.
- **Props:** `variant` = `default (SVG kruh, animate-spin) | dots | bars | blocks | brutal`, `size` = `xs | sm | md | lg | xl`.
- **Na čo:** tlačidlo pri odosielaní zápisu/rezervácie, výpočet skóre.
- **Problémy:**
  1. `dots/bars/blocks/brutal` volajú keyframes `brutal-dots`, `brutal-bars`, `brutal-blocks`, `brutal-shadow-spin` (r. 57–110), ktoré **neexistujú** → stoja. **Oprava:** keyframes zo záplaty do `motion.css`.
  2. `blocks` (r. 89): rotujúci obal nemá rozmer → 4 bloky v jednom bode. **Oprava:** `className={cn('relative animate-[…]', sizes.element)}`.
  3. `brutal` (r. 110): tieň `hsl(var(--primary))` = ink na ink → neviditeľný. **Oprava:** `--accent` alebo `--secondary`.
  4. `aria-label="Loading"` anglicky (dá sa prepísať, prop ide po ňom).

## skeleton — `src/components/ui/skeleton.tsx`
- **Čo robí:** zástupný blok, `aria-hidden` (ohlasuje rodič cez `aria-busy` / `role=status`).
- **Props:** `variant` = `pulse (animate-pulse) | stamp (tvrdé zap/vyp) | blocks (pochodujúce bunky) | scan (pruh) | none`.
- **Na čo:** načítanie pulzu Korpusu, termínov, skóre, chorobopisu.
- **Problémy:** rám `border-2 border-foreground/20` (r. 5) je iný jazyk ako 3 px ink → pre web `className="border-3 border-ink"`.

## marquee — `src/components/ui/marquee.tsx`
- **Čo robí:** nekonečný pás (2 polovice, druhá `aria-hidden` + `inert`), `MarqueeItem`, `MarqueeSeparator` (default „/“, children = čokoľvek: tvar, X, text).
- **Props:** `direction` = `left | right`, `speed` = `slow | normal | fast`, `pauseOnHover` (true, aj focus-within), `bordered` (true), `repeat` (4). Rýchlosť `normal` sa dá ladiť `style={{ '--marquee-duration': '12s' }}` (token `--animate-marquee`).
- **Na čo:** pás faktov (459 webov · 2 034 maklérov · 47 / 47 · 10 rokov), cesta (nemocnica → XVADUR), motto za fotkou v hero (kompozícia 03).
- **Hriech / Netopier:** Hriech — pás titulkov („breaking“), Netopier — pás mien redakcií.
- **Problémy:**
  1. `animate-marquee-slow` / `-fast` (r. 20, 22) neexistujú → `slow`/`fast` stoja. **Oprava:** v `tokens.css` pridať `--animate-marquee-slow` / `-fast` alebo v komponente meniť `--marquee-duration`.
  2. Token `marquee` posúva o −50 % vlastnej šírky polovice; komponent má dve polovice → posun by mal byť −100 % (alebo jedna stopa). Pri `gap-8` medzi kópiami pás na konci cyklu poskočí o pol medzery.
  3. Reduced motion rieši iba globálny guard v `global.css` (120 ms, 1 iterácia).

## motion — `src/components/ui/motion.tsx` + `src/lib/motion-core.ts` + CSS
- **Komponenty:** `Reveal` (`direction` up/down/left/right, `delay`, `threshold`, `rootMargin`, `once`, `as`), `Motion` (`press`, `stamp`, `pulse`, `as`), `Stagger` (`delay` 75, `initialDelay`, `selector`, `as`).
- **Hooky:** `useShake()` (pridá `.bk-shake-x`, čaká na animationend), `useViewTransition()` (recepty `hard-wipe | color-block | stamp`, nastaví `<html data-bk-transition>` iba na jeden prechod; Firefox a reduced motion = okamžite). Re-export `prefersReducedMotion`. (V core aj `observeReveal`, `staggerChildren`, `triggerAnimation`, `onReducedMotionChange`.)
- **CSS recepty (motion.css):** `bk-press`, `bk-stamp-in` (+ `-quick`, `-slow`), `bk-shake-x`, `bk-reveal` (+ smer, `-in`), `bk-slide-hard-x/-y`, `bk-pulse-shadow`, `bk-skeleton-stamp/-blocks/-scan`, `bk-progress-stepped`, `bk-progress-marquee`, `shape-animate-spin-step/pulse-hard/marquee-stamp` (+ slow/fast), view-transition recepty.
- **Easingy (živé dráhy + graf z reálnej hodnoty):** `--bk-ease-snap`, `--bk-ease-step` (steps 4), `--bk-ease-step-2`, `--bk-ease-stamp`, `--bk-ease-rubber`, `--bk-ease-linear`; `--ease-spring` (linear() pružina), `--ease-out-hard` (tokens.css); `--ease-in/-out/-in-out` a `--ease-out-quad…expo`, `--ease-in-out-quad…quint` (boldkit.css). Trvania `--bk-dur-instant/snap/quick/base/slow` (80–700 ms), `--duration-fast/base/slow` (120/180/500 ms).
- **Na čo:** vstupy sekcií (Reveal), CTA (press), pečiatka OVERENÉ (stamp), zápis s chybou (useShake), prepínanie krokov vyšetrenia (useViewTransition), cesta v sekvencii (Stagger).
- **Hriech / Netopier:** `stamp` na verdikt, `hard-wipe` medzi článkami, `bk-progress-marquee` pri spracovaní prepisu.
- **Problémy:**
  1. `bk-pulse-shadow::after` (motion.css r. 124) má `z-index: -1` → za bielym pozadím rodiča je tieň neviditeľný a v kombinácii s `stamp`/`press` (transform = stacking context) **prekryje obsah** čiernym blokom. **Oprava:** kresliť tieň cez `box-shadow` animáciu ako `.bk-press`, alebo `isolation: isolate` na prvku a obsah do vnútorného spanu.
  2. `Reveal` je pred hydratáciou `opacity: 0` → bez JS (alebo pri chybe ostrova) obsah nevidno. Pre SEO obsah radšej CSS `animation-timeline: view()`.
  3. `--bk-*` easingy a trvania sú definované dvakrát (boldkit.css `@theme` aj motion.css `:where(:root)`) — dva zdroje pravdy.
  4. `--ease-out/-in-out/-in` v boldkit.css prepisujú Tailwind predvoľby pre celý web (aj mimo BoldKitu).
  5. `useViewTransition` animuje celý `root` (celú stránku), nie jeden blok; v Reacte treba `flushSync` v callbacku.

## hero · 3 kompozície — `HeroKompozicie.tsx`
Zástupná plocha 4 : 5 so štítkom „FOTKA ADAMA“ (`role="img"`), tlačidlo **Prehrať oponu** zopakuje zjednodušenú oponu (žltá s bodkami, wordmark, motto, krídla do strán 900 ms `cubic-bezier(.76,0,.24,1)`; reduced motion = nič).
1. **Monitor** — tmavé hero, `CanvasEfekt crt` cez celú plochu (EKG s dosvitom), fotka v „monitore“ s tvrdým žltým tieňom, EKG pás cez fotku, `Stamp destructive doubleRing` OVERENÉ, `XZnak` hot, `Sticker` 10 rokov v nemocnici, 3 ZIVE_CISLA, CTA.
2. **Triáž** — žltá s bodkami, fotka v `LayeredCard triple` (ink vrstvy), za ňou halftone v kruhu, okolo CrossShape (spin-step), tabletka, Star4 (pulse-hard), x.svg, `Peciatka` OVERENÉ, titulok Vyšetrenia s `ScribbleUnderline`, pečať 47 / 47, lístoček s citátom (od sm).
3. **Fonendoskop** — papier + `MathCurveBackground lissajous`, pás motta (`Marquee`) za fotkou, dithered tieň fotky (ink/stamp), SVG hadička fonendoskopu okolo fotky, hlavica = `AsciiPulse` v kruhu, `Peciatka` OVERENÉ, `XZnak`, EKG pod fotkou, CTA.

Poznámky: v 01 a 03 hot iba na CTA a X. Kompozícia 01 je najbližšia „monitoru vitálnych funkcií“ z V5.3; 02 najviac neobrutalizmu; 03 najviac pohybu (pozor na výkon: krivka + pás + 2 canvas + ASCII).

---

## Overenie (29. 9. 2026)
- `npx astro build --outDir dist-kit-tvary` prešiel.
- `npx astro check` — 0 chýb a 0 varovaní v `src/components/v7/kit/tvary/**` a `src/pages/kit/tvary.astro`.
- Playwright (1440×900 a 375×812, `sessionStorage.opona=1`): `scrollWidth − innerWidth` = 0 / 0, chyby konzoly a pageerror 0 / 0 (aj po klikaní: animácie, multicolor, hero ASCII, useShake, view transitions, opona). Screenshoty `work/screens/kit-tvary-d.png`, `kit-tvary-m.png`.
