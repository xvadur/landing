// Fancy Components (MIT, (c) Daniel Petho) — https://www.fancycomponents.dev/r/use-dimensions.json
// Úprava xvadur.com v4: ResizeObserver namiesto window resize (keď je k dispozícii).
import { useEffect, useState, type RefObject } from 'react';

export interface Dimensions {
  width: number;
  height: number;
}

export function useDimensions(ref: RefObject<HTMLElement | SVGElement | null>): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setDimensions({ width, height });
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [ref]);

  return dimensions;
}

export default useDimensions;
