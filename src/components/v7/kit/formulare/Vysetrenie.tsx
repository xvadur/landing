/** Kit · Formuláre: kombinovaná ukážka „Vyšetrenie“ — rezervácia konzultácie s Adamom zo stepper + multi-step-form +
 *  calendar v popoveri (date-picker s pravidlami) + time-picker + toggle-group + field/input/textarea + sonner.
 *  IBA VIZUÁLNE: žiadne volanie /api/rezervacia/. Pravidlá termínov berie zo src/data/terminy.ts (Po–Pi 14:00–19:00,
 *  najskôr o 24 h, najďalej 14 dní), texty z v5/Konzultacia.astro a v5/Rezervacia.tsx. */
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { sk } from 'react-day-picker/locale';
import { ArrowRight, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { MultiStepForm, useMultiStepForm, type MultiStepFormStep } from '@/components/ui/multi-step-form';
import { Stepper, StepperItem, StepperList, StepperSeparator, StepperTrigger } from '@/components/ui/stepper';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePicker } from '@/components/ui/time-picker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRIEBEH } from '@/components/konzultacia/data';
import { VLAJKA } from '@/data/ponuka';
import { TERMINY, slotIso, vsetkyTerminy, type Den } from '@/data/terminy';
import { slotText } from '@/lib/ics';
import { cn } from '@/lib/utils';
import { KAL_OPRAVA, TOASTER, useKlient } from './Spolocne';

