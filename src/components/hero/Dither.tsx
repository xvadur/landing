/** Dither pozadie hera (doc 10 §3 #3): @paper-design/shaders-react Dithering v papieri + inku.
 *  Načítava sa lazy (React.lazy v Hero.tsx) a LEN na desktope s hoverom ≥ 1024 px bez reduced motion —
 *  mobil a reduced motion dostanú statické zrno (tx-grain). Farby sa berú z tokenov (--color-paper, --color-ink)
 *  cez 1×1 canvas (shader nevie oklch(), vie rgb()), žiadny ručný hex. */
import { useEffect, useState } from 'react';
import { Dithering } from '@paper-design/shaders-react';

/** Token (`paper`, `ink`) → `rgba(r, g, b, a)` pre shader; alpha sa doplní. */
function tokenToRgba(token: string, alpha = 1): string | null {
  if (typeof document === 'undefined') return null;
  const css = getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim();
  if (!css) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function Dither() {
  const [colors, setColors] = useState<{ back: string; front: string } | null>(null);
  useEffect(() => {
    const back = tokenToRgba('paper');
    const front = tokenToRgba('ink', 0.16);
    if (back && front) setColors({ back, front });
  }, []);
  if (!colors) return null;
  return (
    <Dithering
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{ width: '100%', height: '100%' }}
      colorBack={colors.back}
      colorFront={colors.front}
      shape="simplex"
      type="4x4"
      size={2}
      scale={1.6}
      speed={0.35}
      fit="cover"
      minPixelRatio={1}
      maxPixelCount={1920 * 1080}
    />
  );
}
