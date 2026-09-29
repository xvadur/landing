/** V7-08 · rám okna nemocničného systému. Motion: ťahanie za lištu (iba ≥ 1024 px s myšou), otvorenie a zatvorenie
 *  po krokoch (ease = schody ako --bk-ease-step), pri ťahaní väčší tvrdý tieň (CSS na atribúte, nie transform).
 *  Lišta: pravý klik = context-menu, dvojklik = maximalizovať, tlačidlá _ □ × s tooltipom (44 px).
 *  Obsah je v HTML vždy (SSR otvorené); minimalizované = skryté cez `hidden`, nie odmontované. */
import * as React from 'react';
import { motion, useAnimationControls, useDragControls, useMotionValue, useReducedMotion } from 'motion/react';
import { Copy, Maximize2, Minimize2, Minus, PanelTop, X } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { maximalizuj, naVrch, nastavStav, OKNA, posli, useSystem, type OknoId } from './store';

/** Schody: t → ceil(t·n)/n (Motion prijme funkciu ako ease). */
export const schody = (n: number) => (t: number) => (t >= 1 ? 1 : Math.ceil(t * n) / n);

export function useDesktop() {
  const [d, setD] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const on = () => setD(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return d;
}

type Props = {
  id: OknoId;
  ikona: React.ReactNode;
  /** triedy bunky v mriežke plochy (umiestnenie, posun) */
  className?: string;
  teloClassName?: string;
  /** stavový riadok dole v okne */
  stav?: React.ReactNode;
  /** Príjem nesie h1 v tele, lišta je potom iba text */
  listaAkoText?: boolean;
  children: React.ReactNode;
};

const TLACIDLO =
  'relative flex h-11 w-11 shrink-0 items-center justify-center border-l-3 border-ink bg-white text-ink transition-colors hover:bg-yellow focus-visible:bg-yellow';

export default function Okno({ id, ikona, className, teloClassName, stav, listaAkoText, children }: Props) {
  const sys = useSystem();
  const desktop = useDesktop();
  const reduced = useReducedMotion();
  const drag = useDragControls();
  const anim = useAnimationControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ulozene = React.useRef({ x: 0, y: 0 });
  const plocha = React.useRef<HTMLElement | null>(null);
  const [tahane, setTahane] = React.useState(false);
  const def = OKNA.find((o) => o.id === id)!;
  const s = sys.stav[id];
  const max = sys.max === id;
  const aktivne = sys.aktivne === id;
  const predosly = React.useRef(s);

  React.useEffect(() => {
    plocha.current = document.getElementById('plocha');
  }, []);

  const otvorPoKrokoch = React.useCallback(
    (od = 0.55) => {
      if (reduced) {
        anim.set({ opacity: 0 });
        return anim.start({ opacity: 1, transition: { duration: 0.12 } });
      }
      anim.set({ opacity: 0, scale: od });
      return anim.start({ opacity: 1, scale: 1, transition: { duration: 0.42, ease: schody(4) } });
    },
    [anim, reduced],
  );

  // znovuotvorenie zo zatvoreného / minimalizovaného stavu = po krokoch
  React.useEffect(() => {
    if (predosly.current !== 'otvorene' && s === 'otvorene') void otvorPoKrokoch(0.6);
    predosly.current = s;
  }, [s, otvorPoKrokoch]);

  // boot: Príjem sa otvorí až po oponе (BootOpona pošle v708:boot tesne pred odstránením)
  React.useEffect(() => {
    const onBoot = () => {
      if (id === 'prijem') {
        naVrch('prijem');
        void otvorPoKrokoch(0.35);
      }
    };
    const onBlik = (e: Event) => {
      if ((e as CustomEvent).detail !== id || reduced) return;
      void anim.start({ scale: [1, 1.025, 1], transition: { duration: 0.3, ease: schody(3) } });
    };
    window.addEventListener('v708:boot', onBoot);
    window.addEventListener('v708:blik', onBlik);
    return () => {
      window.removeEventListener('v708:boot', onBoot);
      window.removeEventListener('v708:blik', onBlik);
    };
  }, [id, anim, otvorPoKrokoch, reduced]);

  // maximalizácia: posun z ťahania odložíme a vrátime
  React.useEffect(() => {
    if (max) {
      ulozene.current = { x: x.get(), y: y.get() };
      x.set(0);
      y.set(0);
    } else {
      x.set(ulozene.current.x);
      y.set(ulozene.current.y);
    }
  }, [max, x, y]);

  React.useEffect(() => {
    if (!max) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && maximalizuj(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [max]);

  async function zavri() {
    if (!reduced) await anim.start({ opacity: 0, scale: 0.6, transition: { duration: 0.3, ease: schody(3) } });
    nastavStav(id, 'zatvorene');
    anim.set({ opacity: 1, scale: 1 });
    posli({ typ: 'hlasenie', text: `${def.nazov}: okno zatvorené`, popis: 'Otvoríš ho z panela dole, z ikon alebo cez ⌘K.' });
  }
  function minimalizuj() {
    nastavStav(id, s === 'min' ? 'otvorene' : 'min');
  }
  function kopiruj() {
    const url = `${location.origin}${location.pathname}#okno-${id}`;
    navigator.clipboard?.writeText(url).then(
      () => posli({ typ: 'hlasenie', text: 'Odkaz skopírovaný', popis: url, druh: 'success' }),
      () => posli({ typ: 'hlasenie', text: 'Kopírovanie nejde', popis: url, druh: 'warning' }),
    );
  }

  const nadpisId = `okno-${id}-h`;
  const Titul = listaAkoText ? 'p' : 'h2';

  return (
    <div
      className={cn('okno-bunka relative min-w-0', className)}
      style={{ zIndex: max ? 45 : sys.z[id] }}
      hidden={s === 'zatvorene'}
      data-okno-bunka={id}
    >
      <motion.section
        id={`okno-${id}`}
        aria-labelledby={listaAkoText ? undefined : nadpisId}
        aria-label={listaAkoText ? def.nazov : undefined}
        data-okno={id}
        data-aktivne={aktivne ? '' : undefined}
        data-tahane={tahane ? '' : undefined}
        data-max={max ? '' : undefined}
        data-lenis-prevent={max ? '' : undefined}
        className={cn('okno flex scroll-mt-20 flex-col border-3 border-ink bg-white text-ink', max && 'okno-max')}
        style={{ x, y }}
        animate={anim}
        drag={desktop && !max}
        dragControls={drag}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={plocha as React.RefObject<HTMLElement>}
        onDragStart={() => setTahane(true)}
        onDragEnd={() => setTahane(false)}
        onPointerDownCapture={() => naVrch(id)}
      >
        <TooltipProvider delayDuration={300}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <header
                className={cn(
                  'okno-lista flex h-12 shrink-0 items-stretch border-b-3 border-ink select-none',
                  aktivne ? 'bg-yellow text-ink' : 'bg-ink text-paper',
                  desktop && !max && 'cursor-grab active:cursor-grabbing',
                )}
                onPointerDown={(e) => {
                  if (!desktop || max) return;
                  if ((e.target as HTMLElement).closest('button')) return;
                  drag.start(e);
                }}
                onDoubleClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  maximalizuj(max ? null : id);
                }}
              >
                <span className="flex w-12 shrink-0 items-center justify-center border-r-3 border-ink [&_svg]:h-5 [&_svg]:w-5" aria-hidden="true">
                  {ikona}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                  <Titul id={listaAkoText ? undefined : nadpisId} className="truncate font-display text-base leading-none font-extrabold tracking-tight uppercase sm:text-lg">
                    {def.nazov}
                  </Titul>
                  <span className={cn('hidden truncate font-mono text-[11px] font-bold tracking-wider md:inline', aktivne ? 'text-ink/60' : 'text-paper/55')}>
                    {def.subor}
                  </span>
                </div>
                <div className="flex shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className={TLACIDLO} onClick={minimalizuj} aria-label={s === 'min' ? `Rozbaliť okno ${def.nazov}` : `Minimalizovať okno ${def.nazov}`}>
                        {s === 'min' ? <PanelTop className="h-4 w-4" /> : <Minus className="h-4 w-4" strokeWidth={3} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{s === 'min' ? 'Rozbaliť' : 'Minimalizovať'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className={TLACIDLO} onClick={() => maximalizuj(max ? null : id)} aria-label={max ? `Obnoviť okno ${def.nazov}` : `Maximalizovať okno ${def.nazov}`}>
                        {max ? <Minimize2 className="h-4 w-4" strokeWidth={3} /> : <Maximize2 className="h-4 w-4" strokeWidth={3} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{max ? 'Obnoviť (Esc)' : 'Na celú obrazovku'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className={cn(TLACIDLO, 'hover:bg-stamp hover:text-paper focus-visible:bg-stamp focus-visible:text-paper')} onClick={() => void zavri()} aria-label={`Zavrieť okno ${def.nazov}`}>
                        <X className="h-4 w-4" strokeWidth={3} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Zavrieť</TooltipContent>
                  </Tooltip>
                </div>
              </header>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuLabel className="font-mono text-xs">{def.subor}</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => naVrch(id)}>
                Dať navrch <ContextMenuShortcut>klik</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onSelect={minimalizuj}>{s === 'min' ? 'Rozbaliť' : 'Minimalizovať'}</ContextMenuItem>
              <ContextMenuItem onSelect={() => maximalizuj(max ? null : id)}>
                {max ? 'Obnoviť' : 'Maximalizovať'} <ContextMenuShortcut>2× klik</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onSelect={kopiruj}>
                <Copy className="h-4 w-4" /> Kopírovať odkaz na okno
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => void zavri()}>
                Zavrieť <ContextMenuShortcut>×</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </TooltipProvider>
        <div className={cn('okno-telo min-h-0 flex-1', teloClassName)} hidden={s === 'min'}>
          {children}
        </div>
        {stav && (
          <footer className="okno-stav flex min-h-8 items-center gap-3 border-t-3 border-ink bg-paper px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-ink uppercase" hidden={s === 'min'}>
            {stav}
          </footer>
        )}
      </motion.section>
    </div>
  );
}
