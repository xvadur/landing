// QA nálezov review (Skóre + Hry): RM animácie 120 ms, ciele ≥ 44 po výsledku, dlhé slovo, dt/dd, kontrast, aria-live. python3 -m http.server 4185 --directory dist-skore/client & node work/qa/skore/review.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { analyze } from '/Users/xvadur_mac/xvadur.com/src/lib/skore-analyzer.ts';
const FIX = analyze(readFileSync('/Users/xvadur_mac/xvadur.com/work/qa/fixtures/klise.html', 'utf8'), 'https://priklad-realitka.sk/');
const base = 'http://127.0.0.1:4185';
const browser = await chromium.launch();
const out = {};
const DLHE = 'Sme kancelária s dlhoročnými skúsenosťami. Superdlhéslovobezmedzierktorémôžepretiecťrámkartyakniejezalomené www.velmidlhadomenamaklera-bratislava-stare-mesto.sk/kontakt';
for (const [name, w, h, rm] of [['desktop', 1440, 900, false], ['desktop-rm', 1440, 900, true], ['mobile', 375, 812, false], ['mobile-rm', 375, 812, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: rm ? 'reduce' : 'no-preference', hasTouch: w < 768, isMobile: w < 768 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 501|ERR_CONNECTION_RESET/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const r = {};
  // --- skrtaci test
  await page.goto(base + '/hry/skrtaci-test/', { waitUntil: 'networkidle' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /škrtni/i }).click();
  await page.waitForTimeout(100);
  r.animsAfter100ms = await page.evaluate(() => document.getAnimations().filter((a) => a.effect?.target && !(a.effect.target.closest('[class*=marquee]'))).map((a) => ({ dur: a.effect.getTiming().duration, delay: a.effect.getTiming().delay, t: a.effect.target.tagName + '.' + [...a.effect.target.classList].slice(0, 2).join('.') })));
  await page.waitForTimeout(1200);
  r.skrt = await page.evaluate(() => {
    const dl = document.querySelector('dl.grid-cols-3');
    const first = dl?.querySelector('div')?.firstElementChild?.tagName;
    const dt = dl?.querySelector('dt');
    const dtCs = dt && getComputedStyle(dt);
    const tile = dt?.parentElement && getComputedStyle(dt.parentElement);
    const a = [...document.querySelectorAll('a')].find((x) => /Celý plán/.test(x.textContent || ''));
    const ar = a?.getBoundingClientRect();
    const mark = document.querySelector('mark.skrt');
    const small = [...document.querySelectorAll('a,button,input,textarea')].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.height < 44; }).map((el) => (el.textContent || '').trim().slice(0, 30) + ' ' + Math.round(el.getBoundingClientRect().height));
    const smallText = [...document.querySelectorAll('astro-island dt, astro-island .font-mono')].map((e) => parseFloat(getComputedStyle(e).fontSize)).filter((f) => f < 14);
    return { dlFirstChild: first, dtFontPx: dtCs && dtCs.fontSize, tileColor: tile && tile.color, tileBg: tile && tile.backgroundColor, celyPlanH: ar && Math.round(ar.height), markClass: mark?.className, markSr: mark?.querySelector('.sr-only')?.textContent, markTitle: mark?.getAttribute('title'), small, smallText, counters: [...document.querySelectorAll('dl dd')].map((d) => d.textContent.trim()), wordCounterLive: document.querySelector('form span[aria-live]') ? true : false };
  });
  // long word overflow
  await page.getByRole('textbox').fill(DLHE);
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /škrtni/i }).click();
  await page.waitForTimeout(1500);
  if (!(await page.locator('mark.skrt').count())) { await page.getByRole('button', { name: /škrtni/i }).click(); await page.waitForTimeout(1500); }
  r.dlheMarks = await page.locator('mark.skrt').count();
  r.dlhe = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const over = [...document.querySelectorAll('astro-island *')].filter((el) => { const b = el.getBoundingClientRect(); return b.right > vw + 1 || b.left < -1; }).map((el) => el.tagName + ':' + Math.round(el.getBoundingClientRect().right));
    return { scrollW: document.documentElement.scrollWidth, over: over.slice(0, 5) };
  });
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.getByRole('button', { name: /stiahnuť kartu/i }).click()]);
  r.download = !!dl;
  if (dl && name === 'mobile') await dl.saveAs('/Users/xvadur_mac/xvadur.com/work/screens/skore-hry-skrtaci-test-karta-dlheslovo.png');
  if (name === 'mobile') await page.screenshot({ path: '/Users/xvadur_mac/xvadur.com/work/screens/skore-hry-skrtaci-test-mobile-dlheslovo.png', fullPage: true });
  // --- skore
  await page.goto(base + '/skore/', { waitUntil: 'networkidle' });
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 10000 }).catch(() => {});
  await page.route('**/api/skore', (route) => route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify({ ok: true, url: 'https://priklad-realitka.sk/', orezane: false, ...FIX }) }));
  r.placeholder = await page.getByRole('textbox').getAttribute('placeholder');
  await page.getByRole('textbox').fill('www.priklad-realitka.sk');
  await page.getByRole('button', { name: /zistiť skóre/i }).click();
  await page.waitForTimeout(120);
  r.skoreAnims = await page.evaluate(() => document.getAnimations().filter((a) => a.effect?.target && a.effect.target.closest('astro-island')).map((a) => ({ dur: a.effect.getTiming().duration, t: a.effect.target.tagName + '.' + [...a.effect.target.classList].slice(0, 2).join('.'), type: a.constructor.name })));
  await page.waitForTimeout(1500);
  r.skore = await page.evaluate(() => ({
    gauge: document.querySelector('svg[role=img]')?.getAttribute('aria-label'),
    number: document.querySelector('number-flow-react')?.textContent?.trim(),
    dashoffset: document.querySelector('path.stroke-hot')?.getAttribute('stroke-dashoffset'),
    verdikt: document.getElementById('skore-verdikt')?.textContent?.trim(),
    verdiktText: document.getElementById('skore-verdikt')?.nextElementSibling?.textContent?.trim(),
    focused: document.activeElement?.id,
    live: document.querySelector('[aria-live]')?.textContent?.trim(),
    liveIsSr: document.querySelector('[aria-live]')?.classList.contains('sr-only'),
    alertInLive: !!document.querySelector('[aria-live] [role=alert]'),
    pct: /\d+ %/.test(document.body.innerText) ? [...document.body.innerText.matchAll(/\d+(?:,\d+)? %/g)].map((m) => m[0]) : [],
    ink50: document.querySelectorAll('.text-ink\\/50, .text-ink\\/55').length,
    scrollW: document.documentElement.scrollWidth,
  }));
  r.errors = errors.slice();
  out[name] = r;
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
