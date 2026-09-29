/** V7-01 · obrazovka Inštrumentár: nástroje ako moduly v stojane monitora (dva kanály A / B). Texty doslovne
 *  z v54/Nastroje.astro. Statické SSR. Kusy: card, badge, shapes (GearShape). */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GearShape } from '@/components/ui/shapes';
import { NASTROJE_A, NASTROJE_B, NASTROJE_VETA, type Nastroj } from './data';

function Modul({ n, kanal, i }: { n: Nastroj; kanal: string; i: number }) {
  return (
    <Card className="m01-modul flex h-full flex-col bg-white">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 border-b-3 p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-ink bg-yellow font-display text-xl" aria-hidden="true">
          {n.znak}
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
          {kanal}
          {String(i + 1).padStart(2, '0')}
        </span>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-3">
        <CardTitle className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">{n.nazov}</CardTitle>
        <p className="text-sm leading-snug">{n.na}</p>
      </CardContent>
    </Card>
  );
}

export default function Nastroje() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-4">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink/60">✚ Inštrumentár</p>
        <h2 id="nastroje-h" className="font-display text-display-sm leading-[0.88] font-extrabold tracking-tighter uppercase">
          Moje nástroje
        </h2>
        <p className="max-w-md text-lg">{NASTROJE_VETA}</p>
        <div className="flex items-center gap-3">
          <GearShape size={56} filled color="var(--color-yellow)" strokeColor="var(--color-ink)" animation="spin-step" speed="slow" aria-hidden="true" />
          <Badge variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
            {NASTROJE_A.length + NASTROJE_B.length} modulov v stojane
          </Badge>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
        {[
          { kanal: 'A', rad: NASTROJE_A, popis: 'Kanál A · stavba a prevádzka' },
          { kanal: 'B', rad: NASTROJE_B, popis: 'Kanál B · weby, dáta, záznam' },
        ].map((r) => (
          <div key={r.kanal} className="flex flex-col gap-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">{r.popis}</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list">
              {r.rad.map((n, i) => (
                <li key={n.nazov}>
                  <Modul n={n} kanal={r.kanal} i={i} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
