// Screenshot jednej sekcie domova (desktop 1440 + mobil 375): node work/qa/sekcia.mjs '#dokazy' dokazy [cesta]
import { chromium } from 'playwright';
const [sel, meno, cesta = '/'] = process.argv.slice(2);
const ROOT = new URL('../../', import.meta.url).pathname;
const b = await chromium.launch();
for (const [n, w, h] of [['d', 1440, 900], ['m', 375, 812]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => sessionStorage.setItem('opona', '1'));
  await p.goto((process.env.QA_BASE ?? 'http://127.0.0.1:4190') + cesta, { waitUntil: 'networkidle' });
  const el = await p.$(sel);
  await el.scrollIntoViewIfNeeded();
  await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'end' }), sel);
  await p.waitForTimeout(900);
  await el.screenshot({ path: `${ROOT}work/screens/v5-${meno}-${n}.png` });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(n, 'pretečenie px:', sw, 'chyby:', errs);
  await ctx.close();
}
await b.close();
