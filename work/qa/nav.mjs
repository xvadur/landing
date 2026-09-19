// Mobilná navigácia (natívny <dialog> v Header.astro): otvoriť, zavrieť X / Esc / pozadie / odkaz, ClientRouter navigácia, desktop skrytý.
import { chromium } from 'playwright';
const base = `http://127.0.0.1:${process.env.PORT || 4190}`;
const browser = await chromium.launch();
const errs = [];
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const state = () => page.evaluate(() => ({ open: document.querySelector('dialog[data-nav]').open, active: document.activeElement?.tagName + ' ' + (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim().slice(0, 12)), htmlOverflow: getComputedStyle(document.documentElement).overflow, links: document.querySelectorAll('dialog[data-nav] nav a').length }));
for (const path of ['/texty/', '/']) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  const menu = page.getByRole('button', { name: 'Menu' });
  const box = await menu.boundingBox();
  console.log(path, 'menu button', box && `${Math.round(box.width)}x${Math.round(box.height)}`);
  await menu.click();
  await page.waitForTimeout(700);
  console.log(' otvorené:', await state());
  await page.screenshot({ path: `work/screens/final-nav-${path === '/' ? 'home' : 'texty'}-open.png` });
  // Esc
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  console.log(' po Esc:', (await state()).open);
  // X
  await menu.click(); await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Zavrieť menu' }).click(); await page.waitForTimeout(600);
  console.log(' po X:', (await state()).open);
  // pozadie
  await menu.click(); await page.waitForTimeout(500);
  await page.mouse.click(10, 400); await page.waitForTimeout(600);
  console.log(' po kliku na pozadie:', (await state()).open);
  // odkaz → navigácia cez ClientRouter → nová stránka má dialóg zavretý
  await menu.click(); await page.waitForTimeout(500);
  await page.locator('dialog[data-nav][open] nav a', { hasText: 'HRY' }).click();
  await page.waitForURL('**/hry/'); await page.waitForLoadState('networkidle'); await page.waitForTimeout(500);
  console.log(' po odkaze HRY:', page.url(), (await state()).open, 'aria-current:', await page.locator('dialog[data-nav] nav a[aria-current=page]').textContent());
  // po navigácii ešte raz otvoriť (skript beží raz, delegácia)
  await page.getByRole('button', { name: 'Menu' }).click(); await page.waitForTimeout(500);
  console.log(' otvorené po navigácii:', (await state()).open);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
}
await ctx.close();
// desktop: dialóg skrytý, tlačidlo Menu skryté
const d = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await d.newPage();
dp.on('pageerror', (e) => errs.push('pageerror ' + e.message));
await dp.goto(base + '/texty/', { waitUntil: 'networkidle' });
console.log('desktop menu visible:', await dp.getByRole('button', { name: 'Menu' }).isVisible(), 'dialog display:', await dp.evaluate(() => getComputedStyle(document.querySelector('dialog[data-nav]')).display));
await d.close();
await browser.close();
console.log('errors:', errs);
process.exit(errs.length ? 1 : 0);
