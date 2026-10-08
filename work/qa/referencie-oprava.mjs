// Prefotenie webov, ktoré na prvý pokus ukázali intro, bránu alebo cookies.
import { chromium } from 'playwright';
const out = 'work/referencie/top-2025';
const weby = [
  ['01-immersive-garden', 'https://immersive-g.com/', { cakaj: 16000, klik: true, koliesko: 900 }],
  ['02-dropbox-brand', 'https://brand.dropbox.com/', { cakaj: 6000, cookies: true }],
  ['03-siena-film', 'https://siena.film/', { cakaj: 6000, enter: true, koliesko: 900 }],
  ['04-oryzo-ai', 'https://oryzo.ai/', { cakaj: 10000, koliesko: 1400 }],
  ['06-montfort', 'https://mont-fort.com/', { cakaj: 8000, cookies: true }],
  ['08-cartier', 'https://cartier-waw-0225.dev.60fps.fr/', { cakaj: 16000, klik: true, koliesko: 1600 }],
];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'] });
for (const [meno, url, o] of weby) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(o.cakaj);
    if (o.cookies) {
      for (const t of ['Deny', 'Decline', 'Reject all', 'Odmietnuť', 'Accept all', 'Allow all']) {
        const b = page.getByRole('button', { name: t }).first();
        if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); break; }
      }
      await page.waitForTimeout(1200);
    }
    if (o.enter) {
      const b = page.getByText(/enter/i).first();
      if (await b.isVisible().catch(() => false)) await b.click().catch(() => {});
      await page.waitForTimeout(5000);
    }
    if (o.klik) { await page.mouse.click(720, 450); await page.waitForTimeout(5000); }
    await page.mouse.move(900, 380); await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${meno}-a.jpg`, type: 'jpeg', quality: 82 });
    await page.mouse.wheel(0, o.koliesko || 1400); await page.waitForTimeout(3500);
    await page.screenshot({ path: `${out}/${meno}-b.jpg`, type: 'jpeg', quality: 82 });
    console.log('ok', meno);
  } catch (e) { console.log('chyba', meno, e.message.split('\n')[0]); }
  await page.close();
}
await browser.close();
