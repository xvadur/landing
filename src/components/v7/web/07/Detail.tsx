/** V7-07 · detail chorobopisu v sheete (desktop sprava, mobil zdola). Fakty iba z fakty.ts: čo mal / čo dostal,
 *  čísla (stat-card), stav (alert), overený odkaz. Jakub navyše: 47 / 47 kontrol (radial-bar) a trh maklérov (funnel). */
import { ArrowUpRight, CheckCircle2, ClipboardCheck, Stethoscope, XCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatCard } from '@/components/ui/stat-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { RadialBarChart } from '@/components/ui/radial-bar-chart';
import { FunnelChart } from '@/components/ui/funnel-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { OVERENE_DNA_TEXT } from '@/data/fakty';
import { LIEVIK_TRH, STAV, domena, type Projekt } from './data';
import { chod } from './navigacia';
import { useMaloOkno } from './kontext';

const CFG_KONTROLY: ChartConfig = { kontroly: { label: 'Kontroly pred vydaním', color: 'hsl(var(--secondary))' } };
const LIEVIK_FARBY = ['hsl(var(--card))', 'hsl(var(--muted))', 'hsl(var(--secondary))', 'hsl(var(--foreground))'];

export function Detail({ p, open, onOpenChange }: { p: Projekt | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const malo = useMaloOkno();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={malo ? 'bottom' : 'right'} className={malo ? 'max-h-[88dvh] overflow-y-auto' : 'w-full overflow-y-auto sm:max-w-xl'} data-lenis-prevent>
        {p && (
          <div className="flex flex-col gap-6">
            <SheetHeader className="gap-2 text-left">
              <p className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold tracking-[0.14em] uppercase">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Chorobopis · {STAV[p.stav]}
              </p>
              <SheetTitle className="font-display text-4xl leading-[0.9] font-extrabold uppercase">{p.nazov}</SheetTitle>
              <SheetDescription className="text-base text-ink/80">{p.riadok}</SheetDescription>
              <div className="flex flex-wrap gap-1.5">
                {p.stitky.map((s) => (
                  <Badge key={s} variant="secondary" className="font-mono text-[11px]">
                    {s}
                  </Badge>
                ))}
              </div>
            </SheetHeader>

            {p.obrazok && (
              <div className="border-3 border-ink">
                <AspectRatio ratio={16 / 10}>
                  <img src={p.obrazok} alt={`${p.nazov} — náhľad`} className="h-full w-full object-cover object-top" loading="lazy" />
                </AspectRatio>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(p.cisla ?? [{ value: p.cislo, label: p.cisloPopis }]).map((c, i) => (
                <StatCard key={c.label} title={c.label} value={c.value} colorScheme={i === 0 ? 'secondary' : 'primary'} variant="default" />
              ))}
            </div>

            {p.id === 'system-pre-maklera' && (
              <div className="grid gap-4">
                <div className="grid items-center gap-4 border-3 border-ink bg-white p-4 sm:grid-cols-[160px_1fr]">
                  <div className="relative h-[160px] w-[160px]">
                    <RadialBarChart
                      data={[{ name: 'kontroly', value: 47, fill: 'hsl(var(--secondary))' }]}
                      config={CFG_KONTROLY}
                      maxValue={47}
                      innerRadius="70%"
                      outerRadius="100%"
                      showLabel={false}
                      showTooltip={false}
                      aria-label="47 zo 47 kontrol pred vydaním prešlo"
                      className="h-[160px]"
                    />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-3xl font-extrabold">47 / 47</span>
                      <span className="font-mono text-[10px] uppercase">kontrol</span>
                    </div>
                  </div>
                  <p className="text-base">Kontrolný zoznam pred vydaním: 47 zo 47 kontrol prešlo. Čísla sú z kontrol, nie z prevádzky.</p>
                </div>
                <div className="flex flex-col gap-2 border-3 border-ink bg-white p-4">
                  <p className="font-mono text-xs font-bold tracking-[0.1em] uppercase">Trh: aký prvý krok ponúkajú weby maklérov</p>
                  <div className="w-[calc(100%-9rem)] [&_svg]:!overflow-visible">
                    <FunnelChart data={LIEVIK_TRH.map((l, i) => ({ ...l, fill: LIEVIK_FARBY[i] }))} height={200} ariaLabel="Weby maklérov: prehľadané, s analyzovaným prvým krokom, s dôkazom, s rezerváciou" />
                  </div>
                  <p className="font-mono text-[11px]">Zdroj: launch pack Neviditeľný maklér (fakty.ts, KOTVY). Preto má Jakub rezerváciu ako prvý krok.</p>
                </div>
              </div>
            )}

            {(p.mal || p.dostal) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {p.mal && (
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-xs font-bold tracking-[0.1em] uppercase">Čo mal</p>
                    <ul className="grid gap-2">
                      {p.mal.map((x) => (
                        <li key={x} className="flex gap-2 border-3 border-ink bg-white p-3 text-sm leading-snug">
                          <XCircle className="h-4 w-4 shrink-0 text-stamp" aria-hidden="true" /> {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.dostal && (
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-xs font-bold tracking-[0.1em] uppercase">Čo dostal</p>
                    <ul className="grid gap-2">
                      {p.dostal.map((x) => (
                        <li key={x} className="flex gap-2 border-3 border-ink bg-yellow p-3 text-sm leading-snug">
                          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {p.stavText && (
              <Alert variant="info">
                <AlertTitle>Stav</AlertTitle>
                <AlertDescription>{p.stavText}</AlertDescription>
              </Alert>
            )}

            <Separator />

            <SheetFooter className="flex-row flex-wrap gap-3 sm:justify-start">
              {p.url && (
                <Button asChild variant="outline">
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {domena(p.url)} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              )}
              <Button
                variant="accent"
                onClick={() => {
                  onOpenChange(false);
                  window.setTimeout(() => chod('vysetrenie'), 250);
                }}
              >
                <Stethoscope className="h-4 w-4" aria-hidden="true" /> Ďalší chorobopis: tvoj
              </Button>
            </SheetFooter>
            {p.url && <p className="-mt-3 font-mono text-[11px]">Odkaz overený {OVERENE_DNA_TEXT}.</p>}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
