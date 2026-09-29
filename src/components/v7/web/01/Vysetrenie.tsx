/** V7-01 · Vyšetrenie — FUNKČNÁ rezervácia konzultácie. Logika a payload ako src/components/v5/Rezervacia.tsx:
 *  GET /api/terminy/ (voľné termíny), POST /api/rezervacia/ { slot, meno, email, tema, utm: utm(), web (honeypot) },
 *  409 = termín medzitým obsadený → znova načítať a späť na čas. Po úspechu konfety (Magic UI, bez reduced motion),
 *  .ics, udalosť `konzultacia_rezervacia`. Keď API nie je (statický náhľad, výpadok): slušná chyba s e-mailom.
 *  UI z BoldKitu podľa receptu katalógu (formulare/Vysetrenie.tsx): stepper + multi-step-form, date-picker s pravidlami,
 *  toggle-group, time-picker, field / input / textarea, alert, skeleton, spinner, sonner. Ostrov: client:visible. */
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
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { fireConfetti } from '@/components/vendor/magicui/confetti';
import { track, utm } from '@/lib/meranie';
import { ics, slotText } from '@/lib/ics';
import { TERMINY } from '@/data/terminy';
import { cn } from '@/lib/utils';
import { TOASTER } from './klient';

type Den = { datum: string; sloty: string[] };
type V = { datum: string; cas: string; meno: string; email: string; tema: string };
const PRAZDNE: V = { datum: '', cas: '', meno: '', email: '', tema: '' };
const NAZVY = ['Deň', 'Čas', 'Príjem pacienta', 'Súhrn'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const KONTAKT = 'adam@xvadur.com';

const kluc = (d: Date) => format(d, 'yyyy-MM-dd');
const zKluca = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const denDlhy = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }).format(zKluca(datum));
const denKratky = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(zKluca(datum));
const casBa = (iso: string) =>
  new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TERMINY.zona }).format(new Date(iso));
const naDate = (cas: string) => {
  const [h, m] = cas.split(':').map(Number);
  const d = new Date();
  d.setHours(h!, m!, 0, 0);
  return d;
};
/** „17:00“ v daný deň → ISO slot z API (iba voľné). */
const slotZ = (dni: Den[], datum: string, cas: string) => dni.find((d) => d.datum === datum)?.sloty.find((s) => casBa(s) === cas) ?? null;
const casyDna = (dni: Den[], datum: string) => dni.find((d) => d.datum === datum)?.sloty.map(casBa) ?? [];

