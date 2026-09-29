/** Kit · Rozloženie — 2 recepty prezentácie projektov: Jakub, Lucia, Hriech, Korpus (texty z Chorobopisy.astro ← fakty.ts). */
import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Recept } from './ReceptyBio';
import { PROJEKTY, domena, type Projekt } from './data';

const noHover = 'shadow-none hover:translate-x-0 hover:translate-y-0';
const ACC_OPEN = 'min-h-14 text-left';

function Odkaz({ p, tmavy }: { p: Projekt; tmavy?: boolean }) {
  if (!p.url) return <Badge variant="outline" className={noHover}>{p.stav}</Badge>;
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener"
      className={`press inline-flex min-h-11 items-center rounded-full border-3 px-4 font-mono text-xs font-bold shadow-brutal-sm ${tmavy ? 'border-paper bg-paper text-ink' : 'border-ink bg-ink text-paper'}`}
    >
      {domena(p.url)} ↗
    </a>
  );
}

function Obraz({ p, ratio }: { p: Projekt; ratio: number }) {
  return (
    <div className="overflow-hidden border-3 border-ink bg-paper">
      <AspectRatio ratio={ratio}>
        {p.obrazok ? (
          <img src={p.obrazok} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full w-full flex-col justify-end bg-yellow p-5 tx-dots">
            <p className="font-display text-5xl leading-none font-extrabold whitespace-nowrap sm:text-6xl">{p.cislo}</p>
            <p className="mt-1 font-mono text-xs font-bold uppercase">{p.cisloPopis}</p>
          </div>
        )}
      </AspectRatio>
    </div>
  );
}

