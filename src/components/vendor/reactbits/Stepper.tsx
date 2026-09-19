/*!
 * Stepper — React Bits (https://reactbits.dev/components/stepper)
 * Copyright (c) 2026 David Haz — MIT + Commons Clause. Vendorované do xvadur.com v4 ako súčasť webu.
 * Úpravy (retheme cez tokeny, žiadny hex): obal = brutal karta, indikátory = tlačidlá 44 px s rámom 3 px
 * (biela = pred, hot = aktívny, lime = hotový), spojka = 3 px ink linka, tlačidlá podľa vzoru z global.css
 * (hot CTA / biele späť), slovenské texty (Späť / Ďalej / Dokončiť), reduced motion = bez posunu, len fade 120 ms,
 * aria-current="step", bez fixného pomeru strán (obsah určuje výšku), cn().
 * Ostrov: client:visible (Motion, bez window pri importe). Kvíz (doc 10 §3 #17).
 */
import React, {
  Children,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './motion-guards';

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  /** obal karty (default brutal + bg-white); napr. 'bg-yellow' */
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  completeButtonText?: string;
  /** indikátory sa nedajú klikať (kvíz: len dopredu cez Ďalej) */
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: { step: number; currentStep: number; onStepClick: (clicked: number) => void }) => ReactNode;
  /** čo ukázať po dokončení (default nič, karta sa zavrie na výšku 0) */
  completedContent?: ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName,
  stepContainerClassName,
  contentClassName,
  footerClassName,
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Späť',
  nextButtonText = 'Ďalej',
  completeButtonText = 'Dokončiť',
  disableStepIndicators = false,
  renderStepIndicator,
  completedContent,
  className,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const reduced = usePrefersReducedMotion();
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) onFinalStepCompleted();
    else onStepChange(newStep);
  };
  const go = (clicked: number) => {
    setDirection(clicked > currentStep ? 1 : -1);
    updateStep(clicked);
  };
  const handleBack = () => currentStep > 1 && go(currentStep - 1);
  const handleNext = () => !isLastStep && go(currentStep + 1);
  const handleComplete = () => go(totalSteps + 1);

  return (
    <div className={cn('flex w-full flex-col items-center', className)} {...rest}>
      <div className={cn('mx-auto w-full max-w-md brutal', stepCircleContainerClassName)}>
        <div
          className={cn('flex w-full items-center p-5 sm:p-6', stepContainerClassName)}
          role="group"
          aria-label={`Krok ${Math.min(currentStep, totalSteps)} z ${totalSteps}`}
        >
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({ step: stepNumber, currentStep, onStepClick: go })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={go}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} reduced={reduced} />}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          reduced={reduced}
          className={cn('px-5 sm:px-6', contentClassName)}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {isCompleted && completedContent && <div className={cn('px-5 pb-5 sm:px-6 sm:pb-6', contentClassName)}>{completedContent}</div>}

        {!isCompleted && (
          <div className={cn('px-5 pb-5 sm:px-6 sm:pb-6', footerClassName)}>
            <div className={cn('mt-8 flex gap-3', currentStep !== 1 ? 'justify-between' : 'justify-end')}>
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="press inline-flex min-h-12 items-center gap-2 rounded-lg border-3 border-ink bg-white px-4 font-display text-base font-extrabold uppercase text-ink shadow-brutal-sm hover:bg-white-hover"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="press inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-hot px-5 font-display text-lg font-extrabold uppercase text-ink shadow-brutal hover:bg-hot-hover"
                {...nextButtonProps}
              >
                {isLastStep ? completeButtonText : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  reduced: boolean;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({ isCompleted, currentStep, direction, reduced, children, className }: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(0);
  return (
    <motion.div
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={reduced ? { duration: 0.12 } : { type: 'spring', duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} reduced={reduced} onHeightReady={(h) => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction: number;
  reduced: boolean;
  onHeightReady: (height: number) => void;
}

function SlideTransition({ children, direction, reduced, onHeightReady }: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);
  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={reduced ? fadeVariants : stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: reduced ? 0.12 : 0.3 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? '50%' : '-50%', opacity: 0 }),
};

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export interface StepProps {
  children: ReactNode;
  className?: string;
}

/** Jeden krok — obsah karty. */
export function Step({ children, className }: StepProps) {
  return <div className={cn('py-2', className)}>{children}</div>;
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators = false }: StepIndicatorProps) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';
  const clickable = !disableStepIndicators && step !== currentStep;
  return (
    <button
      type="button"
      aria-current={status === 'active' ? 'step' : undefined}
      aria-label={`Krok ${step}${status === 'complete' ? ' (hotový)' : status === 'active' ? ' (aktuálny)' : ''}`}
      disabled={!clickable}
      onClick={() => clickable && onClickStep(step)}
      className={cn(
        'flex h-11 w-11 flex-none items-center justify-center rounded-lg border-3 border-ink font-display text-base font-extrabold transition-colors duration-(--duration-base)',
        status === 'inactive' && 'bg-white text-ink',
        status === 'active' && 'bg-hot text-ink shadow-brutal-sm',
        status === 'complete' && 'bg-lime text-ink',
        clickable ? 'press cursor-pointer hover:bg-white-hover' : 'cursor-default',
        disableStepIndicators && status === 'inactive' && 'opacity-60',
      )}
    >
      {status === 'complete' ? <CheckIcon className="h-5 w-5" /> : <span>{step}</span>}
    </button>
  );
}

function StepConnector({ isComplete, reduced }: { isComplete: boolean; reduced: boolean }) {
  return (
    <div className="relative mx-2 h-[3px] flex-1 overflow-hidden rounded-sm bg-ink/20" aria-hidden="true">
      <motion.div
        className="absolute left-0 top-0 h-full bg-ink"
        initial={false}
        animate={{ width: isComplete ? '100%' : '0%' }}
        transition={{ duration: reduced ? 0.12 : 0.4 }}
      />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="square"
        strokeLinejoin="miter"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
