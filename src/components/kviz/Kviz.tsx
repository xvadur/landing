/** Kvíz AI-readiness — jeden React ostrov (client:load), bez backendu.
 *  5 základných otázok + 2/5 doplnkových (logika.ts), prechod kroku čisto CSS (kľúčovaný remount panelu:
 *  obal `animate-fade-in`, karty `card-drop` so staggerom; reduced motion rieši global.css = 120 ms fade),
 *  indikátor Kroky, neobrutalism RadioGroup/Input/Button, výsledok Vysledok.tsx. Odpovede v sessionStorage (try/catch).
 *  Klávesnica: RadioGroup = šípky + medzera, Enter v čísle = Ďalej, po zmene kroku fokus na nadpis otázky
 *  (s posunom pod lepiacu hlavičku). Bez Motion runtime (rozpočet doc 10). */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { RadioGroup, RadioGroupCard } from '@/components/vendor/neobrutalism/radio-group';
import { Input } from '@/components/vendor/neobrutalism/input';
import { Button } from '@/components/vendor/neobrutalism/button';
import { cn } from '@/lib/utils';
import type { Otazka, OtazkaCislo, OtazkaRadio } from '@/data/kviz/otazky';
import { otazkyPre, vyhodnot, type Odpovede } from './logika';
import Kroky from './Kroky';
import Vysledok from './Vysledok';

const KLUC = 'xvadur:kviz:v1';
/** výška lepiacej hlavičky + rezerva: pod túto hranicu nadpis po fokuse dorolujeme */
const HLAVICKA_PX = 88;
type Ulozene = { odpovede: Odpovede; index: number; dosiahnuty: number };

function nacitaj(): Ulozene | null {
  try {
    const raw = window.sessionStorage.getItem(KLUC);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Ulozene>;
    if (!d || typeof d !== 'object' || typeof d.odpovede !== 'object') return null;
    return { odpovede: d.odpovede ?? {}, index: Number(d.index) || 0, dosiahnuty: Number(d.dosiahnuty) || 0 };
  } catch {
    return null;
  }
}
function uloz(u: Ulozene) {
  try {
    window.sessionStorage.setItem(KLUC, JSON.stringify(u));
  } catch {
    /* privátny režim, plná pamäť — kvíz beží aj bez uloženia */
  }
}
function zmaz() {
  try {
    window.sessionStorage.removeItem(KLUC);
  } catch {
    /* ignoruj */
  }
}

/** Číselné otázky sú celočíselné (krok 1): desatinné číslo neprejde, aby vzorec, URL aj kópia niesli to isté číslo. */
function jeZodpovedana(q: Otazka, v: string | number | undefined): boolean {
  if (v === undefined || v === '') return false;
  if (q.typ === 'cislo') {
    const n = Number(v);
    return Number.isInteger(n) && n >= q.min && n <= q.max;
  }
  return q.moznosti.some((m) => m.value === v);
}

