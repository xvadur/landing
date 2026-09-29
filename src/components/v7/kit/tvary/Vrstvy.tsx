/** Katalóg V7 · layered-card.tsx: karta s 1–3 posunutými vrstvami za sebou (layers × offset × layerColor × interactive). */
import * as React from 'react';
import {
  LayeredCard,
  LayeredCardContent,
  LayeredCardDescription,
  LayeredCardFooter,
  LayeredCardHeader,
  LayeredCardTitle,
} from '@/components/ui/layered-card';
import { Button } from '@/components/ui/button';
import { POSTAVIL } from '@/data/fakty';
import { VLAJKA } from '@/data/ponuka';
import { Bunka, Chyba, Kus, Pod } from './Spolocne';

const LAYERS = ['single', 'double', 'triple'] as const;
const OFFSETS = ['sm', 'default', 'lg'] as const;
const FARBY = ['default', 'primary', 'secondary', 'accent', 'muted'] as const;
const FARBY_TOKEN: Record<(typeof FARBY)[number], string> = {
  default: 'bg-muted',
  primary: 'bg-primary = ink',
  secondary: 'bg-secondary = yellow',
  accent: 'bg-accent = hot',
  muted: 'bg-muted',
};

function Mala({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-5 font-display text-lg font-extrabold uppercase">{children}</div>;
}

export default function Vrstvy() {
  const netopier = POSTAVIL.find((p) => p.id === 'agentovy-system')!; // nie Netopier: ROZPOR 5 v fakty.ts
  const hriech = POSTAVIL.find((p) => p.id === 'hriech')!;
  return (
    <Kus
      id="layered-card"
      meno="layered-card"
      subor="src/components/ui/layered-card.tsx · LayeredCard + Header, Title, Description, Content, Footer"
      pocet="6 exportov"
      veta="Karta s kopou vrstiev za sebou (ako stoh chorobopisov): projekty, dôkaz, rám fotky v hero. Vrstvy sú absolútne za kartou a posunuté dole-vpravo."
    >
      <Chyba>
        Vrstvy nemajú rezervované miesto: pri <code>triple + lg</code> presahujú kartu o 36 px dole aj vpravo — rodič potrebuje padding
        (inak pretečie na mobile). Hlavička/pätička majú <code>bg-muted</code>. <code>layerColor=&quot;accent&quot;</code> = hot, na webe iba pri CTA.
      </Chyba>
      <Pod poznamka="layers × offset (sm = 6 px, default = 8 px, lg = 12 px na vrstvu).">Vrstvy a odsadenie</Pod>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {LAYERS.map((l) =>
          OFFSETS.map((o) => (
            <Bunka key={l + o} popis={<>layers=&quot;{l}&quot; offset=&quot;{o}&quot;</>} className="[&>div]:pr-12 [&>div]:pb-12">
              <LayeredCard layers={l} offset={o} className="w-full max-w-56">
                <Mala>Chorobopis</Mala>
              </LayeredCard>
            </Bunka>
          ))
        )}
      </div>
      <Pod poznamka="layerColor (triple, default offset). Vrstvy majú opacity 100 / 70 / 50 %.">Farba vrstiev</Pod>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {FARBY.map((f) => (
          <Bunka key={f} popis={<>layerColor=&quot;{f}&quot; · {FARBY_TOKEN[f]}</>} className="[&>div]:pr-10 [&>div]:pb-10">
            <LayeredCard layers="triple" layerColor={f} className="w-full">
              <Mala>Pacient</Mala>
            </LayeredCard>
          </Bunka>
        ))}
      </div>
      <Pod poznamka="interactive = karta sa na hover posunie −4 px (vrstvy ostanú), podkomponenty Header / Title / Description / Content / Footer.">
        Kombinácia s Adamovým obsahom
      </Pod>
      <div className="grid gap-10 pr-9 pb-9 md:grid-cols-2">
        <LayeredCard layers="triple" layerColor="secondary" offset="default" interactive>
          <LayeredCardHeader>
            <LayeredCardTitle>{netopier.nazov}</LayeredCardTitle>
            <LayeredCardDescription>Chorobopis projektu</LayeredCardDescription>
          </LayeredCardHeader>
          <LayeredCardContent>
            <p className="font-display text-display-xs font-extrabold">{netopier.cislo}</p>
            <p className="mt-2 text-sm">{netopier.riadok}</p>
          </LayeredCardContent>
          <LayeredCardFooter className="gap-3">
            {netopier.fakty.slice(0, 2).map((f) => (
              <span key={f.label} className="font-mono text-xs uppercase">
                {f.value} · {f.label}
              </span>
            ))}
          </LayeredCardFooter>
        </LayeredCard>
        <LayeredCard layers="double" layerColor="primary" offset="lg">
          <LayeredCardHeader className="bg-yellow">
            <LayeredCardTitle>{VLAJKA.nazov}</LayeredCardTitle>
            <LayeredCardDescription className="text-ink">
              {VLAJKA.trvanie} · {VLAJKA.cena}
            </LayeredCardDescription>
          </LayeredCardHeader>
          <LayeredCardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {VLAJKA.body.map((b) => (
                <li key={b}>✚ {b}</li>
              ))}
            </ul>
          </LayeredCardContent>
          <LayeredCardFooter className="justify-between gap-3">
            <span className="font-mono text-xs uppercase">
              {hriech.nazov} · {hriech.cislo} stránok
            </span>
            <Button variant="accent" className="min-h-11">
              Objednaj sa
            </Button>
          </LayeredCardFooter>
        </LayeredCard>
      </div>
    </Kus>
  );
}
