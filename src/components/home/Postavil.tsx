/** Čo som postavil (spec 05 §2.3, doc 10 §3 #13, #14): 8 kariet zo src/data/fakty.ts (poradie záväzné), x-stamp,
 *  jedno číslo, jeden riadok; karta → detail v neobrutalism Dialog (Radix — rovnaký chunk ako Wizard, 0 kB Motion);
 *  „Systém pre makléra" má v detaile log kontrol (CSS stagger, generické názvy subsystémov z riadku, bez mena klienta,
 *  bez odkazu); Fancy ImageTrail za kurzorom v sekcii (len desktop ≥ 1024 px s myšou; overlay nad mriežkou, mriežka sa
 *  nikdy nepremountuje). Odkaz len kde 19. 9. vrátil 200 (fakty.ts url) — inak doména ako text.
 *  Čísla: SSR aj pred hydratáciou stojí skutočná hodnota z fakty.ts (statický span); NumberFlow sa namountuje až keď je
 *  karta vo viewporte (vlastný IntersectionObserver) a bez reduced motion — vtedy nabehne 0 → hodnota. Prípona („ / 47",
 *  „ mil.") sa vypisuje mimo NumberFlow, aby neprišla o medzeru. Tisícové medzery pevné cez nbsp().
 *  Ostrov: client:visible. */
