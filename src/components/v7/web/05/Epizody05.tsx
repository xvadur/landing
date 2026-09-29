/** V7-05 · Komiks — strana 3: chorobopisy ako epizódy komiksu. Karusel (BoldKit carousel, Embla) panelov
 *  layered-card; „Čítať epizódu“ otvorí sheet sprava (mobil zdola) s detailom: čo mal → čo dostal, fakty, graf (lenivo).
 *  Recept 2 z katalógu prekrytí, prevzatý a upravený. Paleta ⌘K otvára epizódu udalosťou k05:otvor. Ostrov: client:idle. */
import * as React from 'react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { LayeredCard } from '@/components/ui/layered-card';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CrossShape, EyeShape, GearShape, HeartShape } from '@/components/ui/shapes';
import { EPIZODY, STAV_TEXT, UDALOST, vezmiCiel, type Ciel, type Epizoda } from './data';
import { cn } from '@/lib/utils';

const EpizodaGraf = React.lazy(() => import('./EpizodaGraf'));

const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

const STAV_POPIS: Record<Epizoda['stav'], string> = {
  zive: 'Odkaz funguje, overené HTTP 200.',
  interne: 'Beží, ale nie je verejné.',
  coskoro: 'Doména zatiaľ neodpovedá.',
};

const PLOCHA = ['bg-yellow', 'bg-white', 'bg-white', 'bg-yellow', 'bg-white', 'bg-paper', 'bg-white', 'bg-paper'];

