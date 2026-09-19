/** Indikátor krokov kvízu — vlastný, v štýle React Bits Stepper (44 px štvorce, 3 px spojky, hot = aktuálny (text ink: 5,4:1), lime = hotový).
 *  Vendorovaný Stepper riadi vlastný obsah aj stav (nedá sa použiť len ako indikátor nad TransitionPanel), preto tento.
 *  Na mobile (< 640 px) sa štvorce skryjú, ostáva Progress + „Otázka X z Y“. Klik = návrat na už zodpovedanú otázku. */
import { CheckIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/vendor/neobrutalism/progress';

export type KrokyProps = {
  /** počet otázok v aktuálnej vetve */
  celkom: number;
  /** index aktuálnej otázky (0-based); === celkom znamená výsledok */
  aktualny: number;
  /** najvyšší index, ktorý už bol zodpovedaný (späť sa dá skočiť len sem) */
  dosiahnuty: number;
  onSkoc: (index: number) => void;
};

export default function Kroky({ celkom, aktualny, dosiahnuty, onSkoc }: KrokyProps) {
  const jeVysledok = aktualny >= celkom;
  const pct = Math.round((Math.min(aktualny, celkom) / celkom) * 100);
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow">{jeVysledok ? 'Výsledok' : `Otázka ${aktualny + 1} z ${celkom}`}</span>
        <span className="font-mono text-sm tabular-nums" aria-hidden="true">
          {pct} %
        </span>
      </div>
      <Progress value={pct} tone="hot" size="sm" aria-label={`Postup kvízu: ${pct} %`} />
      <ol className="hidden items-center sm:flex" aria-label="Kroky kvízu">
        {Array.from({ length: celkom }, (_, i) => {
          const stav = i === aktualny ? 'aktualny' : i < aktualny || jeVysledok ? 'hotovy' : 'dalsi';
          const klik = stav === 'hotovy' && i <= dosiahnuty;
          return (
            <li key={i} className={cn('flex items-center', i < celkom - 1 && 'flex-1')}>
              <button
                type="button"
                aria-current={stav === 'aktualny' ? 'step' : undefined}
                aria-label={`Otázka ${i + 1}${stav === 'hotovy' ? ' (zodpovedaná)' : stav === 'aktualny' ? ' (aktuálna)' : ''}`}
                disabled={!klik}
                onClick={() => klik && onSkoc(i)}
                className={cn(
                  'flex h-11 w-11 flex-none items-center justify-center rounded-lg border-3 border-ink font-display text-base font-extrabold transition-colors duration-(--duration-base)',
                  stav === 'dalsi' && 'bg-white text-ink opacity-60',
                  stav === 'aktualny' && 'bg-hot text-ink shadow-brutal-sm',
                  stav === 'hotovy' && 'bg-lime text-ink',
                  klik ? 'press cursor-pointer hover:bg-lime-hover' : 'cursor-default',
                )}
              >
                {stav === 'hotovy' ? <CheckIcon weight="bold" size={20} aria-hidden="true" /> : i + 1}
              </button>
              {i < celkom - 1 && (
                <span className="relative mx-2 h-[3px] flex-1 overflow-hidden rounded-sm bg-ink/20" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-(--duration-slow)"
                    style={{ width: i < aktualny ? '100%' : '0%' }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
