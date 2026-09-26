# xvadur.com — verejný web XVADUR, konzultácie, brand

@AGENTS.md
@STATUS.md
@STACK.md

Príkazy (npm): dev `npm run dev` · build `npm run build` · check `npm run check` · test `npm test` · QA `python3 -m http.server 4190 -d dist/client` + `node work/qa/final.mjs`. Live = `main`. V5 sa stavia na vetve `v5` (nepushovať ani nenasadzovať bez slova „deploy“). Náhľad: `npx wrangler versions upload -c dist/server/wrangler.json`.
Kde čo je: `src/pages/` stránky (Astro; `api/skore.ts` = Worker route) · `src/layouts/Base.astro` layout · `src/styles/{tokens,global}.css` tokeny a globál · `src/components/site/` hlavička (+ mobilný `<dialog>`), pätička, pásy, ostrovy · `src/components/{hero,home,makleri,kviz,konzultacia,texty,skore,hry}/` sekcie a ostrovy stránok · `src/components/port/` prenesené sekcie (Wizard, KonzultaciaBand, Metoda) · `src/components/vendor/` vendorované kity · `src/data/` nav, routes, fakty, beaty, frazy, `makleri/`, `kviz/` · `src/content/texty/` články · `src/lib/` utils, og, skore-analyzer · `public/brand/` X a wordmark · `public/makleri/` PDF plánu (`node scripts/export-makleri-pdf.mjs`) · `work/` front, `work/NOTES_*.md` kontrakty agentov, `work/LICENCIE.md`, `work/qa/` Playwright skripty, `work/screens/` screenshoty (gitignored) · `docs/` specs · zákon dizajnu v `STACK.md`, zadanie V5 `work/V5_ZADANIE.md`.
Front: `work/`. Deploy na Cloudflare Worker `xvadur-com` = externá mutácia.
