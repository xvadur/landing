/** V7-04 · Tézy v akordeóne (BoldKit accordion): Adamove doslovné vety z v54/Tezy.astro. Trigger = začiatok vety,
 *  obsah = celá veta a kedy. Prvá je otvorená. Ostrov: <Tezy client:visible /> */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TEZY } from './data';

const zaciatok = (s: string) => {
  const slova = s.split(' ');
  return slova.length > 6 ? `${slova.slice(0, 6).join(' ')}…` : s;
};

export default function Tezy() {
  return (
    <Accordion type="single" collapsible defaultValue="t0" className="bg-white">
      {TEZY.map((t, i) => (
        <AccordionItem key={t.veta} value={`t${i}`} className="bg-white">
          <AccordionTrigger className="min-h-12 gap-3 text-left normal-case tracking-normal">
            <span className="flex min-w-0 items-baseline gap-3">
              <span className="font-mono text-xs text-ink/60">{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0">{zaciatok(t.veta)}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 bg-paper">
            <p className="font-serif text-xl leading-snug italic">„{t.veta}“</p>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink/70">Adam Rudavský · {t.kedy}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
