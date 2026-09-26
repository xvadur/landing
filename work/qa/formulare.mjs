// E2E formulárov V5 proti lokálnemu Workeru (XDR-210, XDR-211). Nič externé: wrangler dev s lokálnym KV.
//   npm run build && npx wrangler dev -c dist/server/wrangler.json --port 8787 --persist-to .wrangler/qa-state
//   node work/qa/formulare.mjs   (QA_BASE=http://127.0.0.1:8787)
// Testovacie údaje: meno „QA test“, e-mail qa+<čas>@xvadur.test (doména .test neexistuje, Resend lokálne nie je nastavený).
import { chromium } from 'playwright';
const base = process.env.QA_BASE ?? 'http://127.0.0.1:8787';
const ROOT = new URL('../../', import.meta.url).pathname;
const email = `qa+${Date.now()}@xvadur.test`;
const out = {};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => sessionStorage.setItem('opona', '1'));
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
let rezBody = null;
p.on('request', (r) => {
  if (r.url().includes('/api/rezervacia/')) rezBody = JSON.parse(r.postData() || '{}');
});

// 1) rezervácia z reklamy (UTM v URL)
await p.goto(base + '/?utm_source=qa&utm_campaign=v5-test#konzultacia', { waitUntil: 'networkidle' });
const sekcia = p.locator('#konzultacia');
await sekcia.scrollIntoViewIfNeeded();
await p.waitForSelector('#konzultacia form[aria-label="Rezervácia konzultácie"] fieldset button[aria-pressed]');
const casy = sekcia.locator('fieldset').nth(1).locator('button');
await casy.first().click();
const slot = await casy.first().textContent();
await sekcia.getByLabel('Meno').fill('QA test');
await sekcia.getByLabel('E-mail').fill(email);
await sekcia.getByLabel(/S akou úlohou/).fill('Automatický test rezervácie V5.');
await sekcia.getByRole('button', { name: 'Rezervovať termín' }).click();
await sekcia.getByRole('status').waitFor({ timeout: 10000 });
out.rezervacia = { slot, status: (await sekcia.getByRole('status').innerText()).split('\n').slice(0, 2).join(' | ') };
await sekcia.screenshot({ path: ROOT + 'work/screens/v5-qa-rezervacia-ok.png' });

// 2) čakačka produktu
const karta = p.locator('#ponuka article').filter({ hasText: 'Postav si prvého agenta' });
await karta.scrollIntoViewIfNeeded();
await karta.getByPlaceholder('tvoj@email.sk').fill(email);
await karta.getByRole('button', { name: 'Chcem vedieť ako prvý' }).click();
await karta.getByRole('status').waitFor({ timeout: 10000 });
out.cakacka = await karta.getByRole('status').innerText();

// 3) duplicitný zápis toho istého e-mailu → „už mám“
await p.reload({ waitUntil: 'networkidle' });
const karta2 = p.locator('#ponuka article').filter({ hasText: 'Postav si prvého agenta' });
await karta2.scrollIntoViewIfNeeded();
await karta2.getByPlaceholder('tvoj@email.sk').fill(email);
await karta2.getByRole('button', { name: 'Chcem vedieť ako prvý' }).click();
await karta2.getByRole('status').waitFor({ timeout: 10000 });
out.duplicita = await karta2.getByRole('status').innerText();

// 4) API: obsadený slot zmizol, zlý vstup dostane slovenskú chybu
const terminy = await (await fetch(base + '/api/terminy/')).json();
out.slotIso = rezBody?.slot;
out.slotZmizol = !!rezBody?.slot && !terminy.dni.flatMap((d) => d.sloty).includes(rezBody.slot);
const znova = await fetch(base + '/api/rezervacia/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slot: rezBody?.slot, meno: 'QA 2', email: 'qa2@xvadur.test' }) });
out.dvojitaRezervacia = [znova.status, (await znova.json()).chyba];
const zly = await fetch(base + '/api/zapis/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'nie-je-email', zdroj: 'cakacka', produkt: 'kohorta' }) });
out.zlyEmail = [zly.status, (await zly.json()).chyba];
out.errs = errs;
await b.close();
console.log(JSON.stringify(out, null, 2));
