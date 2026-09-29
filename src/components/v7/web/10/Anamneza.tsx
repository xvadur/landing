/** V7-10 · Podnos 03 · Anamnéza. Cesta ako 8 nástrojov rôznych veľkostí: elektrotechnická → viera → nemocnica (8 rokov)
 *  → psychológia → odchod (Jún 2025*) → AI → agenti → XVADUR. Texty: src/data/cesta.ts, beaty.ts (beat 3),
 *  v54/Anamneza.astro. Kde text chýba: štítok „text doplní Adam“. Malé dlaždice ukážu text v rozbalení. */
import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { LayeredCard } from '@/components/ui/layered-card';
import { Stamp } from '@/components/ui/sticker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HeartShape, SealShape } from '@/components/ui/shapes';
import { cn } from '@/lib/utils';
import { Dlazdica, Etiketa, type Ton } from './Dlazdica';
import { ANAMNEZA, BIO, type Zastavka } from './data';

const cislo = (i: number) => String(i + 1).padStart(2, '0');

function Doplni() {
  return (
    <Badge variant="outline" className="w-fit shadow-none hover:translate-x-0 hover:translate-y-0">
      text doplní Adam
    </Badge>
  );
}

function Kedy({ z, i }: { z: Zastavka; i: number }) {
  const hviezda = z.kedy.endsWith('*');
  return (
    <p className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.14em] uppercase">
      <span>{cislo(i)}</span>
      <span aria-hidden="true">·</span>
      {hviezda ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="relative underline decoration-dotted underline-offset-4 before:absolute before:-inset-3 before:content-['']">
              {z.kedy}
            </button>
          </TooltipTrigger>
          <TooltipContent>Dátum sa ešte overuje.</TooltipContent>
        </Tooltip>
      ) : (
        <span>{z.kedy}</span>
      )}
    </p>
  );
}

/** Malá zastávka: názov viditeľný, text v rozbalení. */
function Mala({ z, i, tone, className }: { z: Zastavka; i: number; tone: Ton; className: string }) {
  return (
    <Dlazdica
      tone={tone}
      className={className}
      stitok={`A-${cislo(i)}`}
      detailNazov={z.nazov}
      detail={z.text ? <p className="text-base leading-snug">{z.text}</p> : undefined}
    >
      <div className="flex h-full flex-col gap-2 p-4 sm:p-5">
        <Kedy z={z} i={i} />
        <h3 className="font-display text-[clamp(1.6rem,1.1rem+1.4vw,2.3rem)] leading-[0.9] font-extrabold tracking-tight uppercase">{z.nazov}</h3>
        {z.kde && <p className="text-sm">{z.kde}</p>}
        <div className="mt-auto">{z.doplni && <Doplni />}</div>
      </div>
    </Dlazdica>
  );
}

