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
import { BLOCKS, CHARS, createRenderer, type Grid } from './ascii-engine';

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

    const ink = token('--color-ink') || '#111';
    const mobile = !matchMedia('(min-width: 1024px)').matches;
    const fontPx = 9; // jemná mriežka: písmená motta (160 px) majú ~15 riadkov, inak sa nedajú čítať
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

    /* atlas: 2 riadky (šum svetlý ASCII, veta plné bloky) × znaky */
    function buildAtlas(cw: number, ch: number, dpr: number): HTMLCanvasElement {
      const atlas = document.createElement('canvas');
      atlas.width = Math.ceil(cw * dpr) * Math.max(CHARS.length, BLOCKS.length);
      atlas.height = Math.ceil(ch * dpr) * 2;
      const a = atlas.getContext('2d')!;
      a.scale(dpr, dpr);
      a.textBaseline = 'middle';
      a.textAlign = 'center';
      for (let row = 0; row < 2; row++) {
        a.font = row === 0 ? `500 ${fontPx}px ${monoFamily}` : `400 ${Math.round(ch * 0.98)}px ${monoFamily}`;
        a.globalAlpha = row === 0 ? 0.16 : 1;
        a.fillStyle = ink;
        const set = row === 0 ? CHARS : BLOCKS;
        for (let i = 0; i < set.length; i++) {
          a.fillText(set[i]!, i * cw + cw / 2, row * ch + ch / 2);
        }
      }
      return atlas;
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
      return { grid: { ...gm, ...mask }, atlas };
    }

    async function startWorker(initial: { grid: Grid; atlas: HTMLCanvasElement }) {
      const off = canvas.transferControlToOffscreen();
      const bitmap = await createImageBitmap(initial.atlas);
      worker = new Worker(new URL('./ascii.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e: MessageEvent<{ type: string }>) => {
        if (e.data.type === 'ready') markReady();
      };
      worker.postMessage({ type: 'init', canvas: off, atlas: bitmap, grid: initial.grid, fps }, [off, bitmap, initial.grid.inside.buffer, initial.grid.threshold.buffer]);
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
        worker.postMessage({ type: 'grid', grid: next.grid, atlas: bitmap }, [bitmap, next.grid.inside.buffer, next.grid.threshold.buffer]);
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
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting && !document.hidden), { threshold: 0 });
    io.observe(section);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      alive = false;
      clearTimeout(mainTimer);
      clearTimeout(resizeTimer);
      worker?.postMessage({ type: 'stop' });
      worker?.terminate();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [host, motto, onReady]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />;
}
