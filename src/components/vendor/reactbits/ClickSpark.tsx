/*!
 * ClickSpark — React Bits (https://reactbits.dev/animations/click-spark)
 * Copyright (c) 2026 David Haz — MIT + Commons Clause. Vendorované do xvadur.com v4 ako súčasť webu.
 * Úpravy: farba iskier z tokenu (`sparkColor="hot"` → --color-hot, prečítané z computed style, lebo canvas
 * nepozná var()), hrubšia čiara (3 px = rám), devicePixelRatio, canvas nad obsahom, reduced motion = bez iskier
 * (deti sa vykreslia bez efektu), pointerdown namiesto click (funguje aj na dotyku), cn().
 * Ostrov: client:visible / client:idle.
 */
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { resolveTokenColor, usePrefersReducedMotion } from './motion-guards';

export interface ClickSparkProps {
  /** názov tokenu (hot, ink, yellow, pink, lilac, lime, sky, paper, white) alebo CSS farba */
  sparkColor?: string;
  /** dĺžka iskry (px) */
  sparkSize?: number;
  /** dolet iskry (px) */
  sparkRadius?: number;
  sparkCount?: number;
  /** trvanie (ms) */
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  /** hrúbka čiary (px) */
  lineWidth?: number;
  className?: string;
  children?: ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

export default function ClickSpark({
  sparkColor = 'hot',
  sparkSize = 12,
  sparkRadius = 22,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  lineWidth = 3,
  className,
  children,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const colorRef = useRef<string>(sparkColor);
  const kickRef = useRef<(() => void) | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    colorRef.current = resolveTokenColor(sparkColor, parent);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(width * dpr);
      const h = Math.round(height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);
    resizeCanvas();
    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [sparkColor]);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let idle = true;

    const draw = (timestamp: number) => {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;
        const eased = easeFunc(elapsed / duration);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
        ctx.strokeStyle = colorRef.current;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });

      if (sparksRef.current.length) {
        animationId = requestAnimationFrame(draw);
      } else {
        idle = true;
      }
    };

    // rAF beží len kým sú iskry (šetrí batériu); handler ho naštartuje cez kickRef
    kickRef.current = () => {
      if (!idle) return;
      idle = false;
      animationId = requestAnimationFrame(draw);
    };

    return () => {
      cancelAnimationFrame(animationId);
      kickRef.current = null;
    };
  }, [reduced, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale, lineWidth]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();
    for (let i = 0; i < sparkCount; i++) {
      sparksRef.current.push({ x, y, angle: (2 * Math.PI * i) / sparkCount, startTime: now });
    }
    kickRef.current?.();
  };

  return (
    <div className={cn('relative inline-block', className)} onPointerDown={handlePointerDown}>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
      {children}
    </div>
  );
}
