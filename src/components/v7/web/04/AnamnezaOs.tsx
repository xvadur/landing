/** V7-04 · zvislá os anamnézy (BoldKit Timeline, render na serveri, bez hydratácie). Zastávky z data.ts BIO. */
import { Timeline, TimelineCard, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineTime, TimelineTitle } from '@/components/ui/timeline';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BIO } from './data';

export default function AnamnezaOs() {
  return (
    <Timeline className="gap-0" aria-label="Anamnéza: osem zastávok">
      {BIO.map((z, i) => {
        const posledna = i === BIO.length - 1;
        const status = posledna ? 'current' : 'completed';
        return (
          <TimelineItem key={z.id} status={status} className="gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              <TimelineDot status={status} size="lg" className={cn('font-mono text-sm font-bold', posledna ? 'text-paper' : 'bg-yellow')}>
                {String(i + 1).padStart(2, '0')}
              </TimelineDot>
              {!posledna && <TimelineConnector status="completed" className="ml-0 min-h-6 flex-1" />}
            </div>
            <TimelineContent className="min-w-0 pb-8">
              <TimelineCard className={cn('t-odhal flex flex-col gap-2 shadow-brutal-sm sm:p-5', posledna ? 'bg-yellow' : 'bg-white')}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <TimelineTime className="font-mono text-xs font-bold text-ink uppercase">{z.kedy}</TimelineTime>
                  {z.kde && <span className="font-mono text-xs text-ink/60 uppercase">{z.kde}</span>}
                  {z.doplni && (
                    <Badge variant="secondary" className="ml-auto shadow-none hover:translate-x-0 hover:translate-y-0">
                      text doplní Adam
                    </Badge>
                  )}
                </div>
                <TimelineTitle className="font-display text-2xl leading-none font-extrabold sm:text-3xl">{z.nazov}</TimelineTitle>
                {z.text && <p className="text-base leading-snug sm:text-lg">{z.text}</p>}
                {z.citat && <blockquote className="mt-1 border-l-[6px] border-stamp pl-4 font-serif text-xl leading-snug italic">„{z.citat}“</blockquote>}
              </TimelineCard>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
