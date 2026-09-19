# NOTES_makleri — Makléri: landing + plán + PDF (19. 9. 2026, vetva `v4`, necommitnuté)

## Čo existuje
- **`/makleri/`** — `src/pages/makleri/index.astro`. Landing „Neviditeľný maklér“: copy VERBATIM z packu 13 §3
  (hero eyebrow/H1/sub, „ČO DOSTANETE“ 7 kariet + Deň 8, „PREČO JA“, „ČO TO NIE JE“, foot „Platba cez Stripe…“),
  potom sekcia **Dôkazy** = tabuľka packu §1 (11 riadkov, čísla a zdroje presne ako v packu, tučné časti ako v packu)
  + 14 citácií webov kancelárií (z `src/data/frazy.ts` CITACIE, mená kancelárií ako v packu) + 6 kotiev cez NumberFlow.
  Pás klišé rodín (Magic UI Marquee, ružový, 6 rodín z Dňa 1 s počtom /47). Záverečný čierny CTA pás. `islands="none"`
  (žiadny React ostrov ani toast; jediný JS navyše = inline skript Kotvy.astro s vanilla `number-flow`).
- **`/makleri/plan/`** — `src/pages/makleri/plan.astro`. Produkt: hlavička (názov, podtitul, cena, formát, pre koho — pack §2),
  „Stiahnuť PDF“, sticky navigácia dní, Deň 1–7 ako karty Prečo / Úloha / Artefakt / Čas (VERBATIM pack §2),
  Deň 8 = čierny Launch Partner most (verbatim, tučné „500 € nastavenie + 300 €/mesiac“) s tlačidlom
  „→ 15-minútový hovor“ na `/konzultacia/?z=plan`. `noindex` cez Base (`routes.ts` noindex: true → `<meta robots noindex, nofollow>`). `islands="none"`.
  Print CSS (`<style is:global>` v stránke, platí len na tejto stránke): `@page A4`, skrytá hlavička/pätička/DenNav/marquee/
  toaster/kurzor, hlavička produktu kompaktne (2 stĺpce, menší H1) a Deň 1 začína na strane 1 (`#den-1 { break-inside: auto }`,
  hlavička dňa `break-after: avoid`), každý ďalší `.plan-den + .plan-den` = nová strana, tiene a textúry preč, `print-color-adjust: exact`.
- **PDF** — `public/makleri/neviditelny-makler-plan.pdf` (244,9 kB, 9 strán: strana 1 = hlavička + Deň 1 Prečo/Úloha, strana 2 = Deň 1
  Artefakt/Čas, potom Deň 2–8 po strane). Pregenerované po opravách 19. 9.
- **`scripts/export-makleri-pdf.mjs`** — `npx astro build --outDir dist-makleri` → `python3 -m http.server 4182 -d dist-makleri/client`
  → Chrome headless s **dočasným `--user-data-dir`** (nepripojí sa k otvorenému Chrome), staré PDF sa pred exportom zmaže,
  Chrome beží asynchrónne: skript čaká na „bytes written to file“ / hotový súbor a Chrome ukončí sám (Chrome 153 s čerstvým
  profilom po zápise PDF neskončí — updater/crashpad; limit 90 s) → server kill → kontrola existencie, mtime > štart,
  > 20 kB a > 3 strany. `--no-build` = len export. `CHROME_BIN`, `MAKLERI_PORT` cez env. `ROOT` cez `fileURLToPath`.
  Po exporte treba **znova build**, aby sa PDF dostalo do `dist-makleri/client/makleri/` (public/ sa kopíruje pri builde).
- OG: `/og/makleri.png`, `/og/makleri-plan.png` zo základového endpointu (routes.ts) — Base ich berie automaticky.

## Dáta (`src/data/makleri/`)
- `config.ts`: `STRIPE_URL = ''` (placeholder; Adam doplní Stripe Payment Link 9 €, success URL `xvadur.com/makleri/plan/`),
  `CENA`, `CTA_KUPIT` „KÚPIŤ PLÁN ZA 9 €“, `CTA_CAKA` „PLATBA ČOSKORO“, `CTA_CAKA_STAV` „Stripe Payment Link sa pripravuje.“
  (viditeľný stav pod disabled tlačidlom), `FOOT_CAKA` „Platba sa pripravuje.“ (foot landingu, kým Stripe nebeží),
  `PDF_PATH`, `KONZULTACIA_Z_PLANU`, `EMAIL`, `WHATSAPP_URL` (wa.me/?text=…), `MAILTO_URL`, `stripeReady()`.
