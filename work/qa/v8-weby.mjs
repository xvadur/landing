// Screenshoty živých webov (prvá obrazovka 1440×900) do public/v8/ ako obrázky práce.
import { chromium } from 'playwright';
const weby = [
  ['jakub', 'https://jakubolsa.sk/'],
  ['lucia', 'https://picung.xvadur.com/'],
  ['hriech', 'https://hriech.xvadur.com/'],
];
const browser = await chromium.launch();
for (const [n, url] of weby) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  try {
    const r = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `public/v8/${n}.png`, fullPage: false });
    console.log(n, r?.status(), 'ok');
  } catch (e) { console.log(n, 'chyba', String(e).slice(0, 120)); }
  await page.close();
}
await browser.close();
