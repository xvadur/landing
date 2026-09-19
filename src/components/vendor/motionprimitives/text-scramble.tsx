// Motion Primitives (MIT, (c) 2024 ibelick) — text-scramble, upravené pre xvadur.com v4.
// 'use client' (Next.js) vynechané — Astro React ostrov ho nepotrebuje.
// Zmena oproti originálu: bez `motion.create` a MotionProps — komponent vykreslí obyčajný element
// (0 kB Motion runtime, ~1 kB gz), zvyšné HTML props idú cez `...props`. Logika scramble ostala.
import React, { createElement, useEffect, useRef, useState } from 'react';
import { useReducedMotionFlag } from './hooks/use-reduced-motion';

export type TextScrambleProps = {
  /** cieľový text (musí byť reťazec) */
  children: string;
  /** trvanie v sekundách */
  duration?: number;
  /** krok v sekundách */
  speed?: number;
  /** znaky, z ktorých sa mieša; default má aj slovenské diakritické veľké písmená a X */
  characterSet?: string;
  as?: React.ElementType;
  className?: string;
  /** true spustí scramble; zmena z false na true ho spustí znova */
  trigger?: boolean;
  onScrambleComplete?: () => void;
} & Omit<React.HTMLAttributes<HTMLElement>, 'children'>;

/** Default sada: latinka + slovenské veľké písmená s diakritikou + čísla + X. Uppercase, lebo motto
 *  a titulky na webe sú uppercase v Bricolage. */
export const SCRAMBLE_CHARS_SK = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ0123456789XX×';

const defaultChars = SCRAMBLE_CHARS_SK;

/** Scramble text (záloha za React Bits ScrambleText). Pri prefers-reduced-motion sa vykreslí rovno
 *  cieľový text, interval nebeží. SSR renderuje cieľový text (bez skoku obsahu). */
export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = 'p',
  trigger = true,
  onScrambleComplete,
  ...props
}: TextScrambleProps) {
  const reduced = useReducedMotionFlag();
  const [displayText, setDisplayText] = useState(children);
  const animating = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const text = children;

  useEffect(() => {
    if (!trigger) return;
    if (reduced) {
      setDisplayText(text);
      onScrambleComplete?.();
      return;
    }
    if (animating.current) return;
    animating.current = true;

    const steps = duration / speed;
    let step = 0;

    intervalRef.current = setInterval(() => {
      let scrambled = '';
      const progress = step / steps;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          scrambled += ' ';
          continue;
        }
        if (progress * text.length > i) {
          scrambled += text[i];
        } else {
          scrambled += characterSet[Math.floor(Math.random() * characterSet.length)];
        }
      }
      setDisplayText(scrambled);
      step++;
      if (step > steps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setDisplayText(text);
        animating.current = false;
        onScrambleComplete?.();
      }
    }, speed * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      animating.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, text, reduced]);

  return createElement(Component, { className, ...props }, displayText);
}

export default TextScramble;
