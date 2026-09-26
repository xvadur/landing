// QA V5: screenshoty domova 1440 / 375 / reduced motion, pretečenie, chyby konzoly, ciele < 44 px.
// Server: python3 -m http.server 4190 -d dist/client · spustenie z koreňa repa: node work/qa/v5.mjs [cesta] [prefix]
// Výstup: work/screens/v5-<prefix>-<variant>-<n>.png + súhrn na stdout (JSON).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url).pathname;
const OUT = ROOT + 'work/screens/';
mkdirSync(OUT, { recursive: true });
const path = process.argv[2] ?? '/';
const prefix = process.argv[3] ?? 'domov';
const base = process.env.QA_BASE ?? 'http://127.0.0.1:4190';

const VARIANTY = [
  ['desktop', 1440, 900, false],
  ['mobil', 375, 812, false],
  ['desktop-rm', 1440, 900, true],
  ['mobil-rm', 375, 812, true],
];

const browser = await chromium.launch();
const report = {};
for (const [name, w, h, rm] of VARIANTY) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    reducedMotion: rm ? 'reduce' : 'no-preference',
    hasTouch: w < 768,
    isMobile: w < 768,
  });
  // opona len raz za návštevu: pri screenshotoch ju preskočíme (sessionStorage), zvlášť ju kontroluje `opona` variant
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('opona', '1');
    } catch {}
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|prefetch|404/.test(m.text())) errs.push('console: ' + m.text());
  });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const shots = Math.min(14, Math.ceil(total / h));
  const overflow = [];
  for (let i = 0; i < shots; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * h);
    await page.waitForTimeout(rm ? 150 : 650);
    const sw = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    if (sw[0] > sw[1]) overflow.push({ i, scrollWidth: sw[0], innerWidth: sw[1] });
    await page.screenshot({ path: `${OUT}v5-${prefix}-${name}-${String(i).padStart(2, '0')}.png` });
  }
  const male = await page.evaluate(() =>
    [...document.querySelectorAll('a[href], button, input, select, textarea')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        if (s.visibility === 'hidden' || s.display === 'none' || r.width === 0) return false;
        if (el.closest('[aria-hidden="true"]')) return false;
        if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') return false; // odkaz v texte
        return r.height < 44 && r.width < 44;
      })
      .map((el) => (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40)),
  );
  const wide = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.marquee, [data-scroll-x], [data-allow-overflow]');
      })
      .slice(0, 8)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} → ${Math.round(el.getBoundingClientRect().right)}`),
  );
  report[name] = { total, shots, overflow, wide, male: [...new Set(male)].slice(0, 12), errs };
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
