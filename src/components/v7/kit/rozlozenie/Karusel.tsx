/** Kit · Rozloženie 2/4 — carousel (Embla 8): všetky props a pomocné časti. */
import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { DOKAZY, VYSLEDKY } from '@/data/fakty';
import { CESTA } from '@/data/cesta';
import { PRODUKTY } from '@/data/ponuka';
import { Kus, Mriezka, Variant } from './Kus';

/** Šípky BoldKitu sedia na -left-12/-right-12 (mimo karuselu) a majú 40 px. Na mobile by pretiekli, preto ich
 *  dávame pod karusel do riadku a zväčšíme na 44 px. */
const SIPKA = 'static translate-x-0 translate-y-0 h-11 w-11';

function Ovladanie({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <div className="flex gap-3">
        <CarouselPrevious className={SIPKA} aria-label="Predchádzajúca karta" />
        <CarouselNext className={SIPKA} aria-label="Ďalšia karta" />
      </div>
      {children}
    </div>
  );
}

const karty = DOKAZY.filter((d) => d.stav !== 'coskoro');
const FARBY = ['bg-yellow', 'bg-white', 'bg-paper'];

export default function Karusel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [akt, setAkt] = React.useState(0);
  const [pocet, setPocet] = React.useState(0);
  React.useEffect(() => {
    if (!api) return;
    const upd = () => {
      setAkt(api.selectedScrollSnap());
      setPocet(api.scrollSnapList().length);
    };
    upd();
    api.on('select', upd);
    api.on('reInit', upd);
    return () => {
      api.off('select', upd);
      api.off('reInit', upd);
    };
  }, [api]);

  return (
    <Kus id="carousel" meno="carousel" subor="carousel.tsx" veta="Posuvný pás kariet na Embla: šípky, bodky, slučka, zvislá os, voľné ťahanie, vlastné ovládanie cez API. Na cestu v príbehu a chorobopisy.">
      <Mriezka className="lg:grid-cols-2">
        <Variant props="predvolené (basis-full) · CarouselPrevious/Next · CarouselDots · šípky ← → z klávesnice">
          <Carousel aria-label="Cesta">
            <CarouselContent>
              {CESTA.map((k, i) => (
                <CarouselItem key={k.nazov}>
                  <div className={`flex min-h-52 flex-col gap-2 border-3 border-ink p-5 ${FARBY[i % 3]}`}>
                    <p className="font-mono text-xs">
                      {String(i + 1).padStart(2, '0')} · {k.kedy}
                    </p>
                    <p className="font-display text-3xl font-extrabold uppercase">{k.nazov}</p>
                    <p className="text-sm">{k.text}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <Ovladanie>
              <CarouselDots className="mt-0" />
            </Ovladanie>
          </Carousel>
        </Variant>

        <Variant props='opts={{ loop: true, align: "start" }} · CarouselItem basis-4/5 sm:basis-1/2'>
          <Carousel opts={{ loop: true, align: 'start' }} aria-label="Produkty">
            <CarouselContent>
              {PRODUKTY.map((p) => (
                <CarouselItem key={p.id} className="basis-4/5 sm:basis-1/2">
                  <div className={`flex h-full min-h-52 flex-col gap-2 border-3 border-ink p-4 ${p.farba}`}>
                    <p className="font-mono text-[11px] uppercase">{p.nalepka}</p>
                    <p className="text-lg font-bold uppercase">{p.nazov}</p>
                    <p className="text-sm">{p.pre}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <Ovladanie>
              <span className="font-mono text-xs">loop: šípky nikdy nezhasnú</span>
            </Ovladanie>
          </Carousel>
        </Variant>

        <Variant props="setApi → vlastný počítadlo a skok na kartu (api.scrollTo)">
          <Carousel setApi={setApi} aria-label="Chorobopisy">
            <CarouselContent>
              {karty.map((d, i) => (
                <CarouselItem key={d.id} className="basis-full sm:basis-2/3">
                  <div className={`flex min-h-48 flex-col justify-between gap-3 border-3 border-ink p-4 ${FARBY[(i + 1) % 3]}`}>
                    <p className="font-mono text-xs uppercase">Chorobopis {String(i + 1).padStart(2, '0')}</p>
                    <div>
                      <p className="font-display text-4xl font-extrabold">{d.cislo}</p>
                      <p className="font-mono text-xs uppercase">{d.cisloPopis}</p>
                    </div>
                    <p className="font-bold uppercase">{d.nazov}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold">
              {String(akt + 1).padStart(2, '0')} / {String(pocet).padStart(2, '0')}
            </span>
            {karty.slice(0, 5).map((d, i) => (
              <Button key={d.id} size="sm" variant={i === akt ? 'default' : 'outline'} className="min-h-11" onClick={() => api?.scrollTo(i)}>
                {i + 1}
              </Button>
            ))}
          </div>
        </Variant>

        <Variant props='orientation="vertical" · výška na CarouselContent (h-56) · basis-1/2'>
          <Carousel orientation="vertical" opts={{ align: 'start' }} className="pb-2" aria-label="Výsledky">
            <CarouselContent className="h-56">
              {VYSLEDKY.map((v) => (
                <CarouselItem key={v.label} className="basis-1/2">
                  <div className="flex h-full items-center justify-between gap-3 border-3 border-ink bg-white px-4">
                    <p className="font-display text-2xl font-extrabold whitespace-nowrap">{v.value}</p>
                    <p className="text-right font-mono text-xs uppercase">{v.label}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-4 flex gap-3">
              <CarouselPrevious className={SIPKA} aria-label="Predchádzajúca karta" />
              <CarouselNext className={SIPKA} aria-label="Ďalšia karta" />
            </div>
          </Carousel>
        </Variant>

        <Variant props='opts={{ dragFree: true, containScroll: "trimSnaps" }} · basis-auto (voľné ťahanie)' className="lg:col-span-2">
          <Carousel opts={{ dragFree: true, containScroll: 'trimSnaps', align: 'start' }} aria-label="Pás výsledkov">
            <CarouselContent>
              {[...VYSLEDKY, ...CESTA.map((k) => ({ value: k.nazov, label: k.kedy, note: '' }))].map((v) => (
                <CarouselItem key={v.value + v.label} className="basis-auto">
                  <div className="flex min-h-20 items-center gap-3 border-3 border-ink bg-paper px-4 py-2">
                    <span className="font-display text-xl font-extrabold whitespace-nowrap uppercase">{v.value}</span>
                    <span className="font-mono text-xs whitespace-nowrap uppercase">{v.label}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <Ovladanie>
              <CarouselDots className="mt-0 hidden sm:flex" />
            </Ovladanie>
          </Carousel>
        </Variant>
      </Mriezka>
    </Kus>
  );
}
