#!/usr/bin/env node
/** Export plánu Neviditeľný maklér do PDF (spec 05 §3 /makleri/plan/, pack 13 §2 „PDF export“).
 *  Kroky: npx astro build --outDir dist-makleri → python3 -m http.server 4182 -d dist-makleri/client →
 *  Google Chrome headless --print-to-pdf → public/makleri/neviditelny-makler-plan.pdf → server sa ukončí.
 *  Chrome beží s vlastným --user-data-dir (dočasný profil), aby sa nepripojil k otvorenému Chrome a PDF vždy zapísal;
 *  staré PDF sa pred exportom zmaže a nové sa overí podľa existencie + mtime. Overí, že PDF má > 20 kB a > 3 strany
 *  (počet /Type /Page bez /Pages). Spúšťať z koreňa repa:
 *    node scripts/export-makleri-pdf.mjs            (build + export)
 *    node scripts/export-makleri-pdf.mjs --no-build (len export z existujúceho dist-makleri) */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT_DIR = resolve(ROOT, 'dist-makleri');
const SERVE_DIR = resolve(OUT_DIR, 'client');
const PORT = Number(process.env.MAKLERI_PORT ?? 4182);
const PDF = resolve(ROOT, 'public/makleri/neviditelny-makler-plan.pdf');
const CHROME = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_PLAN = `http://127.0.0.1:${PORT}/makleri/plan/`;
const noBuild = process.argv.includes('--no-build');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', ...opts });
  if (res.status !== 0) throw new Error(`${cmd} ${args.join(' ')} skončil s kódom ${res.status}`);
}

async function waitFor(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      /* server ešte nebeží */
    }
    await sleep(250);
  }
  throw new Error(`server na ${url} nenabehol`);
}

function pdfStats(file) {
  const buf = readFileSync(file);
  const size = statSync(file).size;
  const txt = buf.toString('latin1');
  const pages = (txt.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
  return { size, pages };
}

/** Chrome spustí asynchrónne: čaká na hlášku „bytes written to file“ (alebo na hotový súbor), potom ho ukončí.
 *  Chrome 15x s čerstvým profilom po zápise PDF často neskončí sám (updater/crashpad), preto sa neblokuje na exit. */
async function printPdf(profile) {
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--user-data-dir=${profile}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-sync',
      '--disable-extensions',
      '--hide-scrollbars',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=8000',
      '--no-pdf-header-footer',
      `--print-to-pdf=${PDF}`,
      URL_PLAN,
    ],
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'] },
  );
  let written = false;
  let exited = false;
  chrome.stderr.on('data', (d) => {
    if (/bytes written to file/.test(String(d))) written = true;
  });
  chrome.on('exit', () => {
    exited = true;
  });
  const deadline = Date.now() + 90_000;
  while (!written && !exited && Date.now() < deadline) {
    if (existsSync(PDF) && statSync(PDF).size > 0) {
      const a = statSync(PDF).size;
      await sleep(500);
      if (existsSync(PDF) && statSync(PDF).size === a) written = true;
    } else {
      await sleep(250);
    }
  }
  if (!exited) {
    chrome.kill('SIGTERM');
    await sleep(500);
    if (!exited) chrome.kill('SIGKILL');
  }
  if (!written && !existsSync(PDF)) throw new Error('Chrome PDF nezapísal (časový limit 90 s)');
}

async function main() {
  if (!existsSync(CHROME)) throw new Error(`Chrome nenájdený: ${CHROME} (nastav CHROME_BIN)`);
  if (!noBuild) {
    console.log('▶ npx astro build --outDir dist-makleri');
    run('npx', ['astro', 'build', '--outDir', 'dist-makleri']);
  }
  if (!existsSync(resolve(SERVE_DIR, 'makleri/plan/index.html'))) {
    throw new Error(`chýba ${SERVE_DIR}/makleri/plan/index.html — spusti build`);
  }
  mkdirSync(resolve(ROOT, 'public/makleri'), { recursive: true });

  console.log(`▶ python3 -m http.server ${PORT} -d dist-makleri/client`);
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', SERVE_DIR, '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
  const profile = mkdtempSync(join(tmpdir(), 'makleri-pdf-'));
  rmSync(PDF, { force: true });
  const start = Date.now();
  try {
    await waitFor(URL_PLAN);
    console.log('▶ Chrome headless --print-to-pdf');
    await printPdf(profile);
  } finally {
    server.kill('SIGTERM');
    rmSync(profile, { recursive: true, force: true });
  }

  if (!existsSync(PDF)) throw new Error(`Chrome PDF nezapísal: ${PDF}`);
  if (statSync(PDF).mtimeMs < start) throw new Error('PDF je staršie ako začiatok exportu — Chrome ho neprepísal');
  const { size, pages } = pdfStats(PDF);
  console.log(`PDF: ${PDF}\n  ${(size / 1024).toFixed(1)} kB · ${pages} strán`);
  if (size <= 20 * 1024) throw new Error('PDF má ≤ 20 kB');
  if (pages <= 3) throw new Error('PDF má ≤ 3 strany');
  console.log('✓ PDF v poriadku');
}

main().catch((e) => {
  console.error('✗', e.message);
  process.exit(1);
});
