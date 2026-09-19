/* neobrutalism.dev Sheet (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: @radix-ui/react-dialog → radix-ui Dialog; lucide X → Phosphor XIcon; „use client" odstránené;
   slide animácie cez theme.css (data-state + data-side), nie tw-animate-css; rám 3 px ink na hrane, bg paper;
   zatvárací cieľ 44 px, aria-label „Zavrieť"; data-lenis-prevent. Mobilná navigácia ostáva vaul (site/Drawer.tsx). */
import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { XIcon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import './theme.css';

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn('fixed inset-0 z-[100] bg-overlay', className)}
      {...props}
    />
  );
}

export type SheetSide = 'top' | 'bottom' | 'left' | 'right';

const sideClass: Record<SheetSide, string> = {
  right: 'inset-y-0 right-0 h-full w-[min(88vw,420px)] border-l-3',
  left: 'inset-y-0 left-0 h-full w-[min(88vw,420px)] border-r-3',
  top: 'inset-x-0 top-0 h-auto max-h-[85dvh] border-b-3',
  bottom: 'inset-x-0 bottom-0 h-auto max-h-[85dvh] border-t-3',
};

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: SheetSide;
  showCloseButton?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        data-lenis-prevent
        className={cn(
          'fixed z-[101] flex flex-col gap-4 overflow-y-auto border-ink bg-paper text-ink outline-none',
          sideClass[side],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className="press absolute right-3 top-3 flex size-11 items-center justify-center rounded-lg border-3 border-ink bg-white shadow-brutal-sm hover:bg-hot hover:text-ink"
            aria-label="Zavrieť"
          >
            <XIcon weight="bold" size={22} aria-hidden="true" />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-2 border-b-3 border-ink p-4 pr-16', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="sheet-footer" className={cn('mt-auto flex flex-col gap-3 border-t-3 border-ink p-4', className)} {...props} />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-display text-2xl font-extrabold uppercase leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm font-medium text-ink/80', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
