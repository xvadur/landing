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

/** Zdravotnícky kríž (plus) s tvrdým tieňom. */
export function Kriz({ className, style }: P) {
  const d = 'M36 0H64V36H100V64H64V100H36V64H0V36H36Z';
  return (
    <svg viewBox="-6 -6 118 118" className={className} style={style} aria-hidden="true" focusable="false">
      <path d={d} transform="translate(6,6)" fill="var(--color-ink)" />
      <path d={d} fill="currentColor" stroke="var(--color-ink)" strokeWidth={4} strokeLinejoin="miter" />
    </svg>
  );
}

/** EKG krivka (jeden úder) ako path v súradniciach 0–200 × 0–40; `w` = šírka celku (opakuje úder). */
export function ekgPath(sirka = 1200, uder = 200): string {
  let d = 'M0 24';
  for (let x = 0; x < sirka; x += uder) {
    d += ` L${x + 70} 24 L${x + 80} 20 L${x + 88} 24 L${x + 96} 24 L${x + 102} 30 L${x + 110} 2 L${x + 118} 38 L${x + 124} 24 L${x + 140} 24 L${x + 152} 17 L${x + 164} 24 L${x + uder} 24`;
  }
  return d;
}

/** Zástupná fotka (XDR-199): Adam od ramien hore v zdravotníckej uniforme s fonendoskopom, neobrutalistická silueta.
 *  Nahradí ju skutočná fotka; rozmer a orez sedia (štvorec, sticker). */
export function ZdravotnikPlaceholder({ className, style }: P) {
  return (
    <svg viewBox="0 0 400 400" className={className} style={style} role="img" aria-label="Adam Rudavský v zdravotníckej uniforme (zástupný obrázok)">
      <rect width="400" height="400" fill="var(--color-yellow)" />
      <g fill="none" stroke="var(--color-ink)" strokeOpacity="0.14" strokeWidth="2">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="0" y1={i * 34 + 10} x2="400" y2={i * 34 + 10} />
        ))}
      </g>
      {/* ramená a uniforma */}
      <path d="M40 400 C48 318 96 286 150 274 L250 274 C304 286 352 318 360 400 Z" fill="var(--color-ink)" />
      {/* výstrih do V */}
      <path d="M160 274 L200 336 L240 274 Z" fill="var(--color-white)" stroke="var(--color-ink)" strokeWidth="6" strokeLinejoin="miter" />
      {/* krk a hlava */}
      <rect x="172" y="226" width="56" height="56" fill="var(--color-ink)" />
      <ellipse cx="200" cy="168" rx="66" ry="78" fill="var(--color-ink)" />
      {/* vlasy (kučery) */}
      <path d="M134 150 C128 96 170 76 204 80 C246 80 276 104 268 150 C256 128 238 118 214 122 C190 112 160 120 134 150 Z" fill="var(--color-ink)" stroke="var(--color-paper)" strokeWidth="3" />
      {/* fonendoskop */}
      <path d="M152 282 C140 320 150 352 184 356 M248 282 C262 320 252 352 220 356" fill="none" stroke="var(--color-stamp)" strokeWidth="10" strokeLinecap="round" />
      <path d="M184 356 C196 358 208 358 220 356" fill="none" stroke="var(--color-stamp)" strokeWidth="10" />
      <circle cx="202" cy="372" r="18" fill="var(--color-white)" stroke="var(--color-ink)" strokeWidth="7" />
      {/* menovka */}
      <rect x="262" y="318" width="70" height="26" fill="var(--color-white)" stroke="var(--color-ink)" strokeWidth="4" />
      <path d="M270 331 H324" stroke="var(--color-ink)" strokeWidth="4" />
      {/* kríž na rukáve */}
      <path d="M86 336 H98 V324 H110 V336 H122 V348 H110 V360 H98 V348 H86 Z" fill="var(--color-stamp)" stroke="var(--color-paper)" strokeWidth="2" />
    </svg>
  );
}
