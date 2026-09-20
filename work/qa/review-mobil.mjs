// Review MOBIL + OPONA + REDUCED MOTION (hero v2) nad statickým buildom dist-review-mobil na :4310.
// 375×812 dotyk + 1440×900: (1) prvá návšteva: opona, zámok scrollu, čas zmiznutia; (2) druhá návšteva (sessionStorage);
// (2b) návrat cez ClientRouter (/texty/ → domov); (3) reduced motion; (4) 375: scrollWidth, motto viditeľné, tap ciele, text ≥ 14 px;
// (5) rect wordmarku v opone (ľavé + pravé krídlo) vs. wordmark v hero; (6) hlavička data-hidden; navyše: pointer-events opony
// (tap cez oponu), skok animácie pri preskočení, scroll pod oponou (Lenis), flash malého wordmarku pred IO.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = 'http://127.0.0.1:4310';
const out = 'work/screens';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const R = {};
const jump = "(y) => { const l = window.__lenis; if (l) { l.scrollTo(y, { immediate: true, force: true }); } window.scrollTo(0, y); }";

const INIT = () => {
  const t = () => Math.round(performance.now());
  const log = { events: [], frames: [], rects: [] };
  window.__log = log;
  const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [+r.left.toFixed(2), +r.top.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)]; };
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'childList') {
        for (const n of m.addedNodes) if (n.nodeType === 1 && (n.id === 'opona' || n.querySelector?.('#opona'))) log.events.push(['opona-added', t()]);
        for (const n of m.removedNodes) if (n.nodeType === 1 && n.id === 'opona') log.events.push(['opona-removed', t()]);
      }
      if (m.type === 'attributes' && m.target === document.documentElement) log.events.push(['html-class', t(), document.documentElement.className]);
      if (m.type === 'attributes' && m.target.id === 'opona') log.events.push(['opona-class', t(), m.target.className]);
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  let n = 0;
  const f = () => {
    const o = document.getElementById('opona');
    const wm = document.querySelector('[data-site-wm]');
    const l = o?.querySelector('.opona-l');
    log.frames.push([t(), !!o, o ? getComputedStyle(l).transform : '-', document.documentElement.classList.contains('opona-lock'), wm ? (wm.dataset.hidden ?? 'unset') : '-', Math.round(scrollY)]);
    if (o) log.rects.push([t(), getComputedStyle(l).transform, rect(o.querySelector('.opona-l .opona-wm svg')), rect(o.querySelector('.opona-r .opona-wm svg'))]);
    if (++n < 900) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
};

const heroChecks = () => {
  const sec = document.querySelector('section[aria-label="Úvod"]');
  const p = sec?.querySelector('p[lang=en]');
  const cs = p ? getComputedStyle(p) : null;
  const small = [...sec.querySelectorAll('a,button')].map((el) => { const b = el.getBoundingClientRect(); return { t: (el.textContent || '').trim().slice(0, 20), w: Math.round(b.width), h: Math.round(b.height) }; });
  const txt = [...sec.querySelectorAll('*')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((el) => ({ t: el.textContent.trim().slice(0, 20), fs: parseFloat(getComputedStyle(el).fontSize) })).filter((x) => x.fs < 14);
  return {
    canvas: sec.querySelectorAll('canvas').length,
    dataAscii: sec.dataset.ascii,
    dataHero: sec.dataset.hero,
    mottoOpacity: cs?.opacity,
    mottoVisibility: cs?.visibility,
    mottoRect: p && [Math.round(p.getBoundingClientRect().top), Math.round(p.getBoundingClientRect().height)],
    fontSize: cs?.fontSize,
    targets: small,
    textUnder14: txt,
    heroWm: (() => { const s = document.querySelector('[data-hero-wordmark] svg'); if (!s) return null; const r = s.getBoundingClientRect(); return [+r.left.toFixed(2), +r.top.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)]; })(),
    heroWmTransform: document.querySelector('[data-hero-wordmark] svg')?.style.transform || '',
    headerH: Math.round(document.querySelector('header').getBoundingClientRect().height),
    headerVar: getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim(),
    siteWmHidden: document.querySelector('[data-site-wm]')?.dataset.hidden,
  };
};

