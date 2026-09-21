// @ts-check
import { execSync } from 'node:child_process';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import pkg from './package.json' with { type: 'json' };

// xvadur.com v4 — Astro 7, React ostrovy, Tailwind 4, Cloudflare.
// Výstup je statický (output: 'static'); server route sa prihlási sama cez
// `export const prerender = false` (napr. /api/skore).

/** Údaje o builde (src/lib/build.ts): dátum, krátky commit hash, hlavné číslo verzie z package.json.
 *  Číslo buildu je zámerne major verzia (`4.0.0` → 4), nie `git rev-list --count` — Cloudflare Build
 *  robí plytký clone (1 commit v histórii), takže počet commitov by tam bol vždy 1. Hash je vždy presný
 *  (rev-parse funguje aj na plytkom clone). Keď git nie je k dispozícii, hash ostane prázdny. */
function git(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}
const BUILD_DATUM = new Date().toISOString();
const BUILD_COMMIT = git('git rev-parse --short HEAD');
const BUILD_COMMITY = Number.parseInt(pkg.version, 10) || 0;

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
    define: {
      __BUILD_DATUM__: JSON.stringify(BUILD_DATUM),
      __BUILD_COMMIT__: JSON.stringify(BUILD_COMMIT),
      __BUILD_COMMITY__: JSON.stringify(BUILD_COMMITY),
    },
  },
});
