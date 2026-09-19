/*!
 * TiltedCard — React Bits (https://reactbits.dev/components/tilted-card)
 * Copyright (c) 2026 David Haz — MIT + Commons Clause. Vendorované do xvadur.com v4 ako súčasť webu.
 * Úpravy (retheme): karta je brutal (border-3 border-ink rounded-lg shadow-brutal bg-white), obrázok voliteľný,
 * ľubovoľné deti ako obsah karty, bublina za kurzorom = sticker, bez „not optimized for mobile“ hlášky,
 * tilt len s jemným ukazovateľom a bez reduced motion (dotyk = statická karta s lift/press presetmi), cn().
 * Ostrov: client:visible (Motion, bez window pri importe).
 */
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, type SpringOptions } from 'motion/react';
import { cn } from '@/lib/utils';
import { usePointerEffectAllowed } from './motion-guards';

export interface TiltedCardProps {
  /** obrázok (voliteľný); bez neho karta ukáže len deti */
  imageSrc?: string;
  altText?: string;
  /** text bubliny, ktorá nasleduje kurzor (sticker) */
  captionText?: string;
  containerHeight?: CSSProperties['height'];
  containerWidth?: CSSProperties['width'];
  imageHeight?: CSSProperties['height'];
  imageWidth?: CSSProperties['width'];
  scaleOnHover?: number;
  /** max. náklon v stupňoch */
  rotateAmplitude?: number;
  showTooltip?: boolean;
  /** obsah nad obrázkom (translateZ 30 px) */
  overlayContent?: ReactNode;
  displayOverlayContent?: boolean;
  /** farba plochy karty cez token (bg-white default) */
  surfaceClassName?: string;
  className?: string;
  children?: ReactNode;
}

const springValues: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };

export default function TiltedCard({
  imageSrc,
  altText = '',
  captionText = '',
  containerHeight,
  containerWidth = '100%',
  imageHeight = 'auto',
  imageWidth = '100%',
  scaleOnHover = 1.04,
  rotateAmplitude = 10,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  surfaceClassName,
  className,
  children,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const allowed = usePointerEffectAllowed(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });
  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current || !allowed) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    if (!allowed) return;
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className={cn('relative flex flex-col items-center justify-center [perspective:800px]', className)}
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-tilt={allowed ? 'on' : 'off'}
    >
      <motion.div
        className={cn(
          'relative w-full overflow-hidden rounded-lg border-3 border-ink bg-white shadow-brutal [transform-style:preserve-3d]',
          !allowed && 'lift press',
          surfaceClassName,
        )}
        style={{ rotateX, rotateY, scale }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt={altText}
            className="block object-cover will-change-transform [transform:translateZ(0)]"
            style={{ width: imageWidth, height: imageHeight }}
            loading="lazy"
            decoding="async"
          />
        )}
        {children}
        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute left-0 top-0 z-[2] will-change-transform [transform:translateZ(30px)]">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {showTooltip && captionText && allowed && (
        <motion.figcaption
          aria-hidden="true"
          className="sticker pointer-events-none absolute left-0 top-0 z-[3] [--sticker-rotate:0deg]"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
