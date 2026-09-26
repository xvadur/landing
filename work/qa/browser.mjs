// Spoločné spustenie Chromia pre QA skripty. Playwright 1.63 čaká revíziu, ktorá v cloudovom kontajneri nie je
// stiahnutá (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1); tam beží predinštalovaný Chromium z /opt/pw-browsers.
// Lokálne (Mac) sa použije bežný Playwright Chromium. Prepísať cez CHROMIUM_PATH=/cesta/k/chrome.
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const CANDIDATES = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean);

export async function launch(options = {}) {
  const executablePath = CANDIDATES.find((p) => existsSync(p));
  try {
    return await chromium.launch(options);
  } catch (e) {
    if (!executablePath) throw e;
    return chromium.launch({ ...options, executablePath });
  }
}
