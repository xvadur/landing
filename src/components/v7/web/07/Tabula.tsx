/** V7-07 · horná lišta = orientačná tabuľa. Vľavo X, v strede split-flap „SI TU: B · CHOROBOPISY“ (mení sa podľa toho,
 *  ktorý pavilón je v strede obrazovky), vpravo ⌘K paleta ekosystému a výťah (menu): na desktope navigation-menu
 *  s panelom tlačidiel poschodí, na mobile drawer s tým istým panelom. CTA „F · Vyšetrenie“ = cieľ chodby.
 *  Ostrov: <Tabula client:load posledny={…} />. Zapína aj delegovaný klik [data-chod] pre celú stránku. */
import * as React from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Database, DoorOpen, Gamepad2, Newspaper, Search, Stethoscope, User, Bug } from 'lucide-react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Kbd, KbdCombo } from '@/components/ui/kbd';
import { Button } from '@/components/ui/button';
import ScrambleHover from '@/components/vendor/fancy/text/scramble-hover';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import { KORPUS } from '@/data/fakty';
import { VLAJKA } from '@/data/ponuka';
import { cn } from '@/lib/utils';
import { MIESTA, miesto, type MiestoId } from './data';
import { MIESTO, chod, otvor, zapniOdkazy } from './navigacia';
import { SplitFlap } from './SplitFlap';

export type Text = { id: string; title: string; description: string; datum: string };

const VON = [
  { href: '/texty/', label: 'Texty', Icon: BookOpen, von: false },
  { href: '/hry/', label: 'Hry', Icon: Gamepad2, von: false },
  { href: 'https://hriech.xvadur.com/', label: 'Hriech', Icon: Newspaper, von: true },
  { href: SUBSTACK_URL, label: 'Substack', Icon: BookOpen, von: true },
];

/** Sleduje, ktoré [data-miesto] je v strede obrazovky (funguje aj pre vodorovne posúvanú chodbu: IO berie transformy). */
function useMiesto(): MiestoId {
  const [m, setM] = React.useState<MiestoId>('recepcia');
  React.useEffect(() => {
    let io: IntersectionObserver | null = null;
    const pozoruj = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => {
          const hit = entries.filter((e) => e.isIntersecting).pop();
          if (!hit) return;
          const id = (hit.target as HTMLElement).dataset.miesto as MiestoId;
          setM(id);
          window.dispatchEvent(new CustomEvent(MIESTO, { detail: id }));
        },
        { rootMargin: '-48% -48% -48% -48%' },
      );
      document.querySelectorAll('[data-miesto]').forEach((el) => io!.observe(el));
    };
    pozoruj();
    window.addEventListener('v707:chodba', pozoruj);
    return () => {
      io?.disconnect();
      window.removeEventListener('v707:chodba', pozoruj);
    };
  }, []);
  return m;
}

