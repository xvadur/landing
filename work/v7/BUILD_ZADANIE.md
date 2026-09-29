# V7 · Build 10 webov z katalógu — zadanie pre agenta (29. 9. 2026)

## Prečo
Adam postavil desiatky webov a ani pri jednom sa nevyužil plný potenciál knižníc. Teraz je hotový **živý katalóg**
`/kit/*` (BoldKit v `src/components/ui/` + vendor kity), opravená stavebnica a recepty na každú potrebu webu.
Úloha: poskladať z nich **celý web xvadur.com** v jednom z 10 konceptov a použiť stavebnicu naplno.
Adam: „Texty teraz neriešime, point je, aby si spravil buildy.“

## Čo si prečítaj najprv
1. `work/v7/koncepty/NN-*.md` — tvoj koncept (layout, pohyb, podpisový pohyb). Médiá/Higgsfield: iba zástupné plochy.
2. Katalóg: `work/v7/katalog/{formulare,grafy,tvary,rozlozenie,prekrytia,vendor}.md` a `OPRAVY.md` + kód receptov
   v `src/components/v7/kit/**` (ReceptyBio, ReceptyProjekty, Recepty (hry, Cmd+K, sprievodca), Vysetrenie, KorpusNavrh,
   HeroKompozicie, Podpisy, CanvasEfekty). Recepty smieš **kopírovať a upraviť** do svojho priečinka (neimportuj
   z `v7/kit/**`, katalóg sa môže meniť).
3. `STACK.md` (Zákon dizajnu), `work/v7/ZADANIE.md` (mantinely, laťka konkurencie `work/V5_KONKURENCIA.md`).

## Kde staviaš (iba tvoje súbory)
- Stránka `src/pages/v7/NN.astro` → `<Base title="V7-NN · <koncept>" description="…" noindex islands="full" header="none">`.
- Komponenty `src/components/v7/web/NN/**`. Vlastné súbory (SVG, CSS) do `public/v7/NN/`.
- Poznámky `work/v7/vystup/NN/README.md` (čo je variant, recepty a kusy po blokoch, pohyb, zástupné plochy, čo nevyšlo).
- **Nemeň nič iné** (ui, vendor, styles, layouts, data, site, API, iné varianty). Chyba v zdieľanom kuse → obíď lokálne a zapíš do README.
- **Žiadny git.** Commituje hlavná session. Nič neinštaluj. Žiadny `astro dev`.

## Povinné bloky (poradie a forma podľa konceptu)
1. **Opona** s wordmarkom XVADUR (`src/components/home/Opona.astro` alebo tvoj variant podľa `/kit/vendor/` Podpisy 1) → odhalí hero.
2. **Hero s fotkou Adama:** zástupná plocha 4:5 so štítkom „FOTKA ADAMA“ (sticker, ink rám, tvrdý tieň). Motto „DIVIDED, WE ARE USELESS.“, kto je Adam jednou vetou (`src/components/hero/hero-data.ts` VETA), CTA na vyšetrenie. Logo/X z `public/brand/`.
3. **Korpus:** svietiaci widget (hero alebo bio) so 4 skutočnými číslami z `/pulse.json` (fetch na klientovi) a zástupnou dennou radou so štítkom „Korpus sa napojí neskôr“ + odkaz „štatistiky →“ na `/vitalne/` (stránka zatiaľ neexistuje, to je v poriadku). Žiadne vymyslené čísla.
4. **Bio / Kto som:** cesta elektrotechnická → viera v Boha → nemocnica (8 rokov) → psychológia → odchod (Jún 2025*) → AI → agenti → XVADUR. Texty zo `src/data/cesta.ts` a `src/components/v7/kit/rozlozenie/data.ts` (BIO); kde text chýba, štítok „text doplní Adam“. **Nepoužívaj beat 1 z beaty.ts** („Zmaturoval som dobre“ je zakázané), žiadne vety o maturite, škole, známkach.
5. **Projekty / Chorobopisy:** Jakub, Lucia, Hriech, Korpus (+ ďalšie z `src/data/fakty.ts` DOKAZY) — texty zo `src/components/v54/Chorobopisy.astro` a `fakty.ts`.
6. **Hry (showcase):** hry z `src/pages/hry/` a `src/components/hry/`, texty z `src/components/v5/TextyHry.astro`; otváranie na mieste (dialog/drawer) podľa receptu z `/kit/prekrytia/`.
7. **Liečba / služby** z `src/components/v54/Liecba.astro` a `src/data/ponuka.ts` (ponuka sa bude meniť, stačí dnešná).
8. **Rezervácia s Adamom — FUNKČNÁ:** volá `/api/terminy/` a `/api/rezervacia/` rovnako ako `src/components/v5/Rezervacia.tsx` (prečítaj ho, prevezmi logiku a payload vrátane UTM), UI postav z BoldKitu (stepper/multi-step-form, calendar, time-picker, field, sonner) podľa `Vysetrenie.tsx` z katalógu.
9. **Zápis e-mailu — FUNKČNÝ:** `/api/zapis/` ako `src/components/v5/ZapisForm.tsx`.
10. **Texty** (odkazy na `/texty/`), pätička, navigácia s Cmd+K do ekosystému (texty, Hriech, Netopier, Korpus, hry, vyšetrenie).

