// Výrez postavy z portrétu na jednofarebnom svetlom pozadí: záplava od okrajov (pozadie = svetlé a málo sýte),
// potom zjemnenie hrany. node work/qa/vyrez.mjs <vstup.png> <výstup.webp> [šírka]
import sharp from 'sharp';
const [, , vstup, vystup, sirka = '1100'] = process.argv;
const { data, info } = await sharp(vstup).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const jePozadie = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const svetlost = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  const sytost = max === 0 ? 0 : (max - min) / max;
  return svetlost > 0.86 && sytost < 0.2;
};
const maska = new Uint8Array(w * h); // 1 = pozadie
const fronta = new Int32Array(w * h); let hlava = 0, chvost = 0;
const skus = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const p = y * w + x; if (maska[p]) return; if (!jePozadie(p * 4)) return; maska[p] = 1; fronta[chvost++] = p; };
for (let x = 0; x < w; x++) { skus(x, 0); }
for (let y = 0; y < h; y++) { skus(0, y); skus(w - 1, y); }
while (hlava < chvost) { const p = fronta[hlava++]; const x = p % w, y = (p - x) / w; skus(x + 1, y); skus(x - 1, y); skus(x, y + 1); skus(x, y - 1); }
const alfa = Buffer.alloc(w * h);
for (let p = 0; p < w * h; p++) alfa[p] = maska[p] ? 0 : 255;
const jemna = await sharp(alfa, { raw: { width: w, height: h, channels: 1 } }).blur(1.2).toColourspace('b-w').raw().toBuffer({ resolveWithObject: true });
const k = jemna.info.channels; // sharp môže vrátiť viac kanálov, čítame prvý
for (let p = 0; p < w * h; p++) data[p * 4 + 3] = Math.min(alfa[p], jemna.data[p * k]);
await sharp(data, { raw: { width: w, height: h, channels: 4 } }).resize(Number(sirka)).webp({ quality: 88, alphaQuality: 90 }).toFile(vystup);
const podiel = (chvost / (w * h) * 100).toFixed(1);
console.log(`výrez ${w}x${h}, pozadie ${podiel} %, uložené ${vystup}`);
