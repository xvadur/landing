/** Katalóg V7 · canvas efekty nad src/hooks/use-canvas-effect.ts (mountCanvasEffect v src/lib/canvas-effect-core.ts).
 *  BoldKit v repe nemá hotové komponenty dither / halftone / CRT / plazma / aurora — je tu iba hook a jadro (veľkosť podľa
 *  devicePixelContentBox, strop pixelov, pauza mimo obrazovky a v skrytom tabe, reduced motion = jeden statický snímok).
 *  Preto sú efekty napísané tu ako recepty nad hookom. Farby = tokeny, prevedené na RGB cez rgbTokenu (žiadny hex). */
import * as React from 'react';
import { useCanvasEffect } from '@/hooks/use-canvas-effect';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ZIVE_CISLA } from '@/data/fakty';
import { Bunka, Chyba, cssRgb, Kus, Panel, Pod, Posuvnik, rgbTokenu, Vyber, type RGB } from './Spolocne';

export type Druh = 'crt' | 'dither' | 'halftone' | 'plazma' | 'aurora' | 'sum';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** Nízke rozlíšenie: počíta sa do malého ImageData a zväčší sa bez vyhladenia (tvrdé pixely, lacné). */
function nizkeRozlisenie(bunka: number) {
  const off = document.createElement('canvas');
  const octx = off.getContext('2d')!;
  let img: ImageData | null = null;
  return {
    pripravit(canvas: HTMLCanvasElement) {
      const w = Math.max(1, Math.ceil(canvas.width / bunka));
      const h = Math.max(1, Math.ceil(canvas.height / bunka));
      if (!img || img.width !== w || img.height !== h) {
        off.width = w;
        off.height = h;
        img = octx.createImageData(w, h);
      }
      return img;
    },
    vykreslit(ctx: CanvasRenderingContext2D) {
      if (!img) return;
      octx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, img.width, img.height, 0, 0, img.width * bunka, img.height * bunka);
    },
  };
}

function pixel(d: Uint8ClampedArray, i: number, c: RGB) {
  d[i] = c[0];
  d[i + 1] = c[1];
  d[i + 2] = c[2];
  d[i + 3] = 255;
}

/** EKG krivka: fáza 0–1 → výška 0–1 (0 = hore). Rovnaký tvar ako ekgPath v src/components/v5/Symboly.tsx. */
export function ekgY(f: number): number {
  const base = 0.6;
  if (f > 0.33 && f < 0.43) return base - 0.08 * Math.sin(((f - 0.33) / 0.1) * Math.PI); // P
  if (f >= 0.48 && f < 0.51) return base + ((f - 0.48) / 0.03) * 0.1; // Q
  if (f >= 0.51 && f < 0.55) return base + 0.1 - ((f - 0.51) / 0.04) * 0.62; // R hore
  if (f >= 0.55 && f < 0.59) return 0.08 + ((f - 0.55) / 0.04) * 0.82; // S dole
  if (f >= 0.59 && f < 0.62) return 0.9 - ((f - 0.59) / 0.03) * 0.3; // späť
  if (f > 0.7 && f < 0.84) return base - 0.14 * Math.sin(((f - 0.7) / 0.14) * Math.PI); // T
  return base;
}

type Recept = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, pal: RGB[], bunka: number) => (t: number, dt: number) => void;

