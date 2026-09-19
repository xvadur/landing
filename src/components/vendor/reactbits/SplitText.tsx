/*!
 * SplitText — React Bits (https://reactbits.dev/text-animations/split-text)
 * Copyright (c) 2026 David Haz — MIT + Commons Clause. Vendorované do xvadur.com v4 ako súčasť webu.
 * GSAP SplitText je od 3.13 zadarmo (Standard licence, work/LICENCIE.md). Úpravy: reduced motion = statický text
 * (bez splitu, bez ScrollTriggeru), textAlign dedí (nie center), Lenis → ScrollTrigger.update ak beží window.__lenis,
 * `from`/`to` môžu niesť fontVariationSettings ("'wdth' 75" → "'wdth' 100", GSAP tweenuje čísla v reťazci), cn().
 * Ostrov: client:only="react" (GSAP pluginy sa registrujú pri importe). Hero motto (doc 10 §3 #2, §4).
 * Pravidlo enginu: prvok s GSAP nedostáva Motion ani CSS presety (lift/press/card-drop).
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './motion-guards';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export interface SplitTextProps {
  text: string;
  className?: string;
  /** stagger medzi cieľmi (ms) */
  delay?: number;
  /** trvanie jedného cieľa (s) */
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  /** podiel prvku vo viewporte, pri ktorom štartuje (0–1) */
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: CSSProperties['textAlign'];
  /** true = štart hneď po načítaní fontov, bez ScrollTriggeru (hero nad ohybom) */
  immediate?: boolean;
  onLetterAnimationComplete?: () => void;
}

export default function SplitText({
  text,
  className,
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  tag: Tag = 'p',
  textAlign,
  immediate = false,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) {
      setFontsLoaded(true);
      return;
    }
    if (document.fonts.status === 'loaded') setFontsLoaded(true);
    else document.fonts.ready.then(() => setFontsLoaded(true));
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded || reduced) return;
      if (animationCompletedRef.current) return;
      const el = ref.current as HTMLElement & { _rbsplitInstance?: GSAPSplitText };

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch {
          /* už zrušené */
        }
        el._rbsplitInstance = undefined;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign = marginValue === 0 ? '' : marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      const lenis = window.__lenis;
      const onLenisScroll = () => ScrollTrigger.update();
      if (lenis && !immediate) lenis.on('scroll', onLenisScroll);

      let targets: Element[] = [];
      const assignTargets = (self: GSAPSplitText) => {
        if (splitType.includes('chars') && self.chars?.length) targets = self.chars;
        if (!targets.length && splitType.includes('words') && self.words.length) targets = self.words;
        if (!targets.length && splitType.includes('lines') && self.lines.length) targets = self.lines;
        if (!targets.length) targets = self.chars || self.words || self.lines;
      };
      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          assignTargets(self);
          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: immediate
                ? undefined
                : { trigger: el, start, once: true, fastScrollEnd: true, anticipatePin: 0.4 },
              onComplete: () => {
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
              willChange: 'transform, opacity',
              force3D: true,
            },
          );
        },
      });
      el._rbsplitInstance = splitInstance;
      return () => {
        if (lenis && !immediate) lenis.off('scroll', onLenisScroll);
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch {
          /* už zrušené */
        }
        el._rbsplitInstance = undefined;
      };
    },
    {
      dependencies: [text, delay, duration, ease, splitType, JSON.stringify(from), JSON.stringify(to), threshold, rootMargin, fontsLoaded, reduced, immediate],
      scope: ref,
    },
  );

  const style: CSSProperties = { textAlign, wordWrap: 'break-word', willChange: reduced ? undefined : 'transform, opacity' };
  return (
    <Tag ref={ref as never} style={style} className={cn('split-parent inline-block overflow-hidden whitespace-normal', className)} data-split={reduced ? 'off' : 'on'}>
      {text}
    </Tag>
  );
}
