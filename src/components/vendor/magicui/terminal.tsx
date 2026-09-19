// Magic UI — Terminal + TypingAnimation + AnimatedSpan (MIT, https://magicui.design/docs/components/terminal),
// vendorované 19. 9. 2026. Zmeny oproti registry: bez "use client"; retheme cez tokeny (border-3 border-ink rounded-lg
// shadow-brutal, bg-ink/text-paper alebo bg-white/text-ink, font-mono, bodky hot/yellow/lime-deep, `title` v hlavičke);
// reduced motion (useReducedMotion z motion/react): text sa vypíše naraz, riadky bez posunu, sekvencia beží okamžite.
// Motion = stavy komponentu (engine rule), žiadny GSAP.
import {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type RefAttributes,
} from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  type DOMMotionComponents,
  type HTMLMotionProps,
  type MotionProps,
} from 'motion/react';

import { cn } from '@/lib/utils';

interface SequenceContextValue {
  completeItem: (index: number) => void;
  activeIndex: number;
  sequenceStarted: boolean;
}

const SequenceContext = createContext<SequenceContextValue | null>(null);
const useSequence = () => useContext(SequenceContext);

const ItemIndexContext = createContext<number | null>(null);
const useItemIndex = () => useContext(ItemIndexContext);

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const;

type MotionElementType = Extract<keyof DOMMotionComponents, keyof typeof motionElements>;
type TerminalTypingMotionComponent = ComponentType<Omit<HTMLMotionProps<'span'>, 'ref'> & RefAttributes<HTMLElement>>;

export interface AnimatedSpanProps extends MotionProps {
  children: React.ReactNode;
  /** oneskorenie v ms (len mimo sekvencie) */
  delay?: number;
  className?: string;
  startOnView?: boolean;
}

/** Riadok, ktorý sa objaví (fade + 5 px). V sekvencii Terminalu čaká na svoje poradie. */
export const AnimatedSpan = ({ children, delay = 0, className, startOnView = false, ...props }: AnimatedSpanProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(elementRef as React.RefObject<Element>, { amount: 0.3, once: true });
  const reduced = useReducedMotion() ?? false;

  const sequence = useSequence();
  const itemIndex = useItemIndex();
  const [hasStarted, setHasStarted] = useState(false);
  useEffect(() => {
    if (!sequence || itemIndex === null) return;
    if (!sequence.sequenceStarted) return;
    if (hasStarted) return;
    if (sequence.activeIndex === itemIndex) {
      setHasStarted(true);
    }
  }, [sequence, hasStarted, itemIndex]);

  const shouldAnimate = sequence ? hasStarted : startOnView ? isInView : true;
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, y: -5 };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      ref={elementRef}
      initial={hidden}
      animate={shouldAnimate ? shown : hidden}
      transition={{ duration: reduced ? 0.12 : 0.3, delay: sequence ? 0 : delay / 1000 }}
      className={cn('grid font-mono text-sm', className)}
      onAnimationComplete={() => {
        if (!sequence) return;
        if (itemIndex === null) return;
        sequence.completeItem(itemIndex);
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export interface TypingAnimationProps extends Omit<MotionProps, 'children'> {
  children: string;
  className?: string;
  /** ms na jeden znak. @default 60 */
  duration?: number;
  /** oneskorenie v ms (len mimo sekvencie) */
  delay?: number;
  as?: MotionElementType;
  startOnView?: boolean;
}

/** Písací efekt po znakoch. Pri reduced motion vypíše celý text naraz. */
export const TypingAnimation = ({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = 'span',
  startOnView = true,
  ...props
}: TypingAnimationProps) => {
  if (typeof children !== 'string') {
    throw new Error('TypingAnimation: children musí byť string.');
  }

  const MotionComponent = motionElements[Component] as TerminalTypingMotionComponent;
  const reduced = useReducedMotion() ?? false;

  const [displayedText, setDisplayedText] = useState<string>('');
  const [started, setStarted] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(elementRef as React.RefObject<Element>, { amount: 0.3, once: true });

  const sequence = useSequence();
  const itemIndex = useItemIndex();
  const hasSequence = sequence !== null;
  const sequenceStarted = sequence?.sequenceStarted ?? false;
  const sequenceActiveIndex = sequence?.activeIndex ?? null;
  const sequenceCompleteItemRef = useRef<SequenceContextValue['completeItem'] | null>(null);
  const sequenceItemIndexRef = useRef<number | null>(null);

  useEffect(() => {
    sequenceCompleteItemRef.current = sequence?.completeItem ?? null;
    sequenceItemIndexRef.current = itemIndex;
  }, [sequence?.completeItem, itemIndex]);

  useEffect(() => {
    let startTimeout: ReturnType<typeof setTimeout> | null = null;

    if (hasSequence && itemIndex !== null) {
      if (sequenceStarted && !started && sequenceActiveIndex === itemIndex) {
        setStarted(true);
      }
    } else if (!startOnView || isInView) {
      startTimeout = setTimeout(() => setStarted(true), reduced ? 0 : delay);
    }

    return () => {
      if (startTimeout !== null) clearTimeout(startTimeout);
    };
  }, [delay, startOnView, isInView, started, hasSequence, sequenceActiveIndex, sequenceStarted, itemIndex, reduced]);

  useEffect(() => {
    let typingEffect: ReturnType<typeof setInterval> | null = null;
    if (!started) return;

    const finish = () => {
      const completeItem = sequenceCompleteItemRef.current;
      const currentItemIndex = sequenceItemIndexRef.current;
      if (completeItem && currentItemIndex !== null) completeItem(currentItemIndex);
    };

    if (reduced) {
      setDisplayedText(children);
      finish();
      return;
    }

    let i = 0;
    typingEffect = setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1));
        i++;
      } else {
        if (typingEffect !== null) clearInterval(typingEffect);
        finish();
      }
    }, duration);

    return () => {
      if (typingEffect !== null) clearInterval(typingEffect);
    };
  }, [children, duration, started, reduced]);

  return (
    <MotionComponent ref={elementRef} className={cn('font-mono text-sm', className)} {...props}>
      {displayedText}
    </MotionComponent>
  );
};

