/** V7-04 · Triáž 2 · Prijatie pacienta = rezervácia vyšetrenia. FUNKČNÁ: logika a payload ako
 *  src/components/v5/Rezervacia.tsx (GET /api/terminy/, POST /api/rezervacia/ { slot, meno, email, tema, utm, web },
 *  409 = termín obsadený → späť na čas a nové načítanie, po úspechu konfety, .ics a udalosť konzultacia_rezervacia).
 *  UI z BoldKitu podľa receptu kit/formulare/Vysetrenie.tsx: MultiStepForm + Stepper, Calendar v Popoveri,
 *  ToggleGroup slotov + TimePicker, Field/Input, TagInput (príznaky), Textarea, Alert, Skeleton, sonner.
 *  Keď /api/terminy/ neodpovedá (statický náhľad), ukáže pravidlá ordinácie (src/data/terminy.ts) s upozornením;
 *  obsadenosť overí server pri odoslaní. Ostrov: <Rezervacia client:visible /> */
import { useEffect, useMemo, useRef, useState } from 'react';
import { sk } from 'react-day-picker/locale';
import { ArrowRight, CalendarIcon, CalendarPlus, TriangleAlert } from 'lucide-react';
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
import { TagInput } from '@/components/ui/tag-input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MathCurveLoader } from '@/components/ui/math-curve-loader';
import { fireConfetti } from '@/components/vendor/magicui/confetti';
import { TERMINY, vsetkyTerminy, type Den } from '@/data/terminy';
import { ics, slotText } from '@/lib/ics';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import { TOASTER } from './data';
import { useKlient } from './stav';

type V = { datum: string; slot: string; meno: string; email: string; priznaky: string[]; tema: string };
const PRAZDNE: V = { datum: '', slot: '', meno: '', email: '', priznaky: [], tema: '' };
const NAZVY = ['Deň', 'Čas', 'Príjem pacienta', 'Súhrn'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Návrhy príznakov: slová zo súčasného webu (PRECO_NIE_CHATGPT, VLAJKA, PRIPAD_MAKLER.mal). */
const PRIZNAKY = [
  'tie isté dopyty dookola',
  'follow-up iba keď si spomeniem',
  'kontakty v hlave a v správach',
  'termíny dohadujem ručne',
  'chat zabudne, čo som mu povedal',
  'neviem, kde začať s AI',
];

const zKluca = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const kluc = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const denDlhy = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }).format(zKluca(datum));
const denKratky = (datum: string) => new Intl.DateTimeFormat('sk-SK', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(zKluca(datum));
const casText = (iso: string) =>
  new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TERMINY.zona }).format(new Date(iso));
/** „17:00“ → Date s touto hodinou (TimePicker berie iba hodiny a minúty). */
const naDate = (cas: string) => {
  const [h, m] = cas.split(':').map(Number);
  const d = new Date();
  d.setHours(h!, m!, 0, 0);
  return d;
};
const temaText = (v: V) => [v.priznaky.length ? `Príznaky: ${v.priznaky.join(', ')}` : '', v.tema.trim()].filter(Boolean).join(' — ').slice(0, 600);

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
            : { slot: 'Tento čas nie je voľný. Vyber celú hodinu medzi 14:00 a 19:00.' },
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

type Stav = { typ: 'nic' } | { typ: 'posielam' } | { typ: 'ok'; slot: string; sprava: string } | { typ: 'chyba'; sprava: string };

export default function Rezervacia() {
  const klient = useKlient();
  const [dni, setDni] = useState<Den[] | null>(null);
  const [zdroj, setZdroj] = useState<'api' | 'pravidla'>('api');
  const [kolo, setKolo] = useState(0);
  const [stav, setStav] = useState<Stav>({ typ: 'nic' });

  function nacitaj() {
    fetch('/api/terminy/', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { dni: Den[] }) => {
        if (!Array.isArray(d?.dni)) throw new Error('tvar');
        setDni(d.dni);
        setZdroj('api');
      })
      .catch(() => {
        // statický náhľad alebo výpadok: pravidlá ordinácie, obsadenosť overí server pri odoslaní
        setDni(vsetkyTerminy());
        setZdroj('pravidla');
      });
  }
  useEffect(nacitaj, []);

  if (stav.typ === 'ok') {
    const stiahni = () => {
      const blob = new Blob([ics({ id: 'rez', slot: stav.slot, trvanieMin: TERMINY.trvanieMin })], { type: 'text/calendar' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'konzultacia-xvadur.ics';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    return (
      <div role="status" className="flex flex-col gap-5 border-3 border-ink bg-yellow p-6 text-ink shadow-brutal-lg sm:p-8">
        <p className="font-mono text-sm font-bold tracking-[0.14em] uppercase">Prijatý ✓ · triáž 2</p>
        <p className="font-display text-3xl leading-tight font-extrabold uppercase sm:text-4xl">{slotText(stav.slot)}</p>
        <p className="text-lg">{stav.sprava} Na vyšetrenie si prines jeden príklad úlohy, ktorú chceš vyliečiť. Netreba prezentáciu.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={stiahni} className="bg-white">
            <CalendarPlus aria-hidden="true" /> Pridať do kalendára (.ics)
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setStav({ typ: 'nic' });
              setKolo((k) => k + 1);
            }}
          >
            Nové vyšetrenie
          </Button>
        </div>
      </div>
    );
  }

  if (!klient || !dni) {
    return (
      <div className="flex flex-col gap-5 border-3 border-ink bg-white p-5 text-ink shadow-brutal-lg sm:p-8" aria-busy="true">
        <div className="flex items-center gap-3 font-mono text-sm font-bold uppercase">
          <MathCurveLoader curve="heart" size="sm" aria-label="Načítavam voľné termíny" />
          Načítavam voľné termíny…
        </div>
        <Skeleton variant="blocks" className="h-12 w-full border-3 border-ink" />
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="stamp" className="h-14 flex-1 border-3 border-ink" />
          ))}
        </div>
        <Skeleton variant="scan" className="h-24 w-full border-3 border-ink" />
      </div>
    );
  }

  return (
    <MultiStepForm<V> key={kolo} steps={kroky(dni)} initialValues={PRAZDNE} onSubmit={() => {}}>
      <Formular
        dni={dni}
        zdroj={zdroj}
        stav={stav}
        nacitaj={nacitaj}
        onOk={(slot, sprava) => setStav({ typ: 'ok', slot, sprava })}
        setStav={setStav}
      />
    </MultiStepForm>
  );
}