import React, { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import NumberFlow from '@number-flow/react';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/vendor/neobrutalism/dialog';
import { useFinePointerDesktop, useReducedMotion } from '@/components/vendor/fancy/hooks/use-media';
import { POSTAVIL, type Projekt } from '@/data/fakty';
import { cn } from '@/lib/utils';
import Hranica from './Hranica';
import { nbsp } from './nbsp';

/** ImageTrail (Motion) len na desktope s myšou — lazy, mobil ho neťahá vôbec; keď chunk nepríde, nič sa nestane. */
type StopaProps = { host: RefObject<HTMLElement | null> };
const Stopa = lazy<(p: StopaProps) => React.ReactNode>(() =>
  import('./Stopa').catch(() => ({ default: (_p: StopaProps) => null })),
);

type Tone = 'yellow' | 'white' | 'pink' | 'sky' | 'lime';
const PASTELY: { tone: Tone; bg: string }[] = [
  { tone: 'yellow', bg: 'bg-yellow' },
  { tone: 'white', bg: 'bg-white' },
  { tone: 'pink', bg: 'bg-pink' },
  { tone: 'sky', bg: 'bg-sky' },
  { tone: 'lime', bg: 'bg-lime' },
  { tone: 'white', bg: 'bg-white' },
  { tone: 'yellow', bg: 'bg-yellow' },
  { tone: 'pink', bg: 'bg-pink' },
];

type Cislo = { value: number; fraction: number; suffix: string } | null;

/** Veľkosť čísla podľa dĺžky, aby „2 483 965" nevyšlo z karty (karta na 1024 px má ≈ 180 px obsahu). */
function cisloSize(cislo: string, kde: 'karta' | 'detail'): string {
  const dlhe = cislo.replace(/\s/g, '').length >= 6;
  if (kde === 'detail') return dlhe ? 'text-[clamp(2.5rem,1rem+4vw,4.5rem)]' : 'text-display';
  return dlhe ? 'text-[clamp(1.9rem,0.6rem+2.4vw,3rem)]' : 'text-display-sm';
}

/** „47 / 47" → 47 + „ / 47"; „2,3 mil." → 2,3 + „ mil."; „1 553" → 1553; „V2" → null (nie je číslo, karta ho nevypíše). */
function parseCislo(cislo: string): Cislo {
  const m = /^(\d(?:[\d\s ]*\d)?)(?:,(\d+))?(.*)$/.exec(cislo);
  if (!m) return null;
  const int = m[1]!.replace(/[\s ]/g, '');
  const frac = m[2] ?? '';
  const value = Number(`${int}${frac ? '.' + frac : ''}`);
  if (!Number.isFinite(value)) return null;
  return { value, fraction: frac.length, suffix: m[3] ?? '' };
}

/** Jednorazový IntersectionObserver (náhrada za motion useInView): true, keď je aspoň `amount` prvku vo viewporte. */
function useVZabere(ref: RefObject<Element | null>, amount = 0.5): boolean {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setV(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setV(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount]);
  return v;
}

/** Číslo karty: statický text (SSR, pred zábermi, reduced motion); po `animate` NumberFlow 0 → hodnota. */
function Cislo({ cislo, className, animate }: { cislo: string; className?: string; animate: boolean }) {
  const parsed = parseCislo(cislo);
  const [flow, setFlow] = useState<number | null>(null);
  const value = parsed?.value ?? 0;
  const numeric = parsed !== null;
  useEffect(() => {
    if (!animate || !numeric) return;
    setFlow(0);
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setFlow(value));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [animate, numeric, value]);

  if (parsed === null || flow === null) return <span className={cn('tabular-nums', className)}>{nbsp(cislo)}</span>;
  // prístupný názov = hotový text z fakty.ts; NumberFlow (custom element s číslicami 0–9 v strome) je pre čítačky skrytý
  return (
    <span className={cn('tabular-nums', className)}>
      <span className="sr-only">{nbsp(cislo)}</span>
      <span aria-hidden="true">
        <NumberFlow
          value={flow}
          locales="sk-SK"
          format={{ minimumFractionDigits: parsed.fraction, maximumFractionDigits: parsed.fraction }}
          willChange
        />
        {parsed.suffix ? <span>{nbsp(parsed.suffix)}</span> : null}
      </span>
    </span>
  );
}

/** Log kontrol pre „Systém pre makléra": subsystémy z riadku karty (spec 05 §2.3), počet z cislo. CSS stagger
 *  (keyframes v PostavilSekcia.astro, is:global), reduced motion = všetko naraz. */
function LogKontrol({ p }: { p: Projekt }) {
  const subsystemy = ['web', 'rezervácie', 'CRM · 23 tabuliek', 'follow-upy', 'Telegram'];
  const riadky = ['Kontroly pred vydaním:', ...subsystemy.map((s) => `✓ ${s}`), `${nbsp(p.cislo)} kontrol prešlo.`];
  return (
    <div className="log-kontrol rounded-lg border-3 border-ink bg-ink p-4 font-mono text-sm leading-relaxed text-paper shadow-brutal-sm">
      <p className="mb-3 flex items-center gap-2 text-paper/70" aria-hidden="true">
        <span className="inline-block size-3 rounded-full bg-hot" />
        <span className="inline-block size-3 rounded-full bg-yellow" />
        <span className="inline-block size-3 rounded-full bg-lime" />
        <span className="ml-2">xvadur · kontroly</span>
      </p>
      <ol className="space-y-1" role="list">
        {riadky.map((r, n) => (
          <li
            key={r}
            className={cn('log-riadok', n === 0 && 'text-yellow', n === riadky.length - 1 ? 'font-bold' : n > 0 && 'text-lime')}
            style={{ ['--n' as string]: n }}
          >
            {r}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Karta({ p, i }: { p: Projekt; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduced = useReducedMotion();
  const vZabere = useVZabere(ref, 0.5);
  const { tone, bg } = PASTELY[i % PASTELY.length]!;
  const maCislo = parseCislo(p.cislo) !== null;
  const cisloClass = cn('font-display font-extrabold leading-none tracking-tight whitespace-nowrap', cisloSize(p.cislo, 'karta'));
  /* card-drop na samotnej karte (nie na obale → žiadny druhý tieň); fill-mode backwards, aby po dopade animácia
     neprepisovala lift/press (animácia by inak natrvalo držala transform a tieň z posledného keyframu) */
  const dropStyle: CSSProperties = { ['--i' as string]: i, animationFillMode: 'backwards' };

  return (
    <li ref={ref} className="relative">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn('brutal lift press card-drop relative flex h-full min-h-56 w-full flex-col items-start gap-3 p-5 text-left', bg)}
            style={dropStyle}
          >
            <span className="x-stamp" aria-hidden="true" />
            {maCislo ? <Cislo cislo={p.cislo} className={cisloClass} animate={vZabere && !reduced} /> : null}
            <span className={cn('font-display font-extrabold uppercase leading-tight', maCislo ? 'text-xl' : 'pr-10 text-3xl')}>
              {p.nazov}
            </span>
            <span className="mt-auto text-base leading-snug text-ink/80">{nbsp(p.riadok)}</span>
            {p.domena ? <span className="font-mono text-sm tracking-wider text-ink/70">{p.domena}</span> : null}
            <span className="sr-only">Otvoriť detail</span>
          </button>
        </DialogTrigger>

        <DialogContent tone={tone} className="p-6 sm:p-8">
          <DialogTitle className="pr-12 text-left">
            {maCislo ? (
              <span className={cn('block font-display font-extrabold leading-none tracking-tight whitespace-nowrap', cisloSize(p.cislo, 'detail'))}>
                <Cislo cislo={p.cislo} animate={!reduced} />
              </span>
            ) : null}
            <span className="mt-2 block font-display text-2xl font-extrabold uppercase leading-tight">{p.nazov}</span>
          </DialogTitle>
          <DialogDescription className="text-lg leading-relaxed text-ink">{nbsp(p.riadok)}</DialogDescription>
          {p.fakty.length > 0 && (
            <dl className="grid grid-cols-2 gap-3">
              {p.fakty.map((f) => (
                <div key={f.label} className="brutal-flat bg-white p-3">
                  <dt className="eyebrow">{f.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold tracking-tight">{nbsp(f.value)}</dd>
                  <dd className="text-sm text-ink/70">{nbsp(f.note)}</dd>
                </div>
              ))}
            </dl>
          )}
          {p.id === 'system-pre-maklera' ? <LogKontrol p={p} /> : null}
          {p.url ? (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex min-h-12 items-center gap-2 self-start rounded-lg border-3 border-ink bg-white px-5 font-display text-lg font-extrabold uppercase shadow-brutal hover:bg-white-hover"
            >
              {p.domena ?? p.url}
              <ArrowUpRightIcon size={22} weight="bold" aria-hidden="true" />
            </a>
          ) : p.domena ? (
            <p className="font-mono text-sm tracking-wider text-ink/70">{p.domena}</p>
          ) : null}
        </DialogContent>
      </Dialog>
    </li>
  );
}

export default function Postavil() {
  // Strom je stabilný: mriežka je vždy priamy potomok obalu, ImageTrail je prídavný overlay (len desktop + myš, bez reduced)
  const desktop = useFinePointerDesktop();
  const reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  return (
    <div ref={host} className="relative">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="list">
        {POSTAVIL.map((p, i) => (
          <Karta key={p.id} p={p} i={i} />
        ))}
      </ul>
      {desktop && !reduced ? (
        <Hranica>
          <Suspense fallback={null}>
            <Stopa host={host} />
          </Suspense>
        </Hranica>
      ) : null}
    </div>
  );
}
