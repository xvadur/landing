/** V7-05 · Komiks — nadpis strany: písmená „vypadnú“ zo žliabku (Fancy VerticalCutReveal, prekmit pružiny).
 *  Čítačka dostane celý text (sr-only vo VerticalCutReveal). Reduced motion = text hneď. Ostrov: client:load. */
import { VerticalCutReveal } from '@/components/vendor/fancy/text/vertical-cut-reveal';

export default function Nadpis05({ text, className }: { text: string; className?: string }) {
  return (
    <VerticalCutReveal
      splitBy="characters"
      staggerDuration={0.022}
      staggerFrom="first"
      transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      containerClassName={className}
    >
      {text}
    </VerticalCutReveal>
  );
}
