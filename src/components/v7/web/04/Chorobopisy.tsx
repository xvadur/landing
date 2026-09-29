/** V7-04 · Triáž 4 · Chorobopisy (projekty). Dvaja pacienti (Jakub, Lucia) ako stoh spisov (LayeredCard), ostatné
 *  záznamy v mriežke. Karta otvorí chorobopis v sheete (desktop sprava, mobil zdola): mal / dostal, čísla, stav a
 *  odkaz iba s overeným 200 (fakty.ts). Paleta ⌘K otvára chorobopis udalosťou v704:chorobopis.
 *  Ostrov: <Chorobopisy client:visible /> */
import { useEffect, useState } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LayeredCard } from '@/components/ui/layered-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CHOROBOPISY, PRE_TEXT, STAV_TEXT, UDALOST, type Chorobopis } from './data';
import { useMaloOkno } from './stav';

const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

function StavBodka({ stav }: { stav: Chorobopis['stav'] }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase">
      <span className={cn('h-2.5 w-2.5 rounded-full border-2 border-ink', stav === 'zive' ? 'bg-stamp' : 'bg-paper')} aria-hidden="true" />
      {STAV_TEXT[stav]}
    </span>
  );
}

function Hlavicka({ c, i }: { c: Chorobopis; i: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-3 border-ink px-4 py-2 font-mono text-xs font-bold tracking-[0.12em] uppercase">
      <span>
        Chorobopis {String(i + 1).padStart(2, '0')} · {PRE_TEXT[c.pre]}
      </span>
      <StavBodka stav={c.stav} />
    </div>
  );
}

function Pacient({ c, i, otvor }: { c: Chorobopis; i: number; otvor: (id: string) => void }) {
  return (
    <LayeredCard layers="double" layerColor={i === 0 ? 'secondary' : 'primary'} offset="default" className="h-full">
      <article className="flex h-full flex-col bg-white">
        <Hlavicka c={c} i={i} />
        {c.obrazok ? (
          <img src={c.obrazok} alt="" width={960} height={600} loading="lazy" decoding="async" className="aspect-[16/9] w-full border-b-3 border-ink object-cover object-top" />
        ) : (
          <div className="tx-halftone flex aspect-[16/9] w-full flex-col justify-end border-b-3 border-ink bg-yellow p-4 [--tx:28%]">
            <p className="font-display text-[clamp(3rem,2rem+4vw,5rem)] leading-none font-extrabold tabular-nums">{c.cislo}</p>
            <p className="font-mono text-xs font-bold uppercase">{c.cisloPopis}</p>
          </div>
        )}
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {c.stitky.map((s) => (
              <Badge key={s} variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
                {s}
              </Badge>
            ))}
          </div>
          <h4 className="font-display text-3xl leading-none font-extrabold uppercase">{c.nazov}</h4>
          <p className="text-base leading-snug">{c.riadok}</p>
          <Button onClick={() => otvor(c.id)} className="mt-auto w-fit" aria-label={`Otvoriť chorobopis: ${c.nazov}`}>
            <FileText aria-hidden="true" /> Otvoriť chorobopis
          </Button>
        </div>
      </article>
    </LayeredCard>
  );
}

function Zaznam({ c, i, otvor }: { c: Chorobopis; i: number; otvor: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => otvor(c.id)}
      className="press flex h-full w-full flex-col border-3 border-ink bg-white text-left shadow-brutal-sm"
      aria-label={`Otvoriť chorobopis: ${c.nazov}`}
    >
      <Hlavicka c={c} i={i} />
      <span className="flex flex-1 flex-col gap-2 p-4">
        <span className="font-display text-2xl leading-none font-extrabold uppercase">{c.nazov}</span>
        <span className="font-display text-4xl leading-none font-extrabold tabular-nums">{c.cislo}</span>
        <span className="font-mono text-xs font-bold uppercase text-ink/70">{c.cisloPopis}</span>
        <span className="mt-1 text-sm leading-snug">{c.riadok}</span>
      </span>
    </button>
  );
}

