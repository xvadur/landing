/** V7-10 · ⌘K „Kam chceš ísť?“ (recept prekrytia 3): Dialog + Command, filter bez diakritiky (predvolený v command.tsx).
 *  Na tejto stránke preberá ⌘K (window capture predbehne site/CommandK na document). Podnosy skočia na miesto,
 *  projekty otvoria sheet, Škrtací test dialóg hry (udalosti v710:*), von vedú iba stránky webu a overené odkazy.
 *  Nesie aj BoldKit Toaster (id v7-10) pre hlásenia rezervácie a zápisu. */
import * as React from 'react';
import { ArrowUpRight, BookOpen, Bug, Database, Gamepad2, LayoutGrid, Newspaper, Scissors, Stethoscope, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Toaster } from '@/components/ui/sonner';
import { KORPUS } from '@/data/fakty';
import { VLAJKA } from '@/data/ponuka';
import { PODNOSY, TOASTER_ID, UDALOST, skocNa } from './data';

const P = 'min-h-11 text-base';

export default function Paleta() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((o) => !o);
      }
    };
    const onOtvor = () => setOpen(true);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener(UDALOST.paleta, onOtvor);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener(UDALOST.paleta, onOtvor);
    };
  }, []);

  /** Paleta sa najprv zavrie, potom sa otvorí cieľ (dva modály naraz = dva fokus trapy). */
  const potom = (f: () => void) => () => {
    setOpen(false);
    window.setTimeout(f, 80);
  };
  const skoc = (id: string) => potom(() => skocNa(id));
  const projekt = (id: string) => potom(() => window.dispatchEvent(new CustomEvent(UDALOST.projekt, { detail: id })));
  const chod = (href: string, von = false) => () => {
    setOpen(false);
    if (von) window.open(href, '_blank', 'noopener,noreferrer');
    else window.location.assign(href);
  };

  return (
    <>
      <Toaster id={TOASTER_ID} position="bottom-center" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose className="top-[10%] translate-y-0 gap-0 p-0 sm:max-w-xl" data-lenis-prevent>
          <DialogTitle className="sr-only">Kam chceš ísť?</DialogTitle>
          <DialogDescription className="sr-only">Ekosystém XVADUR: podnosy domova, texty, Hriech, Netopier, Korpus, hry, vyšetrenie</DialogDescription>
          <Command loop label="Kam chceš ísť?">
            <CommandInput placeholder="Hriech, Korpus, texty, hry, vyšetrenie…" />
            <CommandList className="max-h-[60dvh]">
              <CommandEmpty>Nič také tu nie je.</CommandEmpty>
              <CommandGroup heading="Ekosystém">
                <CommandItem className={P} value="Vyšetrenie" keywords={['konzultácia', 'termín', 'rezervácia']} onSelect={skoc('vysetrenie')}>
                  <Stethoscope aria-hidden="true" /> Vyšetrenie <CommandShortcut>{VLAJKA.trvanie}</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Texty" keywords={['články', 'newsletter', 'vydanie']} onSelect={chod('/texty/')}>
                  <BookOpen aria-hidden="true" /> Texty <CommandShortcut>/texty/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Hriech" keywords={['médiá', 'diagnóza', 'kritika']} onSelect={projekt('hriech')}>
                  <Newspaper aria-hidden="true" /> Hriech <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="hriech.xvadur.com" keywords={['hriech', 'web']} onSelect={chod('https://hriech.xvadur.com/', true)}>
                  <ArrowUpRight aria-hidden="true" /> hriech.xvadur.com <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Netopier" keywords={['prepisy', 'overovanie', 'médiá']} onSelect={projekt('netopier')}>
                  <Bug aria-hidden="true" /> Netopier <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Korpus" keywords={['slová', 'prompty', 'vitálne', KORPUS.slova]} onSelect={projekt('korpus')}>
                  <Database aria-hidden="true" /> Korpus <CommandShortcut>{KORPUS.slova} slov</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Škrtací test" keywords={['hra', 'frázy']} onSelect={potom(() => window.dispatchEvent(new CustomEvent(UDALOST.hra)))}>
                  <Scissors aria-hidden="true" /> Škrtací test <CommandShortcut>hrať tu</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Všetky hry" onSelect={chod('/hry/')}>
                  <Gamepad2 aria-hidden="true" /> Všetky hry <CommandShortcut>/hry/</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Pacienti">
                <CommandItem className={P} value="Jakub, maklér" keywords={['crm', 'rezervácie', 'web']} onSelect={projekt('system-pre-maklera')}>
                  <User aria-hidden="true" /> Jakub, maklér
                </CommandItem>
                <CommandItem className={P} value="Lucia, terapeutka" keywords={['web', 'rezervácie']} onSelect={projekt('terapeutka')}>
                  <User aria-hidden="true" /> Lucia, terapeutka
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Podnosy domova">
                {PODNOSY.map((p) => (
                  <CommandItem key={p.id} className={P} value={`Podnos ${p.cislo} ${p.nazov}`} onSelect={skoc(p.id)}>
                    <LayoutGrid aria-hidden="true" /> {p.nazov} <CommandShortcut>{p.cislo}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Ďalej na webe">
                <CommandItem className={P} value="Substack" onSelect={chod('https://substack.com/@xvadur', true)}>
                  <ArrowUpRight aria-hidden="true" /> Substack <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Makléri" onSelect={chod('/makleri/')}>
                  <ArrowUpRight aria-hidden="true" /> Makléri <CommandShortcut>/makleri/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Skóre webu" onSelect={chod('/skore/')}>
                  <ArrowUpRight aria-hidden="true" /> Skóre webu <CommandShortcut>/skore/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Kvíz" onSelect={chod('/kviz/')}>
                  <ArrowUpRight aria-hidden="true" /> Kvíz <CommandShortcut>/kviz/</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
