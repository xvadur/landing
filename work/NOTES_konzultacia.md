# NOTES_konzultacia — Konzultácia + Texty (19. 9. 2026, vetva `v4`; po review opravené 19. 9. v noci)

Vlastník: `src/pages/konzultacia/**`, `src/pages/texty/**`, `src/components/konzultacia/**`, `src/components/texty/**`,
`src/content/**`, `src/content.config.ts`, tento súbor. Build `npx astro build --outDir dist-konzultacia` zelený,
`astro check` 0 chýb v mojich súboroch, QA `node work/qa/konzultacia.mjs work/screens` (server `python3 -m http.server 4184 --directory dist-konzultacia/client`) OK:
1440 / 375 / reduced-motion, 0 console a page errorov (okrem prefetch 404 na nepostavené cesty iných agentov), scrollWidth = viewport, ciele ≥ 44 px, vstupy s labelom;
formulár: skutočný kontrakt kvízu (`krok=kontext-prompt` → „Kontext + prompt/skill + kontrola.“, „6 h“, „40 €/h“), dlhá URL v poli → karta výsledku a tlačidlá ≤ 375 px, fokus po odoslaní = `#intake-vysledok`, po „Upraviť“ = `#intake-uloha`, farba chyby = ink, ostrov sa bez scrollu nehydratuje (client:visible).
Screenshoty `work/screens/konzultacia-{konzultacia,texty,clanok}-{desktop,mobile,reduced}.png`, `konzultacia-formular-{desktop,mobile}.png`.
QA skript čaká na hydratáciu (`astro-island:not([ssr])`) a pri `ERR_CONNECTION_RESET` (python http.server občas zhodí spojenie) stránku načíta znova — 3× po sebe OK.
Meranie JS: `node work/qa/jsgz.mjs dist-konzultacia/client /konzultacia/ [--mobile]` (tranzitívne importy chunkov).

## Cesty
| Cesta | Súbor | islands | Obsah |
|---|---|---|---|
| `/konzultacia/` | `src/pages/konzultacia/index.astro` | `lite` (Toaster) | verejná ponuka (pack 04 verbatim) · marquee · `#priebeh` tabuľka 30 min · `#otazky` 6 otázok · `#riesenie` voľba najmenšieho riešenia · `#vstup` správa pred stretnutím · `#formular` intake ostrov |
| `/texty/` | `src/pages/texty/index.astro` | `none` | karty z kolekcie `texty` (dátum, čas čítania, perex) · pás „Vydanie — týždenný text o AI po slovensky“ → substack.com/@xvadur (200 overené 19. 9.) |
| `/texty/co-zostane-ked-zavriem-chat/` | `src/pages/texty/[slug].astro` | `none` | článok z 11. 9. verne, `.prose`, perex ako lede, X dropcap na prvom bežnom odseku, CSS priebeh čítania, „krátka vložka“ (pack 05 verbatim) → `/konzultacia/`, odkaz Substack |

Kotvy na `/konzultacia/`: `#priebeh` (Ako prebieha 30 minút — používa KonzultaciaBand), `#otazky`, `#riesenie`, `#vstup`, `#formular` (všetky `scroll-mt-20`).

## Query kontrakt (kvíz / plán → `/konzultacia/`)
`?z=kviz|plan&kto=…&hodiny=…&sadzba=…&krok=…` — všetko voliteľné, hodnoty sa orežú na 120 znakov bez nových riadkov.
- `z=kviz` → štítok „Prichádzaš z kvízu“ v hero (inline skript, `astro:page-load`) + v ostrove; `z=plan` → „Z plánu Neviditeľný maklér“ (rodovo neutrálne, na oboch miestach rovnaké).
- `kto` → select „Kto si“: hodnoty `autor | nastroje | firma | makler | ine`; iný text sa mapuje aliasmi na celé slová (autor/tvorca, freelancer/szco/nastroje, makler/realitny pred firma/agent) alebo skončí ako „Iné“ + doplnenie s pôvodným textom.
- `krok=<slug>` presne podľa `src/data/kviz/kroky.ts` (`vstup-sablona | kontext-prompt | automatizacia | agent | vlastnik`) → `krokText()` ho preloží na názov kroku z tabuľky („Kontext + prompt/skill + kontrola.“); neznámy text ostáva surový. `hodiny` a `sadzba` číselné → `hodinyText()` „6 h“, `sadzbaText()` „40 €/h“ (kvíz posiela hodinovú sadzbu v €).
- `hodiny`, `sadzba`, `krok` → žltý blok nad formulárom (dl) a riadok v správe: `Z kvízu na xvadur.com: hodiny týždenne: 6 h, sadzba: 40 €/h, navrhnutý prvý krok: Kontext + prompt/skill + kontrola.` (pri `z=plan`: `Prichádzam z plánu Neviditeľný maklér (Deň 8).`). Bez `z`, ale s hodnotami → `Doplnenie: …`.
- Príklad (skutočný výstup kvízu, `konzultaciaUrl()` v `src/components/kviz/logika.ts`): `/konzultacia/?z=kviz&kto=firma&hodiny=6&sadzba=40&krok=kontext-prompt`.

