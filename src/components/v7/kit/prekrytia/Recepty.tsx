/** Kit · Prekrytia — recepty „Hry a projekty z domova bez odchodu zo stránky“:
 *   1. Hry ako showcase: karta → dialóg (desktop) / drawer (mobil) s hrateľným náhľadom Škrtacieho testu (skrtni.ts).
 *   2. Chorobopisy: karta projektu → sheet sprava (desktop) / zdola (mobil) s detailom a faktami (fakty.ts).
 *   3. „Kam chceš ísť?“ ⌘K: celý ekosystém XVADUR; položky otvárajú dialóg/sheet/sprievodcu na mieste, von iba odkazy.
 *   4. Sprievodca domovom v 4 krokoch (#uvod, #anamneza, #liecba, #konzultacia = skutočné id domova), slovenské tlačidlá.
 *  Všetko v jednom ostrove, lebo paleta ovláda dialóg, sheet aj sprievodcu. */
import * as React from 'react';
import { ArrowRight, BookOpen, Database, Gamepad2, Home, Map, Newspaper, Scissors, Stethoscope, Bug, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { Tour, useTour, type TourStep } from '@/components/ui/tour';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KbdCombo } from '@/components/ui/kbd';
import { Textarea } from '@/components/ui/textarea';
import { skrtni, UKAZKA, type Skrt } from '@/components/hry/skrtni';
import { VLAJKA } from '@/data/ponuka';
import { KORPUS } from '@/data/fakty';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import { cn } from '@/lib/utils';
import { HRY, PROJEKTY, STAV_TEXT, useMaloOkno, type ProjektDetail } from './spolocne';

export type Text = { id: string; title: string; description: string; datum: string };

/* ---------------- 1. náhľad hry ---------------- */

function NahladHry() {
  const [text, setText] = React.useState(UKAZKA);
  const [vysledok, setVysledok] = React.useState<Skrt | null>(() => skrtni(UKAZKA));
  return (
    <div className="grid gap-4">
      <label htmlFor="kit-skrt" className="eyebrow">
        Tvoj text
      </label>
      <Textarea id="kit-skrt" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="text-base" />
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
        <p className="rounded-lg border-3 border-ink bg-white p-4 text-base leading-relaxed">
          {vysledok.segmenty.map((s, i) =>
            s.typ === 'text' ? (
              <React.Fragment key={i}>{s.text}</React.Fragment>
            ) : (
              <s key={i} className="decoration-stamp decoration-[3px] text-ink/50">
                {s.text}
              </s>
            ),
          )}
        </p>
      )}
    </div>
  );
}

