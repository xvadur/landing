/** Karta výsledku kvízu: strata za rok (vzorec na obrazovke), skóre 0–100, segment, jeden prvý krok z packu 04,
 *  CTA KONZULTÁCIA s predvyplneným query, kopírovanie textu (sonner), odznova.
 *  Bez NumberFlow/Card/Badge (rozpočet doc 10): karty = utilita `brutal`, čísla = Intl sk-SK + vlastný rAF odpočet
 *  (reduced motion = cieľ hneď, žiadny skok z nuly). Nadpisy: h2 „Výsledok kvízu“ (sr-only, v Kviz.tsx) → h3 karty. */
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRightIcon, ArrowCounterClockwiseIcon, CopyIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import { Button } from '@/components/vendor/neobrutalism/button';
import { TYZDNOV_ROCNE } from '@/data/kviz/kroky';
import { konzultaciaUrl, textVysledku, SK, type Vysledok as VysledokTyp } from './logika';

const EUR = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const ODPOCET_MS = 700;

/** 0 → cieľ za ODPOCET_MS (ease-out), bez knižnice; pri prefers-reduced-motion alebo bez rAF rovno cieľ. */
function useOdpocet(ciel: number): number {
  const [hodnota, setHodnota] = useState(ciel);
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !window.requestAnimationFrame ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setHodnota(ciel);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const krok = (t: number) => {
      const p = Math.min(1, (t - start) / ODPOCET_MS);
      const e = 1 - Math.pow(1 - p, 3);
      setHodnota(Math.round(ciel * e));
      if (p < 1) raf = window.requestAnimationFrame(krok);
    };
    setHodnota(0);
    raf = window.requestAnimationFrame(krok);
    return () => window.cancelAnimationFrame(raf);
  }, [ciel]);
  return hodnota;
}

const CISLO = 'font-mono text-[clamp(2rem,0.5rem+5vw,4rem)] font-medium tabular-nums leading-none tracking-tight';
const STITOK = 'brutal-flat inline-flex min-h-8 items-center px-3 py-1 font-mono text-sm uppercase tracking-[0.14em]';

export default function Vysledok({ v, onOdznova, onSpat }: { v: VysledokTyp; onOdznova: () => void; onSpat: () => void }) {
  const strata = useOdpocet(v.strata);
  const skore = useOdpocet(v.skore);
  const url = konzultaciaUrl(v);

  const kopiruj = async () => {
    try {
      await navigator.clipboard.writeText(textVysledku(v));
      toast.success('Skopírované', { description: 'Výsledok je v schránke ako text.' });
    } catch {
      toast.error('Nepodarilo sa skopírovať', { description: 'Označ text karty a skopíruj ho ručne.' });
    }
  };

  return (
    <div className="grid gap-6" data-kviz-vysledok>
      <ul className="flex flex-wrap items-center gap-3" aria-label="Zhrnutie">
        <li className={`${STITOK} bg-ink text-paper`}>Výsledok</li>
        <li className={`${STITOK} bg-white`}>{v.pocetOtazok} otázok</li>
        <li className={`${STITOK} bg-lilac`}>{v.segment.label}</li>
      </ul>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <article className="brutal tx-halftone card-drop relative grid gap-3 bg-yellow p-6" style={{ ['--i' as string]: 0 }}>
          <span className="x-stamp" aria-hidden="true" />
          <h3 className="eyebrow">Strata za rok</h3>
          <p className={CISLO}>
            <span aria-hidden="true">{EUR.format(strata)}</span>
            <span className="sr-only">{SK.format(v.strata)} eur za rok</span>
          </p>
          <p className="font-mono text-sm tabular-nums">
            {SK.format(v.hodiny)} h týždenne × {TYZDNOV_ROCNE} týždňov × {SK.format(v.sadzba)} € / h
          </p>
          <p className="max-w-prose text-base">
            Toľko stojí práca, ktorá sa ti opakuje. Nie sľub úspory: odhad ceny času, ktorý dnes ide do toho istého.
          </p>
        </article>

        <article className="brutal card-drop grid content-start gap-3 p-6" style={{ ['--i' as string]: 1 }}>
          <h3 className="eyebrow">Skóre pripravenosti</h3>
          <p className={`${CISLO} flex items-baseline gap-2`}>
            <span aria-hidden="true">{SK.format(skore)}</span>
            <span className="font-sans text-xl font-bold opacity-60" aria-hidden="true">
              / 100
            </span>
            <span className="sr-only">{v.skore} zo 100</span>
          </p>
          <p className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight">{v.pasmo.nazov}</p>
          <p className="text-base">{v.pasmo.veta}</p>
        </article>
      </div>

      <article className="brutal card-drop grid gap-4 bg-lime p-6" style={{ ['--i' as string]: 2 }}>
        <div>
          <h3 className="eyebrow">Jeden prvý krok</h3>
          <p className="mt-2 font-display text-display-xs font-extrabold uppercase leading-[0.95] tracking-tight">{v.krok.krok}</p>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="brutal-flat bg-white p-4">
            <dt className="eyebrow mb-2">Pozorovanie</dt>
            <dd className="font-bold">{v.krok.pozorovanie}</dd>
          </div>
          <div className="brutal-flat bg-white p-4">
            <dt className="eyebrow mb-2">Dôvod</dt>
            <dd className="font-bold">{v.krok.dovod}</dd>
          </div>
        </dl>
      </article>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* text-xl: paper na hot je 3,17:1 → prejde len ako veľký text (≥ 20 px tučné) */}
        <Button asChild tone="hot" size="lg" className="text-xl" data-cursor="vstup">
          <a href={url}>
            Konzultácia <ArrowRightIcon weight="bold" aria-hidden="true" />
          </a>
        </Button>
        <Button type="button" tone="white" size="lg" onClick={kopiruj}>
          <CopyIcon weight="bold" aria-hidden="true" /> Kopírovať výsledok
        </Button>
        <Button type="button" variant="reverse" tone="paper" size="default" onClick={onSpat} className="sm:ml-auto">
          <ArrowLeftIcon weight="bold" aria-hidden="true" /> Späť k otázkam
        </Button>
        <Button type="button" variant="reverse" tone="paper" size="default" onClick={onOdznova}>
          <ArrowCounterClockwiseIcon weight="bold" aria-hidden="true" /> Odznova
        </Button>
      </div>
      <p className="max-w-prose text-sm opacity-80">
        Konzultácia je bezplatný úvod, 30 minút. Odkaz nesie tvoj segment, hodiny, sadzbu a krok — nič sa neukladá na
        server, všetko sa počíta v prehliadači.
      </p>
    </div>
  );
}
