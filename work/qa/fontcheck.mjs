import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto('http://localhost:4191/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
console.log(await p.evaluate(() => {
  const pEl = document.querySelector('section[aria-label="Úvod"] p[lang=en]');
  const span = pEl.querySelectorAll(':scope > span')[1];
  const cs = getComputedStyle(pEl);
  const fam = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim();
  const c = document.createElement('canvas').getContext('2d');
  const f = `${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${fam}`;
  c.font = f;
  const out = { domWidth: span.getBoundingClientRect().width, fontString: f, canvasFontAfterSet: c.font, canvasWidth: c.measureText(span.textContent).width,
    check: document.fonts.check(`800 100px 'Bricolage Grotesque Variable'`), loaded: [...document.fonts].filter(x=>x.status==='loaded').map(x=>x.family+':'+x.weight+':'+x.stretch).slice(0,8) };
  c.letterSpacing = cs.letterSpacing; out.canvasWidthLS = c.measureText(span.textContent).width; out.ls = cs.letterSpacing;
  return out;
}));
await b.close();
