// Fancy Components (MIT, (c) Daniel Petho) — https://www.fancycomponents.dev/r/scramble-hover.json
// Úpravy xvadur.com v4: bez "use client" (Astro ostrov), `ReturnType<typeof setInterval>` namiesto NodeJS.Timeout,
// reduced motion → žiadny scramble (statický text), prop `active` (rodič — napr. nav <a> — riadi hover/focus sám),
// prop `as` (span | div), predvolená sada znakov = diakritika-friendly veľké písmená + značky.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '../hooks/use-media';

export interface ScrambleHoverProps {
  /** Text (slovenčina s diakritikou je v poriadku — znaky sa berú z `characters`, medzery ostávajú). */
  text: string;
  /** ms medzi krokmi scramblu */
  scrambleSpeed?: number;
  /** počet krokov pri `sequential=false` */
  maxIterations?: number;
  /** odhaľovať postupne po znakoch */
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  /** miešať len znaky z pôvodného textu */
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  /** trieda pre práve zamiešané znaky (napr. `text-hot font-mono`) */
  scrambledClassName?: string;
  /** Externé riadenie: keď je definované, hover sa neriadi vnútorne (rodič dá hover + focus-within). */
  active?: boolean;
  as?: 'span' | 'div';
}

const DEFAULT_CHARS = 'AÁÄBCČDĎEÉFGHIÍJKLĽĹMNŇOÓÔPQRŔSŠTŤUÚVWXYÝZŽ0123456789×#%&*';

export function ScrambleHover({
  text,
  scrambleSpeed = 50,
  maxIterations = 10,
  useOriginalCharsOnly = false,
  characters = DEFAULT_CHARS,
  className,
  scrambledClassName,
  sequential = false,
  revealDirection = 'start',
  active,
  as = 'span',
}: ScrambleHoverProps) {
  const [displayText, setDisplayText] = useState(text);
  const [internalHover, setInternalHover] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const revealed = useRef(new Set<number>());
  const [, force] = useState(0);
  const reduced = useReducedMotion();

  const isHovering = (active ?? internalHover) && !reduced;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let currentIteration = 0;
    const revealedIndices = revealed.current;

    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter((char) => char !== ' ')
      : characters.split('');

    const getNextIndex = () => {
      const textLength = text.length;
      switch (revealDirection) {
        case 'start':
          return revealedIndices.size;
        case 'end':
          return textLength - 1 - revealedIndices.size;
        case 'center': {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealedIndices.size / 2);
          const nextIndex = revealedIndices.size % 2 === 0 ? middle + offset : middle - offset - 1;
          if (nextIndex >= 0 && nextIndex < textLength && !revealedIndices.has(nextIndex)) return nextIndex;
          for (let i = 0; i < textLength; i++) if (!revealedIndices.has(i)) return i;
          return 0;
        }
        default:
          return revealedIndices.size;
      }
    };

    const shuffleText = (source: string) => {
      if (useOriginalCharsOnly) {
        const positions = source.split('').map((char, i) => ({
          char,
          isSpace: char === ' ',
          index: i,
          isRevealed: revealedIndices.has(i),
        }));
        const nonSpaceChars = positions.filter((p) => !p.isSpace && !p.isRevealed).map((p) => p.char);
        for (let i = nonSpaceChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonSpaceChars[i], nonSpaceChars[j]] = [nonSpaceChars[j]!, nonSpaceChars[i]!];
        }
        let charIndex = 0;
        return positions
          .map((p) => {
            if (p.isSpace) return ' ';
            if (p.isRevealed) return source[p.index];
            return nonSpaceChars[charIndex++];
          })
          .join('');
      }
      return source
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (revealedIndices.has(i)) return source[i];
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        })
        .join('');
    };

    if (isHovering) {
      setIsScrambling(true);
      interval = setInterval(() => {
        if (sequential) {
          if (revealedIndices.size < text.length) {
            revealedIndices.add(getNextIndex());
            setDisplayText(shuffleText(text));
            force((n) => n + 1);
          } else {
            clearInterval(interval);
            setIsScrambling(false);
          }
        } else {
          setDisplayText(shuffleText(text));
          currentIteration++;
          if (currentIteration >= maxIterations) {
            clearInterval(interval);
            setIsScrambling(false);
            setDisplayText(text);
          }
        }
      }, scrambleSpeed);
    } else {
      setDisplayText(text);
      setIsScrambling(false);
      revealedIndices.clear();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovering, text, characters, scrambleSpeed, useOriginalCharsOnly, sequential, revealDirection, maxIterations]);

  const Tag = as === 'div' ? motion.div : motion.span;
  const controlled = active !== undefined;

  return (
    <Tag
      onHoverStart={controlled ? undefined : () => setInternalHover(true)}
      onHoverEnd={controlled ? undefined : () => setInternalHover(false)}
      onFocus={controlled ? undefined : () => setInternalHover(true)}
      onBlur={controlled ? undefined : () => setInternalHover(false)}
      className={cn('inline-block whitespace-pre-wrap', className)}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => (
          <span
            key={index}
            className={cn(
              revealed.current.has(index) || !isScrambling || !isHovering ? undefined : scrambledClassName,
            )}
          >
            {char}
          </span>
        ))}
      </span>
    </Tag>
  );
}

export default ScrambleHover;
