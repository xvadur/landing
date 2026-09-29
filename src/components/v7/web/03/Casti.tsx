/** V7-03 · súčiastky rozloženého nástroja (fonendoskop spojený s čipom) ako SVG vrstvy v rovine 400 × 400.
 *  Každá súčiastka sa kreslí dvakrát: plocha (farby z tokenov) a „bok“ (celá ink) — bok ide v 3D o pár px nižšie
 *  a robí tvrdú hranu / tieň bez rozmazania. Farby iba cez utility z tokenov (fill-ink, fill-yellow, fill-white,
 *  fill-paper, stroke-ink); hot iba na znaku X na veku čipu. */
import type { JSX } from 'react';
import type { CastId } from './data';

type P = { bok?: boolean };

const f = (bok: boolean | undefined, farba: string) => (bok ? 'fill-ink' : farba);

/** Doska plošných spojov = Hriech (sieť: 10 redakcií, 558 ľudí). */
function Doska({ bok }: P) {
  return (
    <g>
      <rect x="40" y="40" width="320" height="320" rx="14" className={`${f(bok, 'fill-ink')} stroke-ink`} strokeWidth="5" />
      {!bok && (
        <g className="fill-none stroke-yellow" strokeWidth="4" strokeLinecap="square" strokeLinejoin="round">
          {/* vodiče od pinov k okrajom dosky */}
          <path d="M156 110 V78 H70" />
          <path d="M178 110 V64 H110" />
          <path d="M222 110 V62 H300 V90" />
          <path d="M244 110 V84 H340" />
          <path d="M290 156 H330 V120" />
          <path d="M290 244 H320 V300 H250" />
          <path d="M110 178 H76 V260" />
          <path d="M110 222 H90 V330 H150" />
          <path d="M156 290 V334" />
          <path d="M200 290 V318 H236" />
        </g>
      )}
      {!bok && (
        <g className="fill-white stroke-ink" strokeWidth="3">
          <circle cx="70" cy="78" r="8" />
          <circle cx="110" cy="64" r="8" />
          <circle cx="300" cy="96" r="8" />
          <circle cx="340" cy="84" r="8" />
          <circle cx="330" cy="116" r="8" />
          <circle cx="250" cy="300" r="8" />
          <circle cx="76" cy="266" r="8" />
          <circle cx="150" cy="330" r="8" />
          <circle cx="156" cy="336" r="8" />
          <circle cx="240" cy="318" r="8" />
        </g>
      )}
      {!bok && (
        <g className="fill-yellow">
          {/* sieťotlač: kríž a označenie dosky */}
          <path d="M318 322 h10 v-10 h8 v10 h10 v8 h-10 v10 h-8 v-10 h-10 z" />
          <text x="58" y="352" className="fill-yellow font-mono" fontSize="13" fontWeight="700" letterSpacing="2">
            XVADUR · REV 03
          </text>
        </g>
      )}
    </g>
  );
}

/** Piny a telo puzdra = Lucia (web s rezerváciami, „piny“ = spoje s ľuďmi). */
function Piny({ bok }: P) {
  const pos = [150, 172, 194, 216, 238];
  return (
    <g>
      <rect x="132" y="132" width="136" height="136" rx="6" className={`${f(bok, 'fill-ink')} stroke-ink`} strokeWidth="4" />
      <g className={`${f(bok, 'fill-white')} stroke-ink`} strokeWidth="3">
        {pos.map((p) => (
          <g key={p}>
            <rect x={p} y="110" width="12" height="24" rx="2" />
            <rect x={p} y="266" width="12" height="24" rx="2" />
            <rect x="110" y={p} width="24" height="12" rx="2" />
            <rect x="266" y={p} width="24" height="12" rx="2" />
          </g>
        ))}
      </g>
    </g>
  );
}

/** Jadro čipu = Korpus (dáta: bunky, niektoré plné). */
function Cip({ bok }: P) {
  const bunky: [number, number][] = [
    [0, 0], [2, 0], [3, 1], [1, 1], [0, 2], [2, 2], [3, 3], [1, 3], [3, 0], [0, 3],
  ];
  return (
    <g>
      <rect x="150" y="150" width="100" height="100" rx="4" className={`${f(bok, 'fill-yellow')} stroke-ink`} strokeWidth="4" />
      {!bok && (
        <g>
          <g className="fill-ink">
            {bunky.map(([c, r]) => (
              <rect key={`${c}-${r}`} x={160 + c * 21} y={160 + r * 21} width="17" height="17" />
            ))}
          </g>
          <g className="fill-none stroke-ink" strokeWidth="2">
            <rect x="160" y="160" width="80" height="80" />
            <path d="M181 160 V240 M202 160 V240 M223 160 V240 M160 181 H240 M160 202 H240 M160 223 H240" />
          </g>
        </g>
      )}
    </g>
  );
}

