/** V7-05 · Komiks — statické kusy strany (vykreslí ich Astro na serveri, bez hydratácie): onomatopoja (BoldKit
 *  tvar + písmo), bublina, titulok (rozprávačský rámček), kresby panelov (tvary BoldKitu a SVG, zástupné, bez obrázkov)
 *  a zástupná plocha „FOTKA ADAMA“ 4 : 5. Farby iba z tokenov; hot iba na X. */
import type { ReactNode } from 'react';
import {
  BurstShape,
  CrossShape,
  CursorShape,
  EyeShape,
  ExplosionShape,
  GearShape,
  LightningShape,
  SplatShape,
  Star4Shape,
  SunShape,
  CloudShape,
} from '@/components/ui/shapes';
import { Sticker, Stamp } from '@/components/ui/sticker';
import { cn } from '@/lib/utils';
import type { Onomatopoja, Panel } from './data';

const FARBA = {
  yellow: 'var(--color-yellow)',
  white: 'var(--color-white)',
  stamp: 'var(--color-stamp)',
  ink: 'var(--color-ink)',
  paper: 'var(--color-paper)',
} as const;

/** Onomatopoja: tvar BoldKitu (burst / explózia / fľak) s textom. Nafúkne sa, keď panel vpadne ([data-in]). */
export function Zvuk({ zvuk, className, size = 132, rot = -8 }: { zvuk: Onomatopoja; className?: string; size?: number; rot?: number }) {
  const Tvar = zvuk.tvar === 'burst' ? BurstShape : zvuk.tvar === 'explozia' ? ExplosionShape : SplatShape;
  const text = zvuk.farba === 'stamp' ? 'text-paper' : 'text-ink';
  return (
    <span aria-hidden="true" className={cn('k-zvuk pointer-events-none absolute z-20 grid place-items-center', className)} style={{ ['--r' as string]: `${rot}deg`, width: size, height: size }}>
      <Tvar size={size} color={FARBA[zvuk.farba]} strokeColor={FARBA.ink} strokeWidth={3} className="absolute inset-0" />
      <span className={cn('k-zvuk-text relative font-display font-extrabold uppercase italic', text)} style={{ fontSize: size * 0.22 }}>
        {zvuk.text}
      </span>
    </span>
  );
}

/** Bublina: hranatá (BoldKit), chvost smerom k hovoriacemu. `mysel` = myšlienková (bodky). */
export function Bublina({
  children,
  chvost = 'dole-vlavo',
  className,
  mysel = false,
}: {
  children: ReactNode;
  chvost?: 'dole-vlavo' | 'dole-vpravo' | 'hore-vlavo' | 'vlavo';
  className?: string;
  mysel?: boolean;
}) {
  return (
    <div className={cn('k-bublina relative border-3 border-ink bg-white px-4 py-3 text-ink shadow-brutal-sm', mysel && 'k-mysel', className)} data-chvost={chvost}>
      {children}
    </div>
  );
}

/** Rozprávačský rámček (caption box) v rohu panelu. */
export function Titulok({ children, className, tmavy = false }: { children: ReactNode; className?: string; tmavy?: boolean }) {
  return (
    <p
      className={cn(
        'k-titulok inline-block border-3 border-ink px-3 py-1.5 font-mono text-xs font-bold tracking-[0.12em] uppercase sm:text-sm',
        tmavy ? 'bg-ink text-yellow' : 'bg-yellow text-ink',
        className,
      )}
    >
      {children}
    </p>
  );
}

