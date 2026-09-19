/* neobrutalism.dev Button (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: @radix-ui/react-slot → radix-ui Slot; rounded-base/border-2/shadow-shadow → rounded-lg border-3 border-ink shadow-brutal;
   hover-translate → presety lift/press; výšky ≥ 44 px (mobil); pridaný `tone` (farba tokenu). Žiadny ručný hex. */
import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import './theme.css';

const buttonVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg border-3 border-ink font-display font-extrabold uppercase tracking-wide [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-5 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  {
    variants: {
      /** tvar a pohyb (knižnica): default = tieň + press, reverse = tieň sa objaví pri hoveri (lift), noShadow = plochý */
      variant: {
        default: 'press shadow-brutal',
        noShadow: 'press',
        neutral: 'press shadow-brutal',
        reverse: 'lift shadow-brutal-none',
        ghost: 'press border-transparent shadow-none hover:border-ink',
      },
      /** farba z tokenov (main = žltá) */
      tone: {
        yellow: 'bg-yellow text-ink hover:bg-yellow-hover active:bg-yellow-press',
        hot: 'bg-hot text-ink hover:bg-hot-hover active:bg-hot-press',
        white: 'bg-white text-ink hover:bg-white-hover active:bg-white-press',
        paper: 'bg-paper text-ink hover:bg-paper-hover active:bg-paper-press',
        pink: 'bg-pink text-ink hover:bg-pink-hover active:bg-pink-press',
        lilac: 'bg-lilac text-ink hover:bg-lilac-hover active:bg-lilac-press',
        lime: 'bg-lime text-ink hover:bg-lime-hover active:bg-lime-press',
        sky: 'bg-sky text-ink hover:bg-sky-hover active:bg-sky-press',
        ink: 'bg-ink text-paper hover:bg-ink-hover',
      },
      /** všetky ciele ≥ 44 px */
      size: {
        default: 'min-h-12 px-5 text-base',
        sm: 'min-h-11 px-4 text-sm',
        lg: 'min-h-14 px-7 text-lg',
        xl: 'min-h-16 px-8 text-xl sm:text-2xl',
        icon: 'size-12',
        'icon-sm': 'size-11',
        'icon-lg': 'size-14',
      },
    },
    compoundVariants: [
      // neutral = biela plocha (ako v knižnici), ak nie je zadaný iný tón
      { variant: 'neutral', tone: 'yellow', class: 'bg-white text-ink hover:bg-white-hover active:bg-white-press' },
      { variant: 'ghost', tone: 'yellow', class: 'bg-transparent hover:bg-yellow active:bg-yellow-press' },
    ],
    defaultVariants: {
      variant: 'default',
      tone: 'yellow',
      size: 'default',
    },
  },
);

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** vykreslí sa ako potomok (napr. <a>) — Radix Slot */
    asChild?: boolean;
  };

function Button({ className, variant, tone, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, tone, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
