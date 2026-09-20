import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1920,height:1080} });
await p.goto('http://localhost:4191/', { waitUntil: 'domcontentloaded' });
for (const t of [500, 900, 1300, 1500, 1800]) { await p.waitForTimeout(t - (await p.evaluate(() => performance.now())) > 0 ? Math.max(0, t - await p.evaluate(() => performance.now())) : 0); await p.screenshot({ path: `/tmp/seq-${t}.png` }); }
await b.close();
