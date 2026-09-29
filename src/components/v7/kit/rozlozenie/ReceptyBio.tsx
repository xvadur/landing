/** Kit · Rozloženie — 4 recepty bio/príbehu z kusov tejto skupiny. Obsah: BIO (data.ts ← cesta.ts, Anamneza.astro).
 *  Zastávky bez textu (elektrotechnická, viera, psychológia) majú iba badge „text doplní Adam“. */
import * as React from 'react';
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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayeredCard, LayeredCardContent, LayeredCardHeader, LayeredCardTitle } from '@/components/ui/layered-card';
import { TreeView, type TreeNode } from '@/components/ui/tree-view';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DoplniAdam } from './Kus';
import { ANAMNEZA, BIO, KAPITOLY, type Zastavka } from './data';

const noHover = 'shadow-none hover:translate-x-0 hover:translate-y-0';
const FARBY = ['bg-white text-ink', 'bg-paper text-ink', 'bg-white text-ink', 'bg-paper text-ink', 'bg-stamp text-paper', 'bg-white text-ink', 'bg-paper text-ink', 'bg-yellow text-ink'];

export function Recept({ c, nazov, veta, kusy, children, tmavy }: { c: string; nazov: string; veta: string; kusy: string[]; children: React.ReactNode; tmavy?: boolean }) {
  return (
    <article className={`border-3 border-ink shadow-brutal ${tmavy ? 'bg-ink text-paper' : 'bg-white'}`}>
      <header className={`flex flex-col gap-3 border-b-3 p-4 sm:p-8 ${tmavy ? 'border-paper/30' : 'border-ink'}`}>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em]">Recept {c}</p>
        <h3 className="font-display text-4xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-5xl">{nazov}</h3>
        <p className="max-w-2xl text-lg">{veta}</p>
        <div className="flex flex-wrap gap-2">
          {kusy.map((k) => (
            <Badge key={k} variant="outline" className={`font-mono normal-case ${noHover} ${tmavy ? 'border-paper bg-ink text-paper' : ''}`}>
              {k}
            </Badge>
          ))}
        </div>
      </header>
      <div className="p-4 sm:p-8">{children}</div>
    </article>
  );
}

function Text({ z, velky }: { z: Zastavka; velky?: boolean }) {
  if (z.doplni) return <DoplniAdam className="w-fit" />;
  return (
    <div className="flex flex-col gap-3">
      <p className={velky ? 'text-lg leading-snug sm:text-xl' : 'text-base'}>{z.text}</p>
      {z.citat && <blockquote className="border-l-4 border-current pl-4 font-display text-xl leading-snug font-bold">„{z.citat}“</blockquote>}
    </div>
  );
}

