// Magic UI — Marquee (MIT, https://magicui.design/docs/components/marquee), vendorované 19. 9. 2026.
// Zmeny oproti registry: bez "use client" (Astro ostrov), pás jazdí cez globálne triedy `.marquee` / `.marquee-track`
// (global.css: keyframes translateX(−50 %), pauza na hover, reduced motion = stojí), vertikál cez vlastné keyframes,
// `duration` a `gap` ako props, retheme cez tokeny (border-3 border-ink, bg-*), žiadny ručný hex.
import { type ComponentPropsWithoutRef, type CSSProperties } from 'react';

import { cn } from '@/lib/utils';

export interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  /** Obrátený smer. @default false */
  reverse?: boolean;
  /** Pauza pri hoveri (myš). @default true */
  pauseOnHover?: boolean;
  /** Vertikálny pás namiesto horizontálneho. @default false */
  vertical?: boolean;
  /** Koľkokrát sa obsah zopakuje — musí byť párne, aby −50 % sedelo na celok. @default 4 */
  repeat?: number;
  /** Dĺžka jedného cyklu v sekundách. @default 40 */
  duration?: number;
  /** Medzera medzi položkami (CSS dĺžka). @default '2rem' */
  gap?: string;
  /** Rám 3 px ink hore/dole (pás sekcie). @default false */
  bordered?: boolean;
  children: React.ReactNode;
}

const VERTICAL_CSS = `
@keyframes magicui-marquee-y { from { transform: translateY(0); } to { transform: translateY(-50%); } }
.magicui-marquee[data-vertical='true'] { flex-direction: column; }
.magicui-marquee[data-vertical='true'] .marquee-track {
  flex-direction: column;
  width: auto;
  height: max-content;
  animation-name: magicui-marquee-y;
}
.magicui-marquee[data-pause='false']:hover .marquee-track { animation-play-state: running; }
@media (prefers-reduced-motion: reduce) {
  .magicui-marquee .marquee-track { animation-play-state: paused !important; }
}
`;

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  children,
  vertical = false,
  repeat = 4,
  duration = 40,
  gap = '2rem',
  bordered = false,
  style,
  ...props
}: MarqueeProps) {
  const count = Math.max(2, repeat % 2 === 0 ? repeat : repeat + 1);
  const trackStyle: CSSProperties = { gap, [vertical ? 'paddingBottom' : 'paddingRight']: gap } as CSSProperties;
  return (
    <div
      {...props}
      data-vertical={vertical ? 'true' : 'false'}
      data-reverse={reverse ? 'true' : 'false'}
      data-pause={pauseOnHover ? 'true' : 'false'}
      style={{ ...style, ['--marquee-duration' as string]: `${duration}s` } as CSSProperties}
      className={cn(
        'marquee magicui-marquee',
        vertical ? 'max-h-full' : 'w-full',
        bordered && 'border-y-3 border-ink',
        className,
      )}
    >
      {/* React 19 hoistuje <style href precedence> do <head> a dedupuje */}
      <style href="magicui-marquee" precedence="default">{VERTICAL_CSS}</style>
      <div className="marquee-track" style={trackStyle} aria-hidden={undefined}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={cn('flex shrink-0 items-center', vertical && 'flex-col')} style={{ gap }} aria-hidden={i > 0 || undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
