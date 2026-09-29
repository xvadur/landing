/** V7-05 · Komiks — lišta zošita (strany 1–7) + paleta ⌘K „Kam chceš ísť?“ do celého ekosystému XVADUR
 *  (texty, Hriech, Netopier, Korpus, hry, vyšetrenie). Hra a epizódy sa otvoria na mieste (udalosť k05:otvor),
 *  von vedú iba texty a overené odkazy. Recept 3 z katalógu prekrytí (Dialog + Command, filter bez diakritiky),
 *  prevzatý a upravený. Nesie aj Toaster variantu (id k05). Ostrov: client:load. */
import * as React from 'react';
import { ArrowRight, BookOpen, Database, Gamepad2, Menu, Newspaper, Scissors, Stethoscope, Bug, User, BarChart3, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { KbdCombo } from '@/components/ui/kbd';
import { Toaster } from '@/components/ui/sonner';
import { ScrambleHover } from '@/components/vendor/fancy/text/scramble-hover';
import { VLAJKA } from '@/data/ponuka';
import { KORPUS } from '@/data/fakty';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import { STRANY, TOASTER, otvor, posunNa } from './data';

export type Posledny = { id: string; title: string } | null;

function Stranka({ id, cislo, label }: { id: string; cislo: string; label: string }) {
  const [akt, setAkt] = React.useState(false);
  return (
    <a
      href={`#${id}`}
      onMouseEnter={() => setAkt(true)}
      onMouseLeave={() => setAkt(false)}
      onFocus={() => setAkt(true)}
      onBlur={() => setAkt(false)}
      className="inline-flex min-h-11 items-center gap-1.5 border-3 border-transparent px-2 font-display text-sm font-extrabold uppercase hover:border-ink hover:bg-white focus-visible:border-ink"
    >
      <span className="font-mono text-xs text-ink/60">{cislo}</span>
      <ScrambleHover text={label} active={akt} scrambleSpeed={40} maxIterations={6} sequential revealDirection="start" />
    </a>
  );
}

export default function Nav05({ posledny }: { posledny: Posledny }) {
  const [paleta, setPaleta] = React.useState(false);

  // ⌘K / Ctrl K: paleta variantu predbehne site/CommandK (window capture + stopPropagation)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        setPaleta((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  /** Paleta sa zavrie, potom akcia (dva modály naraz = dva fokus trapy). */
  const z = (f: () => void) => () => {
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
    <>
      <header className="k-lista sticky top-0 z-40 border-b-3 border-ink bg-paper">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#prijem" className="flex min-h-11 shrink-0 items-center gap-2" aria-label="XVADUR — začiatok zošita">
            <img src="/brand/x.svg" alt="" width="30" height="36" className="h-8 w-auto" />
            <img src="/brand/xvadur-ink.svg" alt="XVADUR" width="120" height="23" className="hidden h-5 w-auto sm:block" />
          </a>
          <nav aria-label="Strany zošita" className="hidden items-center gap-0.5 xl:flex">
            {STRANY.map((s) => (
              <Stranka key={s.id} {...s} />
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setPaleta(true)} className="px-3 normal-case sm:px-4" aria-label="Kam chceš ísť? Paleta príkazov">
              <Menu aria-hidden="true" />
              <span className="font-display font-extrabold uppercase">Kam?</span>
              <KbdCombo keys={['⌘', 'K']} size="sm" className="hidden md:inline-flex" />
            </Button>
            <Button asChild variant="accent" className="px-3 sm:px-5">
              <a href="#vysetrenie" data-track="konzultacia_klik" data-track-miesto="v7-05-lista">
                Vyšetrenie
              </a>
            </Button>
          </div>
        </div>
      </header>

      <Toaster id={TOASTER} position="bottom-center" />

      <Dialog open={paleta} onOpenChange={setPaleta}>
        <DialogContent hideClose className="top-[10%] translate-y-0 gap-0 p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Kam chceš ísť?</DialogTitle>
          <DialogDescription className="sr-only">Ekosystém XVADUR: strany zošita, texty, Hriech, Netopier, Korpus, hry, vyšetrenie</DialogDescription>
          <Command loop label="Kam chceš ísť?">
            <CommandInput placeholder="Hry, Hriech, Korpus, texty, vyšetrenie…" />
            <CommandList className="max-h-[60dvh]" data-lenis-prevent>
              <CommandEmpty>Nič také tu nie je.</CommandEmpty>
              <CommandGroup heading="Vyšetrenie">
                <CommandItem className={P} value="Vyšetrenie" keywords={['konzultácia', 'termín', 'rezervácia']} onSelect={z(() => posunNa('vysetrenie'))}>
                  <Stethoscope aria-hidden="true" /> Objednaj sa na vyšetrenie <CommandShortcut>{VLAJKA.trvanie}</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Strany zošita">
                {STRANY.filter((s) => s.id !== 'vysetrenie').map((s) => (
                  <CommandItem key={s.id} className={P} value={`Strana ${s.cislo} ${s.label}`} onSelect={z(() => posunNa(s.id))}>
                    <span className="font-mono text-xs" aria-hidden="true">
                      {s.cislo}
                    </span>{' '}
                    {s.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Hry">
                <CommandItem className={P} value="Škrtací test" keywords={['hra', 'frázy']} onSelect={z(() => otvor({ typ: 'hra', id: 'skrtaci-test' }))}>
                  <Scissors aria-hidden="true" /> Škrtací test <CommandShortcut>hrať tu</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Všetky hry" onSelect={choď('/hry/')}>
                  <Gamepad2 aria-hidden="true" /> Všetky hry <CommandShortcut>/hry/</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Médiá">
                <CommandItem className={P} value="Hriech" keywords={['diagnóza', 'médiá']} onSelect={z(() => otvor({ typ: 'projekt', id: 'hriech' }))}>
                  <Newspaper aria-hidden="true" /> Hriech <CommandShortcut>epizóda</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="hriech.xvadur.com" keywords={['hriech', 'web']} onSelect={choď('https://hriech.xvadur.com/', true)}>
                  <Newspaper aria-hidden="true" /> hriech.xvadur.com <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Netopier" keywords={['prepisy', 'overovanie', 'médiá']} onSelect={z(() => otvor({ typ: 'projekt', id: 'netopier' }))}>
                  <Bug aria-hidden="true" /> Netopier <CommandShortcut>epizóda</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Dáta a pacienti">
                <CommandItem className={P} value="Korpus" keywords={['slová', 'prompty', 'vitálne funkcie']} onSelect={z(() => otvor({ typ: 'projekt', id: 'korpus' }))}>
                  <Database aria-hidden="true" /> Korpus <CommandShortcut>{KORPUS.slova} slov</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Štatistiky Korpusu" keywords={['vitálne', 'čísla']} onSelect={choď('/vitalne/')}>
                  <BarChart3 aria-hidden="true" /> Štatistiky Korpusu <CommandShortcut>/vitalne/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Jakub, maklér" keywords={['crm', 'rezervácie']} onSelect={z(() => otvor({ typ: 'projekt', id: 'system-pre-maklera' }))}>
                  <User aria-hidden="true" /> Jakub, maklér
                </CommandItem>
                <CommandItem className={P} value="Lucia, terapeutka" keywords={['web', 'rezervácie']} onSelect={z(() => otvor({ typ: 'projekt', id: 'terapeutka' }))}>
                  <User aria-hidden="true" /> Lucia, terapeutka
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Texty">
                {posledny && (
                  <CommandItem className={P} value={posledny.title} keywords={['text', 'článok']} onSelect={choď(`/texty/${posledny.id}/`)}>
                    <BookOpen aria-hidden="true" /> {posledny.title}
                  </CommandItem>
                )}
                <CommandItem className={P} value="Všetky texty" onSelect={choď('/texty/')}>
                  <BookOpen aria-hidden="true" /> Všetky texty <CommandShortcut>/texty/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Substack" onSelect={choď(SUBSTACK_URL, true)}>
                  <BookOpen aria-hidden="true" /> Substack <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Odber e-mailom" keywords={['newsletter', 'vydanie', 'zápis']} onSelect={z(() => posunNa('zapis'))}>
                  <Mail aria-hidden="true" /> Odber e-mailom <CommandShortcut>
                    <ArrowRight className="inline size-3" aria-hidden="true" />
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
