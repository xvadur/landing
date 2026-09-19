// Súčet gz JS pre cestu: chunky z HTML + tranzitívne statické importy (import "…" / from "…") v dist-<meno>/client/_astro.
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname, resolve } from 'node:path';
const [dist, ...paths] = process.argv.slice(2);
for (const p of paths) {
  const html = readFileSync(join(dist, p, 'index.html'), 'utf8');
  const seen = new Set();
  const queue = [...new Set([...html.matchAll(/\/_astro\/[^"' ]+\.js/g)].map((m) => m[0]))];
  const rows = [];
  while (queue.length) {
    const f = queue.shift();
    if (seen.has(f)) continue;
    seen.add(f);
    const abs = join(dist, f);
    if (!existsSync(abs)) continue;
    const src = readFileSync(abs, 'utf8');
    rows.push([gzipSync(src).length, f]);
    for (const m of src.matchAll(/(?:import|from)\s*["']([^"']+\.js)["']/g)) {
      const rel = m[1];
      const target = rel.startsWith('/') ? rel : '/' + resolve(dirname(f), rel).replace(/^\//, '');
      queue.push(target);
    }
  }
  rows.sort((a, b) => b[0] - a[0]);
  const sum = rows.reduce((a, r) => a + r[0], 0);
  console.log(`== ${p}  ${(sum / 1024).toFixed(1)} kB gz (${rows.length} súborov)`);
  for (const [n, f] of rows) console.log(`   ${String(n).padStart(7)}  ${f}`);
}
