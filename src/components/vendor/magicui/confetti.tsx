// Magic UI — Confetti + ConfettiButton (MIT, https://magicui.design/docs/components/confetti), vendorované 19. 9. 2026.
// Závislosti: canvas-confetti + @types/canvas-confetti (nainštaluje Lab agent; pozri work/NOTES_vendor_magicui.md).
// Zmeny oproti registry: bez "use client"; @/components/ui/button (shadcn) nahradené natívnym <button> v brand vzore
// (press … border-3 border-ink bg-hot shadow-brutal); farby konfiet sa čítajú z tokenov za behu
// (--color-yellow/pink/lilac/lime/sky/hot na :root, canvas-confetti berie len hex → OKLCH ink sa vynechá);
// tvar štvorec (brutal), `disableForReducedMotion: true` predvolene (natívna voľba knižnice) + vlastná kontrola matchMedia.
import type { ReactNode } from 'react';
import React, { createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from 'canvas-confetti';
import confetti from 'canvas-confetti';

import { cn } from '@/lib/utils';

export type ConfettiRef = {
  fire: (options?: ConfettiOptions) => Promise<void> | void;
};

const TOKEN_COLORS = ['--color-yellow', '--color-pink', '--color-lilac', '--color-lime', '--color-sky', '--color-hot'];

/** Farby konfiet z tokenov (len hex hodnoty, canvas-confetti iné neparsuje). Prázdne pole = default knižnice. */
export function brandConfettiColors(): string[] {
  if (typeof window === 'undefined') return [];
  const root = getComputedStyle(document.documentElement);
  return TOKEN_COLORS.map((v) => root.getPropertyValue(v).trim()).filter((c) => /^#[0-9a-f]{6}$/i.test(c));
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Brutal predvoľby: štvorce, viac kusov, tokenové farby. */
export function brandConfettiOptions(): ConfettiOptions {
  const colors = brandConfettiColors();
  return {
    particleCount: 120,
    spread: 70,
    startVelocity: 40,
    scalar: 1.2,
    shapes: ['square'],
    disableForReducedMotion: true,
    ...(colors.length ? { colors } : {}),
  };
}

type Props = React.ComponentPropsWithRef<'canvas'> & {
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  children?: ReactNode;
};

const ConfettiContext = createContext<ConfettiRef | null>(null);

/** Hook pre potomkov <Confetti>: const { fire } = useConfetti(). */
export const useConfetti = () => useContext(ConfettiContext);

const ConfettiComponent = forwardRef<ConfettiRef, Props>((props, ref) => {
  const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, children, className, ...rest } = props;

  const canvasNodeRef = useRef<HTMLCanvasElement | null>(null);
  const instanceRef = useRef<ConfettiInstance | null>(null);
  const optionsRef = useRef(options);
  const globalOptionsRef = useRef(globalOptions);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    globalOptionsRef.current = globalOptions;
  }, [globalOptions]);

  useEffect(() => {
    if (canvasNodeRef.current && !instanceRef.current) {
      instanceRef.current = confetti.create(canvasNodeRef.current, {
        resize: true,
        useWorker: true,
        ...globalOptionsRef.current,
      });
    }

    return () => {
      instanceRef.current?.reset();
      instanceRef.current = null;
    };
  }, []);

  const fire = useCallback(async (opts: ConfettiOptions = {}) => {
    if (prefersReducedMotion()) return;
    try {
      await instanceRef.current?.({
        ...brandConfettiOptions(),
        ...optionsRef.current,
        ...opts,
      });
    } catch (error) {
      console.error('Confetti error:', error);
    }
  }, []);

  const api = useMemo<ConfettiRef>(() => ({ fire }), [fire]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!manualstart) {
      void fire();
    }
  }, [manualstart, fire]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas ref={canvasNodeRef} aria-hidden="true" className={cn('pointer-events-none', className)} {...rest} />
      {children}
    </ConfettiContext.Provider>
  );
});

ConfettiComponent.displayName = 'Confetti';

export const Confetti = ConfettiComponent;

export const CONFETTI_BUTTON_CLASS =
  'press inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-hot px-5 font-display text-lg font-extrabold uppercase text-ink shadow-brutal';

export interface ConfettiButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  options?: ConfettiOptions & ConfettiGlobalOptions & { canvas?: HTMLCanvasElement };
}

/** Tlačidlo v brand vzore; pri kliku vystrelí konfety z jeho stredu (globálny canvas, zIndex 9999). */
export const ConfettiButton = forwardRef<HTMLButtonElement, ConfettiButtonProps>(({ options, children, onClick, className, ...props }, ref) => {
  const handleClick: ConfettiButtonProps['onClick'] = async (event) => {
    try {
      onClick?.(event);
      if (event?.defaultPrevented) return;
      if (prefersReducedMotion()) return;

      const target = event?.currentTarget;
      if (target && 'getBoundingClientRect' in target) {
        const rect = target.getBoundingClientRect();
        const origin = {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        };

        await confetti({
          zIndex: 9999,
          ...brandConfettiOptions(),
          ...options,
          origin,
        });
      }
    } catch (error) {
      console.error('Confetti button error:', error);
    }
  };

  return (
    <button ref={ref} type="button" onClick={handleClick} className={cn(CONFETTI_BUTTON_CLASS, className)} {...props}>
      {children}
    </button>
  );
});

ConfettiButton.displayName = 'ConfettiButton';

/** Vystrelí konfety bez komponentu (napr. Škrtací test pri 0 frázach): fireConfetti({ origin: { y: 0.6 } }). */
export function fireConfetti(opts: ConfettiOptions = {}) {
  if (prefersReducedMotion()) return Promise.resolve(null);
  return confetti({ zIndex: 9999, ...brandConfettiOptions(), ...opts });
}

export default Confetti;
