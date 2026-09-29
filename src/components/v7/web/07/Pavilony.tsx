/** V7-07 · obsah pavilónov A–E a dvere na konci chodby. Každý pavilón = <article id data-miesto> s portálom (tabuľou)
 *  a obsahom. Vo vodorovnej chodbe (desktop) je obsah rad stĺpcov vysoký ako okno; na mobile a pri reduced motion
 *  zvislý tok. Texty: data.ts (cesta, beaty, fakty), v54/Liecba.astro + ponuka.ts, v5/TextyHry.astro. */
import * as React from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, FileText, Gamepad2, Scissors, Stethoscope } from 'lucide-react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineTime, TimelineTitle } from '@/components/ui/timeline';
import { LayeredCard } from '@/components/ui/layered-card';
import { Stamp, Sticker } from '@/components/ui/sticker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DonutChart, DonutChartCenter } from '@/components/ui/donut-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { AsciiCube, AsciiHelix } from '@/components/ui/ascii-shapes';
import { MathCurveBackground } from '@/components/ui/math-curve-background';
import { InView, inViewDropVariants } from '@/components/vendor/motionprimitives/in-view';
import { PRECO_NIE_CHATGPT, PRODUKTY, VLAJKA } from '@/data/ponuka';
import { DOKAZY, OVERENE_DNA_TEXT } from '@/data/fakty';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import { cn } from '@/lib/utils';
import { ANAMNEZA, BIO, HRA, HRY_V_STAVBE, PROJEKTY, STAV, domena, miesto, type Projekt } from './data';
import { Portal } from './Portal';
import { useChodba } from './kontext';
import { otvor } from './navigacia';
import { Halftone } from './Halftone';

export type Text = { id: string; title: string; description: string; datum: string };

