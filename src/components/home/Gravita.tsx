/** Podpisový fyzický vtip (doc 10 §3 #15): šesť základných rodín prázdnych fráz (src/data/frazy.ts, zakladna)
 *  padá ako nálepky do kopy, dá sa nimi hádzať (myš aj dotyk). Fancy Gravity (matter-js ≈ 27 kB) sa ťahá lazy:
 *  na desktope s myšou keď sa sekcia blíži k viewportu, na dotyku (mobil, rozpočet JS ≤ 180 kB) až po prvom dotyku
 *  na kopu; dovtedy (a bez JS) ležia nálepky staticky na dne. Reduced motion: kopa stojí (stráž v Gravity).
 *  poly-decomp sa registruje v matter-js (Common.setDecomp) ešte pred renderom scény — deti MatterBody registrujú
 *  telesá vo svojich efektoch skôr než rodič Gravity, takže neskoré setDecomp vo vendore by X dostalo len konvexný obal.
 *  Ostrov: client:visible. Tlačidlo „ŠKRTNI ICH" je mimo ostrova (GravitaSekcia.astro). */
import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from 'react';
import { FRAZY_RODINY } from '@/data/frazy';
import { cn } from '@/lib/utils';
import { FINE_POINTER_DESKTOP_QUERY, REDUCED_MOTION_QUERY, matches } from '@/components/vendor/fancy/hooks/use-media';
import type { GravityProps, MatterBodyProps } from '@/components/vendor/fancy/physics/gravity';
import Hranica from './Hranica';

const FARBY = ['bg-yellow', 'bg-pink', 'bg-lilac', 'bg-lime', 'bg-sky', 'bg-white'];
const ZAKLADNE = FRAZY_RODINY.filter((r) => r.zakladna);

type Mod = { Gravity: ComponentType<GravityProps>; MatterBody: ComponentType<MatterBodyProps>; decomp: unknown };

const Scena = lazy(async () => {
  try {
    const [g, d, m] = await Promise.all([
      import('@/components/vendor/fancy/physics/gravity'),
      import('poly-decomp'),
      import('matter-js'),
    ]);
    const decomp = (d as { default?: unknown }).default ?? d;
    m.Common.setDecomp(decomp);
    const mod: Mod = { Gravity: g.Gravity, MatterBody: g.MatterBody, decomp };
    return { default: () => <Fyzika mod={mod} /> };
  } catch {
    // chunk nepríšiel (sieť, starý HTML po deployi): kopa ostane statická
    return { default: () => <Kopa /> };
  }
});

function Nalepka({ text, i, className }: { text: string; i: number; className?: string }) {
  return (
    <span
      className={cn('sticker text-sm whitespace-nowrap sm:text-base', FARBY[i % FARBY.length], className)}
      style={{ ['--sticker-rotate' as string]: '0deg' }}
    >
      {text}
    </span>
  );
}

function XGlyph({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className} aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M0 0H26L53 43L80 0H106L66 65L106 130H79L53 87L27 130H0L40 65Z" transform="translate(63,48) scale(1.23)" />
    </svg>
  );
}

function Fyzika({ mod }: { mod: Mod }) {
  const { Gravity, MatterBody, decomp } = mod;
  return (
    <Gravity gravity={{ x: 0, y: 1 }} grabCursor addTopWall startOnView decomp={decomp}>
      {ZAKLADNE.map((r, i) => (
        <MatterBody
          key={r.rodina}
          x={`${12 + ((i * 15) % 76)}%`}
          y={`${6 + (i % 3) * 12}%`}
          angle={(i % 2 ? 1 : -1) * (4 + i * 3)}
          matterBodyOptions={{ friction: 0.4, restitution: 0.25, density: 0.002 }}
        >
          <Nalepka text={r.rodina} i={i} />
        </MatterBody>
      ))}
      <MatterBody x="50%" y="-8%" angle={12} bodyType="svg" isDraggable matterBodyOptions={{ friction: 0.3, restitution: 0.2, density: 0.003 }}>
        <XGlyph className="h-20 w-20 text-hot sm:h-24 sm:w-24" />
      </MatterBody>
    </Gravity>
  );
}

/** Statická kopa (SSR / pred načítaním fyziky / bez JS): nálepky ležia na dne. */
function Kopa() {
  return (
    <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-center gap-2 sm:gap-3" aria-hidden="true">
      {ZAKLADNE.map((r, i) => (
        <Nalepka key={r.rodina} text={r.rodina} i={i} className={i % 2 ? 'rotate-2' : '-rotate-3'} />
      ))}
    </div>
  );
}

export default function Gravita() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    // reduced motion: kopa stojí, matter-js sa neťahá vôbec; dotyk / bez myši: fyzika až po prvom dotyku na kopu
    // (mobilný rozpočet); desktop s myšou: pri priblížení k sekcii
    if (matches(REDUCED_MOTION_QUERY) || !matches(FINE_POINTER_DESKTOP_QUERY)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '25% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-gravita
      data-fyzika={near ? 'on' : 'off'}
      className="tx-halftone relative h-[420px] overflow-hidden rounded-lg border-3 border-ink bg-white shadow-brutal sm:h-[480px]"
      onPointerDown={near ? undefined : () => !matches(REDUCED_MOTION_QUERY) && setNear(true)}
    >
      <p
        className="pointer-events-none absolute inset-x-0 top-5 z-0 px-4 text-center font-display text-display-xs font-extrabold uppercase leading-none tracking-tight text-ink/25"
        aria-hidden="true"
      >
        Hoď nimi
      </p>
      <ul className="sr-only">
        {ZAKLADNE.map((r) => (
          <li key={r.rodina}>{r.rodina}</li>
        ))}
      </ul>
      {near ? (
        <Hranica fallback={<Kopa />}>
          <Suspense fallback={<Kopa />}>
            <Scena />
          </Suspense>
        </Hranica>
      ) : (
        <Kopa />
      )}
    </div>
  );
}
