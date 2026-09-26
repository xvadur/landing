# STATUS — xvadur.com

## Live
- `https://xvadur.com/` = vetva `main` na commite `36c2521` (**V5.4**, nasadené 27. 9. 2026, Worker verzia `d10cf82d-a3d0-4dd4-a460-cbb3235f67c6`). Overené: HTTP 200, v HTML je nový domov; `/api/terminy/`, `/konzultacia/`, `/makleri/`, `/skore/`, `/texty/`, `/pulse.json` vracajú 200.
- Domov V5.4 (XDR-271): rozloženie podľa cohesion.framer.ai v neobrutalizme so zdravotníckym žargónom. Pilulkové menu so sledovaním sekcie, Príjem (bežiaci XVADUR za fotkou, znak XVADUR ako vodoznak, plávajúce symboly, motto sa dešifruje každé 4 s), Vitálne funkcie naživo, Anamnéza ako vrstvené karty, Nástroje v pásoch, Liečba 01–03, Chorobopisy vodorovne (GSAP pin), Tézy, Vyšetrenie s rezerváciou, Zápis, Texty. Komponenty `src/components/v54/`.
- Hosting: Cloudflare Worker `xvadur-com` (statické assety + API). Deploy: `npm run build && npx wrangler deploy -c dist/server/wrangler.json`, iba na Adamovo slovo „deploy“.
- Rezervácia a zápis ukladajú do KV `SESSION` s prefixom `v5:`; e-maily cez Resend neodchádzajú, kým nie sú secrets `RESEND_API_KEY` + `RESEND_FROM`.

## Rozpracované
- **V5 · Predajný web** (Linear, míľnik „V5 · Predajný web“) postavený na vetve `v5` (26. 9. 2026), **nenasadený, nepushnutý**. Zadanie `work/V5_ZADANIE.md`, konkurencia `work/V5_KONKURENCIA.md`.
  - Domov: hero (XDR-205), kto som vodorovne (XDR-206), pred a po (XDR-207), izba dôkazov (XDR-208), ponuka (XDR-209), konzultácia s rezerváciou (XDR-210), zber e-mailov (XDR-211), texty/Hriech/hry (XDR-214). Všetko v Lineari „Na overenie“.
  - Nové API (Worker): `/api/terminy/`, `/api/rezervacia/`, `/api/zapis/`, `/api/udalost/`. Úložisko dočasne v existujúcom KV `SESSION` s prefixom `v5:` (kód berie `LEADS`, ak pribudne). Resend iba so secrets `RESEND_API_KEY` + `RESEND_FROM`.
  - Overené: `npm run check` 0 chýb, `npm test` 23/23, build OK, `node work/qa/v5.mjs` (1440/375/reduced bez pretečenia a chýb konzoly), `node work/qa/odkazy.mjs` (6/6 externých odkazov 200), `node work/qa/formulare.mjs` proti lokálnemu `wrangler dev` (rezervácia, čakačka, duplicita, obsadený slot 409, UTM v zázname). JS domova 159 kB gz.
  - Nahraná verzia Workera `ace55d4e-ba78-4f8f-835c-709c53e6596f` (tag `v5-0e1967f`) s 0 % trafficu; produkcia ostáva na `9f8e5fef…` (100 %), xvadur.com stále `8cd283f`. Náhľadová URL nie je: Worker nemá zapnuté workers.dev / preview URLs (zapnutie mení nastavenie produkčného Workera).
  - V5.2 „spis/odtajňovanie“ (XDR-266) Adam zamietol a je zrušená; komponenty odstránené.
  - **V5.3 zdravotnícka línia (XDR-267, 26. 9. večer):** návrat k hero V5 s opravami (XVADUR podčiarknutý EKG čiarou, motto trvalo čitateľné a dešifruje sa každé 4 s, zástupná ilustrácia zdravotníka s fonendoskopom, monitor vitálnych funkcií s EKG a číslami z `public/pulse.json`). Celý domov v slovníku vyšetrenie / diagnóza / liečba / pacienti, bez pastelov: Kto som = cesta nemocnica → vyhodili → AI → agenti → XVADUR; Pacienti = chorobopisy Jakub a Lucia, diagnóza médií (Hriech), vlastné vitálne funkcie (Korpus 572 469 slov). Lokálny statický náhľad: `python3 -m http.server 4191 -d dist/client` (rezervácia termínu tam nebeží, potrebuje Worker → `wrangler dev` na 8787). Pulz: `node scripts/pulse-snapshot.mjs`.
  - Lokálny náhľad celého Workera: `npm run build && npx wrangler dev -c dist/server/wrangler.json --port 8787 --persist-to .wrangler/qa-state`.

