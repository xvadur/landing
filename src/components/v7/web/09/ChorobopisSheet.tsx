/** V7-09 · detail chorobopisu v BoldKit Sheet (desktop sprava, mobil zdola). Otvára ho klik na [data-z9-projekt]
 *  (statické karty v Chorobopisy.astro) alebo udalosť z palety ⌘K. Fakty a odkazy iba z fakty.ts. */
import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CHOROBOPISY, STAV_TEXT, type Chorobopis } from './data';
import { UDALOST, useMaloOkno } from './spolocne';

export default function ChorobopisSheet({ obrazky }: { obrazky: string[] }) {
  const [p, setP] = React.useState<Chorobopis | null>(null);
  const [open, setOpen] = React.useState(false);
  const malo = useMaloOkno();

  React.useEffect(() => {
    const otvor = (id: string | null | undefined) => {
      const c = CHOROBOPISY.find((x) => x.id === id);
      if (!c) return;
      setP(c);
      setOpen(true);
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-z9-projekt]') : null;
      if (!t) return;
      e.preventDefault();
      otvor(t.dataset.z9Projekt);
    };
    const onEvent = (e: Event) => otvor((e as CustomEvent<string>).detail);
    document.addEventListener('click', onClick);
    window.addEventListener(UDALOST.projekt, onEvent);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener(UDALOST.projekt, onEvent);
    };
  }, []);

  const obrazok = p?.obrazok && obrazky.includes(p.obrazok) ? p.obrazok : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={malo ? 'bottom' : 'right'} className={malo ? 'max-h-[88dvh] overflow-y-auto' : 'overflow-y-auto sm:max-w-lg'}>
        {p && (
          <div className="flex flex-col gap-5">
            <SheetHeader className="pr-10 text-left">
              <p className="font-mono text-xs font-bold tracking-[0.16em] uppercase">
                Chorobopis · {STAV_TEXT[p.stav]}
              </p>
              <SheetTitle className="font-display text-4xl leading-[0.9] font-extrabold uppercase">{p.nazov}</SheetTitle>
              <SheetDescription className="text-base text-ink/80">{p.riadok}</SheetDescription>
            </SheetHeader>
            {obrazok && (
              <div className="border-3 border-ink bg-yellow">
                <img src={obrazok} alt="" width={960} height={600} loading="lazy" className="aspect-[16/10] w-full object-cover object-top mix-blend-multiply grayscale contrast-125" />
              </div>
            )}
            <div>
              <p className="font-display text-6xl leading-none font-extrabold tabular-nums">{p.cislo}</p>
              <p className="mt-1 font-mono text-sm font-bold uppercase">{p.cisloPopis}</p>
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
                    <dt className="font-mono text-xs font-bold uppercase text-ink/70">{f.label}</dt>
                    <dd className="font-display text-2xl font-extrabold">{f.value}</dd>
                    <dd className="text-xs">{f.note}</dd>
                  </div>
                ))}
              </dl>
            )}
            {p.mal && p.dostal && (
              <>
                <Separator />
                <div className="grid gap-4">
                  <div>
                    <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Anamnéza · čo mal</p>
                    <ul className="mt-2 grid gap-2" role="list">
                      {p.mal.map((m) => (
                        <li key={m} className="border-l-4 border-stamp pl-3 text-base leading-snug">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Liečba · čo dostal</p>
                    <ul className="mt-2 grid gap-2" role="list">
                      {p.dostal.map((m) => (
                        <li key={m} className="border-l-4 border-ink bg-yellow/60 py-1 pl-3 text-base leading-snug">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {p.stavText && <p className="font-mono text-sm">{p.stavText}</p>}
                </div>
              </>
            )}
            <SheetFooter className="mt-2 gap-3 sm:justify-start">
              {p.url ? (
                <Button asChild>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {new URL(p.url).host} <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              ) : (
                <p className="font-mono text-sm">{p.poznamka ?? 'bez verejného odkazu'}</p>
              )}
              <Button asChild variant="accent">
                <a href="#vysetrenie" onClick={() => setOpen(false)}>
                  Ďalší chorobopis: tvoj →
                </a>
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
