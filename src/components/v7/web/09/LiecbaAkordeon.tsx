/** V7-09 · Liečba 02 „Zásah“: prečo nie iba ChatGPT ako BoldKit Accordion. Riadok = čo robí chat (prečiarknuté),
 *  po otvorení = čo robí agent. Texty: PRECO_NIE_CHATGPT (src/data/ponuka.ts). */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PRECO_NIE_CHATGPT } from '@/data/ponuka';

export default function LiecbaAkordeon() {
  return (
    <Accordion type="single" collapsible defaultValue="r0" className="bg-white">
      {PRECO_NIE_CHATGPT.map((r, i) => (
        <AccordionItem key={r.chat} value={`r${i}`} className="bg-white">
          <AccordionTrigger className="min-h-14 gap-3 px-4 text-left text-base font-bold sm:text-lg">
            <span className="flex items-start gap-3">
              <span className="shrink-0 border-2 border-ink bg-paper px-1.5 font-mono text-xs leading-6">chat</span>
              <span className="line-through decoration-stamp decoration-[3px]">{r.chat}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-yellow">
            <p className="flex items-start gap-3 text-base font-bold sm:text-lg">
              <span className="shrink-0 border-2 border-ink bg-ink px-1.5 font-mono text-xs leading-6 text-yellow">agent</span>
              {r.agent}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
