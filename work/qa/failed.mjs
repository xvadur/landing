import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('requestfailed', r => console.log('FAILED', r.url()));
page.on('response', r => { if (r.status() >= 400) console.log(r.status(), r.url()); });
await page.goto('http://127.0.0.1:4180/', { waitUntil: 'networkidle' });
await browser.close();
