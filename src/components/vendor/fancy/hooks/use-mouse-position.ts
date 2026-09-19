// Fancy Components (MIT, (c) Daniel Petho) — https://www.fancycomponents.dev/r/use-mouse-position.json
// Úprava xvadur.com v4: touchmove je pasívny, nič iné.
import { useEffect, useState, type RefObject } from 'react';

export const useMousePosition = (containerRef?: RefObject<HTMLElement | SVGElement | null>) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      if (containerRef && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Relatívna pozícia aj mimo kontajnera
        setPosition({ x: x - rect.left, y: y - rect.top });
      } else {
        setPosition({ x, y });
      }
    };

    const handleMouseMove = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY);
    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerRef]);

  return position;
};

export default useMousePosition;
