// QA domova (Domov agent): 1440×900, 1440 reduced, 375×812 dotyk, 375 reduced nad statickým buildom na :4181.
// Kontroly: console/page errory, scrollWidth, ciele ≥ 44 px, CTA VSTÚP v prvej obrazovke, výška motta v čase (bez skoku),
// dvere na mobile (transform krídel podľa scrollu), VSTÚP → dvere otvorené (desktop), dialóg Postavil (Esc, fokus),
// čísla kariet v SSR HTML, stiahnutý JS (gz z disku), text < 14 px vo vlastných súboroch, matter-js decomp warning.
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
const base = 'http://127.0.0.1:4181';
const dist = process.argv[2] ?? 'dist-domov/client';
const out = process.argv[3] ?? 'work/screens';
const browser = await chromium.launch();
const R = {};
// Lenis (autoRaf) by inak prepisoval programový scroll — skáče sa cez neho, keď existuje
const jump = "(y) => { const l = window.__lenis; if (l) { l.scrollTo(y, { immediate: true, force: true }); } window.scrollTo(0, y); }";
const gz = (u) => { const f = join(dist, new URL(u).pathname); return existsSync(f) ? gzipSync(readFileSync(f)).length : 0; };

for (const [name, w, h, reduced] of [['desktop', 1440, 900, false], ['desktop-rm', 1440, 900, true], ['mobile', 375, 812, false], ['mobile-rm', 375, 812, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: w < 768, isMobile: w < 768 });
  const page = await ctx.newPage();
  const errors = [], warns = [], js = new Map();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); if (m.type() === 'warning') warns.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => { const u = r.url(); if (u.includes('/_astro/') && u.endsWith('.js')) js.set(u, gz(u)); });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const r = {};
  // hero: CTA v prvej obrazovke + výška motta v čase
  const mottoH = [];
  for (let i = 0; i < 16; i++) { mottoH.push(await page.evaluate(() => Math.round(document.querySelector('section[aria-label="Úvod"] p[lang=en]').getBoundingClientRect().height))); await page.waitForTimeout(i < 6 ? 250 : 1000); }
  r.mottoH = [...new Set(mottoH)];
  r.cta = await page.evaluate(() => { const a = document.querySelector('a[data-cursor=vstup]'); const b = a.getBoundingClientRect(); return { bottom: Math.round(b.bottom), innerH: innerHeight, ok: b.bottom <= innerHeight }; });
  r.hero = await page.evaluate(() => ({ mode: document.querySelector('[data-hero]')?.dataset.hero, splitChars: document.querySelectorAll('.split-char').length, shader: document.querySelectorAll('canvas').length, h1: document.querySelectorAll('h1').length, h1text: document.querySelector('h1')?.textContent.trim() || document.querySelector('h1 img')?.alt }));
  await page.screenshot({ path: `${out}/fix-domov-${name}-hero.png` });
  // scroll cez celú stránku (lazy ostrovy)
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(h * 0.6)) { await page.evaluate(`(${jump})(${y})`); await page.waitForTimeout(160); }
  await page.waitForTimeout(800);
  r.scroll = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  r.small = await page.evaluate(() => [...document.querySelectorAll('a,button')].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.height < 44 || b.width < 44); }).map((el) => (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)));
  r.noAlt = await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute('alt')).length);
  r.small14 = await page.evaluate(() => [...document.querySelectorAll('section[aria-label="Úvod"] *, #postavil *, #hry *, #kto-som *, [data-gravita] *')].filter((el) => el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 14 && getComputedStyle(el).visibility !== 'hidden').map((el) => el.textContent.trim().slice(0, 24) + ' ' + getComputedStyle(el).fontSize));
  // dvere
  const dvere = [];
  for (const off of [-900, -400, -100, 100, 300, 600, 1200]) {
    await page.evaluate(`(${jump})(0)`); await page.waitForTimeout(150); await page.evaluate(`(${jump})(document.getElementById('kto-som').getBoundingClientRect().top + scrollY + (${off}))`);
    await page.waitForTimeout(250);
    dvere.push(await page.evaluate((off) => { const l = document.querySelector('[data-dvere-l]'); const cs = getComputedStyle(l); return `${off}: ${cs.transform} op=${cs.opacity} vis=${cs.visibility} tlSrc=${(l.getAnimations()[0]?.timeline?.source?.tagName) ?? '-'} mode=${document.getElementById('kto-som').dataset.dvere}`; }, off));
  }
  r.dvere = dvere;
  await page.evaluate(`(${jump})(0)`); await page.waitForTimeout(150); await page.evaluate(`(${jump})(document.getElementById('kto-som').getBoundingClientRect().top + scrollY + 100)`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/fix-domov-${name}-dvere.png` });
  // VSTÚP → dvere otvorené?
  await page.evaluate(`(${jump})(0)`);
  await page.waitForTimeout(300);
  await page.click('a[data-cursor=vstup]');
  await page.waitForTimeout(1800);
  r.vstup = await page.evaluate(() => { const l = document.querySelector('[data-dvere-l]'); const h2 = document.getElementById('kto-som-nadpis').getBoundingClientRect(); return { scrollY: Math.round(scrollY), left: getComputedStyle(l).transform, h2Top: Math.round(h2.top), h2Visible: h2.top >= 0 && h2.bottom <= innerHeight, hash: location.hash }; });
  await page.screenshot({ path: `${out}/fix-domov-${name}-vstup.png` });
  // Postavil: čísla + dialóg
  await page.evaluate(() => document.getElementById('postavil').scrollIntoView());
  await page.waitForTimeout(1500);
  r.cisla = await page.evaluate(() => [...document.querySelectorAll('#postavil li > button')].map((b) => b.querySelector('.tabular-nums')?.textContent.replace(/ /g, '_') ?? '(bez čísla)'));
  await page.screenshot({ path: `${out}/fix-domov-${name}-postavil.png` });
  const btn = page.locator('#postavil li > button').first();
  await btn.click();
  await page.waitForTimeout(700);
  r.dialog = await page.evaluate(() => { const d = document.querySelector('[role=dialog]'); return { count: document.querySelectorAll('[role=dialog]').length, name: d?.getAttribute('aria-labelledby') ? document.getElementById(d.getAttribute('aria-labelledby'))?.textContent.replace(/ /g, '_').trim() : d?.getAttribute('aria-label'), divInButton: document.querySelectorAll('button div').length, dupIds: (() => { const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); return ids.filter((x, i) => ids.indexOf(x) !== i); })(), log: [...document.querySelectorAll('.log-riadok')].map((l) => l.textContent).join(' | '), bodyOverflow: getComputedStyle(document.body).overflow }; });
  await page.screenshot({ path: `${out}/fix-domov-${name}-dialog.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  r.dialogAfter = await page.evaluate(() => ({ count: document.querySelectorAll('[role=dialog]').length, focusOnCard: document.activeElement?.closest('#postavil li') != null, bodyOverflow: getComputedStyle(document.body).overflow }));
  // gravity
  await page.evaluate(() => document.querySelector('[data-gravita]').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500);
  r.gravitaBefore = await page.evaluate(() => document.querySelector('[data-gravita]').dataset.fyzika);
  if (w < 768) { const g = await page.locator('[data-gravita]').boundingBox(); await page.touchscreen.tap(g.x + g.width / 2, g.y + g.height / 2); await page.waitForTimeout(2500); }
  r.gravita = await page.evaluate(() => ({ fyzika: document.querySelector('[data-gravita]').dataset.fyzika, canvas: document.querySelectorAll('[data-gravita] canvas').length, stickers: document.querySelectorAll('[data-gravita] .sticker').length }));
  await page.screenshot({ path: `${out}/fix-domov-${name}-gravita.png` });
  await page.waitForTimeout(500);
  r.jsKB = +([...js.values()].reduce((a, b) => a + b, 0) / 1024).toFixed(1);
  r.jsFiles = [...js.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([u, n]) => `${(n / 1024).toFixed(1)} ${u.split('/').pop()}`);
  r.errors = errors; r.warns = warns.filter((x) => /matter|decomp|React|Warning/i.test(x));
  R[name] = r;
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(R, null, 1));
