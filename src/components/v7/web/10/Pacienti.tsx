/** V7-10 · Podnos 05 · Chorobopisy. Projekty ako nástroje rôznych veľkostí (Jakub, Lucia, Hriech, Korpus, Netopier,
 *  trhový dataset, agentový systém, tento web) + karusel obrazov z ordinácie. Klik = sheet s chorobopisom (recept
 *  prekrytia 2: sprava, na mobile zdola). Hriech má hover-card s náhľadom. ⌘K otvára sheet cez udalosť v710:projekt.
 *  Dáta: DOKAZY, POSTAVIL, PRIPAD_* z fakty.ts; odkaz iba s overeným 200 (url v DOKAZY). */
import * as React from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OVERENE_DNA_TEXT } from '@/data/fakty';
import { cn } from '@/lib/utils';
import { Dlazdica, Etiketa, type Ton } from './Dlazdica';
import { CHOROBOPISY, STAV_TEXT, UDALOST, domena, type Chorobopis } from './data';

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

const podla = (id: string) => CHOROBOPISY.find((c) => c.id === id)!;
const poradie = (id: string) => String(CHOROBOPISY.findIndex((c) => c.id === id) + 1).padStart(2, '0');

function Stav({ c, className }: { c: Chorobopis; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.12em] uppercase', className)}>
      <span className={cn('h-2.5 w-2.5 rounded-full border-2 border-current', c.stav === 'zive' && 'bg-yellow')} aria-hidden="true" />
      {STAV_TEXT[c.stav]}
    </span>
  );
}

function Otvor({ c, onOpen, tmavy }: { c: Chorobopis; onOpen: (id: string) => void; tmavy?: boolean }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={tmavy ? 'secondary' : 'default'}
      onClick={() => onOpen(c.id)}
      className="relative z-[1] w-fit"
      aria-label={`Otvoriť chorobopis: ${c.nazov}`}
    >
      <FileText aria-hidden="true" /> Chorobopis
    </Button>
  );
}

