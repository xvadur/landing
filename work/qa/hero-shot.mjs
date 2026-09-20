import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: {width:1440,height:900} });
const errs = [];
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto('http://localhost:4191/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2500);                                  // opona sa práve otvorila
await p.screenshot({ path: '/tmp/hero-t0.png' });
await p.waitForTimeout(450);
await p.screenshot({ path: '/tmp/hero-t1.png' });              // dešifruje sa riadok 1
await p.waitForTimeout(700);
await p.screenshot({ path: '/tmp/hero-t2.png' });              // riadok 2 beží
await p.waitForTimeout(2000);
await p.screenshot({ path: '/tmp/hero-t3.png' });              // hotovo
const txt = await p.textContent('section[aria-label="Úvod"] p[lang=en]');
console.log('motto text:', JSON.stringify(txt.replace(/\s+/g,' ').trim()), 'errors:', errs);
await b.close();
