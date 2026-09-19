// Integračná QA celého webu nad dist/client (19. 9. 2026). Spustiť z koreňa repa:
//   python3 -m http.server 4190 -d dist/client &   (alebo iný port cez PORT=…)
//   node work/qa/final.mjs
// Pre každú cestu z src/data/routes.ts + /lab/ + /404.html, na 1440×900 a 375×812 (dotyk):
//   HTTP 200, 0 console/page errorov, scrollWidth == clientWidth, každý interný odkaz vedie na súbor v dist (alebo kotvu),
//   celostránkový screenshot work/screens/final-<slug>-{desktop,mobile}.png, domov aj reduced motion → final-home-reduced.png,
//   gz JS skutočne stiahnutý po prejdení celej stránky. Výsledok: work/qa/final-report.json + tabuľka na stdout.
import { chromium } from 'playwright';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { ROUTES } from '../../src/data/routes.ts';

const PORT = process.env.PORT || '4190';
const base = `http://127.0.0.1:${PORT}`;
const dist = 'dist/client';
const outDir = 'work/screens';
mkdirSync(outDir, { recursive: true });

const routes = [
  ...ROUTES.map((r) => ({ path: r.path, slug: r.path === '/' ? 'home' : r.slug })),
  { path: '/lab/', slug: 'lab' },
  { path: '/404.html', slug: '404' },
].filter((r) => !process.env.ONLY || r.path === process.env.ONLY);

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, touch: false, reduced: false },
  { name: 'mobile', width: 375, height: 812, touch: true, reduced: false },
];

/** Interný odkaz → existuje v dist? Vracia null (OK) alebo dôvod. */
function checkInternal(href, pageHtml, pagePath) {
  if (href.startsWith('#')) {
    const id = href.slice(1);
    if (!id) return null; // "#" = hore
    return pageHtml.includes(`id="${id}"`) ? null : `kotva #${id} nie je na stránke`;
  }
  const [pathAndQuery, hash] = href.split('#');
  const path = pathAndQuery.split('?')[0];
  const abs = path.startsWith('/') ? path : new URL(path, `http://x${pagePath}`).pathname;
  let file;
  if (abs.endsWith('/')) file = join(dist, abs, 'index.html');
  else if (existsSync(join(dist, abs)) && !existsSync(join(dist, abs, 'index.html'))) file = join(dist, abs);
  else file = existsSync(join(dist, abs, 'index.html')) ? join(dist, abs, 'index.html') : join(dist, abs);
  if (abs.startsWith('/api/')) return existsSync('dist/server/entry.mjs') ? null : 'server route bez dist/server';
  if (!existsSync(file)) return `chýba ${file}`;
  if (hash && file.endsWith('.html')) {
    const html = readFileSync(file, 'utf8');
    if (!html.includes(`id="${hash}"`)) return `kotva #${hash} nie je v ${abs}`;
  }
  return null;
}

async function gotoRetry(page, url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) {
      last = e;
      await page.waitForTimeout(500);
    }
  }
  throw last;
}

async function scrollThrough(page) {
  // prejsť celú stránku po obrazovkách (client:visible, view() animácie, lazy efekty), potom späť hore
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto'; // html { scroll-behavior: smooth } by inak scrollTo animoval
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
    const total = () => document.documentElement.scrollHeight;
    for (let y = 0; y < total(); y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, total());
    await new Promise((r) => setTimeout(r, 300));
    // Lenis (domov, hry) by inak dobiehal vlastný cieľ a fullPage screenshot by zachytil hlavičku uprostred strany
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForLoadState('networkidle').catch(() => {});
}

const browser = await chromium.launch();
const report = [];

