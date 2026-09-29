/** V7-04 · Náramok pacienta = hlavička stránky (sticky). Na desktope pás náramku s čiarovým kódom, „PACIENT: TY“,
 *  časom prijatia a triážnou úrovňou (farba z pásky), vpravo ⌘K a CTA. Na mobile je to jediný pás hore: logo,
 *  úroveň, ⌘K, pod ním triážna páska vodorovne (päť úrovní, aktuálna sa roztiahne).
 *  Nesie aj paletu „Kam chceš ísť?“ (Dialog + Command, celý ekosystém), prehliadku triáže (tour) a Toaster variantu.
 *  Ostrov: <Naramok client:load posledny={…} /> */
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Database,
  Gamepad2,
  Map as MapIcon,
  Newspaper,
  Scissors,
  Search,
  Stethoscope,
  Bug,
  User,
  Activity,
  Mail,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { Button } from '@/components/ui/button';
import { Tour, useTour, type TourStep } from '@/components/ui/tour';
import { Toaster } from '@/components/ui/sonner';
import { TransitionPanel } from '@/components/vendor/motionprimitives/transition-panel';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import { KORPUS } from '@/data/fakty';
import { VLAJKA } from '@/data/ponuka';
import { cn } from '@/lib/utils';
import { FARBA_TRIEDY, TOASTER, UDALOST, ZONY } from './data';
import { chodNa, spustiSledovanie, useKlient, useMaloOkno, useZona } from './stav';

export type Text = { id: string; title: string; description: string; datum: string };

const SCHODY = { enter: { opacity: 0, y: 14 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -14 } };
const SCHODY_T = { duration: 0.2, ease: (t: number) => Math.ceil(t * 3) / 3 };

function KrokSk() {
  const { currentStep, totalSteps } = useTour();
  return (
    <p className="mt-2 font-mono text-xs uppercase tracking-wider">
      krok {currentStep + 1} z {totalSteps}
    </p>
  );
}

function Uroven({ z, kratko = false }: { z: number; kratko?: boolean }) {
  return (
    <TransitionPanel activeIndex={z - 1} variants={SCHODY} transition={SCHODY_T} className="overflow-hidden">
      {ZONY.map((zz) => (
        <span key={zz.n} className="block whitespace-nowrap">
          {kratko ? `Triáž ${zz.n} · ${zz.uroven}` : `Triáž ${zz.n} · ${zz.uroven} · ${zz.nazov}`}
        </span>
      ))}
    </TransitionPanel>
  );
}

