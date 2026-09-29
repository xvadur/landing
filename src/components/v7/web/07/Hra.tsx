/** V7-07 · Herňa: Škrtací test hrateľný na mieste (skrtni.ts z /hry/), desktop = dialóg, mobil = drawer.
 *  Recept z katalógu (v7/kit/prekrytia/Recepty.tsx, „Hry ako showcase“) skopírovaný a upravený. */
import * as React from 'react';
import { ArrowRight, Scissors } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { skrtni, UKAZKA, type Skrt } from '@/components/hry/skrtni';
import { HRA } from './data';
import { useMaloOkno } from './kontext';

function Nahlad() {
  const [text, setText] = React.useState(UKAZKA);
  const [vysledok, setVysledok] = React.useState<Skrt | null>(() => skrtni(UKAZKA));
  return (
    <div className="grid gap-4">
      <label htmlFor="v07-skrt" className="font-mono text-xs font-bold tracking-[0.14em] uppercase">
        Tvoj text
      </label>
      <Textarea id="v07-skrt" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="text-base" />
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
          <a href={HRA.href}>
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

export function Hra({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const malo = useMaloOkno();
  const titulok = HRA.nazov;
  const popis = 'Vlož svoj text. Škrtneme frázy, ktoré má každý. Beží iba v tvojom prehliadači.';
  if (malo)
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh]">
          <div className="overflow-y-auto px-4 pb-8" data-lenis-prevent>
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle className="font-display text-2xl font-extrabold uppercase">{titulok}</DrawerTitle>
              <DrawerDescription>{popis}</DrawerDescription>
            </DrawerHeader>
            {open && <Nahlad />}
          </div>
        </DrawerContent>
      </Drawer>
    );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-lenis-prevent>
        <DialogHeader>
          <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Pavilón D · Herňa · hra 01</p>
          <DialogTitle className="font-display text-3xl font-extrabold uppercase">{titulok}</DialogTitle>
          <DialogDescription className="text-base text-ink/75">{popis}</DialogDescription>
        </DialogHeader>
        {open && <Nahlad />}
      </DialogContent>
    </Dialog>
  );
}
