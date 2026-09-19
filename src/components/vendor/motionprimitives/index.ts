/** Motion Primitives (MIT, ibelick) vendorované pre xvadur.com v4 — pozri LICENSE.md v tomto priečinku.
 *  Import: `import { Magnetic } from '@/components/vendor/motionprimitives'` alebo priamo zo súboru
 *  (`.../motionprimitives/magnetic`) — priamy import drží ostrov menší. */
export { Cursor, type CursorProps } from './cursor';
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
  morphingDialogTransition,
} from './morphing-dialog';
export { TransitionPanel, transitionPanelSlideVariants, type TransitionPanelProps } from './transition-panel';
export { TextScramble, SCRAMBLE_CHARS_SK, type TextScrambleProps } from './text-scramble';
export { InView, inViewDropVariants, type InViewProps } from './in-view';
export { AnimatedNumber, type AnimatedNumberProps } from './animated-number';
export { Magnetic, type MagneticProps } from './magnetic';
export {
  useReducedMotionFlag,
  useFinePointer,
  useMediaFlag,
  REDUCED_TRANSITION,
  REDUCED_QUERY,
  FINE_POINTER_QUERY,
} from './hooks/use-reduced-motion';
export { useClickOutside } from './hooks/use-click-outside';
