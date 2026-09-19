/*!
 * CountUp — React Bits (https://reactbits.dev/text-animations/count-up)
 * Copyright (c) 2026 David Haz — MIT + Commons Clause. Vendorované do xvadur.com v4 ako súčasť webu.
 * Úpravy: slovenský formát (tisíce oddelené pevnou medzerou, desatinná čiarka — ako fakty.ts „2 034“, „2,3“),
 * SSR vykreslí štartovú hodnotu (nie prázdny span), reduced motion = cieľ hneď bez pružiny,
 * voliteľné prefix/suffix (napr. „47 / 47“ → to=47 suffix=" / 47"), tag cez `as`, cn().
 * Ostrov: client:visible (Motion useInView).
 */
import { useCallback, useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from './motion-guards';

/** pevná medzera (U+00A0) — slovenský oddeľovač tisícov, ktorý sa nezalomí */
export const NBSP = String.fromCharCode(160);

export interface CountUpProps {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  /** oneskorenie (s) */
  delay?: number;
  /** trvanie (s) */
  duration?: number;
  className?: string;
  /** spustiť až keď true (napr. po odpovedi v kvíze) */
  startWhen?: boolean;
  /** oddeľovač tisícov; default pevná medzera (sk). '' = bez oddeľovača */
  separator?: string;
  /** desatinný oddeľovač; default čiarka (sk) */
  decimal?: string;
  prefix?: string;
  suffix?: string;
  as?: 'span' | 'strong' | 'em' | 'b' | 'div';
  onStart?: () => void;
  onEnd?: () => void;
}

function decimalsOf(num: number): number {
  const str = num.toString();
  if (!str.includes('.')) return 0;
  const decimals = str.split('.')[1];
  return parseInt(decimals, 10) !== 0 ? decimals.length : 0;
}

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className,
  startWhen = true,
  separator = NBSP,
  decimal = ',',
  prefix = '',
  suffix = '',
  as: Tag = 'span',
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLElement>(null);
  const start = direction === 'down' ? to : from;
  const end = direction === 'down' ? from : to;
  const motionValue = useMotionValue(start);
  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: '0px' });
  const maxDecimals = Math.max(decimalsOf(from), decimalsOf(to));

  const formatValue = useCallback(
    (latest: number) => {
      const formatted = new Intl.NumberFormat('en-US', {
        useGrouping: !!separator,
        minimumFractionDigits: maxDecimals,
        maximumFractionDigits: maxDecimals,
      }).format(latest);
      const [intPart, fracPart] = formatted.split('.');
      const sk = intPart.split(',').join(separator) + (fracPart ? decimal + fracPart : '');
      return `${prefix}${sk}${suffix}`;
    },
    [maxDecimals, separator, decimal, prefix, suffix],
  );

  useEffect(() => {
    if (ref.current) ref.current.textContent = formatValue(start);
  }, [start, formatValue]);

  useEffect(() => {
    if (!isInView || !startWhen) return;
    onStart?.();
    if (prefersReducedMotion()) {
      if (ref.current) ref.current.textContent = formatValue(end);
      onEnd?.();
      return;
    }
    const t1 = setTimeout(() => motionValue.set(end), delay * 1000);
    const t2 = setTimeout(() => onEnd?.(), delay * 1000 + duration * 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isInView, startWhen, motionValue, end, delay, duration, onStart, onEnd, formatValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest: number) => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
    return () => unsubscribe();
  }, [springValue, formatValue]);

  return (
    <Tag ref={ref as never} className={cn('tabular-nums', className)}>
      {formatValue(start)}
    </Tag>
  );
}