/* ------------------------------------------------------------------ 05 chorobopisy v záložkách */
function Zalozky() {
  return (
    <Recept
      c="05"
      nazov="Chorobopisy v záložkách"
      veta="Jeden pacient na obrazovke: záložka = chorobopis. Vľavo obraz alebo číslo, vpravo diagnóza a liečba v rozbaľovačoch. Krátke na mobile, plné na desktope."
      kusy={['tabs', 'aspect-ratio', 'accordion', 'badge']}
    >
      <Tabs defaultValue={PROJEKTY[0].id}>
        <div className="overflow-x-auto pb-3">
          <TabsList className="h-auto w-max">
            {PROJEKTY.map((p, i) => (
              <TabsTrigger key={p.id} value={p.id} className="min-h-12 gap-2 data-[state=active]:bg-yellow data-[state=active]:text-ink">
                <span className="font-mono text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                {p.nazov.split(',')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {PROJEKTY.map((p) => (
          <TabsContent key={p.id} value={p.id} className="mt-6">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <Obraz p={p} ratio={4 / 3} />
                <div className="flex flex-wrap gap-2">
                  {p.stitky.map((s) => (
                    <Badge key={s} variant="outline" className={`rounded-full font-mono ${noHover}`}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <div>
                  <p className="font-mono text-xs font-bold uppercase">Chorobopis · {p.stav}</p>
                  <h4 className="font-display text-5xl leading-[0.9] font-extrabold tracking-tight uppercase">{p.nazov}</h4>
                  <p className="mt-3 text-lg">{p.riadok}</p>
                </div>
                <Accordion type="single" collapsible defaultValue={p.mal ? 'mal' : 'cisla'}>
                  {p.mal && (
                    <AccordionItem value="mal">
                      <AccordionTrigger className={ACC_OPEN}>Diagnóza · s čím prišiel</AccordionTrigger>
                      <AccordionContent className="text-base">
                        <ul className="flex list-disc flex-col gap-1 pl-5">
                          {p.mal.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {p.dostal && (
                    <AccordionItem value="dostal">
                      <AccordionTrigger className={ACC_OPEN}>Liečba · čo dostal</AccordionTrigger>
                      <AccordionContent className="text-base">
                        <ul className="flex list-disc flex-col gap-1 pl-5">
                          {p.dostal.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {p.cisla && (
                    <AccordionItem value="cisla">
                      <AccordionTrigger className={ACC_OPEN}>Vitálne funkcie · čísla</AccordionTrigger>
                      <AccordionContent>
                        <dl className="grid grid-cols-2 gap-4">
                          {p.cisla.map((c) => (
                            <div key={c.label}>
                              <dt className="font-display text-3xl font-extrabold whitespace-nowrap">{c.value}</dt>
                              <dd className="font-mono text-xs uppercase">{c.label}</dd>
                            </div>
                          ))}
                        </dl>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {p.stavText && (
                    <AccordionItem value="stav">
                      <AccordionTrigger className={ACC_OPEN}>Stav</AccordionTrigger>
                      <AccordionContent className="text-base">{p.stavText}</AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
                <div className="flex flex-wrap items-center gap-4">
                  <Odkaz p={p} />
                  <span className="font-display text-3xl font-extrabold whitespace-nowrap">{p.cislo}</span>
                  <span className="font-mono text-xs uppercase">{p.cisloPopis}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Recept>
  );
}

/* ------------------------------------------------------------------ 06 spis s registrom */
function Spis() {
  const [i, setI] = React.useState(0);
  const p = PROJEKTY[i];
  const klik = (n: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setI(Math.max(0, Math.min(PROJEKTY.length - 1, n)));
  };
  return (
    <Recept
      c="06"
      nazov="Spis s registrom"
      veta="Archív ako v ambulancii: register vľavo (na mobile pás do strán), otvorený spis vpravo, omrvinky hore, listovanie dole. Vhodné, keď pribudnú ďalší pacienti."
      kusy={['breadcrumb', 'scroll-area', 'card', 'separator', 'collapsible', 'pagination']}
      tmavy
    >
      <Breadcrumb className="mb-6">
        <BreadcrumbList className="text-paper/60">
          <BreadcrumbItem>
            <BreadcrumbLink href="#recepty-projekty" className="inline-flex min-h-11 items-center hover:text-paper">
              Chorobopisy
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span>{p.stitky[0]}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-paper">{p.nazov}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* register: mobil vodorovne, desktop zvislo */}
        <ScrollArea className="border-3 border-paper lg:h-[460px]">
          <ul className="flex w-max gap-0 lg:w-full lg:flex-col" role="list">
            {PROJEKTY.map((x, n) => (
              <li key={x.id} className="border-r-3 border-paper last:border-r-0 lg:border-r-0 lg:border-b-3 lg:last:border-b-0">
                <button
                  type="button"
                  onClick={() => setI(n)}
                  aria-current={n === i ? 'true' : undefined}
                  className={`flex min-h-11 w-40 flex-col items-start gap-1 p-3 text-left lg:w-full ${n === i ? 'bg-yellow text-ink' : 'hover:bg-paper/10'}`}
                >
                  <span className="font-mono text-[10px] font-bold">SPIS {String(n + 1).padStart(2, '0')}</span>
                  <span className="font-bold uppercase">{x.nazov}</span>
                  <span className="font-mono text-xs">{x.stav}</span>
                </button>
              </li>
            ))}
          </ul>
          <ScrollBar orientation="horizontal" className="lg:hidden [&>div]:bg-yellow" />
        </ScrollArea>

        <Card className="bg-paper text-ink">
          <CardHeader className="gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs font-bold uppercase">
                Spis {String(i + 1).padStart(2, '0')} / {String(PROJEKTY.length).padStart(2, '0')}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.stitky.map((s) => (
                  <Badge key={s} variant="outline" className={`rounded-full font-mono ${noHover}`}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <CardTitle className="font-display text-4xl font-extrabold sm:text-5xl">{p.nazov}</CardTitle>
            <p className="text-lg">{p.riadok}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <Obraz p={p} ratio={16 / 10} />
              <div className="flex flex-col gap-3">
                {(p.cisla ?? [{ value: p.cislo, label: p.cisloPopis }]).slice(0, 3).map((c, n) => (
                  <React.Fragment key={c.label}>
                    {n > 0 && <Separator className="h-[2px]" />}
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-3xl font-extrabold whitespace-nowrap">{c.value}</span>
                      <span className="text-right font-mono text-xs uppercase">{c.label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            {(p.mal || p.stavText) && (
              <Collapsible key={p.id}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-fit">
                    Celý záznam <ChevronDown />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {p.mal && (
                      <div>
                        <p className="font-mono text-xs font-bold uppercase">Mal</p>
                        <ul className="mt-1 list-disc pl-5 text-sm">
                          {p.mal.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {p.dostal && (
                      <div>
                        <p className="font-mono text-xs font-bold uppercase">Dostal</p>
                        <ul className="mt-1 list-disc pl-5 text-sm">
                          {p.dostal.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {p.stavText && <p className="mt-4 border-l-4 border-ink pl-3 text-sm">{p.stavText}</p>}
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-4 p-4 sm:p-6">
            <Odkaz p={p} />
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink href="#" size="icon" aria-label="Predchádzajúci spis" className={i === 0 ? 'pointer-events-none opacity-50' : ''} onClick={klik(i - 1)}>
                    <ChevronLeft className="h-4 w-4 stroke-[3]" />
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem className="px-2 font-mono text-xs font-bold sm:hidden" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')} / {String(PROJEKTY.length).padStart(2, '0')}
                </PaginationItem>
                {PROJEKTY.map((x, n) => (
                  <PaginationItem key={x.id} className="hidden sm:list-item">
                    <PaginationLink href="#" isActive={n === i} aria-label={`Spis ${n + 1}: ${x.nazov}`} onClick={klik(n)}>
                      {n + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationLink href="#" size="icon" aria-label="Ďalší spis" className={i === PROJEKTY.length - 1 ? 'pointer-events-none opacity-50' : ''} onClick={klik(i + 1)}>
                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>
    </Recept>
  );
}

export default function ReceptyProjekty() {
  return (
    <section id="recepty-projekty" aria-labelledby="recepty-projekty-h" className="scroll-mt-24 border-t-3 border-ink py-12 sm:py-16">
      <header className="mb-10 flex flex-col gap-3">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink/60">Recepty · projekty</p>
        <h2 id="recepty-projekty-h" className="font-display text-display-md leading-[0.9] font-extrabold uppercase">
          Dva spôsoby, ako ukázať pacientov
        </h2>
        <p className="max-w-3xl text-lg">Jakub, Lucia, Hriech a Korpus: texty a čísla z Chorobopisov (fakty.ts). Kde je odkaz, je overený (26. 9. 2026).</p>
      </header>
      <div className="flex flex-col gap-14">
        <Zalozky />
        <Spis />
      </div>
    </section>
  );
}
