# NOTES_kviz — /kviz/ AI-readiness kvíz (19. 9. 2026, vetva `v4`)

## Čo existuje
- **Cesta:** `/kviz/` (`src/pages/kviz/index.astro`, islands="lite", title/description z `routeByPath('/kviz/')`).
  Sekcie: hero (paper, tx-grain, h1 „AKO PRIPRAVENÝ SI NA AI?“, 3 štítky 14 px, CTA „ZAČAŤ“ `text-xl` → `#kviz`) → ružový
  marquee s piatimi prvými krokmi packu 04 (verbatim, s bodkou) → lilac pás s ostrovom kvízu → „Ako sa počíta“ (vzorec,
  skóre, segmenty, tabuľka packu 04 verbatim, th 14 px, citát packu o nemeraných odpovediach) → `<KonzultaciaOdkaz />`.
- **Ostrov:** `<Kviz client:load />` (`src/components/kviz/Kviz.tsx`) — jeden React ostrov, bez backendu, bez window pri importe
  (client:load, lebo je zmyslom stránky a hero CTA naň skáče; pred hydratáciou `astro-island[ssr] [data-kviz]` = pointer-events none,
  opacity .85 cez `<style is:global>` v index.astro + `aria-busy="true"` na obale do mountu).
  - 5 základných otázok (kto si · čo sa opakuje · hodiny týždenne · hodinová sadzba · čo si skúšal) + adaptívne
    doplnkové: **+2** (podklady, vlastník výsledku) alebo **+5** (+ postup, kontrola, prístupy). Dlhšia vetva =
    kto = firma, alebo opakuje = prenos/rozhodovanie, alebo skúšal = automatizácia/nasadené. Spolu 7 alebo 10 otázok.
  - Prechody: **čisto CSS** — nový krok = nový `key` panelu, obal `animate-fade-in` (120 ms), karty odpovedí `card-drop`
    so staggerom (jediný pohybový motor na prvok); reduced motion rieši global.css (120 ms fade). Motion runtime (39 kB) vypadol.
  - Indikátor: `src/components/kviz/Kroky.tsx` (vlastný, pozri Odchýlky) + neobrutalism `Progress`.
  - Otázky: neobrutalism `RadioGroup` (`aria-labelledby` = h2 otázky) + `RadioGroupCard` (celá karta = label, `card-drop` stagger),
    `Input type=number inputMode=numeric pattern=[0-9]*` + rýchla voľba (`aria-pressed`), `Button`. Formulár `<form onSubmit>` →
    Enter = Ďalej. Validácia: `role="alert"` (ink na ružovej s horúcim rámom, 12,6:1), `aria-invalid` + `aria-describedby=kviz-chyba`
    na RadioGroup aj Input. Čísla sú **celé** (`Number.isInteger`, hláška „Zadaj celé číslo od … do …“); logika.ts navyše zaokrúhľuje.
  - Klávesnica: šípky/medzera v RadioGroup, Tab na tlačidlá, po zmene kroku fokus na `h2` otázky (`data-kviz-nadpis`, bez
    `outline-none` → globálny 3 px hot focus-visible); ak je nadpis pod lepiacou hlavičkou (< 88 px) alebo mimo obrazovky,
    blok eyebrow + nadpis (`scroll-mt-28`) sa doroluje; sekcia `#kviz` má `scroll-mt-20`.
  - Späť (tlačidlo aj klik na hotový štvorec indikátora), „Začať odznova“ (min-h-11, 155×44), na výsledku „Späť k otázkam“ + „Odznova“.
  - **sessionStorage** kľúč `xvadur:kviz:v1` `{odpovede, index, dosiahnuty}` (try/catch, obnova až po hydratácii, reload
    vracia na rovnaký krok aj na výsledok).
- **Výsledok:** `src/components/kviz/Vysledok.tsx` — karty ako `article.brutal` (bez vendor Card/Badge/NumberFlow: rozpočet),
  nadpisy h2 „Výsledok kvízu“ (sr-only) → h3 „Strata za rok“ / „Skóre pripravenosti“ / „Jeden prvý krok“; číslo je `<p>`
  (vizuál `aria-hidden` + sr-only text „18 400 eur za rok“, „39 zo 100“). Štítky = `brutal-flat` spany 14 px.
  - **Strata za rok** = `hodiny × 46 × sadzba` (vzorec vypísaný pod číslom), Intl sk-SK EUR + vlastný rAF odpočet 0 → cieľ
    (700 ms, ease-out; pri prefers-reduced-motion cieľ hneď, bez skoku z nuly).
  - **Skóre 0–100** = súčet bodov za odpovede / maximum vetvy × 100, pásmo: Najprv poriadok (< 40) · Prvý úsek (40–69) ·
    Pripravený (≥ 70). **Strop bez vlastníka:** vlastnik = nikto → skóre ≤ 39 (`STROP_BEZ_VLASTNIKA`), aby pásmo neprotirečilo
    kroku „Najprv určiť vlastníka a kritérium.“ (pack 04). Na stránke vypísané v karte „Skóre 0 – 100“.
  - **Segment** = verejná ponuka packu 04: Autor s poznámkami · Človek skladajúci viac nástrojov · Firma, ktorá uvažuje o agentovi.
  - **Jeden prvý krok** = riadok tabuľky „Voľba najmenšieho užitočného riešenia“ (pozorovanie + krok + dôvod verbatim).
  - CTA **KONZULTÁCIA** (`Button asChild` hot, `data-cursor="vstup"`) → `/konzultacia/?z=kviz&kto=…&hodiny=…&sadzba=…&krok=…`.
  - **Kopírovať výsledok** (text, sonner toast; Toaster je v Base lite). Fallback toast pri zlyhaní schránky.
