// Motion Primitives (MIT, (c) 2024 ibelick) — morphing-dialog, upravené pre xvadur.com v4.
// 'use client' (Next.js) vynechané — Astro React ostrov ho nepotrebuje.
// Zmeny: lucide-react → @phosphor-icons/react; hook zo susedného súboru; backdrop bg-overlay (token,
// bez blur); obsah a zatváracie tlačidlo v brutal rámci; aria id-čka trigger/obsah/titulok/popis
// naozaj sedia; MotionConfig reducedMotion="user" (layout morph sa pri reduced motion vypne, ostane fade);
// zatvorenie bez scroll-locku cez `overflow-hidden` na body (Lenis: pridáva data-lenis-prevent).
import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, MotionConfig, motion, type Transition, type Variant } from 'motion/react';
import { createPortal } from 'react-dom';
import { XIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useClickOutside } from './hooks/use-click-outside';
import { REDUCED_TRANSITION, useReducedMotionFlag } from './hooks/use-reduced-motion';

export type MorphingDialogContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const MorphingDialogContext = React.createContext<MorphingDialogContextType | null>(null);

function useMorphingDialog() {
  const context = useContext(MorphingDialogContext);
  if (!context) {
    throw new Error('useMorphingDialog must be used within a MorphingDialogProvider');
  }
  return context;
}

/** Ostrý brutálny morph: tvrdý ease-out, žiadne dlhé pružiny. */
export const morphingDialogTransition: Transition = { type: 'spring', bounce: 0, duration: 0.32 };

export type MorphingDialogProviderProps = {
  children: React.ReactNode;
  transition?: Transition;
};

function MorphingDialogProvider({ children, transition }: MorphingDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const contextValue = useMemo(() => ({ isOpen, setIsOpen, uniqueId, triggerRef }), [isOpen, uniqueId]);

  return (
    <MorphingDialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </MorphingDialogContext.Provider>
  );
}

export type MorphingDialogProps = {
  children: React.ReactNode;
  transition?: Transition;
};

/** Koreň. Pri prefers-reduced-motion: layout morph vypnutý (reducedMotion="user"), fade 120 ms. */
function MorphingDialog({ children, transition = morphingDialogTransition }: MorphingDialogProps) {
  const reduced = useReducedMotionFlag();
  return (
    <MorphingDialogProvider transition={reduced ? REDUCED_TRANSITION : transition}>
      <MotionConfig reducedMotion="user" transition={reduced ? REDUCED_TRANSITION : transition}>
        {children}
      </MotionConfig>
    </MorphingDialogProvider>
  );
}

export type MorphingDialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  /** prístupný názov tlačidla (default „Otvoriť detail“) */
  'aria-label'?: string;
};

