/** V7-08 · plášť systému (jeden ostrov, client:load): horná lišta (menubar + hodiny + ⌘K), ikony aplikácií vľavo
 *  (sidebar, iba ≥ 1024 px), hlavný panel dole (Štart, okná, pulz, hodiny, CTA), prekrytia: paleta ⌘K (dialog + command),
 *  detail pacienta (sheet), Škrtací test (dialog / drawer na mobile), O systéme (dialog), prehliadka (tour),
 *  systémové hlásenia (sonner s vlastným id). ⌘K sa zachytáva na window v capture fáze, aby nešla site paleta. */
import * as React from 'react';
import { toast } from 'sonner';
import {
  Activity,
  ArrowRight,
  Cctv,
  ClipboardList,
  ClipboardPlus,
  Database,
  FileHeart,
  FolderOpen,
  Gamepad2,
  Home,
  LayoutGrid,
  MailPlus,
  Newspaper,
  PanelBottom,
  Power,
  Scissors,
  Search,
  Stethoscope,
  TerminalSquare,
  User,
} from 'lucide-react';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Sidebar, SidebarContent, SidebarGroup, SidebarItem, SidebarProvider, SidebarSeparator, SidebarToggle } from '@/components/ui/sidebar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Tour, useTour, type TourStep } from '@/components/ui/tour';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kbd, KbdCombo } from '@/components/ui/kbd';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from '@/components/ui/empty-state';
import { skrtni, UKAZKA, type Skrt } from '@/components/hry/skrtni';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import { KORPUS, OVERENE_DNA_TEXT } from '@/data/fakty';
import { VLAJKA } from '@/data/ponuka';
import { cn } from '@/lib/utils';
import { domena, PACIENTI, STAV_TEXT, type Text } from './data';
import { maximalizuj, nastavStav, OKNA, otvorOkno, otvorVsetky, pocuvaj, posli, useSystem, type OknoId } from './store';
import { nacitajPulz, sk, type Pulz } from './OknoVitalne';

const TOASTER = 'v708';

export const IKONY: Record<OknoId, React.ComponentType<{ className?: string }>> = {
  prijem: Stethoscope,
  vitalne: Activity,
  kamera: Cctv,
  dennik: TerminalSquare,
  anamneza: FolderOpen,
  chorobopisy: ClipboardList,
  liecba: FileHeart,
  hry: Gamepad2,
  vysetrenie: ClipboardPlus,
  zapis: MailPlus,
  texty: Newspaper,
};