/** Veko čipu so znakom X = Jakub (hotový systém pod vekom: web, CRM, 47 / 47). */
function Veko({ bok }: P) {
  return (
    <g>
      <rect x="132" y="132" width="136" height="136" rx="10" className={`${f(bok, 'fill-white')} stroke-ink`} strokeWidth="5" />
      {!bok && (
        <g>
          <circle cx="150" cy="150" r="6" className="fill-ink" />
          {/* znak X (hot iba tu a na CTA) */}
          <path
            d="M168 168 h22 l10 16 l10 -16 h22 l-21 32 l21 32 h-22 l-10 -16 l-10 16 h-22 l21 -32 z"
            className="fill-hot stroke-ink"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <text x="200" y="256" textAnchor="middle" className="fill-ink font-mono" fontSize="11" fontWeight="700" letterSpacing="3">
            47 / 47
          </text>
        </g>
      )}
    </g>
  );
}

/** Hadička (dve vetvy: od hlavice do čipu a z čipu k olivkám) = Zásah (agent medzi tebou a prácou). */
function Hadicka({ bok }: P) {
  const a = 'M268 178 C 326 178, 360 214, 338 250 S 322 270, 322 272';
  const b = 'M132 224 C 86 224, 70 178, 96 148 S 110 124, 110 120';
  return (
    <g className="fill-none" strokeLinecap="round">
      <path d={a} className="stroke-ink" strokeWidth="20" />
      <path d={b} className="stroke-ink" strokeWidth="20" />
      {!bok && <path d={a} className="stroke-yellow" strokeWidth="9" />}
      {!bok && <path d={b} className="stroke-yellow" strokeWidth="9" />}
      {/* koncovky zasunuté do čipu */}
      <rect x="258" y="166" width="22" height="24" rx="3" className={`${f(bok, 'fill-white')} stroke-ink`} strokeWidth="4" />
      <rect x="120" y="212" width="22" height="24" rx="3" className={`${f(bok, 'fill-white')} stroke-ink`} strokeWidth="4" />
    </g>
  );
}

/** Hlavica fonendoskopu = Triáž (vyšetrenie: počúvam, čo bolí). */
function Hlavica({ bok }: P) {
  return (
    <g>
      <path d="M322 262 V286" className="stroke-ink" strokeWidth="16" strokeLinecap="round" />
      {!bok && <path d="M322 264 V284" className="stroke-white" strokeWidth="6" strokeLinecap="round" />}
      <circle cx="322" cy="322" r="44" className={`${f(bok, 'fill-white')} stroke-ink`} strokeWidth="5" />
      {!bok && (
        <g>
          <circle cx="322" cy="322" r="31" className="fill-yellow stroke-ink" strokeWidth="4" />
          <circle cx="322" cy="322" r="11" className="fill-ink" />
          <path d="M322 294 v8 M322 342 v8 M294 322 h8 M342 322 h8" className="stroke-ink" strokeWidth="3" />
        </g>
      )}
    </g>
  );
}

/** Olivky (strmienok + koncovky do uší) = Odovzdanie (počuješ to sám, bezo mňa). */
function Olivky({ bok }: P) {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M110 120 L76 62 M110 120 L52 84" className="fill-none stroke-ink" strokeWidth="14" />
      {!bok && <path d="M110 120 L76 62 M110 120 L52 84" className="fill-none stroke-white" strokeWidth="5" />}
      <circle cx="110" cy="120" r="11" className={`${f(bok, 'fill-yellow')} stroke-ink`} strokeWidth="4" />
      <ellipse cx="70" cy="50" rx="14" ry="10" transform="rotate(-60 70 50)" className={`${f(bok, 'fill-yellow')} stroke-ink`} strokeWidth="4" />
      <ellipse cx="42" cy="78" rx="14" ry="10" transform="rotate(-30 42 78)" className={`${f(bok, 'fill-yellow')} stroke-ink`} strokeWidth="4" />
    </g>
  );
}

const MAPA: Record<CastId, (p: P) => JSX.Element> = {
  doska: Doska,
  piny: Piny,
  cip: Cip,
  veko: Veko,
  hadicka: Hadicka,
  hlavica: Hlavica,
  olivky: Olivky,
};

/** Súčiastka v rovine (bez vlastného <svg>). */
export function Cast({ id, bok }: { id: CastId; bok?: boolean }) {
  const C = MAPA[id];
  return <C bok={bok} />;
}

/** Plochá ikona súčiastky (výrez roviny), napr. v dlaždici mriežky. */
export function CastIkona({ id, vb, className }: { id: CastId; vb: string; className?: string }) {
  return (
    <svg viewBox={vb} className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet" overflow="visible">
      <Cast id={id} />
    </svg>
  );
}
