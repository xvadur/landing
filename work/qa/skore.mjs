// QA pre Skóre + Hry: python3 -m http.server 4185 --directory dist-skore/client & node work/qa/skore.mjs
// 1440×900 / 375×812 / 375 reduced-motion: 0 console/page errorov, scrollWidth ≤ viewport, ciele ≥ 44 px,
// interakcia: ŠKRTNI na /hry/skrtaci-test/ (ukážka → škrty, počítadlá), submit na /skore/ (statický server → chybová hláška).
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { analyze } from '../../src/lib/skore-analyzer.ts';
const FIXTURA = analyze(readFileSync('work/qa/fixtures/klise.html', 'utf8'), 'https://priklad-realitka.sk/');

const base = process.argv[2] ?? 'http://127.0.0.1:4185';
const out = 'work/screens';
mkdirSync(out, { recursive: true });
const ROUTES = ['/skore/', '/hry/', '/hry/skrtaci-test/'];
const slug = (p) => 'skore-' + (p.replace(/\//g, '-').replace(/^-|-$/g, '') || 'root');

const browser = await chromium.launch();
let failed = 0;
const results = {};
for (const [name, w, h, reduced] of [
  ['desktop', 1440, 900, false],
  ['mobile', 375, 812, false],
  ['mobile-rm', 375, 812, true],
]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    hasTouch: w < 768,
    isMobile: w < 768,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => {
    // statický náhľad nemá /api/skore → 501 na POST je očakávané
    if (m.type() === 'error' && !/status of 501/.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  for (const path of ROUTES) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // python http.server občas resetne spojenie pri prvom náraze paralelných requestov → jedno opakovanie
    if (errors.some((e) => /ERR_CONNECTION_RESET|ERR_SOCKET_NOT_CONNECTED/.test(e))) {
      errors.length = 0;
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
    // počkať na hydratáciu ostrovov (Astro odstráni atribút ssr)
    await page.waitForSelector('astro-island:not([ssr])', { timeout: 10000 }).catch(() => {});
    const info = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      h1: document.querySelector('h1')?.textContent?.trim(),
      headings: [...document.querySelectorAll('h1,h2,h3')].map((e) => e.tagName + ':' + (e.textContent || '').trim().slice(0, 40)),
      island: !!document.querySelector('astro-island'),
      smallTargets: [...document.querySelectorAll('a,button,input,textarea')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.height < 44;
        })
        .map((el) => (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30) + ' ' + Math.round(el.getBoundingClientRect().width) + 'x' + Math.round(el.getBoundingClientRect().height)),
    }));
    const fails = [];
    if (errors.length) fails.push('errors: ' + errors.join(' | '));
    if (info.scrollW > info.clientW) fails.push(`horizontálny scroll ${info.scrollW} > ${info.clientW}`);
    if (info.smallTargets.length) fails.push('ciele < 44: ' + info.smallTargets.join(', '));
    // interakcia
    let interakcia = null;
    if (path === '/hry/skrtaci-test/') {
      await page.getByRole('button', { name: /škrtni/i }).click();
      await page.waitForTimeout(1200);
      interakcia = await page.evaluate(() => ({
        marks: document.querySelectorAll('mark.skrt').length,
        zostalo: document.querySelector('[aria-labelledby$="-zostalo"] p')?.textContent?.trim().slice(0, 80),
        pocitadla: [...document.querySelectorAll('dl dd')].map((d) => d.textContent?.trim()),
      }));
      if (!interakcia.marks) fails.push('ŠKRTNI nevytvoril žiadny mark.skrt');
      await page.screenshot({ path: `${out}/${slug(path)}-${name}-vysledok.png`, fullPage: true });
      // čistý text → 0 škrtov (konfety, lazy import) — bez chýb v konzole
      await page.getByRole('textbox').fill('Predaj držím osobne. Za mnou pracuje celý aparát.');
      await page.getByRole('button', { name: /škrtni/i }).click();
      await page.waitForTimeout(1500);
      interakcia.cisty = await page.evaluate(() => document.querySelectorAll('mark.skrt').length);
      if (interakcia.cisty !== 0) fails.push('čistý text (veta z Dňa 2) má škrty: ' + interakcia.cisty);
      // stiahnuť kartu → download event
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
        page.getByRole('button', { name: /stiahnuť kartu/i }).click(),
      ]);
      interakcia.download = download ? download.suggestedFilename() : null;
      if (download && name === 'desktop') await download.saveAs(`${out}/${slug(path)}-karta.png`);
      if (!download) fails.push('Stiahnuť kartu nevyvolalo download');
    }
    if (path === '/skore/') {
      await page.getByRole('textbox').fill('www.priklad.sk');
      await page.getByRole('button', { name: /zistiť skóre/i }).click();
      await page.waitForTimeout(1500);
      interakcia = await page.evaluate(() => document.querySelector('[role=alert]')?.textContent?.trim().slice(0, 120) ?? null);
      if (!interakcia) fails.push('/skore/ submit bez API neukázal chybovú hlášku');
      await page.screenshot({ path: `${out}/${slug(path)}-${name}-chyba.png`, fullPage: true });
      // výsledok: /api/skore podstrčené cez route (JSON z analyzéra nad fixtúrou) → merač, karty, klišé
      await page.route('**/api/skore', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify({ ok: true, url: 'https://priklad-realitka.sk/', orezane: false, ...FIXTURA }) }),
      );
      await page.getByRole('button', { name: /zistiť skóre/i }).click();
      await page.waitForTimeout(2000);
      const vysl = await page.evaluate(() => ({
        gauge: document.querySelector('svg[role=img]')?.getAttribute('aria-label'),
        verdikt: document.getElementById('skore-verdikt')?.textContent?.trim(),
        klise: document.querySelectorAll('mark').length,
        scrollW: document.documentElement.scrollWidth,
      }));
      if (!vysl.gauge || !vysl.verdikt) fails.push('výsledok /skore/ sa nevykreslil: ' + JSON.stringify(vysl));
      if (vysl.scrollW > info.clientW) fails.push('horizontálny scroll vo výsledku');
      interakcia = { chyba: interakcia, vysledok: vysl };
      await page.screenshot({ path: `${out}/${slug(path)}-${name}-vysledok.png`, fullPage: true });
      await page.unroute('**/api/skore');
      // späť na čistý stav pre hlavný screenshot
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
    }
    if (errors.length) fails.push('errors po interakcii: ' + errors.join(' | '));
    await page.screenshot({ path: `${out}/${slug(path)}-${name}.png`, fullPage: true });
    results[`${name} ${path}`] = { ...info, interakcia, fails };
    if (fails.length) failed++;
    errors.length = 0;
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
console.log(failed ? `ZLYHALO: ${failed}` : 'OK: všetko prešlo');
process.exit(failed ? 1 : 0);
