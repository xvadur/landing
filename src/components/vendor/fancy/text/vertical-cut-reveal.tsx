// Fancy Components (MIT, (c) Daniel Petho) — https://www.fancycomponents.dev/r/vertical-cut-reveal.json
// Úpravy xvadur.com v4: bez "use client"; reduced motion → text stojí (žiadny posun, len okamžité zobrazenie);
// `startOnView` (spustí sa, keď je prvok vo viewporte — beaty v „Kto som"); Intl.Segmenter s 'sk'.
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion, useInView, type AnimationOptions } from 'motion/react';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '../hooks/use-media';

export interface VerticalCutRevealProps {
  /** Text (string; iné deti sa prevedú cez toString). */
  children: ReactNode;
  /** vstup zhora namiesto zdola */
  reverse?: boolean;
  transition?: AnimationOptions;
  splitBy?: 'words' | 'characters' | 'lines' | string;
  /** s medzi prvkami */
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  containerClassName?: string;
  wordLevelClassName?: string;
  elementLevelClassName?: string;
  onClick?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  /** spustiť automaticky (pri mount-e, alebo pri `startOnView` až vo viewporte) */
  autoStart?: boolean;
  /** čakať, kým je prvok vo viewporte (default true) */
  startOnView?: boolean;
  /** okraj IntersectionObservera pre `startOnView` */
  viewMargin?: string;
}

export interface VerticalCutRevealRef {
  startAnimation: () => void;
  reset: () => void;
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

const splitIntoCharacters = (text: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('sk', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
};

export const VerticalCutReveal = forwardRef<VerticalCutRevealRef, VerticalCutRevealProps>(
  (
    {
      children,
      reverse = false,
      transition = { type: 'spring', stiffness: 190, damping: 22 },
      splitBy = 'words',
      staggerDuration = 0.2,
      staggerFrom = 'first',
      containerClassName,
      wordLevelClassName,
      elementLevelClassName,
      onClick,
      onStart,
      onComplete,
      autoStart = true,
      startOnView = true,
      viewMargin = '0px 0px -10% 0px',
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const text = typeof children === 'string' ? children : children?.toString() || '';
    const [isAnimating, setIsAnimating] = useState(false);
    const reduced = useReducedMotion();
    const inView = useInView(containerRef, { once: true, margin: viewMargin as never });

    const elements = useMemo(() => {
      const words = text.split(' ');
      if (splitBy === 'characters') {
        return words.map((word, i) => ({ characters: splitIntoCharacters(word), needsSpace: i !== words.length - 1 }));
      }
      return splitBy === 'words' ? text.split(' ') : splitBy === 'lines' ? text.split('\n') : text.split(splitBy);
    }, [text, splitBy]);

    const getStaggerDelay = useCallback(
      (index: number) => {
        const total =
          splitBy === 'characters'
            ? elements.reduce(
                (acc, word) =>
                  acc + (typeof word === 'string' ? 1 : word.characters.length + (word.needsSpace ? 1 : 0)),
                0,
              )
            : elements.length;
        if (staggerFrom === 'first') return index * staggerDuration;
        if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
        if (staggerFrom === 'center') return Math.abs(Math.floor(total / 2) - index) * staggerDuration;
        if (staggerFrom === 'random') return Math.abs(Math.floor(Math.random() * total) - index) * staggerDuration;
        return Math.abs(staggerFrom - index) * staggerDuration;
      },
      [elements, splitBy, staggerFrom, staggerDuration],
    );

    const startAnimation = useCallback(() => {
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    useImperativeHandle(ref, () => ({ startAnimation, reset: () => setIsAnimating(false) }));

    useEffect(() => {
      if (!autoStart) return;
      if (startOnView && !inView) return;
      startAnimation();
    }, [autoStart, startOnView, inView, startAnimation]);

    const variants = {
      hidden: { y: reduced ? 0 : reverse ? '-100%' : '100%' },
      visible: (i: number) => ({
        y: 0,
        transition: reduced
          ? { duration: 0 }
          : { ...transition, delay: ((transition?.delay as number) || 0) + getStaggerDelay(i) },
      }),
    };

    const wordObjects: WordObject[] =
      splitBy === 'characters'
        ? (elements as WordObject[])
        : (elements as string[]).map((el, i) => ({ characters: [el], needsSpace: i !== elements.length - 1 }));

    return (
      <span
        className={cn(containerClassName, 'flex flex-wrap whitespace-pre-wrap', splitBy === 'lines' && 'flex-col')}
        onClick={onClick}
        ref={containerRef}
      >
        <span className="sr-only">{text}</span>

        {wordObjects.map((wordObj, wordIndex, array) => {
          const previousCharsCount = array.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0);
          return (
            <span key={wordIndex} aria-hidden="true" className={cn('inline-flex overflow-hidden', wordLevelClassName)}>
              {wordObj.characters.map((char, charIndex) => (
                <span className={cn(elementLevelClassName, 'relative whitespace-pre-wrap')} key={charIndex}>
                  <motion.span
                    custom={previousCharsCount + charIndex}
                    initial="hidden"
                    animate={isAnimating || reduced ? 'visible' : 'hidden'}
                    variants={variants}
                    onAnimationComplete={
                      wordIndex === wordObjects.length - 1 && charIndex === wordObj.characters.length - 1
                        ? onComplete
                        : undefined
                    }
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
              {wordObj.needsSpace && <span> </span>}
            </span>
          );
        })}
      </span>
    );
  },
);

VerticalCutReveal.displayName = 'VerticalCutReveal';
export default VerticalCutReveal;
