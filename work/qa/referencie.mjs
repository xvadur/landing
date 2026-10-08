// Snímky víťazov Awwwards Site of the Month 2025: prvá obrazovka a jedna obrazovka nižšie.
import { chromium } from 'playwright';
const weby = [
  ['01-immersive-garden', 'https://immersive-g.com/'],
  ['02-dropbox-brand', 'https://brand.dropbox.com/'],
  ['03-siena-film', 'https://siena.film/'],
  ['04-navigate', 'https://nvg8.io/'],
  ['05-animejs', 'https://animejs.com/'],
  ['06-montfort', 'https://mont-fort.com/'],
  ['07-tracing-art', 'https://www.getty.edu/tracingart/'],
  ['08-cartier', 'https://cartier-waw-0225.dev.60fps.fr/'],
  ['09-terminal-industries', 'https://terminal-industries.com/'],
  ['10-ponpon-mania', 'https://ponpon-mania.com/'],
  ['11-lando-norris', 'https://landonorris.com/'],
  ['12-mindmarket', 'https://mindmarket.com/'],
  ['13-bruno-simon', 'https://bruno-simon.com/'],
];
const out = 'work/referencie/top-2025';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'] });
for (const [meno, url] of weby) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(9000);
    await page.mouse.move(900, 380);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${meno}-a.jpg`, type: 'jpeg', quality: 82 });
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${out}/${meno}-b.jpg`, type: 'jpeg', quality: 82 });
    console.log('ok', meno);
  } catch (e) { console.log('chyba', meno, e.message.split('\n')[0]); }
  await page.close();
}
await browser.close();
