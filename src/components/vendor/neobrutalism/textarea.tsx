/* neobrutalism.dev Textarea (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: rám 3 px ink, radius 8, tieň 3/3 → pri fokuse 6/6; min. výška 8 rem; text 16 px; aria-invalid → horúci rám. */
import * as React from 'react';

import { cn } from '@/lib/utils';
import './theme.css';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-32 w-full min-w-0 rounded-lg border-3 border-ink bg-white px-4 py-3 font-sans text-base font-medium leading-relaxed text-ink shadow-brutal-sm transition-shadow duration-(--duration-base) selection:bg-ink selection:text-yellow placeholder:text-ink/50 focus:shadow-brutal disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-hot aria-invalid:bg-pink',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
