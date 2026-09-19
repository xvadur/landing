/*!
 * Noise — React Bits (https://reactbits.dev/animations/noise)
 * Copyright (c) 2026 David Haz — MIT + Commons Clause. Vendorované do xvadur.com v4 ako súčasť webu.
 * Úpravy: canvas vypĺňa rodiča (absolute inset-0, rodič `relative`), nie 100vw/100vh (to robilo horizontálny
 * scroll na 375 px); rozlíšenie vzoru cez patternSize (default 256 = lacné); reduced motion = zrno sa nakreslí
 * raz a stojí; loop stojí aj mimo viewportu (IntersectionObserver); mix-blend-multiply nad papierom.
 * Použitie: skeleton pri načítaní (/skore/), zrno v hero. Ostrov: client:visible.
 */
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from './motion-guards';

export interface NoiseProps {
  /** rozlíšenie štvorcového vzoru (px) — roztiahne sa na rodiča, pixelated */
  patternSize?: number;
  /** každý n-tý frame nový vzor (2 = 30 fps) */
  patternRefreshInterval?: number;
  /** priehľadnosť zrna 0–255 */
  patternAlpha?: number;
  /** false = statické zrno aj bez reduced motion (mobil) */
  animate?: boolean;
  className?: string;
}

export default function Noise({
  patternSize = 256,
  patternRefreshInterval = 2,
  patternAlpha = 18,
  animate = true,
  className,
}: NoiseProps) {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    canvas.width = patternSize;
    canvas.height = patternSize;

    const drawGrain = () => {
      const imageData = ctx.createImageData(patternSize, patternSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    drawGrain();
    const live = animate && !prefersReducedMotion();
    if (!live) return;

    let frame = 0;
    let animationId = 0;
    let visible = true;
    const loop = () => {
      if (!visible) return;
      if (frame % patternRefreshInterval === 0) drawGrain();
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      window.cancelAnimationFrame(animationId);
      if (visible) animationId = window.requestAnimationFrame(loop);
    });
    io.observe(canvas);
    animationId = window.requestAnimationFrame(loop);

    return () => {
      io.disconnect();
      window.cancelAnimationFrame(animationId);
    };
  }, [patternSize, patternRefreshInterval, patternAlpha, animate]);

  return (
    <canvas
      ref={grainRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply', className)}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
