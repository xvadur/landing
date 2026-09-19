# NOTES_skore — Skóre webu makléra + Hry (19. 9. 2026, vetva `v4`, necommitnuté)

Vlastník: `src/pages/skore/**`, `src/pages/api/**`, `src/pages/hry/**`, `src/components/skore/**`, `src/components/hry/**`,
`src/lib/skore-analyzer.ts`, `tests/**`, `work/NOTES_skore.md`. QA artefakty mimo vymenovaného vlastníctva (bez vplyvu na build, bez konfliktu):
`work/qa/skore.mjs`, `work/qa/api.mjs`, `work/qa/jsgz.mjs`, `work/qa/skore/review.mjs`, fixtúra `work/qa/fixtures/klise.html`, screenshoty `work/screens/skore-*.png`.
Build `npx astro build --outDir dist-skore` zelený, `npx astro check` 0 chýb / 0 varovaní / 0 hintov, `npm test` 20/20
(11 v `tests/skore-analyzer.test.mjs`, 4 v `tests/skrtni.test.mjs`, 5 v `tests/data.test.mjs`).

## Opravy po review (19. 9., druhé kolo)
- **Verdikt z dát** — `verdiktSkore(skore, { rodinyZasiahnute, dokaz, prvyKrok })`: titul podľa pásma, text poskladaný len z nameraných zložiek
  (0 rodín ≠ „frázy“, rezervácia ≠ „Kontakt“). Bez `detaily` (test pásiem) text nič netvrdí. Test na kontradikcie.
- **„Nezáväzná / bezplatná konzultácia“** bez termínu = zložka kontakt (10 b.), nie rezervácia (30 b.): `KONZULTACIA_TEXT` v analyzéri + test.
  Karta „Rezervácia termínu“ hovorí porovnanie („Termín ako prvý krok ponúka len 15 zo 416 webov.“), nie príslušnosť k vzorke.
