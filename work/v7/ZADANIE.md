# V7 — zadanie pre cloudového agenta (spoločné pre 10 variantov)

Pripravené 29. 9. 2026 na pokyn Adama. Každý cloudový agent dostane toto zadanie a **jeden koncept** z `work/v7/koncepty/NN-*.md`.

## Cieľ

Postaviť **domov xvadur.com (`/`) ako pôsobivý web**: iný a lepší ako konkurencia. Desať agentov stavia desať naozaj rozdielnych verzií, Adam si potom vyberie. Skúšame kombinácie **layoutu, komponentov, animácií a Higgsfield médií**. Copy sa teraz nerieši, texty sa berú zo súčasného webu.

Rozdielne znamená iná stavba stránky, iný pohyb a iná práca s médiami, nie iný font ani iná farba.

## Stred (rovnaký vo všetkých variantoch, rozhodnutie Adama 29. 9. 2026)

- **Kto:** Adam je zdravotná sestra, ktorá sa naučila pracovať s AI a teraz učí ostatných o AI a o svete tak, ako sa o ňom dozvedel sám. Nie agentúra, nie marketér.
- **Web je vstup do ekosystému XVADUR**, do ktorého sa dá vojsť od prvého dňa, nie výklad izolovaných projektov. Každý blok sú dvere niekam: texty a newsletter, Hriech (mediálna kritika), Netopier (dáta o tom, ako pracujú médiá), živé čísla Korpusu, systémy postavené pre Luciu a Jakuba, nástroje, ktoré Adam používa a prečo, vyšetrenie (konzultácia).
- Návštevník musí do 5 sekúnd vedieť, kto to je a kam môže vojsť. Metafora (príjem, anamnéza, liečba) smie obaľovať, nesmie nahradiť priamu vetu.

## Pravidlá, ktoré pre V7 prepisujú STACK.md a AGENTS.md

Adam 29. 9. 2026 výslovne povolil:
- **Redizajn domova od nuly** (STACK.md „Žiadny ďalší redizajn od nuly“ pre V7 neplatí).
- **Commit a push na vlastnú vetvu** `v7-NN-<slug>` (NN a slug z konceptu). Bez ďalšieho pýtania.
- Úpravy zdieľaných súborov (`src/styles/**`, `src/layouts/**`, `src/components/site/**`), ak ich variant potrebuje. Zmenu opíš v `work/v7/vystup/NN/README.md`.

Stále platí:
- **Žiadny deploy** (`wrangler deploy`, `wrangler versions upload`), žiadny merge do `main`, žiadny push na inú vetvu.
- Podstránky (`/konzultacia/`, `/makleri/`, `/kviz/`, `/skore/`, `/texty/`, `/hry/`, `/lab`), API (`src/pages/api/`) a `src/data/**` sa nemenia.
- Žiadne secrets v kóde ani v commite.

## Základ (vetva `v7-zaklad`, z nej vetvíš)

- **BoldKit** (boldkit.dev, MIT) je nainštalovaný celý v `src/components/ui/`: 90+ komponentov, 10 typov grafov (gauge, sparkline, heatmap, sankey, treemap, radar, donut, funnel, radial), 64 tvarov (`shapes`), ASCII tvary, matematické krivky (loader, progress, pozadie), sticker, layered-card, stat-card, timeline, stepper, multi-step-form, date/time picker, marquee, tour, carousel, data-table a ďalšie. Zoznam: `ls src/components/ui`.
- Farby BoldKitu sú napojené na tokeny xvadur.com v `src/styles/boldkit.css`, pohyb v `src/styles/boldkit-motion.css` (tvrdé stupňovité easingy `--bk-ease-step`, `--bk-ease-stamp`, `--bk-ease-rubber`).
- Ďalšie kity už v repe (`src/components/vendor/`): neobrutalism.dev, Magic UI, React Bits, Motion Primitives, Fancy. Katalóg `work/NOTES_vendor_*.md`.
- Ďalšie knižnice sa dajú doinštalovať cez shadcn CLI (`npx shadcn@latest add <url-alebo-@registry/kus>`), ak ich sieť prostredia pustí: Aceternity, Animate UI, Cult UI, Skiper UI, Smooth UI, Kokonut UI, ScrollX UI, UI Layouts, Tailark, Shadcnblocks, ReUI, Launch UI, Efferd, Saastro, EvilCharts, Heatmap, Trophy UI, shadcnmaps, Quill a ďalšie (zoznam a adresy v `work/v7/KNIZNICE.md`). BoldKit a neobrutalism.dev idú aj priamo z GitHubu: `npx shadcn@latest add ANIBIT14/boldkit/<kus>`.
- Pohyb: GSAP + ScrollTrigger + SplitText, Motion, Lenis, CSS `animation-timeline` sú v `package.json`.
- Shadery: `@paper-design/shaders-react`; BoldKit canvas efekty (dither, halftone, CRT, plazma, aurora …) cez `canvas-effect-core`.

## Obsah (povinné bloky, poradie a forma podľa konceptu)

Texty sa **preberajú doslovne** zo súčasných komponentov a dát. Nič sa nevymýšľa, čísla iba zo `src/data/fakty.ts` a `public/pulse.json`.

