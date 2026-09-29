/** V7-10 · Podnos 06 · Hry. Recept prekrytia 1: Škrtací test sa hrá na mieste (dialóg na desktope, zásuvka na mobile,
 *  skrtni.ts beží iba v prehliadači), hry v stavbe majú popover namiesto mŕtveho odkazu. Texty: v5/TextyHry.astro. */
import * as React from 'react';
import { ArrowRight, Gamepad2, Scissors } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sticker } from '@/components/ui/sticker';
import { MathCurveBackground } from '@/components/ui/math-curve-background';
import { skrtni, UKAZKA, type Skrt } from '@/components/hry/skrtni';
import { Dlazdica, Etiketa } from './Dlazdica';
import { HRY, UDALOST } from './data';

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
      <label htmlFor="v710-skrt" className="eyebrow">
        Tvoj text
      </label>
      <Textarea id="v710-skrt" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="bg-white text-base" />
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

function Okno({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const malo = useMaloOkno();
  const nazov = 'Škrtací test';
  const popis = 'Vlož svoj text. Škrtneme frázy, ktoré má každý. Beží iba v tvojom prehliadači.';
  if (malo)
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
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
    );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-lenis-prevent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold uppercase">{nazov}</DialogTitle>
          <DialogDescription className="text-base text-ink/75">{popis}</DialogDescription>
        </DialogHeader>
        <NahladHry />
      </DialogContent>
    </Dialog>
  );
}

export default function Hry() {
  const [hra, setHra] = React.useState(false);
  React.useEffect(() => {
    const on = () => setHra(true);
    window.addEventListener(UDALOST.hra, on);
    return () => window.removeEventListener(UDALOST.hra, on);
  }, []);
  const [skrtaci, ...vStavbe] = HRY;

  return (
    <div className="v10-mriezka">
      <Dlazdica tone="paper" className="col-span-2 md:col-span-6 lg:col-span-4 lg:row-span-2" stitok="H-00" bezMagnetu innerClassName="tx-dots [--tx:16%]">
        <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <Etiketa cislo="06" nazov="Hry" />
          <h2 className="font-display text-[clamp(2rem,1.3rem+2.2vw,3rem)] leading-[0.9] font-extrabold tracking-tight uppercase">
            Veci, ktoré si vyskúšaš namiesto brožúry.
          </h2>
          <p className="mt-auto text-lg leading-snug">Ďalšie hry staviam. Jedna už beží: vlož svoj text a škrtneme frázy, ktoré má každý.</p>
        </div>
      </Dlazdica>

      {/* hrateľná: 5 × 2 */}
      <Dlazdica tone="yellow" className="col-span-2 md:col-span-6 lg:col-span-5 lg:row-span-2" stitok={`H-${skrtaci!.cislo} · hrá sa tu`}>
        <div className="relative flex h-full flex-col gap-3 overflow-hidden p-5 sm:p-6">
          <MathCurveBackground curve="lissajous" speed="slow" opacity={0.28} trackColor="var(--color-ink)" headColor="var(--color-ink)" className="absolute inset-0" aria-hidden="true" />
          <p className="relative eyebrow">Hra {skrtaci!.cislo}</p>
          <h3 className="relative font-display text-[clamp(2.4rem,1.5rem+2.6vw,3.8rem)] leading-[0.88] font-extrabold tracking-tight uppercase">{skrtaci!.nazov}</h3>
          <p className="relative max-w-md text-base leading-snug">{skrtaci!.text}</p>
          <div className="relative mt-auto flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setHra(true)}>
              <Gamepad2 aria-hidden="true" /> Hrať tu
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/hry/">Všetky hry</a>
            </Button>
          </div>
        </div>
      </Dlazdica>

      {vStavbe.map((h) => (
        <Dlazdica key={h.id} tone="white" className="col-span-1 md:col-span-3 lg:col-span-3" innerClassName="tx-halftone [--tx:10%]" stitok={`H-${h.cislo}`}>
          <div className="flex h-full flex-col gap-2 p-4 sm:p-5">
            <Sticker variant="outline" size="sm" rotation="slight" className="w-fit">
              V stavbe
            </Sticker>
            <h3 className="font-display text-xl leading-[0.95] font-extrabold uppercase sm:text-2xl">{h.nazov}</h3>
            <div className="mt-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Čo to bude?
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 max-w-[calc(100vw-2rem)]">
                  <p className="font-display text-lg font-extrabold uppercase">{h.nazov}</p>
                  <p className="mt-1 text-sm">V stavbe. Popis doplní Adam, keď bude hra hotová.</p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Dlazdica>
      ))}

      <Okno open={hra} onOpenChange={setHra} />
    </div>
  );
}
