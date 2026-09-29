/** V7-05 · Komiks — panel 02 Zásah: „Chat vs. agent“ ako akordeón (BoldKit accordion). Otázka = čo robí chat
 *  (prečiarknuté), odpoveď = čo robí agent. Texty doslovne zo src/data/ponuka.ts (PRECO_NIE_CHATGPT). Ostrov: client:visible. */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PRECO_NIE_CHATGPT } from '@/data/ponuka';

export default function Liecba05() {
  return (
    <Accordion type="single" collapsible defaultValue="r0" className="w-full border-3 border-ink bg-white">
      {PRECO_NIE_CHATGPT.map((r, i) => (
        <AccordionItem key={r.chat} value={`r${i}`} className="border-b-3 border-ink last:border-b-0">
          <AccordionTrigger className="min-h-12 px-4 text-left text-base">
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-ink/60 uppercase">Chat</span>
              <span className="text-ink/70 line-through decoration-stamp decoration-2">{r.chat}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-yellow px-4 pt-3 pb-4 text-base">
            <span className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase">Agent · </span>
            {r.agent}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
