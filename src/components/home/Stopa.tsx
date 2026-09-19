/** Stopa za kurzorom v sekcii „Čo som postavil" (doc 10 §3 #13): Fancy ImageTrail s obrázkami public/assets/trail/*.webp
 *  (560 px kópie). Lazy ostrov len na desktope ≥ 1024 px s myšou (Postavil.tsx); ImageTrail sám má stráž na reduced motion.
 *  Overlay: leží absolútne nad mriežkou kariet (pointer-events: none, mriežka sa nikdy nepremountuje) a pohyb myši
 *  dostáva od hostiteľa (`host`) — natívny mousemove sa prepošle na kontajner ImageTrail ako syntetická udalosť
 *  (isTrusted = false, aby sa nezacyklila). repeatChildren = 1, obrázky sú zdvojené ručne (ImageTrail opakuje všetky deti). */
import { useEffect, useRef, type RefObject } from 'react';
import { ImageTrail, ImageTrailItem } from '@/components/vendor/fancy/image/image-trail';
import { cn } from '@/lib/utils';

const TRAIL = [
  { src: '/assets/trail/hero-adam.webp', rot: '-rotate-6' },
  { src: '/assets/trail/billion-scale.webp', rot: 'rotate-3' },
  { src: '/assets/trail/media-ai.webp', rot: '-rotate-2' },
  { src: '/assets/trail/senior-map.webp', rot: 'rotate-6' },
];

export default function Stopa({ host }: { host: RefObject<HTMLElement | null> }) {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = host.current;
    const trail = wrap.current?.firstElementChild;
    if (!h || !trail) return;
    const on = (e: MouseEvent) => {
      if (!e.isTrusted) return;
      trail.dispatchEvent(new MouseEvent('mousemove', { clientX: e.clientX, clientY: e.clientY, bubbles: true }));
    };
    h.addEventListener('mousemove', on);
    return () => h.removeEventListener('mousemove', on);
  }, [host]);

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      <ImageTrail
        as="div"
        className="overflow-visible"
        threshold={130}
        repeatChildren={1}
        keyframes={{ scale: [0, 1, 1, 0.9], rotate: [-8, 0, 0, 6], opacity: [0, 1, 1, 0] }}
        keyframesOptions={{ duration: 1.3, times: [0, 0.1, 0.8, 1] }}
        baseZIndex={20}
      >
        {[...TRAIL, ...TRAIL].map((t, i) => (
          <ImageTrailItem key={`${t.src}-${i}`} className={cn('w-44 rounded-lg border-3 border-ink bg-white p-1.5 shadow-brutal', t.rot)}>
            <img src={t.src} alt="" width={560} height={400} loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-sm object-cover" />
          </ImageTrailItem>
        ))}
      </ImageTrail>
    </div>
  );
}
