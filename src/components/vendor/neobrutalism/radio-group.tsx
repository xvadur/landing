/* neobrutalism.dev RadioGroup (MIT, (c) 2023 Samuel Breznjak) — Radix verzia (be6e0e2), retheme cez tokeny xvadur v4.
   Zmeny: @radix-ui/react-radio-group → radix-ui RadioGroup; lucide Circle → Phosphor CircleIcon (fill); „use client" odstránené;
   kruh 24 px s rámom 3 px (dotyková plocha 44 px cez ::before), zvolený = žltá plocha; pridaný RadioGroupCard = celá karta ako cieľ ≥ 48 px (kvíz, doc 10 §3 #17). */
import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { CircleIcon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import './theme.css';

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn('grid gap-3', className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'press relative inline-flex aspect-square size-6 shrink-0 items-center justify-center rounded-full border-3 border-ink bg-white text-ink shadow-brutal-sm before:absolute before:-inset-2.5 before:content-[""] data-[state=checked]:bg-yellow disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-hot',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="flex items-center justify-center">
        <CircleIcon weight="fill" size={12} aria-hidden="true" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

/** Karta ako voľba: celý riadok je klikací (label), zvolená karta zožltne a dostane tieň.
 *  <RadioGroupCard value="a">Text voľby</RadioGroupCard> */
function RadioGroupCard({
  className,
  children,
  value,
  disabled,
  id,
  ...props
}: React.ComponentProps<'label'> & Pick<React.ComponentProps<typeof RadioGroupPrimitive.Item>, 'value' | 'disabled'>) {
  const generated = React.useId();
  const itemId = id ?? `radio-${generated}`;
  return (
    <label
      htmlFor={itemId}
      data-slot="radio-group-card"
      className={cn(
        'lift flex min-h-12 cursor-pointer items-center gap-4 rounded-lg border-3 border-ink bg-white px-4 py-3 font-sans text-base font-bold text-ink shadow-brutal-sm has-data-[state=checked]:bg-yellow has-data-[state=checked]:shadow-brutal has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupItem id={itemId} value={value} disabled={disabled} className="shadow-none" />
      <span className="flex-1">{children}</span>
    </label>
  );
}

export { RadioGroup, RadioGroupItem, RadioGroupCard };