/** Karta = tlačidlo. Daj mu `brutal lift press text-left` a farbu (`bg-yellow`). */
function MorphingDialogTrigger({
  children,
  className,
  style,
  triggerRef,
  'aria-label': ariaLabel = 'Otvoriť detail',
}: MorphingDialogTriggerProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef: ctxTriggerRef } = useMorphingDialog();

  const handleClick = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen]);
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen],
  );

  return (
    <motion.button
      ref={triggerRef ?? ctxTriggerRef}
      type="button"
      layoutId={`dialog-${uniqueId}`}
      className={cn('relative cursor-pointer', className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={style}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={`morphing-dialog-content-${uniqueId}`}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
}

export type MorphingDialogContentProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/** Detail. Default retheme: `brutal bg-paper shadow-brutal-xl`; obsah scrolluje vnútri (Lenis prevent). */
function MorphingDialogContent({ children, className, style }: MorphingDialogContentProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();
  const containerRef = useRef<HTMLDivElement>(null);
  const [firstFocusableElement, setFirstFocusableElement] = useState<HTMLElement | null>(null);
  const [lastFocusableElement, setLastFocusableElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key === 'Tab') {
        if (!firstFocusableElement || !lastFocusableElement) return;
        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            event.preventDefault();
            lastFocusableElement.focus();
          }
        } else if (document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen, firstFocusableElement, lastFocusableElement]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements && focusableElements.length > 0) {
        setFirstFocusableElement(focusableElements[0] as HTMLElement);
        setLastFocusableElement(focusableElements[focusableElements.length - 1] as HTMLElement);
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, triggerRef]);

  const close = useCallback(() => {
    if (isOpen) setIsOpen(false);
  }, [isOpen, setIsOpen]);
  useClickOutside(containerRef, close);

  return (
    <motion.div
      ref={containerRef}
      id={`morphing-dialog-content-${uniqueId}`}
      layoutId={`dialog-${uniqueId}`}
      className={cn('brutal overflow-hidden bg-paper shadow-brutal-xl', className)}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`morphing-dialog-title-${uniqueId}`}
      aria-describedby={`morphing-dialog-description-${uniqueId}`}
      data-lenis-prevent
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogContainerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/** Portál do body: backdrop `bg-overlay` (ink 80 %, bez blur — tvrdý svet) + centrovaný obsah s 16 px okrajom. */
function MorphingDialogContainer({ children, className }: MorphingDialogContainerProps) {
  const { isOpen, uniqueId } = useMorphingDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen && (
        <>
          <motion.div
            key={`backdrop-${uniqueId}`}
            className="fixed inset-0 z-50 h-full w-full bg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className={cn('fixed inset-0 z-50 flex items-center justify-center p-4', className)}>
            {children}
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export type MorphingDialogTitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogTitle({ children, className, style }: MorphingDialogTitleProps) {
  const { uniqueId } = useMorphingDialog();
  return (
    <motion.div
      id={`morphing-dialog-title-${uniqueId}`}
      layoutId={`dialog-title-container-${uniqueId}`}
      className={className}
      style={style}
      layout
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogSubtitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogSubtitle({ children, className, style }: MorphingDialogSubtitleProps) {
  const { uniqueId } = useMorphingDialog();
  return (
    <motion.div layoutId={`dialog-subtitle-container-${uniqueId}`} className={className} style={style}>
      {children}
    </motion.div>
  );
}

export type MorphingDialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
  disableLayoutAnimation?: boolean;
  variants?: { initial: Variant; animate: Variant; exit: Variant };
};

/** Default variants: fade 0 → 1 (obsah, ktorý v karte nie je, sa objaví po morphe). */
const descriptionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

function MorphingDialogDescription({
  children,
  className,
  variants = descriptionVariants,
  disableLayoutAnimation,
}: MorphingDialogDescriptionProps) {
  const { uniqueId } = useMorphingDialog();
  return (
    <motion.div
      key={`dialog-description-${uniqueId}`}
      layoutId={disableLayoutAnimation ? undefined : `dialog-description-content-${uniqueId}`}
      variants={variants}
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      id={`morphing-dialog-description-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

/** next/image → obyčajný <img> (motion.img). Alt je povinný. */
function MorphingDialogImage({ src, alt, className, style }: MorphingDialogImageProps) {
  const { uniqueId } = useMorphingDialog();
  return (
    <motion.img src={src} alt={alt} className={cn(className)} layoutId={`dialog-img-${uniqueId}`} style={style} />
  );
}

export type MorphingDialogCloseProps = {
  children?: React.ReactNode;
  className?: string;
  variants?: { initial: Variant; animate: Variant; exit: Variant };
  /** prístupný názov (default „Zavrieť“) */
  'aria-label'?: string;
};

/** Zatváracie tlačidlo: 44 × 44 brutal štvorec s X (Phosphor), vpravo hore. */
function MorphingDialogClose({
  children,
  className,
  variants = descriptionVariants,
  'aria-label': ariaLabel = 'Zavrieť',
}: MorphingDialogCloseProps) {
  const { setIsOpen, uniqueId } = useMorphingDialog();
  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);

  return (
    <motion.button
      onClick={handleClose}
      type="button"
      aria-label={ariaLabel}
      key={`dialog-close-${uniqueId}`}
      className={cn(
        'press absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-lg border-3 border-ink bg-white text-ink shadow-brutal-sm hover:bg-white-hover',
        className,
      )}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      {children || <XIcon size={24} weight="bold" aria-hidden="true" />}
    </motion.button>
  );
}

export {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
  useMorphingDialog,
};
