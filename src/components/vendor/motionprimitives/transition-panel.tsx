// Motion Primitives (MIT, (c) 2024 ibelick) — transition-panel, upravené pre xvadur.com v4.
// 'use client' (Next.js) vynechané — Astro React ostrov ho nepotrebuje.
import React from 'react';
import { AnimatePresence, motion, type MotionProps, type Transition, type Variant } from 'motion/react';
import { cn } from '@/lib/utils';
import { REDUCED_TRANSITION, useReducedMotionFlag } from './hooks/use-reduced-motion';

export type TransitionPanelProps = {
  /** panely; zobrazí sa children[activeIndex] */
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
  activeIndex: number;
  variants?: { enter: Variant; center: Variant; exit: Variant };
} & MotionProps;

/** Brutálny preset pre kvíz: krok vojde zdola, tvrdo (bez rozmazania). */
export const transitionPanelSlideVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const reducedVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Prepínanie panelov (kvíz, kroky). Pri prefers-reduced-motion 120 ms opacity. */
export function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
  ...motionProps
}: TransitionPanelProps) {
  const reduced = useReducedMotionFlag();
  return (
    <div className={cn('relative', className)}>
      <AnimatePresence initial={false} mode="popLayout" custom={motionProps.custom}>
        <motion.div
          key={activeIndex}
          variants={reduced ? reducedVariants : variants}
          transition={reduced ? REDUCED_TRANSITION : transition}
          initial="enter"
          animate="center"
          exit="exit"
          {...motionProps}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default TransitionPanel;
