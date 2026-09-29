/** V7-08 · okno Vyšetrenie = formulár prijatia pacienta. FUNKČNÝ: GET /api/terminy/ → POST /api/rezervacia/
 *  { slot, meno, email, tema, utm, web } ako v5/Rezervacia.tsx (409 = termín zobraný → nové načítanie, konfety, .ics,
 *  track konzultacia_rezervacia). UI z BoldKitu podľa receptu Vysetrenie.tsx: stepper + multi-step-form, date-picker,
 *  toggle-group + time-picker, field/input/textarea, alert, heatmap-chart „rozpis ordinácie“ (klik = najbližší voľný termín).
 *  Keď API neodpovedá (statický náhľad, výpadok): termíny podľa pravidiel zo src/data/terminy.ts + jasné upozornenie. */
import * as React from 'react';
import { format } from 'date-fns';
import { ArrowRight, ClipboardPlus, RotateCcw } from 'lucide-react';
import { MultiStepForm, useMultiStepForm, type MultiStepFormStep } from '@/components/ui/multi-step-form';
import { Stepper, StepperItem, StepperList, StepperSeparator, StepperTrigger } from '@/components/ui/stepper';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HeatmapChart, type HeatmapCellData } from '@/components/ui/heatmap-chart';
import { MathCurveLoader } from '@/components/ui/math-curve-loader';
import { fireConfetti } from '@/components/vendor/magicui/confetti';
import { PRIEBEH } from '@/components/konzultacia/data';
import { VLAJKA } from '@/data/ponuka';
import { TERMINY, vsetkyTerminy, type Den } from '@/data/terminy';
import { ics, slotText } from '@/lib/ics';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import Okno from './Okno';
import { posli } from './store';

type V = { datum: string; cas: string; meno: string; email: string; tema: string };
const PRAZDNE: V = { datum: '', cas: '', meno: '', email: '', tema: '' };
const NAZVY = ['Deň', 'Čas', 'Príjem pacienta', 'Súhrn'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DNI_TYZDNA = ['Po', 'Ut', 'St', 'Št', 'Pi'];

const kluc = (d: Date) => format(d, 'yyyy-MM-dd');
const zKluca = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const denKratky = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(zKluca(datum));
const denDlhy = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }).format(zKluca(datum));
const casBa = (iso: string) => new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TERMINY.zona }).format(new Date(iso));
const naDate = (cas: string) => {
  const [h, m] = cas.split(':').map(Number);
  const d = new Date();
  d.setHours(h!, m!, 0, 0);
  return d;
};
/** 1 = pondelok … 5 = piatok (dátum je v Bratislavskom kalendári, poludnie UTC nemení deň). */
const denIndex = (datum: string) => {
  const [y, m, d] = datum.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!, 12)).getUTCDay();
};
const casyDna = (dni: Den[], datum: string) => dni.find((d) => d.datum === datum)?.sloty.map(casBa) ?? [];
const slotPre = (dni: Den[], v: V) => dni.find((d) => d.datum === v.datum)?.sloty.find((s) => casBa(s) === v.cas) ?? null;

function kroky(dni: Den[]): MultiStepFormStep<V>[] {
  return [
    { id: 'den', validate: (v) => (v.datum ? null : { datum: 'Vyber deň. Ordinujem pondelok až piatok.' }) },
    {
      id: 'cas',
      validate: (v) =>
        !v.cas ? { cas: 'Vyber čas.' } : casyDna(dni, v.datum).includes(v.cas) ? null : { cas: `${v.cas} nie je voľný termín. Vyber celú hodinu z ponuky.` },
    },
    {
      id: 'prijem',
      validate: (v) => {
        const e: Record<string, string> = {};
        if (v.meno.trim().length < 2) e.meno = 'Napíš, ako ťa mám oslovovať.';
        if (!EMAIL.test(v.email.trim())) e.email = 'Skontroluj e-mail, niečo v ňom chýba.';
        return Object.keys(e).length ? e : null;
      },
    },
    { id: 'suhrn' },
  ];
}

type Odoslanie = { stav: 'nic' | 'posielam' | 'ok' | 'chyba'; sprava: string; slot: string | null };

