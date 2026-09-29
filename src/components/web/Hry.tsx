/** Hry ako showcase: Škrtací test sa dá hrať priamo na domove v Dialógu (hra sa načíta až pri otvorení, React.lazy),
 *  ďalšie dve hry sú poctivo „v stavbe“ s Popoverom namiesto mŕtveho odkazu (/hry/ dáva len názvy).
 *  BoldKit: Dialog, Popover, Badge, Sticker. Ostrov: client:visible. */
import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sticker } from '@/components/ui/sticker';

const SkrtaciTest = React.lazy(() => import('@/components/hry/SkrtaciTest'));

const BTN = 'press inline-flex min-h-12 items-center gap-2 border-3 border-ink px-5 font-display text-base font-extrabold uppercase shadow-brutal-sm';

export default function Hry({ skrtText }: { skrtText: string }) {
  return (
    <ul className="grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
      <li className="relative flex flex-col gap-5 border-3 border-ink bg-yellow p-6 shadow-brutal-lg sm:p-8">
        <p className="font-mono text-sm uppercase tracking-[0.14em]">Hra 01 · hraj hneď</p>
        <h3 className="font-display text-[clamp(2.4rem,1.6rem+2.6vw,4rem)] leading-[0.9] font-extrabold uppercase">Škrtací test</h3>
        <p className="max-w-md text-lg leading-snug">{skrtText}</p>
        <div className="mt-auto flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className={`${BTN} bg-ink text-paper`}>
                Hrať tu <span aria-hidden="true">✂</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-paper" data-lenis-prevent>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl font-extrabold uppercase">Škrtací test</DialogTitle>
                <DialogDescription className="text-base text-ink">{skrtText}</DialogDescription>
              </DialogHeader>
              <React.Suspense fallback={<p className="font-mono text-sm uppercase tracking-[0.12em]">Načítavam hru…</p>}>
                <SkrtaciTest />
              </React.Suspense>
            </DialogContent>
          </Dialog>
          <a href="/hry/skrtaci-test/" className={`${BTN} bg-white`}>
            Celá stránka <span aria-hidden="true">→</span>
          </a>
        </div>
      </li>

      {[
        { cislo: '02', nazov: 'Miliarda → bilión' },
        { cislo: '03', nazov: 'Strach-o-meter' },
      ].map((h) => (
        <li key={h.cislo} className="tx-dots relative flex flex-col gap-5 border-3 border-ink bg-white p-6 shadow-brutal sm:p-8">
          <Sticker size="sm" rotation="slight-right" className="absolute -top-3 right-4">
            v stavbe
          </Sticker>
          <p className="font-mono text-sm uppercase tracking-[0.14em]">Hra {h.cislo}</p>
          <h3 className="font-display text-3xl leading-[0.95] font-extrabold uppercase">{h.nazov}</h3>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={`${BTN} mt-auto w-fit bg-paper`}>
                Čo to bude?
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-white">
              <p className="font-display text-lg font-extrabold uppercase">{h.nazov}</p>
              <p className="mt-2 text-sm">Hru práve staviam. Keď bude hotová, pribudne sem aj na /hry/.</p>
            </PopoverContent>
          </Popover>
        </li>
      ))}
    </ul>
  );
}