## Ostrov `Intake` (`src/components/konzultacia/Intake.tsx`, `client:visible={{ rootMargin: '600px' }}`)
Natívne prvky s brutal triedami (`src/components/konzultacia/ui.ts`: `INPUT`, `TEXTAREA`, `SELECT`, `BTN_HOT|LIME|WHITE` — rovnaké tokeny ako neobrutalism input/textarea/button) + `NativeSelect.tsx` (natívny `<select>`, `appearance-none`, šípka = Phosphor CaretDown, žiadny hex). Žiadny Radix, žiadne `cn()`/tw-merge/cva — po review (rozpočet JS). Polia: kto si (select, „Iné“ odkryje input), jedna úloha (textarea, povinná — chyba `role=alert` + `aria-invalid`, text ink + ľavý horúci rám 6 px = kontrast AA), ako často (select), v čom pracuješ (input), čo je pri výsledku dôležité (textarea), kontakt (input, voliteľné, `aria-describedby` na hint, `autoComplete="on"`).
Hydratácia až pri doscrollovaní k `#formular` (600 px vopred) — bez scrollu sa Intake nesťahuje (QA to kontroluje); kotva `#formular` a `?z=kviz` fungujú (IntersectionObserver po skoku).
Po „PRIPRAVIŤ SPRÁVU“: `<pre>` s payloadom (`[overflow-wrap:anywhere]`, dlhé URL sa lámu — karta na 375 px nepretečie) + `OTVORIŤ WHATSAPP` (`https://wa.me/?text=<payload>`), `POSLAŤ E-MAIL` (`mailto:adam@xvadur.com?subject=Konzultácia&body=<payload>`), `KOPÍROVAŤ` (sonner toast), „Upraviť odpovede“. Fokus: po odoslaní na `#intake-vysledok` (`tabIndex=-1`), po „Upraviť“ na `#intake-uloha` (pri prvom vykreslení sa fokus neberie). Bez backendu, bez Astro Actions.
Logika mimo Reactu: `src/components/konzultacia/payload.ts` — exporty `EMAIL`, `SUBJECT`, `KTO_OPTIONS`, `CASTO_OPTIONS`, `readPrefill(search)`, `ktoFromPrefill`, `intakeFromPrefill`, `krokText`, `sadzbaText`, `hodinyText`, `buildPayload(intake, prefill)`, `whatsappUrl`, `mailtoUrl`, `zdrojLabel`. Importuje `krokBySlug` z `@/data/kviz/kroky` (read-only, len import) — priamy node import preto potrebuje alias.
Obsah stránky verbatim z packu 04: `src/components/konzultacia/data.ts` (`PONUKA`, `PRIEBEH`, `PRIEBEH_POZNAMKA`, `OTAZKY`, `OTAZKY_POZNAMKA`, `RIESENIA`, `RIESENIA_POZNAMKA`, `VSTUP_TEXT`, `VSTUP_CITLIVE`). Kvíz môže `RIESENIA` importovať (tabuľka „Voľba najmenšieho užitočného riešenia“, 5 riadkov).

Pozor pre ostatných (Radix Select vo `<form>`, už ho tu nepoužívam): položky sa montujú až render po mounte; kontrolovaná hodnota nastavená v prvom `useEffect` sa cez skrytý natívny `<select>` vráti ako `''` — predvyplnenie musí ísť cez `setTimeout(…, 0)`. Natívny select tento hack nepotrebuje.

