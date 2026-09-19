Front projektu. Jeden súbor = jedno issue. Stavy: draft → ready → running → review → blocked → done (presun do done/). Receipt píše /handoff. Odvodené sekcie STATUS.md regeneruje `node ~/xvadur_system/bin/xv status`.

## v4 (19. 9. 2026, vetva `v4`)
- `NOTES_zaklad.md` = kontrakt základu (cesty, tokeny, utility, Base, dáta, ostrovy) — čítať prvé. `NOTES_<stránka>.md` (domov, makleri, kviz, konzultacia, skore, lab) = čo agent postavil, odchýlky, otvorené. `NOTES_vendor_*.md` = katalóg vendorovaných kitov. `LICENCIE.md` = licencie (jediný limit: React Bits MIT + Commons Clause).
- `V4_NOC_2026-09-19.md` = ranný report z nočnej stavby (zhrnutie, cesty, nálezy, odchýlky, čo môže len Adam, ďalšie kroky).
- `qa/final.mjs` = integračná QA celého webu (server `python3 -m http.server 4190 -d dist/client`), výstup `qa/final-report.json` + `screens/final-*.png`. `qa/nav.mjs` mobilná navigácia, `qa/api.mjs` /api/skore, per-stránka `qa/{domov,kviz,konzultacia,skore,lab}.mjs`, `qa/jsgz.mjs` statická uzávera JS.
- `screens/` je v .gitignore (PNG artefakty, generujú sa znova).
