/** V7-08 · okno Chorobopisy = kartotéka pacientov. Hore data-table (triedenie, hľadanie bez diakritiky necháva na
 *  tabuľke), dole karta pacienta v záložkách (forceMount → všetky karty sú v HTML). Klik „Otvoriť“ prepne kartu.
 *  Texty: DOKAZY, POSTAVIL, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA z fakty.ts, úvod z v54/Chorobopisy.astro. */
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ClipboardList, ExternalLink } from 'lucide-react';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { MARQUEE_FAKTY, OVERENE_DNA_TEXT, POSTAVIL } from '@/data/fakty';
import { cn } from '@/lib/utils';
import Okno from './Okno';
import { domena, PACIENTI, STAV_TEXT, type Pacient } from './data';
import { otvorOkno, posli } from './store';

const bezPosunu = 'shadow-none hover:translate-x-0 hover:translate-y-0';
const cislo = (i: number) => String(i + 1).padStart(2, '0');

const prehladane = Number((MARQUEE_FAKTY.find((f) => f.label === 'Realitné weby')?.value ?? '').replace(/\D/g, '')) || 0;
const sTextom = Number((POSTAVIL.find((p) => p.id === 'trhovy-dataset')?.fakty.find((f) => f.label === 'Weby')?.value ?? '').replace(/\D/g, '')) || 0;

type Riadok = Pacient & { poradie: number };
const RIADKY: Riadok[] = PACIENTI.map((p, i) => ({ ...p, poradie: i }));

function Donut() {
  const [Kus, setKus] = React.useState<React.ComponentType<{ sTextom: number; prehladane: number }> | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !sTextom || !prehladane) return;
    const io = new IntersectionObserver((e) => {
      if (!e.some((x) => x.isIntersecting)) return;
      io.disconnect();
      void import('./DonutDataset').then((m) => setKus(() => m.default));
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="border-3 border-ink bg-white p-3">
      {Kus ? <Kus sTextom={sTextom} prehladane={prehladane} /> : <Skeleton variant="blocks" className="h-56 w-full border-3 border-ink" />}
      <p className="mt-2 text-center font-mono text-xs font-bold uppercase">
        {sTextom} zo {prehladane} prehľadaných webov malo textové bloky
      </p>
    </div>
  );
}

