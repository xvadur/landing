import { chromium } from 'playwright';
const S = process.argv[2];
const browser = await chromium.launch();
// mobile drawer
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:4180/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${S}/m-drawer.png` });
  console.log('drawer links', await page.locator('dialog[data-nav][open] nav a').count(), 'errs', errs);
  await ctx.close();
}
// desktop wizard + cmdk + toast
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:4180/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Meta+k');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${S}/d-cmdk.png` });
  console.log('cmdk items', await page.locator('[cmdk-item]').count());
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /ZAČAŤ CEZ 4 OTÁZKY/ }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /ZAČAŤ CEZ 4 OTÁZKY/ }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${S}/d-wizard-1.png` });
  await page.getByRole('button', { name: 'Web alebo digitálny produkt' }).click();
  await page.getByRole('button', { name: 'Už niečo skúšam' }).click();
  await page.getByRole('button', { name: 'Prototyp riešenia' }).click();
  await page.locator('#wizard-detail').fill('Skúšobný kontext.');
  await page.getByRole('button', { name: /POKRAČOVAŤ/ }).click();
  await page.waitForTimeout(300);
  const wa = await page.locator('a[href^="https://wa.me/"]').getAttribute('href');
  const mail = await page.locator('a[href^="mailto:"]').getAttribute('href');
  console.log('wa', decodeURIComponent(wa.split('text=')[1]).split('\n').join(' | '));
  console.log('mailto', mail.slice(0, 60));
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: /Skopírovať/ }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${S}/d-wizard-5.png` });
  console.log('toast', await page.locator('[data-sonner-toast]').count());
  // cursor label
  await page.keyboard.press('Escape');
  await page.mouse.move(120, 560); await page.waitForTimeout(300);
  await page.screenshot({ path: `${S}/d-cursor.png`, clip: { x: 0, y: 450, width: 500, height: 250 } });
  console.log('errs', errs);
  await ctx.close();
}
await browser.close();