export interface TerminalProps {
  children: React.ReactNode;
  className?: string;
  /** Riadky bežia jeden po druhom. @default true */
  sequence?: boolean;
  /** Štart až keď je 30 % v obraze. @default true */
  startOnView?: boolean;
  /** Text v hlavičke okna (mono, uppercase). */
  title?: string;
  /** Vzhľad: čierny terminál alebo biela karta. @default 'ink' */
  variant?: 'ink' | 'white';
}

/** Okno terminálu v brutal ráme: border-3 ink, radius 8, tieň 6/6; tri bodky hot/yellow/lime-deep. */
export const Terminal = ({ children, className, sequence = true, startOnView = true, title, variant = 'ink' }: TerminalProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef as React.RefObject<Element>, { amount: 0.3, once: true });

  const [activeIndex, setActiveIndex] = useState(0);
  const sequenceHasStarted = sequence ? !startOnView || isInView : false;

  const contextValue = useMemo<SequenceContextValue | null>(() => {
    if (!sequence) return null;
    return {
      completeItem: (index: number) => {
        setActiveIndex((current) => (index === current ? current + 1 : current));
      },
      activeIndex,
      sequenceStarted: sequenceHasStarted,
    };
  }, [sequence, activeIndex, sequenceHasStarted]);

  const wrappedChildren = useMemo(() => {
    if (!sequence) return children;
    const array = Children.toArray(children);
    return array.map((child, index) => (
      <ItemIndexContext.Provider key={index} value={index}>
        {child as React.ReactNode}
      </ItemIndexContext.Provider>
    ));
  }, [children, sequence]);

  const content = (
    <div
      ref={containerRef}
      className={cn(
        'z-0 w-full max-w-lg overflow-hidden rounded-lg border-3 border-ink shadow-brutal',
        variant === 'ink' ? 'bg-ink text-paper' : 'bg-white text-ink',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 border-b-3 px-4 py-3',
          variant === 'ink' ? 'border-paper/20' : 'border-ink',
        )}
      >
        <div className="flex gap-2" aria-hidden="true">
          <span className="size-3 rounded-full border-2 border-ink bg-hot" />
          <span className="size-3 rounded-full border-2 border-ink bg-yellow" />
          <span className="size-3 rounded-full border-2 border-ink bg-lime-deep" />
        </div>
        {title ? <span className="truncate font-mono text-xs font-bold uppercase tracking-wider opacity-70">{title}</span> : null}
      </div>
      <pre className="max-h-100 overflow-auto p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
        <code className="grid gap-y-1">{wrappedChildren}</code>
      </pre>
    </div>
  );

  if (!sequence) return content;

  return <SequenceContext.Provider value={contextValue}>{content}</SequenceContext.Provider>;
};

export default Terminal;
