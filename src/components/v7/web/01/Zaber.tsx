/** V7-01 · zástupná plocha budúceho Higgsfield záberu: presný pomer strán, rám ink, tvrdý tieň, raster a ASCII tvar
 *  (BoldKit ascii-shapes, SSR = prvý snímok) + štítok „HIGGSFIELD: <id>“. Prompty sú v work/v7/vystup/01/README.md. */
import * as React from 'react';
import { AsciiDNA, AsciiGrid, AsciiPulse, AsciiWave } from '@/components/ui/ascii-shapes';
import { cn } from '@/lib/utils';

const TVAR = { dna: AsciiDNA, pulz: AsciiPulse, vlna: AsciiWave, mriezka: AsciiGrid } as const;

export default function Zaber({
  id,
  popis,
  pomer = '16 / 9',
  tvar = 'pulz',
  ton = 'ink',
  className,
  children,
}: {
  id: string;
  popis: string;
  pomer?: string;
  tvar?: keyof typeof TVAR;
  ton?: 'ink' | 'yellow' | 'paper';
  className?: string;
  children?: React.ReactNode;
}) {
  const Tvar = TVAR[tvar];
  return (
    <figure
      className={cn(
        'relative m-0 overflow-hidden border-3 border-ink shadow-[6px_6px_0_0_var(--color-ink)]',
        ton === 'ink' && 'bg-ink text-yellow',
        ton === 'yellow' && 'tx-halftone bg-yellow text-ink',
        ton === 'paper' && 'tx-dots bg-paper text-ink',
        className,
      )}
      style={{ aspectRatio: pomer }}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
        {children ?? (
          <Tvar
            size="md"
            animated={false}
            className="scale-[1.35] border-0 bg-transparent p-0 text-[10px] opacity-80 shadow-none sm:scale-150"
          />
        )}
      </div>
      <div className="m01-riadky pointer-events-none absolute inset-0" aria-hidden="true" />
      <figcaption className="absolute right-2 bottom-2 left-2 flex flex-wrap items-end justify-between gap-2">
        <span className="border-2 border-ink bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
          Higgsfield: {id}
        </span>
        <span className="max-w-[16rem] border-2 border-ink bg-paper px-2 py-0.5 text-right font-mono text-[10px] leading-tight text-ink">
          {popis}
        </span>
      </figcaption>
    </figure>
  );
}
