/** Merač skóre 0–100 ako SVG polkruh v tokenoch (stroke cez Tailwind utility stroke-ink/stroke-hot, žiadny hex).
 *  Montuje sa s 0 a ďalší frame dostane cieľ → oblúk sa dokreslí cez stroke-dashoffset (CSS transition 500 ms,
 *  pri reduced motion globálne 120 ms) a NumberFlow napočíta číslo (pod reduced motion skočí sám). */
import { useEffect, useState } from 'react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';

export interface GaugeProps {
  value: number;
  /** popis pod číslom */
  label?: string;
  className?: string;
}

const R = 84;
const CX = 100;
const CY = 100;
/** dĺžka polkruhu */
const LEN = Math.PI * R;

export default function Gauge({ value, label = 'zo 100', className }: GaugeProps) {
  const ciel = Math.max(0, Math.min(100, Math.round(value)));
  const [v, setV] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setV(ciel));
    return () => cancelAnimationFrame(id);
  }, [ciel]);
  const offset = LEN * (1 - v / 100);
  const path = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
  return (
    <div className={cn('relative mx-auto w-full max-w-72', className)}>
      <svg viewBox="0 -8 200 126" className="block h-auto w-full" role="img" aria-label={`Skóre ${ciel} zo 100`}>
        {/* dráha */}
        <path d={path} className="fill-none stroke-ink" strokeWidth="18" strokeLinecap="butt" />
        {/* biely vnútro dráhy (papier) */}
        <path d={path} className="fill-none stroke-paper" strokeWidth="12" strokeLinecap="butt" />
        {/* hodnota */}
        <path
          d={path}
          className="fill-none stroke-hot transition-[stroke-dashoffset] duration-(--duration-slow) ease-(--ease-out-hard)"
          strokeWidth="12"
          strokeLinecap="butt"
          strokeDasharray={LEN}
          strokeDashoffset={offset}
        />
        {/* dieliky 0 · 50 · 100 */}
        <text x={CX - R} y={CY + 14} textAnchor="middle" className="fill-ink font-mono text-[9px]">
          0
        </text>
        <text x={CX} y={CY - R - 8} textAnchor="middle" className="fill-ink font-mono text-[9px]">
          50
        </text>
        <text x={CX + R} y={CY + 14} textAnchor="middle" className="fill-ink font-mono text-[9px]">
          100
        </text>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center leading-none">
        <span className="font-display text-6xl font-extrabold tabular-nums tracking-tighter sm:text-7xl">
          <NumberFlow value={v} locales="sk-SK" />
        </span>
        <span className="eyebrow mt-1 text-ink/70">{label}</span>
      </div>
    </div>
  );
}