/** EKG stopa (SVG), beží cez CSS (k-ekg), pri reduced motion stojí. */
export function Ekg({ className, farba = 'var(--color-ink)' }: { className?: string; farba?: string }) {
  const d = Array.from({ length: 6 }, (_, i) => {
    const x = i * 100;
    return `L${x + 30} 30 L${x + 38} 26 L${x + 44} 30 L${x + 50} 30 L${x + 55} 6 L${x + 61} 52 L${x + 66} 30 L${x + 78} 30 L${x + 86} 22 L${x + 94} 30 L${x + 100} 30`;
  }).join(' ');
  return (
    <svg viewBox="0 0 300 60" preserveAspectRatio="none" className={cn('overflow-hidden', className)} aria-hidden="true">
      <path className="k-ekg" d={`M0 30 ${d}`} fill="none" stroke={farba} strokeWidth={3} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Kresba panelu Pôvodu: zástupná scéna z tvarov (bez generovaných obrázkov). */
export function Kresba({ druh }: { druh: Panel['kresba'] }) {
  const ink = FARBA.ink;
  switch (druh) {
    case 'skola':
      return (
        <div className="relative grid h-28 place-items-center tx-halftone [--tx:26%]">
          <LightningShape size={70} color={FARBA.yellow} strokeColor={ink} className="-rotate-12" />
        </div>
      );
    case 'viera':
      return (
        <div className="relative grid h-28 place-items-center tx-halftone [--tx:26%]">
          <SunShape size={84} color={FARBA.yellow} strokeColor={ink} animation="spin-step" speed="slow" />
        </div>
      );
    case 'ekg':
      return (
        <div className="relative flex h-40 flex-col justify-center gap-2 border-3 border-ink bg-ink px-3 sm:h-48">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-yellow uppercase">
            <span>II · 25 mm/s</span>
            <CrossShape size={22} color={FARBA.stamp} strokeColor={FARBA.paper} strokeWidth={2} />
          </div>
          <Ekg className="h-20 w-full" farba="var(--color-yellow)" />
        </div>
      );
    case 'mysel':
      return (
        <div className="relative flex h-28 items-center justify-center gap-3 tx-halftone [--tx:26%]">
          <CloudShape size={96} color={FARBA.white} strokeColor={ink} />
          <EyeShape size={64} color={FARBA.yellow} strokeColor={ink} />
        </div>
      );
    case 'dvere':
      return (
        <div className="relative grid h-28 place-items-center tx-halftone [--tx:26%]">
          <svg viewBox="0 0 80 100" className="h-24 w-auto" aria-hidden="true">
            <rect x="10" y="4" width="60" height="92" fill="var(--color-paper)" stroke={ink} strokeWidth="4" />
            <rect x="22" y="16" width="36" height="30" fill="var(--color-white)" stroke={ink} strokeWidth="3" />
            <circle cx="58" cy="58" r="4" fill={ink} />
            <path d="M4 96 L76 96" stroke={ink} strokeWidth="4" />
          </svg>
        </div>
      );
    case 'klik':
      return (
        <div className="relative grid h-28 place-items-center">
          <CursorShape size={64} color={FARBA.white} strokeColor={ink} className="translate-x-4 translate-y-2" />
        </div>
      );
    case 'agenti':
      return (
        <div className="relative flex h-28 items-center justify-center gap-1 tx-halftone [--tx:26%]">
          <GearShape size={54} color={FARBA.yellow} strokeColor={ink} animation="spin-step" />
          <GearShape size={38} color={FARBA.white} strokeColor={ink} animation="spin-step" speed="fast" />
          <GearShape size={46} color={FARBA.yellow} strokeColor={ink} animation="spin-step" speed="slow" />
        </div>
      );
    case 'x':
      return (
        <div className="relative grid h-28 place-items-center">
          <img src="/brand/x.svg" alt="" width="80" height="96" className="h-24 w-auto" loading="lazy" decoding="async" />
        </div>
      );
  }
}

/** Zástupná plocha „FOTKA ADAMA“ 4 : 5 — halftone, výbuch v žltej, nálepka, pečiatka. Presný pomer pre budúci panel. */
export function FotkaAdama({ peciatka, className }: { peciatka: string; className?: string }) {
  return (
    <div className={cn('relative aspect-[4/5] w-full overflow-hidden border-3 border-ink bg-paper shadow-brutal', className)} role="img" aria-label="Fotka Adama (zástupná plocha): Adam od ramien hore v uniforme s fonendoskopom">
      <div className="absolute inset-0 tx-halftone [--tx:34%]" style={{ backgroundSize: '9px 9px' }} />
      <ExplosionShape size={560} color={FARBA.yellow} strokeColor={FARBA.ink} strokeWidth={2} className="absolute top-1/2 left-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2" />
      {/* silueta: hlava a ramená (zástupná kresba), fonendoskop okolo krku */}
      <svg viewBox="0 0 200 250" className="absolute inset-x-0 bottom-0 mx-auto h-[82%] w-auto" aria-hidden="true">
        <path d="M20 250 C20 190 55 168 100 168 C145 168 180 190 180 250 Z" fill="var(--color-white)" stroke="var(--color-ink)" strokeWidth="5" />
        <path d="M78 168 L100 205 L122 168" fill="none" stroke="var(--color-ink)" strokeWidth="5" strokeLinejoin="round" />
        <circle cx="100" cy="104" r="50" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="5" />
        <path d="M70 176 C60 215 88 232 100 214 M130 176 C140 215 112 232 100 214" fill="none" stroke="var(--color-ink)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="222" r="9" fill="var(--color-stamp)" stroke="var(--color-ink)" strokeWidth="4" />
        <rect x="136" y="196" width="26" height="26" fill="var(--color-white)" stroke="var(--color-ink)" strokeWidth="4" />
        <path d="M149 201 V217 M141 209 H157" stroke="var(--color-stamp)" strokeWidth="5" />
      </svg>
      <Sticker variant="primary" size="lg" rotation="slight" className="absolute top-4 left-4 z-10">
        Fotka Adama
      </Sticker>
      <p className="absolute right-3 bottom-3 z-10 border-2 border-ink bg-white px-2 py-0.5 font-mono text-[11px] font-bold uppercase">zástupná plocha · 4 : 5</p>
      <Stamp variant="default" size="default" rotation="slight" doubleRing className="absolute right-4 top-20 z-10 hidden sm:flex">
        {peciatka}
      </Stamp>
      <Star4Shape size={42} color={FARBA.white} strokeColor={FARBA.ink} animation="pulse-hard" className="absolute bottom-16 left-5 z-10" />
    </div>
  );
}
