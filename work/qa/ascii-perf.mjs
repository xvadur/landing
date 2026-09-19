import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900} });
const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto('http://localhost:4191/', { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
// meranie plynulosti hlavného vlákna: koľko rAF za 2 s (60 = plynulé) a najdlhšia medzera
const m = await p.evaluate(() => new Promise(res => { let n=0, worst=0, last=performance.now(); const t=performance.now();
  const f=(now)=>{ n++; worst=Math.max(worst, now-last); last=now; if(now-t<2000) requestAnimationFrame(f); else res({fps:n/2, worstGapMs: Math.round(worst)}); }; requestAnimationFrame(f); }));
console.log('main thread:', m, 'ascii:', await p.getAttribute('section[aria-label="Úvod"]','data-ascii'), 'errors:', errs);
await p.waitForTimeout(2500); await p.screenshot({ path: '/tmp/ascii-hold.png' });
await b.close();