export default function Chorobopisy() {
  const [id, setId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const malo = useMaloOkno();
  const otvor = (x: string) => {
    setId(x);
    setOpen(true);
  };
  useEffect(() => {
    const on = (e: Event) => {
      const x = (e as CustomEvent<string>).detail;
      if (x && CHOROBOPISY.some((c) => c.id === x)) otvor(x);
    };
    window.addEventListener(UDALOST.chorobopis, on);
    return () => window.removeEventListener(UDALOST.chorobopis, on);
  }, []);
  const c = CHOROBOPISY.find((x) => x.id === id) ?? null;
  const pacienti = CHOROBOPISY.filter((x) => x.pre === 'pacient');
  const ostatne = CHOROBOPISY.filter((x) => x.pre !== 'pacient');

  return (
    <>
      <ul className="grid gap-10 pr-3 pb-3 md:grid-cols-2" role="list">
        {pacienti.map((p) => (
          <li key={p.id}>
            <Pacient c={p} i={CHOROBOPISY.indexOf(p)} otvor={otvor} />
          </li>
        ))}
      </ul>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" role="list">
        {ostatne.map((p) => (
          <li key={p.id}>
            <Zaznam c={p} i={CHOROBOPISY.indexOf(p)} otvor={otvor} />
          </li>
        ))}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={malo ? 'bottom' : 'right'} className={cn('flex flex-col gap-5 overflow-y-auto bg-paper', malo ? 'max-h-[88dvh]' : 'sm:max-w-lg')} data-lenis-prevent>
          {c && (
            <>
              <SheetHeader className="pr-12 text-left">
                <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">
                  Chorobopis · {PRE_TEXT[c.pre]} · {STAV_TEXT[c.stav]}
                </p>
                <SheetTitle className="font-display text-4xl leading-none font-extrabold uppercase">{c.nazov}</SheetTitle>
                <SheetDescription className="text-base text-ink/80">{c.riadok}</SheetDescription>
              </SheetHeader>
              {c.obrazok && <img src={c.obrazok} alt="" width={960} height={600} className="aspect-[16/10] w-full border-3 border-ink object-cover object-top" />}
              <div className="border-3 border-ink bg-yellow p-4 shadow-brutal-sm">
                <p className="font-display text-6xl leading-none font-extrabold tabular-nums">{c.cislo}</p>
                <p className="mt-1 font-mono text-sm font-bold uppercase">{c.cisloPopis}</p>
              </div>
              {c.mal && c.dostal && (
                <div className="grid gap-4">
                  <div>
                    <p className="mb-2 font-mono text-xs font-bold tracking-[0.14em] uppercase">Anamnéza · čo mal</p>
                    <ul className="grid gap-2" role="list">
                      {c.mal.map((m) => (
                        <li key={m} className="border-3 border-ink bg-white p-3 text-sm leading-snug text-ink/80 line-through decoration-stamp decoration-2">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 font-mono text-xs font-bold tracking-[0.14em] uppercase">Liečba · čo dostal</p>
                    <ul className="grid gap-2" role="list">
                      {c.dostal.map((m) => (
                        <li key={m} className="flex gap-2 border-3 border-ink bg-white p-3 text-sm leading-snug">
                          <span aria-hidden="true">✚</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {c.fakty.length > 0 && (
                <dl className="grid grid-cols-2 gap-3">
                  {c.fakty.map((f) => (
                    <div key={f.label} className="border-3 border-ink bg-white p-3">
                      <dt className="font-mono text-[0.65rem] font-bold uppercase text-ink/60">{f.label}</dt>
                      <dd className="font-display text-2xl font-extrabold">{f.value}</dd>
                      <dd className="text-xs">{f.note}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {c.stavText && (
                <>
                  <Separator />
                  <p className="text-sm">
                    <b className="font-mono text-xs uppercase">Stav: </b>
                    {c.stavText}
                  </p>
                </>
              )}
              <SheetFooter className="mt-auto flex-row flex-wrap gap-3 sm:justify-start">
                {c.url ? (
                  <Button asChild>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" data-track="dokaz_klik" data-track-miesto={`v7-04-${c.id}`}>
                      {domena(c.url)} <ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                ) : (
                  <p className="font-mono text-sm">{c.poznamka ?? 'bez verejného odkazu'}</p>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