| Blok | Zdroj textov |
|---|---|
| Príjem (hero): XVADUR, motto „DIVIDED, WE ARE USELESS.“, kto je Adam jednou vetou, CTA na vyšetrenie | `src/components/v54/Prijem.astro` |
| Vitálne funkcie (živé čísla Korpusu) | `src/components/v54/Vitalne.astro`, `public/pulse.json` |
| Anamnéza / Kto som (cesta nemocnica → vyhodili → AI → agenti → XVADUR) | `src/components/v54/Anamneza.astro`, `src/data/cesta.ts` |
| Nástroje (inštrumentár) | `src/components/v54/Nastroje.astro` |
| Liečba 01–03 (služby) | `src/components/v54/Liecba.astro`, `src/data/ponuka.ts` |
| Chorobopisy (projekty: Jakub, Lucia, Hriech, Korpus) | `src/components/v54/Chorobopisy.astro` |
| Tézy | `src/components/v54/Tezy.astro` |
| Vyšetrenie (rezervácia konzultácie, **funkčná**, volá `/api/terminy/` a `/api/rezervacia/`) | `src/components/v5/Konzultacia.astro` |
| Zápis (e-mail, **funkčný**, volá `/api/zapis/`) | `src/components/v5/Zber.astro` |
| Texty a hry | `src/components/v5/TextyHry.astro` |

Zdravotnícka línia je zamknutá: vyšetrenie, diagnóza, triáž, liečba, pacienti, vitálne funkcie, EKG. Nie spis, nie odtajňovanie, nie policajt.

## Dizajnové mantinely

- Neobrutalizmus: rám 3 px ink, tvrdý tieň bez rozmazania, paleta ink / papier / biela / žltá / alarmová červená, **hot (#ed4e26) iba na CTA a X**. Žiadne pastely. Farby iba z tokenov.
- Písmo: Bricolage Grotesque (display), Space Grotesk (telo), Geist Mono (čísla), Instrument Serif italic (akcent). Variant smie meniť váhy a veľkosti, nie rodiny.
- Mobil 375 px bez vodorovného scrollu, 16 px okraje, ciele ≥ 44 px. `prefers-reduced-motion` = statické, 120 ms fade.
- Rozpočet JS domova: cieľ ≤ 250 kB gz (V7 experiment; nad 180 kB to zapíš do README s dôvodom). Video: poster obrázok, `preload="metadata"`, lazy mimo prvej obrazovky, AV1/H.264 do 4 MB na klip.

## Kombinácia (povinné minimum)

- Aspoň **12 rôznych BoldKit kusov**, z toho aspoň 2 grafy a aspoň 1 z: shapes, sticker, layered-card, math-curve, canvas efekt.
- Aspoň **2 kusy z iných knižníc** (vendor v repe alebo doinštalované).
- **Jeden hlavný pohybový motor** podľa konceptu (GSAP scrub, Motion, CSS scroll-timeline alebo BoldKit stupňovitý pohyb) a jeden **podpisový pohyb**, ktorý si človek zapamätá.
- **Higgsfield médiá** podľa `work/v7/HIGGSFIELD.md` a konceptu.

## Laťka: konkurencia

Prečítaj `work/V5_KONKURENCIA.md`. Laťka je **itashu.co v ponuke** a **svojtko.com vo vizuáli**. V README variantu napíš tri vety: čím je variant iný a lepší než itashu, svojtko a zvyšok zoznamu. Štyri veci, ktoré konkurencia nemá: živý dôkaz (čísla a odkazy) namiesto hviezdičiek, osobný príbeh sestra → staviteľ agentov, vlastný hlas (Hriech, Netopier), hlasný jasný neobrutalizmus namiesto tmavého uhladeného vesmíru.

## Postup

1. `git switch v7-zaklad && git switch -c v7-NN-<slug>`; `npm ci`.
2. Prečítaj koncept, `HIGGSFIELD.md`, konkurenciu, súčasné bloky.
3. Napíš `work/v7/vystup/NN/PLAN.md`: layout po blokoch, komponenty ku každému bloku, pohyb, zoznam Higgsfield záberov.
4. Higgsfield: najprv **jeden hero obrázok**, skontroluj ho proti pravidlám, až potom videá. Médiá do `public/v7/NN/`.
5. Postav domov v `src/components/v7/NN/` a `src/pages/index.astro`.
6. Overenie (nižšie), commit po krokoch (`V7-NN: …`), push vetvy.
7. `work/v7/vystup/NN/README.md`: čo je variant, komponenty, knižnice, pohyb, médiá (prompty, model, cena v kreditoch), konkurencia, čo nevyšlo.

## Podmienka hotového

- `npm run check` bez chýb, `npm test` zelené, `npm run build` prejde.
- Ak je dostupný Playwright: `python3 -m http.server 4190 -d dist/client &` a `node work/qa/v5.mjs` (1440 / 375 / reduced, bez pretečenia a chýb konzoly); screenshoty do `work/v7/vystup/NN/` (1440 a 375, celá stránka).
- Rezervácia a zápis fungujú rovnako ako na V5.4 (formuláre volajú tie isté API).
- Vetva je pushnutá, README je úplné.
