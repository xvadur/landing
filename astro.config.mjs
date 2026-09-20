// @ts-check
import { execSync } from 'node:child_process';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// xvadur.com v4 — Astro 7, React ostrovy, Tailwind 4, Cloudflare.
// Výstup je statický (output: 'static'); server route sa prihlási sama cez
// `export const prerender = false` (napr. /api/skore).

/** Údaje o builde (src/lib/build.ts): dátum, krátky commit hash, počet commitov na vetve.
 *  Keď git nie je k dispozícii (napr. Cloudflare build bez plnej histórie), ostanú prázdne/0. */
function git(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}
const BUILD_DATUM = new Date().toISOString();
const BUILD_COMMIT = git('git rev-parse --short HEAD');
const BUILD_COMMITY = Number(git('git rev-list --count HEAD')) || 0;

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
