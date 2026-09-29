/** Čo som postavil (Pacienti): systémy z DOKAZY (src/data/fakty.ts) ako redakčná mriežka. Karta s obrázkom je veľká,
 *  karta bez obrázka nesie obrie číslo. Klik otvorí detail v Sheete (desktop sprava, mobil zdola) — návštevník
 *  neodchádza zo stránky. Bez domén, ktoré neodpovedajú (stav „čoskoro“), bez zdravotných dát, bez tohto webu.
 *  BoldKit: Sheet, Badge, Button. Ostrov: client:visible. */
import * as React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { DOKAZY, type Dokaz } from '@/data/fakty';
import { cn } from '@/lib/utils';

const KARTY = DOKAZY.filter(
  (d) => d.stav !== 'coskoro' && d.id !== 'vlastne-data' && d.id !== 'xvadur-com' && !/zdravot/i.test(d.nazov),
);
const STAV: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };
const FARBY = ['bg-white', 'bg-yellow', 'bg-white', 'bg-paper', 'bg-white', 'bg-yellow', 'bg-white'];
const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

function useMobil() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const nastav = () => setM(mq.matches);
    nastav();
    mq.addEventListener('change', nastav);
    return () => mq.removeEventListener('change', nastav);
  }, []);
  return m;
}

export default function Projekty() {
  const [otvoreny, setOtvoreny] = React.useState<Dokaz | null>(null);
  const mobil = useMobil();

  return (
    <>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        {KARTY.map((d, i) => {
          const velka = Boolean(d.obrazok);
          return (
            <li key={d.id} className={cn(velka ? 'lg:col-span-3' : 'lg:col-span-2')}>
              <button
                type="button"
                onClick={() => setOtvoreny(d)}
                className={cn(
                  'group lift press flex h-full w-full flex-col overflow-hidden border-3 border-ink text-left shadow-brutal',
                  FARBY[i % FARBY.length],
                )}
                aria-haspopup="dialog"
              >
                {velka ? (
                  <span className="block aspect-[16/10] overflow-hidden border-b-3 border-ink bg-ink">
                    <img
                      src={d.obrazok!}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </span>
                ) : (
                  <span className="flex aspect-[16/10] items-center justify-center border-b-3 border-ink bg-ink px-4 font-display text-[clamp(2.6rem,1.6rem+3vw,4.5rem)] leading-none font-extrabold text-yellow tabular-nums">
                    {d.cislo}
                  </span>
                )}
                <span className="flex flex-1 flex-col gap-3 p-5">
                  <span className="flex flex-wrap gap-2">
                    {d.stitky.map((s) => (
                      <Badge key={s} variant="outline" className="bg-white font-mono text-xs">
                        {s}
                      </Badge>
                    ))}
                  </span>
                  <span className="font-display text-2xl leading-tight font-extrabold uppercase sm:text-3xl">{d.nazov}</span>
                  <span className="text-base leading-snug">{d.riadok}</span>
                  <span className="mt-auto flex items-center justify-between pt-2 font-mono text-sm uppercase tracking-[0.12em]">
                    <span>{STAV[d.stav]}</span>
                    <span aria-hidden="true">Detail →</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Sheet open={otvoreny !== null} onOpenChange={(o) => !o && setOtvoreny(null)}>
        <SheetContent side={mobil ? 'bottom' : 'right'} className="overflow-y-auto bg-paper sm:max-w-lg" data-lenis-prevent>
          {otvoreny && (
            <div className="flex flex-col gap-6 pt-4">
              <SheetHeader className="text-left">
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-ink/70">Chorobopis · {STAV[otvoreny.stav]}</p>
                <SheetTitle className="font-display text-4xl leading-none font-extrabold uppercase">{otvoreny.nazov}</SheetTitle>
                <SheetDescription className="text-lg leading-snug text-ink">{otvoreny.riadok}</SheetDescription>
              </SheetHeader>
              {otvoreny.obrazok && (
                <img src={otvoreny.obrazok} alt="" className="block w-full border-3 border-ink shadow-brutal-sm" loading="lazy" />
              )}
              <div className="border-3 border-ink bg-ink p-5 text-paper">
                <p className="font-display text-5xl leading-none font-extrabold text-yellow tabular-nums">{otvoreny.cislo}</p>
                <p className="mt-2 font-mono text-sm uppercase tracking-[0.12em] text-paper/75">{otvoreny.cisloPopis}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {otvoreny.stitky.map((s) => (
                  <Badge key={s} variant="secondary" className="font-mono text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
              {otvoreny.url ? (
                <a
                  href={otvoreny.url}
                  target="_blank"
                  rel="noopener"
                  className="press inline-flex min-h-12 w-fit items-center gap-2 border-3 border-ink bg-white px-5 font-display font-extrabold uppercase shadow-brutal-sm"
                >
                  {domena(otvoreny.url)} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <p className="font-mono text-sm uppercase tracking-[0.12em] text-ink/70">Beží interne, verejný odkaz zatiaľ nie je.</p>
              )}
              <a
                href="#konzultacia"
                onClick={() => setOtvoreny(null)}
                className="press inline-flex min-h-12 w-fit items-center gap-2 rounded-lg border-3 border-ink bg-hot px-5 font-display font-extrabold uppercase text-ink shadow-brutal-sm"
              >
                Chcem niečo podobné <span aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
