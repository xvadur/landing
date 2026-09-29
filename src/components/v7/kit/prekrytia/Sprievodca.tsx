/** Kit · Prekrytia: tour.tsx — sprievodca s reflektorom: placement top/right/bottom/left/center, spotlightPadding,
 *  showProgress, showSkipButton, onComplete/onSkip, content s useTour() (skok na krok). Prechádza sekcie tejto stránky.
 *  Popisky tlačidiel BoldKitu sú natvrdo anglicky (Skip Tour, Previous, Next, Finish) — slovenský recept je v Recepty.tsx. */
import * as React from 'react';
import { toast } from 'sonner';
import { Tour, useTour, type TourStep } from '@/components/ui/tour';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Blok, KIT_TOASTER, Kus, Stav } from './spolocne';

function Skoky() {
  const { goToStep, currentStep } = useTour();
  return (
    <div className="flex flex-wrap gap-2" aria-label="Skok na krok">
      {['dialog', 'sheet', 'command', 'sonner', 'stred'].map((m, i) => (
        <button
          key={m}
          type="button"
          onClick={() => goToStep(i)}
          aria-current={i === currentStep ? 'step' : undefined}
          className="min-h-9 border-2 border-ink px-2 font-mono text-xs aria-[current=step]:bg-yellow"
        >
          {m}
        </button>
      ))}
    </div>
  );
}

const KROKY: TourStep[] = [
  { target: '#dialog-h', title: 'dialog', description: 'placement=bottom. Reflektor okolo nadpisu, zvyšok stmavne.', placement: 'bottom' },
  { target: '#sheet-h', title: 'sheet', description: 'placement=right, spotlightPadding=20.', placement: 'right', spotlightPadding: 20 },
  { target: '#command-h', title: 'command', description: 'placement=top. Keď sa nezmestí, preklopí sa.', placement: 'top' },
  { target: '#sonner-h', title: 'sonner', description: 'placement=left, na úzkom displeji preklopí doprava.', placement: 'left' },
  { target: '#tour-h', title: 'center', description: 'placement=center: okno v strede, bez ohľadu na cieľ. content = vlastné JSX s useTour().', placement: 'center', content: <Skoky /> },
];

export default function Sprievodca() {
  const [open, setOpen] = React.useState(false);
  const [progres, setProgres] = React.useState(true);
  const [preskocit, setPreskocit] = React.useState(true);

  return (
    <Kus
      id="tour"
      meno="tour"
      subor="src/components/ui/tour.tsx"
      veta="Sprievodca po stránke: stmaví všetko okrem jedného miesta a pri ňom ukáže okno s krokmi. Fokus drží v sebe, Esc zatvára."
    >
      <Blok nazov="Prehliadka tohto katalógu · 5 krokov" pozn="Ciele sú nadpisy sekcií (#dialog-h …). Ukážka so všetkými štyrmi stranami a stredom.">
        <div className="flex flex-wrap items-center gap-4">
          <Stav>{open ? 'otvorené' : 'zatvorené'}</Stav>
          <Button onClick={() => setOpen(true)} data-open="tour">
            Spustiť sprievodcu
          </Button>
          <div className="flex min-h-11 items-center gap-2">
            <Switch id="kit-tour-progres" checked={progres} onCheckedChange={setProgres} />
            <Label htmlFor="kit-tour-progres">showProgress</Label>
          </div>
          <div className="flex min-h-11 items-center gap-2">
            <Switch id="kit-tour-skip" checked={preskocit} onCheckedChange={setPreskocit} />
            <Label htmlFor="kit-tour-skip">showSkipButton</Label>
          </div>
        </div>
        <Tour
          steps={KROKY}
          open={open}
          onOpenChange={setOpen}
          showProgress={progres}
          showSkipButton={preskocit}
          onComplete={() => toast.success('Sprievodca dokončený', { toasterId: KIT_TOASTER })}
          onSkip={() => toast('Sprievodca preskočený', { toasterId: KIT_TOASTER })}
        />
      </Blok>
    </Kus>
  );
}