function Karta({ p }: { p: Pacient }) {
  const jakub = p.id === 'system-pre-maklera';
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={p.stav === 'zive' ? 'secondary' : 'outline'} className={bezPosunu}>
            {STAV_TEXT[p.stav]}
          </Badge>
          {p.stitky.map((s) => (
            <Badge key={s} variant="outline" className={cn('font-mono normal-case', bezPosunu)}>
              {s}
            </Badge>
          ))}
        </div>
        <h3 className="font-display text-4xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-5xl">{p.nazov}</h3>
        <p className="text-lg leading-snug">{p.riadok}</p>
        <div className="border-t-3 border-ink pt-3">
          <p className="font-display text-5xl leading-none font-extrabold tabular-nums">{p.cislo}</p>
          <p className="mt-1 font-mono text-xs font-bold tracking-wider uppercase">{p.cisloPopis}</p>
        </div>
        {jakub && (
          <div className="flex flex-col gap-2">
            <Progress value={100} className="h-4 [&>div]:bg-yellow" aria-label="Kontroly pred vydaním: 47 zo 47" />
            <p className="font-mono text-xs font-bold uppercase">47 zo 47 kontrol pred vydaním</p>
          </div>
        )}
        {p.id === 'trhovy-dataset' && <Donut />}
        {p.stavText && <p className="border-l-4 border-stamp pl-3 text-sm font-bold">{p.stavText}</p>}
        <div className="flex flex-wrap items-center gap-3">
          {p.url ? (
            <Button asChild variant="outline">
              <a href={p.url} target="_blank" rel="noopener noreferrer" data-track="dokaz_klik" data-track-miesto={`v708-${p.id}`}>
                {domena(p.url)} <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          ) : (
            p.poznamka && <span className="border-2 border-ink px-3 py-1 font-mono text-xs font-bold">{p.poznamka}</span>
          )}
          {p.overene && <span className="font-mono text-[11px] uppercase">odkaz overený {OVERENE_DNA_TEXT}</span>}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        {p.obrazok && (
          <img src={p.obrazok} alt={`${p.nazov}: náhľad`} width={960} height={600} loading="lazy" decoding="async" className="aspect-[16/10] w-full border-3 border-ink object-cover object-top" />
        )}
        {p.mal && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-3 border-ink bg-paper p-4">
              <p className="font-mono text-xs font-bold uppercase">Diagnóza · mal</p>
              <ul className="mt-2 flex list-none flex-col gap-2 p-0 text-sm">
                {p.mal.map((m) => (
                  <li key={m} className="text-ink/75 line-through decoration-stamp decoration-2">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-3 border-ink bg-yellow p-4">
              <p className="font-mono text-xs font-bold uppercase">Liečba · dostal</p>
              <ul className="mt-2 flex list-none flex-col gap-2 p-0 text-sm font-medium">
                {p.dostal?.map((m) => <li key={m}>✚ {m}</li>)}
              </ul>
            </div>
          </div>
        )}
        {p.fakty.length > 0 && (
          <dl className="grid grid-cols-2 gap-3">
            {p.fakty.map((f) => (
              <div key={f.label} className="border-3 border-ink bg-white p-3">
                <dt className="font-mono text-[11px] font-bold uppercase text-ink/60">{f.label}</dt>
                <dd className="font-display text-2xl font-extrabold">{f.value}</dd>
                <dd className="text-xs">{f.note}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

export default function OknoChorobopisy() {
  const [karta, setKarta] = React.useState(PACIENTI[0]!.id);
  const kartaRef = React.useRef<HTMLDivElement>(null);

  const otvor = React.useCallback((id: string) => {
    setKarta(id);
    window.setTimeout(() => kartaRef.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' }), 30);
  }, []);

  const stlpce = React.useMemo<ColumnDef<Riadok>[]>(
    () => [
      {
        accessorKey: 'poradie',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Č." />,
        cell: ({ row }) => <span className="font-mono text-xs font-bold">{cislo(row.original.poradie)}</span>,
        meta: { label: 'Číslo' },
      },
      {
        accessorKey: 'nazov',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pacient" />,
        cell: ({ row }) => (
          <div className="min-w-[13rem]">
            <p className="font-display text-base leading-tight font-extrabold uppercase">{row.original.nazov}</p>
            <p className="text-xs leading-snug text-ink/70">{row.original.riadok}</p>
          </div>
        ),
        meta: { label: 'Pacient' },
      },
      {
        accessorKey: 'cislo',
        header: 'Hlavné číslo',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            <p className="font-mono text-base font-bold">{row.original.cislo}</p>
            <p className="text-[11px] text-ink/70">{row.original.cisloPopis}</p>
          </div>
        ),
        meta: { label: 'Hlavné číslo' },
      },
      {
        accessorKey: 'stav',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stav" />,
        cell: ({ row }) => (
          <Badge variant={row.original.stav === 'zive' ? 'secondary' : 'outline'} className={cn('whitespace-nowrap', bezPosunu)}>
            {STAV_TEXT[row.original.stav]}
          </Badge>
        ),
        meta: { label: 'Stav' },
      },
      {
        id: 'akcia',
        header: () => <span className="sr-only">Akcia</span>,
        enableHiding: false,
        cell: ({ row }) => (
          <Button size="sm" variant={karta === row.original.id ? 'secondary' : 'outline'} onClick={() => otvor(row.original.id)} aria-label={`Otvoriť chorobopis: ${row.original.nazov}`}>
            Otvoriť <ArrowRight aria-hidden="true" />
          </Button>
        ),
      },
    ],
    [karta, otvor],
  );

  return (
    <Okno id="chorobopisy" ikona={<ClipboardList />} className="lg:col-span-11 lg:col-start-2 lg:mt-2" stav={<>PACIENTI.DB · {PACIENTI.length} záznamov · stav tak, ako naozaj je</>}>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold tracking-[0.16em] uppercase">✚ Chorobopisy · čo som postavil</p>
            <p className="font-display text-3xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-4xl">Čo som postavil</p>
          </div>
          <p className="max-w-md text-base">Každý systém so stavom, ako naozaj je. Kde je odkaz, dá sa otvoriť.</p>
        </div>

        <div className="overflow-x-auto pb-2" data-lenis-prevent>
          <div className="min-w-[640px] [&_tr[data-state=selected]]:bg-yellow">
            <DataTable
              columns={stlpce}
              data={RIADKY}
              enablePagination={false}
              enableColumnVisibility
              filterColumn="nazov"
              filterPlaceholder="Hľadať pacienta…"
              emptyMessage="Taký pacient v kartotéke nie je."
            />
          </div>
        </div>

        <div ref={kartaRef} className="scroll-mt-24 border-3 border-ink bg-paper p-4 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-6">
          <p className="mb-3 font-mono text-xs font-bold tracking-[0.16em] uppercase">Karta pacienta</p>
          <Tabs value={karta} onValueChange={setKarta}>
            <div className="-mx-1 overflow-x-auto px-1 pb-3" data-lenis-prevent>
              <TabsList className="h-auto w-max">
                {PACIENTI.map((p, i) => (
                  <TabsTrigger key={p.id} value={p.id} className="min-h-11 data-[state=active]:bg-yellow data-[state=active]:text-ink">
                    <span className="font-mono text-[10px]">{cislo(i)}</span> {p.nazov.split(',')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {PACIENTI.map((p) => (
              <TabsContent key={p.id} value={p.id} forceMount className="mt-4 data-[state=inactive]:hidden">
                <Karta p={p} />
              </TabsContent>
            ))}
          </Tabs>
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t-3 border-ink pt-4">
            <p className="font-display text-2xl font-extrabold uppercase">Ďalší chorobopis: tvoj.</p>
            <Button variant="accent" onClick={() => otvorOkno('vysetrenie')}>
              Vyšetrenie <ArrowRight aria-hidden="true" />
            </Button>
            <Button variant="outline" onClick={() => posli({ typ: 'pacient', id: karta })}>
              Otvoriť v paneli
            </Button>
          </div>
        </div>
      </div>
    </Okno>
  );
}
