/** V7-09 · nadpis manifestu: Fancy VerticalCutReveal (písmená vyrežú zdola, keď je nadpis v obraze;
 *  reduced motion = text stojí). */
import { VerticalCutReveal } from '@/components/vendor/fancy/text/vertical-cut-reveal';

export default function ManifestNadpis({ text }: { text: string }) {
  return (
    <VerticalCutReveal
      splitBy="characters"
      staggerDuration={0.025}
      staggerFrom="first"
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      containerClassName="font-display text-[clamp(3rem,1.2rem+7vw,8.5rem)] leading-[0.84] font-extrabold tracking-[-0.045em] uppercase"
    >
      {text}
    </VerticalCutReveal>
  );
}