export default function Anamneza() {
  const [skola, viera, nemocnica, psychologia, odchod, ai, agenti, xvadur] = BIO as [
    Zastavka,
    Zastavka,
    Zastavka,
    Zastavka,
    Zastavka,
    Zastavka,
    Zastavka,
    Zastavka,
  ];
  return (
    <TooltipProvider delayDuration={120}>
      <div className="v10-mriezka">
        {/* titul */}
        <Dlazdica tone="yellow" className="col-span-2 md:col-span-6 lg:col-span-4 lg:row-span-2" stitok="A-00 · anamnéza" bezMagnetu>
          <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
            <Etiketa cislo="03" nazov="Anamnéza" />
            <h2 className="font-display text-[clamp(2.4rem,1.4rem+3vw,3.8rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">
              {ANAMNEZA.nadpis}
            </h2>
            <blockquote className="mt-auto border-l-4 border-ink pl-4 font-serif text-2xl leading-tight italic">{ANAMNEZA.citat}</blockquote>
            <p className="text-sm">{ANAMNEZA.dovetok}</p>
          </div>
        </Dlazdica>

        {/* 03 nemocnica: vrstvená karta (roky na sebe) */}
        <Dlazdica tone="paper" className="col-span-2 md:col-span-6 lg:col-span-5 lg:row-span-2" stitok="A-03 · nemocnica">
          <div className="flex h-full flex-col p-4 pr-7 pb-7 sm:p-5 sm:pr-8 sm:pb-8">
            <LayeredCard layers="triple" offset="sm" layerColor="secondary" className="h-full [&>div:last-child]:h-full">
              <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
                <Kedy z={nemocnica} i={2} />
                <h3 className="font-display text-[clamp(2rem,1.3rem+2vw,3rem)] leading-[0.9] font-extrabold tracking-tight uppercase">{nemocnica.nazov}</h3>
                <p className="text-sm font-bold uppercase">{nemocnica.kde}</p>
                <p className="text-base leading-snug sm:text-lg">{nemocnica.text}</p>
              </div>
            </LayeredCard>
          </div>
          <Stamp variant="destructive" size="default" rotation="slight" className="absolute right-4 bottom-4 z-10 hidden sm:flex">
            {ANAMNEZA.peciatka}
          </Stamp>
        </Dlazdica>

        <Mala z={skola} i={0} tone="white" className="col-span-1 md:col-span-3 lg:col-span-3" />
        <Mala z={viera} i={1} tone="white" className="col-span-1 md:col-span-3 lg:col-span-3" />

        {/* 04 psychológia */}
        <Dlazdica tone="white" className="col-span-2 md:col-span-3 lg:col-span-4 lg:row-span-2" stitok="A-04">
          <div className="relative flex h-full flex-col gap-3 p-4 sm:p-5">
            <Kedy z={psychologia} i={3} />
            <h3 className="font-display text-[clamp(2rem,1.3rem+2vw,3rem)] leading-[0.9] font-extrabold tracking-tight uppercase">{psychologia.nazov}</h3>
            <p className="text-base leading-snug sm:text-lg">{psychologia.text}</p>
            <SealShape size={64} color="var(--color-yellow)" animation="spin-step" speed="slow" className="mt-auto self-end" aria-hidden="true" />
          </div>
        </Dlazdica>

        {/* 05 odchod: citát */}
        <Dlazdica tone="ink" className="col-span-2 md:col-span-3 lg:col-span-5 lg:row-span-2" stitok="A-05">
          <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
            <Kedy z={odchod} i={4} />
            <h3 className="font-display text-[clamp(2rem,1.3rem+2vw,3rem)] leading-[0.9] font-extrabold tracking-tight text-yellow uppercase">{odchod.nazov}</h3>
            <p className="text-base">{odchod.text}</p>
            <blockquote className="mt-auto border-l-4 border-yellow pl-4 font-serif text-xl leading-snug italic sm:text-2xl">„{odchod.citat}“</blockquote>
            <p className="font-mono text-[11px] text-paper/60">* dátum sa ešte overuje</p>
          </div>
        </Dlazdica>

        <Mala z={ai} i={5} tone="yellow" className="col-span-1 md:col-span-3 lg:col-span-3" />
        <Mala z={agenti} i={6} tone="white" className="col-span-1 md:col-span-3 lg:col-span-3" />

        {/* 08 XVADUR */}
        <Dlazdica tone="white" className="col-span-2 md:col-span-6 lg:col-span-8" stitok="A-08">
          <div className="flex h-full flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
            <div className="shrink-0">
              <Kedy z={xvadur} i={7} />
              <h3 className="font-display text-[clamp(2rem,1.3rem+2vw,3rem)] leading-[0.9] font-extrabold tracking-tight uppercase">{xvadur.nazov}</h3>
            </div>
            <p className="text-base leading-snug">{xvadur.text}</p>
          </div>
        </Dlazdica>

        {/* ďalší pacient */}
        <Dlazdica tone="paper" className="col-span-2 md:col-span-6 lg:col-span-4" innerClassName="tx-dots [--tx:18%]">
          <div className="flex h-full items-center justify-between gap-4 p-4 sm:p-5">
            <HeartShape size={52} color="var(--color-stamp)" animation="pulse-hard" aria-hidden="true" className="shrink-0" />
            <Button asChild variant="accent" size="lg" className={cn('max-w-full whitespace-normal')}>
              <a href="#vysetrenie" data-track="konzultacia_klik" data-track-miesto="v710-anamneza">
                {ANAMNEZA.cta.replace(' →', '')} <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </Dlazdica>
      </div>
    </TooltipProvider>
  );
}