function useMalo(q = '(max-width: 639px)') {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

function useHodiny() {
  const [t, setT] = React.useState<string>('--:--');
  React.useEffect(() => {
    const f = new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Bratislava' });
    const tik = () => setT(f.format(new Date()));
    tik();
    const id = window.setInterval(tik, 15000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

/* ---------------- Škrtací test v okne ---------------- */

function NahladHry() {
  const [text, setText] = React.useState(UKAZKA);
  const [v, setV] = React.useState<Skrt | null>(() => skrtni(UKAZKA));
  return (
    <div className="grid gap-4">
      <label htmlFor="v708-skrt" className="font-mono text-xs font-bold uppercase">
        Tvoj text
      </label>
      <Textarea id="v708-skrt" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="text-base" />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setV(skrtni(text))} disabled={!text.trim()}>
          <Scissors aria-hidden="true" /> Škrtni
        </Button>
        {v && (
          <p className="font-mono text-sm" aria-live="polite">
            škrtov {v.skrtov} · ostalo {v.zostaloSlov} z {v.povodneSlova} slov
          </p>
        )}
      </div>
      {v && (
        <p className="border-3 border-ink bg-white p-4 text-base leading-relaxed">
          {v.segmenty.map((s, i) =>
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

function OknoHry({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const malo = useMalo();
  const titul = 'Škrtací test';
  const popis = 'Vlož svoj text. Škrtneme frázy, ktoré má každý. Beží iba v tvojom prehliadači.';
  if (malo)
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh]">
          <div className="overflow-y-auto px-4 pb-8" data-lenis-prevent>
            <DrawerHeader className="px-0">
              <DrawerTitle className="font-display text-2xl font-extrabold uppercase">{titul}</DrawerTitle>
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
          <p className="font-mono text-xs font-bold uppercase">HRY.EXE › skrtaci-test</p>
          <DialogTitle className="font-display text-3xl font-extrabold uppercase">{titul}</DialogTitle>
          <DialogDescription className="text-base text-ink/75">{popis}</DialogDescription>
        </DialogHeader>
        <NahladHry />
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- detail pacienta ---------------- */

function DetailPacienta({ id, open, onOpenChange }: { id: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const malo = useMalo();
  const p = PACIENTI.find((x) => x.id === id) ?? null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={malo ? 'bottom' : 'right'} className={cn('flex flex-col gap-5 overflow-y-auto', malo ? 'max-h-[88dvh]' : 'sm:max-w-md')} data-lenis-prevent>
        {p && (
          <>
            <SheetHeader className="pr-10">
              <p className="font-mono text-xs font-bold uppercase">Chorobopis · {STAV_TEXT[p.stav]}</p>
              <SheetTitle className="font-display text-3xl font-extrabold uppercase">{p.nazov}</SheetTitle>
              <SheetDescription className="text-base text-ink/75">{p.riadok}</SheetDescription>
            </SheetHeader>
            {p.obrazok && <img src={p.obrazok} alt="" width={960} height={600} className="aspect-[16/10] w-full border-3 border-ink object-cover object-top" />}
            <div>
              <p className="font-display text-6xl leading-none font-extrabold">{p.cislo}</p>
              <p className="mt-1 font-mono text-sm uppercase">{p.cisloPopis}</p>
            </div>
            {p.dostal && (
              <ul className="flex list-none flex-col gap-2 border-3 border-ink bg-yellow p-4 text-sm">
                {p.dostal.map((d) => (
                  <li key={d}>✚ {d}</li>
                ))}
              </ul>
            )}
            {p.fakty.length > 0 && (
              <dl className="grid grid-cols-2 gap-3">
                {p.fakty.map((f) => (
                  <div key={f.label} className="border-3 border-ink bg-white p-3">
                    <dt className="font-mono text-xs uppercase text-ink/60">{f.label}</dt>
                    <dd className="font-display text-2xl font-extrabold">{f.value}</dd>
                    <dd className="text-xs">{f.note}</dd>
                  </div>
                ))}
              </dl>
            )}
            <SheetFooter className="mt-auto flex-col gap-3 sm:flex-col">
              {p.url ? (
                <Button asChild variant="outline">
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {domena(p.url)} ↗
                  </a>
                </Button>
              ) : (
                <p className="font-mono text-sm">{p.poznamka ?? 'bez verejného odkazu'}</p>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  onOpenChange(false);
                  window.setTimeout(() => otvorOkno('chorobopisy'), 80);
                }}
              >
                Otvoriť kartotéku
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ---------------- prehliadka ---------------- */

function KrokSk() {
  const { currentStep, totalSteps } = useTour();
  return (
    <p className="mt-2 font-mono text-xs tracking-wider uppercase">
      krok {currentStep + 1} z {totalSteps}
    </p>
  );
}

/* ---------------- plášť ---------------- */

export default function Shell({ texty }: { texty: Text[] }) {
  const sys = useSystem();
  const hodiny = useHodiny();
  const malo = useMalo();
  const [paleta, setPaleta] = React.useState(false);
  const [hra, setHra] = React.useState(false);
  const [pacient, setPacient] = React.useState<string | null>(null);
  const [sheet, setSheet] = React.useState(false);
  const [oSysteme, setOSysteme] = React.useState(false);
  const [okna, setOkna] = React.useState(false);
  const [tour, setTour] = React.useState(false);
  const [pulz, setPulz] = React.useState<Pulz | null>(null);

  React.useEffect(() => {
    void nacitajPulz().then(setPulz);
  }, []);

  // ⌘K / Ctrl K → paleta systému (capture na window predbehne site/CommandK na document)
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

  // udalosti z okien
  React.useEffect(
    () =>
      pocuvaj((u) => {
        if (u.typ === 'paleta') setPaleta(true);
        else if (u.typ === 'hra') setHra(true);
        else if (u.typ === 'prehliadka') setTour(true);
        else if (u.typ === 'pacient') {
          setPacient(u.id);
          setSheet(true);
        } else if (u.typ === 'hlasenie') {
          const f = u.druh === 'success' ? toast.success : u.druh === 'error' ? toast.error : u.druh === 'warning' ? toast.warning : toast;
          f(u.text, { description: u.popis, toasterId: TOASTER });
        }
      }),
    [],
  );

  // boot hotový → hlásenie systému
  React.useEffect(() => {
    const onBoot = () =>
      window.setTimeout(
        () => toast.success('Systém pripravený', { description: 'Príjem otvorený. Okná sa dajú ťahať, zavrieť a nájsť cez ⌘K.', toasterId: TOASTER }),
        500,
      );
    window.addEventListener('v708:boot', onBoot);
    return () => window.removeEventListener('v708:boot', onBoot);
  }, []);

  const pocetOtvorenych = OKNA.filter((o) => sys.stav[o.id] !== 'zatvorene').length;

  const zPalety = (f: () => void) => () => {
    setPaleta(false);
    window.setTimeout(f, 60);
  };
  const chod = (href: string, von = false) => () => {
    setPaleta(false);
    if (von) window.open(href, '_blank', 'noopener,noreferrer');
    else window.location.assign(href);
  };
  const otvorPacienta = (id: string) => {
    setPacient(id);
    setSheet(true);
  };
  function bootZnova() {
    try {
      sessionStorage.removeItem('opona');
    } catch {
      /* súkromné okno */
    }
    window.location.reload();
  }

  const krokyTour: TourStep[] = React.useMemo(
    () => [
      { target: '#okno-prijem', title: '1 · Príjem', description: 'Kto ťa prijíma: Adam, zdravotník, ktorý stavia AI agentov. Okná sa dajú ťahať za lištu.', placement: malo ? 'bottom' : 'right', content: <KrokSk /> },
      { target: '#okno-vitalne', title: '2 · Vitálne funkcie', description: 'Živé čísla Korpusu z /pulse.json. Žiadne vymyslené čísla.', placement: malo ? 'bottom' : 'left', content: <KrokSk /> },
      { target: '#okno-chorobopisy', title: '3 · Chorobopisy', description: 'Kartotéka systémov, ktoré som postavil. Stav tak, ako naozaj je.', placement: 'top', content: <KrokSk /> },
      { target: '#okno-vysetrenie', title: '4 · Vyšetrenie', description: `${VLAJKA.trvanie}, ${VLAJKA.cena.toLowerCase()}. ${VLAJKA.titulok}`, placement: 'top', content: <KrokSk /> },
      { target: '#v708-panel', title: '5 · Panel', description: 'Štart otvorí celý systém (⌘K). Zatvorené okná nájdeš tu.', placement: 'top', content: <KrokSk /> },
    ],
    [malo],
  );

  const P = 'min-h-11 text-base';
  const posledny = texty[0];

  return (
    <>
      {/* ---------- horná lišta ---------- */}
      <div className="v708-lista fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-2 border-b-3 border-ink bg-white px-2 sm:gap-3 sm:px-3">
        <a href="#okno-prijem" className="flex min-h-11 shrink-0 items-center gap-2 px-1" aria-label="XVADUR OS · Príjem">
          <img src="/brand/x.svg" alt="" width="20" height="24" className="h-6 w-auto" />
          <span className="hidden font-display text-lg font-extrabold tracking-tight uppercase lg:inline">XVADUR OS</span>
        </a>
        <div className="min-w-0 flex-1 overflow-x-auto" data-lenis-prevent>
          <Menubar className="h-12 w-max border-0 bg-transparent shadow-none">
            <MenubarMenu>
              <MenubarTrigger className="min-h-11">Systém</MenubarTrigger>
              <MenubarContent>
                <MenubarLabel className="font-mono text-xs">XVADUR OS · V7-08</MenubarLabel>
                <MenubarItem onSelect={() => setOSysteme(true)}>O systéme</MenubarItem>
                <MenubarItem onSelect={() => setPaleta(true)}>
                  Kam chceš ísť? <MenubarShortcut>⌘K</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onSelect={() => setTour(true)}>Prehliadka systému</MenubarItem>
                <MenubarSeparator />
                <MenubarItem onSelect={otvorVsetky}>Obnoviť všetky okná</MenubarItem>
                <MenubarItem onSelect={bootZnova}>
                  <Power className="h-4 w-4" /> Spustiť boot znova
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="min-h-11">Okná</MenubarTrigger>
              <MenubarContent>
                <MenubarLabel className="font-mono text-xs">
                  {pocetOtvorenych} z {OKNA.length} otvorených
                </MenubarLabel>
                {OKNA.map((o) => (
                  <MenubarCheckboxItem
                    key={o.id}
                    checked={sys.stav[o.id] !== 'zatvorene'}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(c) => (c ? otvorOkno(o.id) : nastavStav(o.id, 'zatvorene'))}
                  >
                    {o.nazov}
                  </MenubarCheckboxItem>
                ))}
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="min-h-11">Pacienti</MenubarTrigger>
              <MenubarContent>
                {PACIENTI.map((p) => (
                  <MenubarItem key={p.id} onSelect={() => otvorPacienta(p.id)}>
                    {p.nazov}
                    <MenubarShortcut>{p.cislo}</MenubarShortcut>
                  </MenubarItem>
                ))}
                <MenubarSeparator />
                <MenubarItem onSelect={() => otvorOkno('chorobopisy')}>Celá kartotéka</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="min-h-11">Pomoc</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onSelect={() => setTour(true)}>Prehliadka systému</MenubarItem>
                <MenubarItem onSelect={() => setOSysteme(true)}>Klávesové skratky</MenubarItem>
                <MenubarSeparator />
                <MenubarItem asChild>
                  <a href="mailto:adam@xvadur.com">Napísať Adamovi</a>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
        <button
          type="button"
          onClick={() => setPaleta(true)}
          className="hidden min-h-11 shrink-0 items-center gap-3 border-3 border-ink bg-paper px-3 font-mono text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)] md:flex"
        >
          <Search className="h-4 w-4" aria-hidden="true" /> Hľadať v systéme
          <KbdCombo keys={['⌘', 'K']} size="sm" aria-hidden="true" />
        </button>
        <span className="hidden shrink-0 border-l-3 border-ink pl-3 font-mono text-sm font-bold tabular-nums sm:block" aria-label={`Čas ${hodiny}`}>
          {hodiny}
        </span>
      </div>

      {/* ---------- ikony aplikácií (≥ 1024 px) ---------- */}
      <div className="v708-ikony fixed top-14 bottom-14 left-0 z-40 hidden lg:block">
        <SidebarProvider defaultOpen={false} keyboardShortcut={false} className="h-full min-h-0 w-auto">
          <Sidebar collapsible="icon" className="h-full bg-paper shadow-[4px_0_0_0_var(--color-ink)]">
            <div className="flex h-14 items-center justify-center border-b-3 border-ink group-data-[state=expanded]/sidebar:justify-end group-data-[state=expanded]/sidebar:px-3">
              <SidebarToggle aria-label="Rozbaliť ikony aplikácií" />
            </div>
            <SidebarContent className="p-2">
              <SidebarGroup>
                {OKNA.map((o) => {
                  const Ikona = IKONY[o.id];
                  const s = sys.stav[o.id];
                  return (
                    <SidebarItem
                      key={o.id}
                      icon={<Ikona className="h-5 w-5" />}
                      tooltip={`${o.skratka}${s === 'zatvorene' ? ' (zatvorené)' : ''}`}
                      variant={sys.aktivne === o.id ? 'active' : 'default'}
                      onClick={() => otvorOkno(o.id)}
                      className={cn('min-h-11', s === 'zatvorene' && 'opacity-60')}
                    >
                      {o.skratka}
                    </SidebarItem>
                  );
                })}
              </SidebarGroup>
              <SidebarSeparator className="my-3" />
              <SidebarItem icon={<Search className="h-5 w-5" />} tooltip="Hľadať (⌘K)" onClick={() => setPaleta(true)} className="min-h-11">
                Hľadať
              </SidebarItem>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>

      {/* ---------- hlavný panel ---------- */}
      <nav id="v708-panel" aria-label="Hlavný panel systému" className="v708-panel fixed inset-x-0 bottom-0 z-50 flex h-14 items-stretch gap-2 border-t-3 border-ink bg-paper px-2 sm:px-3">
        <button
          type="button"
          onClick={() => setPaleta(true)}
          className="my-1.5 flex shrink-0 items-center gap-2 border-3 border-ink bg-yellow px-3 font-display text-base font-extrabold uppercase shadow-[3px_3px_0_0_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          aria-label="Štart: otvoriť paletu systému"
        >
          <span aria-hidden="true" className="text-stamp">
            ✚
          </span>
          Štart
        </button>
        <div className="hidden min-w-0 flex-1 items-stretch gap-1.5 overflow-x-auto py-1.5 lg:flex" data-lenis-prevent>
          {OKNA.map((o) => {
            const Ikona = IKONY[o.id];
            const s = sys.stav[o.id];
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  if (s === 'otvorene' && sys.aktivne === o.id) nastavStav(o.id, 'min');
                  else otvorOkno(o.id);
                }}
                aria-pressed={s === 'otvorene' && sys.aktivne === o.id}
                className={cn(
                  'flex min-w-0 shrink-0 items-center gap-2 border-3 px-2.5 font-mono text-xs font-bold uppercase',
                  s === 'zatvorene' ? 'border-dashed border-ink/50 text-ink/60' : 'border-ink',
                  s === 'otvorene' && sys.aktivne === o.id ? 'bg-yellow' : s === 'min' ? 'bg-paper' : 'bg-white',
                )}
                title={`${o.nazov}${s === 'min' ? ' (minimalizované)' : s === 'zatvorene' ? ' (zatvorené)' : ''}`}
              >
                <Ikona className="h-4 w-4 shrink-0" />
                <span className="truncate">{o.skratka}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setOkna(true)}
          className="my-1.5 flex shrink-0 items-center gap-2 border-3 border-ink bg-white px-3 font-mono text-sm font-bold uppercase lg:hidden"
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" /> Okná <span className="border-2 border-ink bg-yellow px-1 tabular-nums">{pocetOtvorenych}</span>
        </button>
        <div className="flex-1 lg:hidden" />
        <div className="hidden shrink-0 items-center gap-3 border-l-3 border-ink pl-3 font-mono text-xs font-bold uppercase xl:flex">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 animate-[v708-blik_1s_steps(2)_infinite] border-2 border-ink bg-stamp" aria-hidden="true" />
            pulz: {pulz ? `${sk(pulz.prompts_today)} promptov dnes` : 'načítavam'}
          </span>
          <span className="tabular-nums">{hodiny}</span>
        </div>
        <button
          type="button"
          onClick={() => otvorOkno('vysetrenie')}
          data-track="konzultacia_klik"
          data-track-miesto="v708-panel"
          className="my-1.5 flex shrink-0 items-center gap-2 border-3 border-ink bg-hot px-3 font-display text-base font-extrabold text-ink uppercase shadow-[3px_3px_0_0_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          Vyšetrenie <ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
        </button>
      </nav>

      {/* ---------- prázdna plocha ---------- */}
      {pocetOtvorenych === 0 && (
        <div className="fixed inset-x-4 top-1/3 z-40 mx-auto max-w-md lg:left-24">
          <EmptyState variant="card" size="md" className="bg-white">
            <EmptyStateIcon iconColor="secondary">
              <LayoutGrid />
            </EmptyStateIcon>
            <EmptyStateTitle>Plocha je prázdna</EmptyStateTitle>
            <EmptyStateDescription>Všetky okná sú zatvorené. Otvor ich znova alebo si vyber cez ⌘K.</EmptyStateDescription>
            <EmptyStateActions>
              <Button onClick={otvorVsetky}>Obnoviť všetky okná</Button>
            </EmptyStateActions>
          </EmptyState>
        </div>
      )}

      {/* ---------- okná na mobile (zoznam) ---------- */}
      <Sheet open={okna} onOpenChange={setOkna}>
        <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto" data-lenis-prevent>
          <SheetHeader>
            <SheetTitle className="font-display text-2xl font-extrabold uppercase">Okná systému</SheetTitle>
            <SheetDescription>
              {pocetOtvorenych} z {OKNA.length} otvorených. Ťukni a okno sa otvorí.
            </SheetDescription>
          </SheetHeader>
          <ul className="mt-4 grid list-none grid-cols-2 gap-2 p-0">
            {OKNA.map((o) => {
              const Ikona = IKONY[o.id];
              const s = sys.stav[o.id];
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOkna(false);
                      window.setTimeout(() => otvorOkno(o.id), 80);
                    }}
                    className={cn('flex min-h-12 w-full items-center gap-2 border-3 border-ink px-3 text-left font-bold', s === 'zatvorene' ? 'border-dashed bg-paper' : 'bg-white')}
                  >
                    <Ikona className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{o.skratka}</span>
                    <span className="font-mono text-[10px] uppercase">{s === 'otvorene' ? '' : s === 'min' ? 'min' : 'zatv.'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>

      {/* ---------- paleta ⌘K ---------- */}
      <Dialog open={paleta} onOpenChange={setPaleta}>
        <DialogContent hideClose className="top-[12%] translate-y-0 gap-0 p-0 sm:max-w-xl" data-lenis-prevent>
          <DialogTitle className="sr-only">Kam chceš ísť?</DialogTitle>
          <DialogDescription className="sr-only">Nemocničný systém XVADUR: okná, pacienti, texty, Hriech, Netopier, Korpus, hry, vyšetrenie</DialogDescription>
          <Command loop label="Kam chceš ísť?">
            <CommandInput placeholder="Okno, pacient, Hriech, Korpus, texty…" />
            <CommandList className="max-h-[60dvh]">
              <CommandEmpty>V systéme nič také nie je.</CommandEmpty>
              <CommandGroup heading="Okná">
                {OKNA.map((o) => {
                  const Ikona = IKONY[o.id];
                  return (
                    <CommandItem key={o.id} className={P} value={`okno ${o.nazov}`} keywords={[o.skratka, o.subor]} onSelect={zPalety(() => otvorOkno(o.id))}>
                      <Ikona className="h-4 w-4" /> {o.nazov}
                      <CommandShortcut>{sys.stav[o.id] === 'zatvorene' ? 'otvoriť' : o.subor}</CommandShortcut>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Pacienti">
                {PACIENTI.slice(0, 4).map((p) => (
                  <CommandItem key={p.id} className={P} value={p.nazov} keywords={p.stitky} onSelect={zPalety(() => otvorPacienta(p.id))}>
                    <User className="h-4 w-4" /> {p.nazov} <CommandShortcut>{p.cislo}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Médiá a dáta">
                <CommandItem className={P} value="hriech.xvadur.com" keywords={['hriech', 'médiá', 'diagnóza']} onSelect={chod('https://hriech.xvadur.com/', true)}>
                  <Newspaper className="h-4 w-4" /> Hriech · hriech.xvadur.com <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Netopier" keywords={['prepisy', 'overovanie', 'médiá']} onSelect={zPalety(() => otvorPacienta('netopier'))}>
                  <Database className="h-4 w-4" /> Netopier <CommandShortcut>detail</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Korpus vitálne funkcie" keywords={['slová', 'prompty', 'pulz', KORPUS.slova]} onSelect={zPalety(() => otvorOkno('vitalne'))}>
                  <Activity className="h-4 w-4" /> Korpus · vitálne funkcie <CommandShortcut>{KORPUS.slova} slov</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="štatistiky vitalne" keywords={['statistiky', 'korpus']} onSelect={chod('/vitalne/')}>
                  <Activity className="h-4 w-4" /> Štatistiky Korpusu <CommandShortcut>/vitalne/</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Hry a texty">
                <CommandItem className={P} value="Škrtací test hrať" keywords={['hra', 'frázy']} onSelect={zPalety(() => setHra(true))}>
                  <Scissors className="h-4 w-4" /> Škrtací test <CommandShortcut>hrať tu</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Všetky hry" onSelect={chod('/hry/')}>
                  <Gamepad2 className="h-4 w-4" /> Všetky hry <CommandShortcut>/hry/</CommandShortcut>
                </CommandItem>
                {posledny && (
                  <CommandItem className={P} value={`text ${posledny.title}`} keywords={['posledný text', 'článok']} onSelect={chod(`/texty/${posledny.id}/`)}>
                    <Newspaper className="h-4 w-4" /> {posledny.title}
                  </CommandItem>
                )}
                <CommandItem className={P} value="Všetky texty" keywords={['články', 'newsletter']} onSelect={chod('/texty/')}>
                  <Newspaper className="h-4 w-4" /> Všetky texty <CommandShortcut>/texty/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Substack" keywords={['newsletter', 'vydanie']} onSelect={chod(SUBSTACK_URL, true)}>
                  <Newspaper className="h-4 w-4" /> Substack <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Vyšetrenie a stránky">
                <CommandItem className={P} value="Vyšetrenie rezervácia termín" keywords={['konzultácia', 'objednať']} onSelect={zPalety(() => otvorOkno('vysetrenie'))}>
                  <ClipboardPlus className="h-4 w-4" /> Objednaj sa na vyšetrenie <CommandShortcut>{VLAJKA.trvanie}</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Zápis newsletter" keywords={['e-mail', 'vydanie', 'lákadlo']} onSelect={zPalety(() => otvorOkno('zapis'))}>
                  <MailPlus className="h-4 w-4" /> Zápis e-mailu
                </CommandItem>
                <CommandItem className={P} value="Domov xvadur.com" onSelect={chod('/')}>
                  <Home className="h-4 w-4" /> Domov xvadur.com <CommandShortcut>/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Makléri" onSelect={chod('/makleri/')}>
                  <ArrowRight className="h-4 w-4" /> Makléri <CommandShortcut>/makleri/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Skóre webu" onSelect={chod('/skore/')}>
                  <ArrowRight className="h-4 w-4" /> Skóre webu <CommandShortcut>/skore/</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Systém">
                <CommandItem className={P} value="Prehliadka systému" keywords={['pomoc', 'tour']} onSelect={zPalety(() => setTour(true))}>
                  <PanelBottom className="h-4 w-4" /> Prehliadka systému
                </CommandItem>
                <CommandItem className={P} value="Obnoviť všetky okná" onSelect={zPalety(otvorVsetky)}>
                  <LayoutGrid className="h-4 w-4" /> Obnoviť všetky okná
                </CommandItem>
                <CommandItem className={P} value="Spustiť boot znova" keywords={['reštart']} onSelect={bootZnova}>
                  <Power className="h-4 w-4" /> Spustiť boot znova
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <OknoHry open={hra} onOpenChange={setHra} />
      <DetailPacienta id={pacient} open={sheet} onOpenChange={setSheet} />

      {/* ---------- O systéme ---------- */}
      <Dialog open={oSysteme} onOpenChange={setOSysteme}>
        <DialogContent className="sm:max-w-lg" data-lenis-prevent>
          <DialogHeader>
            <p className="font-mono text-xs font-bold uppercase">XVADUR OS · V7-08</p>
            <DialogTitle className="font-display text-3xl font-extrabold uppercase">Nemocničný systém</DialogTitle>
            <DialogDescription className="text-base text-ink/75">
              Web ako plocha starého nemocničného systému. Bloky sú okná: ťaháš ich za lištu, zatváraš, maximalizuješ. Obsah je aj tak celý na stránke, aj bez klikania.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid gap-2 text-sm">
            {[
              [['⌘', 'K'], 'paleta systému (aj Ctrl K)'],
              [['2×', 'klik'], 'na lište: maximalizovať okno'],
              [['Esc'], 'obnoviť maximalizované okno'],
              [['pravý', 'klik'], 'na lište: menu okna'],
            ].map(([k, t]) => (
              <div key={String(t)} className="flex items-center gap-3 border-3 border-ink bg-white px-3 py-2">
                <dt className="shrink-0">
                  <KbdCombo keys={k as string[]} size="sm" />
                </dt>
                <dd>{t as string}</dd>
              </div>
            ))}
          </dl>
          <p className="font-mono text-xs">Čísla iba zo src/data/fakty.ts a /pulse.json · odkazy overené {OVERENE_DNA_TEXT}</p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOSysteme(false);
                window.setTimeout(() => setTour(true), 80);
              }}
            >
              Prehliadka
            </Button>
            <Button
              onClick={() => {
                setOSysteme(false);
                maximalizuj(null);
              }}
            >
              Rozumiem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tour steps={krokyTour} open={tour} onOpenChange={setTour} showProgress={false} onComplete={() => posli({ typ: 'hlasenie', text: 'Prehliadka hotová', popis: 'Ďalší pacient: ty.', druh: 'success' })} />

      <Toaster id={TOASTER} position="top-right" offset={72} mobileOffset={{ top: 64, left: 16, right: 16 }} visibleToasts={3} />
      <span className="sr-only" aria-live="polite">
        <Kbd className="sr-only">⌘K</Kbd>
      </span>
      <Badge className="sr-only">{pocetOtvorenych} okien otvorených</Badge>
    </>
  );
}
