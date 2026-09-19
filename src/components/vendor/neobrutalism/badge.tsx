/* neobrutalism.dev Badge (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: Slot z radix-ui; rám 3 px ink, radius 8, tieň 3/3; mono eyebrow typografia; `tone` z tokenov;
   `tilt` = natočená nálepka (doc 10 §3 #10 „Badge + rotate", napr. „V STAVBE"). */
import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import './theme.css';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-lg border-3 border-ink px-2.5 py-1 font-mono text-xs font-medium uppercase leading-none tracking-[0.14em] [&>svg]:pointer-events-none [&>svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'shadow-brutal-sm',
        flat: '',
        /** nálepka: display písmo, ako utilita `sticker` */
        sticker: 'shadow-brutal-sm font-display text-sm font-extrabold tracking-[0.06em] px-3 py-1.5',
      },
      tone: {
        yellow: 'bg-yellow text-ink',
        hot: 'bg-hot text-ink',
        white: 'bg-white text-ink',
        paper: 'bg-paper text-ink',
        pink: 'bg-pink text-ink',
        lilac: 'bg-lilac text-ink',
        lime: 'bg-lime text-ink',
        sky: 'bg-sky text-ink',
        ink: 'bg-ink text-paper',
      },
      tilt: {
        none: '',
        left: '-rotate-6',
        right: 'rotate-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      tone: 'yellow',
      tilt: 'none',
    },
  },
);

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  };

function Badge({ className, variant, tone, tilt, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span';
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant, tone, tilt }), className)} {...props} />;
}

export { Badge, badgeVariants };
