// QA /konzultacia/, /texty/, /texty/co-zostane-ked-zavriem-chat/ — desktop 1440×900, mobil 375×812, reduced motion.
// Kontroly: console/page errory, scrollWidth ≤ viewport, ciele ≥ 44 px, ids, formulár → payload.
import { chromium } from 'playwright';
const out = process.argv[2] ?? 'work/screens';
const base = 'http://127.0.0.1:4184';
const routes = ['/konzultacia/', '/texty/', '/texty/co-zostane-ked-zavriem-chat/'];
const browser = await chromium.launch();
const results = {};
let fail = 0;
for (const [name, w, h, reduced] of [['desktop', 1440, 900, false], ['mobile', 375, 812, false], ['reduced', 1440, 900, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: w < 768, isMobile: w < 768 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  for (const path of routes) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    if (errors.some((e) => /ERR_CONNECTION_RESET/.test(e))) {
      // python http.server občas zhodí spojenie — nie je to chyba stránky; jeden opakovaný pokus
      errors.length = 0;
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
    const info = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
      h1: document.querySelector('h1')?.textContent?.trim(),
      headings: [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName).join(' '),
      ids: ['priebeh','otazky','riesenie','vstup','formular'].filter(id => document.getElementById(id)).join(','),
      smallTargets: [...document.querySelectorAll('a,button,[role=button]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); }).map(el => (el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,30) + ' ' + Math.round(el.getBoundingClientRect().width)+'x'+Math.round(el.getBoundingClientRect().height)),
      imgsNoAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
      inputsNoLabel: [...document.querySelectorAll('input,textarea,select,[role=combobox]')].filter(el => el.getAttribute('aria-hidden') !== 'true').filter(el => !(el.id && document.querySelector(`label[for="${el.id}"]`)) && !el.getAttribute('aria-label')).map(el => el.id || el.tagName),
    }));
    // filtrovať prefetch 404 na cesty iných agentov (známe, zmizne keď vzniknú)
    const errs = errors.filter(e => !/Failed to load resource.*404/.test(e));
    const bad = errs.length || info.scrollW > info.clientW || info.smallTargets.length;
    if (bad) fail++;
    results[`${name} ${path}`] = { ...info, errors: errs, ignored404: errors.length - errs.length };
    errors.length = 0;
    const slug = path === '/konzultacia/' ? 'konzultacia' : path === '/texty/' ? 'texty' : 'clanok';
    await page.screenshot({ path: `${out}/konzultacia-${slug}-${name}.png`, fullPage: true });
  }

  // formulár: prefill z kvízu + odoslanie → payload
  if (name !== 'reduced') {
    // skutočný kontrakt kvízu (src/components/kviz/logika.ts konzultaciaUrl): kto=<segment slug>, krok=<slug kroku>
    await page.goto(base + '/konzultacia/?z=kviz&kto=firma&hodiny=6&sadzba=40&krok=kontext-prompt', { waitUntil: 'networkidle' });
    await page.locator('#formular').scrollIntoViewIfNeeded();
    await page.waitForSelector('astro-island:not([ssr]) form', { timeout: 10000 });
    await page.waitForTimeout(300);
    const badge = await page.locator('[data-zdroj]').isVisible();
    const badgeText = await page.locator('[data-zdroj]').textContent();
    const ktoText = await page.locator('#intake-kto').inputValue();
    const krokBlok = await page.locator('form dd').allTextContents();
    const LONG_URL = 'https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789/edit';
    await page.locator('#intake-uloha').fill('Po hovore s klientom prepisujem poznámky do ponuky.');
    await page.locator('#intake-nastroje').fill(LONG_URL);
    await page.getByRole('button', { name: /Pripraviť správu/ }).click();
    await page.waitForTimeout(500);
    const payload = await page.locator('#intake-vysledok pre').textContent();
    const wa = await page.locator('#intake-vysledok a', { hasText: 'WhatsApp' }).getAttribute('href');
    const mail = await page.locator('#intake-vysledok a', { hasText: 'e-mail' }).getAttribute('href');
    // fokus po odoslaní musí byť vo výsledku (nie na <body>); karta a tlačidlá nesmú pretiecť viewport ani pri dlhej URL
    const focusPoSubmit = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
    const pretecenie = await page.evaluate((w) => {
      const els = [document.getElementById('intake-vysledok'), ...document.querySelectorAll('#intake-vysledok a, #intake-vysledok button, #intake-vysledok pre')];
      return els.filter(Boolean).map(el => Math.round(el.getBoundingClientRect().right)).filter(r => r > w);
    }, w);
    await page.screenshot({ path: `${out}/konzultacia-formular-${name}.png`, fullPage: false });
    await page.getByRole('button', { name: /Upraviť odpovede/ }).click();
    await page.waitForTimeout(200);
    const focusPoUprave = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
    // prázdna úloha → chyba
    await page.goto(base + '/konzultacia/', { waitUntil: 'networkidle' });
    // client:visible (rootMargin 600 px): bez doscrollovania sa ostrov nehydratuje — to je zámer (rozpočet JS)
    const hydratovanyBezScrollu = await page.evaluate(() => !!document.querySelector('astro-island:not([ssr]) form'));
    await page.locator('#formular').scrollIntoViewIfNeeded();
    await page.waitForSelector('astro-island:not([ssr]) form', { timeout: 10000 });
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Pripraviť správu/ }).click();
    const alert = await page.locator('[role=alert]').textContent().catch(() => null);
    // farba chyby = ink (ako body), nie hot (3,67:1 na bielej) — kontrast AA
    const alertColor = await page.locator('[role=alert]').evaluate(el => getComputedStyle(el).color + ' | body ' + getComputedStyle(document.body).color).catch(() => null);
    const alertJeInk = alertColor ? alertColor.split(' | body ')[0] === alertColor.split(' | body ')[1] : false;
    const badgeHidden = await page.locator('[data-zdroj]').isHidden();
    results[`${name} formular`] = { hydratovanyBezScrollu, badge, badgeText, ktoText, krokBlok, payload, wa: wa?.slice(0, 60), mail: mail?.slice(0, 70), focusPoSubmit, focusPoUprave, pretecenie, alert, alertColor, badgeHiddenBezZ: badgeHidden, errors: errors.filter(e => !/404/.test(e)) };
    const reasons = [
      !badge && 'badge',
      badgeText !== 'Prichádzaš z kvízu' && 'badge-text',
      !payload?.includes('Z kvízu na xvadur.com: hodiny týždenne: 6 h, sadzba: 40 €/h, navrhnutý prvý krok: Kontext + prompt/skill + kontrola.') && 'payload-kviz',
      payload?.includes('..') && 'payload-dvojbodka',
      !payload?.includes('Kto som: Firma') && 'prefill-kto',
      !wa?.startsWith('https://wa.me/?text=') && 'wa',
      !mail?.startsWith('mailto:adam@xvadur.com?subject=Konzult') && 'mail',
      focusPoSubmit !== 'intake-vysledok' && 'focus-submit',
      focusPoUprave !== 'intake-uloha' && 'focus-uprava',
      pretecenie.length > 0 && 'pretecenie',
      !alert && 'alert',
      !alertJeInk && 'alert-color',
      !badgeHidden && 'badgeHidden',
      hydratovanyBezScrollu && 'hydratacia-bez-scrollu',
    ].filter(Boolean);
    results[`${name} formular`].reasons = reasons;
    if (reasons.length) fail++;
    errors.length = 0;
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
console.log(fail ? `FAIL ${fail}` : 'OK');
process.exit(fail ? 1 : 0);
