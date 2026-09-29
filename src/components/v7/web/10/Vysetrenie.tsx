/** V7-10 · Podnos 08 · Vyšetrenie — FUNKČNÁ rezervácia. Logika a payload ako src/components/v5/Rezervacia.tsx:
 *  GET /api/terminy/ → { dni: [{ datum, sloty: ISO[] }] }, POST /api/rezervacia/ { slot, meno, email, tema, utm, web }.
 *  409 = obsadené → znovu načítať termíny a vrátiť sa na čas. Úspech: konfety (Magic UI, nie reduced), .ics, udalosť
 *  `konzultacia_rezervacia`. UI z receptu katalógu formulare/Vysetrenie.tsx: stepper + multi-step-form + date-picker
 *  (calendar v popoveri) + toggle-group + time-picker + field/input/textarea + sonner. Statický náhľad bez API = slušná chyba. */
import * as React from 'react';
import { format } from 'date-fns';
import { ArrowRight, RotateCw } from 'lucide-react';
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
import { track, utm } from '@/lib/meranie';
import { ics, slotText } from '@/lib/ics';
import { TERMINY } from '@/data/terminy';
import { cn } from '@/lib/utils';
import { TOASTER_ID } from './data';

type Den = { datum: string; sloty: string[] };
type V = { datum: string; slot: string; meno: string; email: string; tema: string };
const PRAZDNE: V = { datum: '', slot: '', meno: '', email: '', tema: '' };
const NAZVY = ['Deň', 'Čas', 'Príjem pacienta', 'Súhrn'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const zKluca = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const kluc = (d: Date) => format(d, 'yyyy-MM-dd');
const denDlhy = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }).format(zKluca(datum));
const denKratky = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(zKluca(datum));
const cas = (iso: string) =>
  new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TERMINY.zona }).format(new Date(iso));
const naDate = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h!, m!, 0, 0);
  return d;
};