## Otvorené v infraštruktúre
- `www.xvadur.com` sa nerozlíši (ENOTFOUND). Cloudflare stále eviduje zone routes `xvadur.com/*` a `www.xvadur.com/*` a `wrangler.jsonc` ich obsahuje. Pred ďalším deployom treba zosúladiť domény (úloha XDR-212).
- `staging.xvadur.com` vracia 403 („CNAME Cross-User Banned“). Samostatný staging dnes neexistuje. Náhľad bez vplyvu na produkciu: `npx wrangler versions upload -c dist/server/wrangler.json` (nová verzia Workera s 0 % trafficu; náhľadová URL funguje až po zapnutí preview URLs pre Worker).
- Pages projekty `landing` a `landing-con` v účte už nie sú.
- Záloha histórie vetiev z 22. 9.: `.git/branch-backups/2026-09-22/before-cleanup.bundle`, postup v `work/NOTES_poradie_vetiev_2026-09-22.md`.

## Čaká na Adama
- V5: zapnúť preview URLs pre Worker `xvadur-com` (alebo pozrieť lokálne), pravidlá termínov v `src/data/terminy.ts` (Po–Pi 14:00–19:00), Resend secrets a odosielateľ, vlastné KV/D1 pre leady namiesto `SESSION`, ID pixelov (Meta/TikTok), súhlas Jakuba a Lucie s menom na webe (V5.3 ich uvádza krstným menom; jakubolsa.sk bez odkazu), či ukázať demo picung.xvadur.com, obsah lákadla „Prvý agent za večer“, texty produktov v `src/data/ponuka.ts`.
- XDR-200: fakty o sebe (dĺžka praxe, rola, „vyhodili“ / „odišiel“, začiatok s AI). Do rozhodnutia ostáva na webe dnešné znenie, rozpory sú označené v `src/data/fakty.ts`.
- XDR-199: fotka pre hero a „Kto som“: Adam od ramien hore v zdravotníckej uniforme s fonendoskopom (zatiaľ zástupná ilustrácia).
- Stripe Payment Link 9 € pre `/makleri/` (`src/data/makleri/config.ts` → `STRIPE_URL`), Cloudflare Web Analytics token, IG/TikTok do pätičky.
- senior.xvadur.com a gramata.xvadur.com neodpovedajú (26. 9.), na webe sú bez odkazu.

## Ďalší krok
- Dostavať V5 podľa Linearu, náhľad cez `wrangler versions upload`, Adam skontroluje, potom XDR-212 (domény a deploy).
- XVD-001: publikovať prvý Substack článok (text je na webe v `/texty/`).

## Rozhodnutia
- 2026-09-27 — **V5.4:** neobrutalizmus a zdravotnícky žargón ostávajú, mení sa rozloženie a podanie podľa cohesion.framer.ai (pohyb do strán ako aiaktivista). Smer V6 (redakčná vizitka bez neobrutalizmu) Adam zamietol. Znak XVADUR ako vodoznak cez celé hero. Nasadené na main. [A]
- 2026-09-26 — **ZAMKNUTÉ: V5.3 zdravotnícka línia** je smer webu. Zdravotnícky žargón spája všetko (vyšetrenie, diagnóza, triáž, liečba, pacienti, vitálne funkcie); hero V5 s XVADUR podčiarknutým EKG čiarou, motto trvalo čitateľné a dešifruje sa každé 4 s, fotka = sticker od ramien hore v uniforme s fonendoskopom, pás čísel = monitor vitálnych funkcií; Kto som = normálna cesta nemocnica → vyhodili → AI → agenti → XVADUR; neobrutalizmus bez pastelov, tón cool. Zamietnuté: V5.2 spis/odtajňovanie („nie som policajt, som zdravotník“), „7 zastávok od sedemnástich“, vety, ktoré znižujú (maturita, Biblia), slovo „hlas“. [A]
- 2026-09-26 — V5 = predajný web pripravený na platenú reklamu (mobil prvý): hero s obrím XVADUR a fotkou ako nálepkou, kto som, pred a po, izba dôkazov, služba a produkty, konzultácia s rezerváciou, zber e-mailov. Makléri, kvíz a skóre ostávajú na svojich URL, z domova a menu ustúpia. [A]
- 2026-09-25 — xvadur.com je hlavný web a obchod: predajný aj cool, zameraný na AI agentov a konzultácie; showcase, lákadlo za e-mail, newsletter, reklamy. Rebríček produktov sa rieši neskôr. [A]
- 2026-09-19 — v4: Astro 7, Tailwind 4, OKLCH + Bricolage, neobrutalizmus a maximalizmus, motto „DIVIDED, WE ARE USELESS.“, 7 beatov príbehu verejných, bez maskota, X ako sprievodný znak a kurzor. Text na horúcej farbe je vždy ink. [A]
- 2026-09-12 — nekódovať 3D ručne; hotový stack (React + GSAP). Pozicioning „digitálna zdravotná starostlivosť“. [A]

## Inbox
- Rozpočet JS: podstránky s React ostrovmi majú 94–160 kB gz (pravidlo ≤ 70 kB neplatí) — prepísať na „základ + N kB“ alebo škrtať.
- Bricolage TTF pre OG karty (fontsource má len woff2, OG titulok je v Space Grotesk).
- Rate limit na `/api/skore` a nové API routes (WAF, napr. 30 req/min/IP) po nasadení.
- Kvíz `/kviz/` ostáva na URL; či ostane dlhodobo, rozhodne Adam.
