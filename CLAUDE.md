# xvadur.com — verejný web XVADUR, konzultácie, brand

@AGENTS.md
@STATUS.md
@STACK.md

Príkazy (npm): dev `npm run dev` · build `npm run build` · check `npm run check` · test `npm test` · QA `python3 -m http.server 4190 -d dist/client` + `node work/qa/final.mjs`. Vetva v4 = `v4`, postavená 19. 9. 2026, nenasadená (nepushovať bez slova „deploy“). Ranný report: `work/V4_NOC_2026-09-19.md`.
Kde čo je: `src/pages/` stránky (Astro; `api/skore.ts` = Worker route) · `src/layouts/Base.astro` layout · `src/styles/{tokens,global}.css` tokeny a globál · `src/components/site/` hlavička (+ mobilný `<dialog>`), pätička, pásy, ostrovy · `src/components/{hero,home,makleri,kviz,konzultacia,texty,skore,hry}/` sekcie a ostrovy stránok · `src/components/port/` prenesené sekcie (Wizard, KonzultaciaBand, Metoda) · `src/components/vendor/` vendorované kity · `src/data/` nav, routes, fakty, beaty, frazy, `makleri/`, `kviz/` · `src/content/texty/` články · `src/lib/` utils, og, skore-analyzer · `public/brand/` X a wordmark · `public/makleri/` PDF plánu (`node scripts/export-makleri-pdf.mjs`) · `work/` front, `work/NOTES_*.md` kontrakty agentov, `work/LICENCIE.md`, `work/qa/` Playwright skripty, `work/screens/` screenshoty (gitignored) · `docs/` specs · `~/xvadur_brand/xvadur_web_v4/` pozičné dokumenty (zákon: `10_VYBER_KNIZNIC_A_KOMPONENTOV.md`).
Front: `work/`. Deploy na Cloudflare `landing` = externá mutácia.
