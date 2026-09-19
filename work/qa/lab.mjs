// QA Labu: otvorí /lab/ na 1440×900 a 375×812 (+ reduced motion), zbiera console/page errory,
// kontroluje scrollWidth, uloží celostránkové screenshoty do work/screens/.
// Spúšťať z koreňa repa: python3 -m http.server 4180 -d dist/client & node work/qa/lab.mjs
import { chromium } from 'playwright';

const BASE = process.env.LAB_URL ?? 'http://localhost:4180/lab/';
const OUT = 'work/screens';
const runs = [
  { name: 'lab-desktop', viewport: { width: 1440, height: 900 } },
  { name: 'lab-mobile', viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
  { name: 'lab-reduced', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
];

const browser = await chromium.launch();
let failed = false;
for (const r of runs) {
  const ctx = await browser.newContext({
    viewport: r.viewport,
    isMobile: r.isMobile ?? false,
    hasTouch: r.hasTouch ?? false,
    reducedMotion: r.reducedMotion ?? 'no-preference',
    // Chromium kreslí celostránkový screenshot len do ~16 384 px (limit textúry) → 0.5 (Lab má > 23 000 px).
    deviceScaleFactor: 0.5,
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  // preskroluj celú stránku, nech sa client:visible / inView veci spustia
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y);
      await new Promise((res) => setTimeout(res, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  const m = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
    islands: document.querySelectorAll('astro-island').length,
    hydrated: document.querySelectorAll('astro-island[ssr]').length,
    h1: document.querySelectorAll('h1').length,
    smallTargets: [...document.querySelectorAll('a,button')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44);
      })
      .slice(0, 12)
      .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`),
  }));
  // filtre: prefetch 404 na nepostavené stránky nie je chyba vendor komponentov
  const vendorConsole = consoleErrors.filter((t) => !/404|Failed to load resource/.test(t));
  const ok = m.scrollWidth <= r.viewport.width && pageErrors.length === 0 && vendorConsole.length === 0;
  if (!ok) failed = true;
  console.log(`\n== ${r.name} ${r.viewport.width}×${r.viewport.height}${r.reducedMotion ? ' reduced-motion' : ''}`);
  console.log(`scrollWidth ${m.scrollWidth} / body ${m.bodyScrollWidth} / innerWidth ${m.innerWidth} → ${m.scrollWidth <= r.viewport.width ? 'OK' : 'HORIZONTÁLNY SCROLL'}`);
  console.log(`islands ${m.islands} (nehydratované ssr=${m.hydrated}) · h1 ${m.h1}`);
  console.log(`page errors ${pageErrors.length}`, pageErrors.slice(0, 5));
  console.log(`console errors ${consoleErrors.length} (vendor: ${vendorConsole.length})`, vendorConsole.slice(0, 8));
  if (m.smallTargets.length) console.log('ciele < 44 px:', m.smallTargets);
  if (r.name !== 'lab-reduced') await page.screenshot({ path: `${OUT}/${r.name}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
