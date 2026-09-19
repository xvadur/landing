# NOTES_domov — Domov xvadur.com v4 (19. 9. 2026, vetva `v4`)

Agent Domov. Cesta `/`. Build `npx astro build --outDir dist-domov` zelený, `npx astro check` 0 chýb / 0 varovaní (144 súborov),
`npm test` OK. Preview port 4181. QA: `node work/qa/domov.mjs` (Playwright; 1440×900, 1440 reduced, 375×812 dotyk, 375 reduced) —
0 page/console errorov, 0 varovaní matter-js, scrollWidth = viewport, 0 cieľov < 44 px, 0 img bez alt; screenshoty
`work/screens/fix-domov-{desktop,desktop-rm,mobile,mobile-rm}-{hero,dvere,vstup,postavil,dialog,gravita}.png`.

## Oprava po review (19. 9., druhé kolo) — čo sa zmenilo
- **Hero** (`Hero.tsx`, `hero-data.ts`): ostrov je `client:load` (SSR z Hero.tsx = no-JS/SEO HTML), `HeroStatic.astro` zrušený
  (žiadny duplicitný h1, žiadny swap po hydratácii, `aria-label` na `<p>` preč). Motto `clamp(4rem, 0.5rem+11vw, 10rem)`
  + `sm:whitespace-nowrap` na riadkoch → 2 riadky vždy sadnú do max-w-7xl (1440 aj 1920), výška motta konštantná od prvého
  paintu po breathe (meranie: 294 px na 1440 v každom stave, 173 px na 375). Náklon wordmarku = CSS transform + rAF lerp
  (0 kB Motion). Riadok 2 štartuje z `onLetterAnimationComplete` riadku 1 (nie časovač). Suspense fallback = viditeľný
  statický text. Lazy chunky s `.catch` (SplitText → statický riadok, ktorý ohlási hotovo; Dither → null) + `Hranica`
  (error boundary, `src/components/home/Hranica.tsx`). CTA VSTÚP v prvej obrazovke: bottom 859/900 (1440×900), 777/812 (375×812)
  — wordmark `max-w-[52rem]`, `lg:pt-8`, intro vedľa tézy na lg, mobil `pt-5 pb-6`, intro `text-base`.
  Výška hlavičky zjednotená na 4,5 rem (hero `min-h-[calc(100dvh-4.5rem)]`, dvere `lg:h-[calc(100svh-4.5rem)]`, pin `top 72px`).
- **Dvere** (`Dvere.astro`): koreň `overflow-clip` (nie hidden → nie je scroll container, mobilná `view()` animácia beží voči
  viewportu; overené: progress 0 → 1 pri vstupe do viewportu, source = HTML). Klik na `#kto-som` (VSTÚP, pilulka, ⌘K) na desktope
  s GSAP scrolluje na koniec pinu (dvere otvorené, KTO SOM v zábere; capture listener pred Lenis `anchors`), hash ostáva
  `#kto-som`; aj priamy vstup s `#kto-som` v URL. Zmena media query (1024 px / reduced) → cleanup + init.
  Text „Sedem beatov. Prvá osoba. Mechanizmus, nie krivda." odstránený (interná inštrukcia zo spec), ostal eyebrow + H2.
- **Kto som** (`KtoSom.astro`, `Titulok.tsx`): podtitul „7 zastávok. / 17 → XVADUR." (z dát, bez „beat"); Titulok
  `client:media="(min-width: 1024px) and (prefers-reduced-motion: no-preference)"` — SSR vykreslí obyčajný text (VerticalCutReveal
  by bez JS dal posunuté = neviditeľné znaky), po hydratácii na desktope sa vymení za VerticalCutReveal; mobil a reduced Motion
  neťahajú. Nálepka 7. beatu `bg-hot text-ink` (5,4 : 1). Tisícové medzery pevné (`nbsp()` — `src/components/home/nbsp.ts`,
  „1 500 €" nelomí).
- **Čo som postavil** (`Postavil.tsx`, `Stopa.tsx`, `PostavilSekcia.astro`): MorphingDialog → neobrutalism `Dialog` (Radix,
  rovnaký chunk ako Wizard): platné HTML (0 div v buttone), žiadne duplicitné id, prístupný názov dialógu = „47 / 47 Systém pre
  makléra", Esc zatvára, fokus späť na kartu, body overflow sa obnoví. Čísla: SSR HTML nesie skutočné hodnoty (žiadna „0"),
  NumberFlow sa namountuje až vo viewporte a bez reduced motion (0 → hodnota); prípona mimo NumberFlow („47 / 47", „2,3 mil.");
  NumberFlow je `aria-hidden` + sr-only text (custom element inak dáva do stromu číslice 0–9). Terminal (Motion) → CSS log
  (`.log-riadok`, keyframes `is:global` v PostavilSekcia), prvý riadok „Kontroly pred vydaním:" (bez pseudo-príkazu).
  `card-drop` je na karte (nie na obale → žiadny druhý tieň), `animation-fill-mode: backwards`, aby po dopade animácia
  nedržala transform/tieň nad lift/press. Mriežka sa nikdy nepremountuje: ImageTrail je overlay (`Stopa` s `host` refom,
  natívny mousemove sa prepošle na kontajner ImageTrail ako syntetická udalosť), len desktop + myš, bez reduced; chunk
  s `.catch` → nič. gramata (`cislo: 'V2'` = nie je číslo) sa vykreslí bez veľkého čísla. Doména na karte 14 px `text-ink/70`.
  Kópia: „…a tam, kde web žije, aj odkaz."
