/** V7-05 · Komiks — posledný panel „Pokračovanie nabudúce: ty“. FUNKČNÁ rezervácia vyšetrenia.
 *  Logika a payload ako src/components/v5/Rezervacia.tsx: GET /api/terminy/ (voľné termíny), POST /api/rezervacia/
 *  { slot, meno, email, tema, utm: utm(), web (honeypot) }, 409 = termín obsadený → znovu načítať termíny,
 *  úspech = konfety (Magic UI), zhrnutie, .ics, udalosť `konzultacia_rezervacia`. Keď API nie je (statický náhľad,
 *  výpadok): slušná chyba s kontaktom. UI z BoldKitu podľa receptu Vysetrenie.tsx z katalógu: stepper + multi-step-form,
 *  date-picker (calendar v popoveri), toggle-group + time-picker, field / input / textarea, sonner, alert.
 *  Ostrov: client:visible. */
import * as React from 'react';
import { format } from 'date-fns';
import { ArrowRight, CalendarPlus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
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
import { MathCurveLoader } from '@/components/ui/math-curve-loader';
import { Skeleton } from '@/components/ui/skeleton';
import ClickSpark from '@/components/vendor/reactbits/ClickSpark';
import { fireConfetti } from '@/components/vendor/magicui/confetti';
import { track, utm } from '@/lib/meranie';
import { ics, slotText } from '@/lib/ics';
import { TERMINY } from '@/data/terminy';
import { cn } from '@/lib/utils';
import { TOASTER } from './data';

type Den = { datum: string; sloty: string[] };
type V = { datum: string; cas: string; meno: string; email: string; tema: string };
const PRAZDNE: V = { datum: '', cas: '', meno: '', email: '', tema: '' };
const NAZVY = ['Deň', 'Čas', 'Príjem pacienta', 'Súhrn'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const kluc = (d: Date) => format(d, 'yyyy-MM-dd');
const zKluca = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const denDlhy = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }).format(zKluca(datum));
const denKratky = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(zKluca(datum));
const casBA = (iso: string) =>
  new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TERMINY.zona }).format(new Date(iso));
const naDate = (cas: string) => {
  const [h, m] = cas.split(':').map(Number);
  const d = new Date();
  d.setHours(h!, m!, 0, 0);
  return d;
};
const casyDna = (dni: Den[], datum: string) => dni.find((d) => d.datum === datum)?.sloty.map(casBA) ?? [];
const slotZ = (dni: Den[], datum: string, cas: string) => dni.find((d) => d.datum === datum)?.sloty.find((s) => casBA(s) === cas) ?? null;

function kroky(dni: Den[]): MultiStepFormStep<V>[] {
  return [
    { id: 'den', validate: (v) => (v.datum ? null : { datum: 'Vyber deň. Ordinujem pondelok až piatok.' }) },
    {
      id: 'cas',
      validate: (v) =>
        !v.cas ? { cas: 'Vyber čas.' } : casyDna(dni, v.datum).includes(v.cas) ? null : { cas: `${v.cas} nie je voľný termín. Vyber jeden z ponúknutých časov.` },
    },
    {
      id: 'prijem',
      validate: (v) => {
        const e: Record<string, string> = {};
        if (v.meno.trim().length < 2) e.meno = 'Napíš meno.';
        if (!EMAIL.test(v.email.trim())) e.email = 'E-mail nevyzerá správne.';
        return Object.keys(e).length ? e : null;
      },
    },
    { id: 'suhrn' },
  ];
}

type Stav = 'nic' | 'posielam' | 'chyba';

