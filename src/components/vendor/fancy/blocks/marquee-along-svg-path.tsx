// Fancy Components (MIT, (c) Daniel Petho) — https://www.fancycomponents.dev/r/marquee-along-svg-path.json
// Úpravy xvadur.com v4: hooky z `items.map` presunuté do <MarqueeItem/> (pravidlá hookov), `useId` namiesto Math.random
// (stabilná hydratácia), reduced motion → položky stoja na dráhe (baseVelocity 0, drag vypnutý), `pathClassName`
// pre viditeľnú dráhu cez tokeny (napr. `text-ink`), ostatná logika pôvodná.
import React, { useCallback, useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
  type SpringOptions,
} from 'motion/react';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '../hooks/use-media';

const wrap = (min: number, max: number, value: number): number => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

type PreserveAspectRatioAlign =
  | 'none'
  | 'xMinYMin'
  | 'xMidYMin'
  | 'xMaxYMin'
  | 'xMinYMid'
  | 'xMidYMid'
  | 'xMaxYMid'
  | 'xMinYMax'
  | 'xMidYMax'
  | 'xMaxYMax';
type PreserveAspectRatioMeetOrSlice = 'meet' | 'slice';
export type PreserveAspectRatio =
  | PreserveAspectRatioAlign
  | `${Exclude<PreserveAspectRatioAlign, 'none'>} ${PreserveAspectRatioMeetOrSlice}`;

export interface CSSVariableInterpolation {
  property: string;
  from: number | string;
  to: number | string;
}

export interface MarqueeAlongSvgPathProps {
  children: ReactNode;
  className?: string;

  /** SVG `d` dráhy (v jednotkách `viewBox`) */
  path: string;
  pathId?: string;
  preserveAspectRatio?: PreserveAspectRatio;
  /** vykresliť dráhu (stroke currentColor → farba cez `pathClassName`, napr. `text-ink`) */
  showPath?: boolean;
  pathClassName?: string;
  pathStrokeWidth?: number | string;

  width?: string | number;
  height?: string | number;
  viewBox?: string;

  /** % dráhy za sekundu */
  baseVelocity?: number;
  direction?: 'normal' | 'reverse';
  easing?: (value: number) => number;
  slowdownOnHover?: boolean;
  slowDownFactor?: number;
  slowDownSpringConfig?: SpringOptions;

  useScrollVelocity?: boolean;
  scrollAwareDirection?: boolean;
  scrollSpringConfig?: SpringOptions;
  scrollContainer?: RefObject<HTMLElement | null> | HTMLElement | null;

  /** koľkokrát zopakovať deti po dráhe */
  repeat?: number;

  draggable?: boolean;
  dragSensitivity?: number;
  dragVelocityDecay?: number;
  dragAwareDirection?: boolean;
  grabCursor?: boolean;

  enableRollingZIndex?: boolean;
  zIndexBase?: number;
  zIndexRange?: number;

  cssVariableInterpolation?: CSSVariableInterpolation[];

  /** škálovať vnútro podľa kontajnera (bez re-renderu) */
  responsive?: boolean;
}

interface MarqueeItemProps {
  child: ReactNode;
  itemIndex: number;
  itemCount: number;
  repeatIndex: number;
  baseOffset: MotionValue<number>;
  path: string;
  easing?: (value: number) => number;
  calculateZIndex: (offsetDistance: number) => number | undefined;
  enableRollingZIndex: boolean;
  cssVariableInterpolation: CSSVariableInterpolation[];
  grab: boolean;
  onHover: (hovered: boolean) => void;
}

