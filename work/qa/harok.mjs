import { chromium } from 'playwright';
import fs from 'fs';
const dir = process.cwd() + '/work/referencie/top-2025';
const files = fs.readdirSync(dir).filter(f => f.endsWith('-a.jpg')).sort();
const html = `<body style="margin:0;background:#111;display:flex;flex-wrap:wrap;gap:8px;padding:8px;width:1608px;font:14px sans-serif;color:#fff">` +
  files.map(f => `<div style="width:392px"><img src="file://${dir}/${f}" style="width:392px;display:block"><div>${f}</div></div>`).join('') + `</body>`;
fs.writeFileSync(dir + '/../harok.html', html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1624, height: 800 } });
await p.goto('file://' + dir + '/../harok.html'); await p.waitForTimeout(800);
await p.screenshot({ path: dir + '/../harok-a.png', fullPage: true }); await b.close();