export default function Vysetrenie05() {
  const [klient, setKlient] = React.useState(false);
  const [dni, setDni] = React.useState<Den[] | null>(null);
  const [nedostupne, setNedostupne] = React.useState(false);
  const [kolo, setKolo] = React.useState(0);
  const [stav, setStav] = React.useState<Stav>('nic');
  const [sprava, setSprava] = React.useState('');
  const [hotovo, setHotovo] = React.useState<{ slot: string; sprava: string } | null>(null);
  const honeypot = React.useRef<HTMLInputElement>(null);

  const nacitaj = React.useCallback(() => {
    setNedostupne(false);
    fetch('/api/terminy/')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { dni: Den[] }) => setDni(d.dni))
      .catch(() => setNedostupne(true));
  }, []);

  React.useEffect(() => {
    setKlient(true);
    nacitaj();
  }, [nacitaj]);

  const steps = React.useMemo(() => kroky(dni ?? []), [dni]);

  async function odosli(v: V) {
    if (!dni || stav === 'posielam') return;
    const slot = slotZ(dni, v.datum, v.cas);
    if (!slot) {
      setStav('chyba');
      setSprava('Tento termín už nie je voľný. Vráť sa a vyber iný čas.');
      return;
    }
    setStav('posielam');
    const web = honeypot.current?.value ?? '';
    try {
      const r = await fetch('/api/rezervacia/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slot, meno: v.meno, email: v.email, tema: v.tema, utm: utm(), web }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        if (r.status === 409) nacitaj();
        throw new Error(d?.chyba || 'Rezervácia sa nepodarila.');
      }
      const s = d.potvrdenie === 'odoslane' ? 'Potvrdenie s pozvánkou ti prišlo do e-mailu.' : 'Termín je zapísaný. Potvrdenie ti pošlem e-mailom.';
      setStav('nic');
      setHotovo({ slot, sprava: s });
      toast.success('Objednané na vyšetrenie', { toasterId: TOASTER, description: slotText(slot) });
      track('konzultacia_rezervacia', { miesto: 'rezervacia' });
      void fireConfetti({ origin: { y: 0.7 } });
    } catch (err) {
      const m = err instanceof Error && !/fetch|JSON|network/i.test(err.message) ? err.message : 'Rezervácia teraz nejde. Skús WhatsApp nižšie.';
      setStav('chyba');
      setSprava(m);
      toast.error('Rezervácia neprešla', { toasterId: TOASTER, description: m });
    }
  }

  function stiahniIcs(slot: string) {
    const blob = new Blob([ics({ id: 'rez', slot, trvanieMin: TERMINY.trvanieMin })], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'konzultacia-xvadur.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  if (hotovo) {
    return (
      <div role="status" className="flex flex-col gap-5 border-3 border-ink bg-yellow p-6 text-ink shadow-brutal-lg sm:p-8">
        <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Hotovo ✓ · koniec epizódy</p>
        <p className="font-display text-3xl leading-tight font-extrabold uppercase sm:text-4xl">{slotText(hotovo.slot)}</p>
        <p className="text-lg">
          {hotovo.sprava} Na vyšetrenie si prines jeden príklad úlohy, ktorú chceš vyliečiť. Netreba prezentáciu.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="lg" onClick={() => stiahniIcs(hotovo.slot)}>
            <CalendarPlus aria-hidden="true" /> Pridať do kalendára (.ics)
          </Button>
        </div>
      </div>
    );
  }

  if (nedostupne) {
    return (
      <Alert className="border-3 border-ink bg-white p-5 shadow-brutal sm:p-6" role="alert">
        <AlertTitle className="font-display text-2xl font-extrabold uppercase">Kalendár sa nenačítal</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-4 text-lg">
          <span>Rezervácia teraz nejde. Napíš mi cez WhatsApp alebo na adam@xvadur.com a termín dohodneme hneď.</span>
          <span className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={nacitaj}>
              <RotateCcw aria-hidden="true" /> Skúsiť znova
            </Button>
            <Button asChild variant="secondary">
              <a href="mailto:adam@xvadur.com?subject=Vy%C5%A1etrenie">adam@xvadur.com</a>
            </Button>
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  if (!klient || !dni) {
    return (
      <div className="flex flex-col gap-4 border-3 border-ink bg-white p-5 text-ink shadow-brutal-lg sm:p-8" aria-busy="true">
        <div className="flex items-center gap-4" role="status">
          <MathCurveLoader curve="lemniscate" size="md" aria-label="Overujem voľné termíny" />
          <p className="font-mono text-sm font-bold tracking-[0.12em] uppercase">Overujem voľné termíny…</p>
        </div>
        <Skeleton variant="blocks" className="h-14 w-full border-3 border-ink" />
        <Skeleton variant="blocks" className="h-32 w-full border-3 border-ink" />
      </div>
    );
  }

  if (dni.length === 0) {
    return (
      <Alert className="border-3 border-ink bg-white p-5 shadow-brutal">
        <AlertTitle className="font-display text-2xl font-extrabold uppercase">Plno</AlertTitle>
        <AlertDescription className="text-lg">Najbližšie dva týždne je plno. Napíš mi cez WhatsApp.</AlertDescription>
      </Alert>
    );
  }

  return (
    <MultiStepForm<V> key={kolo} steps={steps} initialValues={PRAZDNE} onSubmit={(v) => void odosli(v)}>
      <Formular dni={dni} steps={steps} stav={stav} sprava={sprava} honeypot={honeypot} onReset={() => setKolo((k) => k + 1)} />
    </MultiStepForm>
  );
}

function Formular({
  dni,
  steps,
  stav,
  sprava,
  honeypot,
  onReset,
}: {
  dni: Den[];
  steps: MultiStepFormStep<V>[];
  stav: Stav;
  sprava: string;
  honeypot: React.RefObject<HTMLInputElement | null>;
  onReset: () => void;
}) {
  const f = useMultiStepForm<V>();
  const casy = casyDna(dni, f.values.datum);
  const volne = React.useMemo(() => new Set(dni.map((d) => d.datum)), [dni]);
  const prvy = dni[0] ? zKluca(dni[0].datum) : new Date();
  const posledny = dni.length ? zKluca(dni[dni.length - 1]!.datum) : new Date();

  function chybaKroku() {
    const e = steps[f.activeStep]?.validate?.(f.values);
    const prva = e ? Object.values(e)[0] : null;
    if (prva) toast.error('Ešte chýba údaj', { toasterId: TOASTER, description: prva });
  }

  return (
    <form
      className="flex flex-col gap-6 border-3 border-ink bg-white p-5 text-ink shadow-brutal-lg sm:p-8"
      aria-label="Rezervácia vyšetrenia"
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
        Panel {f.activeStep + 1} · {NAZVY[f.activeStep]}
        {f.activeStep === 1 && ` (${TERMINY.trvanieMin} minút)`}
      </p>

      {f.activeStep === 0 && (
        <Field>
          <FieldLabel htmlFor="k05-den">Deň</FieldLabel>
          <DatePicker
            id="k05-den"
            value={f.values.datum ? zKluca(f.values.datum) : undefined}
            onChange={(d) => {
              f.setValue('datum', d ? kluc(d) : '');
              f.setValue('cas', '');
            }}
            placeholder="Vyber deň"
            dateFormat="EEEE d. MMMM"
            aria-invalid={!!f.errors.datum}
            aria-describedby="k05-den-d"
            className={cn('h-12 w-full sm:w-[320px]', f.errors.datum && 'border-stamp')}
            calendarProps={{
              disabled: (d) => !volne.has(kluc(d)),
              startMonth: prvy,
              endMonth: posledny,
              defaultMonth: f.values.datum ? zKluca(f.values.datum) : prvy,
            }}
          />
          <FieldDescription id="k05-den-d">
            Pondelok až piatok. Najskôr o {TERMINY.najskorHodin} hodín, najďalej {TERMINY.dopreduDni} dní dopredu.
          </FieldDescription>
          <FieldError>{f.errors.datum}</FieldError>
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
          {casy.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <span className="text-sm font-bold">alebo presne:</span>
              <TimePicker
                format="24h"
                minuteStep={30}
                minTime={naDate(casy[0]!)}
                maxTime={naDate(casy[casy.length - 1]!)}
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
          )}
          <FieldDescription>Termíny začínajú celou hodinou. Čas je bratislavský.</FieldDescription>
          <FieldError>{f.errors.cas}</FieldError>
        </Field>
      )}

      {f.activeStep === 2 && (
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="k05-meno">Meno</FieldLabel>
              <Input
                id="k05-meno"
                name="meno"
                autoComplete="name"
                value={f.values.meno}
                onChange={(e) => f.setValue('meno', e.target.value)}
                aria-invalid={!!f.errors.meno}
                aria-describedby={f.errors.meno ? 'k05-meno-e' : undefined}
                className={cn('bg-white', f.errors.meno && 'border-stamp')}
              />
              <FieldError id="k05-meno-e">{f.errors.meno}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="k05-email">E-mail</FieldLabel>
              <Input
                id="k05-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={f.values.email}
                onChange={(e) => f.setValue('email', e.target.value)}
                aria-invalid={!!f.errors.email}
                aria-describedby={f.errors.email ? 'k05-email-e' : 'k05-email-d'}
                className={cn('bg-white', f.errors.email && 'border-stamp')}
              />
              <FieldDescription id="k05-email-d">Sem príde potvrdenie s pozvánkou.</FieldDescription>
              <FieldError id="k05-email-e">{f.errors.email}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="k05-tema">S čím prichádzaš? (nepovinné)</FieldLabel>
            <Textarea
              id="k05-tema"
              name="tema"
              rows={3}
              maxLength={600}
              value={f.values.tema}
              onChange={(e) => f.setValue('tema', e.target.value)}
              placeholder="Napr. odpovedám na tie isté dopyty stále dookola."
              className="bg-white"
            />
            <FieldDescription className="text-right font-mono">{f.values.tema.length} / 600</FieldDescription>
          </Field>
        </FieldGroup>
      )}

      {f.activeStep === 3 && (
        <dl className="grid gap-3 border-3 border-ink bg-paper p-4">
          <div>
            <dt className="font-mono text-xs font-bold uppercase">Termín</dt>
            <dd className="font-display text-2xl leading-tight font-extrabold uppercase">
              {slotZ(dni, f.values.datum, f.values.cas) ? slotText(slotZ(dni, f.values.datum, f.values.cas)!) : '—'}
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

      {/* honeypot: ľudia ho nevidia, roboti vyplnia */}
      <input ref={honeypot} type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {stav === 'chyba' && (
        <Alert variant="destructive" role="alert" className="border-3 border-ink">
          <AlertTitle className="font-bold">Rezervácia neprešla</AlertTitle>
          <AlertDescription>
            {sprava}{' '}
            <a className="underline" href="mailto:adam@xvadur.com?subject=Vy%C5%A1etrenie">
              adam@xvadur.com
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t-3 border-ink pt-5">
        {!f.isFirstStep && (
          <Button type="button" variant="outline" onClick={f.back}>
            Späť
          </Button>
        )}
        {f.isLastStep ? (
          <ClickSpark sparkColor="ink" sparkRadius={26} sparkCount={10} className="inline-block max-w-full">
            <Button type="submit" variant="accent" size="lg" className="max-w-full whitespace-normal" disabled={stav === 'posielam'}>
              {stav === 'posielam' ? 'Objednávam…' : 'Objednať sa na vyšetrenie'} <ArrowRight aria-hidden="true" />
            </Button>
          </ClickSpark>
        ) : (
          <Button type="submit" size="lg">
            Ďalej <ArrowRight aria-hidden="true" />
          </Button>
        )}
        {f.isLastStep && (
          <Button type="button" variant="ghost" onClick={onReset} className="ml-auto">
            Začať odznova
          </Button>
        )}
      </div>
    </form>
  );
}
