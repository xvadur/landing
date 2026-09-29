/** V7-09 · Navigácia: páska cez hornú hranu (logo, kotvy zinu, „Kam? ⌘K“, vyšetrenie) + paleta celého ekosystému
 *  (BoldKit Dialog + Command, filter bez diakritiky) + toaster variantu (BoldKit sonner) + tooltip.
 *  ⌘K / Ctrl K sa zachytí vo fáze capture na window, takže site CommandK z Base sa na tejto stránke neotvorí.
 *  Položky palety otvárajú hru, chorobopis a vyšetrenie na mieste (udalosti z spolocne.ts), von vedú iba odkazy. */
import * as React from 'react';
import { ArrowRight, BookOpen, Bug, Database, Gamepad2, Menu, Newspaper, Scissors, Search, Stethoscope, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Toaster } from '@/components/ui/sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrambleHover } from '@/components/vendor/fancy/text/scramble-hover';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import { KORPUS } from '@/data/fakty';
import { VLAJKA } from '@/data/ponuka';
import { TOASTER, UDALOST, posli, scrollNa } from './spolocne';

const KOTVY = [
  { id: 'kto-som', label: 'Kto som' },
  { id: 'chorobopisy', label: 'Chorobopisy' },
  { id: 'liecba', label: 'Liečba' },
  { id: 'hry', label: 'Hry' },
  { id: 'texty', label: 'Texty' },
];

const STRANA = [
  { id: 'prijem', label: 'Príjem', kw: ['úvod', 'hero', 'adam'] },
  { id: 'vitalne', label: 'Vitálne funkcie', kw: ['korpus', 'čísla', 'pulz'] },
  { id: 'kto-som', label: 'Kto som', kw: ['anamnéza', 'cesta', 'bio'] },
  { id: 'manifest', label: 'Manifest', kw: ['tézy', 'zápisky'] },
  { id: 'chorobopisy', label: 'Chorobopisy', kw: ['projekty', 'jakub', 'lucia'] },
  { id: 'liecba', label: 'Liečba', kw: ['služby', 'triáž', 'agent'] },
  { id: 'zapis', label: 'Zápis e-mailu', kw: ['newsletter', 'vydanie', 'návod'] },
];