function Formular({
  dni,
  zdroj,
  stav,
  nacitaj,
  onOk,
  setStav,
}: {
  dni: Den[];
  zdroj: 'api' | 'pravidla';
  stav: Stav;
  nacitaj: () => void;
  onOk: (slot: string, sprava: string) => void;
  setStav: (s: Stav) => void;
}) {
  const f = useMultiStepForm<V>();
  const steps = useMemo(() => kroky(dni), [dni]);
  const [openDen, setOpenDen] = useState(false);
  const webRef = useRef<HTMLInputElement>(null);
  const volneDni = useMemo(() => new Set(dni.map((d) => d.datum)), [dni]);
  const sloty = dni.find((d) => d.datum === f.values.datum)?.sloty ?? [];
  const casy = sloty.map(casText);
  const posledny = dni.length ? zKluca(dni[dni.length - 1]!.datum) : new Date();
  const posielam = stav.typ === 'posielam';

  function chybaKroku(): boolean {
    const e = steps[f.activeStep]?.validate?.(f.values);
    const prva = e ? Object.values(e)[0] : null;
    if (prva) toast.error('Ešte chýba údaj', { toasterId: TOASTER, description: prva });
    return !!prva;
  }

  async function odosli() {
    if (posielam || !f.submit()) return;
    const v = f.values;
    setStav({ typ: 'posielam' });
    try {
      const r = await fetch('/api/rezervacia/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slot: v.slot, meno: v.meno.trim(), email: v.email.trim(), tema: temaText(v), utm: utm(), web: webRef.current?.value ?? '' }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        if (r.status === 409) {
          f.setValue('slot', '');
          f.goTo(1);
          nacitaj();
          toast.error('Termín medzitým obsadili', { toasterId: TOASTER, description: 'Vyber si iný čas.' });
        }
        throw new Error(d?.chyba || 'Rezervácia sa nepodarila.');
      }
      const sprava = d.potvrdenie === 'odoslane' ? 'Potvrdenie s pozvánkou ti prišlo do e-mailu.' : 'Termín je zapísaný. Potvrdenie ti pošlem e-mailom.';
      track('konzultacia_rezervacia', { miesto: 'v7-04' });
      toast.success('Objednané na vyšetrenie', { toasterId: TOASTER, description: slotText(v.slot) });
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) void fireConfetti({ origin: { y: 0.7 } });
      onOk(v.slot, sprava);
    } catch (err) {
      const sprava =
        err instanceof Error && !/fetch|JSON|network|Unexpected/i.test(err.message)
          ? err.message
          : 'Rezervácia teraz nejde. Napíš mi na adam@xvadur.com a termín dohodneme hneď.';
      setStav({ typ: 'chyba', sprava });
      toast.error('Rezervácia neprešla', { toasterId: TOASTER, description: sprava });
    }
  }

  return (
    <form
      className="flex flex-col gap-6 border-3 border-ink bg-white p-5 text-ink shadow-brutal-lg sm:p-8"
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
        Krok {f.activeStep + 1} z {NAZVY.length} · {NAZVY[f.activeStep]}
        {f.activeStep === 1 && ' (30 minút)'}
      </p>

      {zdroj === 'pravidla' && f.activeStep < 2 && (
        <Alert variant="warning" className="border-3">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Obsadenosť sa nenačítala</AlertTitle>
          <AlertDescription>Ukazujem ordinačné hodiny. Či je termín voľný, overím pri odoslaní.</AlertDescription>
        </Alert>
      )}

      {f.activeStep === 0 && (
        <Field>
          <FieldLabel htmlFor="t4-den">Deň</FieldLabel>
          <Popover open={openDen} onOpenChange={setOpenDen}>
            <PopoverTrigger asChild>
              <Button
                id="t4-den"
                type="button"
                variant="outline"
                size="lg"
                aria-invalid={!!f.errors.datum}
                aria-describedby="t4-den-d"
                className={cn('w-full justify-start px-4 font-bold normal-case', !f.values.datum && 'text-muted-foreground', f.errors.datum && 'border-stamp')}
              >
                <CalendarIcon aria-hidden="true" />
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
                  f.setValue('slot', '');
                  setOpenDen(false);
                }}
                className="border-0 shadow-none"
              />
            </PopoverContent>
          </Popover>
          <FieldDescription id="t4-den-d">
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
          ) : (
            <p className="text-lg">Najbližšie dva týždne je plno. Napíš mi na adam@xvadur.com.</p>
          )}
        </Field>
      )}

      {f.activeStep === 1 && (
        <Field>
          <FieldLabel>Čas · {f.values.datum ? denDlhy(f.values.datum) : ''}</FieldLabel>
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
                {casText(s)}
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
                value={f.values.slot ? naDate(casText(f.values.slot)) : undefined}
                onChange={(d) => {
                  if (!d) return;
                  const hh = `${String(d.getHours()).padStart(2, '0')}:00`;
                  const s = sloty.find((x) => casText(x) === hh);
                  if (s) f.setValue('slot', s);
                  else toast.error('Tento čas nie je voľný', { toasterId: TOASTER, description: 'Termíny začínajú celou hodinou.' });
                }}
                placeholder="Vyber čas"
                aria-invalid={!!f.errors.slot}
                className={cn('w-[200px]', f.errors.slot && 'border-stamp')}
              />
            </div>
          )}
          <FieldDescription>Termíny začínajú celou hodinou, 14:00 až 19:00. Čas je bratislavský.</FieldDescription>
          <FieldError>{f.errors.slot}</FieldError>
        </Field>
      )}

      {f.activeStep === 2 && (
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="t4-meno">Meno</FieldLabel>
              <Input
                id="t4-meno"
                name="meno"
                autoComplete="name"
                value={f.values.meno}
                onChange={(e) => f.setValue('meno', e.target.value)}
                aria-invalid={!!f.errors.meno}
                aria-describedby={f.errors.meno ? 't4-meno-e' : undefined}
                className="bg-white text-base"
              />
              <FieldError id="t4-meno-e">{f.errors.meno}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="t4-email">E-mail</FieldLabel>
              <Input
                id="t4-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={f.values.email}
                onChange={(e) => f.setValue('email', e.target.value)}
                aria-invalid={!!f.errors.email}
                aria-describedby={f.errors.email ? 't4-email-e' : 't4-email-d'}
                className="bg-white text-base"
              />
              <FieldDescription id="t4-email-d">Sem príde potvrdenie s pozvánkou.</FieldDescription>
              <FieldError id="t4-email-e">{f.errors.email}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="t4-priznaky">Príznaky (nepovinné)</FieldLabel>
            <TagInput
              id="t4-priznaky"
              value={f.values.priznaky}
              onChange={(t) => f.setValue('priznaky', t)}
              suggestions={PRIZNAKY}
              maxTags={5}
              placeholder="Napíš a stlač Enter…"
              className="bg-white [&_input]:text-base"
            />
            <FieldDescription>Čo ťa v práci bolí. Vyber z návrhov alebo napíš vlastné, najviac päť.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="t4-tema">S čím prichádzaš? (nepovinné)</FieldLabel>
            <Textarea
              id="t4-tema"
              rows={3}
              maxLength={500}
              value={f.values.tema}
              onChange={(e) => f.setValue('tema', e.target.value)}
              placeholder="Napr. odpovedám na tie isté dopyty stále dookola."
              className="bg-white text-base"
            />
            <FieldDescription className="text-right font-mono">{f.values.tema.length} / 500</FieldDescription>
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
            <dd className="break-words">{temaText(f.values) || '— (povieš na vyšetrení)'}</dd>
          </div>
        </dl>
      )}

      {stav.typ === 'chyba' && f.isLastStep && (
        <Alert variant="destructive" className="border-3">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Rezervácia neprešla</AlertTitle>
          <AlertDescription>{stav.sprava}</AlertDescription>
        </Alert>
      )}

      <input ref={webRef} type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <div className="flex flex-wrap items-center gap-3 border-t-3 border-ink pt-5">
        {!f.isFirstStep && (
          <Button type="button" variant="outline" onClick={f.back} disabled={posielam}>
            Späť
          </Button>
        )}
        {f.isLastStep ? (
          <Button type="submit" variant="accent" size="lg" className="max-w-full whitespace-normal" disabled={posielam} data-track="konzultacia_klik" data-track-miesto="v7-04-odoslat">
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
