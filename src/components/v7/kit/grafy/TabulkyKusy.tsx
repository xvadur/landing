/** V7 katalóg · table + data-table. Obsah: živé čísla Korpusu a „Čo som postavil“ z fakty.ts (skutočné). */
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { KORPUS, POSTAVIL, ZIVE_CISLA } from '@/data/fakty';
import { Kus, Mriezka, SkutocneData, Varianta, fmt, usePulz } from './spolocne';

type Riadok = { nazov: string; cislo: string; popis: string; stav: string };

const PROJEKTY: Riadok[] = POSTAVIL.map((p) => ({
  nazov: p.nazov,
  cislo: p.cislo,
  popis: p.riadok,
  stav: p.url ? 'živé' : p.domena ? 'čoskoro' : 'interné',
}));

const STLPCE: ColumnDef<Riadok, unknown>[] = [
  {
    accessorKey: 'nazov',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Projekt" />,
    cell: ({ row }) => <span className="font-bold">{row.original.nazov}</span>,
  },
  {
    accessorKey: 'cislo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Číslo" />,
    cell: ({ row }) => <span className="whitespace-nowrap font-mono tabular-nums">{row.original.cislo}</span>,
  },
  {
    accessorKey: 'popis',
    header: 'Čo to je',
    enableSorting: false,
    cell: ({ row }) => <span className="block min-w-[16rem] text-sm">{row.original.popis}</span>,
  },
  {
    accessorKey: 'stav',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stav" />,
    cell: ({ row }) => (
      <Badge variant={row.original.stav === 'živé' ? 'secondary' : row.original.stav === 'čoskoro' ? 'outline' : 'default'}>
        {row.original.stav}
      </Badge>
    ),
  },
];


export default function TabulkyKusy() {
  const pulz = usePulz();
  const [vybrane, setVybrane] = React.useState<Riadok[]>([]);
  const hodnoty: Record<string, number> = {
    words_month: pulz.words_month,
    prompts_today: pulz.prompts_today,
    streak_days: pulz.streak_days,
    projects_active: pulz.projects_active,
  };

  return (
    <div className="flex flex-col gap-16">
      {/* ---------------- table ---------------- */}
      <Kus
        id="table"
        meno="table"
        subor="table.tsx"
        veta="Čistá tabuľka v ráme s tieňom: hlavička, telo, pätička, popis. Chorobopis v číslach, cenník, porovnanie."
      >
        <Mriezka className="xl:grid-cols-2">
          <Varianta nazov="Vitálne funkcie" props="Header · Body · Footer · Caption">
            <Table>
              <TableCaption>Pulz Korpusu · {pulz.cas}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Kanál</TableHead>
                  <TableHead className="text-right">Hodnota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ZIVE_CISLA.map((z) => (
                  <TableRow key={z.kluc}>
                    <TableCell>
                      <span className="font-bold">{z.label}</span>
                      <span className="block text-xs text-ink/60">{z.note}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-lg font-bold tabular-nums">{fmt(hodnoty[z.kluc] ?? z.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Korpus celkom (od {KORPUS.od})</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{KORPUS.slova}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <SkutocneData zdroj="pulse.json + fakty.ts" />
          </Varianta>
          <Varianta nazov="Hustá, pruhovaná, vybraný riadok" props="className na bunkách · data-state=selected">
            <Table className="bg-white text-sm">
              <TableHeader className="bg-ink [&_th]:text-paper">
                <TableRow>
                  <TableHead className="h-10 px-3">Projekt</TableHead>
                  <TableHead className="h-10 px-3 text-right">Číslo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:nth-child(even)]:bg-paper">
                {PROJEKTY.map((p, i) => (
                  <TableRow key={p.nazov} data-state={i === 2 ? 'selected' : undefined} className="data-[state=selected]:bg-yellow">
                    <TableCell className="px-3 py-2">{p.nazov}</TableCell>
                    <TableCell className="px-3 py-2 text-right font-mono tabular-nums">{p.cislo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <SkutocneData zdroj="fakty.ts · POSTAVIL" />
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- data-table ---------------- */}
      <Kus
        id="data-table"
        meno="data-table"
        subor="data-table.tsx"
        veta="Tabuľka s triedením, filtrom, výberom stĺpcov a riadkov a stránkovaním (TanStack Table 8). Pre stránku štatistík, archív textov, zoznam projektov."
      >
        <Varianta nazov="Všetko zapnuté" props="sorting · filtering · columnVisibility · rowSelection · pagination (pageSize=5)">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <DataTable
                columns={STLPCE}
                data={PROJEKTY}
                filterColumn="nazov"
                filterPlaceholder="Hľadaj projekt…"
                enableRowSelection
                pageSize={5}
                pageSizeOptions={[5, 10]}
                emptyMessage="Nič nenašlo."
                onRowSelectionChange={setVybrane}
              />
            </div>
          </div>
          <p className="font-mono text-sm" aria-live="polite">
            Vybrané: {vybrane.length ? vybrane.map((v) => v.nazov).join(', ') : 'nič'}
          </p>
          <SkutocneData zdroj="fakty.ts · POSTAVIL" />
        </Varianta>
        <Mriezka className="xl:grid-cols-2">
          <Varianta nazov="Holá" props="všetky enable* = false">
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <DataTable
                  columns={STLPCE.filter((c) => (c as { accessorKey?: string }).accessorKey !== 'popis')}
                  data={PROJEKTY.slice(0, 4)}
                  enableSorting={false}
                  enableFiltering={false}
                  enableColumnVisibility={false}
                  enablePagination={false}
                />
              </div>
            </div>
          </Varianta>
          <Varianta nazov="Načítava sa / prázdna" props="isLoading · emptyMessage">
            <div className="overflow-x-auto">
              <div className="flex min-w-[420px] flex-col gap-4">
                <DataTable columns={STLPCE.slice(0, 2)} data={[]} isLoading enableFiltering={false} enableColumnVisibility={false} enablePagination={false} />
                <DataTable
                  columns={STLPCE.slice(0, 2)}
                  data={[]}
                  emptyMessage="Zatiaľ žiadny záznam v chorobopise."
                  enableFiltering={false}
                  enableColumnVisibility={false}
                  enablePagination={false}
                />
              </div>
            </div>
          </Varianta>
        </Mriezka>
      </Kus>
    </div>
  );
}
