/** Katalóg V7 · spinner.tsx a skeleton.tsx: stavy načítavania. */
import * as React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { POSTAVIL } from '@/data/fakty';
import { Bunka, Chyba, Kus, Pod, Prepinac } from './Spolocne';

const VARIANTY = ['default', 'dots', 'bars', 'blocks', 'brutal'] as const;
const VELKOSTI = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const SK = ['pulse', 'stamp', 'blocks', 'scan', 'none'] as const;
const SK_CO: Record<(typeof SK)[number], string> = {
  pulse: 'animate-pulse (plynulé dýchanie)',
  stamp: 'bk-skeleton-stamp (tvrdé zap/vyp)',
  blocks: 'bk-skeleton-blocks (pochodujúce bunky)',
  scan: 'bk-skeleton-scan (pruh cez blok)',
  none: 'bez pohybu',
};

/** Obchádzky chýb kitu (opísané v poznámkach): blocks nemá rozmer rotujúceho obalu, brutal má tieň primary = ink na ink. */
function spinnerOprava(v: (typeof VARIANTY)[number]): { className?: string; style?: React.CSSProperties } {
  if (v === 'blocks') return { className: '[&>div]:size-full' };
  if (v === 'brutal') return { style: { ['--primary' as string]: 'var(--secondary)' } };
  return {};
}

export default function Nacitanie() {
  const [oprava, setOprava] = React.useState(true);
  const [nacitava, setNacitava] = React.useState(true);
  const projekt = POSTAVIL.find((p) => p.id === 'trhovy-dataset')!;

  return (
    <>
      <Kus
        id="spinner"
        meno="spinner"
        subor="src/components/ui/spinner.tsx · 5 variantov × 5 veľkostí · role=status"
        pocet="25 kombinácií"
        veta="Malý indikátor práce: v tlačidle počas odoslania, pri overovaní termínu, pri výpočte skóre webu."
      >
        <Chyba>
          Varianty <code>dots, bars, blocks, brutal</code> volajú keyframes <code>brutal-dots / brutal-bars / brutal-blocks / brutal-shadow-spin</code>,
          ktoré v CSS <strong>neexistujú</strong> → bez záplaty stoja. <code>blocks</code>: rotujúci obal nemá rozmer, všetky 4 bloky sa zlejú do stredu.
          <code> brutal</code>: tieň je <code>hsl(var(--primary))</code> = ink na ink, nevidno ho. <code>aria-label=&quot;Loading&quot;</code> je anglicky (dá sa prepísať).
        </Chyba>
        <Prepinac label="obchádzka blocks + brutal" zap={oprava} onZmena={setOprava} />
        <div className="overflow-x-auto rounded-lg border-3 border-ink bg-white p-4">
          <table className="w-full min-w-[520px] border-separate border-spacing-3 text-left">
            <thead>
              <tr className="font-mono text-xs">
                <th />
                {VELKOSTI.map((s) => (
                  <th key={s}>size=&quot;{s}&quot;</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VARIANTY.map((v) => (
                <tr key={v}>
                  <th className="font-mono text-xs font-normal">variant=&quot;{v}&quot;</th>
                  {VELKOSTI.map((s) => (
                    <td key={s} className="h-16">
                      <Spinner variant={v} size={s} aria-label="Načítavam" {...(oprava ? spinnerOprava(v) : {})} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pod poznamka="Spinner v tlačidle počas odoslania zápisu (stav sa prepína).">Kombinácia s Adamovým obsahom</Pod>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="accent" className="min-h-12 gap-3 text-ink" onClick={() => setNacitava((n) => !n)} aria-busy={nacitava}>
            {nacitava ? <Spinner variant="bars" size="sm" aria-label="Odosielam" className="[&>div]:bg-ink" /> : null}
            {nacitava ? 'Zapisujem do čakárne…' : 'Chcem vedieť ako prvý'}
          </Button>
          <span className="flex items-center gap-2 font-mono text-xs uppercase">
            <Spinner variant="dots" size="md" aria-label="Počítam skóre" /> počítam skóre webu
          </span>
        </div>
      </Kus>

      <Kus
        id="skeleton"
        meno="skeleton"
        subor="src/components/ui/skeleton.tsx · 5 variantov · aria-hidden"
        pocet="5 variantov"
        veta="Zástupný blok, kým sa načítajú dáta (pulz Korpusu, termíny, skóre). Je aria-hidden: načítavanie ohlasuje rodič cez aria-busy / role=status."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SK.map((v) => (
            <Bunka key={v} popis={<>variant=&quot;{v}&quot; · {SK_CO[v]}</>}>
              <div className="flex w-full flex-col gap-2">
                <Skeleton variant={v} className="h-6 w-3/4" />
                <Skeleton variant={v} className="h-16 w-full" />
                <Skeleton variant={v} className="h-4 w-1/2" />
              </div>
            </Bunka>
          ))}
        </div>
        <Chyba>
          Rám <code>border-foreground/20</code> je 2 px a svetlý, iný jazyk než 3 px ink rám zvyšku webu. Pre neobrutalizmus pridaj
          <code> className=&quot;border-3 border-ink&quot;</code> (ukážka vpravo dole).
        </Chyba>
        <Pod poznamka="Karta chorobopisu počas načítania (scan) a po načítaní. Číslo z fakty.ts.">Kombinácia s Adamovým obsahom</Pod>
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          <div className="flex flex-col gap-3 rounded-lg border-3 border-ink bg-white p-5 shadow-brutal-sm" role="status" aria-label="Načítavam chorobopis">
            <Skeleton variant="scan" className="h-4 w-28 border-3 border-ink" />
            <Skeleton variant="scan" className="h-12 w-2/3 border-3 border-ink" />
            <Skeleton variant="blocks" className="h-4 w-full" />
            <Skeleton variant="blocks" className="h-4 w-5/6" />
          </div>
          <div className="flex flex-col gap-3 rounded-lg border-3 border-ink bg-white p-5 shadow-brutal-sm">
            <p className="eyebrow">Chorobopis · {projekt.nazov}</p>
            <p className="font-display text-display-xs font-extrabold">{projekt.cislo}</p>
            <p className="text-sm">{projekt.riadok}</p>
          </div>
        </div>
      </Kus>
    </>
  );
}