- **Logika (čistá, bez React):** `src/components/kviz/logika.ts` — `otazkyPre`, `dlhaVetva`, `skore`, `pasmo`,
  `strataRocne`, `prvyKrok`, `segment`, `vyhodnot`, `konzultaciaUrl`, `textVysledku`, `eur`, `SK`, `STROP_BEZ_VLASTNIKA`.
- **Konzultačný pás:** `src/components/kviz/KonzultaciaOdkaz.astro` — statická kópia textov `port/KonzultaciaBand.astro`
  bez ostrova Wizard (−21 kB): CTA „Začať cez 4 otázky“ → `/konzultacia/#formular`, „Ako prebieha 30 minút →“ → `/konzultacia/#priebeh`.
- **Dáta:** `src/data/kviz/kroky.ts` — `KROKY` (5 riadkov packu 04 verbatim + `slug`), `krokBySlug`, `SEGMENTY`
  (+ `segmentBySlug`), `TYZDNOV_ROCNE = 46`. `src/data/kviz/otazky.ts` — `ZAKLADNE`, `DOPLNKOVE` (texty otázok
  a možností sú vlastné; body do skóre pri každej možnosti).

## Zdieľaný kontrakt s /konzultacia/ (query)
`/konzultacia/?z=kviz&kto=<autor|nastroje|firma>&hodiny=<celé číslo 0–80>&sadzba=<celé číslo 0–500>&krok=<slug>`
- `krok` slugy: `vstup-sablona` (Lepší vstup a pracovná šablóna.) · `kontext-prompt` (Kontext + prompt/skill + kontrola.) ·
  `automatizacia` (Jednoduchá automatizácia.) · `agent` (Agent s ohraničenými nástrojmi a oprávneniami.) ·
  `vlastnik` (Najprv určiť vlastníka a kritérium.). Konzultácia môže importovať `krokBySlug`, `segmentBySlug` z `@/data/kviz/kroky`.
- Pravidlo výberu kroku: vlastník = nikto → `vlastnik`; opakuje = nejasné → `vstup-sablona`; text → `kontext-prompt`;
  prenos → `automatizacia` (ak postup „každý prípad iný“ → `agent`); rozhodovanie → `agent` (ak postup „vždy rovnaký“ → `automatizacia`).

## Overenie (19. 9., po oprave nálezov)
- `npx astro build --outDir dist-kviz` zelený (`dist-kviz/client/kviz/index.html`, `og/kviz.png`). `npx astro check`: 0 chýb
  v `src/pages/kviz`, `src/components/kviz`, `src/data/kviz` (chyby v konzultácii/makléroch sú cudzie a menili sa počas noci).
- Playwright `node work/qa/kviz.mjs work/screens` (server `python3 -m http.server 4183 -d dist-kviz/client`): 1440×900,
  375×812 touch, 375×812 reduced motion — 0 page/console errorov, scrollWidth = viewport na otázkach aj výsledku,
  validácia (`aria-invalid`, alert ink/pink), desatinné 2.5 odmietnuté, krátka (7) aj dlhá (10) vetva, reload → obnova,
  Odznova, „Začať odznova“ 155×44, osnova h2 → h3 ×3, po kroku fokus na h2 (top 125–140 px, pod hlavičkou nie),
  klávesnica (šípka + medzera + Tab + Enter → fokus h2 s focus-visible), reduced motion: všetky animácie 120 ms.
  Scenár revízie {autor, text, 10 h, 40 €, prompty, po ruke, nikto} → skóre 39 „Najprv poriadok“, krok `vlastnik`,
  CTA `/konzultacia/?z=kviz&kto=autor&hodiny=10&sadzba=40&krok=vlastnik`.
  Screenshoty: `work/screens/kviz-{desktop,mobile,mobile-rm}[-q2|-vysledok].png`. `npm test` OK.
- Ciele: radio kruh je 24 px vizuálne, dotyk 44 px cez `::before` a celá karta je label (≥ 48 px) — ako v katalógu.
- Logika otestovaná z node (5 scenárov: strata, skóre, vetva, krok, URL, text).

## JS (gz, `node work/qa/jsgz.mjs dist-kviz/client /kviz/`)
- Po oprave: **136,5 kB** s mobilným Drawerom (pred: 189,4), desktop ≈ 127 kB (pred: 179,9). Ostrov Kviz ≈ 33 kB:
  radix RadioGroup/Progress ≈ 14 kB, Kviz+Vysledok+Kroky ≈ 8 kB, button/input/cva ≈ 2 kB, ikony ≈ 4 kB. Odstránené:
  Motion runtime (TransitionPanel) −42 kB, NumberFlow −5,6 kB, Card+Badge −9 kB, Wizard/radix Dialog z pásu −21 kB.
