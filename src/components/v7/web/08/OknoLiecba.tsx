/** V7-08 · okno Liečba = dokument s tromi kapitolami (accordion, všetky otvorené → obsah v HTML). Texty doslovne
 *  z v54/Liecba.astro a src/data/ponuka.ts (VLAJKA, PRODUKTY, PRECO_NIE_CHATGPT). Produkty = layered-card, čakáreň
 *  otvorí okno Zápis s predvoleným produktom. */
import { ArrowRight, FileHeart } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LayeredCard, LayeredCardContent, LayeredCardDescription, LayeredCardFooter, LayeredCardHeader, LayeredCardTitle } from '@/components/ui/layered-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRECO_NIE_CHATGPT, PRODUKTY, VLAJKA } from '@/data/ponuka';
import Okno from './Okno';
import { otvorOkno, posli } from './store';

const agent = PRODUKTY.find((p) => p.id === 'agent-pre-teba')!;
const ucenie = PRODUKTY.filter((p) => p.id !== 'agent-pre-teba');
const bezPosunu = 'shadow-none hover:translate-x-0 hover:translate-y-0';

function Kapitola({ c, nazov, pod }: { c: string; nazov: string; pod: string }) {
  return (
    <span className="flex min-w-0 items-center gap-4 text-left">
      <span className="liecba-cislo shrink-0 font-display text-5xl leading-none font-extrabold sm:text-6xl" aria-hidden="true">
        {c}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-2xl leading-none font-extrabold uppercase sm:text-3xl">{nazov}</span>
        <span className="mt-1 block font-mono text-[11px] font-bold tracking-wider uppercase">{pod}</span>
      </span>
    </span>
  );
}

export default function OknoLiecba() {
  function cakaren(produkt: string) {
    posli({ typ: 'zapis', zdroj: 'cakacka', produkt });
    otvorOkno('zapis');
  }
  return (
    <Okno id="liecba" ikona={<FileHeart />} className="lg:col-span-7 lg:mt-6" stav={<>LIECBA.DOC · postup ako na zmene</>}>
      <div className="flex flex-col gap-5 p-4 sm:p-6">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.16em] uppercase">✚ Liečba</p>
          <p className="font-display text-3xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-4xl">Triáž. Zásah. Odovzdanie.</p>
          <p className="mt-3 max-w-2xl text-base sm:text-lg">
            Postup ako na zmene. Najprv zistím, čo bolí. Potom najmenší zásah, ktorý pomôže. Na konci ti to odovzdám tak, aby to išlo aj bezo mňa.
          </p>
        </div>
        <Accordion type="multiple" defaultValue={['triaz', 'zasah', 'odovzdanie']} className="flex flex-col">
          <AccordionItem value="triaz" className="bg-white">
            <AccordionTrigger className="min-h-16 px-4 py-3 hover:no-underline">
              <Kapitola c="01" nazov="Triáž" pod={`${VLAJKA.nazov} · ${VLAJKA.trvanie} · ${VLAJKA.cena}`} />
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 bg-paper">
              <p className="font-display text-2xl leading-tight font-extrabold">{VLAJKA.titulok}</p>
              <ol className="grid list-none gap-3 p-0">
                {VLAJKA.body.map((b, i) => (
                  <li key={b} className="flex gap-3 border-3 border-ink bg-white p-3 text-base">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border-3 border-ink bg-yellow font-mono font-bold">{i + 1}</span>
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ol>
              <Button variant="accent" size="lg" className="w-fit" data-track="konzultacia_klik" data-track-miesto="v708-liecba" onClick={() => otvorOkno('vysetrenie')}>
                Vyber si termín <ArrowRight aria-hidden="true" />
              </Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="zasah" className="bg-white">
            <AccordionTrigger className="min-h-16 px-4 py-3 hover:no-underline">
              <Kapitola c="02" nazov="Zásah" pod={`${agent.nalepka} · ${agent.pre}`} />
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 bg-paper">
              <p className="font-display text-2xl leading-tight font-extrabold">
                {agent.nazov}. {agent.popis}
              </p>
              <div className="border-3 border-ink bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2 font-display text-base font-extrabold uppercase">Chat</TableHead>
                      <TableHead className="w-1/2 border-l-3 border-ink bg-yellow font-display text-base font-extrabold text-ink uppercase">Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PRECO_NIE_CHATGPT.map((r) => (
                      <TableRow key={r.chat}>
                        <TableCell className="align-top text-sm whitespace-normal text-ink/70 line-through decoration-stamp decoration-2">{r.chat}</TableCell>
                        <TableCell className="border-l-3 border-ink align-top text-sm font-medium whitespace-normal">{r.agent}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button variant="outline" className="w-fit" onClick={() => cakaren(agent.id)}>
                Chcem vedieť ako prvý <ArrowRight aria-hidden="true" />
              </Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="odovzdanie" className="bg-white">
            <AccordionTrigger className="min-h-16 px-4 py-3 hover:no-underline">
              <Kapitola c="03" nazov="Odovzdanie" pod="Aby to išlo aj bezo mňa" />
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-5 bg-paper">
              <p className="font-display text-2xl leading-tight font-extrabold">Naučím ťa robiť to, čo robím ja. Po slovensky, na tvojej vlastnej úlohe.</p>
              <div className="grid gap-8 pr-3 pb-3 sm:grid-cols-3 sm:gap-6">
                {ucenie.map((p, i) => (
                  <LayeredCard key={p.id} layers={i === 0 ? 'triple' : 'double'} offset="sm" layerColor={i === 0 ? 'secondary' : 'default'} className="min-w-0">
                    <LayeredCardHeader className={p.farba}>
                      <Badge variant="outline" className={`w-fit font-mono text-[10px] ${bezPosunu}`}>
                        {p.nalepka}
                      </Badge>
                      <LayeredCardTitle className="mt-2 font-display text-xl leading-none font-extrabold uppercase">{p.nazov}</LayeredCardTitle>
                    </LayeredCardHeader>
                    <LayeredCardContent>
                      <LayeredCardDescription className="text-sm text-ink">{p.popis}</LayeredCardDescription>
                    </LayeredCardContent>
                    <LayeredCardFooter>
                      <button type="button" onClick={() => cakaren(p.id)} className="min-h-11 text-left font-display text-sm font-extrabold uppercase underline decoration-2 underline-offset-4">
                        Chcem vedieť ako prvý →
                      </button>
                    </LayeredCardFooter>
                  </LayeredCard>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Okno>
  );
}
