/** V7-05 · Komiks — odkaz na Hriech s náhľadom pri prejdení myšou / fokuse (BoldKit hover-card). Na dotyku je to obyčajný
 *  odkaz (náhľad nie je jediná cesta k informácii). Odkaz overený v fakty.ts (DOKAZY). Ostrov: client:visible. */
import { ArrowUpRight } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { DOKAZY, OVERENE_DNA_TEXT } from '@/data/fakty';

const hriech = DOKAZY.find((d) => d.id === 'hriech')!;

export default function HriechNahlad() {
  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        <Button asChild variant="outline" size="lg">
          <a href={hriech.url!} target="_blank" rel="noopener noreferrer" data-track="dokaz_klik" data-track-miesto="v7-05-texty">
            hriech.xvadur.com <ArrowUpRight aria-hidden="true" />
          </a>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" side="top">
        <img src={hriech.obrazok!} alt="Hriech — náhľad publikácie" width={960} height={600} loading="lazy" className="aspect-[16/10] w-full border-b-3 border-ink object-cover object-top" />
        <div className="p-4">
          <p className="font-display text-xl font-extrabold uppercase">Hriech</p>
          <p className="text-sm">{hriech.riadok}</p>
          <p className="mt-2 font-mono text-[11px] uppercase">overené {OVERENE_DNA_TEXT}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
