/** ASCII hero (Adam, 19. 9. večer): pozadie hera je mriežka znakov v Geist Mono, ktorú hýbe šumové pole
 *  (simplex 3D, tretia os = čas). Pod wordmarkom leží maska motta „DIVIDED, / WE ARE USELESS." — bunky vnútri
 *  písmen sa zo šumu stiahnu do plného inku a veta sa poskladá zo znakov, drží, rozpadne sa späť do šumu a znova
 *  sa poskladá. Slučka, nič nečaká na kurzor. Skutočný <p> s mottom ostáva v HTML (Google, čítačky), Hero ho pri
 *  aktívnom ASCII schová cez opacity (layout aj a11y ostávajú).
 *
 *  Technika: Canvas 2D, 0 kB knižníc. Render beží vo Web Workeri nad OffscreenCanvas (ascii.worker.ts) — hlavné vlákno
 *  robí len atlas znakov a masku, takže scroll (Lenis) a React nikdy nečakajú na kreslenie. Bez OffscreenCanvas
 *  (staré Safari) beží ten istý engine (ascii-engine.ts) na hlavnom vlákne pri nižšom fps. Maska: motto sa nakreslí do offscreen canvasu tým
 *  istým fontom, v tom istom obdĺžniku, kde stojí skrytý <p> (getBoundingClientRect riadkov), a pre každú bunku sa
 *  prečíta alfa v jej strede. Mobil: hrubšia mriežka, 20 fps. Pauza mimo viewportu a pri skrytej karte.
 *  Reduced motion: komponent sa nemontuje (Hero), motto ostáva statické. */
import { useEffect, useRef, type RefObject } from 'react';
import { ATLAS_ROWS, BLOCKS, CHARS, createRenderer, type Grid } from './ascii-engine';

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
  /** obrí wordmark — zdroj hmoty (hustota klesá od jeho spodnej hrany) */
  source: RefObject<HTMLElement | null>;
};