function kroky(dni: Den[]): MultiStepFormStep<V>[] {
  return [
    { id: 'den', validate: (v) => (v.datum && dni.some((d) => d.datum === v.datum) ? null : { datum: 'Vyber deň. Ordinujem pondelok až piatok.' }) },
    {
      id: 'cas',
      validate: (v) =>
        !v.slot ? { slot: 'Vyber čas.' } : dni.find((d) => d.datum === v.datum)?.sloty.includes(v.slot) ? null : { slot: 'Tento čas už nie je voľný. Vyber iný.' },
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

type Nacitanie = { stav: 'nacitavam' } | { stav: 'chyba' } | { stav: 'ok'; dni: Den[] };

export default function Rezervacia() {
  const [n, setN] = React.useState<Nacitanie>({ stav: 'nacitavam' });
  const [hotovo, setHotovo] = React.useState<{ slot: string; sprava: string } | null>(null);

  const nacitaj = React.useCallback(async (): Promise<Den[] | null> => {
    try {
      const r = await fetch('/api/terminy/', { cache: 'no-store' });
      if (!r.ok) throw new Error();
      const d = (await r.json()) as { dni?: Den[] };
      if (!Array.isArray(d.dni)) throw new Error();
      setN({ stav: 'ok', dni: d.dni });
      return d.dni;
    } catch {
      setN({ stav: 'chyba' });
      return null;
    }
  }, []);
  React.useEffect(() => {
    void nacitaj();
  }, [nacitaj]);

  if (hotovo) return <Hotovo {...hotovo} />;

  if (n.stav === 'nacitavam')
    return (
      <div className="flex flex-col gap-4 p-5 sm:p-7" aria-busy="true" aria-live="polite">
        <p className="flex items-center gap-3 font-mono text-sm font-bold tracking-[0.14em] uppercase">
          <MathCurveLoader curve="heart" size="sm" speed="fast" /> Načítavam voľné termíny…
        </p>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );

  if (n.stav === 'chyba')
    return (
      <div className="flex h-full flex-col gap-4 p-5 sm:p-7" role="alert">
        <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Kalendár sa nenačítal</p>
        <p className="font-display text-2xl leading-tight font-extrabold sm:text-3xl">Rezervácia teraz nejde.</p>
        <p className="max-w-lg text-lg leading-snug">
          Napíš mi cez WhatsApp alebo na{' '}
          <a href="mailto:adam@xvadur.com" className="font-bold underline decoration-3 underline-offset-4">
            adam@xvadur.com
          </a>{' '}
          a termín dohodneme hneď.
        </p>
        <div className="mt-auto flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setN({ stav: 'nacitavam' });
              void nacitaj();
            }}
          >
            <RotateCw aria-hidden="true" /> Skúsiť znova
          </Button>
          <Button asChild variant="accent">
            <a href="mailto:adam@xvadur.com?subject=Vy%C5%A1etrenie">Napísať e-mail</a>
          </Button>
        </div>
      </div>
    );

  return <Formular dni={n.dni} nacitaj={nacitaj} onHotovo={setHotovo} />;
}

function Hotovo({ slot, sprava }: { slot: string; sprava: string }) {
  const stiahni = () => {
    const blob = new Blob([ics({ id: 'rez', slot, trvanieMin: TERMINY.trvanieMin })], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'konzultacia-xvadur.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  return (
    <div role="status" className="flex h-full flex-col gap-5 bg-yellow p-6 text-ink sm:p-8">
      <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Hotovo ✓</p>
      <p className="font-display text-3xl leading-tight font-extrabold uppercase sm:text-4xl">{slotText(slot)}</p>
      <p className="text-lg">{sprava} Na vyšetrenie si prines jeden príklad úlohy, ktorú chceš vyliečiť. Netreba prezentáciu.</p>
      <Button type="button" variant="outline" onClick={stiahni} className="self-start">
        Pridať do kalendára (.ics)
      </Button>
    </div>
  );
}

function Formular({ dni, nacitaj, onHotovo }: { dni: Den[]; nacitaj: () => Promise<Den[] | null>; onHotovo: (h: { slot: string; sprava: string }) => void }) {
  const [aktualne, setAktualne] = React.useState(dni);
  const steps = React.useMemo(() => kroky(aktualne), [aktualne]);
  if (aktualne.length === 0)
    return (
      <div className="flex flex-col gap-3 p-5 sm:p-7">
        <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Plno</p>
        <p className="text-lg">Najbližšie dva týždne je plno. Napíš mi cez WhatsApp alebo na adam@xvadur.com.</p>
      </div>
    );
  return (
    <MultiStepForm<V> steps={steps} initialValues={{ ...PRAZDNE, datum: aktualne[0]!.datum }} onSubmit={() => {}}>
      <Kroky
        dni={aktualne}
        steps={steps}
        obnov={async () => {
          const d = await nacitaj();
          if (d) setAktualne(d);
        }}
        onHotovo={onHotovo}
      />
    </MultiStepForm>
  );
}

function Kroky({
  dni,
  steps,
  obnov,
  onHotovo,
}: {
  dni: Den[];
  steps: MultiStepFormStep<V>[];
  obnov: () => Promise<void>;
  onHotovo: (h: { slot: string; sprava: string }) => void;
}) {
  const f = useMultiStepForm<V>();
  const [posielam, setPosielam] = React.useState(false);
  const [chyba, setChyba] = React.useState('');
  const honey = React.useRef<HTMLInputElement>(null);
  const volne = React.useMemo(() => new Set(dni.map((d) => d.datum)), [dni]);
  const sloty = dni.find((d) => d.datum === f.values.datum)?.sloty ?? [];
  const prvy = dni[0] ? zKluca(dni[0].datum) : new Date();
  const posledny = dni.length ? zKluca(dni[dni.length - 1]!.datum) : new Date();

  function chybaKroku(): boolean {
    const e = steps[f.activeStep]?.validate?.(f.values);
    const prva = e ? Object.values(e)[0] : null;
    if (prva) toast.error('Ešte chýba údaj', { toasterId: TOASTER_ID, description: prva });
    return !!prva;
  }

  async function odosli() {
    if (posielam || !f.submit()) return;
    setPosielam(true);
    setChyba('');
    const v = f.values;
    try {
      const r = await fetch('/api/rezervacia/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slot: v.slot, meno: v.meno, email: v.email, tema: v.tema, utm: utm(), web: honey.current?.value ?? '' }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        if (r.status === 409) {
          f.setValue('slot', '');
          await obnov();
          f.goTo(1);
          toast.error('Termín medzitým obsadili', { toasterId: TOASTER_ID, description: 'Vyber iný čas, voľné som načítal znova.' });
          setPosielam(false);
          return;
        }
        throw new Error(d?.chyba || 'Rezervácia sa nepodarila.');
      }
      const sprava = d.potvrdenie === 'odoslane' ? 'Potvrdenie s pozvánkou ti prišlo do e-mailu.' : 'Termín je zapísaný. Potvrdenie ti pošlem e-mailom.';
      track('konzultacia_rezervacia', { miesto: 'v710-rezervacia' });
      toast.success('Objednané na vyšetrenie', { toasterId: TOASTER_ID, description: slotText(v.slot) });
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) void fireConfetti({ origin: { y: 0.7 } });
      onHotovo({ slot: v.slot, sprava });
    } catch (err) {
      const text =
        err instanceof Error && !/fetch|JSON|network/i.test(err.message) ? err.message : 'Rezervácia teraz nejde. Napíš mi na adam@xvadur.com alebo cez WhatsApp.';
      setChyba(text);
      toast.error('Rezervácia nevyšla', { toasterId: TOASTER_ID, description: text });
      setPosielam(false);
    }
  }

  return (
    <form
      className="flex h-full flex-col gap-5 p-4 sm:p-6"
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
          {NAZVY.map((nazov, i) => (
            <StepperItem key={nazov} index={i} className={cn(i < NAZVY.length - 1 && 'flex-1')}>
              <StepperTrigger aria-label={`${i + 1}. ${nazov}`} />
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
          <FieldLabel htmlFor="v710-den">Deň</FieldLabel>
          <DatePicker
            id="v710-den"
            value={f.values.datum ? zKluca(f.values.datum) : undefined}
            onChange={(d) => {
              f.setValue('datum', d ? kluc(d) : '');
              f.setValue('slot', '');
            }}
            placeholder="Vyber deň"
            dateFormat="EEEE d. MMMM"
            className={cn('h-12 w-full justify-start text-base normal-case', f.errors.datum && 'border-stamp')}
            aria-invalid={!!f.errors.datum}
            calendarProps={{ disabled: (d: Date) => !volne.has(kluc(d)), startMonth: prvy, endMonth: posledny, defaultMonth: prvy }}
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
                  const hhmm = format(d, 'HH:mm');
                  const s = sloty.find((x) => cas(x) === hhmm);
                  if (s) f.setValue('slot', s);
                  else toast.error('Tento čas nie je voľný', { toasterId: TOASTER_ID, description: `${hhmm} nie je v ponuke. Termíny začínajú celou hodinou.` });
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
              <FieldLabel htmlFor="v710-meno">Meno</FieldLabel>
              <Input
                id="v710-meno"
                autoComplete="name"
                value={f.values.meno}
                onChange={(e) => f.setValue('meno', e.target.value)}
                aria-invalid={!!f.errors.meno}
                className={cn('h-12 bg-white text-base', f.errors.meno && 'border-stamp')}
              />
              <FieldError>{f.errors.meno}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="v710-email">E-mail</FieldLabel>
              <Input
                id="v710-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={f.values.email}
                onChange={(e) => f.setValue('email', e.target.value)}
                aria-invalid={!!f.errors.email}
                className={cn('h-12 bg-white text-base', f.errors.email && 'border-stamp')}
              />
              <FieldDescription>Sem príde potvrdenie s pozvánkou.</FieldDescription>
              <FieldError>{f.errors.email}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="v710-tema">S čím prichádzaš? (nepovinné)</FieldLabel>
            <Textarea
              id="v710-tema"
              rows={3}
              maxLength={600}
              value={f.values.tema}
              onChange={(e) => f.setValue('tema', e.target.value)}
              placeholder="Napr. odpovedám na tie isté dopyty stále dookola."
              className="bg-white text-base"
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
      <input ref={honey} type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {chyba && (
        <p role="alert" className="border-3 border-ink bg-stamp px-4 py-3 font-bold text-paper">
          {chyba}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 border-t-3 border-ink pt-5">
        {!f.isFirstStep && (
          <Button type="button" variant="outline" onClick={f.back} disabled={posielam}>
            Späť
          </Button>
        )}
        {f.isLastStep ? (
          <Button type="submit" variant="accent" size="lg" className="max-w-full whitespace-normal" disabled={posielam}>
            {posielam ? (
              <>
                <MathCurveLoader curve="heart" size="xs" speed="fast" aria-hidden="true" /> Objednávam…
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
