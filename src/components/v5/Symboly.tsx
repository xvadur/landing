/** Neobrutalistické symboly V5 (XDR-205): X, šípka, hviezdička, pečiatka, blesk. Čisté SVG bez JS, farby cez tokeny
 *  (fill/stroke = currentColor alebo var(--color-*)). Použiteľné v .astro (statický render) aj v React ostrovoch.
 *  Všetky sú dekorácia: aria-hidden, pointer-events none rieši rodič. */
import type { CSSProperties } from 'react';

type P = { className?: string; style?: CSSProperties };

/** X znak (rovnaká cesta ako public/brand/x.svg), s tvrdým tieňom. */
export function XZnak({ className, style }: P) {
  const d = 'M0 0H26L53 43L80 0H106L66 65L106 130H79L53 87L27 130H0L40 65Z';
  return (
    <svg viewBox="-6 -6 124 146" className={className} style={style} aria-hidden="true" focusable="false">
      <path d={d} transform="translate(6,6)" fill="var(--color-ink)" />
      <path d={d} fill="currentColor" stroke="var(--color-ink)" strokeWidth={4} strokeLinejoin="miter" paintOrder="stroke" />
    </svg>
  );
}

/** Hrubá šípka dole-vpravo (smer „pozri sem“), v ráme s tieňom. */
export function Sipka({ className, style, smer = 'dole' }: P & { smer?: 'dole' | 'vpravo' | 'hore-vpravo' }) {
  const rot = smer === 'vpravo' ? -90 : smer === 'hore-vpravo' ? -135 : 0;
  const d = 'M38 0H62V58L84 36L101 53L50 104L-1 53L16 36L38 58Z';
  return (
    <svg viewBox="-8 -8 124 124" className={className} style={style} aria-hidden="true" focusable="false">
      <g transform={`rotate(${rot} 50 52)`}>
        <path d={d} transform="translate(6,6)" fill="var(--color-ink)" />
        <path d={d} fill="currentColor" stroke="var(--color-ink)" strokeWidth={4} strokeLinejoin="miter" />
      </g>
    </svg>
  );
}

/** Hviezdička s 8 lúčmi (výbuch nálepky). */
export function Hviezda({ className, style, lucov = 12 }: P & { lucov?: number }) {
  const pts: string[] = [];
  for (let i = 0; i < lucov * 2; i++) {
    const r = i % 2 === 0 ? 50 : 30;
    const a = (Math.PI * i) / lucov - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  const poly = pts.join(' ');
  return (
    <svg viewBox="-6 -6 118 118" className={className} style={style} aria-hidden="true" focusable="false">
      <polygon points={poly} transform="translate(5,5)" fill="var(--color-ink)" />
      <polygon points={poly} fill="currentColor" stroke="var(--color-ink)" strokeWidth={3.5} strokeLinejoin="miter" />
    </svg>
  );
}

/** Pečiatka: kruhový text okolo stredu (napr. „OVERENÉ · OVERENÉ ·“), stred s fajkou. */
export function Peciatka({ className, style, text = 'Overené', id = 'peciatka' }: P & { text?: string; id?: string }) {
  const kruh = `${text.toUpperCase()} · ${text.toUpperCase()} · ${text.toUpperCase()} · `;
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden="true" focusable="false">
      <defs>
        <path id={`${id}-kruh`} d="M60 60 m-43 0 a43 43 0 1 1 86 0 a43 43 0 1 1 -86 0" />
      </defs>
      <circle cx="63" cy="63" r="56" fill="var(--color-ink)" />
      <circle cx="60" cy="60" r="56" fill="currentColor" stroke="var(--color-ink)" strokeWidth="4" />
      <circle cx="60" cy="60" r="31" fill="none" stroke="var(--color-ink)" strokeWidth="3" />
      <text fontFamily="var(--font-mono)" fontSize="11.5" fontWeight="700" letterSpacing="2.2" fill="var(--color-ink)">
        <textPath href={`#${id}-kruh`}>{kruh}</textPath>
      </text>
      <path d="M45 60 L56 71 L77 48" fill="none" stroke="var(--color-ink)" strokeWidth="7" strokeLinecap="square" />
    </svg>
  );
}

/** Blesk (energia / automatizácia). */
export function Blesk({ className, style }: P) {
  const d = 'M58 0L8 64H44L30 120L92 46H56L70 0Z';
  return (
    <svg viewBox="0 -4 104 132" className={className} style={style} aria-hidden="true" focusable="false">
      <path d={d} transform="translate(6,6)" fill="var(--color-ink)" />
      <path d={d} fill="currentColor" stroke="var(--color-ink)" strokeWidth={4} strokeLinejoin="miter" />
    </svg>
  );
}