export default function Kviz() {
  const [odpovede, setOdpovede] = useState<Odpovede>({});
  const [index, setIndex] = useState(0);
  const [dosiahnuty, setDosiahnuty] = useState(0);
  const [chyba, setChyba] = useState<string | null>(null);
  const [obnovene, setObnovene] = useState(false);
  const obalRef = useRef<HTMLDivElement>(null);
  const prvyRender = useRef(true);

  // obnova zo sessionStorage až po hydratácii (SSR ostáva stabilné)
  useEffect(() => {
    const u = nacitaj();
    if (u) {
      const otazky = otazkyPre(u.odpovede);
      setOdpovede(u.odpovede);
      setIndex(Math.min(u.index, otazky.length));
      setDosiahnuty(Math.min(u.dosiahnuty, otazky.length));
    }
    setObnovene(true);
  }, []);

  useEffect(() => {
    if (!obnovene) return;
    uloz({ odpovede, index, dosiahnuty });
  }, [odpovede, index, dosiahnuty, obnovene]);

  // fokus na nadpis po zmene kroku (nie pri prvom renderi); ak ho kryje lepiaca hlavička, doroluj
  useEffect(() => {
    if (prvyRender.current) {
      prvyRender.current = false;
      return;
    }
    const raf = window.requestAnimationFrame(() => {
      const h = obalRef.current?.querySelector<HTMLElement>(`[data-kviz-nadpis="${index}"]`);
      if (!h) return;
      h.focus({ preventScroll: true });
      const top = h.getBoundingClientRect().top;
      // roluj blok s eyebrow + nadpisom (scroll-mt-28), nie samotný h2, aby eyebrow neostal pod hlavičkou
      if (top < HLAVICKA_PX || top > window.innerHeight * 0.8) (h.parentElement ?? h).scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [index]);

  const otazky = useMemo(() => otazkyPre(odpovede), [odpovede]);
  const celkom = otazky.length;
  const jeVysledok = index >= celkom;
  const aktualna = jeVysledok ? null : otazky[index];

  const nastav = useCallback((id: Otazka['id'], v: string | number) => {
    setChyba(null);
    setOdpovede((o) => ({ ...o, [id]: v }));
  }, []);

  const dalej = (e?: { preventDefault(): void }) => {
    e?.preventDefault();
    if (!aktualna) return;
    if (!jeZodpovedana(aktualna, odpovede[aktualna.id])) {
      setChyba(aktualna.typ === 'radio' ? 'Vyber jednu možnosť.' : `Zadaj celé číslo od ${aktualna.min} do ${aktualna.max}.`);
      return;
    }
    const dalsi = index + 1;
    setIndex(dalsi);
    setDosiahnuty((d) => Math.max(d, dalsi));
  };
  const spat = () => {
    setChyba(null);
    setIndex((i) => Math.max(0, i - 1));
  };
  const skoc = (i: number) => {
    setChyba(null);
    setIndex(Math.max(0, Math.min(i, celkom)));
  };
  const odznova = () => {
    zmaz();
    setOdpovede({});
    setIndex(0);
    setDosiahnuty(0);
    setChyba(null);
  };

  const vysledok = useMemo(() => (jeVysledok ? vyhodnot(odpovede) : null), [jeVysledok, odpovede]);
  const q = aktualna;
  const nadpisId = q ? `kviz-nadpis-${q.id}` : 'kviz-nadpis-vysledok';

  return (
    <div ref={obalRef} className="grid gap-8" data-kviz data-krok={index} aria-busy={obnovene ? undefined : 'true'}>
      <Kroky celkom={celkom} aktualny={index} dosiahnuty={dosiahnuty} onSkoc={skoc} />
      <div className="brutal shadow-brutal-lg overflow-hidden p-5 sm:p-8 lg:p-10">
        {/* nový krok = nový key → CSS fade obalu + card-drop stagger kariet; jediný pohybový motor na prvok */}
        <div key={q ? q.id : 'vysledok'} className="animate-fade-in">
          {q ? (
            <form onSubmit={dalej} noValidate className="grid gap-6">
              <div className="scroll-mt-28">
                <p className="eyebrow">{q.eyebrow}</p>
                <h2
                  id={nadpisId}
                  data-kviz-nadpis={index}
                  tabIndex={-1}
                  className="mt-3 font-display text-display-sm font-extrabold uppercase leading-[0.92] tracking-tight"
                >
                  {q.otazka}
                </h2>
                {q.typ === 'cislo' && <p className="mt-3 max-w-prose text-base">{q.pomoc}</p>}
              </div>

              {q.typ === 'radio' ? (
                <RadioOtazka
                  q={q}
                  nadpisId={nadpisId}
                  chyba={!!chyba}
                  value={odpovede[q.id] as string | undefined}
                  onChange={(v) => nastav(q.id, v)}
                />
              ) : (
                <CisloOtazka q={q} chyba={!!chyba} value={odpovede[q.id]} onChange={(v) => nastav(q.id, v)} />
              )}

              {chyba && (
                <p id="kviz-chyba" role="alert" className="rounded-lg border-3 border-hot bg-pink px-4 py-3 font-bold text-ink">
                  {chyba}
                </p>
              )}

              <div className={cn('flex gap-3', index > 0 ? 'justify-between' : 'justify-end')}>
                {index > 0 && (
                  <Button type="button" tone="white" variant="default" size="default" onClick={spat}>
                    <ArrowLeftIcon weight="bold" aria-hidden="true" /> Späť
                  </Button>
                )}
                {/* text-xl: paper na hot je 3,17:1 → prejde len ako veľký text (≥ 20 px tučné) */}
                <Button type="submit" tone="hot" size="lg" className="text-xl">
                  {index === celkom - 1 ? 'Vyhodnotiť' : 'Ďalej'} <ArrowRightIcon weight="bold" aria-hidden="true" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="scroll-mt-28">
              <h2 id={nadpisId} data-kviz-nadpis={celkom} tabIndex={-1} className="sr-only">
                Výsledok kvízu
              </h2>
              {vysledok && <Vysledok v={vysledok} onOdznova={odznova} onSpat={() => skoc(celkom - 1)} />}
            </div>
          )}
        </div>
      </div>
      {index > 0 && !jeVysledok && (
        <button
          type="button"
          onClick={odznova}
          className="-mx-1 inline-flex min-h-11 items-center gap-2 justify-self-start px-1 font-bold underline decoration-[3px] underline-offset-4 hover:decoration-hot"
        >
          <ArrowCounterClockwiseIcon weight="bold" size={18} aria-hidden="true" /> Začať odznova
        </button>
      )}
    </div>
  );
}

function RadioOtazka({
  q,
  nadpisId,
  chyba,
  value,
  onChange,
}: {
  q: OtazkaRadio;
  nadpisId: string;
  chyba: boolean;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <RadioGroup
      value={value ?? ''}
      onValueChange={onChange}
      aria-labelledby={nadpisId}
      aria-invalid={chyba || undefined}
      aria-describedby={chyba ? 'kviz-chyba' : undefined}
      required
    >
      {q.moznosti.map((m, i) => (
        <RadioGroupCard key={m.value} value={m.value} className="card-drop items-start" style={{ ['--i' as string]: i }}>
          <span className="block">{m.label}</span>
          {m.hint && <span className="mt-1 block text-sm font-medium opacity-75">{m.hint}</span>}
        </RadioGroupCard>
      ))}
    </RadioGroup>
  );
}

function CisloOtazka({
  q,
  chyba,
  value,
  onChange,
}: {
  q: OtazkaCislo;
  chyba: boolean;
  value: string | number | undefined;
  onChange: (v: string | number) => void;
}) {
  const id = `kviz-${q.id}`;
  const n = value === undefined || value === '' ? NaN : Number(value);
  const nazov = q.id === 'hodiny' ? 'Hodiny týždenne' : 'Hodinová sadzba v eurách';
  const cele = q.krok >= 1;
  return (
    <div className="grid gap-4">
      <label htmlFor={id} className="eyebrow">
        {nazov}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          id={id}
          type="number"
          inputMode={cele ? 'numeric' : 'decimal'}
          pattern={cele ? '[0-9]*' : undefined}
          min={q.min}
          max={q.max}
          step={q.krok}
          value={value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          autoComplete="off"
          className="w-40 max-w-full font-mono text-2xl tabular-nums"
          aria-invalid={chyba || undefined}
          aria-describedby={cn(`${id}-pomoc`, chyba && 'kviz-chyba')}
        />
        <span id={`${id}-pomoc`} className="font-display text-xl font-extrabold uppercase">
          {q.jednotka}
        </span>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Rýchla voľba">
        {q.rychle.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={n === r}
            onClick={() => onChange(r)}
            className={cn(
              'press min-h-11 rounded-lg border-3 border-ink px-4 font-mono text-base tabular-nums shadow-brutal-sm',
              n === r ? 'bg-yellow' : 'bg-white hover:bg-white-hover',
            )}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
