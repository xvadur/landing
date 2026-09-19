// Motion Primitives (MIT, (c) 2024 ibelick) — animated-number, upravené pre xvadur.com v4.
// 'use client' (Next.js) vynechané — Astro React ostrov ho nepotrebuje.
import React, { useEffect, useMemo, type JSX } from 'react';
import { motion, useSpring, useTransform, type SpringOptions } from 'motion/react';
import { cn } from '@/lib/utils';
import { useReducedMotionFlag } from './hooks/use-reduced-motion';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: React.ElementType;
  /** locale pre toLocaleString; sk-SK dáva „2 034“ (medzera tisícov ako vo fakty.ts) */
  locale?: string;
  /** vlastný formát (má prednosť pred locale) */
  format?: (n: number) => string;
};

/** Číslo so spring prechodom (záloha za NumberFlow). Začína na hodnote, ktorú dostane pri mounte —
 *  pre „nabehnutie“ daj najprv 0 a po useInView skutočnú hodnotu (pozri motionprimitivesLab).
 *  Pri prefers-reduced-motion skočí rovno na hodnotu. */
export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span',
  locale = 'sk-SK',
  format,
}: AnimatedNumberProps) {
  const reduced = useReducedMotionFlag();
  const MotionComponent = useMemo(
    () => motion.create(as as keyof JSX.IntrinsicElements),
    [as],
  );

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) => {
    const n = Math.round(current);
    return format ? format(n) : n.toLocaleString(locale);
  });

  useEffect(() => {
    if (reduced) spring.jump(value);
    else spring.set(value);
  }, [spring, value, reduced]);

  return <MotionComponent className={cn('tabular-nums', className)}>{display}</MotionComponent>;
}

export default AnimatedNumber;
