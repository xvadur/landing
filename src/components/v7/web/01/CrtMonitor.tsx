/** V7-01 · CRT stopa EKG na monitore príjmu (recept „crt“ z katalógu tvary/CanvasEfekty.tsx, skopírovaný a upravený):
 *  dosvit fosforu, mriežka monitora, hlava stopy pri QRS zabliká alarmovou. Nad hookom src/hooks/use-canvas-effect
 *  (pauza mimo obrazovky, reduced motion = jeden statický snímok). Farby = tokeny prevedené na RGB za behu (žiadny hex).
 *  Iba ≥ 1024 px (ťažký efekt): <CrtMonitor client:media="(min-width: 1024px)" />; pod ním je statické SVG EKG. */
import * as React from 'react';
import { useCanvasEffect } from '@/hooks/use-canvas-effect';

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
const css = ([r, g, b]: RGB, a = 1) => `rgb(${r} ${g} ${b} / ${a})`;

/** EKG: fáza 0–1 → výška 0–1 (0 = hore). Tvar ako ekgPath v src/components/v5/Symboly.tsx. */
function ekgY(f: number): number {
  const base = 0.6;
  if (f > 0.33 && f < 0.43) return base - 0.08 * Math.sin(((f - 0.33) / 0.1) * Math.PI);
  if (f >= 0.48 && f < 0.51) return base + ((f - 0.48) / 0.03) * 0.1;
  if (f >= 0.51 && f < 0.55) return base + 0.1 - ((f - 0.51) / 0.04) * 0.62;
  if (f >= 0.55 && f < 0.59) return 0.08 + ((f - 0.55) / 0.04) * 0.82;
  if (f >= 0.59 && f < 0.62) return 0.9 - ((f - 0.59) / 0.03) * 0.3;
  if (f > 0.7 && f < 0.84) return base - 0.14 * Math.sin(((f - 0.7) / 0.14) * Math.PI);
  return base;
}

function mriezka(ctx: CanvasRenderingContext2D, w: number, h: number, c: RGB, a = 0.16) {
  const s = Math.max(24, Math.round(h / 6));
  ctx.strokeStyle = css(c, a);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < w; x += s) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = 0; y < h; y += s) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();
}

export default function CrtMonitor({ className = '' }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  useCanvasEffect(ref, (ctx, canvas) => {
    const [pozadie, stopa, mr, alarm] = ['ink', 'yellow', 'paper', 'stamp'].map(rgbTokenu) as [RGB, RGB, RGB, RGB];
    let x = 0;
    let prvy = true;
    return (dt) => {
      const w = canvas.width;
      const h = canvas.height;
      const perioda = Math.max(160, w / 3.2);
      const lw = Math.max(2, Math.round(h / 60));
      const y = (px: number) => ekgY((((px % perioda) + perioda) % perioda) / perioda) * h * 0.8 + h * 0.1;
      if (prvy || dt === 0) {
        ctx.fillStyle = css(pozadie);
        ctx.fillRect(0, 0, w, h);
        mriezka(ctx, w, h, mr);
        ctx.strokeStyle = css(stopa, 0.9);
        ctx.lineWidth = lw;
        ctx.beginPath();
        for (let px = 0; px <= w; px += 2) (px === 0 ? ctx.moveTo(px, y(px)) : ctx.lineTo(px, y(px)));
        ctx.stroke();
        prvy = false;
        return;
      }
      ctx.fillStyle = css(pozadie, Math.min(1, 0.05 * (dt / 16.7)));
      ctx.fillRect(0, 0, w, h);
      mriezka(ctx, w, h, mr, 0.04);
      const nx = x + dt * (w / 3800);
      ctx.strokeStyle = css(stopa);
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x, y(x));
      for (let px = x; px <= nx; px += 1.5) ctx.lineTo(px, y(px));
      ctx.stroke();
      const f = (((nx % perioda) + perioda) % perioda) / perioda;
      const qrs = f > 0.48 && f < 0.62;
      ctx.fillStyle = css(qrs ? alarm : stopa);
      ctx.fillRect(nx - lw * 2, y(nx) - lw * 2, lw * 4, lw * 4);
      x = nx > w ? 0 : nx;
    };
  });
  return <canvas ref={ref} className={`block h-full w-full ${className}`} aria-hidden="true" />;
}
