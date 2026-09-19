import { chromium } from 'playwright';
const b = await chromium.launch();
for (const reduced of ['no-preference','reduce']) {
  const c = await b.newContext({ viewport:{width:1440,height:900}, reducedMotion: reduced }); const p = await c.newPage();
  await p.goto('http://localhost:4191/', { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
  const m = await p.evaluate(() => new Promise(res => { let n=0, worst=0, last=performance.now(); const t=performance.now();
    const f=(now)=>{ n++; worst=Math.max(worst, now-last); last=now; if(now-t<3000) requestAnimationFrame(f); else res({fps:Math.round(n/3), worstGapMs: Math.round(worst)}); }; requestAnimationFrame(f); }));
  console.log(reduced, m);
  await c.close();
}
await b.close();
