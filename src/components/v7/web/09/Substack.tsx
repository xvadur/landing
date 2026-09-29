/** V7-09 · odkaz na Substack s BoldKit HoverCard (náhľad newslettera pri hoveri/fokuse). Text: NEWSLETTER (ponuka.ts). */
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import { NEWSLETTER } from '@/data/ponuka';

export default function Substack({ className }: { className?: string }) {
  return (
    <HoverCard openDelay={150} closeDelay={80}>
      <HoverCardTrigger asChild>
        <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className={className}>
          Substack ↗
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <p className="font-display text-lg font-extrabold uppercase">{NEWSLETTER.nazov}</p>
        <p className="mt-1 text-sm">{NEWSLETTER.popis}</p>
      </HoverCardContent>
    </HoverCard>
  );
}
