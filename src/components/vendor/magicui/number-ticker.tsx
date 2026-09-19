// Magic UI — Number Ticker (MIT, https://magicui.design/docs/components/number-ticker), vendorované 19. 9. 2026.
// Záloha k NumberFlow (doc 10 §3 #14). Zmeny: bez "use client"; formát sk-SK (2 034 s pevnou medzerou),
// bez text-black/dark:text-white (dedí farbu), `prefix`/`suffix`, reduced motion = skok na cieľ bez pružiny.
import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

import { cn } from '@/lib/utils';

export interface NumberTickerProps extends ComponentPropsWithoutRef<'span'> {
  value: number;
  startValue?: number;
  direction?: 'up' | 'down';
  /** oneskorenie v sekundách */
  delay?: number;
  decimalPlaces?: number;
  /** Locale pre Intl.NumberFormat. @default 'sk-SK' */
  locale?: string;
  prefix?: string;
  suffix?: string;
}

export function formatTicker(n: number, decimalPlaces = 0, locale = 'sk-SK'): string {
  return Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(n.toFixed(decimalPlaces)));
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = 'up',
  delay = 0,
  className,
  decimalPlaces = 0,
  locale = 'sk-SK',
  prefix = '',
  suffix = '',
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion() ?? false;
  const target = direction === 'down' ? startValue : value;
  const motionValue = useMotionValue(direction === 'down' ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isInView) {
      if (reduced) {
        springValue.jump(target);
        if (ref.current) ref.current.textContent = formatTicker(target, decimalPlaces, locale);
        return;
      }
      timer = setTimeout(() => {
        motionValue.set(target);
      }, delay * 1000);
    }

    return () => {
      if (timer !== null) clearTimeout(timer);
    };
  }, [motionValue, springValue, isInView, delay, target, reduced, decimalPlaces, locale]);

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (ref.current) {
          ref.current.textContent = formatTicker(latest, decimalPlaces, locale);
        }
      }),
    [springValue, decimalPlaces, locale],
  );

  return (
    <span className={cn('inline-flex items-baseline', className)} {...props}>
      {prefix ? <span>{prefix}</span> : null}
      <span ref={ref} className="inline-block tabular-nums">
        {formatTicker(direction === 'down' ? value : startValue, decimalPlaces, locale)}
      </span>
      {suffix ? <span>{suffix}</span> : null}
    </span>
  );
}

export default NumberTicker;
