/* neobrutalism.dev Select (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: @radix-ui/react-select → radix-ui Select; lucide → Phosphor (CaretDown/CaretUp/Check); „use client" odstránené;
   trigger ako Input (48 px, biela, tieň 3/3), popover `brutal` biely s tieňom 6/6, položky ≥ 44 px, zvýraznenie žltou
   s rámom; pop animácia cez theme.css (data-state), nie tw-animate-css. */
import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { CaretDownIcon, CaretUpIcon, CheckIcon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import './theme.css';

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  children,
  tone = 'white',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { tone?: 'white' | 'yellow' | 'paper' }) {
  const toneClass = { white: 'bg-white', yellow: 'bg-yellow', paper: 'bg-paper' }[tone];
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'press flex h-12 w-full items-center justify-between gap-3 rounded-lg border-3 border-ink px-4 py-2 text-left font-sans text-base font-bold text-ink shadow-brutal-sm data-[placeholder]:font-medium data-[placeholder]:text-ink/60 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        toneClass,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretDownIcon weight="bold" size={20} aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up"
      className={cn('flex cursor-default items-center justify-center border-b-3 border-ink bg-paper py-1', className)}
      {...props}
    >
      <CaretUpIcon weight="bold" size={18} aria-hidden="true" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down"
      className={cn('flex cursor-default items-center justify-center border-t-3 border-ink bg-paper py-1', className)}
      {...props}
    >
      <CaretDownIcon weight="bold" size={18} aria-hidden="true" />
    </SelectPrimitive.ScrollDownButton>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-lenis-prevent
        position={position}
        sideOffset={sideOffset}
        className={cn(
          'relative z-[110] max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[8rem] overflow-hidden rounded-lg border-3 border-ink bg-white font-sans text-ink shadow-brutal',
          position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={cn('p-1.5', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full')}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label data-slot="select-label" className={cn('eyebrow px-3 py-2 text-ink/70', className)} {...props} />
  );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex min-h-11 w-full cursor-pointer select-none items-center gap-2 rounded-lg border-3 border-transparent py-2 pl-3 pr-10 text-base font-medium outline-none data-[highlighted]:border-ink data-[highlighted]:bg-yellow data-[highlighted]:shadow-brutal-sm data-[state=checked]:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}
    >
      <span className="absolute right-3 flex size-5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon weight="bold" size={18} aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('-mx-1.5 my-1.5 h-[3px] bg-ink', className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
