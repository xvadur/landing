/** V7-09 · Hry ako výstrižky na strihanie: Škrtací test sa hrá priamo na stránke (BoldKit Dialog na desktope,
 *  Drawer na mobile, logika skrtni.ts), hry v stavbe majú Popover namiesto mŕtveho odkazu. Paleta ⌘K otvára hru
 *  udalosťou z9:hra. Texty z v5/TextyHry.astro a /hry/. */
import * as React from 'react';
import { ArrowRight, Gamepad2, Scissors } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sticker } from '@/components/ui/sticker';
import { skrtni, UKAZKA, type Skrt } from '@/components/hry/skrtni';
import { cn } from '@/lib/utils';
import { HRY } from './data';
import { UDALOST, useMaloOkno } from './spolocne';

function NahladHry() {
  const [text, setText] = React.useState(UKAZKA);
  const [vysledok, setVysledok] = React.useState<Skrt | null>(() => skrtni(UKAZKA));
  return (
    <div className="grid gap-4">
      <label htmlFor="z9-skrt" className="font-mono text-xs font-bold tracking-[0.14em] uppercase">
        Tvoj text
      </label>
      <Textarea id="z9-skrt" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="bg-white text-base" />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setVysledok(skrtni(text))} disabled={!text.trim()}>
          <Scissors aria-hidden="true" /> Škrtni
        </Button>
        {vysledok && (
          <p className="font-mono text-sm" aria-live="polite">
            škrtov {vysledok.skrtov} · ostalo {vysledok.zostaloSlov} z {vysledok.povodneSlova} slov
          </p>
        )}
      </div>
      {vysledok && (
        <p className="border-3 border-ink bg-white p-4 text-base leading-relaxed">
          {vysledok.segmenty.map((s, i) =>
            s.typ === 'text' ? (
              <React.Fragment key={i}>{s.text}</React.Fragment>
            ) : (
              <s key={i} className="text-ink/50 decoration-stamp decoration-[3px]">
                {s.text}
              </s>
            ),
          )}
        </p>
      )}
      <div className="flex flex-wrap gap-3 pt-1">
        <Button asChild variant="accent">
          <a href="/hry/skrtaci-test/">
            Celá hra <ArrowRight aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href="/hry/">Všetky hry</a>
        </Button>
      </div>
    </div>
  );
}

export default function Hry() {
  const [open, setOpen] = React.useState(false);
  const malo = useMaloOkno();

  React.useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener(UDALOST.hra, on);
    return () => window.removeEventListener(UDALOST.hra, on);
  }, []);

  const nazov = 'Škrtací test';
  const popis = 'Vlož svoj text. Škrtneme frázy, ktoré má každý. Beží iba v tvojom prehliadači.';

  return (
    <>
      <ol className="grid gap-10 md:grid-cols-3 md:gap-6" role="list">
        {HRY.map((h, i) => (
          <li key={h.id} className="z9-list relative" style={{ ['--r' as string]: `${[-2, 1.5, -1][i]}deg`, ['--r0' as string]: `${i % 2 ? -10 : 10}deg` }}>
            <span className="z9-paska" style={{ ['--pr' as string]: `${i % 2 ? 5 : -5}deg`, left: '38%', top: '-0.85rem' }} />
            <div className={cn('z9-strih relative flex min-h-72 flex-col gap-4 p-6', h.href ? 'bg-yellow' : 'z9-raster bg-white')}>
              <span aria-hidden="true" className="absolute -top-3.5 left-4 bg-paper px-1 font-mono text-lg leading-none">
                ✂
              </span>
              {!h.href && (
                <Sticker variant="outline" size="sm" rotation="medium-right" className="absolute -top-4 -right-2">
                  V stavbe
                </Sticker>
              )}
              <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Hra {h.cislo}</p>
              <p className={cn('font-display text-4xl leading-[0.9] font-extrabold uppercase', !h.href && 'w-fit bg-white px-1')}>{h.nazov}</p>
              {h.text && <p className="text-base leading-snug">{h.text}</p>}
              <div className="mt-auto">
                {h.href ? (
                  <Button onClick={() => setOpen(true)} size="lg" className="max-w-full">
                    <Gamepad2 aria-hidden="true" /> Hrať tu
                  </Button>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="bg-white">
                        Čo to bude?
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 max-w-[calc(100vw-2rem)]">
                      <p className="font-display text-lg font-extrabold uppercase">{h.nazov}</p>
                      <p className="mt-1 text-sm">V stavbe. Popis doplní Adam, keď bude hra hotová.</p>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {malo ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[92dvh]">
            <div className="overflow-y-auto px-4 pb-8" data-lenis-prevent>
              <DrawerHeader className="px-0 text-left">
                <DrawerTitle className="font-display text-2xl font-extrabold uppercase">{nazov}</DrawerTitle>
                <DrawerDescription>{popis}</DrawerDescription>
              </DrawerHeader>
              <NahladHry />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-extrabold uppercase">{nazov}</DialogTitle>
              <DialogDescription className="text-base text-ink/75">{popis}</DialogDescription>
            </DialogHeader>
            <NahladHry />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
