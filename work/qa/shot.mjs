import { chromium } from 'playwright';
const out = process.argv[2];
const base = 'http://127.0.0.1:4180';
const browser = await chromium.launch();
const results = {};
for (const [name, w, h, reduced] of [['desktop', 1440, 900, false], ['mobile', 375, 812, false], ['mobile-rm', 375, 812, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: w < 768, isMobile: w < 768 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  for (const path of ['/', '/lab/', '/404.html']) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const info = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
      hasCursor: document.documentElement.classList.contains('has-cursor'),
      lenis: !!window.__lenis,
      fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v,i,a)=>a.indexOf(v)===i),
      reveal: (() => { const el = document.querySelector('.reveal'); return el ? getComputedStyle(el).animationTimeline : 'n/a'; })(),
      shadow: (() => { const el = document.querySelector('.shadow-brutal'); return el ? getComputedStyle(el).boxShadow : 'n/a'; })(),
      h1: document.querySelector('h1')?.textContent?.trim(),
      smallTargets: [...document.querySelectorAll('a,button')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); }).map(el => (el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,30) + ' ' + Math.round(el.getBoundingClientRect().width)+'x'+Math.round(el.getBoundingClientRect().height)),
    }));
    results[`${name}${path}`] = { ...info, errors: [...errors] };
    errors.length = 0;
    await page.screenshot({ path: `${out}/${name}${path.replace(/\//g, '_') || '_'}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
