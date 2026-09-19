# STATUS — xvadur.com

## Rozpracované
- **v4 postavené 19. 9. 2026 v noci na vetve `v4`, NENASADENÉ.** Jeden commit s celou stavbou (domov, /makleri/ + /makleri/plan/ + PDF, /kviz/, /konzultacia/, /texty/ + článok, /skore/ + /api/skore, /hry/ + /hry/skrtaci-test/, /lab/, 404, OG karty). `npm run check` 0 chýb · `npm run build` zelený · `npm test` 20/20 · Playwright QA (`work/qa/final.mjs`) 25 meraní bez nálezu (1440×900, 375×812, domov aj reduced motion). Ranný report: `work/V4_NOC_2026-09-19.md`.
- Placeholder / čaká na Adama: Stripe Payment Link 9 € (`src/data/makleri/config.ts` → `STRIPE_URL`), IG/TikTok v pätičke (zatiaľ len Substack + GitHub), Substack URL článku (`src/content/texty/*.md` → `substack:`), hry 2 a 3 „V STAVBE“, Cloudflare Web Analytics token, senior.xvadur.com / gramata.xvadur.com bez odkazu (DNS 19. 9. neresolvuje).

## Ako sa na to pozrieť teraz
```bash
cd ~/xvadur.com
npm run build && npx astro preview            # alebo:
python3 -m http.server 4190 -d dist/client     # → http://127.0.0.1:4190/
node work/qa/final.mjs                         # celá QA + screenshoty work/screens/final-*.png (server na 4190 musí bežať)
```
`/api/skore` (skóre webu) beží až na Cloudflare (Worker); v statickom náhľade formulár ukáže „Analyzér práve neodpovedá“. Handler sa dá overiť bez servera: `node work/qa/api.mjs`.

## Deploy (až na slovo „deploy“)
1. `git push origin v4` → staging (Preview build na Cloudflare).
2. Cloudflare projekt `landing`: build command `npm run build`, **node 22+** (lokálne beží node 26), výstup podľa cieľa:
   - **Workers + statické assety (odporúčané, aby bežal /api/skore):** adaptér `@astrojs/cloudflare` 14 generuje `dist/server/wrangler.json` (`main: entry.mjs`, `assets.directory: ../client`) → `npx wrangler deploy -c dist/server/wrangler.json`. Pages ako produkt pre tento adaptér nepodporuje Worker (v14 už len `_headers`/`_redirects`).
   - **Len statika (bez /api/skore):** Pages, output directory `dist/client`.
3. Kontrola stagingu (desktop + 375 px, OG karty, `/makleri/plan/` noindex, `_headers`) → merge `v4` → `main`.
4. Po nasadení: Cloudflare WAF rate limit na `/api/skore` (napr. 30 req/min/IP), Web Analytics snippet, doplniť `url` pre senior/gramata do `src/data/fakty.ts`, keď domény bežia.

## Živé
- `xvadur.com` **live = v4** od 19. 9. 2026: Cloudflare Worker `xvadur-com` (assety + `/api/skore`), zone routes `xvadur.com/*` a `www.xvadur.com/*`; domény odpojené od Pages projektu `landing` (staging.xvadur.com tam ostal). Deploy: `npm run build && npx wrangler deploy -c dist/server/wrangler.json`.
- Konzultačný pack: `~/xvadur_brand/01_current_personal_brand/pack-2026-09-11/04_KONZULTACIE_A_PONUKA.md` (30 min, 6 otázok); uskutočnené 0 (rozhodnutie: Jakub prvý).
- Substack: profil `substack.com/@xvadur`; článok „Čo zostane, keď zavriem chat“ je na webe v `/texty/`; na Substacku publikované 0.

## Rozhodnutia
- 2026-09-19 (noc, integrácia) — text na horúcej (`--color-hot`) je vždy **ink** (5,4 : 1), nie paper (3,2 : 1): tokens.css + button.tsx + všetky CTA; `eyebrow` a `x-divider` 14 px; pätička 14 px; `--header-h` token; mobilná navigácia = natívny `<dialog>` v Header.astro (0 kB React; vaul Drawer zmazaný) → články 5,9 kB gz, /makleri/ 11,6 kB; `public/_headers` noindex pre `/makleri/plan/`, PDF a `/lab/`; `work/screens/` v .gitignore [P, čaká na ratifikáciu]
- 2026-09-19 — slovo „web“: stavba v4 na vetve `v4` (Astro 7, Tailwind 4, OKLCH + Bricolage, maximalizmus, hero „DIVIDED, WE ARE USELESS.“ bez SK riadku, 7 beatov verejných, Stripe placeholder, hry 2 a 3 „V STAVBE“, konzultácia bezplatná cez WhatsApp/mailto, bez maskota, X = sprievodný element + kurzor) [A]
- 2026-09-18/19 — neobrutalizmus + nové tokeny (OKLCH pastely + horúca #ED4E26, Bricolage Grotesque); slivka/kyselina/Bebas/Source Serif von; lab scéna = svet a obraz, nie UI [A]
- 2026-08-27 — identita „Adam ako AI konzultant“ prijatá, v ten deň v novom webe [A]
- 2026-09-11 — Linear XDR-193: smer „lab/workstation“ — Adam ako operátor, chladná pracovná plocha, tmavá uniforma, kov, oranžový akcent; nahrádza fialovo-limetkový/pixelový smer [A]
- 2026-09-11 — „Kartotéka živých projektov“ (33/33 testov) odmietnutá — neodráža autora [A]
- 2026-09-12 — nekódovať 3D/animácie ručne; hľadať hotový stack (favorit React + Spline + GSAP; alternatíva Webflow + Spline) [A]
- 2026-09-12 — pozicioning „digitálna zdravotná starostlivosť“ / „digitálny úraz“ [A]

## Ďalší krok
- Nasadené 19. 9. Otvorené: BOSEN/Chovanec/Olša na `/makleri/` (Jakub má vidieť landing), Stripe link, CTA label 9 €, titulky beatov 3 a 6, rozpočet JS „základ + N kB“, DNS: zmazať staré CNAME na `landing-con.pages.dev` pre xvadur.com a www a prepnúť na custom domain Workera; Pages projekt `landing` buď vypnúť auto-build z `main`, alebo zmazať.
- XVD-001 Publikovať prvý Substack článok (text je hotový a už na webe v `/texty/`).

## Blokované
- nič

## Posledný receipt
- 2026-09-19 noc: integrácia v4 (commit na `v4`, report `work/V4_NOC_2026-09-19.md`, kópia `~/xvadur_brand/xvadur_web_v4/12_V4_NOC_2026-09-19.md`)

## Inbox
- v4 otvorené: Bricolage TTF pre OG karty (fontsource má len woff2 → OG titulok v Space Grotesk); rozpočet JS doc 10 (podstránky ≤ 70 kB) vs. skutočnosť: základ lite s React runtime ≈ 75 kB, stránky s ostrovmi 94–160 kB — treba prepísať na „základ + N kB“ alebo škrtať Motion/NumberFlow; Stripe Payment Link 9 €; Cloudflare Web Analytics snippet; rate limit /api/skore
- Kvíz AlgorMetanoiaIgnis nie je na disku (zmizol 8. 9.); v4 má nový adaptívny kvíz `/kviz/` (7/10 otázok) — rozhodnúť, či ostáva
- xvadur.com v1: ostáva v repe `landing`, alebo nový repo — nerozhodnuté
- Substack: nová publikácia XVADUR vs. premenovať `sestramd` — nerozhodnuté
