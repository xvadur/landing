/** V7-08 · okno Hry = priečinok so spúšťačmi. Škrtací test sa hrá na mieste (dialóg na desktope, drawer na mobile —
 *  prekrytie žije v Shell ostrove, sem ide udalosť), hry v stavbe majú popover namiesto mŕtveho odkazu.
 *  Texty z v5/TextyHry.astro a src/pages/hry/index.astro (HRY). */
import { ArrowRight, Gamepad2, Gauge, Layers, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sticker } from '@/components/ui/sticker';
import { BurstShape } from '@/components/ui/shapes';
import Okno from './Okno';
import { HRY } from './data';
import { posli } from './store';

const IKONY = { 'skrtaci-test': Scissors, 'miliarda-bilion': Layers, 'strach-o-meter': Gauge } as const;

export default function OknoHry() {
  return (
    <Okno id="hry" ikona={<Gamepad2 />} className="lg:col-span-5 lg:mt-16 lg:-translate-x-4" stav={<>HRY.EXE · 1 beží · 2 v stavbe</>}>
      <div className="relative flex flex-col gap-5 overflow-hidden p-4 sm:p-6">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.16em] uppercase">Hry · showcase</p>
          <p className="font-display text-3xl leading-[0.9] font-extrabold tracking-tight uppercase">Veci, ktoré si vyskúšaš namiesto brožúry.</p>
          <p className="mt-3 text-base">Ďalšie hry staviam. Jedna už beží: vlož svoj text a škrtneme frázy, ktoré má každý.</p>
        </div>
        <ul className="grid list-none gap-4 p-0">
          {HRY.map((h) => {
            const Ikona = IKONY[h.id as keyof typeof IKONY] ?? Gamepad2;
            return (
              <li key={h.id} className={`relative flex gap-4 border-3 border-ink p-4 ${h.href ? 'bg-yellow shadow-[5px_5px_0_0_var(--color-ink)]' : 'tx-halftone bg-white [--tx:12%]'}`}>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center border-3 border-ink bg-white" aria-hidden="true">
                  <Ikona className="h-7 w-7" strokeWidth={2.5} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="font-mono text-[11px] font-bold tracking-wider uppercase">Hra {h.cislo}</p>
                  <p className="font-display text-2xl leading-none font-extrabold uppercase">{h.nazov}</p>
                  {h.text && <p className="text-sm leading-snug">{h.text}</p>}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {h.href ? (
                      <>
                        <Button size="default" onClick={() => posli({ typ: 'hra' })}>
                          <Scissors aria-hidden="true" /> Hrať tu
                        </Button>
                        <Button asChild variant="outline">
                          <a href={h.href}>
                            Celá hra <ArrowRight aria-hidden="true" />
                          </a>
                        </Button>
                      </>
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">Čo to bude?</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 max-w-[calc(100vw-2rem)]">
                          <p className="font-display text-lg font-extrabold uppercase">{h.nazov}</p>
                          <p className="mt-1 text-sm">V stavbe. Popis doplní Adam, keď bude hra hotová.</p>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
                {!h.href && (
                  <Sticker variant="outline" size="sm" rotation="medium-right" className="absolute -top-3 right-3">
                    V stavbe
                  </Sticker>
                )}
              </li>
            );
          })}
        </ul>
        <Button asChild variant="outline" className="w-fit">
          <a href="/hry/">Všetky hry</a>
        </Button>
        <BurstShape size={120} color="var(--color-yellow)" animation="spin-step" speed="slow" className="pointer-events-none absolute -right-8 -bottom-10 opacity-90" />
      </div>
    </Okno>
  );
}
