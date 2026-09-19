/* neobrutalism.dev Tooltip (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: @radix-ui/react-tooltip → radix-ui Tooltip; „use client" odstránené; žltá bublina s rámom 3 px a tieňom 3/3,
   pop animácia cez theme.css (data-state), nie tw-animate-css; delayDuration 0 (ako knižnica).
   Pozn.: tooltip je len hover/fokus (desktop, klávesnica) — na dotyku nesmie niesť jediný nosič informácie. */
import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';
import './theme.css';

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 8,
  tone = 'yellow',
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & { tone?: 'yellow' | 'ink' | 'white' }) {
  const toneClass = { yellow: 'bg-yellow text-ink', ink: 'bg-ink text-paper', white: 'bg-white text-ink' }[tone];
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-[120] max-w-xs rounded-lg border-3 border-ink px-3 py-2 font-sans text-sm font-bold shadow-brutal-sm text-balance',
          toneClass,
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