const RECEPTY: Record<Druh, Recept> = {
  /** Monitor: EKG stopa s dosvitom fosforu, hlava bliká alarmovou pri QRS. Scanlines rieši CSS vrstva nad canvasom. */
  crt(ctx, canvas, pal) {
    const [pozadie, stopa, mriezka, alarm] = pal;
    let x = 0;
    let prvy = true;
    return (t, dt) => {
      const w = canvas.width;
      const h = canvas.height;
      const perioda = Math.max(160, w / 3.2);
      const lw = Math.max(2, Math.round(h / 140));
      const y = (px: number) => ekgY(((px % perioda) + perioda) % perioda / perioda) * h * 0.8 + h * 0.1;
      if (prvy || dt === 0) {
        // statický snímok (prvý a pri reduced motion): celá krivka naraz
        ctx.fillStyle = cssRgb(pozadie);
        ctx.fillRect(0, 0, w, h);
        mriezkaMonitor(ctx, w, h, mriezka);
        ctx.strokeStyle = cssRgb(stopa, 0.9);
        ctx.lineWidth = lw;
        ctx.beginPath();
        for (let px = 0; px <= w; px += 2) px === 0 ? ctx.moveTo(px, y(px)) : ctx.lineTo(px, y(px));
        ctx.stroke();
        prvy = false;
        x = (t * 1000) % w;
        return;
      }
      ctx.fillStyle = cssRgb(pozadie, Math.min(1, 0.05 * (dt / 16.7)));
      ctx.fillRect(0, 0, w, h);
      mriezkaMonitor(ctx, w, h, mriezka, 0.05);
      const nx = x + dt * (w / 3800);
      ctx.strokeStyle = cssRgb(stopa);
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x, y(x));
      for (let px = x; px <= nx; px += 1.5) ctx.lineTo(px, y(px));
      ctx.stroke();
      const f = ((nx % perioda) + perioda) % perioda / perioda;
      const qrs = f > 0.48 && f < 0.62;
      ctx.fillStyle = cssRgb(qrs ? alarm : stopa);
      ctx.fillRect(nx - lw * 2, y(nx) - lw * 2, lw * 4, lw * 4);
      x = nx > w ? 0 : nx;
    };
  },
  /** 1-bit dither (Bayer 4 × 4) pohyblivého kruhového poľa. */
  dither(ctx, canvas, pal, bunka) {
    const lr = nizkeRozlisenie(bunka);
    const [c0, c1] = pal;
    return (t) => {
      const img = lr.pripravit(canvas);
      const { width: w, height: h, data } = img;
      const cx = 0.5 + 0.28 * Math.sin(t * 0.7);
      const cy = 0.5 + 0.28 * Math.cos(t * 0.9);
      const asp = w / h;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = (x / w - cx) * asp;
          const v = y / h - cy;
          const d = Math.sqrt(u * u + v * v);
          const val = Math.max(0, Math.min(1, (0.5 + 0.5 * Math.sin(d * 16 - t * 3)) * (1.15 - d * 0.9)));
          pixel(data, (y * w + x) * 4, val > BAYER[(y & 3) * 4 + (x & 3)] ? c1 : c0);
        }
      }
      lr.vykreslit(ctx);
    };
  },
  /** Rastrové bodky: polomer podľa vlny, tlač ako v novinách. */
  halftone(ctx, canvas, pal, bunka) {
    const [pozadie, bodka] = pal;
    return (t) => {
      const w = canvas.width;
      const h = canvas.height;
      const s = bunka * 3;
      ctx.fillStyle = cssRgb(pozadie);
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = cssRgb(bodka);
      for (let y = s / 2; y < h + s; y += s) {
        for (let x = s / 2; x < w + s; x += s) {
          const u = x / w;
          const v = y / h;
          const val = 0.5 + 0.25 * Math.sin(u * 9 + t * 1.4) + 0.25 * Math.sin(v * 7 - t + u * 4);
          const r = (s / 2) * Math.max(0.05, Math.min(1, val));
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
  },
  /** Plazma kvantovaná do farieb palety s ditherom (stupňovite, nie plynulo). */
  plazma(ctx, canvas, pal, bunka) {
    const lr = nizkeRozlisenie(bunka);
    const n = pal.length;
    return (t0) => {
      const t = Math.floor(t0 * 12) / 12; // stupňovitý čas
      const img = lr.pripravit(canvas);
      const { width: w, height: h, data } = img;
      for (let y = 0; y < h; y++) {
        const v = y / h;
        for (let x = 0; x < w; x++) {
          const u = x / w;
          const du = u - 0.5;
          const dv = v - 0.5;
          const s =
            Math.sin(u * 10 + t) + Math.sin(v * 8 - t * 1.3) + Math.sin((u + v) * 6 + t * 0.7) + Math.sin(Math.sqrt(du * du + dv * dv) * 14 - t * 2);
          const val = (s / 4 + 1) / 2;
          const lvl = Math.min(n - 1, Math.max(0, Math.floor(val * (n - 1) + BAYER[(y & 3) * 4 + (x & 3)])));
          pixel(data, (y * w + x) * 4, pal[lvl]);
        }
      }
      lr.vykreslit(ctx);
    };
  },
  /** Aurora s tvrdými hranami: vrstvené závesy, každý posun vlnou. */
  aurora(ctx, canvas, pal, bunka) {
    const lr = nizkeRozlisenie(bunka);
    const vrstvy = pal.length - 1;
    return (t) => {
      const img = lr.pripravit(canvas);
      const { width: w, height: h, data } = img;
      const hranice = new Float32Array(vrstvy);
      for (let x = 0; x < w; x++) {
        const u = x / w;
        for (let k = 0; k < vrstvy; k++) {
          hranice[k] = h * (0.18 + (0.62 * (k + 1)) / (vrstvy + 1) + 0.09 * Math.sin(u * 5 + t * (0.8 + k * 0.35) + k * 1.7) + 0.035 * Math.sin(u * 19 - t * 2 + k));
        }
        for (let y = 0; y < h; y++) {
          let i = 0;
          while (i < vrstvy && y > hranice[i]) i++;
          pixel(data, (y * w + x) * 4, pal[i]);
        }
      }
      lr.vykreslit(ctx);
    };
  },
  /** Šum „monitor bez signálu“ s rolujúcim pruhom. */
  sum(ctx, canvas, pal, bunka) {
    const lr = nizkeRozlisenie(bunka);
    const [c0, c1, pruh] = pal;
    return (t) => {
      const img = lr.pripravit(canvas);
      const { width: w, height: h, data } = img;
      const py = ((t * 0.25) % 1) * h;
      for (let y = 0; y < h; y++) {
        const vPruhu = Math.abs(y - py) < h * 0.06;
        for (let x = 0; x < w; x++) {
          const r = Math.random();
          pixel(data, (y * w + x) * 4, vPruhu ? (r < 0.7 ? pruh : c1) : r < 0.52 ? c0 : c1);
        }
      }
      lr.vykreslit(ctx);
    };
  },
};

function mriezkaMonitor(ctx: CanvasRenderingContext2D, w: number, h: number, c: RGB, a = 0.18) {
  const s = Math.max(24, Math.round(h / 8));
  ctx.strokeStyle = cssRgb(c, a);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < w; x += s) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = 0; y < h; y += s) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();
}