function MarqueeItem({
  child,
  itemIndex,
  itemCount,
  repeatIndex,
  baseOffset,
  path,
  easing,
  calculateZIndex,
  enableRollingZIndex,
  cssVariableInterpolation,
  grab,
  onHover,
}: MarqueeItemProps) {
  const itemOffset = useTransform(baseOffset, (v) => {
    const position = (itemIndex * 100) / itemCount;
    const wrappedValue = wrap(0, 100, v + position);
    return `${easing ? easing(wrappedValue / 100) * 100 : wrappedValue}%`;
  });
  const currentOffsetDistance = useMotionValue(0);
  const zIndex = useTransform(currentOffsetDistance, (value) => calculateZIndex(value));

  useEffect(() => {
    const unsubscribe = itemOffset.on('change', (value: string) => {
      const match = value.match(/^([\d.]+)%$/);
      if (match && match[1]) currentOffsetDistance.set(parseFloat(match[1]));
    });
    return unsubscribe;
  }, [itemOffset, currentOffsetDistance]);

  // CSS premenné (cssVariableInterpolation) sa zapisujú priamo na DOM uzol — žiadne hooky v cykle.
  const nodeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!cssVariableInterpolation.length) return;
    const apply = (v: number) => {
      const el = nodeRef.current;
      if (!el) return;
      const t = Math.max(0, Math.min(1, v / 100));
      cssVariableInterpolation.forEach(({ property, from, to }) => {
        const value = typeof from === 'number' && typeof to === 'number' ? from + (to - from) * t : t < 0.5 ? from : to;
        el.style.setProperty(property, String(value));
      });
    };
    apply(currentOffsetDistance.get());
    return currentOffsetDistance.on('change', apply);
  }, [cssVariableInterpolation, currentOffsetDistance]);

  return (
    <motion.div
      ref={nodeRef}
      className={cn('absolute top-0 left-0', grab && 'cursor-grab')}
      style={{
        offsetPath: `path('${path}')`,
        offsetDistance: itemOffset,
        zIndex: enableRollingZIndex ? zIndex : undefined,
        willChange: 'offset-distance',
        backfaceVisibility: 'hidden',
      }}
      aria-hidden={repeatIndex > 0}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {child}
    </motion.div>
  );
}