## Plný potenciál (povinné minimum, kontroluje sa)
- Aspoň **25 rôznych BoldKit kusov** zo `src/components/ui/`, z toho aspoň 3 grafy, aspoň 3 zo {shapes, ascii-shapes, sticker, layered-card, math-curve-*, canvas efekt}, aspoň 3 prekrytia.
- Aspoň **4 kusy z vendor kitov** (`src/components/vendor/**`).
- Jeden hlavný pohybový motor podľa konceptu + podpisový pohyb (nie z iného konceptu). Nikdy GSAP a Motion na jednom prvku.
- V README tabuľka: blok → recepty/kusy → prečo.

## Mantinely
- Farby iba z tokenov, `hot` iba na CTA a X, text na hot vždy ink, žiadne pastely, žiadny hex v komponentoch. Rohy podľa BoldKitu (hranaté).
- Slovenčina s diakritikou, tykanie. Čísla iba zo `src/data/fakty.ts` a `/pulse.json`. Prax = 8 rokov.
- Mobil 375 px bez vodorovného scrollu, 16 px okraje, ciele ≥ 44 px. `prefers-reduced-motion` = statické, 120 ms fade. Ťažké efekty iba ≥ 1024 px.
- JS stránky ≤ 250 kB gz (nad 180 kB zdôvodni v README).

## Overenie (povinné pred koncom)
1. `npx astro build --outDir dist-v7-NN` prejde; `npx astro check 2>&1 | grep -B2 -A6 "v7/web/NN\|pages/v7/NN"` bez chýb.
2. `node work/qa/serve.mjs <port> dist-v7-NN/client &`; Playwright (executablePath `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`, skript v `/tmp/claude-0/-home-user-landing/dfbf09fa-9b7d-5e80-97fc-c749695c4537/scratchpad/`, nie v repe): `/v7/NN/` pri 1440×900, 375×812 (touch) a 1440 reduced motion — pretečenie 0, chyby konzoly a pageerror 0 (sieťové chyby `/api/*` na statickom serveri sú v poriadku, formulár musí ukázať slušnú chybu). Pred načítaním `sessionStorage.setItem('opona','1')` pre screenshoty obsahu; oponu odfoť zvlášť.
3. Screenshoty celej stránky do `work/v7/vystup/NN/{d,m}.png` a 3–5 záberov kľúčových miest (`work/v7/vystup/NN/zaber-*.png`, viewport). **Pozri si ich (Read) a oprav, čo je škaredé, rozbité alebo prázdne.** Web musí vyzerať hotovo.
4. JS gz veľkosť stránky do README.
5. Server zastav, `rm -rf dist-v7-NN`.

## Výstup (posledná správa)
Krátko: čím je variant iný, počet BoldKit/vendor kusov, výsledky overenia, JS gz, čo nevyšlo.