export default function OknoVysetrenie() {
  const [dni, setDni] = React.useState<Den[] | null>(null);
  const [zPravidiel, setZPravidiel] = React.useState(false);
  const [kolo, setKolo] = React.useState(0);
  const [o, setO] = React.useState<Odoslanie>({ stav: 'nic', sprava: '', slot: null });
  const web = React.useRef('');

  const nacitaj = React.useCallback(() => {
    fetch('/api/terminy/')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { dni: Den[] }) => {
        setDni(d.dni);
        setZPravidiel(false);
      })
      .catch(() => {
        setDni(vsetkyTerminy());
        setZPravidiel(true);
      });
  }, []);
  React.useEffect(nacitaj, [nacitaj]);

  async function odosli(v: V) {
    if (!dni || o.stav === 'posielam') return;
    const slot = slotPre(dni, v);
    if (!slot) {
      setO({ stav: 'chyba', sprava: 'Tento termín už nie je k dispozícii. Vyber iný.', slot: null });
      return;
    }
    setO({ stav: 'posielam', sprava: '', slot });
    try {
      const r = await fetch('/api/rezervacia/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slot, meno: v.meno, email: v.email, tema: v.tema, utm: utm(), web: web.current }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        if (r.status === 409) nacitaj();
        throw new Error(d?.chyba || 'Rezervácia sa nepodarila.');
      }
      const sprava = d.potvrdenie === 'odoslane' ? 'Potvrdenie s pozvánkou ti prišlo do e-mailu.' : 'Termín je zapísaný. Potvrdenie ti pošlem e-mailom.';
      setO({ stav: 'ok', sprava, slot });
      track('konzultacia_rezervacia', { miesto: 'v708-vysetrenie' });
      posli({ typ: 'hlasenie', text: 'Pacient prijatý', popis: slotText(slot), druh: 'success' });
      void fireConfetti({ origin: { y: 0.7 } });
    } catch (err) {
      const sprava =
        err instanceof Error && !/fetch|JSON|network|Failed/i.test(err.message) ? err.message : 'Rezervácia teraz nejde. Napíš mi na adam@xvadur.com alebo cez WhatsApp a termín dohodneme hneď.';
      setO({ stav: 'chyba', sprava, slot: null });
      posli({ typ: 'hlasenie', text: 'Príjem sa nepodaril', popis: sprava, druh: 'error' });
    }
  }

  function stiahniIcs() {
    if (!o.slot) return;
    const blob = new Blob([ics({ id: 'rez', slot: o.slot, trvanieMin: TERMINY.trvanieMin })], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'konzultacia-xvadur.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  return (
    <Okno id="vysetrenie" ikona={<ClipboardPlus />} className="lg:col-span-8 lg:col-start-3 lg:mt-8" stav={<>PRIJATIE.FRM · {zPravidiel ? 'termíny podľa rozpisu' : dni ? 'termíny z kalendára' : 'načítavam kalendár'} · čas bratislavský</>}>
      <div id="konzultacia" className="grid scroll-mt-24 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <p className="font-mono text-xs font-bold tracking-[0.16em] uppercase">
            {VLAJKA.nazov} / {VLAJKA.trvanie} / {VLAJKA.cena}
          </p>
          <p className="font-display text-3xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-4xl">
            Objednaj sa
            <br />
            na vyšetrenie.
          </p>
          <p className="font-display text-xl leading-tight font-bold">{VLAJKA.titulok}</p>
          <ol className="grid list-none gap-2 p-0" aria-label="Priebeh vyšetrenia">
            {PRIEBEH.map((k) => (
              <li key={k.cas} className="flex gap-3 border-3 border-ink bg-paper px-3 py-2">
                <span className="w-20 shrink-0 font-mono text-xs font-bold">{k.cas}</span>
                <span className="text-sm leading-snug font-bold">{k.vznikne}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="min-w-0">
          {o.stav === 'ok' && o.slot ? (
            <div role="status" className="flex flex-col gap-5 border-3 border-ink bg-yellow p-5 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-6">
              <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Pacient prijatý ✓</p>
              <p className="font-display text-3xl leading-tight font-extrabold uppercase">{slotText(o.slot)}</p>
              <p className="text-lg">{o.sprava} Na vyšetrenie si prines jeden príklad úlohy, ktorú chceš vyliečiť. Netreba prezentáciu.</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={stiahniIcs}>
                  Pridať do kalendára (.ics)
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setO({ stav: 'nic', sprava: '', slot: null });
                    setKolo((k) => k + 1);
                  }}
                >
                  <RotateCcw aria-hidden="true" /> Nový príjem
                </Button>
              </div>
            </div>
          ) : !dni ? (
            <div className="flex min-h-96 flex-col items-center justify-center gap-4 border-3 border-dashed border-ink bg-paper p-6" aria-busy="true">
              <MathCurveLoader curve="lemniscate" size="lg" aria-label="Overujem voľné termíny" />
              <p className="font-mono text-sm font-bold uppercase">Overujem voľné termíny…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {zPravidiel && (
                <Alert variant="warning">
                  <AlertTitle>Kalendár sa nenačítal</AlertTitle>
                  <AlertDescription>
                    Ukazujem termíny podľa rozpisu (Po–Pi 14:00–19:00). Či je termín naozaj voľný, overím pri odoslaní. Keby to nešlo, napíš na adam@xvadur.com.
                  </AlertDescription>
                </Alert>
              )}
              <MultiStepForm<V> key={kolo} steps={kroky(dni)} initialValues={PRAZDNE} onSubmit={(v) => void odosli(v)}>
                <Formular dni={dni} odoslanie={o} web={web} />
              </MultiStepForm>
            </div>
          )}
        </div>
      </div>
    </Okno>
  );
}

function Rozpis({ dni, onVyber }: { dni: Den[]; onVyber: (datum: string, cas: string) => void }) {
  const data = React.useMemo<HeatmapCellData[]>(() => {
    const out: HeatmapCellData[] = [];
    DNI_TYZDNA.forEach((row, i) => {
      TERMINY.casy.forEach((col) => {
        const value = dni.filter((d) => denIndex(d.datum) === i + 1).reduce((n, d) => n + (d.sloty.some((s) => casBa(s) === col) ? 1 : 0), 0);
        out.push({ row, col, value });
      });
    });
    return out;
  }, [dni]);
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs font-bold uppercase">Rozpis ordinácie · voľné termíny na {TERMINY.dopreduDni} dní (klik = najbližší)</p>
      <HeatmapChart
        data={data}
        rows={DNI_TYZDNA}
        cols={TERMINY.casy}
        cellSize={40}
        colorLow="var(--color-paper)"
        colorHigh="var(--color-yellow)"
        ariaLabel="Rozpis ordinácie: počet voľných termínov podľa dňa a hodiny"
        className="border-3 border-ink bg-white p-2"
        onCellClick={(c) => {
          const i = DNI_TYZDNA.indexOf(c.row) + 1;
          const den = dni.find((d) => denIndex(d.datum) === i && d.sloty.some((s) => casBa(s) === c.col));
          if (den) onVyber(den.datum, c.col);
          else posli({ typ: 'hlasenie', text: `${c.row} ${c.col} je obsadené`, popis: 'Vyber iné políčko alebo deň v kalendári.', druh: 'warning' });
        }}
      />
    </div>
  );
}

