/** V7-09 · Liečba 03 „Odovzdanie“: produkty učenia ako lístky v BoldKit Carousel (Embla), šípky pod pásom,
 *  bodky 44 × 44. Každý lístok vedie na zápis (#zapis). Texty: PRODUKTY (src/data/ponuka.ts) bez „Agent pre teba“. */
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PRODUKTY } from '@/data/ponuka';
import { cn } from '@/lib/utils';

const UCENIE = PRODUKTY.filter((p) => p.id !== 'agent-pre-teba');
const UHOL = ['-1.5deg', '1deg', '-0.8deg'];

export default function LiecbaKarusel() {
  return (
    <Carousel opts={{ align: 'start' }} aria-label="Produkty: naučím ťa to" className="w-full">
      <CarouselContent className="-ml-4 py-4">
        {UCENIE.map((p, i) => (
          <CarouselItem key={p.id} className="basis-[86%] pl-4 sm:basis-1/2 xl:basis-1/3">
            <article
              className={cn('z9-papier flex h-full flex-col gap-3 p-5', p.farba === 'bg-yellow' ? 'z9-zlty' : 'z9-biely')}
              style={{ rotate: UHOL[i % UHOL.length] }}
            >
              <span className="w-fit border-2 border-ink bg-paper px-2 py-0.5 font-mono text-xs font-bold tracking-[0.1em] uppercase">{p.nalepka}</span>
              <h4 className="font-display text-3xl leading-[0.9] font-extrabold uppercase">{p.nazov}</h4>
              <p className="font-mono text-xs font-bold uppercase">{p.pre}</p>
              <p className="text-base leading-snug">{p.popis}</p>
              <ul className="flex flex-wrap gap-2" role="list">
                {p.body.map((b) => (
                  <li key={b} className="border-2 border-ink bg-white px-2 py-0.5 text-sm font-bold">
                    {b}
                  </li>
                ))}
              </ul>
              <a href="#zapis" className="mt-auto inline-flex min-h-11 items-center font-display text-base font-extrabold uppercase underline decoration-3 underline-offset-4">
                Chcem vedieť ako prvý →
              </a>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
        <CarouselDots />
      </div>
    </Carousel>
  );
}
