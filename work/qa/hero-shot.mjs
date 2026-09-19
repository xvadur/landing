import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: {width:1440,height:900} });
await p.goto('http://localhost:4191/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
await p.screenshot({ path: '/tmp/hero-kern.png', clip: {x:100,y:120,width:900,height:220} });
await b.close();