- `landing.ts`: `LANDING` (pack §3 verbatim, po blokoch), `PRODUKT` (pack §2 hlavička) + `PRODUKT.formatBezPlatby`
  (prvé dve vety formátu — v čiernom páse landingu, kým Stripe nebeží; po vyplnení STRIPE_URL sa vypíše plný `format`
  aj foot packu „Platba cez Stripe. Stránka sa otvorí hneď.“ — všetko podmienené `stripeReady()`).
- `plan.ts`: `DNI: Den[]` (Deň 1–7: n, id `den-n`, nazov, preco, uloha, `ulohaKurziva?` = časti Úlohy, ktoré má pack kurzívou
  → `<em>` (Deň 2), artefakt, cas), `DEN_8` (odseky, tučné, cta), `DNI_NAV`.
- `dokazy.ts`: `DOKAZY` (tabuľka §1, `cislo` s `**…**`; dátumy v `zdroj` s pevnou medzerou `16.\u00A08.`), `boldSegments()`,
  `DOKAZY_UVOD`, `CITACIE_UVOD`, `CITACIE_POZNAMKY` (Relax Properties „celý blok“).

## Komponenty (`src/components/makleri/`)
- `Kotvy.astro` — **Astro komponent + inline skript s vanilla `number-flow`** (namiesto React ostrova; `Kotvy.tsx` zmazaný).
  Props `items: {value, z, spoj 'zo'|'z', note, tone}[]`, `class`. SSR = `renderInnerHTML()` (declarative shadow DOM, cieľové
  číslo bez JS). Skript (`astro:page-load`): reduced motion alebo blok už vo viewporte → nič; inak `update(0)` bez animácie
  a po vstupe (IO 0.25) `update(cieľ)` s animáciou. Menovateľ „z 2 034“ je `whitespace-nowrap` v `flex-wrap` → zalomí sa ako
  celok pod číslo. Číslo je prístupné (role img + aria-label z number-flow). ≈ 5,8 kB gz (chunk csp + skript).
- `KlisePas.tsx` — Magic UI Marquee bez client direktívy (0 kB JS), 6 základných rodín z `FRAZY_RODINY`, prečiarknuté hot, štítok `/47`.
  Prop `duration` odstránený (vendor Marquee ho pri SSR nezapíše — pozri Požiadavky), beží tokenových 40 s.
- `KupitCta.tsx` — neobrutalism Button, staticky (0 kB JS). `stripeReady()` false → `<button disabled aria-describedby>`
  „PLATBA ČOSKORO“ (biely, prerušovaný rám) + viditeľný `<p>` „Stripe Payment Link sa pripravuje.“ (bez `title`);
  true → `<a href={STRIPE_URL}>` „KÚPIŤ PLÁN ZA 9 €“ (hot). Sekundárne odkazy „Skóre webu makléra →“ `/skore/`,
  „Konzultácia →“ `/konzultacia/` dedia farbu — rodič v čiernom páse má `text-ink`. Props `size`, `align`, `sekundarne`.
- `DenNav.astro` — štítky D1–D8: číslo viditeľné (mono 14 px), názov dňa `sr-only` (prístupné meno „D3 Meno pred logom“),
  `title="Deň n: názov"`; aktívny deň `aria-current="location"` (žltý) ukáže názov aj vizuálne od `md:`. Pás je `flex-wrap`
  (nikdy nepretečie, bez vnútorného scrollu): desktop 1 riadok 60 px, mobil 2 riadky. Pod `sm:` je **statický** (nie sticky —
  hlavička + 2 riadky by zakryli ~180 px z 812), od `sm:` sticky pod hlavičkou (top z `body > header`, fallback 71 px).
  Scrollspy cez IntersectionObserver; `astro:page-load` / `astro:before-swap`. `print:hidden`.

## Overenie (19. 9., po opravách z review)
- `npx astro build --outDir dist-makleri` ✓ · `npx astro check` = 0 chýb (celý projekt) · PDF ✓ (pregenerované, 9 strán, 244,9 kB).
- Playwright (chromium) 1440×900, 375×812 touch, 375 reduced motion, po scrolle až dole: 0 page/console errorov (ani 404 —
  `/hry/`, `/skore/` už existujú), `scrollWidth == clientWidth` na oboch cestách, 0 vnútorných horizontálnych scrollerov
  (tabuľka Dôkazy sa pod 640 px stohuje: `block sm:table`, riadok = blok „číslo“ + „Zdroj: …“), 0 cieľov < 44 px,
  0 textov < 14 px mimo systémových `eyebrow`/`x-divider`, nadpisy v poradí (h1 → h2 → h3; „ČO TO NIE JE“ je h2,
  bloky Prečo/Úloha/Artefakt/Čas sú h3 v `<div>` — 0 `section[aria-label]` landmarkov), 0 `span[aria-label]`,
  Kotvy: cieľové čísla po scrolle (a hneď pri reduced motion), DenNav `scrollWidth == clientWidth` (1280/1280, 375/375).
