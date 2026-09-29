# V7 · Katalóg surovín — spoločné zadanie pre agentov (29. 9. 2026)

## Prečo
Adam postavil desiatky webov a ani pri jednom sa nevyužil plný potenciál knižníc. BoldKit (`src/components/ui/`, 85 súborov)
má byť **jedna stavebnica pre celý ekosystém XVADUR** (xvadur.com, Hriech, Netopier …): tie isté komponenty, iný štýl.
Katalóg má ukázať **všetko, čo každý kus vie** — všetky varianty, veľkosti, stavy, props, kombinácie — naživo,
s Adamovým obsahom a v tokenoch xvadur.com. Z katalógu sa potom píše kuchárka receptov (hero, bio/príbeh, projekty,
hry, dôkaz/čísla, rezervácia, zápis, navigácia).

## Čo postavíš (iba tvoje súbory, nič iné)
- Stránka `src/pages/kit/<skupina>.astro` → `<Base title="Kit · <Skupina>" description="…" noindex islands="full">`, jeden alebo viac React ostrovov `client:visible` (prvý `client:load`).
- Komponenty `src/components/v7/kit/<skupina>/*.tsx` (jeden súbor na sekciu alebo na komponent, ako je prehľadnejšie).
- Poznámky `work/v7/katalog/<skupina>.md`: pre KAŽDÝ kus: čo robí · varianty/props, ktoré existujú (prečítaj zdrojový kód, nevymýšľaj) · na akú potrebu webu sa hodí (hero, bio/príbeh, projekty, hry, dôkaz/čísla Korpusu, rezervácia, zápis, navigácia, texty) · nápad na použitie v Hriechu/Netopierovi · problémy (chyby, kolízia s tokenmi, a11y, mobil).

## Pravidlá
- **Prečítaj zdrojový kód každého kusu** v `src/components/ui/<kus>.tsx` a ukáž **všetky exportované varianty a props** (variant, size, farby, stavy disabled/loading/error, orientácia, animácie). Cieľ je plný potenciál, nie jedna ukážka na kus.
- Každý kus má na stránke: nadpis (meno kusu, Geist Mono), jednu vetu, na čo je, mriežku variantov, a aspoň jednu **reálnu kombináciu s Adamovým obsahom** (texty z `src/components/v54/*.astro`, `src/data/cesta.ts`, `src/data/ponuka.ts`, `src/data/fakty.ts`, `public/pulse.json`).
- Čísla: skutočné iba zo `src/data/fakty.ts` a `public/pulse.json`. Ak graf potrebuje radu, ktorú nemáme (napr. denné slová), použi ukážkové dáta a daj k nemu `<Badge>ukážkové dáta</Badge>`. Nikdy nepredstieraj, že ukážka je skutočná.
- Slovenčina s diakritikou, tykanie. Žiadne lorem.
- Farby iba z tokenov (triedy Tailwind z `src/styles/tokens.css` + `src/styles/boldkit.css`); žiadny hex v komponentoch. `hot` iba na CTA a X, text na `hot` je vždy ink.
- **Nemeň** `src/components/ui/**`, `src/styles/**`, `src/layouts/**`, `src/data/**`, `src/components/site/**`, `package.json`, `astro.config.mjs`. Ak kus má chybu alebo nesedí s tokenmi, opíš to v poznámkach (súbor, riadok, návrh opravy) a obíď to v ukážke.
- Nič neinštaluj (sieť ku knižniciam je zablokovaná).
- Mobil 375 px bez vodorovného scrollu (široké veci do `overflow-x-auto` kontajnera), ciele ≥ 44 px.
- **Žiadny git** (nie add, commit, push, switch). Commituje hlavná session.
- Nespúšťaj `astro dev`.

## Overenie (povinné pred koncom)
1. `npx astro build --outDir dist-kit-<skupina>` prejde.
2. `npx astro check 2>&1 | grep -A3 "src/components/v7/kit/<skupina>\|src/pages/kit/<skupina>"` — žiadne chyby v tvojich súboroch.
3. `node work/qa/serve.mjs <port> dist-kit-<skupina>/client &` a Playwright skript (napíš si ho do scratch, nie do repa)
   odfotí `/kit/<skupina>/` celú stránku na 1440×900 a 375×812 do `work/screens/kit-<skupina>-{d,m}.png`,
   vypíše `document.documentElement.scrollWidth - innerWidth` (musí byť 0) a chyby konzoly/pageerror (musia byť 0).
   Pred načítaním `sessionStorage.setItem('opona','1')` cez addInitScript. Pozri si screenshoty (Read tool) a oprav, čo je rozbité alebo škaredé.
4. Server zastav, `rm -rf dist-kit-<skupina>`.

## Výstup (posledná správa)
Krátko: počet kusov a variantov ukázaných, zoznam súborov, výsledky overenia (build, check, pretečenie, chyby), top 5 objavov „toto vie viac, než by človek čakal“, nájdené chyby v kusoch.