## Kolekcia `texty`
`src/content.config.ts`: `glob({ pattern: '*.md', base: './src/content/texty' })`, schéma `{ title, date (coerce), description, substack?: url }`. `z` z `astro/zod` (z `astro:content` je deprecated).
`src/content/texty/co-zostane-ked-zavriem-chat.md`: telo = zdroj 11_ bez H1 (názov vo frontmatteri), odseky a poradie zhodné (`diff` proti zdroju = len úvodný prázdny riadok); `date: 2026-09-11`; `description` = perex; `substack` zatiaľ nie je (text nie je na Substacku publikovaný — link ide na profil).
Pomôcky `src/components/texty/citanie.ts`: `pocetSlov`, `minutyCitania` (200 slov/min — odvodený orientačný údaj, nie fakt z packov; komentár v kóde), `citanieLabel`, `datumSk`, `datumIso`, `SUBSTACK_URL`, `VYDANIE_LABEL`, `VLOZKA` (krátka vložka verbatim z packu 05).
`src/components/texty/ScrollProgress.astro`: 0 kB priebeh čítania (`animation-timeline: scroll()`), `pointer-events-none` (leží nad lepivou hlavičkou z-50, neberie jej kliky), pri reduced motion skrytý, bez podpory skrytý.
`[slug].astro`: hlavička = `<section aria-label="Hlavička textu">`, telo = `<div>` bez aria-label (aria-label na generickom div je zakázaný) + `<article>`.
`/texty/` pás Vydanie: len ratifikovaný label + „Vychádza na Substacku.“ + tlačidlo (bez sľubu formátu).

## JS (gz, tranzitívne, `work/qa/jsgz.mjs`)
- `/konzultacia/` po review: 117,8 kB nominálne (skript počíta aj mobilný Drawer + vaul ≈ 23 kB) → **≈ 94 kB desktop / 118 kB mobil** (predtým 135,6 / 147,4). Základ lite = React 65 + sonner 9,3 + ClientRouter 4,8 + prefetch 1,2 + shimy ≈ 81 kB; môj prírastok ≈ 10 kB (Intake 4,7 + kroky 0,7 + 6 ikon ≈ 5). Radix Select, Badge, Button/Input/Textarea (cn/tw-merge/cva/Slot) preč. Limit 70 kB doc 10 sa bez zmeny základu nedá dosiahnuť — pozri požiadavky nižšie.
- `/texty/`: 74 kB (len React runtime pre Header Drawer, na desktope sa nenačíta — reálne ≈ 6 kB ClientRouter + prefetch) · 98,7 kB mobil.
- článok: rovnaké ako `/texty/` — 0 kB vlastných ostrovov.

## Odchýlky od spec / doc 10
1. **Magic UI ScrollProgress nahradený CSS pásom** (`src/components/texty/ScrollProgress.astro`). Ostrov by na článok priniesol React + Motion ≈ 120 kB gz (zmerané 125 kB desktop) pri rozpočte „články 0 kB mimo ostrovov / podstránky ≤ 70 kB“. Vzhľad rovnaký (hot, 8 px, rám 3 px). Ak Adam chce pôvodný ostrov: `import { ScrollProgress } from '@/components/vendor/magicui/scroll-progress'` + `client:idle`.
2. Poznámka pod „Voľba najmenšieho užitočného riešenia“: pack 04 hovorí „OpenClaw je jedna možná technická cesta. Nenútime ho do úlohy, ktorú vyrieši jednoduchší postup. Tento pack neobnovuje vypnutý osobný runtime.“ — na web ide len „Nenútime agenta do úlohy, ktorú vyrieši jednoduchší postup.“ (OpenClaw je interný, vypnutý runtime; tretia veta je interná).
3. Z časti „Vstup pred stretnutím“ sú na webe prvé dve vety interného pokynu o prílohách prepísané z infinitívu do 1. osoby ako Adamov záväzok („Prílohy si vypýtam len v rozsahu úlohy. Pri citlivom obsahu začneme…“) pod eyebrow „Moje pravidlá“; tretia („Nedávať cudzie údaje do vlastného demo packu.“) nie. Rovnako poznámka pod priebehom („…nezväčšujem bezplatné stretnutie na audit celej firmy. Uzavriem jednu úlohu a pripravím ohraničený návrh. Ak AI nie je vhodná, poviem konkrétny dôvod a odporučím jednoduchší postup.“) — obsah packu 04 nezmenený, len osoba. Ponuka, tabuľky a 6 otázok ostávajú verbatim.
3b. H2 sekcie formulára je „Napíš mi úlohu.“ (nie duplikát H1). Hlavičky stĺpcov tabuliek 14 px mono (nie 13 px eyebrow), mobilné štítky riadkov 14 px; tabuľky majú explicitné `role="table|rowgroup|row|columnheader|rowheader|cell"`, aby sémantika prežila `display:block` pod 640 px.
4. Zvyšok packu 04 (ukážka hodnoty, následná ponuka, meranie, „prečo nie kurz“) na stránku nejde — spec 05 §3 ho nepýta a ceny sa neuvádzajú.
5. Tabuľky sú skutočné `<table>`; pod 640 px sa riadok skladá pod seba (`data-label` cez `::before`), aby nevznikol vodorovný scroll.
6. Dotykové ciele inline odkazov v texte (mailto v odseku, odkaz v článku) sú zväčšené zvislým paddingom inline prvku (nemení riadkovanie), nie min-výškou.