export function MarqueeAlongSvgPath({
  children,
  className,
  path,
  pathId,
  preserveAspectRatio = 'xMidYMid meet',
  showPath = false,
  pathClassName,
  pathStrokeWidth = 3,
  width = '100%',
  height = '100%',
  viewBox = '0 0 100 100',
  baseVelocity = 5,
  direction = 'normal',
  easing,
  slowdownOnHover = false,
  slowDownFactor = 0.3,
  slowDownSpringConfig = { damping: 50, stiffness: 400 },
  useScrollVelocity = false,
  scrollAwareDirection = false,
  scrollSpringConfig = { damping: 50, stiffness: 400 },
  scrollContainer,
  repeat = 3,
  draggable = false,
  dragSensitivity = 0.2,
  dragVelocityDecay = 0.96,
  dragAwareDirection = false,
  grabCursor = false,
  enableRollingZIndex = true,
  zIndexBase = 1,
  zIndexRange = 10,
  cssVariableInterpolation = [],
  responsive = false,
}: MarqueeAlongSvgPathProps) {
  const container = useRef<HTMLDivElement>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const baseOffset = useMotionValue(0);
  const pathRef = useRef<SVGPathElement>(null);
  const reduced = useReducedMotion();
  const canDrag = draggable && !reduced;
  const generatedId = useId();
  const id = pathId || `marquee-path-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    if (!responsive) return;
    const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    const originalWidth = vbWidth || 100;
    const originalHeight = vbHeight || 100;

    const updateScale = () => {
      const wrapper = container.current;
      const marqueeContainer = marqueeContainerRef.current;
      if (!wrapper || !marqueeContainer) return;
      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;
      const scale = Math.min(wrapperWidth / originalWidth, wrapperHeight / originalHeight);
      const offsetX = (wrapperWidth - originalWidth * scale) / 2;
      const offsetY = (wrapperHeight - originalHeight * scale) / 2;
      marqueeContainer.style.width = `${originalWidth}px`;
      marqueeContainer.style.height = `${originalHeight}px`;
      marqueeContainer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      marqueeContainer.style.transformOrigin = 'top left';
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [responsive, viewBox]);

  const items = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    return childrenArray.flatMap((child, childIndex) =>
      Array.from({ length: repeat }, (_, repeatIndex) => ({
        child,
        childIndex,
        repeatIndex,
        itemIndex: repeatIndex * childrenArray.length + childIndex,
        key: `${childIndex}-${repeatIndex}`,
      })),
    );
  }, [children, repeat]);

  const calculateZIndex = useCallback(
    (offsetDistance: number) => {
      if (!enableRollingZIndex) return undefined;
      return Math.floor(zIndexBase + (offsetDistance / 100) * zIndexRange);
    },
    [enableRollingZIndex, zIndexBase, zIndexRange],
  );

  const { scrollY } = useScroll({
    container: (scrollContainer as RefObject<HTMLDivElement | null>) || container,
  });
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, scrollSpringConfig);

  const isHovered = useRef(false);
  const isDragging = useRef(false);
  const dragVelocity = useRef(0);
  const directionFactor = useRef(direction === 'normal' ? 1 : -1);

  const hoverFactorValue = useMotionValue(1);
  const defaultVelocity = useMotionValue(1);
  const smoothHoverFactor = useSpring(hoverFactorValue, slowDownSpringConfig);

  const velocityFactor = useTransform(useScrollVelocity ? smoothVelocity : defaultVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  useAnimationFrame((_, delta) => {
    if (reduced) return;

    if (isDragging.current && canDrag) {
      baseOffset.set(baseOffset.get() + dragVelocity.current);
      dragVelocity.current *= 0.9;
      if (Math.abs(dragVelocity.current) < 0.01) dragVelocity.current = 0;
      return;
    }

    hoverFactorValue.set(isHovered.current && slowdownOnHover ? slowDownFactor : 1);

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000) * smoothHoverFactor.get();

    if (scrollAwareDirection && !isDragging.current) {
      if (velocityFactor.get() < 0) directionFactor.current = -1;
      else if (velocityFactor.get() > 0) directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    if (canDrag) {
      moveBy += dragVelocity.current;
      if (dragAwareDirection && Math.abs(dragVelocity.current) > 0.1) {
        directionFactor.current = Math.sign(dragVelocity.current);
      }
      if (!isDragging.current && Math.abs(dragVelocity.current) > 0.01) {
        dragVelocity.current *= dragVelocityDecay;
      } else if (!isDragging.current) {
        dragVelocity.current = 0;
      }
    }

    baseOffset.set(baseOffset.get() + moveBy);
  });

  const lastPointerPosition = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canDrag) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (grabCursor) (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
    isDragging.current = true;
    lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    dragVelocity.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canDrag || !isDragging.current) return;
    const deltaX = e.clientX - lastPointerPosition.current.x;
    const deltaY = e.clientY - lastPointerPosition.current.y;
    const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    dragVelocity.current = (deltaX > 0 ? delta : -delta) * dragSensitivity;
    lastPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!canDrag) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    isDragging.current = false;
    if (grabCursor) (e.currentTarget as HTMLElement).style.cursor = 'grab';
  };

  const setHover = useCallback((h: boolean) => {
    isHovered.current = h;
  }, []);

  return (
    <div
      ref={container}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn('relative', canDrag && 'touch-pan-y', className)}
    >
      <div ref={marqueeContainerRef} className="relative" style={{ contain: 'layout style' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={width}
          height={height}
          viewBox={viewBox}
          preserveAspectRatio={preserveAspectRatio}
          className={cn('h-full w-full', pathClassName)}
          aria-hidden="true"
        >
          <path
            id={id}
            d={path}
            stroke={showPath ? 'currentColor' : 'none'}
            strokeWidth={showPath ? pathStrokeWidth : undefined}
            fill="none"
            ref={pathRef}
          />
        </svg>

        {items.map(({ child, repeatIndex, itemIndex, key }) => (
          <MarqueeItem
            key={key}
            child={child}
            itemIndex={itemIndex}
            itemCount={items.length}
            repeatIndex={repeatIndex}
            baseOffset={baseOffset}
            path={path}
            easing={easing}
            calculateZIndex={calculateZIndex}
            enableRollingZIndex={enableRollingZIndex}
            cssVariableInterpolation={cssVariableInterpolation}
            grab={canDrag && grabCursor}
            onHover={setHover}
          />
        ))}
      </div>
    </div>
  );
}

export default MarqueeAlongSvgPath;
