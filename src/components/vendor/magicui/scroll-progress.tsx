// Magic UI — Scroll Progress (MIT, https://magicui.design/docs/components/scroll-progress), vendorované 19. 9. 2026.
// Zmeny: bez "use client"; gradient nahradený tokenom (bg-hot + spodný rám ink 3 px), výška 6 px + 3 px rám.
// Scroll-linked (useScroll), nie časová animácia → pri reduced motion ostáva (nie je to pohyb, je to stav).
import { motion, useScroll, type MotionProps } from 'motion/react';

import { cn } from '@/lib/utils';

export interface ScrollProgressProps extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  ref?: React.Ref<HTMLDivElement>;
  /** Farba pásu (token). @default 'hot' */
  color?: 'hot' | 'yellow' | 'pink' | 'lilac' | 'lime' | 'sky' | 'ink';
}

const COLOR: Record<NonNullable<ScrollProgressProps['color']>, string> = {
  hot: 'bg-hot',
  yellow: 'bg-yellow',
  pink: 'bg-pink',
  lilac: 'bg-lilac',
  lime: 'bg-lime',
  sky: 'bg-sky',
  ink: 'bg-ink',
};

export function ScrollProgress({ className, ref, color = 'hot', ...props }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      ref={ref}
      role="progressbar"
      aria-label="Priebeh čítania"
      className={cn('fixed inset-x-0 top-0 z-50 h-2 origin-left border-b-3 border-ink', COLOR[color], className)}
      style={{ scaleX: scrollYProgress }}
      {...props}
    />
  );
}

export default ScrollProgress;
