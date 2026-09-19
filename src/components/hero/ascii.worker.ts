/** Web Worker pre ASCII hero: dostane OffscreenCanvas + atlas (ImageBitmap) + mriežku, kreslí slučku mimo hlavného
 *  vlákna. Správy: init · grid (resize) · visible · stop. Odpoveď: ready (prvý frame). */
import { createRenderer, type Grid } from './ascii-engine';

type Init = { type: 'init'; canvas: OffscreenCanvas; atlas: ImageBitmap; grid: Grid; fps: number };
type Msg = Init | { type: 'grid'; grid: Grid; atlas: ImageBitmap } | { type: 'visible'; visible: boolean } | { type: 'stop' };

let renderer: ReturnType<typeof createRenderer> | null = null;
let canvas: OffscreenCanvas | null = null;
let timer = 0;
let visible = true;
let alive = true;
let readySent = false;
const t0 = performance.now();

function loop(fps: number) {
  const tick = () => {
    if (!alive) return;
    timer = setTimeout(tick, 1000 / fps) as unknown as number;
    if (!visible || !renderer) return;
    renderer.frame((performance.now() - t0) / 1000);
    if (!readySent) {
      readySent = true;
      postMessage({ type: 'ready' });
    }
  };
  tick();
}

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  if (m.type === 'init') {
    canvas = m.canvas;
    canvas.width = Math.round(m.grid.W * m.grid.dpr);
    canvas.height = Math.round(m.grid.H * m.grid.dpr);
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    renderer = createRenderer(ctx, m.atlas, m.grid);
    loop(m.fps);
  } else if (m.type === 'grid') {
    if (!canvas || !renderer) return;
    canvas.width = Math.round(m.grid.W * m.grid.dpr);
    canvas.height = Math.round(m.grid.H * m.grid.dpr);
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    renderer = createRenderer(ctx, m.atlas, m.grid);
  } else if (m.type === 'visible') {
    visible = m.visible;
  } else if (m.type === 'stop') {
    alive = false;
    clearTimeout(timer);
  }
};