/* ------------------------------------------------------------------ 01 zvislá os */
function ZvislaOs() {
  return (
    <Recept
      c="01"
      nazov="Zvislá os záznamov"
      veta="Klasika pre sekciu „Kto som“: každá zastávka je záznam v chorobopise, bodka hovorí stav. Na mobile číta ako zoznam, na desktope má čas vľavo."
      kusy={['timeline', 'timeline-card', 'badge', 'avatar', 'separator']}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-4 lg:flex-col lg:items-start">
          <Avatar className={`h-16 w-16 rounded-full lg:h-40 lg:w-40 ${noHover}`}>
            <AvatarImage src="/assets/hero-adam.webp" alt="" className="origin-[47%_27%] scale-[2.4] object-[48%_50%]" />
            <AvatarFallback>X</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink/60">{ANAMNEZA.eyebrow}</p>
            <p className="font-display text-2xl leading-[0.9] font-extrabold uppercase sm:text-4xl">{ANAMNEZA.nadpis}</p>
          </div>
        </div>
        <p className="hidden font-display text-2xl leading-snug font-bold lg:block">„{ANAMNEZA.citat}“</p>
        <p className="hidden text-base lg:block">{ANAMNEZA.dovetok}</p>
        <Badge variant="secondary" className={`hidden w-fit -rotate-3 px-3 py-1 text-sm lg:inline-flex ${noHover}`}>{ANAMNEZA.peciatka}</Badge>
      </aside>
      <Timeline className="max-w-3xl">
        {BIO.map((z, i) => {
          const st = z.id === 'xvadur' ? 'current' : z.doplni ? 'upcoming' : 'completed';
          return (
            <TimelineItem key={z.id} status={st} id={`bio-${z.id}`} className="scroll-mt-24">
              <TimelineTime className="hidden w-24 shrink-0 pt-2 text-right font-mono text-xs font-bold text-ink sm:block">{z.kedy}</TimelineTime>
              <div className="flex flex-col">
                <TimelineDot status={st} size="lg">
                  {st === 'completed' ? <Check className="h-5 w-5 stroke-[3]" /> : <span className={`font-mono text-xs font-bold ${st === 'current' ? 'text-paper' : ''}`}>{i + 1}</span>}
                </TimelineDot>
                {i < BIO.length - 1 && <TimelineConnector status={BIO[i + 1].doplni ? 'upcoming' : 'completed'} className="ml-[18.5px] flex-1" />}
              </div>
              <TimelineContent className="min-w-0">
                <TimelineCard className={z.doplni ? 'border-dashed bg-paper shadow-none' : st === 'current' ? 'bg-yellow' : ''}>
                  <p className="font-mono text-xs font-bold sm:hidden">{z.kedy}</p>
                  <TimelineTitle className="font-display text-lg font-extrabold sm:text-2xl">{z.nazov}</TimelineTitle>
                  {z.kde && <p className="font-mono text-xs uppercase">{z.kde}</p>}
                  <Separator className="my-3 h-[2px]" />
                  <Text z={z} />
                </TimelineCard>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
      </div>
      <p className="mt-4 max-w-2xl font-display text-2xl leading-snug font-bold lg:hidden">„{ANAMNEZA.citat}“ <span className="font-sans text-base font-medium">{ANAMNEZA.dovetok}</span></p>
    </Recept>
  );
}

/* ------------------------------------------------------------------ 02 vodorovná cesta */
function VodorovnaCesta() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [akt, setAkt] = React.useState(0);
  React.useEffect(() => {
    if (!api) return;
    const upd = () => setAkt(api.selectedScrollSnap());
    upd();
    api.on('select', upd);
    return () => {
      api.off('select', upd);
    };
  }, [api]);
  return (
    <Recept
      c="02"
      nazov="Vodorovná cesta"
      veta="Príbeh ako cesta do strán (vzor aiaktivista): obrie karty, nad nimi omrvinky ako mapa, pod nimi priebeh. Palcom na mobile, šípkami na desktope."
      kusy={['carousel', 'breadcrumb', 'badge', 'separator']}
      tmavy
    >
      <Breadcrumb className="mb-6">
        <BreadcrumbList className="gap-1 text-paper/60 sm:gap-2">
          {BIO.map((z, i) => (
            <React.Fragment key={z.id}>
              {i > 0 && <BreadcrumbSeparator className="text-paper/40" />}
              <BreadcrumbItem>
                <button
                  type="button"
                  onClick={() => api?.scrollTo(i)}
                  aria-current={i === akt ? 'step' : undefined}
                  className={`min-h-11 px-1 font-mono text-xs font-bold uppercase ${i === akt ? 'bg-yellow text-ink' : 'hover:text-paper'}`}
                >
                  {z.nazov}
                </button>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <Carousel setApi={setApi} opts={{ align: 'start' }} aria-label="Cesta Adama">
        <CarouselContent className="-ml-5">
          {BIO.map((z, i) => (
            <CarouselItem key={z.id} className="basis-[88%] pl-5 sm:basis-[55%] lg:basis-[40%]">
              <div
                className={`@container flex h-full min-h-[420px] flex-col gap-4 rounded-[1.6rem] border-4 border-ink p-6 ${z.doplni ? 'bg-paper text-ink' : FARBY[i]}`}
                style={{ boxShadow: '8px 8px 0 0 var(--color-yellow)' }}
              >
                <div className="flex items-center justify-between gap-3 border-b-3 border-current/25 pb-3 font-mono text-xs font-bold uppercase">
                  <span>
                    Zastávka {String(i + 1).padStart(2, '0')} / {String(BIO.length).padStart(2, '0')}
                  </span>
                  <span className="rounded-full border-2 border-current px-3 py-1">{z.kedy}</span>
                </div>
                <p className="font-display text-[clamp(1.4rem,11cqi,4rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">{z.nazov}</p>
                {z.kde && <p className="font-mono text-xs font-bold uppercase">{z.kde}</p>}
                <div className="mt-auto">
                  <Text z={z} velky />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-8 flex items-center gap-4">
          <CarouselPrevious className="static h-11 w-11 translate-x-0 translate-y-0 text-ink" aria-label="Predchádzajúca zastávka" />
          <CarouselNext className="static h-11 w-11 translate-x-0 translate-y-0 text-ink" aria-label="Ďalšia zastávka" />
          <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-paper/40" aria-hidden="true">
            <div className="h-full bg-yellow transition-[width] duration-300" style={{ width: `${((akt + 1) / BIO.length) * 100}%` }} />
          </div>
        </div>
      </Carousel>
    </Recept>
  );
}

/* ------------------------------------------------------------------ 03 vrstvy života */
function Vrstvy() {
  const vrstva = ['single', 'double', 'triple'] as const;
  return (
    <Recept
      c="03"
      nazov="Vrstvy života"
      veta="Život po kapitolách: záložka = vrstva, v nej sa záznamy ukladajú na seba ako listy chorobopisu. Čím ďalej v príbehu, tým viac vrstiev pod kartou."
      kusy={['tabs', 'layered-card', 'badge']}
    >
      <Tabs defaultValue="sluzba">
        <TabsList className="grid h-auto w-full grid-cols-3 sm:w-auto sm:inline-grid">
          {KAPITOLY.map((k, i) => (
            <TabsTrigger key={k.id} value={k.id} className="min-h-12 flex-col gap-0 data-[state=active]:bg-yellow data-[state=active]:text-ink sm:min-w-40">
              <span className="font-mono text-[10px]">vrstva {i + 1}</span>
              {k.nazov}
            </TabsTrigger>
          ))}
        </TabsList>
        {KAPITOLY.map((k, ki) => (
          <TabsContent key={k.id} value={k.id} className="mt-8">
            <p className="mb-6 font-mono text-sm">{k.veta}</p>
            <div className="grid gap-12 pr-6 pb-6 sm:grid-cols-2 lg:grid-cols-3">
              {BIO.filter((z) => z.kapitola === k.id).map((z, i) => (
                <LayeredCard key={z.id} layers={vrstva[Math.min(2, ki)]} offset={ki === 2 ? 'default' : 'sm'} layerColor={ki === 2 ? 'secondary' : 'default'} className={i % 2 ? 'rotate-1' : '-rotate-1'}>
                  <LayeredCardHeader className={z.id === 'xvadur' ? 'bg-yellow' : ''}>
                    <div className="flex items-center justify-between gap-2 font-mono text-xs font-bold">
                      <span>{z.kedy}</span>
                      <span>list {i + 1}</span>
                    </div>
                    <LayeredCardTitle className="font-display text-3xl font-extrabold">{z.nazov}</LayeredCardTitle>
                  </LayeredCardHeader>
                  <LayeredCardContent>
                    {z.kde && <p className="mb-2 font-mono text-xs uppercase">{z.kde}</p>}
                    <Text z={z} />
                  </LayeredCardContent>
                </LayeredCard>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Recept>
  );
}

/* ------------------------------------------------------------------ 04 strom rozhodnutí */
const uzol = (id: string): Zastavka => BIO.find((z) => z.id === id)!;
function node(id: string, children?: TreeNode[]): TreeNode {
  const z = uzol(id);
  return { id, label: `${z.nazov}${z.kedy !== '—' ? ` · ${z.kedy}` : ''}`, children };
}
const STROM: TreeNode[] = [
  node('skola', [node('viera', [node('nemocnica', [node('psychologia'), node('odchod', [node('ai', [node('agenti', [node('xvadur')])])])])])]),
];
const VSETKY = BIO.map((z) => z.id);

function Strom() {
  const [vyber, setVyber] = React.useState<string[]>(['odchod']);
  const z = uzol(vyber[0] ?? 'xvadur');
  const i = BIO.indexOf(z);
  return (
    <Recept
      c="04"
      nazov="Strom rozhodnutí"
      veta="Príbeh ako vetvy: každé rozhodnutie otvorí ďalšie. Strom sa dá prechádzať šípkami, vybraný uzol ukáže záznam vedľa. Psychológia je bočná vetva nemocnice."
      kusy={['tree-view', 'card', 'badge', 'kbd v nápovede']}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-3">
          <TreeView
            data={STROM}
            selectionMode="single"
            selectedIds={vyber}
            onSelectedChange={(ids) => ids.length && setVyber(ids)}
            expandedIds={VSETKY}
            showIcons={false}
            className="overflow-x-auto [&_[role=treeitem]>div:first-child]:min-h-11 [&_[role=treeitem]>div.bg-accent:first-child]:bg-yellow [&_[role=treeitem]>div>span:last-child]:font-bold"
            aria-label="Strom rozhodnutí"
          />
          <p className="font-mono text-xs">↑ ↓ pohyb · Home / End · Enter vybrať (strom je stále rozbalený: klik na rodiča by ho inak zbalil)</p>
        </div>
        <Card className="self-start">
          <CardHeader className={z.id === 'odchod' ? 'bg-stamp text-paper' : z.doplni ? 'bg-paper' : 'bg-yellow'}>
            <p className="font-mono text-xs font-bold uppercase">
              Rozhodnutie {String(i + 1).padStart(2, '0')} · {z.kedy}
            </p>
            <CardTitle className="font-display text-4xl font-extrabold">{z.nazov}</CardTitle>
            {z.kde && <p className="font-mono text-xs uppercase">{z.kde}</p>}
          </CardHeader>
          <CardContent>
            <Text z={z} velky />
          </CardContent>
          <CardFooter className="flex-wrap gap-2 font-mono text-xs">
            <span>ďalej:</span>
            {BIO[i + 1] ? (
              <button type="button" className="min-h-11 border-2 border-ink bg-white px-3 font-bold uppercase" onClick={() => setVyber([BIO[i + 1].id])}>
                {BIO[i + 1].nazov} →
              </button>
            ) : (
              <span className="font-bold">{ANAMNEZA.cta}</span>
            )}
          </CardFooter>
        </Card>
      </div>
    </Recept>
  );
}

export default function ReceptyBio() {
  return (
    <section id="recepty-bio" aria-labelledby="recepty-bio-h" className="scroll-mt-24 border-t-3 border-ink py-12 sm:py-16">
      <header className="mb-10 flex flex-col gap-3">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink/60">Recepty · bio a príbeh</p>
        <h2 id="recepty-bio-h" className="font-display text-display-md leading-[0.9] font-extrabold uppercase">
          Štyri spôsoby, ako povedať cestu
        </h2>
        <p className="max-w-3xl text-lg">
          Rovnakých osem zastávok, štyri skladby. Texty sú z dnešnej Anamnézy (cesta.ts); elektrotechnická, viera a psychológia na webe ešte nemajú text, preto nesú
          štítok „text doplní Adam“.
        </p>
      </header>
      <div className="flex flex-col gap-14">
        <ZvislaOs />
        <VodorovnaCesta />
        <Vrstvy />
        <Strom />
      </div>
    </section>
  );
}
