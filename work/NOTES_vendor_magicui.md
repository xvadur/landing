# NOTES — vendor Magic UI (19. 9. 2026)

Zdroj: registry `https://magicui.design/r/<name>.json` (všetky 200), licencia MIT. Súbory: `src/components/vendor/magicui/`,
showcase + kompilačný test: `src/components/lab/magicuiLab.tsx` (default export `MagicuiLab`).
Typová kontrola: `npx tsc --noEmit -p tsconfig.json --ignoreDeprecations 6.0` → v mojich súboroch len 2× TS2307 „Cannot find module
'canvas-confetti'“ (chýbajúca závislosť, nižšie). S dočasným shimom @types/canvas-confetti 1.9.0 = 0 chýb. SSR (react-dom/server
renderToString) všetkých komponentov okrem Confetti prešlo (hoistované `<style href precedence>` sa vypíšu raz).

## Chýbajúce závislosti (Lab agent nainštaluje)
- `canvas-confetti` (runtime, MIT) — `npm i canvas-confetti`
- `@types/canvas-confetti` (dev) — `npm i -D @types/canvas-confetti`
Bez nich: `confetti.tsx` a `magicuiLab.tsx` sa nezbuildia; ostatných 6 súborov je nezávislých.

## Tabuľka
| Komponent | Import | Props | Poznámky / retheme |
|---|---|---|---|
| `Marquee` | `@/components/vendor/magicui/marquee` | `reverse`, `pauseOnHover` (default **true**), `vertical`, `repeat` (párne, default 4), `duration` (s, default 40), `gap` (CSS, default 2rem), `bordered` (border-y-3 ink), `className` (sem bg-* token + font), `...div` | Vodorovne jazdí cez globálne `.marquee`/`.marquee-track` (global.css: −50 %, hover pauza, reduced motion stojí). Vertikál + `pauseOnHover=false` cez hoistovaný `<style href="magicui-marquee">`. Kópie 2..n majú `aria-hidden`. Pre čisto statický obsah radšej `site/Marquee.astro` (0 JS); tento je na React deti (NumberTicker, ikony). |
| `Terminal`, `TypingAnimation`, `AnimatedSpan` | `@/components/vendor/magicui/terminal` | Terminal: `sequence` (default true), `startOnView` (true), `title`, `variant` `'ink'|'white'`, `className` (`max-w-none` na plnú šírku). TypingAnimation: `children: string`, `duration` (ms/znak, 60), `delay`, `as`, `startOnView`. AnimatedSpan: `delay`, `startOnView`, `className` | Rám `border-3 border-ink rounded-lg shadow-brutal`, bg-ink/text-paper (alebo bg-white/text-ink), font-mono, bodky hot/yellow/lime-deep. Reduced motion (`useReducedMotion`): text naraz, riadky len fade 120 ms. Motion/react (engine na stavy). SSR vypíše TypingAnimation prázdny → text je až s JS; pre no-JS dôležitý text dať mimo terminál. Farby riadkov: `text-lime`, `text-yellow`, `text-hot`. |
| `Confetti`, `ConfettiButton`, `fireConfetti`, `useConfetti`, `brandConfettiOptions`, `brandConfettiColors`, `CONFETTI_BUTTON_CLASS` | `@/components/vendor/magicui/confetti` | Confetti: `options`, `globalOptions`, `manualstart`, ref `ConfettiRef.fire(opts)`, `...canvas`. ConfettiButton: `options`, `...button` (brand tlačidlo hot). `fireConfetti(opts)` bez komponentu (Škrtací test pri 0 frázach). | `@/components/ui/button` (shadcn) nahradené natívnym `<button>` v brand vzore. Farby z tokenov za behu (`getComputedStyle(:root)` → `--color-yellow/pink/lilac/lime/sky/hot`; canvas-confetti berie len hex, OKLCH ink sa vynechá). Tvary `square`, `disableForReducedMotion: true` + vlastný matchMedia guard (pri reduced motion nič). Ostrov: `client:only="react"` alebo `client:visible` (canvas až v useEffect, import je SSR-safe). |
| `ScrollProgress` | `@/components/vendor/magicui/scroll-progress` | `color` `'hot'|'yellow'|'pink'|'lilac'|'lime'|'sky'|'ink'` (default hot), `className`, `ref` | Gradient s hexmi preč → `bg-hot` + `border-b-3 border-ink`, výška 8 px (fixed top z-50, `role=progressbar`). Scroll-linked (`useScroll`), nie časová animácia → pri reduced motion ostáva (je to stav). Články (doc 10 §3 #19): `client:idle`; pozor, články majú islands="none" → ostrov treba povoliť alebo dať CSS `animation-timeline: scroll()` variant (0 JS) — rozhodne agent článkov. |
| `Dock`, `DockIcon` | `@/components/vendor/magicui/dock` | Dock: `iconSize` (44), `iconMagnification` (64), `iconDistance` (140), `disableMagnification`, `direction`, `bg` token (default white), `className`. DockIcon: `href` (→ `<a>`), `label` (aria-label+title, povinný pri ikone), `external` (target/rel), `color` token (default yellow), `className`, `...motion` | Kontajner `border-3 border-ink rounded-lg shadow-brutal p-2`, backdrop-blur preč. Ikony štvorce s rámom 3 px, `shadow-brutal-sm`, hover `<farba>-hover`, focus-visible outline hot. Reduced motion = bez zväčšenia. Na dotyku nie je mousemove → statické 44 px (≥ 44 px cieľ). `mt-8` z originálu preč (rieši rodič). |
| `NumberTicker`, `formatTicker` | `@/components/vendor/magicui/number-ticker` | `value`, `startValue`, `direction`, `delay` (s), `decimalPlaces`, `locale` (default `sk-SK`), `prefix`, `suffix`, `className` | Záloha k NumberFlow (doc 10 §3 #14). Formát sk-SK (2 034 s NBSP). `text-black/dark:text-white` preč (dedí farbu). Reduced motion: `springValue.jump` na cieľ. SSR vypíše `startValue` (ako originál). |
| `ShineBorder` | `@/components/vendor/magicui/shine-border` | `borderWidth` (3), `duration` (s, 14), `shineColor` (string|string[], default `['var(--color-hot)','var(--color-yellow)']`), `className` | Voliteľný (doc 10 „optional“). Rodič `relative` + `rounded-lg`. Keyframes `animate-shine` nie sú v tokens.css → hoistovaný `<style href="magicui-shine">` s `@media (prefers-reduced-motion: no-preference)` (pri reduced motion statický rám). Maska `currentColor` namiesto `#fff`. |
| barrel | `@/components/vendor/magicui` (`index.ts`) | všetko vyššie | Pohodlie; do ostrovov radšej importovať po súboroch, aby sa canvas-confetti neťahal tam, kde netreba. |

## Čo som nahradil / vyhodil
- `"use client"` odstránené vo všetkých súboroch (Astro ostrovy ho nepotrebujú; Rollup by varoval) — komentár v hlavičke každého súboru.
- Žiadne next/* importy v týchto komponentoch neboli.
- Ručné hexy: scroll-progress gradient (`#A97CF8/#F38CB8/#FDCC92`), shine-border `#000000` default a `#fff` maska, terminal `bg-red-500/yellow-500/green-500`, number-ticker `text-black`, dock `bg-white/10`, `hover:bg-muted-foreground` → všetko tokeny.
- Confetti: `@/components/ui/button` → natívny `<button>` v brand vzore (`CONFETTI_BUTTON_CLASS`).

## Otvorené
- Lab agent: `npm i canvas-confetti` + `npm i -D @types/canvas-confetti`, potom `<MagicuiLab client:only="react" />` do `src/pages/lab.astro` (alebo vlastnú podstránku) — ostrov používa `useRef`/canvas, na SSR by prešiel, `client:only` je najistejšie.
- JS váha neodmeraná (zákaz astro build). Odhad: motion/react zdieľané s Motion Primitives; canvas-confetti ≈ 5 kB gz (worker inline).
- `lab.astro` som nemenil (nie je v mojom vlastníctve).
- Dočasné súbory SSR testu (`work/.ssr-magicui-tmp.*`) zmazané; shim tsconfig ostal len v scratchpade.
