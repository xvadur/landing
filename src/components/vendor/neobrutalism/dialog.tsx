/* neobrutalism.dev Dialog (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: @radix-ui/react-dialog → radix-ui Dialog; lucide X → Phosphor XIcon; „use client" odstránené (Astro ostrov ju nepotrebuje);
   obsah je v overlayi ako grid (mobil dole, desktop stred) — rovnaký vzor ako port/Wizard.tsx; otvorenie = card-drop
   (theme.css cez data-state), zatvorenie fade 120 ms; data-lenis-prevent; zatvárací cieľ 44 px s aria-label „Zavrieť". */
import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { XIcon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import './theme.css';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-[100] grid place-items-end overflow-y-auto bg-overlay p-2 sm:place-items-center sm:p-5',
        className,
      )}
      {...props}
    />
  );
}

export type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** zatvárací krížik vpravo hore (default áno) */
  showCloseButton?: boolean;
  /** farba plochy z tokenov */
  tone?: 'white' | 'paper' | 'yellow' | 'pink' | 'lilac' | 'lime' | 'sky';
  /** šírka: sm 480, default 640, lg 760 */
  size?: 'sm' | 'default' | 'lg';
};

const toneClass = {
  white: 'bg-white',
  paper: 'bg-paper',
  yellow: 'bg-yellow',
  pink: 'bg-pink',
  lilac: 'bg-lilac',
  lime: 'bg-lime',
  sky: 'bg-sky',
} as const;

const sizeClass = {
  sm: 'w-[min(480px,100%)]',
  default: 'w-[min(640px,100%)]',
  lg: 'w-[min(760px,100%)]',
} as const;

function DialogContent({
  className,
  children,
  showCloseButton = true,
  tone = 'white',
  size = 'default',
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          data-lenis-prevent
          className={cn(
            'relative grid max-h-[calc(100dvh-1rem)] gap-5 overflow-y-auto rounded-lg border-3 border-ink p-5 text-ink shadow-brutal-xl outline-none sm:max-h-[calc(100dvh-2.5rem)] sm:p-8',
            toneClass[tone],
            sizeClass[size],
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="press absolute right-3 top-3 flex size-11 items-center justify-center rounded-lg border-3 border-ink bg-white shadow-brutal-sm hover:bg-hot hover:text-ink"
              aria-label="Zavrieť"
            >
              <XIcon weight="bold" size={22} aria-hidden="true" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn('flex flex-col gap-2 pr-12 text-left', className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-3 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('font-display text-display-xs font-extrabold uppercase leading-[0.95] tracking-tight text-balance', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-base font-medium text-ink/80', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
