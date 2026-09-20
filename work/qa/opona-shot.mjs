import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n,w,h] of [['desk',1920,1080],['mob',375,812]]) {
  const c = await b.newContext({ viewport:{width:w,height:h} }); const p = await c.newPage();
  await p.goto('http://localhost:4191/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(700);
  await p.screenshot({ path: `/tmp/opona-${n}.png` });
  await p.waitForTimeout(2400);
  await p.screenshot({ path: `/tmp/hero-${n}-decrypt.png` });
  await c.close();
}
await b.close();
