// Screenshoty V8 domova (1440 a 375, celá stránka) + kontrola pretečenia a chýb konzoly. Beží proti http://127.0.0.1:4190/
import { chromium } from 'playwright';
const url = process.argv[2] ?? 'http://127.0.0.1:4190/';
const browser = await chromium.launch();
for (const [name, vp] of [['1440', { width: 1440, height: 900 }], ['375', { width: 375, height: 812 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, h: document.documentElement.scrollHeight,
    wm: (() => { const h = document.querySelector('h1.wordmark'); if (!h) return null; const s = [...h.querySelectorAll('span')]; const a = s[0].getBoundingClientRect(), b = s.at(-1).getBoundingClientRect(); return { fs: getComputedStyle(h).fontSize, w: Math.round(b.right - a.left), cw: Math.round(h.parentElement.getBoundingClientRect().width) }; })() }));
  await page.screenshot({ path: `work/screens/v8-${name}.png`, fullPage: true });
  await page.screenshot({ path: `work/screens/v8-${name}-hero.png`, fullPage: false });
  console.log(name, JSON.stringify(m), 'chyby:', errors.length, errors.slice(0, 3).join(' | '));
  await page.close();
}
await browser.close();
