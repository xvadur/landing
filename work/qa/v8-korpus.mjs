import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
for (const url of ['http://[::1]:5196/#/kokpit', 'http://[::1]:5196/']) {
  try { const r = await page.goto(url, { waitUntil: 'load', timeout: 20000 }); await page.waitForTimeout(7000);
    await page.screenshot({ path: 'public/v8/korpus.png' }); console.log(url, r?.status(), await page.title()); break; }
  catch (e) { console.log(url, 'chyba', String(e).slice(0, 100)); }
}
await browser.close();
