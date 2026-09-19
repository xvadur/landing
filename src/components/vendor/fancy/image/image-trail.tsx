// Fancy Components (MIT, (c) Daniel Petho; autor komponentu Khoa Phan <https://www.pldkhoa.dev>)
// https://www.fancycomponents.dev/r/image-trail.json
// Úpravy xvadur.com v4: bez "use client"; beží LEN na desktope s myšou (≥ 1024 px, hover, fine pointer) a bez
// reduced motion — inak sa deti nevykreslia vôbec (0 práce na mobile, doc 10 §3 „bez ImageTrail na 375 px");
// Fragment s kľúčom v `repeatChildren`; `as` typované ako ElementType.
import React, { useEffect, useMemo, useRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import type { AnimationOptions, DOMKeyframesDefinition } from 'motion';
import { useAnimate } from 'motion/react';

import { cn } from '@/lib/utils';
import { useFinePointerDesktop, useReducedMotion } from '../hooks/use-media';

export interface ImageTrailProps extends HTMLAttributes<HTMLDivElement> {
  /** Deti = <ImageTrailItem/> prvky (obrázky alebo brutal karty) */
  children: ReactNode;
  as?: ElementType;
  /** koľko px musí myš prejsť, kým sa objaví ďalší prvok */
  threshold?: number;
  /** zotrvačnosť za myšou (0–1), default 0.3 */
  intensity?: number;
  /** keyframes prvku, napr. { scale: [0, 1, 1, 0], rotate: [-6, 0, 0, 6] } */
  keyframes?: DOMKeyframesDefinition;
  /** napr. { duration: 1, times: [0, 0.1, 0.9, 1] } */
  keyframesOptions?: AnimationOptions;
  trailElementAnimationKeyframes?: { x?: AnimationOptions; y?: AnimationOptions };
  /** koľkokrát zopakovať deti (viac = dlhšia stopa) */
  repeatChildren?: number;
  baseZIndex?: number;
  zIndexDirection?: 'new-on-top' | 'old-on-top';
  /** vynútiť zapnutie/vypnutie (default: automaticky podľa média) */
  enabled?: boolean;
}

export interface ImageTrailItemProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  children: ReactNode;
}

const MathUtils = {
  lerp: (a: number, b: number, n: number) => (1 - n) * a + n * b,
  distance: (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2 - x1, y2 - y1),
};

export function ImageTrail({
  className,
  as = 'div',
  children,
  threshold = 100,
  intensity = 0.3,
  keyframes,
  keyframesOptions,
  repeatChildren = 3,
  trailElementAnimationKeyframes = {
    x: { duration: 1, type: 'tween', ease: 'easeOut' },
    y: { duration: 1, type: 'tween', ease: 'easeOut' },
  },
  baseZIndex = 0,
  zIndexDirection = 'new-on-top',
  enabled,
  ...props
}: ImageTrailProps) {
  const allImages = useRef<NodeListOf<HTMLElement> | undefined>(undefined);
  const currentId = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const cachedMousePos = useRef({ x: 0, y: 0 });
  const [containerRef, animate] = useAnimate<HTMLDivElement>();
  const zIndices = useRef<number[]>([]);
  const desktop = useFinePointerDesktop();
  const reduced = useReducedMotion();
  const active = enabled ?? (desktop && !reduced);

  const clampedIntensity = useMemo(() => Math.max(0.0001, Math.min(1, intensity)), [intensity]);

  useEffect(() => {
    if (!active) return;
    const list = containerRef.current?.querySelectorAll<HTMLElement>('.image-trail-item');
    allImages.current = list;
    zIndices.current = Array.from({ length: list?.length ?? 0 }, (_, index) => index);
  }, [containerRef, active, repeatChildren, children]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!active) return;
    const containerRect = containerRef.current?.getBoundingClientRect();
    const mousePos = { x: e.clientX - (containerRect?.left || 0), y: e.clientY - (containerRect?.top || 0) };

    cachedMousePos.current.x = MathUtils.lerp(cachedMousePos.current.x || mousePos.x, mousePos.x, clampedIntensity);
    cachedMousePos.current.y = MathUtils.lerp(cachedMousePos.current.y || mousePos.y, mousePos.y, clampedIntensity);

    const distance = MathUtils.distance(mousePos.x, mousePos.y, lastMousePos.current.x, lastMousePos.current.y);
    const images = allImages.current;

    if (distance > threshold && images && images.length) {
      const N = images.length;
      const current = currentId.current;
      const el = images[current]!;

      if (zIndexDirection === 'new-on-top') {
        for (let i = 0; i < N; i++) if (i !== current) zIndices.current[i] = (zIndices.current[i] ?? 0) - 1;
        zIndices.current[current] = N - 1;
      } else {
        for (let i = 0; i < N; i++) if (i !== current) zIndices.current[i] = (zIndices.current[i] ?? 0) + 1;
        zIndices.current[current] = 0;
      }

      el.style.display = 'block';
      images.forEach((img, index) => {
        img.style.zIndex = String((zIndices.current[index] ?? 0) + baseZIndex);
      });

      animate(
        el,
        {
          x: [cachedMousePos.current.x - el.offsetWidth / 2, mousePos.x - el.offsetWidth / 2],
          y: [cachedMousePos.current.y - el.offsetHeight / 2, mousePos.y - el.offsetHeight / 2],
          ...keyframes,
        },
        { ...trailElementAnimationKeyframes.x, ...trailElementAnimationKeyframes.y, ...keyframesOptions },
      );
      currentId.current = (current + 1) % N;
      lastMousePos.current = { x: mousePos.x, y: mousePos.y };
    }
  };

  const ElementTag = (as ?? 'div') as ElementType;

  return (
    <ElementTag
      className={cn('relative h-full w-full overflow-hidden', className)}
      onMouseMove={active ? handleMouseMove : undefined}
      ref={containerRef}
      {...props}
    >
      {active
        ? Array.from({ length: repeatChildren }).map((_, i) => <React.Fragment key={i}>{children}</React.Fragment>)
        : null}
    </ElementTag>
  );
}

export function ImageTrailItem({ className, children, as = 'div', ...props }: ImageTrailItemProps) {
  const ElementTag = (as ?? 'div') as ElementType;
  return (
    <ElementTag
      {...props}
      aria-hidden="true"
      className={cn('pointer-events-none absolute top-0 left-0 hidden will-change-transform', className, 'image-trail-item')}
    >
      {children}
    </ElementTag>
  );
}

export default ImageTrail;
