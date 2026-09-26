// QA externých odkazov (XDR-208): prejde všetky HTML v dist/client, vytiahne externé href a overí HTTP 200.
// node work/qa/odkazy.mjs → výpis + exit 1, ak je niektorý odkaz mŕtvy. mailto:, tel:, wa.me (predvyplnené) sa preskakujú.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../dist/client/', import.meta.url).pathname;
const subory = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) subory.push(p);
  }
})(ROOT);

const odkazy = new Map();
for (const f of subory) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/href="(https?:\/\/[^"#]+)[^"]*"/g)) {
    const u = m[1].replace(/&amp;/g, '&');
    if (/^https:\/\/(wa\.me|api\.whatsapp)/.test(u)) continue;
    if (/^https:\/\/xvadur\.com\/?$/.test(u) === false && /^https:\/\/xvadur\.com\//.test(u)) continue; // canonical/og
    if (!odkazy.has(u)) odkazy.set(u, new Set());
    odkazy.get(u).add(f.replace(ROOT, '/'));
  }
}
let zle = 0;
for (const [u, kde] of odkazy) {
  let kod = 0;
  try {
    const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(12000), headers: { 'user-agent': 'XVADUR-qa/1.0' } });
    kod = r.status;
  } catch {
    kod = 0;
  }
  const ok = kod === 200;
  if (!ok) zle++;
  console.log(`${ok ? 'OK ' : 'ZLÉ'} ${kod} ${u}  (${[...kde].slice(0, 3).join(', ')}${kde.size > 3 ? ' …' : ''})`);
}
console.log(`\n${odkazy.size} externých odkazov, mŕtvych: ${zle}`);
process.exit(zle ? 1 : 0);