- JS skutočne stiahnutý (Playwright, response body): `/makleri/` desktop 33,7 kB raw ≈ **11,9 kB gz** (ClientRouter 4,8 +
  number-flow 5,1 + Kotvy skript 0,7 + prefetch 1,2 + page 0,1); `/makleri/plan/` desktop 16,6 kB raw ≈ **6 kB gz**.
  Mobil ≤ 1023 px + Drawer zo základu (`client:media`): + ≈ 92 kB gz (React runtime 65 + vaul/radix), t. j. ≈ 104 kB / 99 kB —
  celé to je Header Drawer zo základu, nie tieto stránky (pozri Požiadavky).

## Odchýlky
- Tlačidlo CTA: pack §3 má „CHCEM PLÁN — 9 €“; podľa zadania noci je label „KÚPIŤ PLÁN ZA 9 €“ / „PLATBA ČOSKORO“ (Stripe placeholder).
  Text packu ostáva v `LANDING.hero.cta` / `LANDING.foot.cta` (nevykreslený). Adam rozhodne jedným slovom.
- Úvodzovky packu „…" (rovné zatváracie) sú na webe „…“ (slovenské); inak text bez zmeny.
- Deň 8 „[booking link]“ → tlačidlo na `/konzultacia/?z=plan` (zadanie).
- Rozpočet podstránky ≤ 70 kB (doc 10): desktop splnený (11,9 kB / 6 kB gz); na mobile ho prekračuje jedine Header Drawer
  zo základu (≈ 92 kB gz s React runtime) — pozri Požiadavky 3.

## Opravené z review (19. 9.)
- MUST: sekundárne odkazy v čiernom páse `#kupit` boli papier na papieri → karta má `text-ink`. MUST: tabuľka Dôkazy na 375 px
  (vnútorný scroll 640/337, stĺpec Zdroj mimo obrazovky) → stohované riadky, bez `min-w`, bez scrollera (tým odpadol aj
  axe „scrollable-region-focusable“).
- SHOULD: „Platba cez Stripe. Stránka sa otvorí hneď.“ a „Stripe Payment Link → presmerovanie…“ sa vypíšu až so `stripeReady()`;
  dovtedy „Platba sa pripravuje.“ / `formatBezPlatby`. Disabled tlačidlo: `title` preč, viditeľný stav + `aria-describedby`.
  `aria-label` na `<span>` (9 €) → `sr-only` „Cena “. DenNav pretekal (2 008/1 280 desktop, 470/375 mobil) → flex-wrap +
  sr-only názvy + `aria-current="location"`. `islands="none"` na oboch stránkach (toast sa nepoužíva). Kotvy bez React runtime
  (vanilla number-flow), menovateľ nowrap, žiadne bliknutie 31→0→31 (skok na 0 len keď je blok pod viewportom). Texty < 14 px
  (Zdroj, figcaption citácií, D1–D8, „Bezplatný úvod“) → 14 px. „Stiahnuť PDF“ `text-xl` (20 px/800 = large text, hot/paper 3,17:1 ≥ 3:1).
  Bloky dňa `<section aria-label>` → `<div>` + `<h3 class="x-divider">`. Export skript: temp profil, mazanie starého PDF,
  kontrola existencie + mtime, `fileURLToPath`.
- NICE: Deň 2 kurzíva packu v `<em>` (`ulohaKurziva`), hero: tretí riadok bez `font-bold`, názvy kariet „Čo dostanete“
  `normal-case` (verbatim aj vizuálne), karty Deň 1–7 bez `interactive` (nie sú odkazy), „ČO TO NIE JE“ ako h2, hero X na mobile
  `top-2 right-2 opacity-40` (nie pod sticky hlavičkou), Deň 8 X na mobile vpravo dole `opacity-30`, PDF button mimo `<dl>`,
  PDF: strana 1 = hlavička + Deň 1 (kompaktná hlavička v tlači), pevná medzera v dátumoch zdrojov, KlisePas bez neúčinného `duration`.