export default function Navigacia({ posledny }: { posledny: { id: string; title: string } | null }) {
  const [paleta, setPaleta] = React.useState(false);
  const [mac, setMac] = React.useState(true);

  React.useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        setPaleta((o) => !o);
      }
    };
    const onOpen = () => setPaleta(true);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener(UDALOST.paleta, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener(UDALOST.paleta, onOpen);
    };
  }, []);

  /** Paleta sa najprv zavrie, potom sa otvorí cieľ (dva modály naraz = dva fokus trapy). */
  const potom = (f: () => void) => () => {
    setPaleta(false);
    window.setTimeout(f, 80);
  };
  const choď = (href: string, von = false) => () => {
    setPaleta(false);
    if (von) window.open(href, '_blank', 'noopener,noreferrer');
    else window.location.assign(href);
  };
  const P = 'min-h-11 text-base';

  return (
    <TooltipProvider delayDuration={200}>
      <header className="fixed inset-x-0 top-0 z-50 border-b-3 border-ink bg-paper">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-10">
          <a href="#prijem" className="flex min-h-11 items-center gap-2" aria-label="XVADUR — na začiatok zinu">
            <img src="/brand/x.svg" alt="" width="28" height="28" className="h-7 w-7 -rotate-6" />
            <img src="/brand/xvadur-ink.svg" alt="" width="110" height="21" className="hidden h-[21px] w-auto sm:block" />
            <span className="rounded-none border-2 border-ink bg-yellow px-1.5 font-mono text-[11px] font-bold tracking-[0.18em] uppercase">zin</span>
          </a>

          <nav aria-label="Zin" className="hidden items-center gap-1 lg:flex">
            {KOTVY.map((k) => (
              <a
                key={k.id}
                href={`#${k.id}`}
                className="flex min-h-11 items-center px-3 font-mono text-sm font-bold tracking-[0.12em] uppercase hover:bg-yellow focus-visible:bg-yellow"
              >
                <ScrambleHover text={k.label} scrambleSpeed={40} maxIterations={6} />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setPaleta(true)} className="gap-2 bg-white px-3" aria-label="Kam chceš ísť? Paleta ekosystému XVADUR">
                  <Search aria-hidden="true" className="size-4" />
                  <span className="font-mono text-xs font-bold tracking-[0.12em] uppercase">Kam?</span>
                  <Kbd size="sm" className="hidden sm:inline-flex">
                    {mac ? '⌘K' : 'Ctrl K'}
                  </Kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Texty, Hriech, Netopier, Korpus, hry, vyšetrenie</TooltipContent>
            </Tooltip>
            <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
              <a href="#vysetrenie">
                Vyšetrenie <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <button
              type="button"
              data-nav-open
              className="press flex h-11 w-11 items-center justify-center border-3 border-ink bg-white shadow-brutal-sm lg:hidden"
              aria-label="Otvoriť menu"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
        <div aria-hidden="true" className="z9-cita h-1.5 origin-left bg-stamp" />
      </header>

      <Dialog open={paleta} onOpenChange={setPaleta}>
        <DialogContent hideClose className="top-[10%] translate-y-0 gap-0 p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Kam chceš ísť?</DialogTitle>
          <DialogDescription className="sr-only">Ekosystém XVADUR: texty, Hriech, Netopier, Korpus, hry, vyšetrenie</DialogDescription>
          <Command loop label="Kam chceš ísť?">
            <CommandInput placeholder="Hriech, Korpus, škrtací test, vyšetrenie…" />
            <CommandList className="max-h-[60dvh]">
              <CommandEmpty>Nič také tu nie je.</CommandEmpty>
              <CommandGroup heading="Ekosystém">
                <CommandItem className={P} value="Hriech" keywords={['diagnóza', 'médiá', 'kritika']} onSelect={potom(() => posli(UDALOST.projekt, 'hriech'))}>
                  <Newspaper aria-hidden="true" /> Hriech <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="hriech.xvadur.com" keywords={['hriech', 'web']} onSelect={choď('https://hriech.xvadur.com/', true)}>
                  <Newspaper aria-hidden="true" /> hriech.xvadur.com <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Netopier" keywords={['prepisy', 'overovanie', 'médiá']} onSelect={potom(() => posli(UDALOST.projekt, 'netopier'))}>
                  <Bug aria-hidden="true" /> Netopier <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Korpus" keywords={['slová', 'prompty', 'vitálne']} onSelect={potom(() => posli(UDALOST.projekt, 'korpus'))}>
                  <Database aria-hidden="true" /> Korpus <CommandShortcut>{KORPUS.slova} slov</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Štatistiky Korpusu" keywords={['vitálne', 'čísla', 'korpus']} onSelect={choď('/vitalne/')}>
                  <Database aria-hidden="true" /> Štatistiky Korpusu <CommandShortcut>/vitalne/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Jakub, maklér" keywords={['crm', 'rezervácie', 'pacient']} onSelect={potom(() => posli(UDALOST.projekt, 'system-pre-maklera'))}>
                  <User aria-hidden="true" /> Jakub, maklér
                </CommandItem>
                <CommandItem className={P} value="Lucia, terapeutka" keywords={['web', 'rezervácie', 'pacient']} onSelect={potom(() => posli(UDALOST.projekt, 'terapeutka'))}>
                  <User aria-hidden="true" /> Lucia, terapeutka
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Hry">
                <CommandItem className={P} value="Škrtací test" keywords={['hra', 'frázy']} onSelect={potom(() => posli(UDALOST.hra, 'skrtaci-test'))}>
                  <Scissors aria-hidden="true" /> Škrtací test <CommandShortcut>hrať tu</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Všetky hry" onSelect={choď('/hry/')}>
                  <Gamepad2 aria-hidden="true" /> Všetky hry <CommandShortcut>/hry/</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Texty">
                {posledny && (
                  <CommandItem className={P} value={posledny.title} keywords={['text', 'článok']} onSelect={choď(`/texty/${posledny.id}/`)}>
                    <BookOpen aria-hidden="true" /> {posledny.title}
                  </CommandItem>
                )}
                <CommandItem className={P} value="Všetky texty" keywords={['články']} onSelect={choď('/texty/')}>
                  <BookOpen aria-hidden="true" /> Všetky texty <CommandShortcut>/texty/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Substack" keywords={['newsletter', 'vydanie']} onSelect={choď(SUBSTACK_URL, true)}>
                  <BookOpen aria-hidden="true" /> Substack <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="V tomto zine">
                <CommandItem className={P} value="Vyšetrenie" keywords={['konzultácia', 'termín', 'rezervácia']} onSelect={potom(() => scrollNa('vysetrenie'))}>
                  <Stethoscope aria-hidden="true" /> Vyšetrenie <CommandShortcut>{VLAJKA.trvanie}</CommandShortcut>
                </CommandItem>
                {STRANA.map((s) => (
                  <CommandItem key={s.id} className={P} value={s.label} keywords={s.kw} onSelect={potom(() => scrollNa(s.id))}>
                    <ArrowRight aria-hidden="true" /> {s.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <Toaster id={TOASTER} position="bottom-center" />
    </TooltipProvider>
  );
}
