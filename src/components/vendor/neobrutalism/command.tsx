/* neobrutalism.dev Command (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: lucide Search → Phosphor MagnifyingGlassIcon; import dialógu z tohto priečinka; „use client" odstránené;
   vstupný riadok žltý s eyebrow, položky ≥ 44 px so žltým zvýraznením a rámom (rovnaký jazyk ako site/CommandK.tsx);
   CommandDialog má slovenský default title/description (sr-only) a `label` pre cmdk. Závislosť: cmdk 1.1.1 (v repe). */
import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { cn } from '@/lib/utils';
import './theme.css';

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-lg border-3 border-ink bg-white font-sans text-ink shadow-brutal',
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = 'Príkazová paleta',
  description = 'Napíš, kam chceš ísť, a potvrď Enterom.',
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={false}
        className={cn('overflow-hidden p-0 sm:p-0', className)}
        aria-label={title}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command label={title} className="border-0 shadow-none">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  eyebrow = 'Kam?',
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & { eyebrow?: string }) {
  return (
    <div data-slot="command-input-wrapper" className="flex h-14 items-center gap-3 border-b-3 border-ink bg-yellow px-4">
      <span className="eyebrow hidden sm:inline">{eyebrow}</span>
      <MagnifyingGlassIcon weight="bold" size={20} aria-hidden="true" className="shrink-0 sm:hidden" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'h-full w-full bg-transparent font-display text-xl font-extrabold uppercase text-ink outline-none placeholder:font-sans placeholder:text-base placeholder:font-medium placeholder:normal-case placeholder:text-ink/60 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      <kbd className="hidden rounded-sm border-2 border-ink bg-white px-1.5 font-mono text-xs sm:block">ESC</kbd>
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      data-lenis-prevent
      className={cn('max-h-[50vh] scroll-py-2 overflow-x-hidden overflow-y-auto p-2', className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn('px-3 py-6 text-center font-sans', className)}
      {...props}
    />
  );
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'overflow-hidden text-ink [&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-ink/70',
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator data-slot="command-separator" className={cn('my-2 h-[3px] bg-ink', className)} {...props} />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'relative flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-lg border-3 border-transparent px-3 py-2 font-display text-lg font-extrabold uppercase outline-none data-[selected=true]:border-ink data-[selected=true]:bg-yellow data-[selected=true]:shadow-brutal-sm data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn('ml-auto font-mono text-xs font-medium normal-case tracking-wide text-ink/70', className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
