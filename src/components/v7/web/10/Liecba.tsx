/** V7-10 · Podnos 07 · Liečba. Triáž (vyšetrenie, VLAJKA), zásah (Agent pre teba + záložky Chat | Agent),
 *  odovzdanie (3 produkty, každý s funkčnou čakárňou v popoveri → /api/zapis/). Texty: v54/Liecba.astro, ponuka.ts. */
import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRECO_NIE_CHATGPT, PRODUKTY, VLAJKA } from '@/data/ponuka';
import { Dlazdica, Etiketa, type Ton } from './Dlazdica';
import Zapis from './Zapis';

const agent = PRODUKTY.find((p) => p.id === 'agent-pre-teba')!;
const ucenie = PRODUKTY.filter((p) => p.id !== 'agent-pre-teba');
const TON: Record<string, Ton> = { 'bg-yellow': 'yellow', 'bg-white': 'white', 'bg-paper': 'paper' };

function Krok({ n, nazov, meta }: { n: string; nazov: string; meta: string }) {
  return (
    <div className="flex items-end gap-3">
      <span className="v10-obrys font-display text-[4.2rem] leading-[0.8] font-extrabold tracking-tighter" aria-hidden="true">
        {n}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-3xl leading-none font-extrabold uppercase sm:text-4xl">{nazov}</h3>
        <p className="mt-1 font-mono text-[11px] font-bold tracking-[0.12em] uppercase">{meta}</p>
      </div>
    </div>
  );
}

export default function Liecba() {
  return (
    <div className="v10-mriezka">
      <Dlazdica tone="paper" className="col-span-2 md:col-span-6 lg:col-span-4 lg:row-span-3" stitok="L-00" bezMagnetu>
        <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <Etiketa cislo="07" nazov="Liečba" />
          <h2 className="font-display text-[clamp(2.4rem,1.4rem+3vw,3.8rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">
            Triáž. Zásah. Odovzdanie.
          </h2>
          <p className="mt-auto text-lg leading-snug">
            Postup ako na zmene. Najprv zistím, čo bolí. Potom najmenší zásah, ktorý pomôže. Na konci ti to odovzdám tak, aby to išlo aj bezo mňa.
          </p>
        </div>
      </Dlazdica>

      {/* 01 triáž */}
      <Dlazdica tone="white" className="col-span-2 md:col-span-3 lg:col-span-4 lg:row-span-3" stitok="L-01">
        <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
          <Krok n="01" nazov="Triáž" meta={`${VLAJKA.nazov} · ${VLAJKA.trvanie} · ${VLAJKA.cena}`} />
          <p className="font-display text-xl leading-tight font-extrabold sm:text-2xl">{VLAJKA.titulok}</p>
          <ol className="grid gap-2">
            {VLAJKA.body.map((b, i) => (
              <li key={b} className="flex gap-3 border-3 border-ink bg-paper p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border-3 border-ink bg-yellow font-mono text-sm font-bold">{i + 1}</span>
                <span className="text-sm leading-snug">{b}</span>
              </li>
            ))}
          </ol>
          <Button asChild variant="accent" size="lg" className="mt-auto w-fit max-w-full whitespace-normal">
            <a href="#vysetrenie" data-track="konzultacia_klik" data-track-miesto="v710-liecba">
              Vyber si termín <ArrowRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </Dlazdica>

      {/* 02 zásah: záložky Chat | Agent */}
      <Dlazdica tone="yellow" className="col-span-2 md:col-span-3 lg:col-span-4 lg:row-span-3" stitok="L-02" bezMagnetu>
        <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
          <Krok n="02" nazov="Zásah" meta={`${agent.nalepka} · ${agent.pre}`} />
          <p className="text-base leading-snug">
            <b className="font-display uppercase">{agent.nazov}.</b> {agent.popis}
          </p>
          <Tabs defaultValue="agent" className="flex flex-1 flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="agent">Agent</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="mt-3">
              <ul className="grid gap-2">
                {PRECO_NIE_CHATGPT.map((r) => (
                  <li key={r.chat} className="border-3 border-ink bg-white px-3 py-2 text-sm leading-snug text-ink/70 line-through decoration-stamp decoration-2">
                    {r.chat}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="agent" className="mt-3">
              <ul className="grid gap-2">
                {PRECO_NIE_CHATGPT.map((r) => (
                  <li key={r.agent} className="border-3 border-ink bg-white px-3 py-2 text-sm leading-snug">
                    {r.agent}
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      </Dlazdica>

      {/* 03 odovzdanie: produkty */}
      <Dlazdica tone="ink" className="col-span-2 md:col-span-6 lg:col-span-3 lg:row-span-2" stitok="L-03" bezMagnetu>
        <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-end gap-3">
            <span className="v10-obrys v10-obrys-svetly font-display text-[4.2rem] leading-[0.8] font-extrabold tracking-tighter" aria-hidden="true">
              03
            </span>
            <h3 className="font-display text-3xl leading-none font-extrabold uppercase sm:text-4xl">Odovzdanie</h3>
          </div>
          <p className="font-mono text-[11px] font-bold tracking-[0.12em] text-yellow uppercase">Aby to išlo aj bezo mňa</p>
          <p className="mt-auto font-display text-xl leading-tight font-extrabold">
            Naučím ťa robiť to, čo robím ja. Po slovensky, na tvojej vlastnej úlohe.
          </p>
        </div>
      </Dlazdica>

      {ucenie.map((p, i) => (
        <Dlazdica
          key={p.id}
          tone={TON[p.farba] ?? 'white'}
          className="col-span-2 md:col-span-2 lg:col-span-3 lg:row-span-2"
          stitok={`L-03.${i + 1}`}
          detailNazov={p.nazov}
          detail={
            <ul className="grid gap-1">
              {p.body.map((b) => (
                <li key={b} className="text-base">
                  ✚ {b}
                </li>
              ))}
            </ul>
          }
        >
          <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
            <Badge variant="outline" className="w-fit shadow-none hover:translate-x-0 hover:translate-y-0">
              {p.nalepka}
            </Badge>
            <h4 className="font-display text-2xl leading-none font-extrabold uppercase">{p.nazov}</h4>
            <p className="text-sm leading-snug">{p.popis}</p>
            <div className="mt-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative z-[1]">
                    Chcem vedieť ako prvý
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]" align="start">
                  <p className="eyebrow">Čakáreň · {p.nalepka}</p>
                  <p className="mt-1 mb-3 font-display text-lg leading-tight font-extrabold uppercase">{p.nazov}</p>
                  <Zapis zdroj="cakacka" produkt={p.id} tlacidlo="Zapíš ma" stlpec />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Dlazdica>
      ))}
    </div>
  );
}
