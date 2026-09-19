// Motion Primitives (MIT, (c) 2024 ibelick) — magnetic, upravené pre xvadur.com v4.
// 'use client' (Next.js) vynechané — Astro React ostrov ho nepotrebuje.
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, type SpringOptions } from 'motion/react';
import { cn } from '@/lib/utils';
import { useReducedMotionFlag } from './hooks/use-reduced-motion';

const SPRING_CONFIG: SpringOptions = { stiffness: 26.7, damping: 4.1, mass: 0.2 };

export type MagneticProps = {
  children: React.ReactNode;
  /** sila ťahu 0–1 (doc 10 CTA „VSTÚP“: 0.5 stačí, tlačidlo má hard shadow) */
  intensity?: number;
  /** polomer v px, v ktorom prvok reaguje */
  range?: number;
  /** kto spúšťa efekt: samotný prvok, rodič alebo celá stránka */
  actionArea?: 'self' | 'parent' | 'global';
  springOptions?: SpringOptions;
  className?: string;
};

/** Magnetický obal (záloha za React Bits Magnet). Pri prefers-reduced-motion alebo bez myši
 *  (dotyk nevyvolá mousemove) ostáva prvok na mieste. Obal je `inline-block`, aby sa dal položiť
 *  okolo tlačidla bez zmeny layoutu. */
export function Magnetic({
  children,
  intensity = 0.6,
  range = 100,
  actionArea = 'self',
  springOptions = SPRING_CONFIG,
  className,
}: MagneticProps) {
  const reduced = useReducedMotionFlag();
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  useEffect(() => {
    if (reduced) {
      x.set(0);
      y.set(0);
      return;
    }
    const calculateDistance = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const absoluteDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      if (isHovered && absoluteDistance <= range) {
        const scale = 1 - absoluteDistance / range;
        x.set(distanceX * intensity * scale);
        y.set(distanceY * intensity * scale);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    document.addEventListener('mousemove', calculateDistance);
    return () => document.removeEventListener('mousemove', calculateDistance);
  }, [reduced, isHovered, intensity, range, x, y]);

  useEffect(() => {
    if (actionArea === 'parent' && ref.current?.parentElement) {
      const parent = ref.current.parentElement;
      const handleParentEnter = () => setIsHovered(true);
      const handleParentLeave = () => setIsHovered(false);
      parent.addEventListener('mouseenter', handleParentEnter);
      parent.addEventListener('mouseleave', handleParentLeave);
      return () => {
        parent.removeEventListener('mouseenter', handleParentEnter);
        parent.removeEventListener('mouseleave', handleParentLeave);
      };
    } else if (actionArea === 'global') {
      setIsHovered(true);
    }
  }, [actionArea]);

  const handleMouseEnter = () => {
    if (actionArea === 'self') setIsHovered(true);
  };
  const handleMouseLeave = () => {
    if (actionArea === 'self') {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      onMouseEnter={actionArea === 'self' ? handleMouseEnter : undefined}
      onMouseLeave={actionArea === 'self' ? handleMouseLeave : undefined}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

export default Magnetic;
