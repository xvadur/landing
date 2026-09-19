/*!
 * ScrambledText — React Bits (https://reactbits.dev/text-animations/scrambled-text)
 * Copyright (c) 2026 David Haz — MIT + Commons Clause. Vendorované do xvadur.com v4 ako súčasť webu
 * (nie kit, neredistribuuje sa). Úpravy: bez defaultných margin/farieb (retheme cez triedy),
 * voliteľný tag, stráž reduced motion + jemný ukazovateľ (na dotyku/reduced = statický text),
 * SplitText.create len raz a revert pri unmountne, cn() z @/lib/utils.
 * Ostrov: client:only="react" (GSAP pluginy sa registrujú pri importe).
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { cn } from '@/lib/utils';
import { usePointerEffectAllowed } from './motion-guards';

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

export interface ScrambledTextProps {
  /** polomer okolo kurzora (px), v ktorom sa znaky miešajú */
  radius?: number;
  /** trvanie miešania pri nulovej vzdialenosti (s) */
  duration?: number;
  /** rýchlosť výmeny znakov (0–1) */
  speed?: number;
  /** znaky, z ktorých sa mieša; default X a bodky = XVADUR podpis */
  scrambleChars?: string;
  /** tag obalu (default p) */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  style?: CSSProperties;
  /** čistý text (SplitText potrebuje textové uzly) */
  children: ReactNode;
}

export default function ScrambledText({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = 'X×.:',
  as: Tag = 'p',
  className,
  style,
  children,
}: ScrambledTextProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const allowed = usePointerEffectAllowed(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !allowed) return;

    const split = SplitText.create(root, {
      type: 'chars',
      charsClass: 'inline-block will-change-transform',
    });

    split.chars.forEach((el) => {
      const c = el as HTMLElement;
      gsap.set(c, { attr: { 'data-content': c.innerHTML } });
    });

    const handleMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      split.chars.forEach((el) => {
        const c = el as HTMLElement;
        const { left, top, width, height } = c.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          gsap.to(c, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: { text: c.dataset.content || '', chars: scrambleChars, speed },
            ease: 'none',
          });
        }
      });
    };

    root.addEventListener('pointermove', handleMove);
    return () => {
      root.removeEventListener('pointermove', handleMove);
      gsap.killTweensOf(split.chars);
      split.revert();
    };
  }, [allowed, radius, duration, speed, scrambleChars]);

  return (
    <Tag
      ref={rootRef as never}
      className={cn('block', className)}
      style={style}
      data-scrambled={allowed ? 'on' : 'off'}
    >
      {children}
    </Tag>
  );
}
