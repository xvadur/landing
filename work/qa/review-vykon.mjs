/** Review VÝKON: rAF fps na hlavnom vlákne (idle + programový scroll), worker lifecycle cez ClientRouter,
 *  fallback bez OffscreenCanvas, atlasové švy motta pri DPR 1 / 1,5 / 2, JS načítané pri návšteve (gz).
 *  Spúšťať z koreňa repa: node work/qa/review-vykon.mjs   (server: python3 -m http.server 4320 -d dist-review-vykon/client) */
import { chromium } from 'playwright';
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4320';
const DIST = 'dist-review-vykon/client';
const out = {};

const gzOf = (url) => {
  const f = path.join(DIST, new URL(url).pathname);
  return fs.existsSync(f) ? zlib.gzipSync(fs.readFileSync(f)).length : 0;
};

/** 3 s rAF na hlavnom vlákne + longtask; voliteľne programový scroll 20 px / 16 ms */
async function measure(page, scroll) {
  return page.evaluate(async (scroll) => {
    const gaps = [];
    const long = [];
    let po;
    try {
      po = new PerformanceObserver((l) => l.getEntries().forEach((e) => long.push(Math.round(e.duration))));
      po.observe({ type: 'longtask', buffered: false });
    } catch {}
    let iv = 0;
    if (scroll) iv = setInterval(() => window.scrollBy(0, 20), 16);
    const t0 = performance.now();
    let last = t0;
    await new Promise((res) => {
      const tick = (now) => {
        gaps.push(now - last);
        last = now;
        if (now - t0 < 3000) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
    clearInterval(iv);
    po?.disconnect();
    gaps.shift();
    const dur = last - t0;
    const sorted = [...gaps].sort((a, b) => a - b);
    return {
      frames: gaps.length,
      fps: +((gaps.length / dur) * 1000).toFixed(1),
      maxGap: +Math.max(...gaps).toFixed(1),
      p95Gap: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
      over50: gaps.filter((g) => g > 50).length,
      over33: gaps.filter((g) => g > 33.4).length,
      longtasks: long,
      scrollY: Math.round(scrollY),
    };
  }, scroll);
}

async function run(label, ctxOpts, { blockAscii = false } = {}) {
  const browser = await chromium.launch({ channel: 'chromium' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, ...ctxOpts });
  const page = await ctx.newPage();
  const js = new Map();
  page.on('response', (r) => {
    if (r.url().endsWith('.js')) js.set(r.url(), gzOf(r.url()));
  });
  if (blockAscii) await page.route(/Ascii\..*\.js$/, (r) => r.abort());
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  const state = await page.evaluate(() => ({
    ascii: document.querySelector('[data-ascii]')?.dataset.ascii,
    hero: document.querySelector('[data-hero]')?.dataset.hero,
    opona: !!document.getElementById('opona'),
    lenis: !!window.__lenis,
    canvas: !!document.querySelector('section[aria-label="Úvod"] canvas'),
    canvasSize: (() => { const c = document.querySelector('section[aria-label="Úvod"] canvas'); return c ? `${c.width}×${c.height} (css ${c.clientWidth}×${c.clientHeight})` : null; })(),
  }));
  const workers = page.workers().length;
  const jsAt4s = [...js.values()].reduce((a, b) => a + b, 0);
  const idle = await measure(page, false);
  const scrollRes = await measure(page, true);
  const jsAfterScroll = [...js.values()].reduce((a, b) => a + b, 0);
  out[label] = { state, workers, jsAt4s_kB: +(jsAt4s / 1024).toFixed(1), jsAfterScroll_kB: +(jsAfterScroll / 1024).toFixed(1), idle, scroll: scrollRes, errors };
  console.log(label, JSON.stringify(out[label], null, 1));
  await browser.close();
}

/** Worker lifecycle cez ClientRouter: / → /texty/ (klik v nav) → / (klik na wordmark) × 2 */
async function workersNav() {
  const browser = await chromium.launch({ channel: 'chromium' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  const created = [];
  page.on('worker', (w) => created.push(w.url().split('/').pop()));
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  const log = [{ at: 'home#1', workers: page.workers().length, created: created.length }];
  for (let i = 0; i < 2; i++) {
    await page.click('header nav a[href="/texty/"]');
    await page.waitForFunction(() => location.pathname === '/texty/');
    await page.waitForTimeout(1500);
    log.push({ at: `texty#${i + 1}`, path: page.url(), workers: page.workers().length, created: created.length });
    await page.click('header a[data-site-wm]');
    await page.waitForFunction(() => location.pathname === '/');
    await page.waitForTimeout(3500);
    log.push({ at: `home#${i + 2}`, path: page.url(), workers: page.workers().length, created: created.length, ascii: await page.evaluate(() => document.querySelector('[data-ascii]')?.dataset.ascii) });
  }
  // aj cez history back
  await page.click('header nav a[href="/texty/"]');
  await page.waitForFunction(() => location.pathname === '/texty/');
  await page.waitForTimeout(1000);
  await page.goBack();
  await page.waitForFunction(() => location.pathname === '/');
  await page.waitForTimeout(3500);
  log.push({ at: 'home#back', workers: page.workers().length, created: created.length, ascii: await page.evaluate(() => document.querySelector('[data-ascii]')?.dataset.ascii) });
  out.workersNav = { log, errors, workerUrls: [...new Set(created)] };
  console.log('workersNav', JSON.stringify(out.workersNav, null, 1));
  await browser.close();
}

/** Fallback: transferControlToOffscreen a potom canvas.width = … (cesta startWorker().catch(() => startMain(build()))) */
async function fallbackCheck() {
  const browser = await chromium.launch({ channel: 'chromium' });
  const page = await browser.newPage();
  await page.goto(BASE + '/');
  out.fallback = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.transferControlToOffscreen();
    const r = {};
    try { c.width = 10; r.setWidth = 'ok'; } catch (e) { r.setWidth = e.name; }
    try { r.getContext = c.getContext('2d') ? 'ctx' : 'null'; } catch (e) { r.getContext = e.name; }
    return r;
  });
  console.log('fallback', JSON.stringify(out.fallback));
  await browser.close();
}

/** Atlas švy: screenshot motta počas HOLD pri DPR 1 / 1,5 / 2 */
async function seams() {
  const browser = await chromium.launch({ channel: 'chromium' });
  out.seams = {};
  for (const dpr of [1, 1.5, 2]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dpr });
    const page = await ctx.newPage();
    await page.addInitScript(() => { try { sessionStorage.setItem('opona', '1'); } catch {} });
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('[data-ascii]')?.dataset.ascii === 'on', null, { timeout: 15000 }).catch(() => {});
    // ready = prvý frame (t≈0 cyklu); HOLD je 2,2–8,2 s → 4 s po ready je stred HOLD
    await page.waitForTimeout(4000);
    const box = await page.evaluate(() => {
      const p = document.querySelector('section[aria-label="Úvod"] p[lang="en"]');
      const r = p.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    });
    const file = `work/screens/review-vykon-motto-dpr${String(dpr).replace('.', '_')}.png`;
    await page.screenshot({ path: file, clip: box });
    // výrez 1 písmena (2× zoom cez clip menší)
    const zoom = `work/screens/review-vykon-motto-dpr${String(dpr).replace('.', '_')}-zoom.png`;
    await page.screenshot({ path: zoom, clip: { x: box.x + 40, y: box.y + 20, width: 260, height: 150 } });
    const info = await page.evaluate(() => {
      const c = document.querySelector('section[aria-label="Úvod"] canvas');
      const m = document.createElement('canvas').getContext('2d');
      m.font = `500 11px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim()}`;
      return { canvas: `${c.width}×${c.height}`, css: `${c.clientWidth}×${c.clientHeight}`, cw: m.measureText('M').width, dpr: devicePixelRatio, ascii: document.querySelector('[data-ascii]')?.dataset.ascii };
    });
    out.seams[dpr] = { file, zoom, ...info };
    console.log('seams', dpr, JSON.stringify(out.seams[dpr]));
    await ctx.close();
  }
  await browser.close();
}

await run('ascii', {});
await run('reduced', { reducedMotion: 'reduce' });
await run('noAsciiChunk', {}, { blockAscii: true });
await workersNav();
await fallbackCheck();
await seams();
fs.writeFileSync('work/qa/review-vykon.json', JSON.stringify(out, null, 2));
console.log('DONE');
