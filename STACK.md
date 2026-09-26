# STACK — xvadur.com
prefix: XVD

## Zámok (v4 → v5, od 19. 9. 2026)
Framework: **Astro 7.3** (`output: 'static'`, server routes cez `export const prerender = false` — `/api/skore`) + **@astrojs/react 6** (React 19 ostrovy) + **@astrojs/cloudflare 14** (`imageService: 'compile'`, `prerenderEnvironment: 'node'`; výstup `dist/client` assety + `dist/server` Worker) · Štýly: **Tailwind 4.3** cez `@tailwindcss/vite`, tokeny v `src/styles/tokens.css` (`@theme`, OKLCH), globál `src/styles/global.css` · Písmo: Bricolage Grotesque variable (display), Space Grotesk 500/700 (UI a telo), Geist Mono variable (dáta), Instrument Serif italic (akcent) — fontsource, self-host, latin + latin-ext · Pohyb: Motion (stavy), GSAP + ScrollTrigger + SplitText (hero, pinnuté scény), Lenis (scroll), CSS `animation-timeline: view()` · UI: radix-ui, sonner, cmdk, NumberFlow, auto-animate, Embla, Phosphor (vaul je nainštalované, ale mobilná navigácia je od 19. 9. natívny `<dialog>` v Header.astro) · Vendorované: neobrutalism.dev (shadcn CLI, `components.json`), React Bits, Fancy, Magic UI, Motion Primitives → `src/components/vendor/` · Shadery: @paper-design/shaders-react · Rive: @rive-app/react-canvas-lite (v1 bez maskota) · OG: satori + @resvg/resvg-js (`src/lib/og.tsx`, `src/pages/og/[slug].png.ts`) · Obsah: `src/content/texty/*.md` (kolekcia, `src/content.config.ts`) · Hosting: Cloudflare Worker `xvadur-com` · Brand: `public/brand/{x,xvadur-ink,xvadur-paper}.svg` · `public/_headers` (noindex plán/PDF/lab) · Licencie: `work/LICENCIE.md`.
Dizajnový smer: neobrutalizmus, hlasný maximalizmus, efektový pohyb, OKLCH + Bricolage, typografické hero „DIVIDED, WE ARE USELESS.“. Labák = svet a obraz, 3D v2.

## Zákon dizajnu (platí v repe, nahrádza pôvodný dokument mimo repa)
1. **Farby iba z tokenov** (`src/styles/tokens.css`): ink, paper, white, pastely yellow/pink/lilac/lime/sky (+ `-deep`, `-hover`, `-press`), jediná horúca `hot` iba na CTA a X. Žiadny hex v komponentoch. Text na `hot` je vždy `ink`.
2. **Rám a tieň:** `border-3 border-ink`, `rounded-lg`, tvrdý tieň bez blur (`shadow-brutal*`, 6/6 desktop, 4/4 mobil). Utility `brutal`, `lift`, `press`, `sticker`, `x-stamp`, `x-divider`, `eyebrow`, textúry `tx-dots`, `tx-halftone`, `tx-grain` (`src/styles/global.css`).
3. **Písmo:** Bricolage Grotesque (display, 800, uppercase, tesný tracking), Space Grotesk (telo), Geist Mono (čísla, eyebrow), Instrument Serif italic (akcent). Display škála `text-display-xs … text-display-xl`.
4. **Pohyb:** Motion na stavy, GSAP + ScrollTrigger na hero a pinnuté scény (nikdy oba na jednom prvku), CSS `animation-timeline: view()/scroll()` na reveal a parallax, Lenis na scroll. `prefers-reduced-motion` = statické, 120 ms fade.
5. **Vendorované kity** (`src/components/vendor/`): neobrutalism.dev, React Bits (MIT + Commons Clause, len ako súčasť webu), Fancy, Magic UI, Motion Primitives. Každý dostane retheme cez tokeny. Katalóg `work/NOTES_vendor_*.md`, licencie `work/LICENCIE.md`.
6. **Symboly:** X (znak), šípka, hviezdička, pečiatka OVERENÉ, nálepky. X je sprievodný prvok a kurzor (desktop).
7. **Mobil prvý:** 375 px bez horizontálneho scrollu, 16 px okraje, ciele ≥ 44 px; ťažké efekty (kurzor, ImageTrail, shadery) iba ≥ 1024 px s myšou.
8. **Obsah:** slovenčina s diakritikou, tykanie, žiadne lorem, čísla iba zo `src/data/fakty.ts`, externé odkazy iba s overeným 200.
9. **Rozpočet JS:** domov ≤ 180 kB gz; podstránky `islands="lite"`, články `"none"`.

## Príkazy (npm, node 26; pnpm sa nepoužíva)
dev: `npm run dev` (astro dev)
build: `npm run build` (astro build → `dist/client/`)
preview: `npm run preview`
check: `npm run check` (astro check)
test: `npm test` (node --test tests/)
náhľad: `python3 -m http.server 4190 -d dist/client` → http://127.0.0.1:4190/ (agent build: `npx astro build --outDir dist-<meno>`)
QA: `node work/qa/final.mjs` (celý web: 1440/375/reduced, konzola, overflow, interné odkazy, gz JS, screenshoty `work/screens/final-*`), `node work/qa/nav.mjs` (mobilná navigácia), `node work/qa/api.mjs` (/api/skore handler z dist/server), `node work/qa/shot.mjs` / `interact.mjs` (základ), per-stránka `work/qa/{domov,kviz,konzultacia,skore}.mjs`
deploy: Cloudflare (externá mutácia — len na Adamovo slovo „deploy“; najprv staging). Adaptér 14 = Workers + assety: `npx wrangler deploy -c dist/server/wrangler.json`; Pages len statika z `dist/client` (bez /api/skore). Postup v STATUS.md.
proof: `npm run check` + `npm run build` + `npm test` + `node work/qa/final.mjs`; destination-verified = `curl -sI https://xvadur.com` + vizuálna kontrola screenshotom

## Hranice
Žiadny ďalší redizajn od nuly. Zmeny idú po sekciách nad zamknutým smerom. `brand/` je netracked. Farby len z tokenov (žiadny hex v komponentoch); text na `hot` je vždy `ink`. Zdieľané súbory (config, layout, styles, site, vendor, data) menia len poverení agenti — ostatní píšu do `work/NOTES_<meno>.md`. Čísla na webe len zo `src/data/fakty.ts` alebo packov; externé odkazy len s overeným 200.
