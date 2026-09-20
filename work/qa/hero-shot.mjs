import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: {width:1440,height:900} });
const errs = [];
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto('http://localhost:4191/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);
await p.screenshot({ path: '/tmp/opona-0.png' });            // opona drží
await p.waitForTimeout(1300);
await p.screenshot({ path: '/tmp/opona-1.png' });            // otvára sa
await p.waitForTimeout(1600);
await p.screenshot({ path: '/tmp/ascii-form.png' });
await p.waitForTimeout(3000);
await p.screenshot({ path: '/tmp/ascii-hold.png' });
await p.waitForTimeout(5200);
await p.screenshot({ path: '/tmp/ascii-noise.png' });
console.log('ascii:', await p.getAttribute('section[aria-label="Úvod"]', 'data-ascii'), 'header wm hidden:', await p.getAttribute('[data-site-wm]', 'data-hidden'));
await p.evaluate(() => window.scrollBy(0, 900)); await p.waitForTimeout(500);
console.log('after scroll header wm hidden:', await p.getAttribute('[data-site-wm]', 'data-hidden'));
console.log('errors:', errs);
await b.close();
