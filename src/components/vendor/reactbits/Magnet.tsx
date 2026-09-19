/*!
 * Magnet — React Bits (https://reactbits.dev/animations/magnet)
 * Copyright (c) 2026 David Haz — MIT + Commons Clause. Vendorované do xvadur.com v4 ako súčasť webu.
 * Úpravy: efekt beží len s jemným ukazovateľom a bez reduced motion (dotyk/mobil = statický),
 * `pointermove` namiesto `mousemove`, easing z tokenov (--ease-out-hard / --ease-spring), cn().
 * Ostrov: client:visible alebo client:idle (bez window pri importe).
 */
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePointerEffectAllowed } from './motion-guards';

export interface MagnetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** dosah magnetu okolo prvku (px) */
  padding?: number;
  /** vypnúť ručne (napr. počas dialógu) */
  disabled?: boolean;
  /** vyššie číslo = slabší ťah (posun = vzdialenosť / magnetStrength) */
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  wrapperClassName?: string;
  innerClassName?: string;
}

export default function Magnet({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  activeTransition = 'transform var(--duration-slow, 500ms) var(--ease-out-hard, ease-out)',
  inactiveTransition = 'transform var(--duration-slow, 500ms) var(--ease-spring, ease-in-out)',
  wrapperClassName,
  innerClassName,
  className,
  ...props
}: MagnetProps) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const magnetRef = useRef<HTMLDivElement>(null);
  const allowed = usePointerEffectAllowed(false);
  const enabled = allowed && !disabled;

  useEffect(() => {
    if (!enabled) {
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
      return;
    }
    const handleMove = (e: PointerEvent) => {
      const el = magnetRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distX = Math.abs(centerX - e.clientX);
      const distY = Math.abs(centerY - e.clientY);
      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        setIsActive(true);
        setPosition({ x: (e.clientX - centerX) / magnetStrength, y: (e.clientY - centerY) / magnetStrength });
      } else {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
      }
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, [enabled, padding, magnetStrength]);

  return (
    <div
      ref={magnetRef}
      className={cn('relative inline-block', wrapperClassName, className)}
      data-magnet={enabled ? 'on' : 'off'}
      {...props}
    >
      <div
        className={cn('will-change-transform', innerClassName)}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isActive ? activeTransition : inactiveTransition,
        }}
      >
        {children}
      </div>
    </div>
  );
}
