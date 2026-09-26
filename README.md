# xvadur.com

Verejný web a obchod Adama Rudavského / XVADUR: ponuka (AI agenti, weby a systémy, automatizácie), dôkazy z účteniek, ako pracujem, kto som, nástroje, odber, konzultácia; podstránky hry, kvíz, skóre webu, texty, makléri. Astro 7 + React ostrovy + Tailwind 4, Cloudflare.

## Lokálne

```bash
npm install
npm run dev
```

## Overenie

```bash
npm run check
npm run build   # → dist/client/
npm test
```

v6 (26. 9. 2026) je na vetve `claude/determined-goldberg-xy19as`, nenasadená — pozri `work/V6_2026-09-26.md`. `main` je nasadená verzia: Cloudflare Worker `xvadur-com` (`xvadur.com`, `www.xvadur.com`). Deploy: `npm run build && npx wrangler deploy -c dist/server/wrangler.json`. Predchádzajúce verzie webu (Pages projekt `landing`, vetva `staging`, `legacy/`, história) boli 19. 9. 2026 zmazané.
