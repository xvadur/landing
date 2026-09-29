/** V7-07 · F · Vyšetrenie = cieľ chodby. FUNKČNÁ rezervácia: voľné termíny z GET /api/terminy/, odoslanie
 *  POST /api/rezervacia/ { slot, meno, email, tema, utm, web } — logika a payload ako src/components/v5/Rezervacia.tsx
 *  (409 = obsadené → znova načíta termíny, honeypot `web`, UTM, udalosť konzultacia_rezervacia, konfety, .ics).
 *  UI z BoldKitu podľa katalógu (v7/kit/formulare/Vysetrenie.tsx): stepper + multi-step-form, date-picker s pravidlami,
 *  toggle-group + time-picker, field / input / textarea, alert, sonner. Ostrov: <Vysetrenie client:visible />. */
import * as React from 'react';
import { ArrowLeft, ArrowRight, CalendarPlus, Clock, Mail, RotateCcw } from 'lucide-react';
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
import { Toaster } from '@/components/ui/sonner';
import { fireConfetti } from '@/components/vendor/magicui/confetti';
import { PRIEBEH } from '@/components/konzultacia/data';
import { VLAJKA } from '@/data/ponuka';
import { TERMINY } from '@/data/terminy';
import { ics, slotText } from '@/lib/ics';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import { miesto } from './data';
import { Portal } from './Portal';

const TOASTER = 'v707';
type Den = { datum: string; sloty: string[] };
type V = { datum: string; slot: string; meno: string; email: string; tema: string };
const PRAZDNE: V = { datum: '', slot: '', meno: '', email: '', tema: '' };
const NAZVY = ['Deň', 'Čas', 'Príjem pacienta', 'Súhrn'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const zKluca = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const kluc = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const denKratky = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(zKluca(datum));
const denDlhy = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }).format(zKluca(datum));
const cas = (iso: string) => new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TERMINY.zona }).format(new Date(iso));
/** „17:00“ → Date s touto hodinou (TimePicker berie iba hodiny a minúty). */
const naDate = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h!, m!, 0, 0);
  return d;
};