/** Východzie palety (mená tokenov --color-*). */
export const PALETY: Record<Druh, string[]> = {
  crt: ['ink', 'yellow', 'paper', 'stamp'],
  dither: ['ink', 'yellow'],
  halftone: ['yellow', 'ink'],
  plazma: ['paper', 'white', 'yellow', 'ink'],
  aurora: ['ink', 'stamp', 'yellow', 'white', 'paper'],
  sum: ['ink', 'paper', 'yellow'],
};

export function CanvasEfekt({
  druh,
  rychlost = 1,
  bunka = 4,
  paleta,
  className,
  scanlines,
}: {
  druh: Druh;
  rychlost?: number;
  bunka?: number;
  paleta?: string[];
  className?: string;
  /** CSS vrstva riadkov monitora nad canvasom (default pri crt). */
  scanlines?: boolean;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const rychlostRef = React.useRef(rychlost);
  React.useEffect(() => {
    rychlostRef.current = rychlost;
  }, [rychlost]);
  const pal = paleta ?? PALETY[druh];
  useCanvasEffect(ref, (ctx, canvas) => {
    const rgb = pal.map(rgbTokenu);
    const krok = RECEPTY[druh](ctx, canvas, rgb, Math.max(1, Math.round(bunka * (window.devicePixelRatio || 1))));
    let t = 0;
    return (dt) => {
      const d = dt * rychlostRef.current;
      t += d * 0.001;
      krok(t, d);
    };
  });
  const riadky = scanlines ?? druh === 'crt';
  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden="true">
      <canvas ref={ref} className="block h-full w-full" />
      {riadky ? <div className="kit-scanlines pointer-events-none absolute inset-0" /> : null}
    </div>
  );
}

const DRUHY: { id: Druh; meno: string; co: string }[] = [
  { id: 'crt', meno: 'CRT monitor (EKG)', co: 'dosvit fosforu, mriežka, alarm pri QRS, riadky cez CSS' },
  { id: 'dither', meno: 'Dither 1-bit', co: 'Bayer 4 × 4, dve farby' },
  { id: 'halftone', meno: 'Halftone', co: 'rastrové bodky, polomer podľa vlny' },
  { id: 'plazma', meno: 'Plazma', co: 'kvantovaná do palety, stupňovitý čas' },
  { id: 'aurora', meno: 'Aurora (tvrdá)', co: 'vrstvené závesy bez prechodov' },
  { id: 'sum', meno: 'Šum', co: 'monitor bez signálu, rolujúci pruh' },
];

const MOZNOSTI: [string, string, string][] = [
  ['maxPixelCount', '1920 × 1080 × 2', 'strop plochy backing store (per-pixel efekty v JS)'],
  ['minPixelRatio', '1', 'nadvzorkovanie na 1× obrazovkách (4× cena pri 2)'],
  ['respectReducedMotion', 'true', 'reduced motion = jeden statický snímok'],
  ['pauseOffscreen', 'true', 'IntersectionObserver zastaví rAF mimo obrazovky'],
  ["coordinates", "'device'", "'css' = kreslíš v CSS px, škálovanie sa obnoví po každom resize"],
];

