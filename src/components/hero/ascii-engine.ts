/** ASCII engine — čistá logika bez DOM: simplex šum, slučka skladania a render jedného framu do 2D kontextu.
 *  Beží vo Web Workeri nad OffscreenCanvas (ascii.worker.ts) alebo, kde OffscreenCanvas nie je, na hlavnom vlákne
 *  (Ascii.tsx). Atlas znakov aj maska motta vznikajú na hlavnom vlákne (potrebujú fonty a DOM) a posielajú sa sem.
 *  Výkon: šum sa počíta na polovičnej mriežke (2×2 bunky zdieľajú hodnotu → 4× menej simplexu), jeden šum na bunku,
 *  drawImage z atlasu; ~15 k buniek (11 px) na 1440 px pri 24 fps mimo hlavného vlákna = žiadny jank pri scrolle.
 *  Kompozícia (20. 9., Adam): wordmark XVADUR je zdroj — hustota znakov je najvyššia pod ním a rozptyľuje sa doprava
 *  a dole (density); motto je do hmoty vyrezané (v šume = prázdny papier), pri skladaní sa vyplní blokmi v inku so
 *  žltými zrnami; pri rozpade sa rozpadá len motto, wordmark (vektor mimo canvasu) ostáva celý. */

export const CHARS = ' .:;+*#%@'; // bez „-“ a „=“: vodorovné čiarky robili z pozadia pruhy
/** zložená veta: blokové znaky (vypĺňajú bunku, ťah písmena je plný); v Geist Mono chýbajú → padne to na Menlo/ui-monospace */
export const BLOCKS = ' ░▒▓█';
/** slučka v sekundách: skladanie → drží → rozpad → šum */
export const FORM = 2.2;
export const HOLD = 6.0;
export const DISSOLVE = 1.6;
export const NOISE = 1.4;
export const CYCLE = FORM + HOLD + DISSOLVE + NOISE;

/* ---------- simplex 3D (Gustavson / Ashima, kompaktný port) ---------- */
const GRAD3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];
function makeNoise(seed: number) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = seed >>> 0;
  for (let i = 255; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const t = p[i]!;
    p[i] = p[j]!;
    p[j] = t;
  }
  const perm = new Uint8Array(512);
  const permMod = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]!;
    permMod[i] = perm[i]! % 12;
  }
  const F3 = 1 / 3;
  const G3 = 1 / 6;
  return (xin: number, yin: number, zin: number): number => {
    const s0 = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s0);
    const j = Math.floor(yin + s0);
    const k = Math.floor(zin + s0);
    const t = (i + j + k) * G3;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);
    const z0 = zin - (k - t);
    let i1: number, j1: number, k1: number, i2: number, j2: number, k2: number;
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }
    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    let n = 0;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) { const g = GRAD3[permMod[ii + perm[jj + perm[kk]!]!]!]!; t0 *= t0; n += t0 * t0 * (g[0]! * x0 + g[1]! * y0 + g[2]! * z0); }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0) { const g = GRAD3[permMod[ii + i1 + perm[jj + j1 + perm[kk + k1]!]!]!]!; t1 *= t1; n += t1 * t1 * (g[0]! * x1 + g[1]! * y1 + g[2]! * z1); }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0) { const g = GRAD3[permMod[ii + i2 + perm[jj + j2 + perm[kk + k2]!]!]!]!; t2 *= t2; n += t2 * t2 * (g[0]! * x2 + g[1]! * y2 + g[2]! * z2); }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0) { const g = GRAD3[permMod[ii + 1 + perm[jj + 1 + perm[kk + 1]!]!]!]!; t3 *= t3; n += t3 * t3 * (g[0]! * x3 + g[1]! * y3 + g[2]! * z3); }
    return 32 * n; // −1 … 1
  };
}


