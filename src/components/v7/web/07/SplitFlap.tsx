/** V7-07 · podpisový pohyb: split-flap tabuľa ako na letisku. Každá bunka pri zmene textu preletí niekoľko znakov
 *  (po schodoch, 55 ms na preklopenie, bunky vpravo dobiehajú neskôr) a zastaví na cieľovom znaku. Preklopenie =
 *  horná polovica bunky sa sklopí (CSS keyframes v07-flap, steps), deliaca čiara ostáva.
 *  SSR a čítačka dostanú hotový text (aria-label), bunky sú aria-hidden. Reduced motion = bez preletu, text hneď.
 *  `spusti` (číslo) prehrá preklopenie znova aj pri rovnakom texte (portál pavilónu pri vstupe do obrazu). */
import * as React from 'react';
import { cn } from '@/lib/utils';

const ZNAKY = 'ABCDEFGHIJKLMNOPRSTUVZÁČĎÉÍĽŇÓÔŠŤÚÝŽ0123456789';
const KROK_MS = 55;

type Bunka = { ch: string; tik: number; zostava: number };

function vyplnit(text: string, dlzka: number) {
  const t = text.toUpperCase().slice(0, dlzka);
  return t.padEnd(dlzka, ' ');
}

function nahodny(seed: number) {
  return ZNAKY[(seed * 7919 + 13) % ZNAKY.length]!;
}

export type SplitFlapProps = {
  text: string;
  dlzka: number;
  spusti?: number;
  /** veľkosť bunky: sm = horná lišta, lg = portál pavilónu, xl = recepcia */
  velkost?: 'sm' | 'md' | 'lg';
  /** zvýraznená prvá bunka (písmeno pavilónu) */
  pismeno?: string;
  className?: string;
  label?: string;
};

export function SplitFlap({ text, dlzka, spusti = 0, velkost = 'md', pismeno, className, label }: SplitFlapProps) {
  const ciel = React.useMemo(() => vyplnit(text, dlzka), [text, dlzka]);
  const [bunky, setBunky] = React.useState<Bunka[]>(() => [...ciel].map((ch) => ({ ch, tik: 0, zostava: 0 })));
  const [pis, setPis] = React.useState<{ ch: string; tik: number }>({ ch: pismeno ?? '', tik: 0 });
  const prvy = React.useRef(true);

  React.useEffect(() => {
    if (prvy.current && spusti === 0) {
      prvy.current = false;
      return;
    }
    prvy.current = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setBunky([...ciel].map((ch, i) => ({ ch, tik: i, zostava: 0 })));
      if (pismeno) setPis({ ch: pismeno, tik: 1 });
      return;
    }
    // každá bunka: 3 + i/2 preletov (vpravo dlhšie); prázdne bunky sa neprekláňajú
    const kroky = [...ciel].map((ch, i) => (ch === ' ' ? 1 : 3 + Math.floor(i / 2)));
    const pisKroky = pismeno ? 5 : 0;
    const spolu = Math.max(pisKroky, ...kroky);
    setBunky((b) => [...ciel].map((_, i) => ({ ch: b[i]?.ch ?? ' ', tik: b[i]?.tik ?? 0, zostava: kroky[i]! })));
    let n = 0;
    const id = window.setInterval(() => {
      n++;
      const k = n;
      setBunky((b) =>
        b.map((c, i) => {
          if (c.zostava <= 0) return c;
          const z = c.zostava - 1;
          return { ch: z === 0 ? ciel[i]! : nahodny(k + i * 3), tik: c.tik + 1, zostava: z };
        }),
      );
      if (pismeno && k <= pisKroky) setPis((p) => ({ ch: k === pisKroky ? pismeno : nahodny(k + 5), tik: p.tik + 1 }));
      if (k >= spolu) window.clearInterval(id);
    }, KROK_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciel, spusti, pismeno]);

  const V = {
    sm: 'v07-sf-sm',
    md: 'v07-sf-md',
    lg: 'v07-sf-lg',
  }[velkost];

  return (
    <span role="img" aria-label={label ?? `${pismeno ? `${pismeno} · ` : ''}${text}`} className={cn('v07-sf', V, className)}>
      {pismeno != null && (
        <span aria-hidden="true" className="v07-sf-bunka v07-sf-pismeno">
          <span key={pis.tik} className="v07-sf-znak">
            {pis.ch}
          </span>
        </span>
      )}
      {bunky.map((b, i) => (
        <span key={i} aria-hidden="true" className="v07-sf-bunka">
          <span key={b.tik} className="v07-sf-znak">
            {b.ch === ' ' ? ' ' : b.ch}
          </span>
        </span>
      ))}
    </span>
  );
}
