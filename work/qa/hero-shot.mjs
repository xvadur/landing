import { chromium } from 'playwright';
const b = await chromium.launch(); 
for (const [n,w,h] of [['desk',1440,900],['mob',375,812]]) {
  const p = await b.newPage({ viewport: {width:w,height:h}, deviceScaleFactor: 1 });
  await p.goto('http://localhost:4191/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  await p.screenshot({ path: `/tmp/hero-${n}.png` });
}
await b.close();
