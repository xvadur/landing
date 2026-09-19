/* neobrutalism.dev Card (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2) + `size` z novšej verzie, retheme cez tokeny xvadur v4.
   Zmeny: rounded-base/border-2/shadow-shadow → rounded-lg border-3 border-ink shadow-brutal; `tone` (bg token, default white);
   `interactive` = preset lift (doc 10 §3 #9 „Card + presety lift/press"); `stamp` = X pečiatka v rohu (utilita x-stamp);
   CardTitle je display písmo (h3 default), CardDescription Space Grotesk. */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import './theme.css';

const cardVariants = cva(
  'group/card relative flex flex-col gap-(--card-spacing) rounded-lg border-3 border-ink py-(--card-spacing) font-sans text-ink [--card-spacing:--spacing(6)] data-[size=sm]:[--card-spacing:--spacing(4)]',
  {
    variants: {
      variant: {
        default: 'shadow-brutal',
        flat: '',
        lg: 'shadow-brutal-lg',
      },
      tone: {
        white: 'bg-white',
        paper: 'bg-paper',
        yellow: 'bg-yellow',
        pink: 'bg-pink',
        lilac: 'bg-lilac',
        lime: 'bg-lime',
        sky: 'bg-sky',
        ink: 'bg-ink text-paper',
      },
      interactive: {
        true: 'lift',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      tone: 'white',
      interactive: false,
    },
  },
);

export type CardProps = React.ComponentProps<'div'> &
  VariantProps<typeof cardVariants> & {
    size?: 'default' | 'sm';
    /** X pečiatka v pravom hornom rohu */
    stamp?: boolean;
  };

function Card({ className, variant, tone, interactive, size = 'default', stamp = false, children, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(cardVariants({ variant, tone, interactive }), className)}
      {...props}
    >
      {stamp && <span className="x-stamp" aria-hidden="true" />}
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:border-ink [.border-b]:pb-(--card-spacing)',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, as: Tag = 'h3', ...props }: React.ComponentProps<'h3'> & { as?: 'h2' | 'h3' | 'h4' | 'div' }) {
  return (
    <Tag
      data-slot="card-title"
      className={cn('font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-balance', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('text-sm font-medium opacity-80', className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-(--card-spacing)', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-3 px-(--card-spacing) [.border-t]:border-ink [.border-t]:pt-(--card-spacing)', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardAction, cardVariants };
