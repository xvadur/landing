import { chromium } from 'playwright';
// QA /kviz/: python3 -m http.server 4183 -d dist-kviz/client & node work/qa/kviz.mjs work/screens → 1440 / 375 / 375 reduced motion
const base = 'http://127.0.0.1:4183';
const out = process.argv[2] || 'work/screens';
const browser = await chromium.launch();
const results = {};
const check = async (page) => page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
  smallTargets: [...document.querySelectorAll('a,button')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); }).map(el => (el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,30) + ' ' + Math.round(el.getBoundingClientRect().width)+'x'+Math.round(el.getBoundingClientRect().height)),
  small: [...document.querySelectorAll('main *')].filter(el => el.children.length === 0 && el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 14 && getComputedStyle(el).display !== 'none' && !el.closest('.sr-only')).map(el => el.tagName + '.' + [...el.classList].slice(0,2).join('.') + ' ' + getComputedStyle(el).fontSize).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12),
  headings: [...document.querySelectorAll('#kviz h1,#kviz h2,#kviz h3')].map(h => h.tagName + ': ' + h.textContent.trim().slice(0,40)),
  animations: document.getAnimations().map(a => `${a.constructor.name} ${a.effect?.getTiming?.().duration}ms ${a.effect?.target?.tagName}.${[...(a.effect?.target?.classList||[])].slice(0,2).join('.')}`),
}));
for (const [name, w, h, reduced] of [['desktop', 1440, 900, false], ['mobile', 375, 812, false], ['mobile-rm', 375, 812, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: w < 768, isMobile: w < 768 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/prefetch|404/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/kviz/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const r = { load: await check(page) };
  r.ssrBusy = await page.evaluate(() => document.querySelector('[data-kviz]')?.getAttribute('aria-busy'));
  await page.screenshot({ path: `${out}/kviz-${name}.png`, fullPage: true });
  // hero CTA → #kviz, then validation without answer
  // klik s vycentrovaním: Playwright inak roluje prvok na horný okraj pod lepiacu hlavičku (reduced motion = bez smooth)
  const klik = async (sel) => { const l = page.locator(sel).first(); await l.evaluate((el) => el.scrollIntoView({ block: 'center' })); await page.waitForTimeout(60); await l.click(); };
  const radio = async (v) => { await klik(`[role=radio][value="${v}"]`); };
  const next = async () => { await klik('button[type=submit]'); await page.waitForTimeout(150); };
  await page.click('a[href="#kviz"]');
  await page.waitForTimeout(1200);
  await next();
  r.validation = await page.evaluate(() => ({
    alert: document.querySelector('#kviz-chyba')?.textContent, radioInvalid: document.querySelector('[role=radiogroup]')?.getAttribute('aria-invalid'),
    labelledby: document.querySelector('[role=radiogroup]')?.getAttribute('aria-labelledby'),
    alertColor: getComputedStyle(document.querySelector('#kviz-chyba')).color, alertBg: getComputedStyle(document.querySelector('#kviz-chyba')).backgroundColor,
  }));
  // short branch: autor, text, hodiny, sadzba, prompty, poruke, nikto → owner cap
  await radio('autor'); await next();
  r.afterStep = await page.evaluate(() => { const a = document.activeElement; const rect = a.getBoundingClientRect(); return { tag: a.tagName, text: a.textContent.trim().slice(0,30), top: Math.round(rect.top), outline: getComputedStyle(a).outlineStyle, anims: document.getAnimations().length }; });
  r.q2 = await check(page);
  await page.screenshot({ path: `${out}/kviz-${name}-q2.png`, fullPage: false });
  await radio('text'); await next();
  // decimal rejected
  await page.fill('#kviz-hodiny', '2.5'); await next();
  r.decimal = await page.evaluate(() => ({ alert: document.querySelector('#kviz-chyba')?.textContent, invalid: document.querySelector('#kviz-hodiny')?.getAttribute('aria-invalid'), describedby: document.querySelector('#kviz-hodiny')?.getAttribute('aria-describedby'), inputmode: document.querySelector('#kviz-hodiny')?.getAttribute('inputmode') }));
  await page.fill('#kviz-hodiny', '10'); await next();
  await klik('button[aria-pressed]:has-text("40")'); await next();
  await radio('prompty'); await next();
  await radio('poruke'); await next();
  await radio('nikto'); await next();
  await page.waitForTimeout(900);
  r.vysledok = await check(page);
  r.vysledokData = await page.evaluate(() => ({
    skore: document.querySelector('[data-kviz-vysledok] .sr-only')?.textContent, skoreVisible: [...document.querySelectorAll('[data-kviz-vysledok] p')].map(p => p.textContent.trim()).slice(0,6),
    cta: document.querySelector('[data-kviz-vysledok] a[href^="/konzultacia"]')?.getAttribute('href'),
    headings: [...document.querySelectorAll('#kviz h2, #kviz h3')].map(h => h.tagName + ': ' + h.textContent.trim().slice(0,40)),
    bgYellow: getComputedStyle(document.querySelector('[data-kviz-vysledok] article')).backgroundColor,
    bgImage: getComputedStyle(document.querySelector('[data-kviz-vysledok] article')).backgroundImage.slice(0,40),
  }));
  await page.screenshot({ path: `${out}/kviz-${name}-vysledok.png`, fullPage: true });
  // reload restore
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  r.restored = await page.evaluate(() => document.querySelector('[data-kviz]')?.getAttribute('data-krok'));
  // long branch: back to start, firma
  await klik('[data-kviz-vysledok] button:has-text("Odznova")'); await page.waitForTimeout(200);
  await radio('firma'); await next(); await radio('prenos'); await next();
  await klik('button[aria-pressed]:has-text("5")'); await next();
  await klik('button[aria-pressed]:has-text("25")'); await next();
  await radio('automatizacia'); await next();
  r.longBranch = await page.evaluate(() => document.querySelector('[data-kviz] .eyebrow')?.textContent);
  r.resetBtn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /Začať odznova/.test(b.textContent)); const rr = b?.getBoundingClientRect(); return rr ? Math.round(rr.width)+'x'+Math.round(rr.height) : null; });
  r.errors = errors;
  results[name] = r; console.error('done', name);
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