function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
/** fáza slučky → miera zloženia 0…1 */
export function assembled(sec: number): number {
  const t = sec % CYCLE;
  if (t < FORM) return easeInOut(t / FORM);
  if (t < FORM + HOLD) return 1;
  if (t < FORM + HOLD + DISSOLVE) return 1 - easeInOut((t - FORM - HOLD) / DISSOLVE);
  return 0;
}

export type Grid = {
  W: number;
  H: number;
  dpr: number;
  cols: number;
  rows: number;
  cw: number;
  ch: number;
  /** 1 = bunka je vnútri písmena motta */
  inside: Uint8Array;
  /** náhoda 0…1 na bunku: poradie skladania, jitter šumu, žlté zrná */
  threshold: Float32Array;
  /** hustota poľa 0…1 na bunku: 1 pod wordmarkom (zdroj), klesá s vzdialenosťou doprava a dole */
  density: Float32Array;
};

/** Atlas: riadok 0 = ASCII znaky šumu blízko zdroja (tmavšie), 1 = bloky vety v inku (BLOCKS, krytie), 2 = bloky v žltej,
 *  3 = ASCII znaky šumu ďaleko od zdroja (svetlé). */
export const ATLAS_ROWS = 4;

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type Atlas = CanvasImageSource;

export function createRenderer(ctx: Ctx2D, atlas: Atlas, grid: Grid) {
  const noise = makeNoise(20260919);
  let g = grid;
  const half = { cols: 0, rows: 0, buf: new Float32Array(0) };
  const setGrid = (ng: Grid) => {
    g = ng;
    half.cols = Math.ceil(g.cols / 2);
    half.rows = Math.ceil(g.rows / 2);
    half.buf = new Float32Array(half.cols * half.rows);
    ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
  };
  setGrid(grid);

  const frame = (sec: number) => {
    const { W, H, dpr, cols, rows, cw, ch, inside, threshold, density } = g;
    const a = assembled(sec);
    const z = sec * 0.22;
    // šum na polovičnej mriežke, v pixelových súradniciach (nezávislé od hustoty mriežky)
    const sx = cw * 2 * 0.0062;
    const sy = ch * 2 * 0.0062;
    for (let hy = 0; hy < half.rows; hy++) {
      for (let hx = 0; hx < half.cols; hx++) {
        half.buf[hy * half.cols + hx] = noise(hx * sx, hy * sy, z);
      }
    }
    ctx.clearRect(0, 0, W, H);
    const aw = Math.ceil(cw * dpr);
    const ah = Math.ceil(ch * dpr);
    const maxC = CHARS.length - 1;
    for (let y = 0; y < rows; y++) {
      const hrow = (y >> 1) * half.cols;
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        const n = half.buf[hrow + (x >> 1)]!; // −1…1
        const r = threshold[idx]!;
        const dens = density[idx]!;
        let row = 0;
        let ci: number;
        if (inside[idx]) {
          if (a > r) {
            // zložené: blok vety; ~14 % buniek žlté zrná (farba tieňa wordmarku), zvyšok ink plný / 0,8
            row = r > 0.86 ? 2 : 1;
            ci = row === 2 ? 4 : n > 0.5 ? 3 : 4;
          } else {
            // nezložené = vyrezané do hmoty: písmeno je prázdny papier (negatív)
            continue;
          }
        } else {
          // hmota: hustota podľa vzdialenosti od wordmarku × šum, per-bunkový jitter rozbíja runy
          const nj = n + (r - 0.5) * 0.5;
          const level = (nj + 1) * 0.5 * (0.1 + 0.9 * dens);
          if (level < 0.14) continue;
          row = dens > 0.5 ? 0 : 3; // blízko wordmarku tmavšie znaky, ďalej svetlé
          ci = Math.min(maxC, Math.max(1, Math.round(level * maxC)));
        }
        ctx.drawImage(atlas, ci * aw, row * ah, aw, ah, x * cw, y * ch, cw, ch);
      }
    }
  };

  return { frame, setGrid };
}
