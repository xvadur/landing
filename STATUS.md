# STATUS — xvadur.com

## Live
- `https://xvadur.com/` = vetva `main` na commite `8cd283f` (v4 s hero mastheadom). Overené 26. 9. 2026: HTTP 200, v HTML je build `8cd283f`.
- Hosting: Cloudflare Worker `xvadur-com` (statické assety + `/api/skore`). Custom domain `xvadur.com` je aktívna (prostredie production). Deploy: `npm run build && npx wrangler deploy -c dist/server/wrangler.json`, iba na Adamovo slovo „deploy“.
- Stránky: domov, `/makleri/` (+ `/makleri/plan/` a PDF), `/kviz/`, `/skore/` (+ `/api/skore`), `/konzultacia/`, `/texty/` (1 článok), `/hry/` (+ `/hry/skrtaci-test/`), `/lab/`, 404, OG karty.

## Rozpracované
- **V5 · Predajný web** (Linear, míľnik „V5 · Predajný web“) na vetve `v5` z `main`. Zadanie `work/V5_ZADANIE.md`, konkurencia `work/V5_KONKURENCIA.md`. Nenasadené.

## Otvorené v infraštruktúre
- `www.xvadur.com` sa nerozlíši (ENOTFOUND). Cloudflare stále eviduje zone routes `xvadur.com/*` a `www.xvadur.com/*` a `wrangler.jsonc` ich obsahuje. Pred ďalším deployom treba zosúladiť domény (úloha XDR-212).
- `staging.xvadur.com` vracia 403 („CNAME Cross-User Banned“). Samostatný staging dnes neexistuje. Náhľad bez vplyvu na produkciu: `npx wrangler versions upload -c dist/server/wrangler.json` (nová verzia Workera s 0 % trafficu a vlastnou náhľadovou URL).
- Pages projekty `landing` a `landing-con` v účte už nie sú.
- Záloha histórie vetiev z 22. 9.: `.git/branch-backups/2026-09-22/before-cleanup.bundle`, postup v `work/NOTES_poradie_vetiev_2026-09-22.md`.

## Čaká na Adama
- XDR-200: fakty o sebe (dĺžka praxe, rola, „vyhodili“ / „odišiel“, začiatok s AI). Do rozhodnutia ostáva na webe dnešné znenie, rozpory sú označené v `src/data/fakty.ts`.
- XDR-199: fotka pre hero a „Kto som“ (zatiaľ zástupná).
- Stripe Payment Link 9 € pre `/makleri/` (`src/data/makleri/config.ts` → `STRIPE_URL`), Cloudflare Web Analytics token, IG/TikTok do pätičky.
- senior.xvadur.com a gramata.xvadur.com neodpovedajú (26. 9.), na webe sú bez odkazu.

## Ďalší krok
- Dostavať V5 podľa Linearu, náhľad cez `wrangler versions upload`, Adam skontroluje, potom XDR-212 (domény a deploy).
- XVD-001: publikovať prvý Substack článok (text je na webe v `/texty/`).

## Rozhodnutia
- 2026-09-26 — V5 = predajný web pripravený na platenú reklamu (mobil prvý): hero s obrím XVADUR a fotkou ako nálepkou, kto som, pred a po, izba dôkazov, služba a produkty, konzultácia s rezerváciou, zber e-mailov. Makléri, kvíz a skóre ostávajú na svojich URL, z domova a menu ustúpia. [A]
- 2026-09-25 — xvadur.com je hlavný web a obchod: predajný aj cool, zameraný na AI agentov a konzultácie; showcase, lákadlo za e-mail, newsletter, reklamy. Rebríček produktov sa rieši neskôr. [A]
- 2026-09-19 — v4: Astro 7, Tailwind 4, OKLCH + Bricolage, neobrutalizmus a maximalizmus, motto „DIVIDED, WE ARE USELESS.“, 7 beatov príbehu verejných, bez maskota, X ako sprievodný znak a kurzor. Text na horúcej farbe je vždy ink. [A]
- 2026-09-12 — nekódovať 3D ručne; hotový stack (React + GSAP). Pozicioning „digitálna zdravotná starostlivosť“. [A]

## Inbox
- Rozpočet JS: podstránky s React ostrovmi majú 94–160 kB gz (pravidlo ≤ 70 kB neplatí) — prepísať na „základ + N kB“ alebo škrtať.
- Bricolage TTF pre OG karty (fontsource má len woff2, OG titulok je v Space Grotesk).
- Rate limit na `/api/skore` a nové API routes (WAF, napr. 30 req/min/IP) po nasadení.
- Kvíz `/kviz/` ostáva na URL; či ostane dlhodobo, rozhodne Adam.
