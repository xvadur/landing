/* neobrutalism.dev Tabs (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2) + variant `line` z novšej verzie, retheme cez tokeny xvadur v4.
   Zmeny: @radix-ui/react-tabs → radix-ui Tabs; „use client" odstránené; zoznam = biela lišta s rámom 3 px a tieňom 3/3,
   aktívna záložka žltá s rámom (display písmo), ciele ≥ 44 px; na mobile lišta scrolluje vodorovne — `contain: inline-size`
   na horizontálnom zozname, aby dlhé názvy záložiek neroztiahli grid rodiča (overené na 375 px). */
import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import './theme.css';

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('w-full min-w-0 max-w-full data-[orientation=vertical]:flex data-[orientation=vertical]:items-start data-[orientation=vertical]:gap-4', className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  'group/tabs-list flex max-w-full items-center gap-1 overflow-x-auto text-ink data-[orientation=horizontal]:contain-inline-size data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
  {
    variants: {
      variant: {
        default: 'min-h-14 rounded-lg border-3 border-ink bg-white p-1 shadow-brutal-sm',
        line: 'gap-2 border-b-3 border-ink bg-transparent pb-0 data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-r-3',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'press relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-3 border-transparent px-4 py-2 font-display text-base font-extrabold uppercase tracking-wide text-ink disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-ink data-[state=active]:bg-yellow data-[state=active]:shadow-brutal-sm data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start [&_svg]:pointer-events-none [&_svg]:shrink-0',
        // line: bez rámu, hrubá horúca linka pod aktívnou záložkou
        'group-data-[variant=line]/tabs-list:rounded-b-none group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none',
        'after:pointer-events-none after:absolute after:hidden after:bg-hot group-data-[variant=line]/tabs-list:after:block after:opacity-0 data-[state=active]:after:opacity-100 data-[orientation=horizontal]:after:inset-x-0 data-[orientation=horizontal]:after:-bottom-[3px] data-[orientation=horizontal]:after:h-[6px] data-[orientation=vertical]:after:inset-y-0 data-[orientation=vertical]:after:-right-[3px] data-[orientation=vertical]:after:w-[6px]',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('mt-4 outline-none data-[orientation=vertical]:mt-0 data-[orientation=vertical]:flex-1', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