export default function Ascii({ host, motto, onReady, source }: AsciiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useRef(false);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const sectionEl = host.current;
    if (!canvasEl || !sectionEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const section: HTMLElement = sectionEl;

    const ink = token('--color-ink') || '#111';
    const yellow = token('--color-yellow') || '#FFE600';
    const mobile = !matchMedia('(min-width: 1024px)').matches;
    const fontPx = 11; // bunka ≈ 6,6 × 13 px: písmená motta (160 px) majú ~12 riadkov (čitateľné), hmota je viditeľná
    const hasWorker = typeof OffscreenCanvas !== 'undefined' && typeof Worker !== 'undefined';
    const fps = hasWorker ? 24 : 18;
    /* mobil: motto má 64 px = ~6 riadkov mriežky, z toho sa veta nedá čítať → ASCII je len šumové pozadie,
       typografické motto ostáva viditeľné (onReady sa nevolá) */
    const formMotto = !mobile;
    const monoFamily = token('--font-mono') || 'ui-monospace, monospace';
    const displayFamily = token('--font-display') || 'sans-serif';
    const measure = document.createElement('canvas').getContext('2d')!;

    let alive = true;
    let worker: Worker | null = null;
    let mainRenderer: ReturnType<typeof createRenderer> | null = null;
    let mainTimer = 0;
    let visible = true;
    const t0 = performance.now();

    const markReady = () => {
      if (!ready.current && formMotto && alive) {
        ready.current = true;
        onReady?.();
      }
    };

    /* geometria mriežky */
    function geometry() {
      const r = section.getBoundingClientRect();
      const W = Math.max(1, Math.round(r.width));
      const H = Math.max(1, Math.round(r.height));
      const dpr = Math.min(1.5, window.devicePixelRatio || 1); // 1,5 stačí na 9 px znaky, šetrí fill-rate
      measure.font = `500 ${fontPx}px ${monoFamily}`;
      const cw = measure.measureText('M').width || fontPx * 0.6;
      const ch = Math.round(fontPx * 1.18);
      return { W, H, dpr, cw, ch, cols: Math.ceil(W / cw), rows: Math.ceil(H / ch) };
    }

    /* atlas: riadok 0 ASCII znaky šumu (ink, alfa), riadok 1 bloky vety v inku (krytie), riadok 2 bloky v žltej */
    function buildAtlas(cw: number, ch: number, dpr: number): HTMLCanvasElement {
      const atlas = document.createElement('canvas');
      atlas.width = Math.ceil(cw * dpr) * Math.max(CHARS.length, BLOCKS.length);
      atlas.height = Math.ceil(ch * dpr) * ATLAS_ROWS;
      const a = atlas.getContext('2d')!;
      a.scale(dpr, dpr);
      a.textBaseline = 'middle';
      a.textAlign = 'center';
      a.font = `600 ${fontPx}px ${monoFamily}`;
      a.fillStyle = ink;
      a.globalAlpha = 0.46; // riadok 0: blízko zdroja
      for (let i = 0; i < CHARS.length; i++) a.fillText(CHARS[i]!, i * cw + cw / 2, ch / 2);
      a.globalAlpha = 0.2; // riadok 3: ďaleko od zdroja
      for (let i = 0; i < CHARS.length; i++) a.fillText(CHARS[i]!, i * cw + cw / 2, 3 * ch + ch / 2);
      // bloky ako obdĺžniky (nezávislé od fontu — glyf █ v niektorých fontoch nevyplní bunku a vznikajú pruhy)
      const krytie = [0, 0.25, 0.55, 0.8, 1];
      for (let i = 1; i < BLOCKS.length; i++) {
        a.fillStyle = ink;
        a.globalAlpha = krytie[i]!;
        a.fillRect(i * cw, ch, cw + 0.5, ch + 0.5);
        a.fillStyle = yellow;
        a.globalAlpha = 1;
        a.fillRect(i * cw, 2 * ch, cw + 0.5, ch + 0.5);
      }
      return atlas;
    }

    /* hustota hmoty: 1 pod wordmarkom, klesá so vzdialenosťou od jeho spodnej hrany (doprava a dole), min 0,12 */
    function buildDensity(cols: number, rows: number, cw: number, ch: number, W: number): Float32Array {
      const density = new Float32Array(cols * rows);
      const rect = section.getBoundingClientRect();
      const src = source.current?.getBoundingClientRect();
      const sx0 = src ? src.left - rect.left : 0;
      const sx1 = src ? src.right - rect.left : W * 0.6;
      const sy1 = src ? src.bottom - rect.top : rect.height * 0.35;
      const reach = W * 0.75;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = (x + 0.5) * cw;
          const py = (y + 0.5) * ch;
          const dx = px < sx0 ? sx0 - px : px > sx1 ? px - sx1 : 0;
          const dy = py > sy1 ? py - sy1 : (sy1 - py) * 0.6; // nad wordmarkom hmota redne pomalšie (je „za" ním)
          const d = Math.sqrt(dx * dx + dy * dy) / reach;
          density[y * cols + x] = Math.max(0.05, 1 - d * 1.7 + d * d * 0.5); // strmší spád: pod wordmarkom hmota, vpravo dole vzduch
        }
      }
      return density;
    }

    /* maska: motto tým istým fontom do offscreen canvasu, alfa v strede každej bunky */
    function buildMask(W: number, H: number, cols: number, rows: number, cw: number, ch: number) {
      const inside = new Uint8Array(cols * rows);
      const threshold = new Float32Array(cols * rows);
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
          const x = r.left - rect.left;
          const yMid = r.top - rect.top + r.height / 2;
          if (o.measureText(text).width <= r.width + 2 || r.height < size * 1.4) {
            o.fillText(text, x, yMid);
          } else {
            // zalomený riadok (úzke okno): po slovách
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
      return { inside, threshold };
    }

    function build(): { grid: Grid; atlas: HTMLCanvasElement } {
      const gm = geometry();
      canvas.style.width = `${gm.W}px`;
      canvas.style.height = `${gm.H}px`;
      const atlas = buildAtlas(gm.cw, gm.ch, gm.dpr);
      const mask = buildMask(gm.W, gm.H, gm.cols, gm.rows, gm.cw, gm.ch);
      const density = buildDensity(gm.cols, gm.rows, gm.cw, gm.ch, gm.W);
      return { grid: { ...gm, ...mask, density }, atlas };
    }

    async function startWorker(initial: { grid: Grid; atlas: HTMLCanvasElement }) {
      const off = canvas.transferControlToOffscreen();
      const bitmap = await createImageBitmap(initial.atlas);
      worker = new Worker(new URL('./ascii.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e: MessageEvent<{ type: string }>) => {
        if (e.data.type === 'ready') markReady();
      };
      worker.postMessage({ type: 'init', canvas: off, atlas: bitmap, grid: initial.grid, fps }, [off, bitmap, initial.grid.inside.buffer, initial.grid.threshold.buffer, initial.grid.density.buffer]);
    }

    function startMain(initial: { grid: Grid; atlas: HTMLCanvasElement }) {
      const { grid, atlas } = initial;
      canvas.width = Math.round(grid.W * grid.dpr);
      canvas.height = Math.round(grid.H * grid.dpr);
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;
      mainRenderer = createRenderer(ctx, atlas, grid);
      const tick = () => {
        if (!alive) return;
        mainTimer = window.setTimeout(tick, 1000 / fps);
        if (!visible || !mainRenderer) return;
        mainRenderer.frame((performance.now() - t0) / 1000);
        markReady();
      };
      tick();
    }

    async function resize() {
      const next = build();
      if (worker) {
        const bitmap = await createImageBitmap(next.atlas);
        worker.postMessage({ type: 'grid', grid: next.grid, atlas: bitmap }, [bitmap, next.grid.inside.buffer, next.grid.threshold.buffer, next.grid.density.buffer]);
      } else if (mainRenderer) {
        canvas.width = Math.round(next.grid.W * next.grid.dpr);
        canvas.height = Math.round(next.grid.H * next.grid.dpr);
        const ctx = canvas.getContext('2d', { alpha: true });
        if (ctx) mainRenderer = createRenderer(ctx, next.atlas, next.grid);
      }
    }

    let started = false;
    const start = () => {
      if (!alive || started) return;
      started = true;
      const initial = build();
      if (hasWorker) startWorker(initial).catch(() => startMain(build()));
      else startMain(initial);
    };
    if ('fonts' in document) document.fonts.ready.then(start);
    else start();

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      if (!alive || !started) return;
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => void resize(), 150);
    });
    ro.observe(section);
    const setVisible = (v: boolean) => {
      visible = v;
      worker?.postMessage({ type: 'visible', visible: v });
    };
    /* len viditeľnosť vo viewporte; skrytú kartu rieši prehliadač sám (rAF stojí) — document.hidden negatujeme,
       lebo vnorené prehliadače hlásia „hidden" aj pri zobrazenej stránke a ASCII by sa nikdy nespustilo */
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0 });
    io.observe(section);

    return () => {
      alive = false;
      clearTimeout(mainTimer);
      clearTimeout(resizeTimer);
      worker?.postMessage({ type: 'stop' });
      worker?.terminate();
      ro.disconnect();
      io.disconnect();
    };
  }, [host, motto, onReady, source]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />;
}