export default function Naramok({ posledny }: { posledny: Text | null }) {
  const z = useZona();
  const klient = useKlient();
  const malo = useMaloOkno('(max-width: 1023px)');
  const [paleta, setPaleta] = useState(false);
  const [tour, setTour] = useState(false);

  useEffect(() => spustiSledovanie(), []);

  // ⌘K / Ctrl K: na tejto stránke preberá paletu variantu (window capture predbehne site CommandK na document)
  useEffect(() => {
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

  useEffect(() => {
    const on = () => setTour(true);
    window.addEventListener(UDALOST.prehliadka, on);
    return () => window.removeEventListener(UDALOST.prehliadka, on);
  }, []);

  const prijaty = useMemo(() => {
    if (!klient) return '—';
    return new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date());
  }, [klient]);

  const kroky: TourStep[] = useMemo(
    () =>
      ZONY.map((zz) => ({
        target: `[data-zona="${zz.n}"] .t-hlava`,
        title: `Triáž ${zz.n} · ${zz.uroven}`,
        description: `${zz.nazov}. ${zz.veta}`,
        placement: 'bottom' as const,
        content: <KrokSk />,
      })),
    [],
  );

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
  const udalost = (meno: string, detail?: string) => potom(() => window.dispatchEvent(new CustomEvent(meno, { detail })));
  const P = 'min-h-11 text-base';

  const akt = ZONY[z - 1]!;

  return (
    <>
      {/* ---------- desktop: náramok ---------- */}
      <div className="hidden h-[72px] items-center gap-4 border-b-3 border-ink bg-paper px-6 lg:flex">
        <div className="flex min-w-0 flex-1 items-stretch border-3 border-ink bg-white shadow-brutal-sm">
          <span className="flex w-12 shrink-0 items-center justify-center border-r-3 border-ink bg-paper" aria-hidden="true">
            <span className="h-5 w-5 rounded-full border-3 border-ink bg-white shadow-[2px_2px_0_0_var(--color-ink)]" />
          </span>
          <a href="#prijem" onClick={(e) => (e.preventDefault(), chodNa('prijem'))} className="flex shrink-0 items-center px-4" aria-label="XVADUR — na začiatok">
            <img src="/brand/xvadur-ink.svg" alt="XVADUR" width={120} height={23} className="h-5 w-auto" />
          </a>
          <span className="t-kod my-2 hidden w-20 shrink-0 xl:block" aria-hidden="true" />
          <dl className="flex min-w-0 flex-1 items-center gap-5 px-4 font-mono text-xs font-bold uppercase tracking-[0.12em]">
            <div className="flex gap-1.5 whitespace-nowrap">
              <dt className="text-ink/60">Pacient</dt>
              <dd>ty</dd>
            </div>
            <div className="hidden gap-1.5 whitespace-nowrap xl:flex">
              <dt className="text-ink/60">Prijatý</dt>
              <dd className="tabular-nums">{prijaty}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <dt className="sr-only">Triáž</dt>
              <dd className="t-prefarbi min-w-0 border-2 border-ink px-2 py-1">
                <Uroven z={z} />
              </dd>
            </div>
          </dl>
          <span className="hidden items-center gap-1.5 border-l-3 border-ink px-3 2xl:flex" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-3 w-3 rounded-full border-2 border-ink bg-paper" />
            ))}
          </span>
        </div>
        <Button variant="outline" onClick={() => setPaleta(true)} className="shrink-0 bg-white normal-case" aria-label="Kam chceš ísť? Paleta, skratka Ctrl K">
          <Search aria-hidden="true" /> Kam ísť
          <Kbd size="sm">⌘K</Kbd>
        </Button>
        <Button asChild variant="accent" className="shrink-0">
          <a href="#termin" onClick={(e) => (e.preventDefault(), chodNa('termin'))} data-track="konzultacia_klik" data-track-miesto="naramok">
            {VLAJKA.nazov} <ArrowRight aria-hidden="true" />
          </a>
        </Button>
      </div>

      {/* ---------- mobil: náramok + páska vodorovne ---------- */}
      <div className="border-b-3 border-ink bg-paper lg:hidden">
        <div className="flex h-14 items-center gap-2 px-4">
          <a href="#prijem" onClick={(e) => (e.preventDefault(), chodNa('prijem'))} className="flex h-11 w-11 shrink-0 items-center justify-center" aria-label="XVADUR — na začiatok">
            <img src="/brand/x.svg" alt="" width={32} height={32} className="w-8" />
          </a>
          {z === 2 ? (
            <a
              href="#termin"
              onClick={(e) => (e.preventDefault(), chodNa('termin'))}
              className="t-prefarbi flex min-h-11 min-w-0 flex-1 items-center border-3 border-ink px-3 font-mono text-xs font-bold uppercase tracking-[0.1em] shadow-brutal-sm"
            >
              Triáž 2 · objednaj sa →
            </a>
          ) : (
            <p className="t-prefarbi flex min-h-11 min-w-0 flex-1 items-center border-3 border-ink px-3 font-mono text-xs font-bold uppercase tracking-[0.1em]">
              <Uroven z={z} kratko />
            </p>
          )}
          <Button variant="outline" size="icon" onClick={() => setPaleta(true)} className="shrink-0 bg-white" aria-label="Kam chceš ísť? Navigácia">
            <Search aria-hidden="true" />
          </Button>
        </div>
        <div className="flex h-3 border-t-3 border-ink" aria-hidden="true">
          {ZONY.map((zz) => (
            <span
              key={zz.n}
              className={cn('h-full border-ink transition-[flex-grow] duration-300 [transition-timing-function:steps(3,end)]', FARBA_TRIEDY[zz.farba], zz.n > 1 && 'border-l-3')}
              style={{ flexGrow: zz.n === z ? 5 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* ---------- paleta: celý ekosystém ---------- */}
      <Dialog open={paleta} onOpenChange={setPaleta}>
        <DialogContent hideClose className="top-[10%] translate-y-0 gap-0 p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Kam chceš ísť?</DialogTitle>
          <DialogDescription className="sr-only">Triáž, texty, Hriech, Netopier, Korpus, hry a vyšetrenie</DialogDescription>
          <Command loop label="Kam chceš ísť?">
            <CommandInput placeholder="Vyšetrenie, Hriech, Korpus, hry, texty…" />
            <CommandList className="max-h-[60dvh]" data-lenis-prevent>
              <CommandEmpty>Nič také tu nie je.</CommandEmpty>
              <CommandGroup heading="Triáž · kam na stránke">
                {ZONY.map((zz) => (
                  <CommandItem key={zz.n} className={P} value={`Triáž ${zz.n} ${zz.nazov}`} keywords={[zz.uroven]} onSelect={potom(() => chodNa(zz.n === 2 ? 'termin' : zz.id))}>
                    <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink font-display font-extrabold', FARBA_TRIEDY[zz.farba])}>{zz.n}</span>
                    {zz.nazov}
                    <CommandShortcut>{zz.uroven}</CommandShortcut>
                  </CommandItem>
                ))}
                <CommandItem className={P} value="Prehliadka triáže" keywords={['sprievodca', 'tour']} onSelect={potom(() => setTour(true))}>
                  <MapIcon aria-hidden="true" /> Preveď ma triážou <CommandShortcut>5 krokov</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Vyšetrenie">
                <CommandItem className={P} value="Objednať sa na vyšetrenie" keywords={['konzultácia', 'termín', 'rezervácia']} onSelect={potom(() => chodNa('termin'))}>
                  <Stethoscope aria-hidden="true" /> Objednať sa na vyšetrenie <CommandShortcut>{VLAJKA.trvanie}</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Zápis do Vydania" keywords={['newsletter', 'e-mail']} onSelect={potom(() => chodNa('zapis'))}>
                  <Mail aria-hidden="true" /> Zápis do Vydania
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Médiá">
                <CommandItem className={P} value="Hriech" keywords={['diagnóza', 'médiá']} onSelect={udalost(UDALOST.chorobopis, 'hriech')}>
                  <Newspaper aria-hidden="true" /> Hriech <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="hriech.xvadur.com" keywords={['hriech', 'web']} onSelect={choď('https://hriech.xvadur.com/', true)}>
                  <Newspaper aria-hidden="true" /> hriech.xvadur.com <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Netopier" keywords={['prepisy', 'overovanie', 'médiá']} onSelect={udalost(UDALOST.chorobopis, 'netopier')}>
                  <Bug aria-hidden="true" /> Netopier <CommandShortcut>chorobopis</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Dáta a pacienti">
                <CommandItem className={P} value="Korpus" keywords={['slová', 'prompty', KORPUS.slova]} onSelect={udalost(UDALOST.chorobopis, 'korpus')}>
                  <Database aria-hidden="true" /> Korpus <CommandShortcut>{KORPUS.slova} slov</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Vitálne funkcie štatistiky" keywords={['korpus', 'pulz']} onSelect={choď('/vitalne/')}>
                  <Activity aria-hidden="true" /> Štatistiky Korpusu <CommandShortcut>/vitalne/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Jakub, maklér" keywords={['crm', 'rezervácie']} onSelect={udalost(UDALOST.chorobopis, 'system-pre-maklera')}>
                  <User aria-hidden="true" /> Jakub, maklér
                </CommandItem>
                <CommandItem className={P} value="Lucia, terapeutka" keywords={['web', 'rezervácie']} onSelect={udalost(UDALOST.chorobopis, 'terapeutka')}>
                  <User aria-hidden="true" /> Lucia, terapeutka
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Hry">
                <CommandItem className={P} value="Škrtací test" keywords={['hra', 'frázy']} onSelect={udalost(UDALOST.hra)}>
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
                <CommandItem className={P} value="Všetky texty" onSelect={choď('/texty/')}>
                  <BookOpen aria-hidden="true" /> Všetky texty <CommandShortcut>/texty/</CommandShortcut>
                </CommandItem>
                <CommandItem className={P} value="Substack" onSelect={choď(SUBSTACK_URL, true)}>
                  <BookOpen aria-hidden="true" /> Substack <CommandShortcut>↗</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <Tour steps={kroky} open={tour} onOpenChange={setTour} showProgress={false} />
      <Toaster id={TOASTER} position={malo ? 'top-center' : 'bottom-center'} />
      <span className="sr-only" aria-live="polite">
        {klient ? `Aktuálna triáž: ${akt.n}, ${akt.uroven}, ${akt.nazov}` : ''}
      </span>
    </>
  );
}