function Formular({ dni, odoslanie, web }: { dni: Den[]; odoslanie: Odoslanie; web: React.MutableRefObject<string> }) {
  const f = useMultiStepForm<V>();
  const fRef = React.useRef(f);
  fRef.current = f;
  const casy = casyDna(dni, f.values.datum);
  const volne = React.useMemo(() => new Set(dni.map((d) => d.datum)), [dni]);
  const posledny = dni.length ? zKluca(dni[dni.length - 1]!.datum) : new Date();
  const steps = React.useMemo(() => kroky(dni), [dni]);

  function chybaKroku() {
    const e = steps[f.activeStep]?.validate?.(f.values);
    const prva = e ? Object.values(e)[0] : null;
    if (prva) posli({ typ: 'hlasenie', text: 'Ešte chýba údaj', popis: prva, druh: 'warning' });
  }

  return (
    <form
      className="flex flex-col gap-5 border-3 border-ink bg-white p-4 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-6"
      aria-label="Formulár prijatia: rezervácia vyšetrenia"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (f.isLastStep) f.submit();
        else {
          chybaKroku();
          f.next();
        }
      }}
    >
      <Stepper
        activeStep={f.activeStep}
        onStepChange={(i) => {
          if (i > f.activeStep + 1) return;
          if (i > f.activeStep) chybaKroku();
          f.goTo(i);
        }}
        className="flex-col"
      >
        <StepperList>
          {NAZVY.map((n, i) => (
            <StepperItem key={n} index={i} className={cn(i < NAZVY.length - 1 && 'flex-1')}>
              <StepperTrigger aria-label={`${i + 1}. ${n}`} />
              {i < NAZVY.length - 1 && <StepperSeparator />}
            </StepperItem>
          ))}
        </StepperList>
      </Stepper>
      <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase" aria-live="polite">
        {f.activeStep + 1} · {NAZVY[f.activeStep]}
        {f.activeStep === 1 && ' (30 minút)'}
      </p>

      {f.activeStep === 0 && (
        <Field>
          <FieldLabel htmlFor="v708-den">Deň</FieldLabel>
          <DatePicker
            id="v708-den"
            value={f.values.datum ? zKluca(f.values.datum) : undefined}
            onChange={(d) => {
              f.setValue('datum', d ? kluc(d) : '');
              f.setValue('cas', '');
            }}
            placeholder="Vyber deň"
            dateFormat="EEEE d. MMMM"
            aria-invalid={!!f.errors.datum}
            className={cn('w-full', f.errors.datum && 'border-stamp')}
            calendarProps={{
              disabled: (d: Date) => !volne.has(kluc(d)),
              startMonth: new Date(),
              endMonth: posledny,
              defaultMonth: dni[0] ? zKluca(dni[0].datum) : undefined,
            }}
          />
          <FieldDescription>
            Pondelok až piatok. Najskôr o {TERMINY.najskorHodin} hodín, najďalej {TERMINY.dopreduDni} dní dopredu.
          </FieldDescription>
          <FieldError>{f.errors.datum}</FieldError>
          {dni.length > 0 ? (
            <div className="flex flex-col gap-2 pt-2">
              <p className="font-mono text-xs font-bold uppercase">Najbližšie voľné</p>
              <ToggleGroup
                type="single"
                variant="outline"
                value={f.values.datum}
                onValueChange={(v) => {
                  if (!v) return;
                  f.setValue('datum', v);
                  f.setValue('cas', '');
                }}
                className="flex flex-wrap justify-start gap-3"
                aria-label="Najbližšie voľné dni"
              >
                {dni.slice(0, 4).map((d) => (
                  <ToggleGroupItem key={d.datum} value={d.datum} className="min-h-11 normal-case">
                    {denKratky(d.datum)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          ) : (
            <p className="text-base font-bold">Najbližšie dva týždne je plno. Napíš mi na adam@xvadur.com.</p>
          )}
          <div className="pt-3">
            <Rozpis
              dni={dni}
              onVyber={(datum, cas) => {
                f.setValue('datum', datum);
                f.setValue('cas', cas);
                window.setTimeout(() => fRef.current.goTo(2), 0);
              }}
            />
          </div>
        </Field>
      )}

      {f.activeStep === 1 && (
        <Field>
          <FieldLabel>Čas · {f.values.datum ? denDlhy(f.values.datum) : ''}</FieldLabel>
          <ToggleGroup
            type="single"
            size="lg"
            variant="outline"
            value={f.values.cas}
            onValueChange={(v) => v && f.setValue('cas', v)}
            className="grid grid-cols-3 gap-3 sm:grid-cols-6"
            aria-label="Voľné časy"
          >
            {casy.map((c) => (
              <ToggleGroupItem key={c} value={c} className="min-h-12 font-mono text-base">
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <span className="text-sm font-bold">alebo presne:</span>
            <TimePicker
              format="24h"
              minuteStep={30}
              minTime={casy[0] ? naDate(casy[0]) : undefined}
              maxTime={casy.length ? naDate(casy[casy.length - 1]!) : undefined}
              value={f.values.cas ? naDate(f.values.cas) : undefined}
              onChange={(d) => {
                if (!d) return;
                if (d.getMinutes() % 30 !== 0) d.setMinutes(0, 0, 0);
                f.setValue('cas', format(d, 'HH:mm'));
              }}
              placeholder="Vyber čas"
              aria-invalid={!!f.errors.cas}
              className={cn('w-[200px]', f.errors.cas && 'border-stamp')}
            />
          </div>
          <FieldDescription>Termíny začínajú celou hodinou. Čas je bratislavský.</FieldDescription>
          <FieldError>{f.errors.cas}</FieldError>
        </Field>
      )}

      {f.activeStep === 2 && (
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="v708-meno">Meno</FieldLabel>
              <Input
                id="v708-meno"
                name="meno"
                autoComplete="name"
                value={f.values.meno}
                onChange={(e) => f.setValue('meno', e.target.value)}
                aria-invalid={!!f.errors.meno}
                aria-describedby={f.errors.meno ? 'v708-meno-e' : undefined}
                className="bg-white text-base"
              />
              <FieldError id="v708-meno-e">{f.errors.meno}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="v708-email">E-mail</FieldLabel>
              <Input
                id="v708-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={f.values.email}
                onChange={(e) => f.setValue('email', e.target.value)}
                aria-invalid={!!f.errors.email}
                aria-describedby={f.errors.email ? 'v708-email-e' : 'v708-email-d'}
                className="bg-white text-base"
              />
              <FieldDescription id="v708-email-d">Sem príde potvrdenie s pozvánkou.</FieldDescription>
              <FieldError id="v708-email-e">{f.errors.email}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="v708-tema">S čím prichádzaš? (nepovinné)</FieldLabel>
            <Textarea
              id="v708-tema"
              name="tema"
              rows={3}
              maxLength={600}
              value={f.values.tema}
              onChange={(e) => f.setValue('tema', e.target.value)}
              placeholder="Napr. odpovedám na tie isté dopyty stále dookola."
              className="bg-white text-base"
            />
            <FieldDescription className="text-right font-mono">{f.values.tema.length} / 600</FieldDescription>
          </Field>
          {/* honeypot: ľudia ho nevidia, roboti vyplnia */}
          <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" onChange={(e) => (web.current = e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        </FieldGroup>
      )}

      {f.activeStep === 3 && (
        <dl className="grid gap-3 border-3 border-ink bg-paper p-4">
          <div>
            <dt className="font-mono text-xs font-bold uppercase">Termín</dt>
            <dd className="font-display text-2xl leading-tight font-extrabold uppercase">
              {slotPre(dni, f.values) ? slotText(slotPre(dni, f.values)!) : `${f.values.datum} ${f.values.cas}`}
            </dd>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="font-mono text-xs font-bold uppercase">Pacient</dt>
              <dd className="font-bold break-words">{f.values.meno}</dd>
            </div>
            <div className="min-w-0">
              <dt className="font-mono text-xs font-bold uppercase">E-mail</dt>
              <dd className="font-bold break-words">{f.values.email}</dd>
            </div>
          </div>
          <div>
            <dt className="font-mono text-xs font-bold uppercase">S čím prichádzaš</dt>
            <dd className="break-words">{f.values.tema || '— (povieš na vyšetrení)'}</dd>
          </div>
        </dl>
      )}

      {odoslanie.stav === 'chyba' && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Príjem sa nepodaril</AlertTitle>
          <AlertDescription>{odoslanie.sprava}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t-3 border-ink pt-4">
        {!f.isFirstStep && (
          <Button type="button" variant="outline" onClick={f.back}>
            Späť
          </Button>
        )}
        {f.isLastStep ? (
          <Button type="submit" variant="accent" size="lg" disabled={odoslanie.stav === 'posielam'} className="max-w-full whitespace-normal" data-track="konzultacia_klik" data-track-miesto="v708-odoslat">
            {odoslanie.stav === 'posielam' ? 'Objednávam…' : 'Objednať sa na vyšetrenie'} <ArrowRight aria-hidden="true" />
          </Button>
        ) : (
          <Button type="submit" size="lg">
            Ďalej <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}
