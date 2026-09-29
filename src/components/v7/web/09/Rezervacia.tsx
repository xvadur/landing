/** V7-09 · Rezervácia vyšetrenia — FUNKČNÁ. Logika a payload ako src/components/v5/Rezervacia.tsx:
 *  GET /api/terminy/ → { dni: [{ datum, sloty: ISO[] }] }, POST /api/rezervacia/ { slot, meno, email, tema, utm: utm(), web }.
 *  409 = termín medzitým obsadený → znova načítať termíny a späť na krok Čas. Po úspechu: panel Hotovo, .ics,
 *  udalosť konzultacia_rezervacia, konfety (Magic UI). Keď API nie je (statický náhľad, výpadok): slušná chyba s e-mailom.
 *  UI z BoldKitu podľa receptu Vysetrenie.tsx: Stepper + MultiStepForm + DatePicker (zakázané dni) + ToggleGroup +
 *  TimePicker + Field/Input/Textarea + sonner + MathCurveLoader/Skeleton pri načítaní. */
import * as React from 'react';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { MathCurveLoader } from '@/components/ui/math-curve-loader';
import { fireConfetti } from '@/components/vendor/magicui/confetti';
import { TERMINY, type Den } from '@/data/terminy';
import { ics, slotText } from '@/lib/ics';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import { TOASTER } from './spolocne';

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
const casBratislava = (iso: string) =>
  new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TERMINY.zona }).format(new Date(iso));
const naDate = (cas: string) => {
  const [h, m] = cas.split(':').map(Number);
  const d = new Date();
  d.setHours(h!, m!, 0, 0);
  return d;
};
const slotyDna = (dni: Den[], datum: string) => dni.find((d) => d.datum === datum)?.sloty ?? [];
const casyDna = (dni: Den[], datum: string) => slotyDna(dni, datum).map(casBratislava);
/** Vybraný čas → presne ten ISO reťazec, ktorý vrátilo /api/terminy/. */
const slotZ = (dni: Den[], v: V) => slotyDna(dni, v.datum).find((s) => casBratislava(s) === v.cas) ?? null;

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

type Hotovo = { slot: string; sprava: string };

export default function Rezervacia() {
  const [dni, setDni] = React.useState<Den[] | null>(null);
  const [nedostupne, setNedostupne] = React.useState(false);
  const [hotovo, setHotovo] = React.useState<Hotovo | null>(null);

  const nacitaj = React.useCallback(() => {
    fetch('/api/terminy/')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('terminy'))))
      .then((d: { dni: Den[] }) => {
        setDni(d.dni ?? []);
        setNedostupne(false);
      })
      .catch(() => setNedostupne(true));
  }, []);
  React.useEffect(nacitaj, [nacitaj]);

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
      <div role="status" className="z9-papier z9-zlty flex flex-col gap-5 p-6 sm:p-8">
        <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Hotovo ✓</p>
        <p className="font-display text-3xl leading-tight font-extrabold uppercase sm:text-4xl">{slotText(hotovo.slot)}</p>
        <p className="text-lg">{hotovo.sprava} Na vyšetrenie si prines jeden príklad úlohy, ktorú chceš vyliečiť. Netreba prezentáciu.</p>
        <Button variant="outline" className="self-start bg-white" onClick={() => stiahniIcs(hotovo.slot)}>
          Pridať do kalendára (.ics)
        </Button>
      </div>
    );
  }

  if (nedostupne) {
    return (
      <div role="alert" className="z9-papier z9-biely flex flex-col gap-4 p-6">
        <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Kalendár sa nenačítal</p>
        <p className="text-lg">Rezervácia teraz nejde. Napíš mi cez WhatsApp alebo na adam@xvadur.com a termín dohodneme hneď.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="accent">
            <a href="mailto:adam@xvadur.com?subject=Vy%C5%A1etrenie">adam@xvadur.com</a>
          </Button>
          <Button variant="outline" className="bg-white" onClick={nacitaj}>
            Skúsiť znova
          </Button>
        </div>
      </div>
    );
  }

  if (!dni) {
    return (
      <div className="z9-papier z9-biely flex flex-col gap-5 p-6" role="status" aria-busy="true">
        <div className="flex items-center gap-4">
          <MathCurveLoader curve="lemniscate" size="md" aria-label="Načítavam voľné termíny" />
          <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Hľadám voľné termíny…</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="blocks" className="h-16 border-3 border-ink/30" />
          ))}
        </div>
      </div>
    );
  }

  if (dni.length === 0) {
    return (
      <div className="z9-papier z9-biely p-6">
        <p className="text-lg">Najbližšie dva týždne je plno. Napíš mi na adam@xvadur.com.</p>
      </div>
    );
  }

  return (
    <MultiStepForm<V> steps={kroky(dni)} initialValues={PRAZDNE} onSubmit={() => {}}>
      <Formular
        dni={dni}
        onObsadene={nacitaj}
        onHotovo={(h) => {
          setHotovo(h);
          toast.success('Objednané na vyšetrenie', { toasterId: TOASTER, description: slotText(h.slot) });
          track('konzultacia_rezervacia', { miesto: 'v7-09' });
          void fireConfetti({ origin: { y: 0.7 } });
        }}
      />
    </MultiStepForm>
  );
}

