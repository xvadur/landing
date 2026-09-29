/** V7-01 · obrazovka Hry: „testy reflexov“ na monitore. Škrtací test sa hrá priamo na mieste (desktop Dialog,
 *  mobil Drawer) cez skrtni.ts; hry v stavbe majú Popover namiesto mŕtveho odkazu. Paleta ⌘K otvára hru udalosťou
 *  `m01:hra`. Texty z v5/TextyHry.astro a pages/hry. Kusy: dialog, drawer, popover, textarea, button, badge, sticker
 *  + React Bits CountUp. Ostrov: <Hry client:visible />. */
import * as React from 'react';
import { ArrowRight, Gamepad2, Scissors } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sticker } from '@/components/ui/sticker';
import CountUp from '@/components/vendor/reactbits/CountUp';
import { skrtni, UKAZKA, type Skrt } from '@/components/hry/skrtni';
import { KOTVY } from '@/data/fakty';
import { cn } from '@/lib/utils';
import { HRY } from './data';
import { useMaloOkno } from './klient';

function NahladHry() {
  const [text, setText] = React.useState(UKAZKA);
  const [vysledok, setVysledok] = React.useState<Skrt | null>(() => skrtni(UKAZKA));
  return (
    <div className="grid gap-4">
      <label htmlFor="m01-skrt" className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
        Tvoj text
      </label>
      <Textarea id="m01-skrt" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="bg-white text-base" />
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
      <div className="flex flex-wrap gap-3">
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

function Okno({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) {
  const malo = useMaloOkno();
  const title = 'Škrtací test';
  const description = 'Vlož svoj text. Škrtneme frázy, ktoré má každý. Beží iba v tvojom prehliadači.';
  if (malo)
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh] bg-paper">
          <div className="overflow-y-auto px-4 pb-8" data-lenis-prevent>
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle className="font-display text-2xl font-extrabold">{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper sm:max-w-2xl" data-lenis-prevent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold">{title}</DialogTitle>
          <DialogDescription className="text-base text-ink/75">{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default function Hry() {
  const [hra, setHra] = React.useState(false);
  React.useEffect(() => {
    const on = () => setHra(true);
    window.addEventListener('m01:hra', on);
    return () => window.removeEventListener('m01:hra', on);
  }, []);

  return (
    <>
      <ol className="grid gap-5 md:grid-cols-3" role="list">
        {HRY.map((h) => (
          <li
            key={h.id}
            className={cn(
              'relative flex min-h-72 flex-col gap-4 border-3 border-ink p-5 shadow-[6px_6px_0_0_var(--color-ink)]',
              h.href ? 'bg-yellow' : 'tx-halftone bg-white',
            )}
          >
            {!h.href && (
              <Sticker variant="outline" size="sm" rotation="medium-right" className="absolute -top-4 -right-2">
                V stavbe
              </Sticker>
            )}
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">Test {h.cislo}</p>
            <p className="font-display text-3xl leading-none font-extrabold uppercase">{h.nazov}</p>
            {h.href ? (
              <>
                <p className="flex items-baseline gap-2 font-display font-extrabold">
                  <CountUp to={KOTVY.kancelarieSFrazou.value} duration={1.2} className="text-5xl tabular-nums" />
                  <span className="text-xl">/ {KOTVY.kancelarieSFrazou.z}</span>
                </p>
                <p className="text-base">{h.text}</p>
              </>
            ) : (
              <p className="text-base">Popis doplní Adam, keď bude hra hotová.</p>
            )}
            <div className="mt-auto">
              {h.href ? (
                <Button onClick={() => setHra(true)} size="lg" className="w-full sm:w-auto">
                  <Gamepad2 aria-hidden="true" /> Hrať tu
                </Button>
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
          </li>
        ))}
      </ol>
      <Okno open={hra} onOpenChange={setHra}>
        <NahladHry />
      </Okno>
    </>
  );
}
