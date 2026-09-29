/** V7-04 · rastrový kruh za triážnym lístkom (recept „halftone“ z kit/tvary/CanvasEfekty.tsx, skopírovaný a upravený).
 *  Canvas nad useCanvasEffect (pauza mimo obrazovky, reduced motion = jeden statický snímok). Farby = tokeny,
 *  prevedené na RGB cez 1 px canvas (žiadny hex). Ťažký efekt: iba ≥ 1024 px s myšou, inak statická CSS textúra.
 *  Ostrov: <Raster client:media="(min-width: 1024px)" /> */
import { useRef } from 'react';
import { useCanvasEffect } from '@/hooks/use-canvas-effect';
import { useMedia } from './stav';

type RGB = [number, number, number];
const cache = new Map<string, RGB>();
function rgbTokenu(meno: string): RGB {
  const hit = cache.get(meno);
  if (hit) return hit;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--color-${meno}`).trim();
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx || !raw) return [0, 0, 0];
  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  const rgb: RGB = [d[0]!, d[1]!, d[2]!];
  cache.set(meno, rgb);
  return rgb;
}
const css = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`;

function Platno({ pozadie, bodka, bunka }: { pozadie: string; bodka: string; bunka: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useCanvasEffect(ref, (ctx, canvas) => {
    const p = css(rgbTokenu(pozadie));
    const b = css(rgbTokenu(bodka));
    const s = Math.max(6, Math.round(bunka * 3 * (window.devicePixelRatio || 1)));
    let t = 0;
    return (dt) => {
      t += dt * 0.0006;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = p;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = b;
      for (let y = s / 2; y < h + s; y += s) {
        for (let x = s / 2; x < w + s; x += s) {
          const u = x / w;
          const v = y / h;
          const val = 0.5 + 0.25 * Math.sin(u * 9 + t * 1.4) + 0.25 * Math.sin(v * 7 - t + u * 4);
          const r = (s / 2) * Math.max(0.05, Math.min(1, val));
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
  });
  return <canvas ref={ref} className="block h-full w-full" />;
}

export default function Raster({ pozadie = 'white', bodka = 'ink', bunka = 4 }: { pozadie?: string; bodka?: string; bunka?: number }) {
  const mys = useMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
  if (!mys) return null;
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Platno pozadie={pozadie} bodka={bodka} bunka={bunka} />
    </div>
  );
}
