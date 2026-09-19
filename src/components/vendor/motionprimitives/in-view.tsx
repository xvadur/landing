// Motion Primitives (MIT, (c) 2024 ibelick) — in-view, upravené pre xvadur.com v4.
// 'use client' (Next.js) vynechané — Astro React ostrov ho nepotrebuje.
import React, { useMemo, useRef, useState, type JSX, type ReactNode } from 'react';
import {
  motion,
  useInView,
  type Transition,
  type UseInViewOptions,
  type Variant,
} from 'motion/react';
import { REDUCED_TRANSITION, useReducedMotionFlag } from './hooks/use-reduced-motion';

export type InViewProps = {
  children: ReactNode;
  variants?: { hidden: Variant; visible: Variant };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: React.ElementType;
  /** true = po prvom zobrazení už neschová */
  once?: boolean;
  className?: string;
};

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Brutálny preset: prvok „padne“ na miesto (translate 12 px + opacity), hodí sa na karty. */
export const inViewDropVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const reducedVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Scroll reveal cez useInView. Pri prefers-reduced-motion len 120 ms opacity (bez posunu).
 *  Pre čisto CSS variant bez JS použi utility `reveal` z global.css. */
export function InView({
  children,
  variants = defaultVariants,
  transition,
  viewOptions,
  as = 'div',
  once,
  className,
}: InViewProps) {
  const reduced = useReducedMotionFlag();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, viewOptions);
  const [isViewed, setIsViewed] = useState(false);

  // motion.create(<union tagov>) dáva TS priveľkú úniu → typujeme ako motion.div (props sú rovnaké).
  const MotionComponent = useMemo(
    () => motion.create(as as keyof JSX.IntrinsicElements) as unknown as typeof motion.div,
    [as],
  );

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial="hidden"
      onAnimationComplete={() => {
        if (once) setIsViewed(true);
      }}
      animate={isInView || isViewed ? 'visible' : 'hidden'}
      variants={reduced ? reducedVariants : variants}
      transition={reduced ? REDUCED_TRANSITION : transition}
    >
      {children}
    </MotionComponent>
  );
}

export default InView;
