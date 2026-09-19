/** ASCII hero (Adam, 19. 9. večer): pozadie hera je mriežka znakov v Geist Mono, ktorú hýbe šumové pole
 *  (simplex 3D, tretia os = čas). Pod wordmarkom leží maska motta „DIVIDED, / WE ARE USELESS." — bunky vnútri
 *  písmen sa zo šumu stiahnu do plného inku a veta sa poskladá zo znakov, drží, rozpadne sa späť do šumu a znova
 *  sa poskladá. Slučka, nič nečaká na kurzor. Skutočný <p> s mottom ostáva v HTML (Google, čítačky), Hero ho pri
 *  aktívnom ASCII schová cez opacity (layout aj a11y ostávajú).
 *
 *  Technika: Canvas 2D, 0 kB knižníc. Znaky sa raz vykreslia do atlasu (2 farby × 10 úrovní) a per frame ide len
 *  drawImage — ~18 k buniek (10 px mono) na 1440 px pri 30 fps je ~6 ms. Maska: motto sa nakreslí do offscreen canvasu tým
 *  istým fontom, v tom istom obdĺžniku, kde stojí skrytý <p> (getBoundingClientRect riadkov), a pre každú bunku sa
 *  prečíta alfa v jej strede. Mobil: hrubšia mriežka, 20 fps. Pauza mimo viewportu a pri skrytej karte.
 *  Reduced motion: komponent sa nemontuje (Hero), motto ostáva statické. */
import { useEffect, useRef, type RefObject } from 'react';

const CHARS = ' .:-=+*#%@';
/** zložená veta: blokové znaky (vypĺňajú bunku, ťah písmena je plný); v Geist Mono chýbajú → padne to na Menlo/ui-monospace */
const BLOCKS = ' ░▒▓█';
/** slučka v sekundách: skladanie → drží → rozpad → šum */
const FORM = 2.2;
const HOLD = 6.0;
const DISSOLVE = 1.6;
const NOISE = 1.4;
const CYCLE = FORM + HOLD + DISSOLVE + NOISE;

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

/* ---------- pomocné ---------- */
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export type AsciiProps = {
  /** sekcia hera — canvas ju vyplní, súradnice masky sú relatívne k nej */
  host: RefObject<HTMLElement | null>;
  /** skrytý <p> s mottom — jeho riadky (.block) určujú, kde sa veta skladá */
  motto: RefObject<HTMLParagraphElement | null>;
  /** prvý vykreslený frame → Hero schová typografické motto */
  onReady?: () => void;
};

