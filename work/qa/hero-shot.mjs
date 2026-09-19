import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: {width:1440,height:900} });
const errs = [];
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto('http://localhost:4191/', { waitUntil: 'networkidle' });
await p.screenshot({ path: '/tmp/opona-0.png' });            // opona zatvorená (0 ms)
await p.waitForTimeout(700);
await p.screenshot({ path: '/tmp/opona-1.png' });            // otvára sa
await p.waitForTimeout(1200);
await p.screenshot({ path: '/tmp/ascii-form.png' });         // ascii skladá (~1.9 s)
await p.waitForTimeout(2500);
await p.screenshot({ path: '/tmp/ascii-hold.png' });         // drží
await p.waitForTimeout(7000);
await p.screenshot({ path: '/tmp/ascii-noise.png' });        // šum (~11.4 s)
console.log('opona in DOM:', await p.$('#opona') ? 'yes' : 'no');
console.log('data-ascii:', await p.getAttribute('section[aria-label="Úvod"]', 'data-ascii'));
console.log('lock:', await p.evaluate(() => document.documentElement.className));
console.log('errors:', errs);
await p.goto('http://localhost:4191/', { waitUntil: 'networkidle' });
console.log('second visit opona:', await p.$('#opona') ? 'yes' : 'no');
// kto som
await p.evaluate(() => document.querySelector('#kto-som').scrollIntoView());
await p.waitForTimeout(600);
await p.screenshot({ path: '/tmp/ktosom.png' });
await p.evaluate(() => window.scrollBy(0, 700)); await p.waitForTimeout(600);
await p.screenshot({ path: '/tmp/ktosom-os.png' });
await b.close();
