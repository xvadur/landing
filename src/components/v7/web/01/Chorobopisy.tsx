/** V7-01 · obrazovka Chorobopisy: centrálna stanica monitorov. Každý systém, ktorý Adam postavil, je jeden monitor
 *  pacienta (stav, číslo, EKG: živé bije, interné je rovná čiara). Klik otvorí detail v Sheete (desktop sprava, mobil
 *  zdola). Dáta: DOKAZY + POSTAVIL + PRIPAD_* z fakty.ts, obrázky z /public/assets. Paleta ⌘K otvára detail udalosťou
 *  `m01:pacient`. Kusy: sheet, badge, donut-chart, separator, button, empty-state (žiadny). Ostrov: client:visible. */
import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DonutChart, DonutChartCenter, type DonutChartData } from '@/components/ui/donut-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { MARQUEE_FAKTY, POSTAVIL } from '@/data/fakty';
import { cn } from '@/lib/utils';
import { PACIENTI, domena, stavText, type Pacient } from './data';
import { FARBA, useAlarm, useMaloOkno, useRedukovane } from './klient';

const bezPosunu = 'shadow-none hover:translate-x-0 hover:translate-y-0';

/* sito trhového datasetu: 441 zo 459 webov (fakty.ts: MARQUEE_FAKTY + POSTAVIL trhovy-dataset) */
const PREHLADANE = Number((MARQUEE_FAKTY.find((f) => f.label === 'Realitné weby')?.value ?? '').replace(/\D/g, ''));
const S_TEXTOM = Number(
  (POSTAVIL.find((p) => p.id === 'trhovy-dataset')?.fakty.find((f) => f.label === 'Weby')?.value ?? '').replace(/\D/g, ''),
);
const WEBY: DonutChartData[] = [
  { name: 'stextom', value: S_TEXTOM, fill: FARBA.zlta },
  { name: 'beztextu', value: PREHLADANE - S_TEXTOM, fill: FARBA.ink },
];
const CFG_WEBY: ChartConfig = {
  stextom: { label: 'weby s textovými blokmi', color: FARBA.zlta },
  beztextu: { label: 'weby bez textových blokov', color: FARBA.ink },
};

/** Podpis na texte: pri alarme sa číslice zmenia na pomlčky a po schodoch sa zľava prekreslia späť (bez náhodných čísel). */
function Prekresli({ text, tik }: { text: string; tik: number }) {
  const reduced = useRedukovane();
  const [krok, setKrok] = React.useState(-1);
  const cislic = React.useMemo(() => text.replace(/\D/g, '').length, [text]);
  React.useEffect(() => {
    if (!tik || reduced) return;
    let k = 0;
    setKrok(0);
    const t = window.setInterval(() => {
      k += 1;
      if (k > cislic) {
        window.clearInterval(t);
        setKrok(-1);
      } else setKrok(k);
    }, 70);
    return () => window.clearInterval(t);
  }, [tik, reduced, cislic]);
  if (krok < 0) return <>{text}</>;
  let n = 0;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{text.replace(/\d/g, (d) => (n++ < krok ? d : '–'))}</span>
    </>
  );
}

function Ekg({ zive }: { zive: boolean }) {
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="h-8 w-full" aria-hidden="true">
      <path
        className={zive ? 'm01-ekg-bije' : undefined}
        d={zive ? 'M0 24 L60 24 L70 20 L78 24 L86 24 L92 30 L100 4 L108 36 L114 24 L130 24 L142 17 L154 24 L200 24' : 'M0 24 L200 24'}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function Monitor({ p, i, tik, onOpen }: { p: Pacient; i: number; tik: number; onOpen: () => void }) {
  const zive = p.stav === 'zive';
  const tmavy = i === 0 || p.id === 'korpus';
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'm01-pacient group flex h-full w-full flex-col border-3 border-ink text-left shadow-[5px_5px_0_0_var(--color-ink)]',
        tmavy ? 'bg-ink text-paper' : 'bg-white text-ink',
      )}
      aria-label={`Chorobopis ${p.nazov}: ${p.cislo} ${p.cisloPopis}. Otvoriť detail.`}
    >
      <span className={cn('flex items-center justify-between gap-2 border-b-3 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em]', tmavy ? 'border-paper/30' : 'border-ink')}>
        <span>Chorobopis {String(i + 1).padStart(2, '0')}</span>
        <span className="flex items-center gap-1.5">
          <span className={cn('m01-bod', zive ? 'm01-bod-zlta' : 'm01-bod-stoji')} aria-hidden="true" />
          {stavText(p.stav)}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-2 p-3">
        <span className="font-display text-2xl leading-[0.95] font-extrabold uppercase">{p.nazov}</span>
        <span className={cn('block', zive ? (tmavy ? 'text-yellow' : 'text-stamp') : tmavy ? 'text-paper/50' : 'text-ink/40')}>
          <Ekg zive={zive} />
        </span>
        <span className="mt-auto flex flex-col">
          <span className={cn('font-display text-3xl leading-none font-extrabold whitespace-nowrap tabular-nums', tmavy && 'text-yellow')}>
            <Prekresli text={p.cislo} tik={tik} />
          </span>
          <span className="mt-1 font-mono text-[11px] font-bold uppercase leading-tight">{p.cisloPopis}</span>
        </span>
      </span>
      <span className={cn('border-t-3 px-3 py-2 font-mono text-xs font-bold uppercase', tmavy ? 'border-paper/30 group-hover:bg-yellow group-hover:text-ink' : 'border-ink group-hover:bg-yellow')}>
        Otvoriť chorobopis →
      </span>
    </button>
  );
}

