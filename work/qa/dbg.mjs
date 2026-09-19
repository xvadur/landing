import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900} });
p.on('console', m => console.log('console:', m.type(), m.text())); p.on('pageerror', e => console.log('pageerror', e.message));
p.on('worker', w => { console.log('worker created', w.url()); w.on('close', () => console.log('worker closed')); });
await p.goto('http://localhost:4191/', { waitUntil: 'networkidle' }); await p.waitForTimeout(4000);
console.log('ascii:', await p.getAttribute('section[aria-label="Úvod"]','data-ascii'), 'workers:', p.workers().length);
await b.close();
