/** V7-04 · pás inštrumentára (BoldKit Marquee, čisté CSS, bez hydratácie). Nástroje doslovne z v54/Nastroje.astro. */
import { Fragment } from 'react';
import { Marquee, MarqueeItem, MarqueeSeparator } from '@/components/ui/marquee';
import { NASTROJE } from './data';

export default function Instrumentar() {
  return (
    <Marquee bordered={false} speed="slow" className="bg-ink">
      {NASTROJE.map((n) => (
        <Fragment key={n.nazov}>
          <MarqueeItem className="flex items-baseline gap-3 px-2">
            <span className="font-display text-2xl font-extrabold uppercase sm:text-3xl">{n.nazov}</span>
            <span className="font-mono text-xs text-paper/70 uppercase">{n.na}</span>
          </MarqueeItem>
          <MarqueeSeparator>
            <span className="text-yellow" aria-hidden="true">
              ✚
            </span>
          </MarqueeSeparator>
        </Fragment>
      ))}
    </Marquee>
  );
}
