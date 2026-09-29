/** V7-01 · „Kam chceš ísť?“ ⌘K do celého ekosystému XVADUR + toaster monitora.
 *  ⌘K / Ctrl K (window capture predbehne site/CommandK z Base), tlačidlo [data-m01-paleta] v hornom pase aj v EKG lište.
 *  Položky: obrazovky monitora (skok), hra na mieste (`m01:hra`), detail Hriechu / Netopiera / Korpusu / Jakuba / Lucie
 *  v Sheete (`m01:pacient`), texty, Substack, štatistiky, vyšetrenie. Klik na CTA [data-m01-cta] = alarm v sonneri.
 *  Kusy: command, dialog, kbd, sonner. Ostrov: <Paleta client:idle posledny={…} />. */
import * as React from 'react';
import { toast } from 'sonner';
import { Activity, BookOpen, Bug, Database, Gamepad2, Monitor, Newspaper, Scissors, Stethoscope, User } from 'lucide-react';
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
import { Toaster } from '@/components/ui/sonner';
import { KbdCombo } from '@/components/ui/kbd';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import { VLAJKA } from '@/data/ponuka';
import { KORPUS, OBRAZOVKY, cisloObrazovky } from './data';
import { TOASTER, skocNa } from './klient';

export type Text = { id: string; title: string };

export default function Paleta({ posledny }: { posledny: Text | null }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((o) => !o);
      }
    };
    let posledne = 0;
    const onClick = (e: MouseEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      if (t?.closest('[data-m01-paleta]')) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (t?.closest('a[data-m01-cta]') && Date.now() - posledne > 6000) {
        posledne = Date.now();
        toast.warning('✚ Alarm: ďalší pacient', {
          toasterId: TOASTER,
          description: `${VLAJKA.nazov} · ${VLAJKA.trvanie} · ${VLAJKA.cena.toLowerCase()}. Vyber si deň a čas.`,
        });
      }
    };
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('click', onClick);
    };
  }, []);

  /** Paleta sa najprv zavrie, potom sa otvorí cieľ (dva modály naraz = dva fokus trapy). */
  const potom = (f: () => void) => () => {
    setOpen(false);
    window.setTimeout(f, 80);
  };
  const pacient = (id: string) => potom(() => window.dispatchEvent(new CustomEvent('m01:pacient', { detail: { id } })));
  const chod = (href: string, von = false) => () => {
    setOpen(false);
    if (von) window.open(href, '_blank', 'noopener,noreferrer');
    else window.location.assign(href);
  };
  const P = 'min-h-11 text-base';

  return (
    <>
      <Toaster id={TOASTER} position="bottom-center" offset={88} duration={4200} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose className="top-[10%] translate-y-0 gap-0 p-0 sm:max-w-xl" data-lenis-prevent>
          <DialogTitle className="sr-only">Kam chceš ísť?</DialogTitle>
          <DialogDescription className="sr-only">Obrazovky monitora a ekosystém XVADUR: texty, Hriech, Netopier, Korpus, hry, vyšetrenie</DialogDescription>
          <Command loop label="Kam chceš ísť?">
            <CommandInput placeholder="Hriech, Korpus, hry, texty, vyšetrenie…" />
            <CommandList className="max-h-[60dvh]">
              <CommandEmpty>Nič také na monitore nie je.</CommandEmpty>
              <CommandGroup heading="Vyšetrenie">
                <CommandItem className={P} value="Vyšetrenie" keywords={['konzultácia', 'termín', 'rezervácia']} onSelect={potom(() => skocNa('vysetrenie'))}>
                  <Stethoscope aria-hidden="true" /> Objednaj sa na vyšetrenie <CommandShortcut>{VLAJKA.trvanie}</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Médiá">
                <CommandItem className={P} value="Hriech" keywords={['diagnóza', 'médiá', 'kritika']} onSelect={pacient('hriech')}>
                  <Newspaper aria-hidden="true" /> Hriech <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="hriech.xvadur.com" keywords={['hriech', 'web']} onSelect={chod('https://hriech.xvadur.com/', true)}>
                  <Newspaper aria-hidden="true" /> hriech.xvadur.com <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Netopier" keywords={['prepisy', 'overovanie', 'médiá']} onSelect={pacient('netopier')}>
                  <Bug aria-hidden="true" /> Netopier <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Dáta a pacienti">
                <CommandItem className={P} value="Korpus" keywords={['slová', 'prompty', KORPUS.slova]} onSelect={pacient('korpus')}>
                  <Database aria-hidden="true" /> Korpus <CommandShortcut>{KORPUS.slova} slov</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Štatistiky Korpusu" keywords={['vitálne', 'čísla']} onSelect={chod('/vitalne/')}>
                  <Activity aria-hidden="true" /> Štatistiky Korpusu <CommandShortcut>/vitalne/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Jakub, maklér" keywords={['crm', 'rezervácie', 'pacient']} onSelect={pacient('system-pre-maklera')}>
                  <User aria-hidden="true" /> Jakub, maklér
                </CommandItem>
                <CommandItem className={P} value="Lucia, terapeutka" keywords={['web', 'rezervácie', 'pacient']} onSelect={pacient('terapeutka')}>
                  <User aria-hidden="true" /> Lucia, terapeutka
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Hry">
                <CommandItem className={P} value="Škrtací test" keywords={['hra', 'frázy']} onSelect={potom(() => window.dispatchEvent(new CustomEvent('m01:hra')))}>
                  <Scissors aria-hidden="true" /> Škrtací test <CommandShortcut>hrať tu</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Všetky hry" onSelect={chod('/hry/')}>
                  <Gamepad2 aria-hidden="true" /> Všetky hry <CommandShortcut>/hry/</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Texty">
                {posledny && (
                  <CommandItem className={P} value={posledny.title} keywords={['text', 'článok']} onSelect={chod(`/texty/${posledny.id}/`)}>
                    <BookOpen aria-hidden="true" /> {posledny.title}
                  </CommandItem>
                )}
                <CommandItem className={P} value="Všetky texty" onSelect={chod('/texty/')}>
                  <BookOpen aria-hidden="true" /> Všetky texty <CommandShortcut>/texty/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Substack" keywords={['newsletter']} onSelect={chod(SUBSTACK_URL, true)}>
                  <BookOpen aria-hidden="true" /> Substack <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Obrazovky monitora">
                {OBRAZOVKY.map((o) => (
                  <CommandItem key={o.id} className={P} value={`Obrazovka ${o.nazov}`} keywords={[o.kratko]} onSelect={potom(() => skocNa(o.id))}>
                    <Monitor aria-hidden="true" /> {o.nazov} <CommandShortcut>{cisloObrazovky(o.id)}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="hidden items-center justify-between gap-3 border-t-3 border-ink bg-paper px-4 py-2 font-mono text-xs sm:flex">
              <span>Kam chceš ísť?</span>
              <KbdCombo keys={['⌘', 'K']} size="sm" />
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