/** Dialóg na desktope, drawer na mobile — ten istý obsah. */
function Okno({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const malo = useMaloOkno();
  if (malo)
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92dvh]">
          <div className="overflow-y-auto px-4 pb-8">
            <DrawerHeader className="px-0">
              <DrawerTitle className="font-display text-2xl font-extrabold">{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold">{title}</DialogTitle>
          <DialogDescription className="text-base text-ink/75">{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- 2. detail projektu ---------------- */

function DetailProjektu({ p, open, onOpenChange }: { p: ProjektDetail | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const malo = useMaloOkno();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={malo ? 'bottom' : 'right'}
        className={cn('flex flex-col gap-5 overflow-y-auto', malo ? 'max-h-[88dvh]' : 'sm:max-w-md')}
      >
        {p && (
          <>
            <SheetHeader className="pr-10">
              <p className="eyebrow">Chorobopis · {STAV_TEXT[p.stav]}</p>
              <SheetTitle className="font-display text-3xl font-extrabold">{p.nazov}</SheetTitle>
              <SheetDescription className="text-base text-ink/75">{p.riadok}</SheetDescription>
            </SheetHeader>
            {p.obrazok && (
              <img src={p.obrazok} alt="" width={960} height={600} className="aspect-[16/10] w-full border-3 border-ink object-cover object-top" />
            )}
            <div>
              <p className="font-display text-6xl font-extrabold leading-none">{p.cislo}</p>
              <p className="mt-1 font-mono text-sm uppercase">{p.cisloPopis}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.stitky.map((s) => (
                <Badge key={s} variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
                  {s}
                </Badge>
              ))}
            </div>
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
            <SheetFooter className="mt-auto gap-3">
              {p.url ? (
                <Button asChild>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {new URL(p.url).host} ↗
                  </a>
                </Button>
              ) : (
                <p className="font-mono text-sm">{p.poznamka ?? 'bez verejného odkazu'}</p>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ---------------- 4. sprievodca domovom ---------------- */

/** Počítadlo krokov cez useTour(); tlačidlá sú slovenské priamo v tour.tsx (labels). */
function KrokSk() {
  const { currentStep, totalSteps } = useTour();
  return (
    <p className="mt-2 font-mono text-xs uppercase tracking-wider">
      krok {currentStep + 1} zo {totalSteps}
    </p>
  );
}

const KROKY_DOMOV: TourStep[] = [
  { target: '#uvod', title: '1 · Príjem', description: 'Ahoj, som Adam. Zdravotník, ktorý stavia AI agentov. Tu zistíš, kto ťa prijíma.', placement: 'bottom', content: <KrokSk /> },
  { target: '#anamneza', title: '2 · Anamnéza', description: 'Z nemocnice k agentom: päť zastávok mojej cesty.', placement: 'right', content: <KrokSk /> },
  { target: '#liecba', title: '3 · Liečba', description: 'Triáž, zásah, odovzdanie. Postup ako na zmene.', placement: 'left', content: <KrokSk /> },
  {
    target: '#konzultacia',
    title: '4 · Vyšetrenie',
    description: `${VLAJKA.trvanie}, ${VLAJKA.cena.toLowerCase()}. ${VLAJKA.titulok}`,
    placement: 'top',
    content: <KrokSk />,
  },
];

function MiniDomov() {
  const blok = 'rounded-lg border-3 border-ink p-5 shadow-brutal-sm';
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-label="Zmenšený domov pre sprievodcu">
      <section id="uvod" className={cn(blok, 'tx-dots bg-paper md:col-span-2')}>
        <p className="eyebrow">Príjem</p>
        <p className="font-display text-display-xs font-extrabold">
          Ahoj, som <span className="font-serif font-normal italic">Adam</span>
          <span className="text-hot">.</span>
        </p>
        <p className="font-mono text-sm uppercase">✚ zdravotník, ktorý stavia AI agentov</p>
      </section>
      <section id="anamneza" className={cn(blok, 'bg-white')}>
        <p className="eyebrow">✚ 01 · Anamnéza</p>
        <p className="font-display text-2xl font-extrabold uppercase">Z nemocnice k agentom</p>
      </section>
      <section id="liecba" className={cn(blok, 'bg-yellow')}>
        <p className="eyebrow">✚ 03 · Liečba</p>
        <p className="font-display text-2xl font-extrabold uppercase">Triáž. Zásah. Odovzdanie.</p>
      </section>
      <section id="konzultacia" className={cn(blok, 'bg-ink text-paper md:col-span-2')}>
        <p className="eyebrow text-yellow">Vyšetrenie</p>
        <p className="font-display text-2xl font-extrabold uppercase">{VLAJKA.titulok}</p>
      </section>
    </div>
  );
}

/* ---------------- recepty ---------------- */

function Recept({ cislo, nazov, veta, kusy, children }: { cislo: string; nazov: string; veta: string; kusy: string; children: React.ReactNode }) {
  return (
    <article className="border-t-3 border-ink py-10">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-mono text-sm font-bold">Recept {cislo}</span>
        <h3 className="font-display text-display-xs font-extrabold uppercase leading-none">{nazov}</h3>
      </div>
      <p className="mt-3 max-w-2xl text-lg">{veta}</p>
      <p className="mt-1 font-mono text-xs text-ink/60">{kusy}</p>
      <div className="mt-6">{children}</div>
    </article>
  );
}

export default function Recepty({ posledny }: { posledny: Text | null }) {
  const [hra, setHra] = React.useState(false);
  const [projekt, setProjekt] = React.useState<ProjektDetail | null>(null);
  const [sheet, setSheet] = React.useState(false);
  const [paleta, setPaleta] = React.useState(false);
  const [tour, setTour] = React.useState(false);
  const [vysetrenie, setVysetrenie] = React.useState(false);
  const [text, setText] = React.useState(false);
  const malo = useMaloOkno();
  /** Na mobile vedľa cieľa nie je miesto: right/left → bottom, inak okno prekryje cieľ. */
  const krokyDomov = React.useMemo(
    () => KROKY_DOMOV.map((k) => (malo && (k.placement === 'left' || k.placement === 'right') ? { ...k, placement: 'bottom' as const } : k)),
    [malo],
  );

  // ⌘K / Ctrl K: na tejto stránke preberá paletu receptu (window capture predbehne site/CommandK na document).
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

  const otvorProjekt = (id: string) => {
    setProjekt(PROJEKTY.find((p) => p.id === id) ?? null);
    setSheet(true);
  };
  /** Paleta sa najprv zavrie, potom sa otvorí cieľ (dva modály naraz = dva fokus trapy). */
  const z = (f: () => void) => () => {
    setPaleta(false);
    window.setTimeout(f, 60);
  };
  const choď = (href: string, von = false) => () => {
    setPaleta(false);
    if (von) window.open(href, '_blank', 'noopener,noreferrer');
    else window.location.assign(href);
  };
  const P = 'min-h-11 text-base';

  return (
    <section id="recepty" aria-labelledby="recepty-h" className="scroll-mt-24 border-t-4 border-ink py-12 sm:py-16">
      <p className="eyebrow">Recepty · Hry a projekty z domova</p>
      <h2 id="recepty-h" className="mt-3 font-display text-display-sm font-extrabold uppercase">
        Bez odchodu zo stránky.
      </h2>
      <p className="mt-4 max-w-2xl text-lg">
        Hry a projekty sa otvárajú nad domovom: náhľad hry v dialógu, detail projektu v sheete, celý ekosystém cez ⌘K a
        prehliadka domova v štyroch krokoch.
      </p>

      <Recept cislo="1" nazov="Hry ako showcase" veta="Karta hry otvorí hrateľný náhľad. Desktop = dialóg, mobil = drawer. Hry v stavbe majú popover, nie mŕtvy odkaz." kusy="dialog · drawer · popover · textarea · skrtni.ts">
        <ol className="grid gap-5 md:grid-cols-3" role="list">
          {HRY.map((h) => (
            <li
              key={h.id}
              className={cn(
                'relative flex min-h-64 flex-col gap-4 rounded-lg border-3 border-ink p-6 shadow-brutal',
                h.href ? 'lift bg-yellow' : 'tx-halftone bg-white',
              )}
            >
              {!h.href && <span className="sticker absolute -top-4 -right-2 text-xs [--sticker-rotate:6deg]">V stavbe</span>}
              <p className="eyebrow">Hra {h.cislo}</p>
              <p className="font-display text-3xl font-extrabold uppercase leading-none">{h.nazov}</p>
              {h.text && <p className="text-base">{h.text}</p>}
              <div className="mt-auto">
                {h.href ? (
                  <Button onClick={() => setHra(true)} data-open="recept-hra" size="lg">
                    <Gamepad2 aria-hidden="true" /> Hrať tu
                  </Button>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Čo to bude?</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 max-w-[calc(100vw-2rem)]">
                      <p className="font-display text-lg font-extrabold uppercase">{h.nazov}</p>
                      <p className="mt-1 text-sm">V stavbe. Popis doplní Adam, keď bude hra hotová.</p>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </li>
          ))}
        </ol>
        <Okno open={hra} onOpenChange={setHra} title="Škrtací test" description="Vlož svoj text. Škrtneme frázy, ktoré má každý. Beží iba v tvojom prehliadači.">
          <NahladHry />
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="accent">
              <a href="/hry/skrtaci-test/">
                Celá hra <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/hry/">Všetky hry</a>
            </Button>
          </div>
        </Okno>
      </Recept>

      <Recept cislo="2" nazov="Chorobopisy v sheete" veta="Zoznam ostáva na mieste, detail vyjde sprava (mobil zdola). Fakty a odkaz iba z fakty.ts, bez overeného odkazu len poznámka." kusy="sheet · badge · fakty.ts">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {PROJEKTY.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => otvorProjekt(p.id)}
                data-open={i === 0 ? 'recept-sheet' : undefined}
                className="lift press flex min-h-36 w-full flex-col items-start gap-2 rounded-lg border-3 border-ink bg-white p-5 text-left shadow-brutal-sm"
              >
                <span className="eyebrow">{p.stitky.join(' · ')}</span>
                <span className="font-display text-2xl font-extrabold uppercase leading-none">{p.nazov}</span>
                <span className="font-mono text-lg font-bold">{p.cislo}</span>
                <span className="text-sm">{p.cisloPopis}</span>
              </button>
            </li>
          ))}
        </ul>
        <DetailProjektu p={projekt} open={sheet} onOpenChange={setSheet} />
      </Recept>

      <Recept cislo="3" nazov="Kam chceš ísť? ⌘K" veta="Jedna paleta pre celý ekosystém XVADUR. Hra, projekty a vyšetrenie sa otvoria na mieste; von vedú iba texty a overené odkazy." kusy="command (Dialog + Command) · dialog · sheet · tour · filter bez diakritiky (predvolený)">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" variant="secondary" onClick={() => setPaleta(true)} data-open="recept-paleta">
            Kam chceš ísť?
          </Button>
          <KbdCombo keys={['⌘', 'K']} />
          <span className="text-sm">alebo Ctrl K</span>
        </div>
        {/* Dialog + Command: vlastná poloha okna; filter bez diakritiky je v Command predvolený. */}
        <Dialog open={paleta} onOpenChange={setPaleta}>
          <DialogContent hideClose className="top-[12%] translate-y-0 gap-0 p-0 sm:max-w-xl">
            <DialogTitle className="sr-only">Kam chceš ísť?</DialogTitle>
            <DialogDescription className="sr-only">Ekosystém XVADUR: texty, Hriech, Netopier, Korpus, hry, vyšetrenie</DialogDescription>
            <Command loop label="Kam chceš ísť?">
          <CommandInput placeholder="Hry, Hriech, Korpus, texty, vyšetrenie…" />
          <CommandList className="max-h-[60dvh]">
            <CommandEmpty>Nič také tu nie je.</CommandEmpty>
            <CommandGroup heading="Hry">
              <CommandItem className={P} value="Škrtací test" keywords={['hra', 'frázy']} onSelect={z(() => setHra(true))}>
                <Scissors aria-hidden="true" /> Škrtací test <CommandShortcut>hrať tu</CommandShortcut>
              </CommandItem>
              <CommandItem className={P} value="Všetky hry" onSelect={choď('/hry/')}>
                <Gamepad2 aria-hidden="true" /> Všetky hry <CommandShortcut>/hry/</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Médiá">
              <CommandItem className={P} value="Hriech" keywords={['diagnóza', 'médiá']} onSelect={z(() => otvorProjekt('hriech'))}>
                <Newspaper aria-hidden="true" /> Hriech <CommandShortcut>detail</CommandShortcut>
              </CommandItem>
              <CommandItem className={P} value="hriech.xvadur.com" keywords={['hriech', 'web']} onSelect={choď('https://hriech.xvadur.com/', true)}>
                <Newspaper aria-hidden="true" /> hriech.xvadur.com <CommandShortcut>↗</CommandShortcut>
              </CommandItem>
              <CommandItem className={P} value="Netopier" keywords={['prepisy', 'overovanie', 'médiá']} onSelect={z(() => otvorProjekt('netopier'))}>
                <Bug aria-hidden="true" /> Netopier <CommandShortcut>detail</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Dáta a pacienti">
              <CommandItem className={P} value="Korpus" keywords={['slová', 'prompty', KORPUS.slova]} onSelect={z(() => otvorProjekt('korpus'))}>
                <Database aria-hidden="true" /> Korpus <CommandShortcut>{KORPUS.slova} slov</CommandShortcut>
              </CommandItem>
              <CommandItem className={P} value="Jakub, maklér" keywords={['crm', 'rezervácie']} onSelect={z(() => otvorProjekt('system-pre-maklera'))}>
                <User aria-hidden="true" /> Jakub, maklér
              </CommandItem>
              <CommandItem className={P} value="Lucia, terapeutka" keywords={['web', 'rezervácie']} onSelect={z(() => otvorProjekt('terapeutka'))}>
                <User aria-hidden="true" /> Lucia, terapeutka
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Texty">
              {posledny && (
                <CommandItem className={P} value={posledny.title} keywords={['text', 'článok']} onSelect={z(() => setText(true))}>
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
            <CommandSeparator />
            <CommandGroup heading="Domov">
              <CommandItem className={P} value="Vyšetrenie" keywords={['konzultácia', 'termín']} onSelect={z(() => setVysetrenie(true))}>
                <Stethoscope aria-hidden="true" /> Vyšetrenie <CommandShortcut>{VLAJKA.trvanie}</CommandShortcut>
              </CommandItem>
              <CommandItem className={P} value="Prehliadka domova" keywords={['sprievodca', 'tour']} onSelect={z(() => setTour(true))}>
                <Map aria-hidden="true" /> Prehliadka domova <CommandShortcut>4 kroky</CommandShortcut>
              </CommandItem>
              <CommandItem className={P} value="Domov" onSelect={choď('/')}>
                <Home aria-hidden="true" /> Domov <CommandShortcut>/</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
            </Command>
          </DialogContent>
        </Dialog>

        <Dialog open={vysetrenie} onOpenChange={setVysetrenie}>
          <DialogContent>
            <DialogHeader>
              <p className="eyebrow">
                ✚ {VLAJKA.trvanie} · {VLAJKA.cena}
              </p>
              <DialogTitle className="font-display text-2xl font-extrabold">{VLAJKA.nazov}</DialogTitle>
              <DialogDescription className="text-base text-ink/75">{VLAJKA.titulok}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button asChild variant="accent">
                <a href="/konzultacia/#termin">Vybrať termín</a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {posledny && (
          <Dialog open={text} onOpenChange={setText}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <p className="eyebrow">Posledný text · {posledny.datum}</p>
                <DialogTitle className="font-display text-2xl font-extrabold">{posledny.title}</DialogTitle>
                <DialogDescription className="font-serif text-xl italic text-ink">{posledny.description}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-3">
                <Button asChild>
                  <a href={`/texty/${posledny.id}/`}>Čítať →</a>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </Recept>

      <Recept cislo="4" nazov="Prehliadka domova v 4 krokoch" veta="Tour so slovenskými tlačidlami (predvolené labels) a počítadlom cez useTour(). Ciele majú skutočné id domova, na webe stačí zmeniť iba spúšťač." kusy="tour · useTour · #uvod #anamneza #liecba #konzultacia">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button onClick={() => setTour(true)} data-open="recept-tour" size="lg">
            <Map aria-hidden="true" /> Preveď ma domovom
          </Button>
        </div>
        <MiniDomov />
        <Tour steps={krokyDomov} open={tour} onOpenChange={setTour} showProgress={false} />
      </Recept>
    </section>
  );
}

