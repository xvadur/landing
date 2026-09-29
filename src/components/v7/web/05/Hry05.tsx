/** V7-05 · Komiks — strana 4: hry ako showcase. Škrtací test sa hrá na mieste: desktop = dialóg, mobil = zásuvka
 *  (recept 1 z katalógu prekrytí, prevzatý a upravený). Hry v stavbe majú popover „Čo to bude?“ namiesto mŕtveho
 *  odkazu. Texty z v5/TextyHry.astro a src/pages/hry/. Ostrov: client:idle (paleta ⌘K otvára hru udalosťou). */
import * as React from 'react';
import { ArrowRight, Gamepad2, Scissors } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sticker } from '@/components/ui/sticker';
import { LayeredCard } from '@/components/ui/layered-card';
import { skrtni, UKAZKA, type Skrt } from '@/components/hry/skrtni';
import { HRY, UDALOST, vezmiCiel, type Ciel } from './data';
import { cn } from '@/lib/utils';

function useMaloOkno(query = '(max-width: 639px)') {
  const [malo, setMalo] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMalo(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return malo;
}

function NahladHry() {
  const [text, setText] = React.useState(UKAZKA);
  const [vysledok, setVysledok] = React.useState<Skrt | null>(() => skrtni(UKAZKA));
  return (
    <div className="grid gap-4">
      <label htmlFor="k05-skrt" className="eyebrow">
        Tvoj text
      </label>
      <Textarea id="k05-skrt" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="bg-white text-base" />
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
        <DrawerContent className="max-h-[92dvh]" data-lenis-prevent>
          <div className="overflow-y-auto px-4 pb-8">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle className="font-display text-2xl font-extrabold uppercase">{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-lenis-prevent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold uppercase">{title}</DialogTitle>
          <DialogDescription className="text-base text-ink/75">{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default function Hry05() {
  const [hra, setHra] = React.useState(false);

  React.useEffect(() => {
    if (vezmiCiel('hra')) setHra(true);
    const on = (ev: Event) => {
      const d = (ev as CustomEvent<Ciel>).detail;
      if (d?.typ === 'hra') {
        vezmiCiel('hra');
        setHra(true);
      }
    };
    window.addEventListener(UDALOST, on);
    return () => window.removeEventListener(UDALOST, on);
  }, []);

  return (
    <>
      <ol className="grid gap-6 md:grid-cols-3" role="list">
        {HRY.map((h, i) => (
          <li key={h.id} className={cn('relative', i === 0 && 'md:col-span-3 lg:col-span-1')}>
            <LayeredCard layers="single" offset="default" layerColor={h.href ? 'primary' : 'muted'} className="h-full">
              <div className={cn('relative flex min-h-64 flex-col gap-4 p-5 sm:p-6', h.href ? 'bg-yellow' : 'bg-white tx-halftone [--tx:18%]')}>
                {!h.href && (
                  <Sticker variant="outline" size="sm" rotation="medium-right" dashed className="absolute -top-3 right-3">
                    V stavbe
                  </Sticker>
                )}
                <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Hra {h.cislo}</p>
                <p className="font-display text-3xl leading-none font-extrabold uppercase">{h.nazov}</p>
                {h.text && <p className="text-base">{h.text}</p>}
                <div className="mt-auto flex flex-wrap gap-3">
                  {h.href ? (
                    <>
                      <Button onClick={() => setHra(true)} size="lg" data-open="k05-hra">
                        <Gamepad2 aria-hidden="true" /> Hrať tu
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <a href={h.href}>Celá hra</a>
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
            </LayeredCard>
          </li>
        ))}
      </ol>
      <Okno open={hra} onOpenChange={setHra}>
        <NahladHry />
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="accent">
            <a href="/hry/skrtaci-test/">
              Celá hra <ArrowRight aria-hidden="true" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/hry/">Všetky hry</a>
          </Button>
        </div>
      </Okno>
    </>
  );
}
