# NOTES_v6 — domov xvadur.com v6 (26. 9. 2026, vetva `claude/determined-goldberg-xy19as`)

Zadanie (Adam, 26. 9.): „postav v6 webu, v5 je úplne napiču“. v5 = stav `main` po 19.–25. 9.: opona, dešifrované
motto „DIVIDED, WE ARE USELESS.“, obrí wordmark ako masthead, reťaz pásov bez ponuky a bez zberu e-mailov.
Smer v6 = rozhodnutie z 25. 9. (STATUS): hlavný web a obchod, predajný aj cool, AI agenti a konzultácie,
lákadlo za e-mail, newsletter + extrakcie z `work/*_extraction.md` (web = dôkaz, nie vizitka; mechanizmus, nie
„robím AI“; live projekty a štatistiky).

## Čo je nové
- `src/pages/index.astro` — nová zákaznícka cesta: Hero + účtenka → marquee → Ponuka (#ponuka) → Dôkazy (#postavil)
  → marquee zmerané → Ako pracujem (#ako-pracujem) → Kto som (#kto-som) → Nástroje (#nastroje) → Vydanie/odber
  (#vydanie) → Konzultácia (Wizard). `islands="lite"`, Header je späť ako lišta.
- `src/components/home/` — `Hero.astro`, `Uctenka.astro` (účtenka webu: čísla z účteniek + build), `Ponuka.astro`,
  `Dokazy.astro` (karty s natívnym `<details>` „Účtenka“ a riadkom „čo treba opraviť“), `AkoPracujem.astro`,
  `KtoSom.astro` (kompaktné bio + 7 beatov verbatim), `Nastroje.astro`, `Odber.astro` (formulár + skript → fetch),
  `btn.ts` (triedy tlačidiel). Všetko statické Astro; jediný React na domove je Wizard v `KonzultaciaBand`.
- `src/data/projekty.ts` — 8 kariet dôkazov; **každé číslo cez `uctenka('kluc')`** zo `src/data/uctenky.ts`
  (ledger z 20. 9.: hodnota, pečiatka ZMERANÉ/ODHAD, zdroj, metóda, dátum). Neznámy kľúč = pád buildu; kľúč „NIKDE“
  alebo V OPRAVE = pád testu. `UCTENKA_RIADKY` (hero), `MARQUEE_UCTENKY` (pás).
- `src/data/ponuka.ts` — 3 karty ponuky (ČO TO JE · KDE BEŽÍ · ČO TI OTVORÍ), cena (po zmapovaní, pack 04),
  `KROKY_PRACE`, `NASTROJE`, `PRE_KOHO`, `ODBER` (texty odberu; `magnet` = placeholder, kým nie je vyplnený, prvý mail
  = existujúci text „Čo zostane, keď zavriem chat“).
- `src/data/nav.ts` — NAV: PONUKA, DÔKAZY, KVÍZ, HRY, TEXTY, MAKLÉRI (+ `NAV_CTA` KONZULTÁCIA ako hot tlačidlo v hlavičke,
  `navPath()` pre kotvy). SKÓRE WEBU ostáva v ⌘K, pätičke, sekcii Nástroje a na /makleri/.
- `src/pages/api/odber.ts` + `src/lib/odber.ts` — POST `{ email, zdroj, web }` → n8n webhook (`ODBER_WEBHOOK_URL`)
  alebo Resend (`RESEND_API_KEY`, voliteľne `RESEND_AUDIENCE_ID`); bez env 503 + mailto fallback; honeypot `web`.
  Overené z `dist/server` chunku (GET 405, 400, 413, 200, 502, 503).
- `src/components/site/Header.astro` — prop `commandK` (⌘K tlačidlo len keď je ostrov, t. j. `islands="full"`;
  v4/v5 bolo tlačidlo aj na stránkach bez ostrova), CTA KONZULTÁCIA. `Footer.astro` — nav = COMMAND_ITEMS + VYDANIE,
  riadok „Build Nº6 · hash · čas“ (`src/lib/build.ts`). `Base.astro` — prop `header` zrušený.
- `routes.ts` domov: „Jeden človek. Celý aparát. — XVADUR“ + nový popis; OG default rovnako.
- Testy: `tests/projekty.test.mjs`, `tests/odber.test.mjs`, upravený nav test. `npm test` = `node --test tests/*.test.mjs`
  (Node 22 nevie priečinok). `work/qa/browser.mjs` — Chromium z `/opt/pw-browsers`, keď Playwright svoju revíziu nemá.
- `package.json` 6.0.0 → účtenka a pätička ukazujú Build Nº6.

## Čo je preč (v5)
`src/components/hero/*` (Hero.tsx, Wordmark.tsx, hero-data.ts), `home/Opona.astro`, `home/Gravita*`, `home/Postavil*`,
`home/Hry.astro`, `home/Pasy.astro`, `home/Titulok|Stopa|Hranica`, `port/Metoda.astro`, `.scena-*` CSS,
QA skripty opony/hera. `src/lib/listok.ts` (Adamov wip) ostáva nedotknutý. Vendor kity a `/lab/` nedotknuté.

## Čísla (Playwright nad dist/client, 26. 9.)
Domov JS gz: **104,7 kB** desktop aj mobil (v5: 253,6 / 147,2). Z toho React runtime 63 + radix/sonner/Wizard ≈ 30 +
ClientRouter 5. 25 meraní `final.mjs`: 0 chýb konzoly, 0 pretečení, 0 rozbitých odkazov, 0 cieľov < 44 px na domove.
`npm run check` 0 chýb · `npm run build` zelený · `npm test` 29/29 · `nav.mjs` OK · `api.mjs` OK.

## Odchýlky a rozhodnutia [P, čaká na Adama]
- Čísla na domove idú z `uctenky.ts` (20. 9.), nie z `fakty.ts` (18. 9.): ledger sám eviduje opravy (CRM 23 → 25 tabuliek,
  947 → 1 518 vlákien, 30 → 48 skillov, „397 prepisov“ ≠ Netopier, gramata von). `fakty.ts` ostáva pre /makleri/, /skore/,
  /hry/ (KOTVY) a lab.
- Odkazy jakubolsa.sk a picung.xvadur.com sú podľa účteniek `postavil.web.*.status` = 200 (20. 9.). Z tohto kontajnera
  sa externé HTTP overiť nedalo (proxy) — pred deployom `curl -sI`.
- Meno klienta sa neuvádza („maklér v Bratislave“, „terapeutka“), doména áno (účtenka: doména je verejná).
- Hero veta „Jeden človek. Celý aparát.“ = pack 13 („jeden človek + celý aparát“, účtenka `trh.kotva.veta` = 0 z 459).
  Motto „DIVIDED, WE ARE USELESS.“ na domove nie je (ratifikované 19. 9. pre v4 hero, ktoré už neexistuje).
- KVÍZ v hlavnej nav, SKÓRE WEBU nie (produktový nástroj maklérov). Zmena voči spec 05 §4.
- Register: domov tyká (ako v4). Ceny nie sú (pack 04).