/** Panel výťahu: displej + tlačidlá poschodí (kbd) + dvere von z budovy. */
function PanelVytahu({ aktivne, onVyber, onHladaj }: { aktivne: MiestoId; onVyber: () => void; onHladaj: () => void }) {
  const [hover, setHover] = React.useState<string | null>(null);
  const m = miesto(aktivne);
  return (
    <div className="flex flex-col gap-4 bg-ink p-4 text-paper sm:p-5">
      <div className="flex items-center justify-between gap-3 border-3 border-paper/30 bg-ink px-3 py-2">
        <span className="font-mono text-xs font-bold tracking-[0.14em] text-paper/70 uppercase">Poschodie</span>
        <SplitFlap text={m.tabula} pismeno={m.pismeno} dlzka={11} velkost="sm" />
      </div>
      <p className="font-mono text-xs font-bold tracking-[0.14em] text-yellow uppercase">Stlač pavilón</p>
      <ul className="grid grid-cols-2 gap-2" role="list">
        {MIESTA.map((p) => {
          const on = p.id === aktivne;
          return (
            <li key={p.id}>
              <a
                href={`#${p.id}`}
                data-chod={p.id}
                onClick={onVyber}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p.id)}
                onBlur={() => setHover(null)}
                aria-current={on ? 'location' : undefined}
                className={cn(
                  'group flex min-h-12 items-center gap-3 border-3 border-paper px-2 py-1.5 text-left transition-colors',
                  on ? 'bg-yellow text-ink' : 'bg-ink text-paper hover:bg-paper hover:text-ink',
                )}
              >
                <Kbd size="lg" variant={on ? 'outline' : 'default'} className="h-9 min-w-9 shrink-0 text-base text-ink">
                  {p.pismeno}
                </Kbd>
                <span className="font-display text-sm leading-none font-extrabold uppercase">
                  <ScrambleHover text={p.nazov} active={hover === p.id} characters="ABCDEFGHIJKLMNOPRSTUVZ" scrambleSpeed={40} maxIterations={6} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-2 border-t-3 border-paper/30 pt-4">
        <p className="font-mono text-xs font-bold tracking-[0.14em] text-paper/70 uppercase">Von z budovy</p>
        <div className="flex flex-wrap gap-2">
          {VON.map(({ href, label, Icon, von }) => (
            <a
              key={href}
              href={href}
              {...(von ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex min-h-11 items-center gap-2 border-3 border-paper bg-ink px-3 font-mono text-xs font-bold uppercase hover:bg-paper hover:text-ink"
            >
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              {von && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={onHladaj}
          className="mt-1 inline-flex min-h-11 items-center justify-between gap-2 border-3 border-paper bg-paper px-3 font-mono text-xs font-bold text-ink uppercase"
        >
          <span className="inline-flex items-center gap-2">
            <Search className="h-4 w-4" aria-hidden="true" /> Hľadať v ekosystéme
          </span>
          <KbdCombo keys={['⌘', 'K']} size="sm" />
        </button>
      </div>
    </div>
  );
}

export default function Tabula({ posledny }: { posledny: Text | null }) {
  const aktivne = useMiesto();
  const m = miesto(aktivne);
  const [paleta, setPaleta] = React.useState(false);
  const [drawer, setDrawer] = React.useState(false);
  const [menu, setMenu] = React.useState('');

  React.useEffect(() => zapniOdkazy(), []);
  // ⌘K / Ctrl K: preberá paletu (window capture predbehne site/CommandK na document)
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

  const P = 'min-h-11 text-base';
  /** Paleta sa najprv zavrie, potom sa vykoná cieľ (dva modály naraz = dva fokus trapy). */
  const z = (f: () => void) => () => {
    setPaleta(false);
    window.setTimeout(f, 80);
  };
  const von = (href: string, nove = false) => () => {
    setPaleta(false);
    if (nove) window.open(href, '_blank', 'noopener,noreferrer');
    else window.location.assign(href);
  };
  const hladaj = () => {
    setDrawer(false);
    setMenu('');
    window.setTimeout(() => setPaleta(true), 120);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b-3 border-ink bg-ink text-paper">
        <div className="mx-auto flex h-full max-w-[1600px] items-center gap-2 px-4 sm:gap-4 lg:px-6">
          <a href="#recepcia" data-chod="recepcia" className="flex h-11 shrink-0 items-center gap-2" aria-label="XVADUR · recepcia">
            <img src="/brand/x.svg" alt="" width="30" height="30" className="h-7 w-7 sm:h-8 sm:w-8" />
            <img src="/brand/xvadur-paper.svg" alt="" width="120" height="23" className="hidden h-5 w-auto xl:block" />
          </a>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-3 lg:justify-start">
            <span className="hidden font-mono text-xs font-bold tracking-[0.14em] text-yellow uppercase sm:inline">Si tu</span>
            <SplitFlap text={m.tabula} pismeno={m.pismeno} dlzka={11} velkost="sm" label={`Si tu: ${m.pismeno} · ${m.nazov}`} />
            <span className="hidden max-w-64 truncate text-sm text-paper/75 2xl:inline">{m.co}</span>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => setPaleta(true)}
              className="inline-flex h-11 items-center gap-2 border-3 border-paper bg-ink px-3 font-mono text-xs font-bold uppercase hover:bg-paper hover:text-ink"
            >
              <Search className="h-4 w-4" aria-hidden="true" /> Kam?
              <KbdCombo keys={['⌘', 'K']} size="sm" className="text-ink" />
            </button>
            <NavigationMenu value={menu} onValueChange={setMenu}>
              <NavigationMenuList>
                <NavigationMenuItem value="vytah">
                  <NavigationMenuTrigger className="bg-paper text-ink">
                    <DoorOpen className="mr-2 h-4 w-4" aria-hidden="true" /> Výťah
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="right-0 left-auto w-[440px] p-0">
                    <PanelVytahu aktivne={aktivne} onVyber={() => setMenu('')} onHladaj={hladaj} />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Button asChild variant="accent" className="h-11">
              <a href="#vysetrenie" data-chod="vysetrenie">
                <Stethoscope className="h-4 w-4" aria-hidden="true" /> F · Vyšetrenie
              </a>
            </Button>
          </div>

          <Drawer open={drawer} onOpenChange={setDrawer}>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 shrink-0 items-center gap-2 border-3 border-paper bg-paper px-2.5 font-mono text-xs font-bold text-ink uppercase lg:hidden"
                aria-label="Výťah: menu pavilónov"
              >
                <DoorOpen className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Výťah</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[92dvh] border-ink bg-ink">
              <div className="overflow-y-auto" data-lenis-prevent>
                <DrawerHeader className="px-4 pb-0 text-left text-paper">
                  <DrawerTitle className="font-display text-2xl font-extrabold uppercase">Výťah</DrawerTitle>
                  <DrawerDescription className="text-paper/75">Stlač pavilón a výťah ťa odvezie.</DrawerDescription>
                </DrawerHeader>
                <PanelVytahu aktivne={aktivne} onVyber={() => setDrawer(false)} onHladaj={hladaj} />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <Dialog open={paleta} onOpenChange={setPaleta}>
        <DialogContent hideClose className="top-[12%] translate-y-0 gap-0 p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Kam chceš ísť?</DialogTitle>
          <DialogDescription className="sr-only">Pavilóny domova a ekosystém XVADUR: texty, Hriech, Netopier, Korpus, hry, vyšetrenie</DialogDescription>
          <Command loop label="Kam chceš ísť?">
            <CommandInput placeholder="Pavilón, Hriech, Korpus, texty, hry…" />
            <CommandList className="max-h-[60dvh]" data-lenis-prevent>
              <CommandEmpty>Takú tabuľu tu nemáme.</CommandEmpty>
              <CommandGroup heading="Pavilóny">
                {MIESTA.map((p) => (
                  <CommandItem key={p.id} className={P} value={`${p.pismeno} ${p.nazov}`} keywords={[p.co]} onSelect={z(() => chod(p.id))}>
                    <Kbd size="md" className="min-w-7">
                      {p.pismeno}
                    </Kbd>
                    {p.nazov}
                    <CommandShortcut>{p.id === 'vysetrenie' ? 'cieľ' : 'choď'}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Ekosystém">
                <CommandItem className={P} value="Hriech" keywords={['diagnóza', 'médiá']} onSelect={z(() => otvor({ typ: 'projekt', id: 'hriech' }))}>
                  <Newspaper aria-hidden="true" /> Hriech <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="hriech.xvadur.com" keywords={['hriech', 'web']} onSelect={von('https://hriech.xvadur.com/', true)}>
                  <Newspaper aria-hidden="true" /> hriech.xvadur.com <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Netopier" keywords={['prepisy', 'overovanie', 'médiá']} onSelect={z(() => otvor({ typ: 'projekt', id: 'netopier' }))}>
                  <Bug aria-hidden="true" /> Netopier <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Korpus" keywords={['slová', 'prompty', 'vitálne']} onSelect={z(() => otvor({ typ: 'projekt', id: 'korpus' }))}>
                  <Database aria-hidden="true" /> Korpus <CommandShortcut>{KORPUS.slova} slov</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Jakub, maklér" keywords={['crm', 'rezervácie', 'pacient']} onSelect={z(() => otvor({ typ: 'projekt', id: 'system-pre-maklera' }))}>
                  <User aria-hidden="true" /> Jakub, maklér
                </CommandItem>
                <CommandItem className={P} value="Lucia, terapeutka" keywords={['web', 'rezervácie', 'pacient']} onSelect={z(() => otvor({ typ: 'projekt', id: 'terapeutka' }))}>
                  <User aria-hidden="true" /> Lucia, terapeutka
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Hry a texty">
                <CommandItem className={P} value="Škrtací test" keywords={['hra', 'frázy']} onSelect={z(() => otvor({ typ: 'hra' }))}>
                  <Gamepad2 aria-hidden="true" /> Škrtací test <CommandShortcut>hrať tu</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Všetky hry" onSelect={von('/hry/')}>
                  <Gamepad2 aria-hidden="true" /> Všetky hry <CommandShortcut>/hry/</CommandShortcut>
                </CommandItem>
                {posledny && (
                  <CommandItem className={P} value={posledny.title} keywords={['text', 'článok']} onSelect={von(`/texty/${posledny.id}/`)}>
                    <BookOpen aria-hidden="true" /> {posledny.title}
                  </CommandItem>
                )}
                <CommandItem className={P} value="Všetky texty" onSelect={von('/texty/')}>
                  <BookOpen aria-hidden="true" /> Všetky texty <CommandShortcut>/texty/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Substack" onSelect={von(SUBSTACK_URL, true)}>
                  <BookOpen aria-hidden="true" /> Substack <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Cieľ">
                <CommandItem className={P} value="Vyšetrenie rezervácia" keywords={['konzultácia', 'termín']} onSelect={z(() => chod('vysetrenie'))}>
                  <Stethoscope aria-hidden="true" /> Objednaj sa na vyšetrenie <CommandShortcut>{VLAJKA.trvanie}</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="flex items-center justify-between gap-3 border-t-3 border-ink bg-paper px-4 py-2 font-mono text-xs">
            <span className="inline-flex items-center gap-2">
              <Kbd size="sm">↑</Kbd>
              <Kbd size="sm">↓</Kbd> vyber · <Kbd size="sm">↵</Kbd> choď
            </span>
            <span className="inline-flex items-center gap-1">
              <ArrowRight className="h-3 w-3" aria-hidden="true" /> {MIESTA.length} miest
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