- Zvyšok ≈ 94 kB je základ lite (React 65 + renderer, ClientRouter 5, sonner 9, prefetch, Drawer 10 na mobile) —
  doc 10 „podstránky ≤ 70 kB“ na súčasnom základe nie je dosiahnuteľných bez zmeny základu (požiadavka nižšie).
- `React.lazy` pre Vysledok neurobené: po zoštíhlení je to ≈ 3 kB, a ďalší request presne vo chvíli, keď človek čaká
  na výsledok, je horší obchod ako 3 kB navyše pri štarte.

## Odchýlky od spec/doc 10 (na ratifikáciu, XDR-193)
- **TransitionPanel (doc 10 §3 #17) nahradený CSS prechodom** a **NumberFlow nahradený Intl + rAF odpočtom**: rozpočet
  JS podstránok v tom istom doc 10 (≤ 70 kB) je tvrdšie pravidlo a revízia to označila ako „must“ (−48 kB spolu).
  Vizuál ostáva: fade obalu + card-drop stagger kariet, číslo sa odpočítava 0 → cieľ.
- **Konzultačný pás na /kviz/ je statický** (`KonzultaciaOdkaz.astro`), nie `port/KonzultaciaBand` s Wizardom (−21 kB);
  CTA s payloadom je vo výsledku, Wizard beží na /konzultacia/.
- **Indikátor krokov je vlastný (`Kroky.tsx`)**, nie React Bits `Stepper`: vendorovaný Stepper je celý wizard
  s vlastným (neriadeným) stavom a vlastnou animáciou obsahu — nedá sa použiť len ako indikátor nad TransitionPanel
  (dvojitá animácia toho istého obsahu), nepodporuje meniaci sa počet krokov (7 → 10) ani blokovanie „Ďalej“ bez
  odpovede. Kroky.tsx preberá jeho vizuál (44 px štvorce, hot = aktuálny, lime + check = hotový, 3 px spojky).
- Otázky a možnosti sú moje formulácie (spec to pripúšťa); segmenty a kroky sú z packu 04 verbatim. Doplnkové otázky
  vychádzajú zo šiestich diagnostických otázok packu.
- Body za odpovede a hranice pásiem (40/70) sú moja kalibrácia — na webe je vypísané „body / maximum × 100“, žiadne
  iné čísla. Rýchla voľba pri číslach (2/5/10/20 h; 15/25/40/60 €) je len pohodlie vstupu, nie tvrdenie.
- Vzorec × 46 je zo spec 05 §3; na stránke aj vo výsledku jednotne „46 týždňov“ (bez „pracovných“ — slovo nebolo v zdroji).
- Strop skóre 39 bez vlastníka je moja kalibrácia odvodená z poradia packu 04 (vlastník pred všetkým), vypísaná na stránke.
- Aktuálny štvorec indikátora a CTA v hot: text na hot je ink (5,4:1) resp. paper pri `text-xl` (20 px extrabold = veľký
  text, 3,17:1 prejde AA); Button `size="lg"` dostáva `className="text-xl"` len pri `tone="hot"`.

## Otvorené
- Konzultácia (`src/components/konzultacia/payload.ts`, `Intake.tsx`): `krok=<slug>` a `kto=<slug>` sa v štítku aj vo
  WhatsApp/mailto texte vypisujú surové („vstup-sablona“) — agent konzultácie má importovať `krokBySlug`, `segmentBySlug`
  z `@/data/kviz/kroky` a mapovať slug → `krok.krok` / `segment.label`, neznámy slug ignorovať.
- Kvíz pás na domove („AKO PRIPRAVENÝ SI NA AI?“ → /kviz/) stavia agent Domov.
- Screenshoty v `work/screens/kviz-*.png` a QA skript `work/qa/kviz.mjs` sú mimo striktného zoznamu vlastníctva —
  rovnaká konvencia ako `work/qa/konzultacia.mjs`, `skore.mjs` (výstup QA podľa kontraktu základu).

## Požiadavky na zdieľané súbory
- **Základ (rozpočet):** podstránka lite = ≈ 94 kB gz bez ostrova stránky (React 65 + renderer, ClientRouter, sonner 9,
  Drawer 10 na mobile) — doc 10 ≤ 70 kB je na súčasnom základe nedosiahnuteľných; treba rozhodnúť (upraviť rozpočet,
  alebo Toaster/sonner len na stránkach, ktoré toast naozaj volajú, Drawer ľahší).
- **button.tsx / tokens.css (kontrast):** `tone="hot"` = paper na hot 3,17:1; pri `size="lg"` (18 px) nie je veľký text →
  buď `tone: hot → text-ink` (5,36:1), alebo lg/xl ≥ 20 px. Kvíz to rieši lokálne `className="text-xl"`.
- **global.css `eyebrow`:** 13 px (0.8125rem) je pod 14 px — zvážiť 0.875rem.
- Nič iné; `routes.ts` už `/kviz/` má.