export default function CanvasEfekty() {
  const [rychlost, setRychlost] = React.useState(1);
  const [bunka, setBunka] = React.useState(4);
  const [velky, setVelky] = React.useState<Druh>('crt');
  const zive = ZIVE_CISLA.filter((z) => z.kluc !== 'projects_active');

  return (
    <Kus
      id="canvas-efekty"
      meno="use-canvas-effect"
      subor="src/hooks/use-canvas-effect.ts + src/lib/canvas-effect-core.ts · recepty v src/components/v7/kit/tvary/CanvasEfekty.tsx"
      pocet="1 hook · 6 receptov"
      veta="Hook na 2D canvas efekty so správnym životným cyklom: veľkosť podľa fyzických pixelov, pauza mimo obrazovky a v skrytom tabe, reduced motion. Na ňom stoja pozadia hera: monitor, dither, raster, plazma, aurora, šum."
    >
      <Chyba>
        Hotové efekty dither / halftone / CRT / plazma / aurora v repe <strong>nie sú</strong> (BoldKit sem priniesol iba hook a jadro).
        Šesť efektov nižšie je napísaných v katalógu nad <code>useCanvasEffect</code>, dá sa ich preniesť do <code>src/components/ui/</code>.
      </Chyba>
      <Panel>
        <Posuvnik label="rýchlosť (násobok dt)" min={0} max={3} step={0.25} hodnota={rychlost} onZmena={setRychlost} jednotka="×" />
        <Posuvnik label="bunka (CSS px)" min={2} max={12} hodnota={bunka} onZmena={setBunka} jednotka=" px" />
        <div className="flex items-end">
          <Badge variant="outline" className="font-mono normal-case">rýchlosť 0 = stojí, ale loop beží</Badge>
        </div>
      </Panel>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Canvas efekty">
        {DRUHY.map((d) => (
          <li key={d.id} className="min-w-0">
            <Bunka
              className="h-full [&>div]:p-0"
              popis={
                <>
                  <strong className="block text-[0.78rem]">{d.meno}</strong>
                  {d.co} · paleta {PALETY[d.id].join(', ')}
                </>
              }
            >
              <CanvasEfekt key={d.id + bunka} druh={d.id} rychlost={rychlost} bunka={bunka} className="h-48 w-full" />
            </Bunka>
          </li>
        ))}
      </ul>

      <Pod poznamka="Možnosti mountCanvasEffect (tretí argument hooku). Objekt sa serializuje, takže nový literál s rovnakými hodnotami efekt neprerobí.">
        Možnosti hooku
      </Pod>
      <div className="overflow-x-auto rounded-lg border-3 border-ink bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-paper font-mono text-xs uppercase">
            <tr>
              <th className="border-b-3 border-ink p-3">voľba</th>
              <th className="border-b-3 border-ink p-3">default</th>
              <th className="border-b-3 border-ink p-3">čo robí</th>
            </tr>
          </thead>
          <tbody>
            {MOZNOSTI.map(([a, b, c]) => (
              <tr key={a} className="border-b-2 border-ink/20 last:border-0">
                <td className="p-3 font-mono font-bold">{a}</td>
                <td className="p-3 font-mono">{b}</td>
                <td className="p-3">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pod poznamka="Monitor vitálnych funkcií: CRT efekt na celú šírku, nad ním skutočné čísla z Korpusu (fakty.ts, ZIVE_CISLA, snímka 26. 9. 2026).">
        Kombinácia s Adamovým obsahom
      </Pod>
      <Vyber label="efekt v pozadí" hodnoty={DRUHY.map((d) => ({ id: d.id, label: d.meno }))} hodnota={velky} onZmena={setVelky} />
      <div className="relative overflow-hidden rounded-lg border-3 border-ink bg-ink shadow-brutal">
        <CanvasEfekt key={velky + bunka} druh={velky} rychlost={rychlost} bunka={bunka} className="absolute inset-0" />
        <div className="relative grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
          <p className="eyebrow col-span-full w-fit rounded-md border-2 border-ink bg-yellow px-2 py-1">Monitor · Adam Rudavský</p>
          {zive.map((z) => (
            <div key={z.kluc} className="rounded-lg border-3 border-ink bg-paper p-3 shadow-brutal-sm">
              <p className="font-display text-3xl font-extrabold tabular-nums">{z.value.toLocaleString('sk-SK')}</p>
              <p className="font-mono text-xs uppercase">{z.label}</p>
            </div>
          ))}
          <div className="h-24 sm:h-32" />
        </div>
      </div>
    </Kus>
  );
}
