/* neobrutalism.dev Input (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: rám 3 px ink, radius 8, tieň 3/3 → pri fokuse 6/6; výška 48 px; text 16 px (iOS bez zoomu);
   focus-visible = globálny 3 px hot outline (global.css); aria-invalid → horúci rám. */
import * as React from 'react';

import { cn } from '@/lib/utils';
import './theme.css';

function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-12 w-full min-w-0 rounded-lg border-3 border-ink bg-white px-4 py-2 font-sans text-base font-medium text-ink shadow-brutal-sm transition-shadow duration-(--duration-base) selection:bg-ink selection:text-yellow file:mr-3 file:border-0 file:bg-transparent file:font-display file:font-extrabold file:uppercase placeholder:text-ink/50 focus:shadow-brutal disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-hot aria-invalid:bg-pink',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
