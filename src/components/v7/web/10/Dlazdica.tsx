/** V7-10 · Dlaždica = nástroj na podnose. Tri vrstvy, aby sa motory nebili:
 *   1. bunka mriežky (.v10-bunka) — CSS: položenie na podnos pri vstupe do obrazu (animation-timeline: view()).
 *   2. magnet (motion.div) — Motion: dlaždica sa nakloní k myši (spring, bez odrazu), iba jemná myš ≥ 1024 px, nie reduced.
 *   3. nástroj (.v10-dl) — CSS podpis: pri hoveri/fokuse sa „zdvihne“ z podnosu (tieň 6 → 11 px, posun −5 px),
 *      detail sa rozbalí zdola s --bk-ease-rubber. Na dotyku rozbalí detail tlačidlo „+“ (aria-expanded).
 *  Nikdy GSAP; Motion iba na vrstve 2, CSS transition iba na vrstve 3. */
import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useFinePointer, useReducedMotionFlag } from '@/components/vendor/motionprimitives/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

export type Ton = 'paper' | 'white' | 'yellow' | 'ink' | 'stamp';

const TON: Record<Ton, string> = {
  paper: 'bg-paper text-ink',
  white: 'bg-white text-ink',
  yellow: 'bg-yellow text-ink',
  ink: 'bg-ink text-paper',
  stamp: 'bg-stamp text-paper',
};

export type DlazdicaProps = {
  /** triedy bunky mriežky (col-span / row-span) */
  className?: string;
  /** triedy samotného nástroja */
  innerClassName?: string;
  tone?: Ton;
  /** štítok nástroja v rohu, napr. „N-04 · monitor“ */
  stitok?: string;
  /** obsah, ktorý sa rozbalí zdola */
  detail?: React.ReactNode;
  detailNazov?: string;
  /** magnet vypnutý (napr. dlaždica s formulárom) */
  bezMagnetu?: boolean;
  id?: string;
  as?: 'article' | 'div' | 'section';
  ariaLabel?: string;
  children: React.ReactNode;
};

const PRUZINA = { stiffness: 260, damping: 26, mass: 0.6 };

export function Dlazdica({
  className,
  innerClassName,
  tone = 'white',
  stitok,
  detail,
  detailNazov = 'Detail',
  bezMagnetu,
  id,
  as = 'article',
  ariaLabel,
  children,
}: DlazdicaProps) {
  const reduced = useReducedMotionFlag();
  const jemna = useFinePointer();
  const magnet = !bezMagnetu && jemna && !reduced;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, PRUZINA);
  const sy = useSpring(y, PRUZINA);
  const [otvorene, setOtvorene] = React.useState(false);
  const detailId = React.useId();
  const Tag = as;

  const pohyb = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!magnet || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    // malé nástroje ťahá viac, veľké menej (max 7 px)
    const sila = Math.max(3, Math.min(7, 1400 / Math.max(r.width, r.height)));
    x.set(dx * sila);
    y.set(dy * sila);
  };
  const von = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div id={id} className={cn('v10-bunka relative min-w-0', className)}>
      <motion.div className="h-full" style={magnet ? { x: sx, y: sy } : undefined} onPointerMove={pohyb} onPointerLeave={von}>
        <Tag
          aria-label={ariaLabel}
          data-otvorene={otvorene ? 'true' : undefined}
          className={cn('v10-dl relative flex h-full min-w-0 flex-col overflow-hidden border-3 border-ink', TON[tone], innerClassName)}
        >
          {stitok && (
            <span className="v10-stitok" aria-hidden="true">
              {stitok}
            </span>
          )}
          {children}
          {detail && (
            <>
              <button
                type="button"
                className="v10-plus"
                aria-expanded={otvorene}
                aria-controls={detailId}
                onClick={() => setOtvorene((o) => !o)}
              >
                <span aria-hidden="true">{otvorene ? '−' : '+'}</span>
                <span className="sr-only">{otvorene ? `Zbaliť: ${detailNazov}` : `Rozbaliť: ${detailNazov}`}</span>
              </button>
              <div id={detailId} className="v10-detail" role="region" aria-label={detailNazov}>
                {detail}
              </div>
            </>
          )}
        </Tag>
      </motion.div>
    </div>
  );
}

/** Nadpis podnosu vo vnútri dlaždice (eyebrow + veľký titulok). */
export function Etiketa({ cislo, nazov, className }: { cislo: string; nazov: string; className?: string }) {
  return (
    <p className={cn('font-mono text-xs font-bold tracking-[0.18em] uppercase sm:text-sm', className)}>
      ✚ Podnos {cislo} · {nazov}
    </p>
  );
}