const overflowInfo = () => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  innerW: innerWidth,
  bodyScrollW: document.body.scrollWidth,
  wide: [...document.querySelectorAll('body *')].filter((el) => { const b = el.getBoundingClientRect(); return b.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed'; }).slice(0, 12).map((el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].slice(0, 3).join('.')} right=${Math.round(el.getBoundingClientRect().right)}`),
});

for (const [name, w, h] of [['375', 375, 812], ['1440', 1440, 900]]) {
  const mobile = w < 768;
  const mk = async (reduced) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: mobile, isMobile: mobile });
    await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    return { ctx, page, errors };
  };
  const r = (R[name] = {});

  // ---------- (1) prvá návšteva ----------
  {
    const { ctx, page, errors } = await mk(false);
    const t0 = Date.now();
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    const dcl = Date.now() - t0;
    const early = await page.evaluate(() => ({ opona: !!document.getElementById('opona'), cls: document.getElementById('opona')?.className, lock: document.documentElement.classList.contains('opona-lock'), overflow: getComputedStyle(document.documentElement).overflow, session: sessionStorage.getItem('opona'), borderR: getComputedStyle(document.querySelector('.opona-r')).borderLeftWidth, t: Math.round(performance.now()) }));
    await page.waitForTimeout(Math.max(0, 500 - dcl));
    await page.screenshot({ path: `${out}/review-mobil-${name}-opona-hold.png` });
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${out}/review-mobil-${name}-opona-open.png` });
    // 2,5 s po DCL
    await page.waitForTimeout(2500 - (Date.now() - t0) + dcl > 0 ? Math.max(0, 2500 + dcl - (Date.now() - t0)) : 0);
    const at25 = await page.evaluate(() => ({ t: Math.round(performance.now()), opona: !!document.getElementById('opona'), lock: document.documentElement.classList.contains('opona-lock'), overflow: getComputedStyle(document.documentElement).overflow }));
    await page.waitForTimeout(600);
    const at3 = await page.evaluate(() => ({ t: Math.round(performance.now()), opona: !!document.getElementById('opona'), lock: document.documentElement.classList.contains('opona-lock') }));
    // scroll možný? (skutočný scroll: kolieskom/dotykom cez Lenis alebo natívne)
    if (mobile) { await page.touchscreen.tap(200, 600); await page.mouse.move(200, 600); }
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(700);
    const scrollAfterWheel = await page.evaluate(() => Math.round(scrollY));
    await page.evaluate(`(${jump})(0)`);
    await page.waitForTimeout(400);
    const hero = await page.evaluate(heroChecks);
    await page.screenshot({ path: `${out}/review-mobil-${name}-hero.png` });
    const log = await page.evaluate(() => window.__log);
    const go = log.events.find((e) => e[0] === 'opona-class' && e[2].includes('opona-go'))?.[1];
    const removed = log.events.find((e) => e[0] === 'opona-removed')?.[1];
    const lockOn = log.events.find((e) => e[0] === 'html-class' && e[2].includes('opona-lock'))?.[1];
    const lockOff = log.events.filter((e) => e[0] === 'html-class' && !e[2].includes('opona-lock')).map((e) => e[1]).find((t) => lockOn != null && t > lockOn);
    // rect wordmarku v opone počas držania (transform none) v prvých 800 ms po opona-go
    const hold = log.rects.filter((x) => x[1] === 'none' && go != null && x[0] - go <= 800);
    const holdL = hold.map((x) => JSON.stringify(x[2])); const holdR = hold.map((x) => JSON.stringify(x[3]));
    const first = log.frames.slice(0, 30).map((f) => `${f[0]}:${f[4]}`);
    r.first = {
      dclMs: dcl, early, at25, at3, scrollAfterWheel, goMs: go, removedMs: removed, holdMs: removed != null && go != null ? removed - go : null, lockOn, lockOff,
      oponaWmL: [...new Set(holdL)], oponaWmR: [...new Set(holdR)], holdSamples: hold.length, heroWm: hero.heroWm, heroWmTransform: hero.heroWmTransform,
      headerH: hero.headerH, headerVar: hero.headerVar, siteWmFramesEarly: first, wingTransforms: [...new Set(log.frames.filter((f) => f[1]).map((f) => f[2]))].slice(0, 40), errors,
    };
    r.hero = hero;
    await ctx.close();
  }

  // ---------- (1b) tap / klik cez oponu počas držania (pointer-events: none) ----------
  {
    const { ctx, page } = await mk(false);
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(150);
    const before = await page.evaluate(() => ({ opona: !!document.getElementById('opona'), path: location.pathname, dialog: document.querySelector('dialog[data-nav]')?.open }));
    if (mobile) {
      const b = await page.evaluate(() => { const r = document.querySelector('[data-nav-open]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await page.touchscreen.tap(b.x, b.y);
      await page.waitForTimeout(500);
      r.tapThrough = { before, target: 'Menu button', after: await page.evaluate(() => ({ dialogOpen: document.querySelector('dialog[data-nav]')?.open, opona: !!document.getElementById('opona'), oponaCls: document.getElementById('opona')?.className })) };
      await page.screenshot({ path: `${out}/review-mobil-${name}-tap-cez-oponu.png` });
    } else {
      const b = await page.evaluate(() => { const a = [...document.querySelectorAll('header nav a')].find((x) => x.getAttribute('href').startsWith('/texty')); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, href: a.getAttribute('href') }; });
      await page.mouse.click(b.x, b.y);
      await page.waitForTimeout(1200);
      r.tapThrough = { before, target: `nav link ${b.href}`, after: await page.evaluate(() => ({ path: location.pathname, opona: !!document.getElementById('opona') })) };
      await page.screenshot({ path: `${out}/review-mobil-${name}-klik-cez-oponu.png` });
    }
    await ctx.close();
  }

  // ---------- (1c) preskočenie: skok alebo 250 ms animácia? + scroll pod oponou ----------
  if (!mobile) {
    const { ctx, page } = await mk(false);
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(700);
    const samples = page.evaluate(() => new Promise((res) => { const s = []; const l = document.querySelector('.opona-l'); const t0 = performance.now(); const id = setInterval(() => { const el = document.querySelector('.opona-l'); s.push([Math.round(performance.now() - t0), el ? getComputedStyle(el).transform : 'removed', Math.round(scrollY)]); if (performance.now() - t0 > 600) { clearInterval(id); res(s); } }, 16); }));
    await page.waitForTimeout(30);
    await page.mouse.wheel(0, 120);
    r.skip = await samples;
    await ctx.close();
  } else {
    const { ctx, page } = await mk(false);
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(700);
    const samples = page.evaluate(() => new Promise((res) => { const s = []; const t0 = performance.now(); const id = setInterval(() => { const el = document.querySelector('.opona-l'); s.push([Math.round(performance.now() - t0), el ? getComputedStyle(el).transform : 'removed', Math.round(scrollY)]); if (performance.now() - t0 > 600) { clearInterval(id); res(s); } }, 16); }));
    await page.waitForTimeout(30);
    await page.touchscreen.tap(187, 700);
    r.skip = await samples;
    await ctx.close();
  }

  // ---------- (2) druhá návšteva v tom istom contexte + (2b) návrat cez ClientRouter ----------
  {
    const { ctx, page, errors } = await mk(false);
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.waitForTimeout(2800);
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    const second = await page.evaluate(() => ({ opona: !!document.getElementById('opona'), lock: document.documentElement.classList.contains('opona-lock'), session: sessionStorage.getItem('opona') }));
    await page.waitForTimeout(800);
    const log2 = await page.evaluate(() => window.__log);
    r.second = { immediate: second, events: log2.events.slice(0, 6), framesWithOpona: log2.frames.filter((f) => f[1]).length, siteWmFrames: [...new Set(log2.frames.slice(0, 40).map((f) => f[4]))], lockEver: log2.frames.some((f) => f[3]) };
    await page.screenshot({ path: `${out}/review-mobil-${name}-druha-navsteva.png` });
    // (2b) SPA: domov → /texty/ → domov cez wordmark v hlavičke
    if (mobile) { await page.click('[data-nav-open]'); await page.waitForTimeout(400); await page.click('dialog[data-nav] a[href^="/texty"]'); }
    else await page.click('header nav a[href^="/texty"]');
    await page.waitForFunction(() => location.pathname.startsWith('/texty'));
    await page.waitForTimeout(600);
    const textyWm = await page.evaluate(() => ({ path: location.pathname, hidden: document.querySelector('[data-site-wm]')?.dataset.hidden, frames: [...new Set(window.__log.frames.slice(-30).map((f) => f[4]))] }));
    await page.evaluate(() => { window.__log.events = []; window.__log.frames = []; });
    await page.click('[data-site-wm]');
    await page.waitForFunction(() => location.pathname === '/');
    await page.waitForTimeout(1500);
    const log3 = await page.evaluate(() => window.__log);
    r.spaReturn = { textyWm, events: log3.events.filter((e) => e[0].startsWith('opona')), framesWithOpona: log3.frames.filter((f) => f[1]).length, lockFrames: log3.frames.filter((f) => f[3]).length, siteWmFramesAfterReturn: log3.frames.slice(0, 40).map((f) => f[4]).join(','), errors };
    await page.screenshot({ path: `${out}/review-mobil-${name}-spa-navrat.png` });
    await ctx.close();
  }

  // ---------- (3) reduced motion ----------
  {
    const { ctx, page, errors } = await mk(true);
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    const immediate = await page.evaluate(() => ({ opona: !!document.getElementById('opona'), lock: document.documentElement.classList.contains('opona-lock') }));
    await page.waitForTimeout(3000);
    const hero = await page.evaluate(heroChecks);
    const log = await page.evaluate(() => window.__log);
    r.reduced = { immediate, framesWithOpona: log.frames.filter((f) => f[1]).length, canvas: hero.canvas, dataAscii: hero.dataAscii, dataHero: hero.dataHero, mottoOpacity: hero.mottoOpacity, lenis: await page.evaluate(() => !!window.__lenis), errors };
    await page.screenshot({ path: `${out}/review-mobil-${name}-reduced.png` });
    await ctx.close();
  }

  // ---------- (4) overflow + (6) hlavička ----------
  {
    const { ctx, page, errors } = await mk(false);
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    const ov3 = await page.evaluate(overflowInfo);
    const wmTop = await page.evaluate(() => document.querySelector('[data-site-wm]')?.dataset.hidden);
    await page.evaluate(`(${jump})(900)`);
    await page.waitForTimeout(500);
    const wm900 = await page.evaluate(() => ({ hidden: document.querySelector('[data-site-wm]')?.dataset.hidden, scrollY: Math.round(scrollY), opacity: getComputedStyle(document.querySelector('[data-site-wm]')).opacity }));
    await page.screenshot({ path: `${out}/review-mobil-${name}-scroll900.png` });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.7)) { await page.evaluate(`(${jump})(${y})`); await page.waitForTimeout(120); }
    await page.evaluate(`(${jump})(document.documentElement.scrollHeight)`);
    await page.waitForTimeout(900);
    const ovEnd = await page.evaluate(overflowInfo);
    await page.screenshot({ path: `${out}/review-mobil-${name}-koniec.png` });
    await page.evaluate(`(${jump})(0)`);
    await page.waitForTimeout(500);
    const wmBack = await page.evaluate(() => document.querySelector('[data-site-wm]')?.dataset.hidden);
    r.overflow = { at3s: ov3, atEnd: ovEnd };
    r.header = { top: wmTop, at900: wm900, backTop: wmBack, errors };
    // /texty/ priamo
    await page.goto(base + '/texty/', { waitUntil: 'domcontentloaded' });
    const t1 = await page.evaluate(() => document.querySelector('[data-site-wm]')?.dataset.hidden);
    await page.waitForTimeout(400);
    r.header.textyImmediate = t1;
    r.header.textyAfter = await page.evaluate(() => ({ hidden: document.querySelector('[data-site-wm]')?.dataset.hidden, opacity: getComputedStyle(document.querySelector('[data-site-wm]')).opacity, frames: [...new Set(window.__log.frames.slice(0, 20).map((f) => f[4]))] }));
    await ctx.close();
  }
}

await browser.close();
console.log(JSON.stringify(R, null, 1));