/** Obal pavilónu: vodorovne rad (výška okna), inak stĺpec. */
function Pavilon({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { vodorovne } = useChodba();
  return (
    <article id={id} data-miesto={id} aria-label={`Pavilón ${miesto(id as never).pismeno}: ${miesto(id as never).nazov}`} className={cn('v07-pav relative', vodorovne ? 'flex h-full shrink-0' : 'flex flex-col border-b-3 border-ink', className)}>
      {children}
    </article>
  );
}

/** Obsah pavilónu vedľa portálu. */
function Obsah({ children, className }: { children: React.ReactNode; className?: string }) {
  const { vodorovne } = useChodba();
  return (
    <div className={cn(vodorovne ? 'flex h-full shrink-0 items-center gap-8 px-10 py-8' : 'mx-auto flex w-full max-w-[1500px] flex-col gap-10 px-4 py-12 sm:px-6 lg:px-10', className)}>
      {children}
    </div>
  );
}

/** Na mobile karta „padne“ na miesto (Motion Primitives InView); vo vodorovnej chodbe bez obalu (hýbe ňou GSAP rodič). */
function Padni({ children, className }: { children: React.ReactNode; className?: string }) {
  const { vodorovne } = useChodba();
  if (vodorovne) return <div className={className}>{children}</div>;
  return (
    <InView variants={inViewDropVariants} transition={{ duration: 0.28, ease: (t: number) => Math.ceil(t * 4) / 4 }} viewOptions={{ margin: '0px 0px -10% 0px' }} once className={className}>
      {children}
    </InView>
  );
}

/* =========================== A · ANAMNÉZA =========================== */

export function PavA() {
  const { vodorovne: v } = useChodba();
  return (
    <Pavilon id="anamneza">
      <Portal m={miesto('anamneza')} farba="yellow" />
      <Obsah className={v ? 'gap-12' : 'lg:grid lg:grid-cols-[380px_1fr] lg:items-start'}>
        <Padni className={cn('shrink-0', v ? 'w-[380px]' : 'w-full max-w-[420px]')}>
          <LayeredCard layers="double" layerColor="secondary" className="w-full">
            <div className="relative flex flex-col gap-4 border-3 border-ink bg-white p-6">
              <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Anamnéza · kto som</p>
              <h3 className="font-display text-4xl leading-[0.9] font-extrabold tracking-tight uppercase">{ANAMNEZA.nadpis}</h3>
              <blockquote className="font-serif text-2xl leading-snug italic">„{ANAMNEZA.citat}“</blockquote>
              <p className="text-base">{ANAMNEZA.dovetok}</p>
              <a href="#vysetrenie" data-chod="vysetrenie" className="press mt-2 inline-flex min-h-12 w-fit items-center gap-2 border-3 border-ink bg-hot px-4 font-display text-base font-extrabold uppercase shadow-brutal-sm">
                {ANAMNEZA.cta}
              </a>
              <Stamp size="default" rotation="slight" variant="default" className="absolute -top-8 -right-5 text-center font-mono text-[11px] leading-tight uppercase">
                {ANAMNEZA.peciatka}
              </Stamp>
            </div>
          </LayeredCard>
        </Padni>

        <Timeline orientation={v ? 'horizontal' : 'vertical'} className={cn(v ? 'w-max items-start' : 'w-full')} aria-label="Cesta: osem zastávok">
          {BIO.map((b, i) => {
            const posledna = i === BIO.length - 1;
            const st = posledna ? 'current' : b.doplni ? 'upcoming' : 'completed';
            const dalsiaDoplni = BIO[i + 1]?.doplni || b.doplni;
            const bodka = (
              <TimelineDot status={st} size="lg">
                {st === 'completed' ? <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" /> : <span className="font-mono text-xs font-bold text-inherit">{i + 1}</span>}
              </TimelineDot>
            );
            const karta = (
              <div className={cn('flex flex-col gap-2 border-3 border-ink p-4 shadow-brutal-sm', posledna ? 'bg-yellow' : 'bg-white', b.doplni && 'tx-halftone bg-paper [--tx:10%]')}>
                <TimelineTime className="font-mono text-xs font-bold uppercase">
                  {b.overuje ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="min-h-6 underline decoration-dotted underline-offset-4">
                          {b.kedy}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Dátum sa ešte overuje.</TooltipContent>
                    </Tooltip>
                  ) : (
                    b.kedy
                  )}
                </TimelineTime>
                <TimelineTitle className="font-display text-2xl leading-none font-extrabold uppercase">{b.nazov}</TimelineTitle>
                {b.kde && <p className="font-mono text-xs uppercase">{b.kde}</p>}
                {b.text && <p className="text-[15px] leading-snug">{b.text}</p>}
                {b.citat && <blockquote className="border-l-4 border-ink pl-3 font-serif text-lg leading-snug italic">„{b.citat}“</blockquote>}
                {b.doplni && (
                  <Badge variant="outline" className="w-fit">
                    text doplní Adam
                  </Badge>
                )}
              </div>
            );
            return v ? (
              <TimelineItem key={b.id} status={st} className="w-[290px] shrink-0 items-start gap-4">
                <div className="flex w-full items-center">
                  {bodka}
                  {!posledna && <TimelineConnector status={dalsiaDoplni ? 'upcoming' : 'completed'} className="mt-0 flex-1" />}
                </div>
                <TimelineContent className="w-full pr-6">{karta}</TimelineContent>
              </TimelineItem>
            ) : (
              <TimelineItem key={b.id} status={st}>
                <div className="flex flex-col items-center">
                  {bodka}
                  {!posledna && <TimelineConnector status={dalsiaDoplni ? 'upcoming' : 'completed'} className="ml-0 flex-1" />}
                </div>
                <TimelineContent className="min-w-0 pb-6">
                  <Padni>{karta}</Padni>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </Obsah>
    </Pavilon>
  );
}

/* =========================== B · CHOROBOPISY =========================== */

function KartaProjektu({ p, i }: { p: Projekt; i: number }) {
  return (
    <Card role="group" className={cn('flex h-full flex-col bg-white', i % 3 === 0 && 'bg-paper')}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 p-4 font-mono text-xs font-bold tracking-[0.12em] uppercase">
        <span>Chorobopis {String(i + 1).padStart(2, '0')}</span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 border-2 border-ink', p.stav === 'zive' ? 'bg-yellow' : 'bg-paper')} aria-hidden="true" />
          {STAV[p.stav]}
        </span>
      </CardHeader>
      {p.obrazok && (
        <div className="h-28 overflow-hidden border-b-3 border-ink bg-paper">
          <img src={p.obrazok} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
        </div>
      )}
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {p.stitky.map((s) => (
            <Badge key={s} variant="outline" className="font-mono text-[11px] shadow-none hover:translate-x-0 hover:translate-y-0">
              {s}
            </Badge>
          ))}
        </div>
        <CardTitle className="font-display text-3xl leading-[0.9] font-extrabold uppercase">{p.nazov}</CardTitle>
        <p className="text-[15px] leading-snug">{p.riadok}</p>
        <div className="mt-auto border-t-3 border-ink pt-3">
          <p className="font-display text-4xl leading-none font-extrabold whitespace-nowrap tabular-nums">{p.cislo}</p>
          <p className="mt-1 font-mono text-xs font-bold uppercase">{p.cisloPopis}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2 p-4">
        <Button size="sm" onClick={() => otvor({ typ: 'projekt', id: p.id })} className="min-h-11">
          <FileText className="h-4 w-4" aria-hidden="true" /> Otvor chorobopis
        </Button>
        {p.url ? (
          <HoverCard openDelay={150}>
            <HoverCardTrigger asChild>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 px-1 font-mono text-xs font-bold underline underline-offset-4">
                {domena(p.url)} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <p className="font-mono text-xs font-bold uppercase">Odkaz overený</p>
              <p className="mt-1 text-sm">
                {domena(p.url)} vrátil HTTP 200 dňa {OVERENE_DNA_TEXT}. {p.poznamka === 'demo' ? 'Je to demo.' : ''}
              </p>
            </HoverCardContent>
          </HoverCard>
        ) : (
          p.poznamka && <span className="font-mono text-xs">{p.poznamka}</span>
        )}
      </CardFooter>
    </Card>
  );
}

function TvojChorobopis() {
  return (
    <div className="flex h-full min-h-[320px] flex-col justify-center gap-5 border-3 border-dashed border-ink bg-paper p-6">
      <p className="font-display text-5xl leading-[0.88] font-extrabold tracking-tighter uppercase">Ďalší chorobopis: tvoj.</p>
      <a href="#vysetrenie" data-chod="vysetrenie" className="press inline-flex min-h-14 w-fit items-center gap-2 border-3 border-ink bg-hot px-5 font-display text-lg font-extrabold uppercase shadow-brutal">
        <Stethoscope className="h-5 w-5" aria-hidden="true" /> Vyšetrenie →
      </a>
    </div>
  );
}

export function PavB() {
  const { vodorovne: v } = useChodba();
  return (
    <Pavilon id="chorobopisy">
      <Portal m={miesto('chorobopisy')} farba="white" />
      <Obsah className={v ? 'gap-6' : 'gap-6'}>
        {v ? (
          <>
            <div className="flex w-[300px] shrink-0 flex-col gap-4">
              <h3 className="font-display text-6xl leading-[0.86] font-extrabold tracking-tighter uppercase">Čo som postavil</h3>
              <p className="text-lg">Každý systém so stavom, ako naozaj je. Kde je odkaz, dá sa otvoriť.</p>
              <Sticker variant="default" rotation="slight" size="lg" className="w-fit font-mono uppercase">
                {PROJEKTY.length} chorobopisov
              </Sticker>
            </div>
            {PROJEKTY.map((p, i) => (
              <div key={p.id} className="h-[min(560px,calc(100dvh-220px))] w-[310px] shrink-0">
                <KartaProjektu p={p} i={i} />
              </div>
            ))}
            <div className="h-[min(560px,calc(100dvh-220px))] w-[320px] shrink-0">
              <TvojChorobopis />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-display text-[clamp(2.6rem,1.4rem+5vw,5rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">Čo som postavil</h3>
              <p className="max-w-md text-lg">Každý systém so stavom, ako naozaj je. Kde je odkaz, dá sa otvoriť.</p>
            </div>
            <Carousel opts={{ align: 'start', loop: false }} className="w-full" label="Chorobopisy">
              <CarouselContent className="-ml-4 pb-3">
                {PROJEKTY.map((p, i) => (
                  <CarouselItem key={p.id} className="basis-[86%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <KartaProjektu p={p} i={i} />
                  </CarouselItem>
                ))}
                <CarouselItem className="basis-[86%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <TvojChorobopis />
                </CarouselItem>
              </CarouselContent>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <CarouselDots />
                <div className="flex gap-3">
                  <CarouselPrevious className="static h-11 w-11 translate-x-0 translate-y-0" />
                  <CarouselNext className="static h-11 w-11 translate-x-0 translate-y-0" />
                </div>
              </div>
            </Carousel>
          </>
        )}
      </Obsah>
    </Pavilon>
  );
}

/* =========================== C · LIEČBA =========================== */

const agent = PRODUKTY.find((p) => p.id === 'agent-pre-teba')!;
const ucenie = PRODUKTY.filter((p) => p.id !== 'agent-pre-teba');

function Ordinacia({ cislo, nazov, meta, children, className }: { cislo: string; nazov: string; meta: string; children: React.ReactNode; className?: string }) {
  const { vodorovne: v } = useChodba();
  return (
    <section aria-label={`${cislo} ${nazov}`} className={cn('relative flex flex-col gap-4 border-3 border-ink bg-white p-5 shadow-brutal sm:p-6', v && 'max-h-full overflow-hidden', className)}>
      <div className="flex items-end gap-4 border-b-3 border-ink pb-3">
        <span className="v07-obrys" aria-hidden="true">
          {cislo}
        </span>
        <div className="min-w-0 pb-1">
          <h3 className="font-display text-4xl leading-none font-extrabold uppercase">{nazov}</h3>
          <p className="mt-1 font-mono text-xs font-bold tracking-[0.1em] uppercase">{meta}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function PavC() {
  const { vodorovne: v } = useChodba();
  const W = v ? 'w-[430px] shrink-0' : '';
  return (
    <Pavilon id="liecba">
      <Portal m={miesto('liecba')} farba="yellow" />
      <Obsah className={v ? 'gap-8' : 'lg:grid lg:grid-cols-3 lg:items-start'}>
        <div className={cn('flex flex-col gap-4', v ? 'w-[320px] shrink-0' : 'lg:col-span-3')}>
          <h3 className="font-display text-[clamp(2.6rem,1.4rem+4vw,4.5rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">
            Triáž. Zásah. Odovzdanie.
          </h3>
          <p className="max-w-2xl text-lg">Postup ako na zmene. Najprv zistím, čo bolí. Potom najmenší zásah, ktorý pomôže. Na konci ti to odovzdám tak, aby to išlo aj bezo mňa.</p>
        </div>

        <Padni className={W}>
          <Ordinacia cislo="01" nazov="Triáž" meta={`${VLAJKA.nazov} · ${VLAJKA.trvanie} · ${VLAJKA.cena}`}>
            <p className="font-display text-2xl leading-tight font-extrabold">{VLAJKA.titulok}</p>
            <ol className="grid gap-2">
              {VLAJKA.body.map((b, i) => (
                <li key={b} className="flex gap-3 border-3 border-ink bg-paper p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border-3 border-ink bg-yellow font-mono text-sm font-bold">{i + 1}</span>
                  <span className="text-[15px] leading-snug">{b}</span>
                </li>
              ))}
            </ol>
            <a href="#vysetrenie" data-chod="vysetrenie" className="press inline-flex min-h-13 w-fit items-center gap-2 border-3 border-ink bg-hot px-5 font-display text-lg font-extrabold uppercase shadow-brutal">
              Vyber si termín →
            </a>
          </Ordinacia>
        </Padni>

        <Padni className={W}>
          <Ordinacia cislo="02" nazov="Zásah" meta={`${agent.nalepka} · ${agent.pre}`}>
            <p className="font-display text-xl leading-tight font-extrabold">
              {agent.nazov}. {agent.popis}
            </p>
            <Tabs defaultValue="agent" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2">
                <TabsTrigger value="chat" className="min-h-11">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="agent" className="min-h-11">
                  Agent
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="mt-3">
                <ul className="grid gap-2">
                  {PRECO_NIE_CHATGPT.map((r) => (
                    <li key={r.chat} className="border-3 border-ink bg-white px-3 py-2 text-[15px] leading-snug text-ink/70 line-through decoration-stamp decoration-2">
                      {r.chat}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="agent" className="mt-3">
                <ul className="grid gap-2">
                  {PRECO_NIE_CHATGPT.map((r) => (
                    <li key={r.agent} className="flex gap-2 border-3 border-ink bg-yellow px-3 py-2 text-[15px] leading-snug">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 stroke-[3]" aria-hidden="true" /> {r.agent}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </Ordinacia>
        </Padni>

        <Padni className={W}>
          <Ordinacia cislo="03" nazov="Odovzdanie" meta="Aby to išlo aj bezo mňa">
            <p className="font-display text-xl leading-tight font-extrabold">Naučím ťa robiť to, čo robím ja. Po slovensky, na tvojej vlastnej úlohe.</p>
            <Accordion type="single" collapsible defaultValue={ucenie[0]!.id} className="flex flex-col gap-2">
              {ucenie.map((p) => (
                <AccordionItem key={p.id} value={p.id} className="shadow-none">
                  <AccordionTrigger className="min-h-12 px-3 py-2 text-left">
                    <span className="flex flex-col">
                      <span className="font-display text-lg leading-none font-extrabold uppercase">{p.nazov}</span>
                      <span className="mt-1 font-mono text-[11px] font-bold uppercase">{p.nalepka}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <p className="text-[15px] leading-snug">{p.popis}</p>
                    <a href="#vychod" data-chod="vychod" className="mt-2 inline-flex min-h-11 items-center font-display text-sm font-extrabold uppercase underline decoration-3 underline-offset-4">
                      Chcem vedieť ako prvý →
                    </a>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Ordinacia>
        </Padni>
      </Obsah>
    </Pavilon>
  );
}

/* =========================== D · HERŇA =========================== */

const CFG_FRAZY: ChartConfig = {
  sfrazou: { label: 's frázou', color: 'hsl(var(--foreground))' },
  bez: { label: 'bez frázy', color: 'hsl(var(--card))' },
};

export function PavD() {
  const { vodorovne: v } = useChodba();
  const frazy = [
    { name: 'sfrazou', value: HRA.fraza.value, fill: 'hsl(var(--foreground))' },
    { name: 'bez', value: HRA.fraza.z - HRA.fraza.value, fill: 'hsl(var(--card))' },
  ];
  return (
    <Pavilon id="herna">
      <Portal m={miesto('herna')} farba="ink" />
      <Obsah className={v ? 'gap-8' : 'lg:grid lg:grid-cols-[1.4fr_1fr] lg:items-start'}>
        <Padni className={cn(v ? 'w-[600px] shrink-0' : '')}>
          <div className="relative flex flex-col gap-5 border-3 border-ink bg-yellow p-6 shadow-brutal-lg">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Hra 01 · beží</p>
              <Sticker variant="outline" rotation="slight-right" size="sm" className="font-mono uppercase">
                hrá sa tu, v prehliadači
              </Sticker>
            </div>
            <h3 className="font-display text-5xl leading-[0.9] font-extrabold uppercase">{HRA.nazov}</h3>
            <p className="max-w-lg text-lg">{HRA.text}</p>
            <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
              <div className="h-[180px] w-[180px]">
                <DonutChart
                  data={frazy}
                  config={CFG_FRAZY}
                  innerRadius="58%"
                  outerRadius="92%"
                  showTooltip={false}
                  centerContent={<DonutChartCenter value={`${HRA.fraza.value} / ${HRA.fraza.z}`} label="kancelárií" />}
                  aria-label={`${HRA.fraza.value} zo ${HRA.fraza.z} kancelárií má frázu`}
                  className="h-[180px]"
                />
              </div>
              <p className="text-base font-bold">
                {HRA.fraza.value} zo {HRA.fraza.z} kancelárií má v texte aspoň jednu zo šiestich fráz. Tvoj text ich má koľko?
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="accent" onClick={() => otvor({ typ: 'hra' })}>
                <Scissors className="h-5 w-5" aria-hidden="true" /> Hrať tu
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={HRA.href}>
                  Celá hra <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </Padni>

        <div className={cn('flex flex-col gap-6', v ? 'w-[340px] shrink-0' : '')}>
          <p className="font-display text-3xl leading-[0.95] font-extrabold uppercase">{HRA.titulok}</p>
          {HRY_V_STAVBE.map((h, i) => (
            <Padni key={h.id}>
              <div className="relative flex items-center gap-4 border-3 border-ink bg-white p-4 shadow-brutal-sm">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-3 border-ink bg-ink text-yellow" aria-hidden="true">
                  {i === 0 ? <AsciiCube size="sm" speed="slow" color="hsl(var(--secondary))" /> : <AsciiHelix size="sm" speed="slow" color="hsl(var(--secondary))" />}
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="font-mono text-xs font-bold uppercase">Hra {h.cislo}</p>
                  <p className="font-display text-2xl leading-none font-extrabold uppercase">{h.nazov}</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="min-h-11 w-fit">
                        Čo to bude?
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 max-w-[calc(100vw-2rem)]">
                      <p className="font-display text-lg font-extrabold uppercase">{h.nazov}</p>
                      <p className="mt-1 text-sm">V stavbe. Popis doplní Adam, keď bude hra hotová.</p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Sticker size="sm" rotation="medium-right" className="absolute -top-3 -right-2 font-mono uppercase">
                  V stavbe
                </Sticker>
              </div>
            </Padni>
          ))}
          <a href="/hry/" className="inline-flex min-h-11 items-center gap-2 font-display text-lg font-extrabold uppercase underline decoration-3 underline-offset-4">
            <Gamepad2 className="h-5 w-5" aria-hidden="true" /> Všetky hry
          </a>
        </div>
      </Obsah>
    </Pavilon>
  );
}

/* =========================== E · KNIŽNICA =========================== */

const hriech = DOKAZY.find((d) => d.id === 'hriech')!;
const netopier = DOKAZY.find((d) => d.id === 'netopier')!;
const BTN = 'press inline-flex min-h-12 items-center gap-2 border-3 border-ink px-4 font-display text-base font-extrabold uppercase shadow-brutal-sm';

export function PavE({ posledny }: { posledny: Text | null }) {
  const { vodorovne: v } = useChodba();
  return (
    <Pavilon id="kniznica">
      <Portal m={miesto('kniznica')} farba="white" />
      <Obsah className={v ? 'gap-8' : 'lg:grid lg:grid-cols-3 lg:items-stretch'}>
        {posledny && (
          <Padni className={cn(v ? 'w-[520px] shrink-0' : 'lg:col-span-3')}>
            <article className="relative flex flex-col gap-4 border-3 border-ink bg-white p-6 shadow-brutal sm:p-8">
              <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Mimo ordinácie · posledný text · {posledny.datum}</p>
              <h3 className="font-display text-4xl leading-[0.92] font-extrabold tracking-tight uppercase">
                <a href={`/texty/${posledny.id}/`} className="hover:underline hover:decoration-[4px]">
                  {posledny.title}
                </a>
              </h3>
              <p className="max-w-prose font-serif text-2xl leading-snug italic">{posledny.description}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a href={`/texty/${posledny.id}/`} className={cn(BTN, 'bg-yellow')}>
                  Čítať →
                </a>
                <a href="/texty/" className={cn(BTN, 'bg-white')}>
                  Všetky texty
                </a>
                <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className={cn(BTN, 'bg-white')}>
                  Substack ↗
                </a>
              </div>
            </article>
          </Padni>
        )}
        <Padni className={cn(v ? 'w-[380px] shrink-0' : '')}>
          <article className="flex h-full flex-col overflow-hidden border-3 border-ink bg-ink text-paper shadow-brutal">
            <img src={hriech.obrazok!} alt="Hriech — náhľad publikácie" width="960" height="600" loading="lazy" decoding="async" className="aspect-[16/10] w-full border-b-3 border-ink object-cover object-top" />
            <div className="flex flex-1 flex-col gap-3 p-5">
              <p className="font-mono text-xs font-bold tracking-[0.14em] text-yellow uppercase">Diagnóza médií</p>
              <h3 className="font-display text-3xl font-extrabold uppercase">Hriech</h3>
              <p className="text-base">{hriech.riadok}</p>
              <p className="text-base">Píšem o tom, čo staviam. A v Hriechu stanovujem diagnózu slovenským médiám.</p>
              <a href={hriech.url!} target="_blank" rel="noopener noreferrer" className={cn(BTN, 'mt-auto self-start bg-white text-ink')}>
                hriech.xvadur.com ↗
              </a>
              <p className="font-mono text-xs uppercase">overené {OVERENE_DNA_TEXT}</p>
            </div>
          </article>
        </Padni>
        <Padni className={cn(v ? 'w-[340px] shrink-0' : '')}>
          <article className="flex h-full flex-col gap-3 border-3 border-ink bg-paper p-5 shadow-brutal">
            <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Dáta o médiách · {netopier.poznamka}</p>
            <h3 className="font-display text-3xl font-extrabold uppercase">{netopier.nazov}</h3>
            <p className="text-base">{netopier.riadok}</p>
            <p className="font-display text-5xl leading-none font-extrabold">{netopier.cislo}</p>
            <p className="font-mono text-xs font-bold uppercase">{netopier.cisloPopis}</p>
            <Button variant="outline" className="mt-auto min-h-11 w-fit" onClick={() => otvor({ typ: 'projekt', id: 'netopier' })}>
              <FileText className="h-4 w-4" aria-hidden="true" /> Otvor chorobopis
            </Button>
          </article>
        </Padni>
      </Obsah>
    </Pavilon>
  );
}

/* =========================== koniec chodby: dvere F =========================== */

export function Dvere() {
  const { vodorovne: v } = useChodba();
  return (
    <div className={cn('relative shrink-0 overflow-hidden border-ink bg-ink text-paper', v ? 'h-full w-[88vw] max-w-[1200px] border-l-3' : 'border-b-3')}>
      <Halftone className="absolute inset-0 opacity-60" />
      <MathCurveBackground curve="lissajous" speed="slow" opacity={0.35} trackColor="hsl(var(--background) / 0.2)" headColor="hsl(var(--secondary))" className="pointer-events-none absolute inset-0" />
      <span className="absolute top-3 left-3 z-10 bg-paper px-2 py-0.5 font-mono text-[10px] text-ink">HIGGSFIELD: 07-chodba-dolly · 6 s · 21:9</span>
      <div className={cn('relative z-10 flex h-full items-center gap-10', v ? 'px-16' : 'mx-auto max-w-[1500px] flex-col px-4 py-16 sm:px-6 lg:flex-row lg:px-10')}>
        <div className="flex max-w-lg flex-col gap-5">
          <p className="font-mono text-sm font-bold tracking-[0.16em] text-yellow uppercase">Koniec chodby · cieľ</p>
          <p className="font-display text-[clamp(2.8rem,1.4rem+4.5vw,5.6rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">Za dverami je vyšetrenie.</p>
          <p className="text-lg text-paper/85">{VLAJKA.titulok}</p>
          <a href="#vysetrenie" data-chod="vysetrenie" className="press inline-flex min-h-14 w-fit items-center gap-3 border-3 border-paper bg-hot px-6 font-display text-xl font-extrabold uppercase text-ink">
            Vstúp <ArrowDown className="h-6 w-6" aria-hidden="true" />
          </a>
        </div>
        <div className="v07-dvere relative flex h-[min(62vh,520px)] w-[min(78vw,420px)] shrink-0 border-3 border-paper bg-ink p-3" aria-hidden="true">
          <div className="v07-dvere-kridlo flex flex-1 items-center justify-end border-3 border-ink bg-yellow pr-3">
            <span className="h-24 w-3 bg-ink" />
          </div>
          <div className="v07-dvere-kridlo flex flex-1 items-center justify-start border-3 border-ink bg-yellow pl-3">
            <span className="h-24 w-3 bg-ink" />
          </div>
          <span className="absolute -top-7 left-1/2 flex -translate-x-1/2 items-center gap-2 border-3 border-paper bg-ink px-3 py-1 font-display text-2xl font-extrabold text-yellow">
            F <span className="text-paper">VYŠETRENIE</span>
          </span>
        </div>
      </div>
    </div>
  );
}
