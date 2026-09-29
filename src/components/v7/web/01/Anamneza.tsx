/** V7-01 · obrazovka Anamnéza (Kto som) ako záznam z monitora: vľavo hlavička pacienta (citát, pečiatka, záber chodby
 *  JIS), vpravo BoldKit Timeline so 8 zastávkami cesty. Zastávky bez textu majú štítok „text doplní Adam“.
 *  Statické SSR (bez hydratácie). Kusy: timeline, layered-card, sticker (Stamp), badge, separator, shapes. */
import { Check } from 'lucide-react';
import {
  Timeline,
  TimelineCard,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from '@/components/ui/timeline';
import { LayeredCard } from '@/components/ui/layered-card';
import { Stamp } from '@/components/ui/sticker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CrossShape } from '@/components/ui/shapes';
import { ANAMNEZA, BIO, KAPITOLY } from './data';
import Zaber from './Zaber';

const bezPosunu = 'shadow-none hover:translate-x-0 hover:translate-y-0';

export default function Anamneza() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
      <aside className="flex min-w-0 flex-col gap-6 lg:col-span-5 lg:self-start lg:sticky lg:top-40">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink/60">✚ Anamnéza · kto som</p>
          <h2 id="anamneza-h" className="font-display text-display-sm leading-[0.88] font-extrabold tracking-tighter uppercase">
            {ANAMNEZA.nadpis}
          </h2>
        </div>
        <LayeredCard layers="double" offset="default" layerColor="secondary" className="max-w-xl">
          <div className="relative flex flex-col gap-3 p-5">
            <CrossShape size={40} filled color="var(--color-stamp)" strokeColor="var(--color-ink)" className="absolute -top-5 -right-3 rotate-12" aria-hidden="true" />
            <p className="font-display text-2xl leading-tight font-extrabold sm:text-3xl">„{ANAMNEZA.citat}“</p>
            <p className="text-base">{ANAMNEZA.dovetok}</p>
          </div>
        </LayeredCard>
        <div className="flex flex-wrap items-center gap-4">
          <Stamp variant="default" size="lg" rotation="slight" doubleRing className="px-3 text-center leading-tight">
            {ANAMNEZA.peciatka}
          </Stamp>
          <ul className="flex flex-wrap gap-2" aria-label="Kapitoly">
            {KAPITOLY.map((k) => (
              <li key={k.id}>
                <Badge variant="outline" className={bezPosunu}>
                  {k.nazov} · {k.veta}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
        <Zaber id="01-chodba-jis" popis="chodba JIS, tvrdé svetlo, risograf" pomer="16 / 9" tvar="dna" className="hidden lg:block" />
      </aside>

      <Timeline className="min-w-0 lg:col-span-7">
        {BIO.map((z, i) => {
          const st = z.id === 'xvadur' ? 'current' : z.doplni ? 'upcoming' : 'completed';
          return (
            <TimelineItem key={z.id} status={st} data-kapitola={z.kapitola}>
              <TimelineTime className="hidden w-24 shrink-0 pt-2 text-right font-mono text-xs font-bold text-ink sm:block">{z.kedy}</TimelineTime>
              <div className="flex flex-col">
                <TimelineDot status={st} size="lg">
                  {st === 'completed' ? (
                    <Check className="h-5 w-5 stroke-[3]" />
                  ) : (
                    <span className={`font-mono text-xs font-bold ${st === 'current' ? 'text-paper' : ''}`}>{i + 1}</span>
                  )}
                </TimelineDot>
                {i < BIO.length - 1 && <TimelineConnector status={BIO[i + 1]!.doplni ? 'upcoming' : 'completed'} className="ml-[18.5px] flex-1" />}
              </div>
              <TimelineContent className="min-w-0 pb-6">
                <TimelineCard className={z.doplni ? 'border-dashed bg-paper shadow-none' : st === 'current' ? 'bg-yellow' : 'bg-white'}>
                  <p className="font-mono text-xs font-bold sm:hidden">{z.kedy}</p>
                  <TimelineTitle className="font-display text-xl font-extrabold uppercase sm:text-2xl">{z.nazov}</TimelineTitle>
                  {z.kde && <p className="font-mono text-xs uppercase">{z.kde}</p>}
                  <Separator className="my-3 h-[2px]" />
                  {z.doplni ? (
                    <Badge variant="secondary" className={bezPosunu}>
                      text doplní Adam
                    </Badge>
                  ) : (
                    <>
                      <p className="text-base leading-relaxed">{z.text}</p>
                      {z.citat && (
                        <blockquote className="mt-3 border-l-4 border-stamp pl-3 font-display text-lg leading-snug font-bold">„{z.citat}“</blockquote>
                      )}
                    </>
                  )}
                  {z.id === 'xvadur' && (
                    <a
                      href="#vysetrenie"
                      data-m01-cta
                      data-track="konzultacia_klik"
                      data-track-miesto="v7-01-anamneza"
                      className="mt-4 inline-flex min-h-12 items-center gap-2 border-3 border-ink bg-hot px-5 font-display text-base font-extrabold uppercase text-ink shadow-[4px_4px_0_0_var(--color-ink)]"
                    >
                      {ANAMNEZA.cta}
                    </a>
                  )}
                </TimelineCard>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
}