function useMaloOkno(query = '(max-width: 639px)') {
  const [malo, setMalo] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMalo(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return malo;
}

function Kresba({ e }: { e: Epizoda }) {
  if (e.obrazok)
    return (
      <div className="k-raster relative h-36 overflow-hidden border-b-3 border-ink bg-paper">
        <img src={e.obrazok} alt="" width={960} height={600} loading="lazy" decoding="async" className="h-full w-full object-cover object-top grayscale contrast-125" />
      </div>
    );
  const T = e.pre === 'pacient' ? CrossShape : e.pre === 'verejnost' ? EyeShape : e.pre === 'vlastne' ? HeartShape : GearShape;
  return (
    <div className="relative grid h-36 place-items-center border-b-3 border-ink bg-paper tx-halftone [--tx:30%]">
      <T size={76} color="var(--color-yellow)" strokeColor="var(--color-ink)" animation={e.pre === 'vlastne' ? 'pulse-hard' : 'none'} />
    </div>
  );
}

function Karta({ e, i, onCitaj }: { e: Epizoda; i: number; onCitaj: () => void }) {
  return (
    <LayeredCard layers="double" offset="sm" layerColor="primary" className="h-full">
      <article className={cn('flex h-full min-h-[430px] flex-col', PLOCHA[i % PLOCHA.length])}>
        <header className="flex items-center justify-between gap-2 border-b-3 border-ink bg-ink px-4 py-2 font-mono text-xs font-bold tracking-[0.12em] text-yellow uppercase">
          <span>Epizóda {String(i + 1).padStart(2, '0')}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="inline-flex min-h-8 items-center gap-1.5 text-paper outline-none focus-visible:underline">
                <span aria-hidden="true" className={cn('h-2.5 w-2.5 border-2 border-paper', e.stav === 'zive' ? 'bg-yellow' : 'bg-transparent')} />
                {STAV_TEXT[e.stav]}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{STAV_POPIS[e.stav]}</TooltipContent>
          </Tooltip>
        </header>
        <Kresba e={e} />
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap gap-1.5">
            {e.stitky.map((s) => (
              <Badge key={s} variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
                {s}
              </Badge>
            ))}
          </div>
          <h3 className="font-display text-3xl leading-[0.92] font-extrabold tracking-tight uppercase">{e.nazov}</h3>
          <p className="text-base leading-snug">{e.riadok}</p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t-3 border-ink pt-3">
            <div className="min-w-0">
              <p className="k-reg-text font-display text-4xl leading-none font-extrabold whitespace-nowrap tabular-nums">{e.cislo}</p>
              <p className="mt-1 font-mono text-xs font-bold tracking-[0.08em] uppercase">{e.cisloPopis}</p>
            </div>
            <Button variant="default" onClick={onCitaj} data-open={i === 0 ? 'k05-epizoda' : undefined}>
              <BookOpen aria-hidden="true" /> Čítať
            </Button>
          </div>
        </div>
      </article>
    </LayeredCard>
  );
}

function Detail({ e, open, onOpenChange }: { e: Epizoda | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const malo = useMaloOkno();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={malo ? 'bottom' : 'right'} className={cn('flex flex-col gap-5 overflow-y-auto', malo ? 'max-h-[88dvh]' : 'sm:max-w-md')} data-lenis-prevent>
        {e && (
          <>
            <SheetHeader className="pr-10 text-left">
              <p className="eyebrow">Epizóda · {STAV_TEXT[e.stav]}</p>
              <SheetTitle className="font-display text-3xl font-extrabold uppercase">{e.nazov}</SheetTitle>
              <SheetDescription className="text-base text-ink/80">{e.riadok}</SheetDescription>
            </SheetHeader>
            {e.obrazok && <img src={e.obrazok} alt="" width={960} height={600} className="aspect-[16/10] w-full border-3 border-ink object-cover object-top" />}
            <div>
              <p className="font-display text-6xl leading-none font-extrabold">{e.cislo}</p>
              <p className="mt-1 font-mono text-sm uppercase">{e.cisloPopis}</p>
            </div>
            {e.mal && e.dostal && (
              <div className="grid gap-3">
                <div className="border-3 border-ink bg-white p-3">
                  <p className="font-mono text-xs font-bold uppercase">Čo mal · pred</p>
                  <ul className="mt-2 grid gap-1.5 text-sm">
                    {e.mal.map((m) => (
                      <li key={m} className="flex gap-2">
                        <span aria-hidden="true">✕</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-3 border-ink bg-yellow p-3">
                  <p className="font-mono text-xs font-bold uppercase">Čo dostal · po</p>
                  <ul className="mt-2 grid gap-1.5 text-sm">
                    {e.dostal.map((m) => (
                      <li key={m} className="flex gap-2">
                        <span aria-hidden="true">✚</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {e.fakty.length > 0 && (
              <dl className="grid grid-cols-2 gap-3">
                {e.fakty.map((f) => (
                  <div key={f.label} className="border-3 border-ink bg-white p-3">
                    <dt className="font-mono text-xs text-ink/70 uppercase">{f.label}</dt>
                    <dd className="font-display text-2xl font-extrabold">{f.value}</dd>
                    <dd className="text-xs">{f.note}</dd>
                  </div>
                ))}
              </dl>
            )}
            {e.graf && (e.graf === 'kontroly' || e.graf === 'trh') && (
              <React.Suspense fallback={<Skeleton variant="blocks" className="h-56 w-full border-3 border-ink" />}>
                <EpizodaGraf druh={e.graf} />
              </React.Suspense>
            )}
            {e.stavText && <p className="border-l-4 border-ink pl-3 text-sm">{e.stavText}</p>}
            <SheetFooter className="mt-auto flex-row flex-wrap gap-3">
              {e.url ? (
                <Button asChild variant="secondary">
                  <a href={e.url} target="_blank" rel="noopener noreferrer" data-track="dokaz_klik" data-track-miesto={`v7-05-${e.id}`}>
                    {domena(e.url)} <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              ) : e.graf === 'korpus' ? (
                <Button asChild variant="secondary">
                  <a href="/vitalne/">štatistiky →</a>
                </Button>
              ) : (
                <p className="font-mono text-sm">{e.poznamka ?? 'bez verejného odkazu'}</p>
              )}
              <Button asChild variant="accent">
                <a href="#vysetrenie" onClick={() => onOpenChange(false)}>
                  Ďalšia epizóda: ty →
                </a>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function Epizody05() {
  const [vybrana, setVybrana] = React.useState<Epizoda | null>(null);
  const [open, setOpen] = React.useState(false);

  const citaj = React.useCallback((id: string) => {
    const e = EPIZODY.find((x) => x.id === id);
    if (!e) return;
    setVybrana(e);
    setOpen(true);
  }, []);

  React.useEffect(() => {
    const c = vezmiCiel('projekt');
    if (c) citaj(c.id);
    const on = (ev: Event) => {
      const d = (ev as CustomEvent<Ciel>).detail;
      if (d?.typ === 'projekt') {
        vezmiCiel('projekt');
        citaj(d.id);
      }
    };
    window.addEventListener(UDALOST, on);
    return () => window.removeEventListener(UDALOST, on);
  }, [citaj]);

  return (
    <TooltipProvider delayDuration={150}>
      <Carousel opts={{ align: 'start', loop: false }} className="w-full" aria-label="Epizódy">
        <CarouselContent className="pb-4">
          {EPIZODY.map((e, i) => (
            <CarouselItem key={e.id} className="basis-[88%] pr-3 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <Karta e={e} i={i} onCitaj={() => citaj(e.id)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <CarouselDots className="mt-0 justify-start" getLabel={(i, n) => `Epizóda ${i + 1} z ${n}`} />
          <div className="flex gap-3">
            <CarouselPrevious className="static" label="Predchádzajúca epizóda" />
            <CarouselNext className="static" label="Ďalšia epizóda" />
          </div>
        </div>
      </Carousel>
      <Detail e={vybrana} open={open} onOpenChange={setOpen} />
    </TooltipProvider>
  );
}
