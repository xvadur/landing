/** V7-07 · portál pavilónu = veľká orientačná tabuľa pri vstupe. Písmeno, split-flap s názvom (preklopí sa pri každom
 *  vstupe do obrazu — podpisový pohyb), piktogram (zástupná plocha statického záberu pavilónu), veta, čo tu je, a smer
 *  ďalej. Vo vodorovnej chodbe je to zvislý stĺp (420 px), na mobile a pri reduced motion tabuľa cez celú šírku. */
import * as React from 'react';
import { ArrowRight, BookOpen, ClipboardList, DoorOpen, Gamepad2, Pill, Stethoscope, UserRound, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dalsie, type Miesto } from './data';
import { SplitFlap } from './SplitFlap';
import { useChodba } from './kontext';

export const IKONY: Record<string, LucideIcon> = {
  anamneza: UserRound,
  chorobopisy: ClipboardList,
  liecba: Pill,
  herna: Gamepad2,
  kniznica: BookOpen,
  vysetrenie: Stethoscope,
  vychod: DoorOpen,
};

export function Portal({ m, farba = 'yellow' }: { m: Miesto; farba?: 'yellow' | 'white' | 'ink' }) {
  const { vodorovne } = useChodba();
  const ref = React.useRef<HTMLElement>(null);
  const [spusti, setSpusti] = React.useState(0);
  const Ikona = IKONY[m.id] ?? Stethoscope;
  const d = dalsie(m.id);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let vnutri = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !vnutri) setSpusti((n) => n + 1);
        vnutri = e.isIntersecting;
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tmavy = farba === 'ink';
  return (
    <header
      ref={ref}
      className={cn(
        'v07-portal relative flex shrink-0 flex-col border-ink',
        farba === 'yellow' && 'bg-yellow text-ink',
        farba === 'white' && 'bg-white text-ink',
        tmavy && 'bg-ink text-paper',
        vodorovne ? 'h-full w-[420px] justify-between gap-5 border-r-3 px-7 pt-8 pb-8' : 'gap-5 border-b-3 px-4 py-8 sm:px-6 lg:px-10',
      )}
    >
      <div className={cn('flex flex-col gap-4', !vodorovne && 'mx-auto w-full max-w-[1500px]')}>
        <p className={cn('font-mono text-xs font-bold tracking-[0.16em] uppercase', tmavy ? 'text-yellow' : '')}>Pavilón {m.pismeno}</p>
        <div className={cn('flex items-center gap-4', vodorovne ? 'flex-col items-start' : 'flex-wrap')}>
          <span className={cn('v07-pismeno v07-pismeno-xl', tmavy && 'v07-pismeno-inv')} aria-hidden="true">
            {m.pismeno}
          </span>
          <h2 className="m-0 leading-none">
            <SplitFlap text={m.tabula} dlzka={11} velkost="lg" spusti={spusti} label={m.nazov} />
          </h2>
        </div>
        <p className={cn('max-w-sm text-lg leading-snug font-bold', tmavy ? 'text-paper/85' : '')}>{m.co}</p>
      </div>

      <div className={cn('flex gap-4', vodorovne ? 'flex-col' : 'mx-auto w-full max-w-[1500px] flex-wrap items-end justify-between')}>
        <div
          className={cn(
            'tx-halftone relative flex items-center justify-center border-3 [--tx:18%]',
            tmavy ? 'border-paper bg-ink' : 'border-ink bg-paper',
            vodorovne ? 'h-[min(24vh,200px)] w-full' : 'hidden h-28 w-40 sm:flex',
          )}
          aria-hidden="true"
        >
          <Ikona className={cn(vodorovne ? 'h-20 w-20' : 'h-12 w-12')} strokeWidth={1.75} />
          <span className={cn('absolute bottom-1.5 left-1.5 px-1.5 font-mono text-[10px]', tmavy ? 'bg-paper text-ink' : 'bg-ink text-paper')}>
            HIGGSFIELD: {m.zaber}
          </span>
        </div>
        {d && (
          <a
            href={`#${d.id}`}
            data-chod={d.id}
            className={cn(
              'press inline-flex min-h-12 items-center gap-3 border-3 px-4 font-mono text-sm font-bold uppercase',
              tmavy ? 'border-paper bg-paper text-ink' : 'border-ink bg-white text-ink shadow-brutal-sm',
            )}
          >
            Ďalej: {d.pismeno} · {d.nazov} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        )}
      </div>
    </header>
  );
}
