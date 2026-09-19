// Magic UI — Shine Border (MIT, https://magicui.design/docs/components/shine-border), vendorované 19. 9. 2026.
// Zmeny: bez "use client"; keyframes `animate-shine` nie sú v tokens.css (read-only), preto hoistovaný <style>;
// predvolená farba = var(--color-hot) → var(--color-yellow) (tokeny, nie hex); hrúbka 3 px ako brutal rám.
// Voliteľný komponent (doc 10 §3 „shine-border (optional)"). motion-safe: pri reduced motion stojí (statický rám).
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hrúbka rámu v px. @default 3 */
  borderWidth?: number;
  /** Dĺžka jedného cyklu v sekundách. @default 14 */
  duration?: number;
  /** Farba(y) lesku — CSS hodnoty, ideálne var(--color-*). @default ['var(--color-hot)', 'var(--color-yellow)'] */
  shineColor?: string | string[];
}

const SHINE_CSS = `
@keyframes magicui-shine { 0% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } to { background-position: 0% 0%; } }
@media (prefers-reduced-motion: no-preference) {
  .magicui-shine { animation: magicui-shine var(--duration, 14s) linear infinite; }
}
`;

/** Rodič musí byť `relative` a mať `rounded-*`; ShineBorder sa položí cez celý rodičov rám. */
export function ShineBorder({
  borderWidth = 3,
  duration = 14,
  shineColor = ['var(--color-hot)', 'var(--color-yellow)'],
  className,
  style,
  ...props
}: ShineBorderProps) {
  const colors = Array.isArray(shineColor) ? shineColor.join(',') : shineColor;
  return (
    <>
      <style href="magicui-shine" precedence="default">{SHINE_CSS}</style>
      <div
        aria-hidden="true"
        style={
          {
            '--border-width': `${borderWidth}px`,
            '--duration': `${duration}s`,
            backgroundImage: `radial-gradient(transparent,transparent, ${colors},transparent,transparent)`,
            backgroundSize: '300% 300%',
            mask: 'linear-gradient(currentColor 0 0) content-box, linear-gradient(currentColor 0 0)',
            WebkitMask: 'linear-gradient(currentColor 0 0) content-box, linear-gradient(currentColor 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: 'var(--border-width)',
            ...style,
          } as React.CSSProperties
        }
        className={cn('magicui-shine pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]', className)}
        {...props}
      />
    </>
  );
}

export default ShineBorder;
