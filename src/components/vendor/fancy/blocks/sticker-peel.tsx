// StickerPeel — vlastná implementácia xvadur.com v4 (bez cudzej licencie).
// Doc 10 §3 #10 pripísal „Fancy StickerPeel" — Fancy taký komponent nemá (je v React Bits, MIT + Commons Clause, GSAP Draggable).
// Táto verzia: Motion drag + odlepený roh cez clip-path, brutal retheme cez tokeny (border-3 border-ink rounded-lg,
// tvrdý tieň ako samostatná vrstva, aby sa odlepil spolu s rohom). Reduced motion: bez pružiny a bez odlepenia, drag ostáva.
import { useRef, type ReactNode, type RefObject } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '../hooks/use-media';

export interface StickerPeelProps {
  /** obsah nálepky (text „V STAVBE", ikona, obrázok) */
  children: ReactNode;
  className?: string;
  /** farba plochy cez token, napr. `bg-yellow`, `bg-pink`, `bg-lime` (default bg-yellow) */
  colorClassName?: string;
  /** základné natočenie v stupňoch */
  rotate?: number;
  /** veľkosť odlepeného rohu v px (hover), default 28 */
  peelSize?: number;
  /** odlepenie v kľude (0–1 z peelSize), default 0.35 — nálepka vyzerá „prilepená rukou" */
  restPeel?: number;
  /** povoliť ťahanie (default true); mobil: dotyk funguje, `touch-action: none` len na nálepke */
  draggable?: boolean;
  /** hranice ťahania (ref rodiča) */
  dragConstraints?: RefObject<Element | null>;
  /** posun tvrdého tieňa v px (default 4) */
  shadow?: number;
  /** aria-label, ak obsah nie je text */
  label?: string;
}

export function StickerPeel({
  children,
  className,
  colorClassName = 'bg-yellow',
  rotate = -6,
  peelSize = 28,
  restPeel = 0.35,
  draggable = true,
  dragConstraints,
  shadow = 4,
  label,
}: StickerPeelProps) {
  const reduced = useReducedMotion();
  const raw = useMotionValue(restPeel * peelSize);
  const peel = useSpring(raw, reduced ? { duration: 0 } : { stiffness: 420, damping: 26, mass: 0.6 });
  const px = useMotionTemplate`${peel}px`;
  const faceClip = useMotionTemplate`polygon(0 0, 100% 0, 100% calc(100% - ${peel}px), calc(100% - ${peel}px) 100%, 0 100%)`;
  const flapClip = useMotionTemplate`polygon(calc(100% - ${peel}px) 100%, 100% calc(100% - ${peel}px), calc(100% - ${peel}px) calc(100% - ${peel}px))`;
  const ref = useRef<HTMLDivElement>(null);

  const setPeel = (v: number) => {
    if (reduced) return;
    raw.set(v);
  };

  return (
    <motion.div
      ref={ref}
      role={label ? 'img' : undefined}
      aria-label={label}
      drag={draggable}
      dragConstraints={dragConstraints}
      dragElastic={0.12}
      dragMomentum={!reduced}
      whileDrag={reduced ? undefined : { scale: 1.04, rotate: rotate + 4 }}
      whileHover={reduced ? undefined : { rotate: rotate + 2 }}
      onHoverStart={() => setPeel(peelSize)}
      onHoverEnd={() => setPeel(restPeel * peelSize)}
      onDragStart={() => setPeel(peelSize * 1.4)}
      onDragEnd={() => setPeel(restPeel * peelSize)}
      initial={{ rotate }}
      style={{ ['--peel' as string]: px }}
      className={cn(
        'relative inline-block select-none',
        draggable && 'cursor-grab touch-none active:cursor-grabbing',
        className,
      )}
    >
      {/* tvrdý tieň — vlastná vrstva s rovnakým clip-path, aby sa „odlepil" spolu s rohom */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-lg bg-ink"
        style={{ clipPath: faceClip, transform: `translate(${shadow}px, ${shadow}px)` }}
      />
      {/* plocha nálepky */}
      <motion.span
        className={cn(
          'relative block rounded-lg border-3 border-ink px-4 py-2 font-display text-lg font-extrabold uppercase leading-none tracking-tight text-ink',
          colorClassName,
        )}
        style={{ clipPath: faceClip }}
      >
        {children}
      </motion.span>
      {/* odlepený roh — rub nálepky (papier), lem ink */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-lg bg-paper"
        style={{
          clipPath: flapClip,
          backgroundImage: 'linear-gradient(135deg, transparent 55%, var(--color-ink) 55%, var(--color-ink) 62%, transparent 62%)',
        }}
      />
    </motion.div>
  );
}

export default StickerPeel;