function kroky(dni: Den[]): MultiStepFormStep<V>[] {
  return [
    { id: 'den', validate: (v) => (v.datum ? null : { datum: 'Vyber deň. Ordinujem pondelok až piatok.' }) },
    {
      id: 'cas',
      validate: (v) =>
        !v.slot
          ? { slot: 'Vyber čas.' }
          : dni.find((d) => d.datum === v.datum)?.sloty.includes(v.slot)
            ? null
            : { slot: 'Tento čas už nie je voľný. Vyber iný.' },
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
  return (
    <section id="vysetrenie" data-miesto="vysetrenie" aria-labelledby="vys-h" className="relative border-b-3 border-ink bg-ink text-paper">
      <Portal m={miesto('vysetrenie')} farba="yellow" />
      <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-20">
        <div className="flex min-w-0 flex-col gap-6">
          <p className="font-mono text-xs font-bold tracking-[0.14em] text-yellow uppercase">
            {VLAJKA.nazov} · {VLAJKA.trvanie} · {VLAJKA.cena}
          </p>
          <h2 id="vys-h" className="font-display text-[clamp(2.6rem,1.4rem+4vw,4.8rem)] leading-[0.88] font-extrabold tracking-tighter uppercase">
            Objednaj sa
            <br />
            na vyšetrenie.
          </h2>
          <p className="max-w-md font-display text-2xl leading-tight font-bold">{VLAJKA.titulok}</p>
          <ol className="grid gap-2" aria-label="Priebeh vyšetrenia">
            {PRIEBEH.map((k) => (
              <li key={k.cas} className="flex gap-3 border-3 border-ink bg-paper px-4 py-3 text-ink shadow-[4px_4px_0_0_var(--color-yellow)]">
                <span className="w-20 shrink-0 font-mono text-sm font-bold">{k.cas}</span>
                <span className="text-base leading-snug font-bold">{k.vznikne}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-3 border-3 border-paper px-4 py-3 font-mono text-sm font-bold uppercase">
            <Clock className="h-5 w-5 text-yellow" aria-hidden="true" /> Ordinačné hodiny: Po–Pi {TERMINY.casy[0]}–{TERMINY.casy[TERMINY.casy.length - 1]}
          </div>
        </div>
        <div className="min-w-0">
          <Rezervacia />
        </div>
      </div>
      <Toaster id={TOASTER} position="bottom-center" />
    </section>
  );
}

function Rezervacia() {
  const [dni, setDni] = React.useState<Den[] | null>(null);
  const [nedostupne, setNedostupne] = React.useState(false);
  const [hotovo, setHotovo] = React.useState<{ slot: string; sprava: string } | null>(null);
  const [kolo, setKolo] = React.useState(0);

  const nacitaj = React.useCallback(() => {
    setNedostupne(false);
    fetch('/api/terminy/')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { dni: Den[] }) => setDni(d.dni))
      .catch(() => setNedostupne(true));
  }, []);
  React.useEffect(nacitaj, [nacitaj]);

  const steps = React.useMemo(() => kroky(dni ?? []), [dni]);

  if (hotovo) {
    const stiahni = () => {
      const blob = new Blob([ics({ id: 'rez', slot: hotovo.slot, trvanieMin: TERMINY.trvanieMin })], { type: 'text/calendar' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'konzultacia-xvadur.ics';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    return (
      <div role="status" className="flex flex-col gap-5 border-3 border-ink bg-yellow p-6 text-ink shadow-[8px_8px_0_0_var(--color-paper)] sm:p-8">
        <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Hotovo ✓ · si objednaný</p>
        <p className="font-display text-3xl leading-tight font-extrabold uppercase sm:text-4xl">{slotText(hotovo.slot)}</p>
        <p className="text-lg">{hotovo.sprava} Na vyšetrenie si prines jeden príklad úlohy, ktorú chceš vyliečiť. Netreba prezentáciu.</p>
        <Button variant="outline" className="self-start" onClick={stiahni}>
          <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Pridať do kalendára (.ics)
        </Button>
      </div>
    );
  }

  if (nedostupne) {
    return (
      <div className="flex flex-col gap-4 border-3 border-ink bg-white p-6 text-ink shadow-[8px_8px_0_0_var(--color-paper)]">
        <Alert variant="warning">
          <AlertTitle>Kalendár sa nenačítal</AlertTitle>
          <AlertDescription>Rezervácia teraz nejde. Napíš mi na adam@xvadur.com a termín dohodneme hneď.</AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-3">
          <Button onClick={nacitaj}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Skúsiť znova
          </Button>
          <Button asChild variant="outline">
            <a href="mailto:adam@xvadur.com?subject=Vy%C5%A1etrenie">
              <Mail className="h-4 w-4" aria-hidden="true" /> adam@xvadur.com
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (!dni) {
    return (
      <div className="flex flex-col gap-4 border-3 border-ink bg-white p-6 shadow-[8px_8px_0_0_var(--color-paper)]" aria-busy="true" aria-label="Načítavam voľné termíny">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (dni.length === 0) {
    return (
      <Alert variant="info" className="bg-white text-ink">
        <AlertTitle>Najbližšie dva týždne je plno</AlertTitle>
        <AlertDescription>Napíš mi na adam@xvadur.com a nájdeme termín.</AlertDescription>
      </Alert>
    );
  }

  return (
    <MultiStepForm<V> key={kolo} steps={steps} initialValues={PRAZDNE} onSubmit={() => undefined}>
      <Formular
        dni={dni}
        steps={steps}
        onHotovo={(slot, sprava) => setHotovo({ slot, sprava })}
        onObsadene={() => {
          nacitaj();
          setKolo((k) => k + 1);
        }}
      />
    </MultiStepForm>
  );
}

function Formular({
  dni,
  steps,
  onHotovo,
  onObsadene,
}: {
  dni: Den[];
  steps: MultiStepFormStep<V>[];
  onHotovo: (slot: string, sprava: string) => void;
  onObsadene: () => void;
}) {
  const f = useMultiStepForm<V>();
  const [posielam, setPosielam] = React.useState(false);
  const [chyba, setChyba] = React.useState('');
  const hp = React.useRef<HTMLInputElement>(null);
  const volne = React.useMemo(() => new Set(dni.map((d) => d.datum)), [dni]);
  const sloty = dni.find((d) => d.datum === f.values.datum)?.sloty ?? [];
  const posledny = zKluca(dni[dni.length - 1]!.datum);

  function chybaKroku(): boolean {
    const e = steps[f.activeStep]?.validate?.(f.values);
    const prva = e ? Object.values(e)[0] : null;
    if (prva) toast.error('Ešte chýba údaj', { toasterId: TOASTER, description: prva });
    return !!prva;
  }

  async function odosli() {
    if (posielam || !f.submit()) return;
    setPosielam(true);
    setChyba('');
    try {
      const r = await fetch('/api/rezervacia/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slot: f.values.slot, meno: f.values.meno, email: f.values.email, tema: f.values.tema, utm: utm(), web: hp.current?.value ?? '' }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        if (r.status === 409) {
          toast.error('Termín medzitým obsadili', { toasterId: TOASTER, description: 'Načítal som voľné termíny znova. Vyber iný čas.' });
          onObsadene();
          return;
        }
        throw new Error(d?.chyba || 'Rezervácia sa nepodarila.');
      }
      track('konzultacia_rezervacia', { miesto: 'v7-07' });
      void fireConfetti({ origin: { y: 0.7 } });
      toast.success('Objednané na vyšetrenie', { toasterId: TOASTER, description: slotText(f.values.slot) });
      onHotovo(f.values.slot, d.potvrdenie === 'odoslane' ? 'Potvrdenie s pozvánkou ti prišlo do e-mailu.' : 'Termín je zapísaný. Potvrdenie ti pošlem e-mailom.');
    } catch (err) {
      const sprava = err instanceof Error && !/fetch|JSON|network|Failed/i.test(err.message) ? err.message : 'Rezervácia teraz nejde. Napíš mi na adam@xvadur.com.';
      setChyba(sprava);
      toast.error('Rezervácia neprešla', { toasterId: TOASTER, description: sprava });
    } finally {
      setPosielam(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-6 border-3 border-ink bg-white p-5 text-ink shadow-[8px_8px_0_0_var(--color-paper)] sm:p-8"
      aria-label="Rezervácia vyšetrenia"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (f.isLastStep) void odosli();
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
          <FieldLabel htmlFor="v07-den">Deň</FieldLabel>
          <DatePicker
            id="v07-den"
            value={f.values.datum ? zKluca(f.values.datum) : undefined}
            onChange={(d) => {
              f.setValue('datum', d ? kluc(d) : '');
              f.setValue('slot', '');
            }}
            placeholder="Vyber deň"
            dateFormat="EEEE d. MMMM"
            aria-invalid={!!f.errors.datum}
            className={cn('w-full justify-start', f.errors.datum && 'border-stamp')}
            calendarProps={{
              disabled: (d: Date) => !volne.has(kluc(d)),
              startMonth: new Date(),
              endMonth: posledny,
              defaultMonth: zKluca(dni[0]!.datum),
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
                f.setValue('slot', '');
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
            value={f.values.slot}
            onValueChange={(v) => v && f.setValue('slot', v)}
            className="grid grid-cols-3 gap-3 sm:grid-cols-6"
            aria-label="Voľné časy"
          >
            {sloty.map((s) => (
              <ToggleGroupItem key={s} value={s} className="min-h-12 font-mono text-base">
                {cas(s)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {sloty.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <span className="text-sm font-bold">alebo presne:</span>
              <TimePicker
                format="24h"
                minuteStep={30}
                minTime={naDate(cas(sloty[0]!))}
                maxTime={naDate(cas(sloty[sloty.length - 1]!))}
                value={f.values.slot ? naDate(cas(f.values.slot)) : undefined}
                onChange={(d) => {
                  if (!d) return;
                  const hhmm = `${String(d.getHours()).padStart(2, '0')}:00`;
                  const s = sloty.find((x) => cas(x) === hhmm);
                  if (s) f.setValue('slot', s);
                  else toast.error('Tento čas nie je voľný', { toasterId: TOASTER, description: 'Termíny začínajú celou hodinou.' });
                }}
                placeholder="Vyber čas"
                className={cn('w-[200px]', f.errors.slot && 'border-stamp')}
              />
            </div>
          )}
          <FieldDescription>Termíny začínajú celou hodinou. Čas je bratislavský.</FieldDescription>
          <FieldError>{f.errors.slot}</FieldError>
        </Field>
      )}

      {f.activeStep === 2 && (
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="v07-meno">Meno</FieldLabel>
              <Input
                id="v07-meno"
                autoComplete="name"
                value={f.values.meno}
                onChange={(e) => f.setValue('meno', e.target.value)}
                aria-invalid={!!f.errors.meno}
                className={cn('bg-white', f.errors.meno && 'border-stamp')}
              />
              <FieldError>{f.errors.meno}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="v07-email">E-mail</FieldLabel>
              <Input
                id="v07-email"
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
            <FieldLabel htmlFor="v07-tema">S čím prichádzaš? (nepovinné)</FieldLabel>
            <Textarea
              id="v07-tema"
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
            <dd className="font-display text-2xl leading-tight font-extrabold uppercase">{f.values.slot ? slotText(f.values.slot) : '—'}</dd>
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
      <input ref={hp} type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {chyba && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Rezervácia neprešla</AlertTitle>
          <AlertDescription>{chyba}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t-3 border-ink pt-5">
        {!f.isFirstStep && (
          <Button type="button" variant="outline" onClick={f.back}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Späť
          </Button>
        )}
        {f.isLastStep ? (
          <Button type="submit" variant="accent" size="lg" className="max-w-full whitespace-normal" disabled={posielam}>
            {posielam ? 'Objednávam…' : 'Objednať sa na vyšetrenie'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="submit" size="lg">
            Ďalej <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}