async function runRoute(vp, route, extra = {}) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    hasTouch: vp.touch,
    isMobile: vp.touch,
    reducedMotion: vp.reduced ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  const errors = [];
  const js = new Map();
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    const f = r.failure()?.errorText || '';
    if (!/ERR_ABORTED/.test(f)) errors.push(`requestfailed ${r.url()} ${f}`);
  });
  page.on('response', async (res) => {
    const url = res.url();
    if (!url.includes('/_astro/') || !url.endsWith('.js')) return;
    try {
      const body = await res.body();
      js.set(url, gzipSync(body).length);
    } catch {}
  });

  let res = await gotoRetry(page, base + route.path);
  await page.waitForTimeout(600);
  await scrollThrough(page);
  await page.waitForTimeout(400);
  // python http.server občas zhodí spojenie (ERR_CONNECTION_RESET) — chyba servera, nie stránky: načítať znova (max 2×)
  for (let i = 0; i < 2 && errors.some((e) => /ERR_CONNECTION_RESET/.test(e)); i++) {
    errors.length = 0;
    js.clear();
    res = await gotoRetry(page, base + route.path);
    await page.waitForTimeout(600);
    await scrollThrough(page);
    await page.waitForTimeout(400);
  }
  const status = res?.status();

  const info = await page.evaluate(() => {
    const d = document.documentElement;
    const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    const wide = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > d.clientWidth + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed';
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
    const small = [...document.querySelectorAll('a,button,input,select,textarea,[role=button]')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') return false;
        return r.height < 44 || r.width < 44;
      })
      .map((el) => `${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
    const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1]);
    let order = true;
    for (let i = 1; i < headings.length; i++) if (headings[i] > headings[i - 1] + 1) order = false;
    const noAlt = [...document.querySelectorAll('img:not([alt])')].length;
    const inputsNoLabel = [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter((el) => {
      if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false;
      return !(el.id && document.querySelector(`label[for="${el.id}"]`)) && !el.closest('label');
    }).length;
    return {
      scrollW: d.scrollWidth,
      clientW: d.clientWidth,
      bodyScrollW: document.body.scrollWidth,
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60),
      h1Count: document.querySelectorAll('h1').length,
      headingOrder: order,
      noAlt,
      inputsNoLabel,
      links,
      wide,
      small,
    };
  });

  const html = await page.content();
  const broken = [];
  const seen = new Set();
  for (const href of info.links) {
    if (!href || seen.has(href)) continue;
    seen.add(href);
    if (/^(https?:|mailto:|tel:|javascript:)/.test(href)) continue;
    const why = checkInternal(href, html, route.path);
    if (why) broken.push(`${href} → ${why}`);
  }

  // JS zmerať PRED screenshotom: fullPage screenshot v Chromiu dočasne prepne metriky a client:media Drawer sa stiahne aj na desktope
  const jsSnap = [...js.entries()];
  const jsKb = jsSnap.reduce((a, [, b]) => a + b, 0) / 1024;

  const shotName = extra.shot || `final-${route.slug}-${vp.name}.png`;
  // prvá obrazovka (bez artefaktov fullPage: lepivá hlavička, pinnuté scény, view() animácie)
  await page.screenshot({ path: join(outDir, shotName.replace(/\.png$/, '-top.png')), fullPage: false }).catch(() => {});
  await page.screenshot({ path: join(outDir, shotName), fullPage: true }).catch(async (e) => {
    errors.push(`screenshot: ${e.message}`);
  });

  const row = {
    route: route.path,
    viewport: vp.name + (vp.reduced ? '-reduced' : ''),
    status,
    errors,
    overflow: info.scrollW > info.clientW || info.bodyScrollW > info.clientW,
    scroll: `${info.scrollW}/${info.clientW}`,
    wide: info.wide,
    broken,
    small: info.small,
    h1: info.h1,
    h1Count: info.h1Count,
    headingOrder: info.headingOrder,
    noAlt: info.noAlt,
    inputsNoLabel: info.inputsNoLabel,
    jsKb: +jsKb.toFixed(1),
    jsFiles: jsSnap.length,
    jsTop: jsSnap.sort((a, b) => b[1] - a[1]).slice(0, 12).map(([u, n]) => `${(n / 1024).toFixed(1)} ${u.split('/_astro/')[1]}`),
    screenshot: join(outDir, shotName),
  };
  report.push(row);
  await ctx.close();
  return row;
}

for (const vp of VIEWPORTS) {
  for (const route of routes) {
    const row = await runRoute(vp, route);
    const ok = row.status === 200 && row.errors.length === 0 && !row.overflow && row.broken.length === 0;
    console.log(
      `${ok ? 'OK ' : 'XX '} ${vp.name.padEnd(7)} ${route.path.padEnd(38)} ${String(row.status).padEnd(4)} js ${String(row.jsKb).padStart(6)} kB  scroll ${row.scroll}  err ${row.errors.length}  broken ${row.broken.length}  small ${row.small.length}`,
    );
    for (const e of row.errors.slice(0, 6)) console.log('      ! ' + e.slice(0, 200));
    for (const b of row.broken.slice(0, 6)) console.log('      ↯ ' + b);
    if (row.wide.length) console.log('      ⇔ ' + row.wide.join(' | '));
  }
}
// domov reduced motion (desktop)
if (!process.env.ONLY || process.env.ONLY === '/') {
  const vp = { name: 'desktop', width: 1440, height: 900, touch: false, reduced: true };
  const row = await runRoute(vp, { path: '/', slug: 'home' }, { shot: 'final-home-reduced.png' });
  console.log(`${row.errors.length === 0 && !row.overflow ? 'OK ' : 'XX '} reduced / (desktop)  js ${row.jsKb} kB  err ${row.errors.length}`);
  for (const e of row.errors.slice(0, 6)) console.log('      ! ' + e.slice(0, 200));
}

await browser.close();
writeFileSync('work/qa/final-report.json', JSON.stringify(report, null, 1));
const bad = report.filter((r) => r.status !== 200 || r.errors.length || r.overflow || r.broken.length);
console.log(`\n${report.length} meraní, ${bad.length} s nálezom. Report: work/qa/final-report.json`);
process.exit(bad.length ? 1 : 0);