function Detail({ p, open, onOpenChange }: { p: Pacient | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const malo = useMaloOkno();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={malo ? 'bottom' : 'right'} className={cn('flex flex-col gap-5 overflow-y-auto bg-paper', malo ? 'max-h-[88dvh]' : 'sm:max-w-md')} data-lenis-prevent>
        {p && (
          <>
            <SheetHeader className="pr-10 text-left">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">Chorobopis · {stavText(p.stav)}</p>
              <SheetTitle className="font-display text-3xl font-extrabold">{p.nazov}</SheetTitle>
              <SheetDescription className="text-base text-ink/75">{p.riadok}</SheetDescription>
            </SheetHeader>
            {p.obrazok && (
              <img src={p.obrazok} alt="" width={960} height={600} loading="lazy" className="aspect-[16/10] w-full border-3 border-ink object-cover object-top" />
            )}
            <div>
              <p className="font-display text-5xl leading-none font-extrabold">{p.cislo}</p>
              <p className="mt-1 font-mono text-sm uppercase">{p.cisloPopis}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.stitky.map((s) => (
                <Badge key={s} variant="outline" className={bezPosunu}>
                  {s}
                </Badge>
              ))}
            </div>
            {p.id === 'trhovy-dataset' && (
              <figure className="flex flex-col items-center gap-2 border-3 border-ink bg-white p-3">
                <DonutChart
                  data={WEBY}
                  config={CFG_WEBY}
                  className="h-52 w-52"
                  centerContent={<DonutChartCenter value={S_TEXTOM} label={`z ${PREHLADANE} webov`} />}
                  aria-label={`Trhový dataset: ${S_TEXTOM} z ${PREHLADANE} webov malo textové bloky`}
                />
                <figcaption className="font-mono text-xs">Sito: {S_TEXTOM} z {PREHLADANE} prehľadaných webov malo textové bloky.</figcaption>
              </figure>
            )}
            {(p.mal || p.dostal) && (
              <div className="grid gap-4">
                {p.mal && (
                  <div>
                    <p className="font-mono text-xs font-bold uppercase">S čím prišiel</p>
                    <ul className="mt-2 grid gap-1.5" role="list">
                      {p.mal.map((m) => (
                        <li key={m} className="border-l-4 border-stamp pl-3 text-sm">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.dostal && (
                  <div>
                    <p className="font-mono text-xs font-bold uppercase">Liečba</p>
                    <ul className="mt-2 grid gap-1.5" role="list">
                      {p.dostal.map((m) => (
                        <li key={m} className="border-l-4 border-yellow pl-3 text-sm font-bold">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {p.fakty.length > 0 && (
              <dl className="grid grid-cols-2 gap-3">
                {p.fakty.map((f) => (
                  <div key={f.label} className="border-3 border-ink bg-white p-3">
                    <dt className="font-mono text-[11px] uppercase text-ink/60">{f.label}</dt>
                    <dd className="font-display text-2xl font-extrabold">{f.value}</dd>
                    <dd className="text-xs">{f.note}</dd>
                  </div>
                ))}
              </dl>
            )}
            {p.stavText && <p className="border-3 border-ink bg-yellow p-3 text-sm font-bold">{p.stavText}</p>}
            <Separator className="h-[2px]" />
            <SheetFooter className="mt-auto flex-row flex-wrap gap-3">
              {p.url ? (
                <Button asChild>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" data-track="dokaz_klik" data-track-miesto={`v7-01-${p.id}`}>
                    {domena(p.url)} <ArrowUpRight aria-hidden="true" />
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

export default function Chorobopisy() {
  const tik = useAlarm('chorobopisy');
  const [id, setId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const p = PACIENTI.find((x) => x.id === id) ?? null;
  const otvor = React.useCallback((nove: string) => {
    setId(nove);
    setOpen(true);
  }, []);

  React.useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ id: string }>).detail;
      if (d?.id && PACIENTI.some((x) => x.id === d.id)) otvor(d.id);
    };
    window.addEventListener('m01:pacient', on);
    return () => window.removeEventListener('m01:pacient', on);
  }, [otvor]);

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5" role="list">
        {PACIENTI.map((x, i) => (
          <li key={x.id} className={cn(i === 0 && 'sm:col-span-2 lg:col-span-2 lg:row-span-1')}>
            <Monitor p={x} i={i} tik={tik} onOpen={() => otvor(x.id)} />
          </li>
        ))}
      </ul>
      <Detail p={p} open={open} onOpenChange={setOpen} />
    </>
  );
}
