/** Wordmark XVADUR v hero ako inline SVG (19. 9. večer, Adam: „šedé, stráca sa“).
 *  Pôvodne <img> + CSS drop-shadow v inku: dve tmavé plochy nad ditherom splývali do šedej škvrny.
 *  Teraz tri vrstvy v jednom SVG: (1) tvrdý tieň v inku, (2) žltý blok s inkovým obrysom (neobrutalistický
 *  „sticker“ posun), (3) samotné písmená v inku. Písmená ostávajú čisté a ostré, tieň ich nezľahčuje,
 *  žltá ich oddelí od papiera aj od dither pozadia. Farby len z tokenov. Posun tieňa: 6 px mobil, 11 px desktop
 *  (viewBox jednotky ≈ px pri šírke 728). Prefers-reduced-motion nič nemení (statický obraz). */
import { forwardRef } from 'react';

const PATHS = [
  ['M0 0H26L53 43L80 0H106L66 65L106 130H79L53 87L27 130H0L40 65Z', 0],
  ['M0 0H25L53 94L81 0H106L65 130H41Z', 124],
  ['M0 130L41 0H65L106 130H81L71 101H35L25 130ZM43 77H63L53 44Z', 248],
  ['M0 0H53Q106 0 106 65T53 130H0ZM24 24V106H51Q81 106 81 65T51 24Z', 372],
  ['M0 0H24V81Q24 108 53 108T82 81V0H106V83Q106 130 53 130T0 83Z', 496],
  ['M0 0H57Q106 0 106 43Q106 75 77 84L108 130H79L48 88H24V130H0ZM24 23V65H55Q81 65 81 44T55 23Z', 620],
] as const;

function Glyphs() {
  return (
    <>
      {PATHS.map(([d, x]) => (
        <path key={x} d={d} fillRule="evenodd" transform={`translate(${x},0)`} />
      ))}
    </>
  );
}

const Wordmark = forwardRef<SVGSVGElement, { className?: string }>(function Wordmark({ className }, ref) {
  return (
    <svg
      ref={ref}
      viewBox="-4 -4 748 150"
      role="img"
      aria-label="XVADUR"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <title>XVADUR</title>
      {/* 1 – tvrdý tieň (ink), posun cez CSS premennú --wm-shadow (6 px mobil / 11 px desktop) */}
      <g fill="var(--color-ink)" style={{ transform: 'translate(var(--wm-shadow), var(--wm-shadow))' }}>
        <Glyphs />
      </g>
      {/* 2 – žltý blok s inkovým obrysom, polovičný posun: oddelí písmená od papiera a ditheru */}
      <g
        fill="var(--color-yellow)"
        stroke="var(--color-ink)"
        strokeWidth={4}
        strokeLinejoin="miter"
        paintOrder="stroke"
        style={{ transform: 'translate(calc(var(--wm-shadow) / 2), calc(var(--wm-shadow) / 2))' }}
      >
        <Glyphs />
      </g>
      {/* 3 – písmená (ink), čisté, bez filtra */}
      <g fill="var(--color-ink)">
        <Glyphs />
      </g>
    </svg>
  );
});

export default Wordmark;
