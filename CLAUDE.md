# xvadur.com — verejný web XVADUR, konzultácie, brand

@AGENTS.md
@STATUS.md
@STACK.md

Príkazy (npm): dev `npm run dev` · build `npm run build` · check `npm run check` · test `npm test` · QA `python3 -m http.server 4190 -d dist/client` + `node work/qa/final.mjs`. **v6 (26. 9. 2026) = vetva `claude/determined-goldberg-xy19as`, nenasadená** (deploy len na slovo „deploy“). Report: `work/V6_2026-09-26.md`, poznámky `work/NOTES_v6.md`. Historický v4 report: `work/V4_NOC_2026-09-19.md`.
Kde čo je: `src/pages/` stránky (Astro; `api/skore.ts`, `api/odber.ts` = Worker routes) · `src/layouts/Base.astro` layout · `src/styles/{tokens,global}.css` tokeny a globál · `src/components/site/` hlavička (+ mobilný `<dialog>`), pätička, pásy, ostrovy · `src/components/home/` sekcie domova v6 (Hero, Uctenka, Ponuka, Dokazy, AkoPracujem, KtoSom, Nastroje, Odber — statické Astro) · `src/components/{makleri,kviz,konzultacia,texty,skore,hry}/` sekcie a ostrovy podstránok · `src/components/port/` prenesené sekcie (Wizard, KonzultaciaBand) · `src/components/vendor/` vendorované kity · `src/data/` nav, routes, **uctenky** (ledger čísel), **projekty** (dôkazy domova z účteniek), **ponuka**, fakty (KOTVY pre makléri/skóre), beaty, frazy, `makleri/`, `kviz/` · `src/content/texty/` články · `src/lib/` utils, og, build, skore-analyzer, odber · `public/brand/` X a wordmark · `public/makleri/` PDF plánu (`node scripts/export-makleri-pdf.mjs`) · `work/` front, `work/NOTES_*.md` kontrakty agentov, `work/LICENCIE.md`, `work/qa/` Playwright skripty, `work/screens/` screenshoty (gitignored) · `docs/` specs · `~/xvadur_brand/xvadur_web_v4/` pozičné dokumenty (zákon: `10_VYBER_KNIZNIC_A_KOMPONENTOV.md`).
Pravidlo v6: každé číslo na domove ide cez `uctenka('kluc')` zo `src/data/uctenky.ts` (neznámy kľúč = pád buildu, „NIKDE“/V OPRAVE = pád testu).
Front: `work/`. Deploy na Cloudflare `landing` = externá mutácia.