## Otvorené
- **BOSEN a Jakub Chovanec sú menovaní v tabuľke Dôkazy** presne ako v packu §1 (pack anonymizuje len R1 video); plán Deň 2 menuje
  Jakuba Olšu (verbatim pack §2). Pack §5: Jakub dostane landing pred publikovaním — **Adam ratifikuje jedným slovom pred deployom**
  (BOSEN ostáva / anonymizovať na „jedna z najväčších realitiek“; Olša ostáva / „jeden maklér v Bratislave“). Ak anonymizovať,
  meniť len `DOKAZY[6]`, `DOKAZY[9]` a `DNI[1].uloha`.
- Stĺpec Zdroj v tabuľke Dôkazy je verbatim z interného packu (názvy artefaktov „top50-copy-evidence“, „copy-intelligence“,
  „broker-agency map“, „exact-phrase scan“, „tamtiež“; tretia osoba „Adamov test“ / „Adamovo pozorovanie“, `DOKAZY_UVOD`
  „z Adamovho výskumu“) vedľa prvej osoby „NEHÁDAM. ZMERAL SOM TO.“ — **Adam rozhodne**, či prepísať do prvej osoby a čitateľných
  názvov; zámerne nezmenené (pravidlo: čísla a texty len z packu).
- `STRIPE_URL` prázdny → tlačidlo disabled. Po vyplnení nič iné netreba meniť.
- `/makleri/plan/` je verejne dostupná URL (noindex, bez prihlásenia) — tak to chce pack §2. PDF na `/makleri/neviditelny-makler-plan.pdf` je tiež verejné.
- PDF treba pregenerovať po každej zmene plánu (`node scripts/export-makleri-pdf.mjs`), potom znova build.
- Odkaz „Škrtací test online →“ na `/hry/skrtaci-test/` a „Skóre webu makléra“ na `/skore/` závisia od agentov Hry a Skóre.

## Požiadavky na zdieľané súbory (pre základ — nemenené)
1. `src/data/frazy.ts` CITACIE, TeEq: text `zabezpečenie kompletného servisu pre klienta „na kľúč“` → vnorené jednoduché
   úvodzovky `zabezpečenie kompletného servisu pre klienta ‚na kľúč‘` (pack §1 má ‚na kľúč'; na webe teraz vznikajú štyri
   úvodzovky za sebou „…„na kľúč““).
2. `src/components/vendor/magicui/marquee.tsx`: prop `duration` sa pri statickom renderi (bez client direktívy) nezapíše —
   `style={{ '--marquee-duration': … }}` chýba v SSR HTML (`class="marquee magicui-marquee …"` bez `style`), takže beží vždy
   tokenových 40 s. Návrh: `data-duration` + CSS `.magicui-marquee[data-duration] .marquee-track { animation-duration: … }`,
   alebo `style` ako reťazec.
3. Rozpočet mobil: Header Drawer (`client:media ≤ 1023 px`) ťahá React runtime (`client.*.js` 65 kB gz) + vaul/radix ≈ 92 kB gz
   na každú stránku vrátane `islands="none"`. Desktop `/makleri/` je 11,9 kB, `/makleri/plan/` 6 kB — limit 70 kB na mobile
   sa dá splniť len Drawerom bez Reactu (napr. `<dialog>` + inline skript, alebo vaul až po kliku).
4. `public/_headers`: `X-Robots-Tag: noindex` pre `/makleri/neviditelny-makler-plan.pdf` a `/makleri/plan/` (platený obsah na
   stabilnej verejnej URL; dnes má len `<meta robots>` na HTML, PDF nič).
5. Mobil: dva sticky prvky (hlavička 71 px + DenNav) — vyriešené lokálne (DenNav pod `sm:` statický). Ak Base niekedy skryje
   hlavičku pri scrolle nadol, DenNav môže byť sticky aj na mobile.
6. `.gitignore`: `work/screens/` (screenshoty builderov a reviewerov, ~MB PNG, inak ich `git add -A` commitne). Builder makléri
   zapísal `work/screens/makleri-*.png` (6 súborov) — možno zmazať.
7. Tlačidlový vzor základu (`text-lg` 18 px/800 paper na hot = 3,17:1) je pod AA pre bežný text; buď `text-xl` vo vzore, alebo
   tmavšie `--color-hot` (≥ 4,5:1). Lokálne opravené len na `/makleri/plan/` („Stiahnuť PDF“ `text-xl`).
