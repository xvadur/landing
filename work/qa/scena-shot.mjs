import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n,w,h] of [['desk',1440,900],['tall',1330,1300],['mob',375,812]]) {
  const c = await b.newContext({ viewport:{width:w,height:h} }); const p = await c.newPage();
  await p.goto('http://localhost:4191/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(5200);
  await p.screenshot({ path: `/tmp/scena-${n}.png` });
  await c.close();
}
await b.close();