function kroky(dni: Den[]): MultiStepFormStep<V>[] {
  return [
    { id: 'den', validate: (v) => (v.datum ? null : { datum: 'Vyber deň. Ordinujem pondelok až piatok.' }) },
    {
      id: 'cas',
      validate: (v) =>
        !v.cas ? { cas: 'Vyber čas.' } : slotZ(dni, v.datum, v.cas) ? null : { cas: `${v.cas} nie je voľný termín. Vyber jeden z ponúknutých časov.` },
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

export default function Vysetrenie() {
  const [dni, setDni] = React.useState<Den[] | null>(null);
  const [nedostupne, setNedostupne] = React.useState(false);
  const [kolo, setKolo] = React.useState(0);
  const [hotovo, setHotovo] = React.useState<{ slot: string; sprava: string } | null>(null);

  const nacitaj = React.useCallback(() => {
    setNedostupne(false);
    return fetch('/api/terminy/')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { dni: Den[] }) => {
        setDni(d.dni);
        return d.dni;
      })
      .catch(() => {
        setNedostupne(true);
        return null;
      });
  }, []);
  React.useEffect(() => {
    void nacitaj();
  }, [nacitaj]);

  if (hotovo) return <Hotovo slot={hotovo.slot} sprava={hotovo.sprava} onZnova={() => (setHotovo(null), setKolo((k) => k + 1), void nacitaj())} />;

  if (nedostupne)
    return (
      <Alert variant="destructive" className="bg-white text-ink" role="alert">
        <AlertTitle className="font-display text-xl font-extrabold uppercase">Kalendár sa nenačítal</AlertTitle>
        <AlertDescription className="flex flex-col gap-4 text-base">
          <span>
            Rezervácia teraz nejde. Napíš mi na{' '}
            <a className="font-bold underline" href={`mailto:${KONTAKT}`}>
              {KONTAKT}
            </a>{' '}
            a termín dohodneme hneď.
          </span>
          <Button type="button" variant="outline" className="w-fit" onClick={() => void nacitaj()}>
            <RotateCcw aria-hidden="true" /> Skúsiť znova
          </Button>
        </AlertDescription>
      </Alert>
    );

  if (!dni)
    return (
      <div className="flex flex-col gap-4 border-3 border-ink bg-white p-5 shadow-[6px_6px_0_0_var(--color-ink)]" aria-busy="true">
        <div className="flex items-center gap-3 font-mono text-sm font-bold uppercase">
          <Spinner size="sm" /> Načítavam voľné termíny
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11 w-20" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    );

  if (dni.length === 0)
    return (
      <Alert className="bg-white">
        <AlertTitle className="font-display text-xl font-extrabold uppercase">Najbližšie dva týždne je plno</AlertTitle>
        <AlertDescription className="text-base">
          Napíš mi na{' '}
          <a className="font-bold underline" href={`mailto:${KONTAKT}`}>
            {KONTAKT}
          </a>
          .
        </AlertDescription>
      </Alert>
    );

  return <Formular key={kolo} dni={dni} nacitaj={nacitaj} onHotovo={setHotovo} />;
}

function Hotovo({ slot, sprava, onZnova }: { slot: string; sprava: string; onZnova: () => void }) {
  function stiahniIcs() {
    const blob = new Blob([ics({ id: 'rez', slot, trvanieMin: TERMINY.trvanieMin })], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'konzultacia-xvadur.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  return (
    <div role="status" className="flex flex-col gap-5 border-3 border-ink bg-yellow p-6 text-ink shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8">
      <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Hotovo ✓ · pacient prijatý</p>
      <p className="font-display text-3xl leading-tight font-extrabold uppercase sm:text-4xl">{slotText(slot)}</p>
      <p className="text-lg">{sprava} Na vyšetrenie si prines jeden príklad úlohy, ktorú chceš vyliečiť. Netreba prezentáciu.</p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={stiahniIcs}>
          <CalendarPlus aria-hidden="true" /> Pridať do kalendára (.ics)
        </Button>
        <Button type="button" variant="ghost" onClick={onZnova}>
          Ďalší termín
        </Button>
      </div>
    </div>
  );
}

function Formular({ dni, nacitaj, onHotovo }: { dni: Den[]; nacitaj: () => Promise<Den[] | null>; onHotovo: (h: { slot: string; sprava: string }) => void }) {
  const [aktualne, setAktualne] = React.useState(dni);
  const steps = React.useMemo(() => kroky(aktualne), [aktualne]);
  const [posielam, setPosielam] = React.useState(false);
  const [chyba, setChyba] = React.useState('');
  const krokRef = React.useRef<{ goTo: (i: number) => boolean; setValue: (k: keyof V, v: string) => void } | null>(null);

  async function odosli(v: V) {
    const slot = slotZ(aktualne, v.datum, v.cas);
    if (!slot || posielam) return;
    setPosielam(true);
    setChyba('');
    const web = (document.getElementById('m01-web') as HTMLInputElement | null)?.value ?? '';
    try {
      const r = await fetch('/api/rezervacia/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slot, meno: v.meno, email: v.email, tema: v.tema, utm: utm(), web }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        if (r.status === 409) {
          const nove = await nacitaj();
          if (nove) setAktualne(nove);
          krokRef.current?.setValue('cas', '');
          krokRef.current?.goTo(1);
        }
        throw new Error(d?.chyba || 'Rezervácia sa nepodarila.');
      }
      const sprava = d.potvrdenie === 'odoslane' ? 'Potvrdenie s pozvánkou ti prišlo do e-mailu.' : 'Termín je zapísaný. Potvrdenie ti pošlem e-mailom.';
      track('konzultacia_rezervacia', { miesto: 'v7-01-vysetrenie' });
      toast.success('Pacient prijatý', { toasterId: TOASTER, description: slotText(slot) });
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) void fireConfetti({ origin: { y: 0.7 } });
      onHotovo({ slot, sprava });
    } catch (err) {
      const text =
        err instanceof Error && !/fetch|JSON|network|Unexpected/i.test(err.message) ? err.message : `Rezervácia teraz nejde. Napíš mi na ${KONTAKT}.`;
      setChyba(text);
      toast.error('Rezervácia neprešla', { toasterId: TOASTER, description: text });
    } finally {
      setPosielam(false);
    }
  }

  return (
    <MultiStepForm<V> steps={steps} initialValues={PRAZDNE} onSubmit={(v) => void odosli(v)}>
      <Kroky dni={aktualne} steps={steps} posielam={posielam} chyba={chyba} krokRef={krokRef} />
    </MultiStepForm>
  );
}

function Kroky({
  dni,
  steps,
  posielam,
  chyba,
  krokRef,
}: {
  dni: Den[];
  steps: MultiStepFormStep<V>[];
  posielam: boolean;
  chyba: string;
  krokRef: React.MutableRefObject<{ goTo: (i: number) => boolean; setValue: (k: keyof V, v: string) => void } | null>;
}) {
  const f = useMultiStepForm<V>();
  krokRef.current = { goTo: f.goTo, setValue: (k, v) => f.setValue(k, v) };
  const casy = casyDna(dni, f.values.datum);
  const volne = React.useMemo(() => new Set(dni.map((d) => d.datum)), [dni]);
  const posledny = dni.length ? zKluca(dni[dni.length - 1]!.datum) : new Date();

  function chybaKroku(): boolean {
    const e = steps[f.activeStep]?.validate?.(f.values);
    const prva = e ? Object.values(e)[0] : null;
    if (prva) toast.error('Ešte chýba údaj', { toasterId: TOASTER, description: prva });
    return !!prva;
  }

  return (
    <form
      className="flex flex-col gap-6 border-3 border-ink bg-white p-5 text-ink shadow-[6px_6px_0_0_var(--color-ink)] sm:p-7"
      aria-label="Rezervácia vyšetrenia"
      onSubmit={(e) => {
        e.preventDefault();
        if (f.isLastStep) f.submit();
        else {
          chybaKroku();
          f.next();
        }
      }}
      noValidate
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
        {f.activeStep === 1 && ` (${TERMINY.trvanieMin} minút)`}
      </p>

      {f.activeStep === 0 && (
        <Field>
          <FieldLabel htmlFor="m01-den">Deň</FieldLabel>
          <DatePicker
            id="m01-den"
            value={f.values.datum ? zKluca(f.values.datum) : undefined}
            onChange={(d) => {
              f.setValue('datum', d ? kluc(d) : '');
              f.setValue('cas', '');
            }}
            placeholder="Vyber deň"
            dateFormat="EEEE d. MMMM"
            aria-invalid={!!f.errors.datum}
            className={cn('h-12 w-full max-w-sm', f.errors.datum && 'border-stamp')}
            calendarProps={{
              startMonth: new Date(),
              endMonth: posledny,
              defaultMonth: dni[0] ? zKluca(dni[0].datum) : undefined,
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
          <FieldDescription>Termíny začínajú celou hodinou. Čas je bratislavský.</FieldDescription>
          <FieldError>{f.errors.cas}</FieldError>
        </Field>
      )}

      {f.activeStep === 2 && (
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="m01-meno">Meno</FieldLabel>
              <Input
                id="m01-meno"
                autoComplete="name"
                value={f.values.meno}
                onChange={(e) => f.setValue('meno', e.target.value)}
                aria-invalid={!!f.errors.meno}
                className={cn('bg-white', f.errors.meno && 'border-stamp')}
              />
              <FieldError>{f.errors.meno}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="m01-email">E-mail</FieldLabel>
              <Input
                id="m01-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={f.values.email}
                onChange={(e) => f.setValue('email', e.target.value)}
                aria-invalid={!!f.errors.email}
                className={cn('bg-white', f.errors.email && 'border-stamp')}
              />
              <FieldDescription>Sem príde potvrdenie s pozvánkou.</FieldDescription>
              <FieldError>{f.errors.email}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="m01-tema">S čím prichádzaš? (nepovinné)</FieldLabel>
            <Textarea
              id="m01-tema"
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
      <input id="m01-web" type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {chyba && (
        <Alert variant="destructive" role="alert">
          <AlertTitle className="font-bold uppercase">Rezervácia neprešla</AlertTitle>
          <AlertDescription>{chyba}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t-3 border-ink pt-5">
        {!f.isFirstStep && (
          <Button type="button" variant="outline" onClick={f.back} disabled={posielam}>
            Späť
          </Button>
        )}
        {f.isLastStep ? (
          <Button type="submit" variant="accent" size="lg" className="max-w-full whitespace-normal" disabled={posielam}>
            {posielam ? (
              <>
                <Spinner size="sm" /> Objednávam…
              </>
            ) : (
              <>
                Objednať sa na vyšetrenie <ArrowRight aria-hidden="true" />
              </>
            )}
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
