/** V7-09 · nálepky nalepené na fotku v hero (Fancy StickerPeel, vlastná verzia s odlepeným rohom).
 *  Desktop: dajú sa odlepiť a posunúť po plagáte (Motion drag). Mobil: stoja (žiadne touch-none cez obsah).
 *  Texty: NALEPKA_NEMOCNICA (hero-data.ts), VLAJKA (ponuka.ts), X zo znaku. */
import * as React from 'react';
import { StickerPeel } from '@/components/vendor/fancy/blocks/sticker-peel';
import { NALEPKA_NEMOCNICA } from '@/components/hero/hero-data';
import { VLAJKA } from '@/data/ponuka';

export default function Nalepky() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [tahat, setTahat] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const on = () => setTahat(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute -inset-6 z-30 sm:-inset-10">
      <div className="pointer-events-auto absolute -top-1 -left-2 sm:top-6 sm:-left-8">
        <StickerPeel rotate={-8} colorClassName="bg-yellow" draggable={tahat} dragConstraints={ref}>
          {NALEPKA_NEMOCNICA}
        </StickerPeel>
      </div>
      <div className="pointer-events-auto absolute right-0 bottom-16 sm:-right-6 sm:bottom-24">
        <StickerPeel rotate={7} colorClassName="bg-white" draggable={tahat} dragConstraints={ref}>
          <span className="block font-mono text-xs tracking-[0.12em]">{VLAJKA.nazov}</span>
          <span className="block">{VLAJKA.trvanie}</span>
        </StickerPeel>
      </div>
      <div className="pointer-events-auto absolute -right-1 -top-3 sm:-right-4 sm:top-2">
        <StickerPeel rotate={14} colorClassName="bg-paper" draggable={tahat} dragConstraints={ref} label="Znak X" restPeel={0.5}>
          <img src="/brand/x.svg" alt="" width="40" height="40" className="h-9 w-9 sm:h-11 sm:w-11" draggable={false} />
        </StickerPeel>
      </div>
    </div>
  );
}
