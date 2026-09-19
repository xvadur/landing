# xvadur.com

Verejný web Adama Rudavského / XVADUR: hero, kto som, čo som postavil, hry, kvíz, texty, makléri, konzultácia. Astro 7 + React ostrovy + Tailwind 4, Cloudflare.

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

`main` je jediná verzia webu a je nasadená: Cloudflare Worker `xvadur-com` (`xvadur.com`, `www.xvadur.com`). Deploy: `npm run build && npx wrangler deploy -c dist/server/wrangler.json`. Predchádzajúce verzie webu (Pages projekt `landing`, vetva `staging`, `legacy/`, história) boli 19. 9. 2026 zmazané.