type V = { datum: string; cas: string; meno: string; email: string; tema: string };
const PRAZDNE: V = { datum: '', cas: '', meno: '', email: '', tema: '' };
const NAZVY = ['Deň', 'Čas', 'Príjem pacienta', 'Súhrn'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const kluc = (d: Date) => format(d, 'yyyy-MM-dd');
const zKluca = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const denDlhy = (datum: string) =>
  new Intl.DateTimeFormat('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }).format(zKluca(datum));
const denKratky = (datum: string) =>
  new Intl.DateTimeFormat('sk-SK', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(zKluca(datum));
const casBratislava = (iso: string) =>
  new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TERMINY.zona }).format(new Date(iso));
/** „17:00“ → Date s touto hodinou (dnešný deň; TimePicker berie iba hodiny a minúty). */
const naDate = (cas: string) => {
  const [h, m] = cas.split(':').map(Number);
  const d = new Date();
  d.setHours(h!, m!, 0, 0);
  return d;
};

function casyDna(dni: Den[], datum: string): string[] {
  return dni.find((d) => d.datum === datum)?.sloty.map(casBratislava) ?? [];
}

function kroky(dni: Den[]): MultiStepFormStep<V>[] {
  return [
    { id: 'den', validate: (v) => (v.datum ? null : { datum: 'Vyber deň. Ordinujem pondelok až piatok.' }) },
    {
      id: 'cas',
      validate: (v) =>
        !v.cas
          ? { cas: 'Vyber čas.' }
          : casyDna(dni, v.datum).includes(v.cas)
            ? null
            : { cas: `${v.cas} nie je voľný termín. Vyber celú hodinu medzi 14:00 a 19:00.` },
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
  const klient = useKlient();
  return (
    <section
      id="vysetrenie"
      aria-labelledby="vysetrenie-h"
      className="flex scroll-mt-24 flex-col gap-8 rounded-lg border-3 border-ink bg-ink p-5 text-paper shadow-brutal sm:p-8 lg:p-10"
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-mono text-xs font-bold tracking-[0.12em] text-yellow uppercase">Kombinovaná ukážka · recept „rezervácia“</p>
        <Badge variant="secondary">ukážka · bez API, nič sa neodosiela</Badge>
      </div>
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <p className="eyebrow text-yellow">
            {VLAJKA.nazov} / {VLAJKA.trvanie} / {VLAJKA.cena}
          </p>
          <h2 id="vysetrenie-h" className="font-display text-display-xs font-extrabold tracking-tighter uppercase">
            Objednaj sa
            <br />
            na vyšetrenie.
          </h2>
          <p className="max-w-md font-display text-2xl leading-tight font-bold">{VLAJKA.titulok}</p>
          <ol className="grid gap-2" aria-label="Priebeh vyšetrenia">
            {PRIEBEH.map((k) => (
              <li key={k.cas} className="flex gap-3 rounded-lg border-3 border-ink bg-paper px-4 py-3 text-ink shadow-[4px_4px_0_0_var(--color-yellow)]">
                <span className="w-20 shrink-0 font-mono text-sm font-bold">{k.cas}</span>
                <span className="text-base leading-snug font-bold">{k.vznikne}</span>
              </li>
            ))}
          </ol>
          <p className="font-mono text-xs text-paper/80">
            Skladba: stepper + multi-step-form · calendar v popoveri · time-picker + toggle-group · field / input / textarea · sonner
          </p>
        </div>
        <div className="min-w-0">{klient ? <Rezervacia /> : <div className="h-96 rounded-lg border-3 border-paper/30 bg-white/10" aria-busy="true" />}</div>
      </div>
    </section>
  );
}

function Rezervacia() {
  const dni = useMemo(() => vsetkyTerminy(), []);
  const steps = useMemo(() => kroky(dni), [dni]);
  const [kolo, setKolo] = useState(0);
  const [hotovo, setHotovo] = useState<V | null>(null);

  if (hotovo) {
    const iso = slotIso(hotovo.datum, hotovo.cas);
    return (
      <div role="status" className="flex flex-col gap-5 rounded-lg border-3 border-ink bg-yellow p-6 text-ink shadow-brutal-lg sm:p-8">
        <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Hotovo ✓</p>
        <p className="font-display text-3xl leading-tight font-extrabold uppercase sm:text-4xl">{slotText(iso)}</p>
        <p className="text-lg">
          Termín je zapísaný. Potvrdenie ti pošlem e-mailom. Na vyšetrenie si prines jeden príklad úlohy, ktorú chceš vyliečiť. Netreba
          prezentáciu.
        </p>
        <p className="font-mono text-xs">Ukážka: nič sa neodoslalo, termín nie je rezervovaný.</p>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            setHotovo(null);
            setKolo((k) => k + 1);
          }}
        >
          Nové vyšetrenie
        </Button>
      </div>
    );
  }

  return (
    <MultiStepForm<V>
      key={kolo}
      steps={steps}
      initialValues={PRAZDNE}
      onSubmit={(v) => {
        setHotovo(v);
        toast.success('Objednané na vyšetrenie', {
          toasterId: TOASTER,
          description: `${slotText(slotIso(v.datum, v.cas))} · ukážka, nič sa neodoslalo`,
        });
      }}
    >
      <Formular dni={dni} steps={steps} />
    </MultiStepForm>
  );
}

function Formular({ dni, steps }: { dni: Den[]; steps: MultiStepFormStep<V>[] }) {
  const f = useMultiStepForm<V>();
  const [openDen, setOpenDen] = useState(false);
  const casy = casyDna(dni, f.values.datum);
  const volneDni = useMemo(() => new Set(dni.map((d) => d.datum)), [dni]);
  const posledny = dni.length ? zKluca(dni[dni.length - 1]!.datum) : new Date();

  /** Hlásenie cez sonner, keď krok neprejde (next() to nevráti, preto validátor pustíme aj tu). */
  function chybaKroku(): boolean {
    const e = steps[f.activeStep]?.validate?.(f.values);
    const prva = e ? Object.values(e)[0] : null;
    if (prva) toast.error('Ešte chýba údaj', { toasterId: TOASTER, description: prva });
    return !!prva;
  }
  function dalej() {
    chybaKroku();
    f.next();
  }
  function odoslat() {
    if (!f.isLastStep) return;
    f.submit();
  }

  return (
    <form
      className="flex flex-col gap-6 rounded-lg border-3 border-ink bg-white p-5 text-ink shadow-brutal-lg sm:p-8"
      aria-label="Rezervácia konzultácie (ukážka)"
      onSubmit={(e) => {
        e.preventDefault();
        if (f.isLastStep) odoslat();
        else dalej();
      }}
      noValidate
    >
      <Stepper
        activeStep={f.activeStep}
        onStepChange={(i) => {
          // goTo dopredu kontroluje iba aktuálny krok; preskočiť viac krokov naraz nedovolíme
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
          <FieldLabel htmlFor="vys-den">Deň</FieldLabel>
          <Popover open={openDen} onOpenChange={setOpenDen}>
            <PopoverTrigger asChild>
              <Button
                id="vys-den"
                type="button"
                variant="outline"
                size="lg"
                aria-invalid={!!f.errors.datum}
                aria-describedby="vys-den-d"
                className={cn('w-full justify-start px-4 font-bold normal-case', !f.values.datum && 'text-muted-foreground', f.errors.datum && 'border-stamp')}
              >
                <CalendarIcon />
                {f.values.datum ? denDlhy(f.values.datum) : 'Vyber deň'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={sk}
                autoFocus
                selected={f.values.datum ? zKluca(f.values.datum) : undefined}
                defaultMonth={f.values.datum ? zKluca(f.values.datum) : dni[0] ? zKluca(dni[0].datum) : undefined}
                startMonth={new Date()}
                endMonth={posledny}
                disabled={(d) => !volneDni.has(kluc(d))}
                onSelect={(d) => {
                  f.setValue('datum', d ? kluc(d) : '');
                  f.setValue('cas', '');
                  setOpenDen(false);
                }}
                classNames={KAL_OPRAVA}
                className="border-0 shadow-none"
              />
            </PopoverContent>
          </Popover>
          <FieldDescription id="vys-den-d">
            Pondelok až piatok. Najskôr o {TERMINY.najskorHodin} hodín, najďalej {TERMINY.dopreduDni} dní dopredu.
          </FieldDescription>
          <FieldError>{f.errors.datum}</FieldError>
          {dni.length > 0 && (
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
          )}
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
          <FieldDescription>Termíny začínajú celou hodinou, 14:00 až 19:00. Čas je bratislavský.</FieldDescription>
          <FieldError>{f.errors.cas}</FieldError>
        </Field>
      )}

      {f.activeStep === 2 && (
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="vys-meno">Meno</FieldLabel>
              <Input
                id="vys-meno"
                autoComplete="name"
                value={f.values.meno}
                onChange={(e) => f.setValue('meno', e.target.value)}
                aria-invalid={!!f.errors.meno}
                aria-describedby={f.errors.meno ? 'vys-meno-e' : undefined}
                className={cn('bg-white', f.errors.meno && 'border-stamp')}
              />
              <FieldError id="vys-meno-e">{f.errors.meno}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="vys-email">E-mail</FieldLabel>
              <Input
                id="vys-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={f.values.email}
                onChange={(e) => f.setValue('email', e.target.value)}
                aria-invalid={!!f.errors.email}
                aria-describedby={f.errors.email ? 'vys-email-e' : 'vys-email-d'}
                className={cn('bg-white', f.errors.email && 'border-stamp')}
              />
              <FieldDescription id="vys-email-d">Sem príde potvrdenie s pozvánkou.</FieldDescription>
              <FieldError id="vys-email-e">{f.errors.email}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="vys-tema">S čím prichádzaš? (nepovinné)</FieldLabel>
            <Textarea
              id="vys-tema"
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
        <dl className="grid gap-3 rounded-lg border-3 border-ink bg-paper p-4">
          <div>
            <dt className="font-mono text-xs font-bold uppercase">Termín</dt>
            <dd className="font-display text-2xl leading-tight font-extrabold uppercase">{slotText(slotIso(f.values.datum, f.values.cas))}</dd>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="font-mono text-xs font-bold uppercase">Pacient</dt>
              <dd className="break-words font-bold">{f.values.meno}</dd>
            </div>
            <div className="min-w-0">
              <dt className="font-mono text-xs font-bold uppercase">E-mail</dt>
              <dd className="break-words font-bold">{f.values.email}</dd>
            </div>
          </div>
          <div>
            <dt className="font-mono text-xs font-bold uppercase">S čím prichádzaš</dt>
            <dd className="break-words">{f.values.tema || '— (povieš na vyšetrení)'}</dd>
          </div>
        </dl>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t-3 border-ink pt-5">
        {!f.isFirstStep && (
          <Button type="button" variant="outline" onClick={f.back}>
            Späť
          </Button>
        )}
        {f.isLastStep ? (
          <Button type="submit" variant="accent" size="lg" className="max-w-full whitespace-normal text-ink">
            Objednať sa na vyšetrenie <ArrowRight />
          </Button>
        ) : (
          <Button type="submit" size="lg">
            Ďalej <ArrowRight />
          </Button>
        )}
      </div>
    </form>
  );
}
