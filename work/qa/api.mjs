// Overenie /api/skore bez dev servera: importuje sa hotový chunk z dist/server a volá sa POST/GET
// proti fixtúre work/qa/fixtures/klise.html (z disku; spúšťať z koreňa repa, bez servera).
import { readdirSync, readFileSync } from 'node:fs';
const dir = new URL('../../dist/server/chunks/', import.meta.url);
const chunk = readdirSync(dir).find((f) => /^skore_.*\.mjs$/.test(f));
if (!chunk) throw new Error('chunk /api/skore nenájdený v dist/server/chunks');
const { page } = await import(new URL(chunk, dir));
const mod = page();

const get = await mod.GET({ request: new Request('http://x/api/skore') });
console.log('GET', get.status, await get.text());

const zle = await mod.POST({ request: new Request('http://x/api/skore', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'ftp://nie' }) }) });
console.log('POST zlá url', zle.status, await zle.text());

const lok = await mod.POST({ request: new Request('http://x/api/skore', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'http://localhost/' }) }) });
console.log('POST localhost', lok.status, await lok.text());

// fixtúra cez 127.0.0.1 je zakázaná (holá IP) → na test analýzy zavoláme analyze cez povolený host? Nie: overíme len cez doménu s /etc/hosts? Namiesto toho: povolíme test cez hostname "localtest.me"? Bez siete → skúsime priamo fetch fixtúry a analyze:
const fix = readFileSync(new URL('./fixtures/klise.html', import.meta.url), 'utf8');
const { analyze } = await import('../../src/lib/skore-analyzer.ts');
const r = analyze(fix, 'https://priklad.sk/');
console.log('analyze(fixtúra)', r.skore, r.prvyKrok, r.vendor, r.klise.map((k) => `${k.rodina}:${k.pocet}`).join(' | '));

const chybna = await mod.POST({ request: new Request('http://x/api/skore', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'https://neexistujuca-domena-xvadur-test.invalid/' }) }) });
console.log('POST neexistujúca doména', chybna.status, await chybna.text());
