/* Separator — neobrutalism.dev ho v registry nemá (/r/separator.json → 404), preto je to shadcn Separator
   (MIT, shadcn) na radix-ui Separator, retheme cez tokeny xvadur v4: 3 px ink linka; variant `x` = utilita x-divider
   (X + hrubá linka + mono štítok, doc 10 §3 #11 „Deliče sekcií s X"). */
import * as React from 'react';
import { Separator as SeparatorPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';
import './theme.css';

export type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  /** `x` = X delič so štítkom (len horizontálne) */
  variant?: 'default' | 'x';
  /** mono štítok pri variante x */
  label?: string;
};

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  variant = 'default',
  label,
  children,
  ...props
}: SeparatorProps) {
  if (variant === 'x') {
    return (
      <SeparatorPrimitive.Root
        data-slot="separator"
        data-variant="x"
        decorative={decorative}
        orientation="horizontal"
        className={cn('x-divider w-full', className)}
        {...props}
      >
        {label ?? children}
      </SeparatorPrimitive.Root>
    );
  }
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 rounded-sm bg-ink data-[orientation=horizontal]:h-[3px] data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-[3px]',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