function Formular({ dni, onObsadene, onHotovo }: { dni: Den[]; onObsadene: () => void; onHotovo: (h: Hotovo) => void }) {
  const f = useMultiStepForm<V>();
  const steps = React.useMemo(() => kroky(dni), [dni]);
  const [posielam, setPosielam] = React.useState(false);
  const [chyba, setChyba] = React.useState('');
  const casy = casyDna(dni, f.values.datum);
  const volne = React.useMemo(() => new Set(dni.map((d) => d.datum)), [dni]);
  const posledny = zKluca(dni[dni.length - 1]!.datum);
  const prvy = zKluca(dni[0]!.datum);

  function hlasChybu(): boolean {
    const e = steps[f.activeStep]?.validate?.(f.values);
    const prva = e ? Object.values(e)[0] : null;
    if (prva) toast.error('Ešte chýba údaj', { toasterId: TOASTER, description: prva });
    return !!prva;
  }

  async function odosli(form: HTMLFormElement) {
    if (posielam) return;
    if (!f.submit()) {
      toast.error('Skontroluj údaje', { toasterId: TOASTER, description: 'Niektorý krok nie je vyplnený.' });
      return;
    }
    const slot = slotZ(dni, f.values);
    if (!slot) {
      f.goTo(1);
      return;
    }
    setPosielam(true);
    setChyba('');
    const web = (new FormData(form).get('web') as string) || '';
    try {
      const r = await fetch('/api/rezervacia/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slot, meno: f.values.meno, email: f.values.email, tema: f.values.tema, utm: utm(), web }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        if (r.status === 409) {
          f.setValue('cas', '');
          f.goTo(1);
          onObsadene();
        }
        throw new Error(d?.chyba || 'Rezervácia sa nepodarila.');
      }
      onHotovo({
        slot,
        sprava: d.potvrdenie === 'odoslane' ? 'Potvrdenie s pozvánkou ti prišlo do e-mailu.' : 'Termín je zapísaný. Potvrdenie ti pošlem e-mailom.',
      });
    } catch (err) {
      const msg = err instanceof Error && !/fetch|JSON|network/i.test(err.message) ? err.message : 'Rezervácia teraz nejde. Napíš mi na adam@xvadur.com.';
      setChyba(msg);
      toast.error('Rezervácia neprešla', { toasterId: TOASTER, description: msg });
    } finally {
      setPosielam(false);
    }
  }

  return (
    <form
      className="z9-papier z9-biely flex flex-col gap-6 p-5 sm:p-8"
      aria-label="Rezervácia vyšetrenia"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (f.isLastStep) void odosli(e.currentTarget);
        else {
          hlasChybu();
          f.next();
        }
      }}
    >
      <Stepper
        activeStep={f.activeStep}
        onStepChange={(i) => {
          if (i > f.activeStep + 1) return;
          if (i > f.activeStep) hlasChybu();
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
        {f.activeStep === 1 && ` (${TERMINY.trvanieMin} minút)`}
      </p>

      {f.activeStep === 0 && (
        <Field>
          <FieldLabel htmlFor="z9-den">Deň</FieldLabel>
          <DatePicker
            id="z9-den"
            value={f.values.datum ? zKluca(f.values.datum) : undefined}
            onChange={(d) => {
              f.setValue('datum', d ? kluc(d) : '');
              f.setValue('cas', '');
            }}
            placeholder="Vyber deň"
            aria-invalid={!!f.errors.datum}
            className={cn('h-12 w-full sm:w-[320px]', f.errors.datum && 'border-stamp')}
            calendarProps={{
              startMonth: prvy,
              endMonth: posledny,
              defaultMonth: f.values.datum ? zKluca(f.values.datum) : prvy,
              disabled: (d: Date) => !volne.has(kluc(d)),
            }}
          />
          <FieldDescription>
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
          <FieldLabel>Čas · {denDlhy(f.values.datum)}</FieldLabel>
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
          {casy.length > 1 && (
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
          <FieldDescription>Termín trvá {TERMINY.trvanieMin} minút. Čas je bratislavský.</FieldDescription>
          <FieldError>{f.errors.cas}</FieldError>
        </Field>
      )}

      {f.activeStep === 2 && (
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="z9-meno">Meno</FieldLabel>
              <Input
                id="z9-meno"
                name="meno"
                autoComplete="name"
                value={f.values.meno}
                onChange={(e) => f.setValue('meno', e.target.value)}
                aria-invalid={!!f.errors.meno}
                aria-describedby={f.errors.meno ? 'z9-meno-e' : undefined}
                className="bg-white"
              />
              <FieldError id="z9-meno-e">{f.errors.meno}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="z9-email">E-mail</FieldLabel>
              <Input
                id="z9-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={f.values.email}
                onChange={(e) => f.setValue('email', e.target.value)}
                aria-invalid={!!f.errors.email}
                aria-describedby={f.errors.email ? 'z9-email-e' : 'z9-email-d'}
                className="bg-white"
              />
              <FieldDescription id="z9-email-d">Sem príde potvrdenie s pozvánkou.</FieldDescription>
              <FieldError id="z9-email-e">{f.errors.email}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="z9-tema">S čím prichádzaš? (nepovinné)</FieldLabel>
            <Textarea
              id="z9-tema"
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

      {/* honeypot: ľudia ho nevidia, roboti vyplnia */}
      <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {f.activeStep === 3 && (
        <dl className="grid gap-3 border-3 border-ink bg-paper p-4">
          <div>
            <dt className="font-mono text-xs font-bold uppercase">Termín</dt>
            <dd className="font-display text-2xl leading-tight font-extrabold uppercase">{slotZ(dni, f.values) ? slotText(slotZ(dni, f.values)!) : '—'}</dd>
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

      {chyba && (
        <p role="alert" className="border-3 border-ink bg-stamp px-4 py-3 font-bold text-paper">
          {chyba}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t-3 border-ink pt-5">
        {!f.isFirstStep && (
          <Button type="button" variant="outline" className="bg-white" onClick={f.back}>
            Späť
          </Button>
        )}
        {f.isLastStep ? (
          <Button type="submit" variant="accent" size="lg" disabled={posielam} className="h-auto min-h-12 max-w-full py-2 whitespace-normal">
            {posielam ? 'Objednávam…' : 'Objednať sa na vyšetrenie'} <ArrowRight aria-hidden="true" />
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
