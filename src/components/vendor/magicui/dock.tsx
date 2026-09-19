// Magic UI — Dock + DockIcon (MIT, https://magicui.design/docs/components/dock), vendorované 19. 9. 2026.
// Zmeny oproti registry: bez "use client"; retheme cez tokeny (kontajner brutal: border-3 border-ink rounded-lg
// shadow-brutal bg-white; ikona štvorec s rámom 3 px, pastel token, hover = <farba>-hover); backdrop-blur preč;
// predvolená veľkosť 44 px (cieľ dotyku); `href` + `label` → DockIcon vykreslí <a aria-label>; reduced motion =
// magnifikácia vypnutá (useReducedMotion). Motion = stav komponentu (hover), engine rule dodržané.
import React, { useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, MotionValue, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import type { MotionProps } from 'motion/react';

import { cn } from '@/lib/utils';

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string;
  /** Základná veľkosť ikony v px. @default 44 (≥ 44 px cieľ dotyku) */
  iconSize?: number;
  /** Veľkosť pri myši. @default 64 */
  iconMagnification?: number;
  disableMagnification?: boolean;
  /** Dosah zväčšenia v px. @default 140 */
  iconDistance?: number;
  direction?: 'top' | 'middle' | 'bottom';
  /** Farba kontajnera (token). @default 'white' */
  bg?: 'white' | 'paper' | 'yellow' | 'pink' | 'lilac' | 'lime' | 'sky' | 'ink';
  children: React.ReactNode;
}

const DEFAULT_SIZE = 44;
const DEFAULT_MAGNIFICATION = 64;
const DEFAULT_DISTANCE = 140;
const DEFAULT_DISABLEMAGNIFICATION = false;

const BG: Record<NonNullable<DockProps['bg']>, string> = {
  white: 'bg-white',
  paper: 'bg-paper',
  yellow: 'bg-yellow',
  pink: 'bg-pink',
  lilac: 'bg-lilac',
  lime: 'bg-lime',
  sky: 'bg-sky',
  ink: 'bg-ink',
};

const dockVariants = cva(
  'mx-auto flex w-max max-w-full items-center justify-center gap-2 overflow-x-auto rounded-lg border-3 border-ink p-2 shadow-brutal',
);

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      iconSize = DEFAULT_SIZE,
      iconMagnification = DEFAULT_MAGNIFICATION,
      disableMagnification = DEFAULT_DISABLEMAGNIFICATION,
      iconDistance = DEFAULT_DISTANCE,
      direction = 'middle',
      bg = 'white',
      ...props
    },
    ref,
  ) => {
    const mouseX = useMotionValue(Infinity);
    const reduced = useReducedMotion() ?? false;
    const noMagnify = disableMagnification || reduced;

    const renderChildren = () => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement<DockIconProps>(child) && child.type === DockIcon) {
          return React.cloneElement(child, {
            ...child.props,
            mouseX: mouseX,
            size: iconSize,
            magnification: iconMagnification,
            disableMagnification: noMagnify,
            distance: iconDistance,
          });
        }
        return child;
      });
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        {...props}
        className={cn(dockVariants({ className }), BG[bg], {
          'items-start': direction === 'top',
          'items-center': direction === 'middle',
          'items-end': direction === 'bottom',
        })}
      >
        {renderChildren()}
      </motion.div>
    );
  },
);

Dock.displayName = 'Dock';

export interface DockIconProps extends Omit<MotionProps & React.HTMLAttributes<HTMLElement>, 'children'> {
  size?: number;
  magnification?: number;
  disableMagnification?: boolean;
  distance?: number;
  mouseX?: MotionValue<number>;
  className?: string;
  /** Odkaz — ikona sa vykreslí ako <a>. */
  href?: string;
  /** Prístupný názov (aria-label + title). Povinný, keď je vnútri len ikona. */
  label?: string;
  /** target="_blank" + rel pre externé odkazy. @default false */
  external?: boolean;
  /** Farba dlaždice (token). @default 'yellow' */
  color?: 'yellow' | 'pink' | 'lilac' | 'lime' | 'sky' | 'hot' | 'white' | 'paper';
  children?: React.ReactNode;
}

const TILE: Record<NonNullable<DockIconProps['color']>, string> = {
  yellow: 'bg-yellow hover:bg-yellow-hover',
  pink: 'bg-pink hover:bg-pink-hover',
  lilac: 'bg-lilac hover:bg-lilac-hover',
  lime: 'bg-lime hover:bg-lime-hover',
  sky: 'bg-sky hover:bg-sky-hover',
  hot: 'bg-hot text-ink hover:bg-hot-hover',
  white: 'bg-white hover:bg-white-hover',
  paper: 'bg-paper hover:bg-paper-hover',
};

const DockIcon = ({
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  disableMagnification,
  distance = DEFAULT_DISTANCE,
  mouseX,
  className,
  href,
  label,
  external = false,
  color = 'yellow',
  children,
  ...props
}: DockIconProps) => {
  const ref = useRef<HTMLElement>(null);
  const padding = Math.max(6, size * 0.2);
  const defaultMouseX = useMotionValue(Infinity);

  const distanceCalc = useTransform(mouseX ?? defaultMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const targetSize = disableMagnification ? size : magnification;

  const sizeTransform = useTransform(distanceCalc, [-distance, 0, distance], [size, targetSize, size]);

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const classes = cn(
    'flex aspect-square shrink-0 items-center justify-center rounded-lg border-3 border-ink text-ink shadow-brutal-sm transition-colors',
    'focus-visible:outline-3 focus-visible:outline-hot focus-visible:outline-offset-2',
    TILE[color],
    className,
  );
  const style = { width: scaleSize, height: scaleSize, padding };

  if (href) {
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-label={label}
        title={label}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        style={style}
        className={classes}
        {...(props as HTMLMotionProps<'a'>)}
      >
        <span className="flex size-full items-center justify-center">{children}</span>
      </motion.a>
    );
  }

  return (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      role={label ? 'img' : undefined}
      aria-label={label}
      title={label}
      style={style}
      className={classes}
      {...(props as HTMLMotionProps<'div'>)}
    >
      <span className="flex size-full items-center justify-center">{children}</span>
    </motion.div>
  );
};

DockIcon.displayName = 'DockIcon';

type HTMLMotionProps<T extends 'a' | 'div'> = React.ComponentProps<(typeof motion)[T]>;

export { Dock, DockIcon, dockVariants };
export default Dock;
