// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// xvadur.com v4 — Astro 7, React ostrovy, Tailwind 4, Cloudflare.
// Výstup je statický (output: 'static'); server route sa prihlási sama cez
// `export const prerender = false` (napr. /api/skore).
export default defineConfig({
  site: 'https://xvadur.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
  // prerenderEnvironment 'node': statické stránky a OG karty (satori + natívny resvg, node:fs) sa renderujú
  // v Node, nie vo workerd (workerd nevie WASM z satori ani node:fs). Server routes bežia vo workerd ako inak.
  adapter: cloudflare({ imageService: 'compile', prerenderEnvironment: 'node' }),
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  vite: {
    plugins: [tailwindcss()],
  },
});
