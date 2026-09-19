/** Natívny <select> s brutal rethemom (rám 3 px ink, radius 8, tieň 3/3 → 6/6 pri fokuse, výška 48 px).
 *  Náhrada za Radix Select v Intake: 0 kB Radixu, funguje aj v kontrolovanom <form> bez odloženého predvyplnenia.
 *  Šípka = Phosphor ikona (currentColor), bez ručného hexu v background-image. */
import * as React from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';

import { SELECT } from './ui';

function NativeSelect({ className = '', children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative w-full min-w-0">
      <select data-slot="native-select" className={`${SELECT} ${className}`.trim()} {...props}>
        {children}
      </select>
      <CaretDownIcon
        weight="bold"
        size={20}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink"
      />
    </div>
  );
}

export { NativeSelect };