export default function Ascii({ host, motto, onReady }: AsciiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useRef(false);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const sectionEl = host.current;
    if (!canvasEl || !sectionEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const section: HTMLElement = sectionEl;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const ink = token('--color-ink') || '#111';
    const mobile = !matchMedia('(min-width: 1024px)').matches;
    const fontPx = mobile ? 9 : 9; // jemná mriežka: písmená motta (160 px) majú ~15 riadkov, inak sa nedajú čítať
    const fps = mobile ? 24 : 30;
    /* mobil: motto má 64 px = ~6 riadkov mriežky, z toho sa veta nedá čítať → ASCII je len šumové pozadie,
       typografické motto ostáva viditeľné (onReady sa nevolá) */
    const formMotto = !mobile;
    const monoFamily = token('--font-mono') || 'ui-monospace, monospace';
    const displayFamily = token('--font-display') || 'sans-serif';
    const noise = makeNoise(20260919);

    let cols = 0, rows = 0, cw = 0, ch = 0, dpr = 1, W = 0, H = 0;
    let inside = new Uint8Array(0);
    let threshold = new Float32Array(0);
    let atlas: HTMLCanvasElement | null = null;
    let raf = 0;
    let last = 0;
    let visible = true;
    let alive = true;
    const t0 = performance.now();

    /* atlas: 2 riadky (šum svetlý, veta plný ink) × 10 znakov */
    function buildAtlas() {
      atlas = document.createElement('canvas');
      atlas.width = Math.ceil(cw * dpr) * Math.max(CHARS.length, BLOCKS.length);
      atlas.height = Math.ceil(ch * dpr) * 2;
      const a = atlas.getContext('2d')!;
      a.scale(dpr, dpr);
      a.textBaseline = 'middle';
      a.textAlign = 'center';
      for (let row = 0; row < 2; row++) {
        // riadok 1 (veta): blokové znaky vo výške bunky → plný ťah písmena
        a.font = row === 0 ? `500 ${fontPx}px ${monoFamily}` : `400 ${Math.round(ch * 0.98)}px ${monoFamily}`;
        a.globalAlpha = row === 0 ? 0.16 : 1;
        a.fillStyle = ink;
        const set = row === 0 ? CHARS : BLOCKS;
        for (let i = 0; i < set.length; i++) {
          a.fillText(set[i]!, i * cw + cw / 2, row * ch + ch / 2);
        }
      }
    }

    /* maska: motto tým istým fontom do offscreen canvasu, alfa v strede každej bunky */
    function buildMask() {
      inside = new Uint8Array(cols * rows);
      threshold = new Float32Array(cols * rows);
      const p = motto.current;
      const rect = section.getBoundingClientRect();
      const off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      const o = off.getContext('2d')!;
      o.fillStyle = '#000';
      o.textBaseline = 'middle';
      if (p && formMotto) {
        const cs = getComputedStyle(p);
        const size = parseFloat(cs.fontSize);
        const weight = cs.fontWeight || '800';
        o.font = `${weight} ${size}px ${displayFamily}`;
        try { (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing; } catch { /* starý prehliadač */ }
        p.querySelectorAll<HTMLElement>(':scope > span').forEach((line) => {
          const r = line.getBoundingClientRect();
          const text = line.textContent ?? '';
          // riadok môže byť zalomený (mobil): kreslíme po slovách, keď sa text nezmestí do šírky riadku
          const x = r.left - rect.left;
          const yMid = r.top - rect.top + r.height / 2;
          if (o.measureText(text).width <= r.width + 2 || r.height < size * 1.4) {
            o.fillText(text, x, yMid);
          } else {
            const words = text.split(' ');
            const lineH = r.height / Math.max(1, Math.round(r.height / (size * 0.86)));
            let cur = '';
            let ly = r.top - rect.top + lineH / 2;
            for (const w of words) {
              const trial = cur ? `${cur} ${w}` : w;
              if (o.measureText(trial).width > r.width && cur) {
                o.fillText(cur, x, ly);
                ly += lineH;
                cur = w;
              } else cur = trial;
            }
            if (cur) o.fillText(cur, x, ly);
          }
        });
      }
      const data = o.getImageData(0, 0, W, H).data;
      let seed = 7;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = Math.min(W - 1, Math.floor((x + 0.5) * cw));
          const py = Math.min(H - 1, Math.floor((y + 0.5) * ch));
          const idx = y * cols + x;
          inside[idx] = data[(py * W + px) * 4 + 3]! > 90 ? 1 : 0;
          seed = (seed * 1664525 + 1013904223) >>> 0;
          threshold[idx] = (seed % 1000) / 1000;
        }
      }
    }

    function resize() {
      const r = section.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.font = `500 ${fontPx}px ${monoFamily}`;
      cw = ctx!.measureText('M').width || fontPx * 0.6;
      ch = Math.round(fontPx * 1.18);
      cols = Math.ceil(W / cw);
      rows = Math.ceil(H / ch);
      buildAtlas();
      buildMask();
    }

    /* fáza slučky → miera zloženia 0…1 */
    function assembled(sec: number): number {
      const t = sec % CYCLE;
      if (t < FORM) return easeInOut(t / FORM);
      if (t < FORM + HOLD) return 1;
      if (t < FORM + HOLD + DISSOLVE) return 1 - easeInOut((t - FORM - HOLD) / DISSOLVE);
      return 0;
    }

    function frame(now: number) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (now - last < 1000 / fps) return;
      last = now;
      const sec = (now - t0) / 1000;
      const a = assembled(sec);
      const z = sec * 0.22;
      ctx!.clearRect(0, 0, W, H);
      const aw = Math.ceil(cw * dpr);
      const ah = Math.ceil(ch * dpr);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          const n = noise(x * cw * 0.0068, y * ch * 0.0068, z); // −1…1 v pixelových súradniciach (nezávislé od mriežky)
          let level = (n + 1) * 0.5; // 0…1
          let row = 0;
          let ci: number;
          if (inside[idx] && a > threshold[idx]!) {
            // zložený znak: ▓ alebo █ podľa jemného šumu (živý, ale plný ťah)
            row = 1;
            ci = noise(x * 0.35, y * 0.7, z * 3) > 0.15 ? 3 : 4;
          } else {
            // šum: svetlé znaky, hustejšie okolo písmen počas skladania
            level = level * 0.5;
            if (inside[idx]) level = Math.min(1, level + a * 0.3);
            ci = Math.min(CHARS.length - 1, Math.max(0, Math.round(level * (CHARS.length - 1))));
          }
          if (ci === 0) continue;
          ctx!.drawImage(atlas!, ci * aw, row * ah, aw, ah, x * cw, y * ch, cw, ch);
        }
      }
      if (!ready.current && formMotto) {
        ready.current = true;
        onReady?.();
      }
    }

    const start = () => {
      resize();
      raf = requestAnimationFrame(frame);
    };
    if ('fonts' in document) document.fonts.ready.then(() => alive && start());
    else start();

    const ro = new ResizeObserver(() => { if (alive && atlas) resize(); });
    ro.observe(section);
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting && !document.hidden; }, { threshold: 0 });
    io.observe(section);
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [host, motto, onReady]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />;
}
