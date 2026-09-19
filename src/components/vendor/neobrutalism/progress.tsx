/* neobrutalism.dev Progress (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: @radix-ui/react-progress → radix-ui Progress; „use client" odstránené; rám 3 px ink, radius 8, biela dráha,
   indikátor v tóne z tokenov (default hot) s rámom vpravo; posun spring cez theme.css (reduced motion: skok);
   voliteľný ProgressLabel/ProgressValue (z novšej verzie knižnice) — mono, tabular. */
import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';
import './theme.css';

export type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  value?: number;
  tone?: 'hot' | 'yellow' | 'pink' | 'lilac' | 'lime' | 'sky' | 'ink';
  size?: 'sm' | 'default' | 'lg';
};

const toneClass = {
  hot: 'bg-hot',
  yellow: 'bg-yellow',
  pink: 'bg-pink-deep',
  lilac: 'bg-lilac-deep',
  lime: 'bg-lime-deep',
  sky: 'bg-sky-deep',
  ink: 'bg-ink',
} as const;

const sizeClass = { sm: 'h-3', default: 'h-5', lg: 'h-8' } as const;

function Progress({ className, value, max = 100, tone = 'hot', size = 'default', ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100));
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn('relative w-full overflow-hidden rounded-lg border-3 border-ink bg-white shadow-brutal-sm', sizeClass[size], className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('h-full w-full border-r-3 border-ink', toneClass[tone], pct === 0 && 'border-r-0')}
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

function ProgressLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="progress-label" className={cn('eyebrow', className)} {...props} />;
}

function ProgressValue({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="progress-value" className={cn('ml-auto font-mono text-sm tabular-nums', className)} {...props} />;
}

export { Progress, ProgressLabel, ProgressValue };
