/** Kit · Prekrytia: sheet.tsx (všetky štyri strany + širší variant) a drawer.tsx (vaul: zdola, snap body, sprava,
 *  bez zatvorenia ťahom). Obsah: Hriech (fakty.ts), menu (nav.ts), vitálne funkcie (ZIVE_CISLA = snímka pulse.json),
 *  liečba (ponuka.ts), cesta (cesta.ts). */
import * as React from 'react';
import { ArrowRight, Menu as MenuIcon } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NAV, DALSIE, KONZULTACIA_CTA } from '@/data/nav';
import { PRODUKTY, VLAJKA } from '@/data/ponuka';
import { CESTA } from '@/data/cesta';
import { Blok, Kus, PROJEKTY, Stav, ZIVE_CISLA, ZIVE_CISLA_SNIMKA } from './spolocne';

const hriech = PROJEKTY.find((p) => p.id === 'hriech')!;
const cislo = (n: number) => n.toLocaleString('sk-SK');

export default function Sheety() {
  const [snap, setSnap] = React.useState<number | string | null>(0.45);
  const [pevny, setPevny] = React.useState(false);

  return (
    <>
      <Kus
        id="sheet"
        meno="sheet"
        subor="src/components/ui/sheet.tsx"
        veta="Panel, ktorý vyjde z okraja obrazovky (side: top, right, bottom, left). Detail projektu vedľa zoznamu, mobilné menu, pás čísel, výber liečby."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Blok nazov="side=right (default) · detail projektu" pozn="w-3/4, od 640 px max-w-sm. Krížik vpravo hore (28 px — pod cieľom 44 px).">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Sheet>
                <SheetTrigger asChild>
                  <Button data-open="sheet-right">
                    Hriech · detail <ArrowRight aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col overflow-y-auto">
                  <SheetHeader className="pr-10">
                    <p className="eyebrow">Chorobopis · {hriech.stitky.join(' · ')}</p>
                    <SheetTitle className="font-display text-3xl font-extrabold">{hriech.nazov}</SheetTitle>
                    <SheetDescription className="text-base text-ink/75">{hriech.riadok}</SheetDescription>
                  </SheetHeader>
                  <p className="font-display text-6xl font-extrabold leading-none">{hriech.cislo}</p>
                  <p className="font-mono text-sm uppercase">{hriech.cisloPopis}</p>
                  <SheetFooter className="mt-auto gap-3">
                    <SheetClose asChild>
                      <Button variant="outline">Späť na zoznam</Button>
                    </SheetClose>
                    <Button asChild>
                      <a href={hriech.url!} target="_blank" rel="noopener noreferrer">
                        Otvoriť ↗
                      </a>
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </Blok>

          <Blok nazov="side=left · mobilné menu" pozn="NAV + DALSIE z nav.ts. SheetClose asChild okolo odkazu zavrie panel pri skoku na kotvu.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Otvoriť menu" data-open="sheet-left">
                    <MenuIcon aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col gap-2 overflow-y-auto bg-yellow">
                  <SheetHeader>
                    <SheetTitle className="font-display text-2xl font-extrabold">XVADUR</SheetTitle>
                    <SheetDescription className="text-ink/75">Kam ďalej?</SheetDescription>
                  </SheetHeader>
                  <nav aria-label="Menu v paneli" className="mt-4 flex flex-col gap-2">
                    {[...NAV, ...DALSIE].map((n) => (
                      <SheetClose asChild key={n.href}>
                        <a
                          href={n.href}
                          className="flex min-h-12 items-center justify-between border-3 border-ink bg-white px-4 font-display text-lg font-extrabold uppercase shadow-brutal-sm"
                        >
                          {n.label} <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        </a>
                      </SheetClose>
                    ))}
                  </nav>
                  <Button asChild variant="accent" size="lg" className="mt-4 text-ink">
                    <a href={KONZULTACIA_CTA.href}>{KONZULTACIA_CTA.label}</a>
                  </Button>
                </SheetContent>
              </Sheet>
              <span className="text-sm">ikonové tlačidlo, 44 × 44 px</span>
            </div>
          </Blok>

          <Blok nazov="side=top · pás vitálnych funkcií" pozn={`Čísla zo snímky Korpusu (${ZIVE_CISLA_SNIMKA}), rovnaké ako public/pulse.json.`}>
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" data-open="sheet-top">
                    Vitálne funkcie
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="bg-ink text-paper">
                  <SheetHeader className="pr-10">
                    <SheetTitle className="font-display text-2xl font-extrabold text-yellow">Vitálne funkcie</SheetTitle>
                    <SheetDescription className="text-paper/75">Snímka {ZIVE_CISLA_SNIMKA}</SheetDescription>
                  </SheetHeader>
                  <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {ZIVE_CISLA.map((z) => (
                      <div key={z.kluc} className="border-3 border-paper p-3">
                        <dt className="font-mono text-xs uppercase tracking-wider text-paper/70">{z.label}</dt>
                        <dd className="font-display text-3xl font-extrabold text-yellow">{cislo(z.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </SheetContent>
              </Sheet>
            </div>
          </Blok>

          <Blok nazov="side=bottom · výber liečby" pozn="inset-x-0, výška podľa obsahu; široké karty vo vodorovnom scrolle.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" data-open="sheet-bottom">
                    Liečba · produkty
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
                  <SheetHeader className="pr-10">
                    <SheetTitle>Liečba</SheetTitle>
                    <SheetDescription>{VLAJKA.nazov} {VLAJKA.trvanie} a čakárne produktov.</SheetDescription>
                  </SheetHeader>
                  <ul className="-mx-2 mt-4 flex snap-x gap-4 overflow-x-auto px-2 pb-3" role="list">
                    {PRODUKTY.map((p) => (
                      <li key={p.id} className={`w-64 shrink-0 snap-start border-3 border-ink p-4 shadow-brutal-sm ${p.farba}`}>
                        <p className="font-mono text-xs uppercase">{p.nalepka}</p>
                        <p className="mt-1 font-display text-xl font-extrabold uppercase leading-tight">{p.nazov}</p>
                        <p className="mt-2 text-sm">{p.pre}</p>
                      </li>
                    ))}
                  </ul>
                </SheetContent>
              </Sheet>
            </div>
          </Blok>
        </div>
      </Kus>

      <Kus
        id="drawer"
        meno="drawer"
        subor="src/components/ui/drawer.tsx (vaul)"
        veta="Zásuvka zdola, ktorú prstom stiahneš preč. Na mobile lepšia ako dialóg: rezervácia, detail hry, filter."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Blok nazov="Základ · zdola, ťahom zavrieť">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button data-open="drawer">Objednať vyšetrenie</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-lg">
                    <DrawerHeader>
                      <DrawerTitle className="font-display text-2xl font-extrabold">{VLAJKA.nazov}</DrawerTitle>
                      <DrawerDescription className="text-base text-ink/75">{VLAJKA.titulok}</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-wrap gap-2 px-4">
                      <Badge variant="secondary">{VLAJKA.trvanie}</Badge>
                      <Badge variant="outline">{VLAJKA.cena}</Badge>
                    </div>
                    <DrawerFooter>
                      <Button asChild variant="accent" size="lg" className="text-ink">
                        <a href="/konzultacia/#termin">Vybrať termín</a>
                      </Button>
                      <DrawerClose asChild>
                        <Button variant="outline">Neskôr</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </Blok>

          <Blok nazov="snapPoints [0.45, 1] · activeSnapPoint" pozn="Najprv polovica (náhľad), ťahom hore celá cesta. Obsah potrebuje h-full max-h-[96%].">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Drawer snapPoints={[0.45, 1]} activeSnapPoint={snap} setActiveSnapPoint={setSnap} fadeFromIndex={0}>
                <DrawerTrigger asChild>
                  <Button variant="outline" data-open="drawer-snap">
                    Anamnéza · polovica / celá
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-full max-h-[96%]">
                  <div className="mx-auto flex w-full max-w-lg flex-col overflow-y-auto">
                    <DrawerHeader>
                      <DrawerTitle>Z nemocnice k agentom</DrawerTitle>
                      <DrawerDescription>Snap bod: {snap === 1 ? 'celá' : 'polovica'}. Ťahaj za úchyt.</DrawerDescription>
                    </DrawerHeader>
                    <ol className="grid gap-3 px-4 pb-8">
                      {CESTA.map((k) => (
                        <li key={k.nazov} className="border-3 border-ink bg-white p-3">
                          <p className="font-mono text-xs uppercase text-ink/60">{k.kedy}</p>
                          <p className="font-display text-lg font-extrabold uppercase">{k.nazov}</p>
                          <p className="text-sm">{k.text}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </Blok>

          <Blok nazov="direction=right · className prebitý" pozn="DrawerContent má natvrdo bottom-0 a vodorovný úchyt; sprava treba prepísať inset a rám.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Drawer direction="right">
                <DrawerTrigger asChild>
                  <Button variant="outline" data-open="drawer-right">
                    Zásuvka sprava
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="inset-x-auto top-0 right-0 bottom-0 mt-0 w-[85%] max-w-sm border-3 border-r-0 shadow-[-8px_0_0_var(--color-ink)]">
                  <DrawerHeader>
                    <DrawerTitle>Chorobopisy</DrawerTitle>
                    <DrawerDescription>Potiahni doprava a zavrieš.</DrawerDescription>
                  </DrawerHeader>
                  <ul className="grid gap-2 px-4" role="list">
                    {PROJEKTY.slice(0, 4).map((p) => (
                      <li key={p.id} className="flex items-baseline justify-between gap-3 border-b-2 border-ink py-2">
                        <span className="font-bold">{p.nazov}</span>
                        <span className="font-mono text-sm">{p.cislo}</span>
                      </li>
                    ))}
                  </ul>
                </DrawerContent>
              </Drawer>
            </div>
          </Blok>

          <Blok nazov="dismissible={false} · kontrolovaný" pozn="Ťah, klik mimo ani Esc nezatvorí. Pozor: ani DrawerClose — vaul ignoruje onOpenChange(false), treba open + setOpen(false).">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>{pevny ? 'otvorené' : 'zatvorené'}</Stav>
              <Drawer dismissible={false} open={pevny} onOpenChange={setPevny}>
                <DrawerTrigger asChild>
                  <Button variant="outline" data-open="drawer-pevny">
                    Pevná zásuvka
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-lg">
                    <DrawerHeader>
                      <DrawerTitle>Pred hrou</DrawerTitle>
                      <DrawerDescription>Škrtací test beží iba v tvojom prehliadači. Nič sa neukladá ani neodosiela.</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <Button onClick={() => setPevny(false)}>Rozumiem</Button>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </Blok>
        </div>
      </Kus>
    </>
  );
}