function Cislo({ c, velke }: { c: Chorobopis; velke?: boolean }) {
  return (
    <div>
      <p className={cn('font-display leading-none font-extrabold whitespace-nowrap tabular-nums', velke ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl')}>{c.cislo}</p>
      <p className="mt-1 font-mono text-[11px] font-bold tracking-[0.1em] uppercase">{c.cisloPopis}</p>
    </div>
  );
}

/** Menšia dlaždica projektu: číslo, názov, riadok v rozbalení. */
function Projekt({ id, tone, className, onOpen }: { id: string; tone: Ton; className: string; onOpen: (id: string) => void }) {
  const c = podla(id);
  const tmavy = tone === 'ink';
  return (
    <Dlazdica tone={tone} className={className} stitok={`CH-${poradie(id)}`} detailNazov={c.nazov} detail={<p className="text-base leading-snug">{c.riadok}</p>}>
      <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
        <Stav c={c} />
        <h3 className="font-display text-2xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-3xl">{c.nazov}</h3>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
          <Cislo c={c} />
          <Otvor c={c} onOpen={onOpen} tmavy={tmavy} />
        </div>
      </div>
    </Dlazdica>
  );
}

function Detail({ c, open, onOpenChange }: { c: Chorobopis | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const malo = useMaloOkno();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={malo ? 'bottom' : 'right'} className={cn('flex flex-col gap-5 overflow-y-auto', malo ? 'max-h-[88dvh]' : 'sm:max-w-md')} data-lenis-prevent>
        {c && (
          <>
            <SheetHeader className="pr-12 text-left">
              <p className="eyebrow">
                Chorobopis {poradie(c.id)} · {STAV_TEXT[c.stav]}
              </p>
              <SheetTitle className="font-display text-3xl font-extrabold uppercase">{c.nazov}</SheetTitle>
              <SheetDescription className="text-base text-ink/75">{c.riadok}</SheetDescription>
            </SheetHeader>
            {c.obrazok && (
              <img src={c.obrazok} alt="" width={960} height={600} loading="lazy" className="aspect-[16/10] w-full border-3 border-ink object-cover object-top" />
            )}
            <Cislo c={c} velke />
            <div className="flex flex-wrap gap-2">
              {c.stitky.map((s) => (
                <Badge key={s} variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
                  {s}
                </Badge>
              ))}
            </div>
            {c.mal && c.dostal && (
              <div className="grid gap-4">
                <div>
                  <p className="font-mono text-xs font-bold uppercase">Čo mal</p>
                  <ul className="mt-2 grid gap-1.5">
                    {c.mal.map((m) => (
                      <li key={m} className="border-l-4 border-stamp pl-3 text-sm leading-snug">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-xs font-bold uppercase">Čo dostal</p>
                  <ul className="mt-2 grid gap-1.5">
                    {c.dostal.map((m) => (
                      <li key={m} className="border-l-4 border-yellow pl-3 text-sm leading-snug">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {c.fakty.length > 0 && (
              <dl className="grid grid-cols-2 gap-3">
                {c.fakty.map((f) => (
                  <div key={f.label} className="border-3 border-ink bg-white p-3">
                    <dt className="font-mono text-[11px] text-ink/60 uppercase">{f.label}</dt>
                    <dd className="font-display text-2xl font-extrabold">{f.value}</dd>
                    <dd className="text-xs">{f.note}</dd>
                  </div>
                ))}
              </dl>
            )}
            {c.stavText && <p className="border-3 border-ink bg-paper p-3 font-mono text-xs">{c.stavText}</p>}
            <SheetFooter className="mt-auto">
              {c.url ? (
                <Button asChild>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" data-track="dokaz_klik" data-track-miesto={`v710-${c.id}`}>
                    {domena(c.url)} <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              ) : (
                <p className="font-mono text-sm">{c.poznamka ?? 'bez verejného odkazu'}</p>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

const OBRAZY = CHOROBOPISY.filter((c) => c.obrazok);

export default function Pacienti() {
  const [projekt, setProjekt] = React.useState<Chorobopis | null>(null);
  const [open, setOpen] = React.useState(false);
  const otvor = React.useCallback((id: string) => {
    const c = CHOROBOPISY.find((x) => x.id === id) ?? null;
    if (!c) return;
    setProjekt(c);
    setOpen(true);
  }, []);
  React.useEffect(() => {
    const on = (e: Event) => otvor((e as CustomEvent<string>).detail);
    window.addEventListener(UDALOST.projekt, on);
    return () => window.removeEventListener(UDALOST.projekt, on);
  }, [otvor]);

  const jakub = podla('system-pre-maklera');
  const lucia = podla('terapeutka');
  const hriech = podla('hriech');

  return (
    <div className="v10-mriezka">
      <Dlazdica tone="ink" className="col-span-2 md:col-span-6 lg:col-span-4 lg:row-span-2" stitok="CH-00 · kartotéka" bezMagnetu>
        <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <Etiketa cislo="05" nazov="Chorobopisy" className="text-yellow" />
          <h2 className="font-display text-[clamp(2.4rem,1.4rem+3vw,3.8rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">Čo som postavil</h2>
          <p className="mt-auto text-lg leading-snug text-paper/85">Každý systém so stavom, ako naozaj je. Kde je odkaz, dá sa otvoriť.</p>
        </div>
      </Dlazdica>

      {/* Jakub: veľký chorobopis 5 × 3 */}
      <Dlazdica tone="white" className="col-span-2 md:col-span-6 lg:col-span-5 lg:row-span-3" stitok={`CH-${poradie(jakub.id)} · pacient`}>
        <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Stav c={jakub} />
            {jakub.stitky.map((s) => (
              <Badge key={s} variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
                {s}
              </Badge>
            ))}
          </div>
          <h3 className="font-display text-[clamp(2.2rem,1.4rem+2.4vw,3.4rem)] leading-[0.88] font-extrabold tracking-tight uppercase">{jakub.nazov}</h3>
          <p className="text-base leading-snug sm:text-lg">{jakub.riadok}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ul className="grid content-start gap-1.5" aria-label="Čo mal">
              <li className="font-mono text-xs font-bold uppercase">Čo mal</li>
              {jakub.mal?.map((m) => (
                <li key={m} className="border-l-4 border-stamp pl-3 text-sm leading-snug">
                  {m}
                </li>
              ))}
            </ul>
            <ul className="grid content-start gap-1.5" aria-label="Čo dostal">
              <li className="font-mono text-xs font-bold uppercase">Čo dostal</li>
              {jakub.dostal?.slice(0, 3).map((m) => (
                <li key={m} className="border-l-4 border-yellow pl-3 text-sm leading-snug">
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <Separator className="mt-auto" />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Cislo c={jakub} velke />
            <Otvor c={jakub} onOpen={otvor} />
          </div>
        </div>
      </Dlazdica>

      {/* karusel obrazov 3 × 3 */}
      <Dlazdica tone="paper" className="col-span-2 md:col-span-6 lg:col-span-3 lg:row-span-3" stitok="CH · obrazy" bezMagnetu>
        <div className="flex h-full flex-col gap-3 p-4">
          <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Z ordinácie</p>
          <Carousel opts={{ loop: true }} aria-label="Obrazy projektov" className="flex flex-1 flex-col">
            <CarouselContent>
              {OBRAZY.map((c) => (
                <CarouselItem key={c.id}>
                  <figure className="flex flex-col gap-2">
                    <img src={c.obrazok!} alt={`${c.nazov}: náhľad`} width={960} height={600} loading="lazy" decoding="async" className="aspect-[4/3] w-full border-3 border-ink object-cover object-top" />
                    <figcaption className="font-display text-lg leading-none font-extrabold uppercase">{c.nazov}</figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-auto flex items-center justify-between gap-2 pt-3">
              <div className="flex gap-2">
                <CarouselPrevious className="static" />
                <CarouselNext className="static" />
              </div>
              <CarouselDots className="mt-0 hidden sm:flex" />
            </div>
          </Carousel>
        </div>
      </Dlazdica>

      {/* Hriech 4 × 2 s hover-card */}
      <Dlazdica tone="yellow" className="col-span-2 md:col-span-3 lg:col-span-4 lg:row-span-2" stitok={`CH-${poradie(hriech.id)} · médiá`} detailNazov="Hriech" detail={<p className="text-base leading-snug">{hriech.riadok}</p>}>
        <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
          <Stav c={hriech} />
          <h3 className="font-display text-4xl leading-[0.9] font-extrabold tracking-tight uppercase">{hriech.nazov}</h3>
          <p className="text-sm">Diagnóza slovenských médií.</p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <Cislo c={hriech} />
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <a
                  href={hriech.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="dokaz_klik"
                  data-track-miesto="v710-hriech"
                  className="relative z-[1] inline-flex min-h-11 items-center gap-1 border-3 border-ink bg-ink px-3 font-mono text-xs font-bold text-paper"
                >
                  {domena(hriech.url!)} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 p-0" side="top">
                <img src={hriech.obrazok!} alt="" width={960} height={600} className="aspect-[16/10] w-full border-b-3 border-ink object-cover object-top" />
                <div className="p-3">
                  <p className="font-display text-lg font-extrabold uppercase">Hriech</p>
                  <p className="text-sm">{hriech.riadok}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase">overené {OVERENE_DNA_TEXT}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </Dlazdica>

      {/* Lucia 4 × 2 */}
      <Dlazdica tone="white" className="col-span-2 md:col-span-3 lg:col-span-4 lg:row-span-2" stitok={`CH-${poradie(lucia.id)} · pacient`} detailNazov="Lucia: čo dostala" detail={
        <ul className="grid gap-1.5">
          {lucia.dostal?.map((m) => (
            <li key={m} className="border-l-4 border-yellow pl-3 text-sm leading-snug">
              {m}
            </li>
          ))}
        </ul>
      }>
        <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
          <Stav c={lucia} />
          <h3 className="font-display text-3xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-4xl">{lucia.nazov}</h3>
          <p className="text-sm leading-snug">{lucia.riadok}</p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <Cislo c={lucia} />
            <Otvor c={lucia} onOpen={otvor} />
          </div>
        </div>
      </Dlazdica>

      <Projekt id="korpus" tone="ink" className="col-span-2 md:col-span-3 lg:col-span-4 lg:row-span-2" onOpen={otvor} />
      <Projekt id="netopier" tone="paper" className="col-span-2 md:col-span-3 lg:col-span-4" onOpen={otvor} />
      <Projekt id="trhovy-dataset" tone="white" className="col-span-2 md:col-span-3 lg:col-span-4 lg:row-span-2" onOpen={otvor} />
      <Projekt id="agentovy-system" tone="yellow" className="col-span-1 md:col-span-3 lg:col-span-4 lg:row-span-2" onOpen={otvor} />
      <Projekt id="xvadur-com" tone="white" className="col-span-1 md:col-span-3 lg:col-span-4 lg:row-span-2" onOpen={otvor} />

      <Detail c={projekt} open={open} onOpenChange={setOpen} />
    </div>
  );
}