- **Gravita** (`Gravita.tsx`): `Common.setDecomp(poly-decomp)` ešte pred renderom scény (X má konkávne telo, 0 varovaní);
  chunk s `.catch` → statická kopa + Hranica. Desktop s myšou: matter-js pri priblížení; dotyk / bez myši: až po prvom dotyku
  na kopu (`data-fyzika="off|on"`); reduced motion: neťahá sa vôbec. „Hoď nimi" `aria-hidden`.
- **Hry** (`Hry.astro`): StickerPeel (Motion) → utilita `sticker` `bg-hot text-ink` „V stavbe"; „Live" → „Naživo" (14,4 px);
  karty `h-full` + `card-drop` na karte (`li` bez animácie → jediný tieň); `aria-labelledby` na div preč; kópia v tykaní
  (Škrtací test: „Vlož svoj text. Škrtneme frázy, ktoré má každý. Prečítaj, čo zostalo."; sekcia: „…Veci, ktoré si vyskúšaš
  namiesto brožúry.") — meta-popisy z routes.ts ostávajú pre `<meta>`/OG.
- **Pasy** (`Pasy.astro`): kvíz bez oslovenia (routes), maklérsky pás vyká (pack 13 vyká) — zapísané v hlavičke súboru.
- `index.astro`: marquee hodnoty cez `nbsp()` („2 034 maklérov" nelomí).

## Súbory (vlastníctvo)
- `src/pages/index.astro` — poradie sekcií podľa spec 05 §2 + ratifikácie 01 §8; `islands="full"`; `<Hero client:load />`.
- `src/components/hero/hero-data.ts` — texty hera (eyebrow, motto, téza + intro verbatim spec 05 §2.1, CTA, pilulky, triedy).
- `src/components/hero/Hero.tsx` — ostrov client:load (pozri vyššie). `Dither.tsx` — shader lazy, len desktop s myšou bez reduced.
- `src/components/home/Hranica.tsx` — error boundary; `nbsp.ts` — pevné tisícové medzery.
- `src/components/home/Dvere.astro`, `KtoSom.astro` + `Titulok.tsx`, `PostavilSekcia.astro` + `Postavil.tsx` + `Stopa.tsx`,
  `GravitaSekcia.astro` + `Gravita.tsx`, `Hry.astro`, `Pasy.astro` — ako vyššie.
- `public/assets/trail/{hero-adam,billion-scale,media-ai,senior-map}.webp` — 560 px kópie (pôvodné ostali).
- `work/qa/domov.mjs` — QA skript domova (spúšťať z koreňa, server `python3 -m http.server 4181 -d dist-domov/client`).
- Port: `KonzultaciaBand.astro` + Wizard, `Metoda.astro` bez zmeny.

## Rozpočet JS (gz, zmerané Playwrightom = skutočne stiahnuté po prejdení celej stránky; súbory z disku)
- **375 px:** 156,6 kB statická uzávera (základ Base ≈ 108 + Hero 3 + Postavil 3 + NumberFlow 6 + Gravita 2 + dialog 1 …);
  **0 kB Motion** (žiadny ostrov domova ho na mobile neťahá). Po prvom dotyku na kopu + matter-js 25,4 + gravity 3 + poly-decomp 2
  = 187,2 kB. → Pod 180 kB pri načítaní a scrollovaní; nad 180 len po interakcii s fyzikou (doc 10: „Gravity áno (dotyk)").
- **375 px reduced:** 156,6 kB (fyzika sa neťahá).
- **1440 px reduced:** 147,2 kB (bez Drawera, bez Motion — Titulok má media query aj na reduced).
- **1440 px:** 287,3 kB = 156,6 + Motion 42 (VerticalCutReveal v Titulku; ten istý chunk ťahá aj CursorX zo základu, takže reálny
  prírastok Titulku je ≈ 1,3 kB) + lazy efekty len na desktope s myšou: GSAP 26,6 + ScrollTrigger 17 + SplitText 4,6 + Dither 9,2
  + ImageTrail 5,8 + matter 25,4 + gravity/decomp 5. Doc 10 „domov ≤ 180 kB" je splnené pre mobil a reduced; desktopové
  efekty (GSAP hero + dvere, shader, ImageTrail, fyzika) idú lazy nad rámec — ak má 180 platiť aj pre desktop vrátane lazy
  efektov, treba škrtnúť z hero/dverí (rozhodnutie Adama; zapísať ako výnimku alebo zrušiť efekt).

## Odchýlky od spec / doc 10
- Motto: strop 10 rem (160 px), nie 160–240 px — väčšie sa na 2. riadku „WE ARE USELESS." nezmestí do 1200 px a hero by
  pri každom cykle wdth-breathe poskočil. Pod 640 px sa 2. riadok zalomí (3 riadky), 64 px.
- Po skončení GSAP sa inline `font-variation-settings` na znakoch vyčistí a až potom nastúpi CSS `wdth-breathe`.
- Dvere nesú kópiu wordmarku a motto v krídlach; odhalenie = eyebrow „17 → XVADUR" + H2 KTO SOM.
- Popisy hier 2 a 3: „Hra v stavbe." (žiadny zdrojový text neexistuje). Nálepka „V STAVBE" = utilita `sticker` (nie StickerPeel).
- Detail karty = Radix Dialog (nie MorphingDialog), log kontrol = CSS (nie Magic UI Terminal) — rozpočet JS a a11y.
- Fyzika na dotyku štartuje až po prvom dotyku na kopu (rozpočet); dovtedy statická kopa.
- Číslo karty má veľkosť podľa dĺžky (≥ 6 číslic menšie), aby „2 483 965" nevyšlo z karty na 1024 px.

## Požiadavky na zdieľané súbory (nevykonané, mimo vlastníctva)
- **Kontrast hot tlačidiel:** kontraktový vzor `bg-hot … text-paper` má 3,17 : 1 (pod AA pre 18 px). Domov ho používa
  (Škrtni ich, Spustiť kvíz, 7 dní; hero CTA má 24 px = veľký text, prejde). Riešenie v základe: `--color-hot` stmaviť
  v `src/styles/tokens.css`, aby paper/hot ≥ 4,5, alebo vzor tlačidla prepnúť na `text-ink` (5,36 : 1). Na domove som
  nemenil, aby tlačidlá neboli iné než na podstránkach a v porte.
- `src/data/fakty.ts`: (a) „Weby 441" vs marquee „459 webov" — doplniť poznámku k faktu Weby („441 webov s textovými blokmi
  z 459 prehľadaných") alebo zjednotiť; (b) poznámka „Bratislavský kraj" pri 739 kanceláriách nie je v spec 05 ani packu 13
  (pack viaže na kraj len 2 034 maklérov) — overiť; (c) tisícové medzery môžu byť U+00A0 priamo v dátach (domov ich zatiaľ
  nahrádza cez `nbsp()`).
- `src/data/beaty.ts`: H3 titulky („Psychológia cez Junga", „Po desiatich rokoch") opakujú začiatok textu / nálepku — ak má
  Adam iné titulky, meniť tu; domov ich vypisuje verbatim.
- `src/components/vendor/reactbits/SplitText.tsx` importuje ScrollTrigger staticky aj pri `immediate` — hero ťahá +17 kB.
- Voliteľné: `.gitignore` pre `work/screens/` (screenshoty QA skriptov mimo vlastníctva).

## Otvorené
- Hero obraz (labák) ostáva v2. · `senior.xvadur.com`, `gramata.xvadur.com` neresolvujú (19. 9.) — len text.
- X v gravitácii štartuje nad horným okrajom (`y="-8%"`) — na desktope padá do kopy, na 375 px po dotyku ho v screenshote nevidno
  (možno nad hornou stenou); pôvodné správanie, neriešené.
