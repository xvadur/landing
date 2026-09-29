/** V7-09 · hlavná výzva hera: BoldKit Button (accent = hot, text ink) v React Bits ClickSpark (iskry pri kliku,
 *  reduced motion = bez iskier). Cieľ = #vysetrenie (funkčná rezervácia nižšie). */
import { ArrowRight } from 'lucide-react';
import ClickSpark from '@/components/vendor/reactbits/ClickSpark';
import { Button } from '@/components/ui/button';
import { CTA_HLAVNE } from '@/components/hero/hero-data';
import { cn } from '@/lib/utils';

export default function Vyzva({ className, label = CTA_HLAVNE.label }: { className?: string; label?: string }) {
  return (
    <ClickSpark sparkColor="ink" sparkRadius={34} sparkCount={10} className={cn('-m-5 inline-block max-w-[calc(100%+2.5rem)] p-5', className)}>
      <Button
        asChild
        variant="accent"
        size="xl"
        className="h-auto min-h-14 max-w-full justify-center py-3 text-left font-display text-lg font-extrabold whitespace-normal uppercase sm:text-xl"
      >
        <a href="#vysetrenie" data-track="konzultacia_klik" data-track-miesto="v7-09-hero">
          {label} <ArrowRight aria-hidden="true" />
        </a>
      </Button>
    </ClickSpark>
  );
}
