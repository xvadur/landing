/** V7-07 · halftone canvas efekt (poistka za Higgsfield dolly chodbou): rastrové bodky, polomer podľa vlny, ktorá
 *  beží do strany ako svetlá na chodbe. Skopírované a upravené z katalógu (v7/kit/tvary/CanvasEfekty.tsx, recept
 *  halftone) nad BoldKit jadrom useCanvasEffect (pauza mimo obrazovky, reduced motion = jeden statický snímok).
 *  Farby = tokeny prevedené na RGB za behu (žiadny hex). */
import * as React from 'react';
import { useCanvasEffect } from '@/hooks/use-canvas-effect';
import { cn } from '@/lib/utils';

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
const css = (c: RGB) => `rgb(${c[0]} ${c[1]} ${c[2]})`;

export function Halftone({ className, pozadie = 'ink', bodka = 'yellow', bunka = 7 }: { className?: string; pozadie?: string; bodka?: string; bunka?: number }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  useCanvasEffect(ref, (ctx, canvas) => {
    const bg = rgbTokenu(pozadie);
    const fg = rgbTokenu(bodka);
    const s = Math.max(6, Math.round(bunka * (window.devicePixelRatio || 1))) * 2;
    let t = 0;
    return (dt) => {
      t += dt * 0.001;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = css(bg);
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = css(fg);
      for (let y = s / 2; y < h + s; y += s) {
        for (let x = s / 2; x < w + s; x += s) {
          const u = x / w;
          const v = y / h;
          // perspektíva chodby: bodky rastú k podlahe a k stredu, vlna beží doprava
          const hlbka = 0.35 + 0.65 * Math.abs(v - 0.5) * 2;
          const val = hlbka * (0.45 + 0.3 * Math.sin(u * 14 - t * 1.6) + 0.25 * Math.sin(v * 6 + t * 0.7));
          const r = (s / 2) * Math.max(0.04, Math.min(0.95, val));
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
  });
  return (
    <div className={cn('pointer-events-none overflow-hidden', className)} aria-hidden="true">
      <canvas ref={ref} className="block h-full w-full" />
    </div>
  );
}