- **Percentá**: 66 % a 23 % preč (nie sú v packe). Ostávajú len doslovné 64 % a 3,6 % z packu 13 §1 (konštanty v `AkoSaPocita.astro`), inde len zlomky.
- **Placeholder / príklad v chybe API**: `www.vas-web.sk` (19. 9. curl → bez odpovede, doména bez záznamu), nie živý `www.mojweb.sk`.
- **Chyba pri ne-JSON odpovedi**: „Analyzér práve neodpovedá. Skúste to o chvíľu.“
- **„Domovská stránka“ → „vložená stránka“** v SkoreForm, Skeletone, AkoSaPocita a API: analyzuje sa presne vložená URL (maklér môže mať profil ako podstránku webu kancelárie).
- **/hry/**: popisy hier 02/03 ([P], nie zo spec) odstránené — len názov, sticker „V stavbe“ (predvolená žltá utilita, ink/yellow kontrast) a „Zatiaľ bez odkazu. Pribudne.“ (`text-ink/70`). Adam doplní popis jedným riadkom, ak chce.
- **Škrtací test**: „Celý plán →“ vo vlastnom riadku s `min-h-11` (44 px); `useReducedMotion` → Motion prechody 120 ms pod RM (výsledok aj „Čo zostalo“, bez delay);
  `scrollIntoView` bez smooth pod RM (aj v SkoreForm); `break-words` na škrtnutom texte aj „Čo zostalo“; `zalom()` delí slovo širšie než riadok po znakoch (PNG karta);
  `dt` 14 px (`text-sm`), legenda `text-sm`; dlaždica Škrtov `bg-hot text-ink` (5,36 : 1); `<dt>` pred `<dd>` v DOM (CSS `order` ostáva);
  `<mark>` `text-ink/60` + sr-only „(škrtnuté — fráza: …)“ namiesto `title`; počítadlo slov bez `aria-live`.
- **NumberFlow naozaj animuje** (Gauge aj Pocitadlo): mount s 0, `requestAnimationFrame` → cieľ; bez RM 5 WAAPI animácií (450/900 ms) v shadow roote, pod RM 0
  (NumberFlow rešpektuje preferenciu sám). Merač: `stroke-dashoffset` transition 500 ms beží (pod RM 120 ms globálne). Pozor pri meraní:
  `el.getAnimations({subtree:true})` shadow DOM nevidí — treba `nf.shadowRoot.getAnimations()` (tak to robí `work/qa/skore/review.mjs`).
- **Noise** v skeletone: `animate={isDesktopPointer()}` (na dotyku/mobile statické zrno).
- **A11y SkoreForm**: `aria-live="polite"` len na sr-only riadku („Skóre N zo 100 — titul“ / „Čítam stránku …“), výsledok mimo live regiónu, chyba `role="alert"` mimo neho,
  po výsledku fokus na `h2#skore-verdikt` (`tabIndex=-1`, `preventScroll`). Opacity ink minimálne `/60` (Zlozka, hero `/ z`).
- **API** (`src/pages/api/skore.ts`): presmerovania ručne (`redirect: 'manual'`, max 5, každý `location` cez `normalizujUrl` + `jeZakazanyHost` → 400/502);
  telo požiadavky max 8 kB (`content-length` aj skutočná dĺžka → 413); `bajty` = skutočné bajty odpovede; kódovanie podľa `charset=` v Content-Type,
  inak `<meta charset>` / `http-equiv` z prvých 2 kB, inak utf-8 (`zistiKodovanie` / `dekodujHtml` v analyzéri; odpoveď má `kodovanie`).
  `jeZakazanyHost` chytá IPv4 v každom zápise (127.1, 2130706433, 0x7f.1, 0177.0.0.1), IPv6, localhost, .local, .internal.
- **Testy cez `node --test`**: `skrtni`, `UKAZKA`, `VYNIMKY`, `pocetSlov` presunuté do `src/components/hry/skrtni.ts` (relatívne importy; ostrov ich re-exportuje);
  `normalizujUrl` / `jeZakazanyHost` / `zistiKodovanie` / `dekodujHtml` v `src/lib/skore-analyzer.ts`. Nové testy: kontradikcie verdiktu, konzultácia = kontakt,
  windows-1250 fixtúra (mini-kodér v teste, mojibake by rodiny nenašiel), validácia URL, `tests/skrtni.test.mjs` (11 škrtov, veta Dňa 2 = 0, prednosť fráz, okraje).
- Overené nad hotovým worker chunkom (mock fetch): 405 / 400 / 413 / cp1250 header aj meta → 4 rodiny ako utf-8 / presmerovanie OK / presmerovanie na 127.0.0.1 → 400 /
  slučka → 502 / živé example.com 200, jakubolsa.sk 200 (skóre 87, rezervácia).
- Neriešené tu (rozhodnutie Adama / mimo vlastníctva): JS rozpočet 70 kB (základ lite sám ≈ 83 kB; Motion layout je spec doc 10 §3 #16, NumberFlow #14 — teraz aspoň naozaj animuje);
  `/hry/` ostáva `islands="full"` (kontrakt: hry = full, kurzor VSTÚP na „Hrať“ — prepnúť na lite = −50 kB na desktope, ak Adam nechce kurzor);
  CTA hot/paper 18 px (3,17 : 1) je vzor zo základu; rate limit /api/skore = Cloudflare WAF rule (napr. 30/min/IP) pred nasadením.

## Cesty
| Cesta | Súbor | islands | Ostrov |
|---|---|---|---|
| `/skore/` | `src/pages/skore/index.astro` | lite | `<SkoreForm client:idle />` |
| `/api/skore` | `src/pages/api/skore.ts` (`prerender = false`) | — | worker route, v builde `dist-skore/server/chunks/skore_*.mjs` |
| `/hry/` | `src/pages/hry/index.astro` | full | žiadny vlastný (Wizard z KonzultaciaBand) |
| `/hry/skrtaci-test/` | `src/pages/hry/skrtaci-test.astro` | lite | `<SkrtaciTest client:idle />` |

Title/description z `routeByPath()`. OG karty sa generujú zo `routes.ts` (nič sa nemenilo).

## A · Skóre webu
- **`src/lib/skore-analyzer.ts`** — čistá funkcia `analyze(html, url)` → `{ klise[], prvyKrok, formulare, bookingWidget, vendor, skore, detaily }`.
  Bez DOM, bez `node:*` (beží v node teste, vo workerd aj v prehliadači). Importy relatívne s príponou `.ts`
  (`../data/frazy.ts`, `../data/fakty.ts`), aby ich čítal aj `node --test` (tsconfig má `allowImportingTsExtensions`).
  Exporty navyše: `extractText`, `decodeEntities`, `najdiKlise`, `najdiBooking`, `najdiVendor`, `spocitajFormulare`,
  `urciPrvyKrok`, `najdiDokaz`, `bodyZa*`, `verdiktSkore`.
- **Vzorec (0–100, viac = menej zameniteľný web)** — kotvy z `KOTVY` (fakty.ts = pack 13 §1), dokumentovaný v `AkoSaPocita.astro`:
  1. Frázy 0–40: `40 × (6 − zasiahnuté základné rodiny) / 6` (kotva 31/47).
  2. Prvý krok 0–30: rezervácia 30 (widget, odkaz/text „rezervovať / dohodnúť termín“), „Kontakt“/tel:/formulár 10, nič 0 (kotvy 267/416, 15/416).
  3. Dôkaz 0–20: predaj s číslom (cena / dni / %) alebo prípadová štúdia = 20; „20 rokov skúseností“, „od roku …“ = 0 (kotva 96/416).
  4. Nástroj 0–10: rozpoznaný booking widget (Calendly, Cal.com, Google Calendar appointments, Reservio, Bookio, Reservanto, HubSpot, Acuity, YouCanBookMe, TidyCal, zcal, SimplyBook, Setmore, MS Bookings, Koalendar) 10, aspoň jeden `<form>` 4, nič 0.
- Vendor: meta generator + signatúry (WordPress, Webnode, Wix, Webflow, Squarespace, Joomla, Drupal, Shopify, Duda, Weebly, Jimdo, Next.js, Astro; inak prvé slovo z generatora).
- **`/api/skore`**: POST JSON `{url}` (aj form-data) → normalizácia (bez schémy doplní https), len http(s) + doména (localhost, `.local`, IP literály zakázané),
  fetch s 8 s timeoutom, UA `XVADUR-skore/1.0 (+https://xvadur.com/skore/)`, stream max 1 MB (`orezane: true`), content-type musí byť HTML/XML/text.
  Odpoveď `{ ok, url, orezane, bajty, analyzovane, ...analyze }`. GET/PUT/PATCH/DELETE → 405 JSON, OPTIONS 204. Chyby `{ chyba }` po slovensky (400/415/502).
  Overené bez dev servera: `node work/qa/api.mjs` importuje hotový chunk z `dist-skore/server/chunks/` a volá handlery (GET 405, zlé URL 400, localhost 400,
  neexistujúca doména 502); živé weby cez ten istý chunk odpovedali 200 (example.com, jakubolsa.sk, bosen.sk; 170–850 ms).
- **`src/components/skore/SkoreForm.tsx`** (client:idle): Input + Button (neobrutalism), stavy idle/loading/done/error, skeleton s React Bits `Noise`,
  výsledok = `Gauge` (SVG polkruh, `stroke-ink/paper/hot`, NumberFlow číslo) + verdikt + 4 zložky (body) + 4 karty (frázy s príkladmi
  prečiarknutými v hot, prvý krok s dôvodom, dôkaz s dôvodom, nástroj s dl) + CTA `/makleri/` a `/hry/skrtaci-test/`.
  Statický náhľad (bez workera) → „Analyzér práve neodpovedá. Skúste to o chvíľu.“ (odpoveď nie je JSON). Sr-only `aria-live` stav, `role=alert` mimo neho, label na inpute, fokus na verdikt.
- **`src/components/skore/Gauge.tsx`** — `{value, label?, className?}`; `src/components/skore/AkoSaPocita.astro` — `{id?}`.
- Stránka: žltý hero s 4 kotvami (`card-drop`), formulár, ružový marquee zo 14 `CITACIE`, Ako sa počíta (4 karty + 6 rodín s `z47`), čierny pás → `/makleri/`, `KonzultaciaBand`.

## B · Hry
- **`/hry/`**: 3 karty (Škrtací test live → `/hry/skrtaci-test/` s `data-cursor="vstup"`; Miliarda → bilión a Strach-o-meter so `sticker` „V stavbe“
  (žltá utilita), bez odkazu a bez popisu, `tx-halftone`), čierny marquee, KonzultaciaBand.
- **`src/components/hry/skrtni.ts`** (čistá logika, relatívne importy): `skrtni(text): Skrt`, `UKAZKA`, `VYNIMKY`, `pocetSlov`, typy `Segment`, `Skrt`.
- **`src/components/hry/SkrtaciTest.tsx`** (client:idle, čisto klient): re-exportuje `skrtni`, `UKAZKA`, `VYNIMKY`, typy; export `nakresliKartu(skrt): Promise<Blob>`.
  - `skrtni`: `frazyRegex()` (prednosť) + `pridavneRegex()` bez prekrytia → segmenty; `<mark class="skrt">` = `bg-transparent line-through decoration-hot decoration-[3px]`
    s `title` (rodina / prídavné meno). Čísla: škrtov, zostalo slov, z pôvodných; „Čo zostalo“ = text bez škrtov (opravené medzery pred interpunkciou).
  - Výnimka `VYNIMKY = {'osobne'}`: kmeň `osobn` chytal príslovku vo vzorovej vete Dňa 2 („Predaj držím osobne.“) — tá musí prejsť s 0 škrtmi.
  - Ukážka v textarea je poskladaná len z fráz/prídavných mien z `frazy.ts`, bez mien, čísel a telefónov.
  - Motion: `MotionConfig reducedMotion="user"`, `AnimatePresence` + `layout` na výsledku a paneloch. NumberFlow (`locales="sk-SK"`) v počítadlách.
  - Konfety pri 0 škrtoch: lazy `import('@/components/vendor/magicui/confetti')` → `fireConfetti` (nie je v SSR ani v úvodnom balíku).
  - Karta 1080×1080: Canvas 2D, farby z tokenov cez `getComputedStyle(--color-paper/ink/hot/yellow/lime)` (fallback pomenované farby, žiadny hex),
    fonty cez `document.fonts.load` (Bricolage 800, Space Grotesk 700, Geist Mono 500), X z `/brand/x.svg` (doplní width/height, data URL),
    „ŠKRTACÍ TEST“, 3 čísla, box „Čo zostalo“, `xvadur.com/hry/skrtaci-test/`. „Stiahnuť kartu“ = `skrtaci-test.png`; „Kopírovať text“ = zostalo + riadok s číslami + URL, sonner toast.
- Stránka `/hry/skrtaci-test/`: žltý hero + 6 rodín prečiarknutých (`z47 / 47`), ostrov, ružový marquee citácií, „Prečo“ (31/47 + počty rodín z `frazy.ts`), CTA `/makleri/` a `/skore/`.

## QA (19. 9.)
`python3 -m http.server 4185 --directory dist-skore/client & node work/qa/skore.mjs` → 1440×900, 375×812, 375 reduced-motion × 3 cesty:
0 console/page errorov (501 na POST /api/skore v statickom náhľade sa filtruje ako očakávané; ERR_CONNECTION_RESET pythonu pri prvom náraze = jedno opakovanie),
scrollWidth = viewport, 0 cieľov < 44 px, hydratácia (`astro-island:not([ssr])`), ŠKRTNI na ukážke = 11 škrtov, veta Dňa 2 = 0 škrtov,
download `skrtaci-test.png` (uložený `work/screens/skore-hry-skrtaci-test-karta.png`), /skore/ chybová hláška bez API + výsledok cez `page.route` (JSON z analyzéra nad fixtúrou):
merač „Skóre 21 zo 100“, verdikt, 6 prečiarknutých príkladov. Screenshoty `work/screens/skore-{skore,hry,hry-skrtaci-test}-{desktop,mobile,mobile-rm}[-vysledok|-chyba].png`.

## JS (gz, tranzitívne, `node work/qa/jsgz.mjs dist-skore/client /skore/ /hry/ /hry/skrtaci-test/`)
- `/skore/` 144 kB spolu (mobil s Drawer 9,7) ≈ **134 kB desktop**; z toho SkoreForm 10,6 + NumberFlow ≈ 14 + Noise 0,7 + ikony; základ lite ≈ 75 + Wizard 3.
- `/hry/` 127 kB (full základ + Drawer + Wizard), bez vlastného ostrova.
- `/hry/skrtaci-test/` 175 kB spolu ≈ 165 kB desktop: Motion runtime 40 kB (`react.YD9xGxFM.js`) + AnimatePresence 2 + NumberFlow 14 + SkrtaciTest 6,7 + frazy 1,4. Nad rozpočtom podstránky (doc 10 ≤ 70 kB) — pozri Otvorené.

## Odchýlky
- `/hry/skrtaci-test/` má `islands="lite"` (kontrakt základu hovorí „hry = full“): stránka s formulárom, Lenis/kurzor nič nepridá a ušetrí ~50 kB. `/hry/` ostáva full.
- Ostrovy `client:idle` namiesto `client:visible`: pri `client:visible` na 375 px sa formulár hydratoval až po scrolle a hydratácia prepísala rozpísaný text (zistené v QA).
- Zdieľacia karta cez Canvas 2D (zadanie), nie satori (doc 10 §3 #16).
- „Prvý krok = rezervácia“ platí aj bez widgetu, ak je na stránke odkaz/text „rezervovať / dohodnúť termín“ (kotva 15/416 je o ponuke termínu, nie o nástroji); widget dáva body v zložke Nástroj.
- Do worker chunku sa nedá dostať `_worker.js` (Astro 7 + cloudflare 14 stavia `dist-skore/server/entry.mjs` + `chunks/`); overené existenciou `chunks/skore_*.mjs` a priamym volaním handlerov v node.
- `verdiktSkore` je odteraz 2-argumentová (skóre + detaily); volanie len so skóre ostáva platné, ale text potom nič netvrdí o webe.

## Otvorené
- `npm run dev`/wrangler neoverené (zakázané); `/api/skore` beží až na Cloudflare (Pages/Workers s `assets` + `main: entry.mjs`). Bez rate limitu — zvážiť Cloudflare rule (napr. 30/min na IP).
- Dôkaz a prvý krok sú heuristiky nad HTML bez JS (SPA weby = málo textu → „ziadny“/„bez dôkazu“); výsledok to hovorí v `dokazDovod` / `prvyKrokDovod`.
- Motion na Škrtacom teste = 42 kB; alternatíva `@formkit/auto-animate` (2 kB, je v package.json) + CSS by dala ≈ 120 kB. Adam rozhodne, či spec (Motion layout) alebo rozpočet.
- „Miliarda → bilión“ a „Strach-o-meter“ nemajú popis ani vlastné cesty (spec ich nemá, routes.ts tiež nie) — popis doplní Adam.
- `pridavneRegex()` v `frazy.ts` chytá aj príslovky (`osobne`, `rýchlo`); výnimka `osobne` je lokálne v ostrove.

## Žiadosti do zdieľaných súborov
- Doc 10 §4 (rozpočet podstránky ≤ 70 kB): základ lite sám má ≈ 83 kB gz (React 63,5 + sonner 9 + ClientRouter 5 + jsx 5) — navrhujem prepísať na „základ + N kB“
  (NOTES_zaklad). Podstránky tu: /skore/ 144 (mobil) / 134 (desktop), /hry/ 127 / 160, /hry/skrtaci-test/ 176 / 153.
- `src/styles/global.css`: eyebrow 13 px a pätička 12 px sú pod 14 px (zdieľané utility, len poznámka).
- Základ: CTA tlačidlo hot/paper 18 px extrabold = 3,17 : 1 (AA large text 3 : 1 prechádza, bežný text nie) — riešiť centrálne, nie tu.
- `src/data/frazy.ts`: zvážiť `PRAZDNE_PRIDAVNE_VYNIMKY = ['osobne']` (alebo nepoužiť kmeň `osobn` samostatne), aby vzorová veta Dňa 2 prechádzala testom aj pri iných použitiach regexu.
- `src/data/routes.ts`: nič — všetky moje cesty tam sú. `/api/skore` nie je stránka (bez OG).
- Nič v `package.json` — všetko potrebné (motion, @number-flow/react, canvas-confetti, sonner, phosphor) je nainštalované.
