/** V7-10 · Podnos 08 · Vyšetrenie. Vľavo karta vyšetrenia s časovou osou priebehu (PRIEBEH, konzultacia/data.ts),
 *  vpravo funkčná rezervácia, pod tým otázky (akordeón) a nálepka „zatiaľ zadarmo“. Texty: ponuka.ts, konzultacia/data.ts. */
import { Check } from 'lucide-react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDescription, TimelineDot, TimelineHeader, TimelineItem, TimelineTime, TimelineTitle } from '@/components/ui/timeline';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StickyNote } from '@/components/ui/sticker';
import { OTAZKY, OTAZKY_POZNAMKA, PRIEBEH, PRIEBEH_POZNAMKA, VSTUP_TEXT } from '@/components/konzultacia/data';
import { VLAJKA } from '@/data/ponuka';
import { Dlazdica, Etiketa } from './Dlazdica';
import Rezervacia from './Vysetrenie';

export default function PodnosVysetrenie() {
  return (
    <div className="v10-mriezka">
      <Dlazdica tone="ink" className="col-span-2 md:col-span-6 lg:col-span-4 lg:row-span-5" stitok="V-00 · karta" bezMagnetu>
        <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <Etiketa cislo="08" nazov="Vyšetrenie" className="text-yellow" />
          <p className="font-mono text-xs font-bold tracking-[0.12em] uppercase">
            {VLAJKA.nazov} · {VLAJKA.trvanie} · {VLAJKA.cena}
          </p>
          <h2 className="font-display text-[clamp(2.4rem,1.4rem+3vw,3.6rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">
            Objednaj sa na vyšetrenie.
          </h2>
          <p className="font-display text-xl leading-tight font-bold">{VLAJKA.titulok}</p>
          <Timeline className="mt-2 [&_h3]:text-paper">
            {PRIEBEH.map((k, i) => (
              <TimelineItem key={k.cas} status="completed" className="gap-3">
                <div className="flex flex-col">
                  <TimelineDot status="completed" size="sm" className="border-paper bg-yellow text-ink">
                    {i === PRIEBEH.length - 1 ? <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" /> : null}
                  </TimelineDot>
                  {i < PRIEBEH.length - 1 && <TimelineConnector status="completed" className="ml-[10px] flex-1 bg-paper/40" />}
                </div>
                <TimelineContent className="pb-4">
                  <TimelineHeader>
                    <TimelineTime className="bg-paper px-1.5 font-mono font-bold text-ink">{k.cas}</TimelineTime>
                  </TimelineHeader>
                  <TimelineTitle className="mt-1 text-base leading-snug font-bold normal-case tracking-normal">{k.vznikne}</TimelineTitle>
                  <TimelineDescription className="text-paper/70">{k.vedie}</TimelineDescription>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </Dlazdica>

      <Dlazdica id="termin" tone="white" className="col-span-2 md:col-span-6 lg:col-span-8 lg:row-span-4" stitok="V-01 · termín" bezMagnetu>
        <Rezervacia />
      </Dlazdica>

      <Dlazdica tone="paper" className="col-span-2 md:col-span-4 lg:col-span-5" stitok="V-02 · otázky" bezMagnetu>
        <div className="p-4 sm:p-5">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="otazky">
              <AccordionTrigger className="text-left">Šesť otázok, ktoré menia riešenie</AccordionTrigger>
              <AccordionContent>
                <ol className="grid list-decimal gap-1.5 pl-5 text-sm">
                  {OTAZKY.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ol>
                <p className="mt-3 font-mono text-xs">{OTAZKY_POZNAMKA}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="priebeh">
              <AccordionTrigger className="text-left">Keď je prostredie zložité</AccordionTrigger>
              <AccordionContent className="text-sm">{PRIEBEH_POZNAMKA}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="vstup">
              <AccordionTrigger className="text-left">Čo si priniesť</AccordionTrigger>
              <AccordionContent className="font-serif text-lg italic">{VSTUP_TEXT}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Dlazdica>

      <Dlazdica tone="yellow" className="col-span-2 md:col-span-2 lg:col-span-3" innerClassName="tx-dots [--tx:18%]" stitok="V-03">
        <div className="flex h-full items-center justify-center p-5">
          <StickyNote variant="white" size="lg" rotation="right" pin>
            <p className="font-display text-2xl leading-none font-extrabold uppercase">{VLAJKA.cena}</p>
            <p className="mt-2 font-mono text-sm font-bold">{VLAJKA.trvanie}</p>
          </StickyNote>
        </div>
      </Dlazdica>
    </div>
  );
}
