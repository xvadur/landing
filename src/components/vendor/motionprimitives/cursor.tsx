// Motion Primitives (MIT, (c) 2024 ibelick) — cursor, upravené pre xvadur.com v4.
// 'use client' (Next.js) vynechané — Astro React ostrov ho nepotrebuje.
import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type SpringOptions,
  type Transition,
  type Variant,
} from 'motion/react';
import { cn } from '@/lib/utils';
import { useFinePointer, useReducedMotionFlag, REDUCED_TRANSITION } from './hooks/use-reduced-motion';

export type CursorProps = {
  /** čo sa kreslí namiesto kurzora (X, štítok VSTÚP …) */
  children: React.ReactNode;
  className?: string;
  springConfig?: SpringOptions;
  /** true = kurzor žije len nad rodičovským prvkom (mouseenter/leave), inak nad celou stránkou */
  attachToParent?: boolean;
  transition?: Transition;
  variants?: { initial: Variant; animate: Variant; exit: Variant };
  onPositionChange?: (x: number, y: number) => void;
};

/** Vlastný kurzor. Pravidlá webu: len desktop s myšou (≥ 1024 px, hover, pointer: fine) a bez
 *  prefers-reduced-motion — inak sa nevykreslí nič a systémový kurzor ostáva. Nezasahuje do
 *  `document.body.style.cursor`, keď nie je aktívny (Base layout má vlastný X kurzor v site/Cursor.tsx;
 *  tento používaj lokálne s `attachToParent`, napr. v sekcii alebo v hre). */
export function Cursor({
  children,
  className,
  springConfig,
  attachToParent,
  variants,
  transition,
  onPositionChange,
}: CursorProps) {
  const reduced = useReducedMotionFlag();
  const fine = useFinePointer();
  const active = fine && !reduced;

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!attachToParent);

  const cursorXSpring = useSpring(cursorX, springConfig || { duration: 0 });
  const cursorYSpring = useSpring(cursorY, springConfig || { duration: 0 });

  useEffect(() => {
    if (!active) return;
    cursorX.set(window.innerWidth / 2);
    cursorY.set(window.innerHeight / 2);
  }, [active, cursorX, cursorY]);

  useEffect(() => {
    if (!active) return;
    if (!attachToParent) document.body.style.cursor = 'none';

    const updatePosition = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      onPositionChange?.(e.clientX, e.clientY);
    };
    document.addEventListener('pointermove', updatePosition, { passive: true });
    return () => {
      document.removeEventListener('pointermove', updatePosition);
      if (!attachToParent) document.body.style.cursor = '';
    };
  }, [active, attachToParent, cursorX, cursorY, onPositionChange]);

  useEffect(() => {
    if (!active || !attachToParent || !cursorRef.current) return;
    const parent = cursorRef.current.parentElement;
    if (!parent) return;
    const enter = () => {
      parent.style.cursor = 'none';
      setIsVisible(true);
    };
    const leave = () => {
      parent.style.cursor = '';
      setIsVisible(false);
    };
    parent.addEventListener('mouseenter', enter);
    parent.addEventListener('mouseleave', leave);
    return () => {
      parent.removeEventListener('mouseenter', enter);
      parent.removeEventListener('mouseleave', leave);
      parent.style.cursor = '';
    };
  }, [active, attachToParent]);

  if (!active) return null;

  return (
    <motion.div
      ref={cursorRef}
      aria-hidden="true"
      className={cn('pointer-events-none fixed top-0 left-0 z-50', className)}
      style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={reduced ? REDUCED_TRANSITION : transition}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Cursor;
