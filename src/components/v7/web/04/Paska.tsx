/** V7-04 · Triážna páska (desktop ≥ 1024 px, sticky vľavo). Hlavný pás sa prefarbí na farbu aktuálnej úrovne
 *  (CSS premenná z .t-ram[data-z]), popis úrovne sa vymení cez Motion Primitives TransitionPanel. V úrovni 2 (hot)
 *  je celý pás odkaz na rezerváciu, teda CTA. Dole päť zastávok triážnej škály ako navigácia s tooltipom.
 *  Ostrov: <Paska client:load /> */
import { useEffect } from 'react';
import { TransitionPanel } from '@/components/vendor/motionprimitives/transition-panel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { FARBA_TRIEDY, ZONY } from './data';
import { chodNa, spustiSledovanie, useZona } from './stav';

const SCHODY = { enter: { opacity: 0, y: 40 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -40 } };
const SCHODY_T = { duration: 0.24, ease: (t: number) => Math.ceil(t * 4) / 4 };

export default function Paska() {
  const z = useZona();
  useEffect(() => spustiSledovanie(), []);
  const akt = ZONY[z - 1]!;
  const cta = z === 2;

  const obsah = (
    <>
      <span className="font-display text-6xl leading-none font-extrabold tabular-nums">{z}</span>
      <TransitionPanel activeIndex={z - 1} variants={SCHODY} transition={SCHODY_T} className="min-h-0 flex-1">
        {ZONY.map((zz) => (
          <span key={zz.n} className="t-zvisle block font-mono text-sm font-bold tracking-[0.2em] whitespace-nowrap uppercase">
            {zz.n === 2 ? 'Objednaj sa →' : `${zz.uroven} · ${zz.nazov}`}
          </span>
        ))}
      </TransitionPanel>
      <span className="text-2xl leading-none" aria-hidden="true">
        ✚
      </span>
    </>
  );

  return (
    <TooltipProvider delayDuration={120}>
      <nav aria-label="Triážna páska" className="flex h-full flex-col border-r-3 border-ink bg-paper">
        <a
          href="#prijem"
          onClick={(e) => {
            e.preventDefault();
            chodNa('prijem');
          }}
          className="flex h-[72px] shrink-0 items-center justify-center border-b-3 border-ink bg-paper"
          aria-label="XVADUR — na začiatok"
        >
          <img src="/brand/x.svg" alt="" width={40} height={40} className="w-10" />
        </a>

        {cta ? (
          <a
            href="#termin"
            onClick={(e) => {
              e.preventDefault();
              chodNa('termin');
            }}
            className="t-prefarbi t-srafy flex min-h-0 flex-1 flex-col items-center gap-4 py-6"
            aria-label={`Triáž 2 · ${akt.uroven}: objednaj sa na vyšetrenie`}
          >
            {obsah}
          </a>
        ) : (
          <div className="t-prefarbi t-srafy flex min-h-0 flex-1 flex-col items-center gap-4 py-6" aria-live="polite">
            <span className="sr-only">
              Aktuálna úroveň: triáž {z} · {akt.uroven} · {akt.nazov}
            </span>
            {obsah}
          </div>
        )}

        <ol className="flex shrink-0 flex-col border-t-3 border-ink" role="list">
          {ZONY.map((zz) => (
            <li key={zz.n} className={cn('border-ink', zz.n > 1 && 'border-t-3')}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={zz.n === 2 ? '#termin' : `#${zz.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      chodNa(zz.n === 2 ? 'termin' : zz.id);
                    }}
                    aria-current={zz.n === z ? 'step' : undefined}
                    aria-label={`Triáž ${zz.n} · ${zz.uroven} · ${zz.nazov}`}
                    className={cn(
                      'relative flex h-12 items-center justify-center font-display text-xl font-extrabold transition-[padding] duration-150',
                      FARBA_TRIEDY[zz.farba],
                    )}
                  >
                    {zz.n}
                    {zz.n === z && <span className="absolute top-1/2 -right-[3px] h-4 w-4 -translate-y-1/2 border-y-8 border-r-8 border-y-transparent border-r-ink" aria-hidden="true" />}
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="font-mono text-xs font-bold uppercase">
                  {zz.n} · {zz.uroven} · {zz.nazov}
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ol>
      </nav>
    </TooltipProvider>
  );
}