## Požiadavky na zdieľané súbory (nič som nemenil)
- `src/data/routes.ts`: `/texty/co-zostane-ked-zavriem-chat/` má `description: 'Text z 11. 9. 2026.'` — meta description článku je perex („AI mi otvorila cestu…“ z frontmatteru), OG/routes hovoria inak. Návrh: description = perex článku (`entry.data.description`). Ak pribudne ďalší text, treba pridať cestu (inak OG = `/og/default.png`, title z frontmatteru).
- Rozpočet JS podstránok (doc 10 §3: ≤ 70 kB): základ lite je sám ≈ 81 kB desktop (React 65 + sonner 9,3 + ClientRouter/prefetch 6). Návrh pre základ: Toaster/sonner načítať lenivo (dynamický import až pri prvom toaste) alebo `islands="lite"` bez React runtime — inak treba limit pre stránky s formulárom ratifikovať nanovo (≈ 100 kB).
- `src/styles/tokens.css`: horúce CTA `bg-hot text-paper` = 3,17:1 pri 18 px/800 (AA len ako „large text“, 0,66 px pod hranicou 18,66 px). Návrh: `--color-hot` o ≈ 5 % L tmavšie (≈ 4,5:1 s paper) alebo CTA text `text-ink` na hot — vzor tlačidla je zo základu, na stránke to nemením.
- `src/styles/global.css`: utilita `eyebrow` má 13 px (0.8125rem) — pod hranicou 14 px pre bežný text. Na stránke som ju nechal len ako systémový štítok (eyebrow nad nadpismi, figcaption); hlavičky tabuliek majú vlastných 14 px. Ak má eyebrow zostať 13 px, je to výnimka základu, nie stránky.
- `src/styles/tokens.css`: chýba `--header-h` (výška lepivej hlavičky ≈ 71 px) — ScrollProgress by mohol sedieť pod hlavičkou (`top: var(--header-h)`) namiesto `top-0` s `pointer-events-none`.
- Vlastníctvo QA: `work/qa/konzultacia.mjs` + `work/screens/konzultacia-*.png` sú mimo litery kontraktu (`work/NOTES_<meno>.md`), rovnako ako u ostatných agentov — pri zbere rozšíriť kontrakt na `work/qa/<meno>.mjs` + `work/screens/<meno>-*`.
- `src/components/port/KonzultaciaBand.astro` odkazuje na `/konzultacia/` — kotva `#priebeh` existuje, odkaz môže ísť na `/konzultacia/#priebeh`.
- Nič v `src/styles/**` netreba; dropcap pre markdown je scoped v `[slug].astro` (global `.dropcap` je triedne pravidlo, markdown triedu nepridá) — ak by základ chcel, `.prose > p:first-of-type::first-letter` by mohlo ísť do global.css.

## Otvorené
- `substack` URL článku doplniť do frontmatteru, keď Adam text publikuje (tlačidlo „Čítať na Substacku“ sa zobrazí samo).
- Kvíz: potvrdiť, aké hodnoty posiela v `kto` (mapovanie aliasov je tolerantné, ale presné hodnoty `autor|nastroje|firma|makler|ine` sú istota).
- WhatsApp bez čísla (`wa.me/?text=`) otvorí výber kontaktu — rovnaké ako Wizard v základe; číslo nie je v packoch.
- `/konzultacia/` ≈ 94 kB desktop je nad 70 kB doc 10 len kvôli základu (lite = React + sonner); Select bez Radixu a natívne prvky sú hotové (−41 kB).
