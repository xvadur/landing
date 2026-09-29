/** Kit · Formuláre: stepper (UI krokov) a multi-step-form (stav formulára po krokoch bez závislostí). */
import { useState } from 'react';
import { ClipboardList, Pill, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import {
  Stepper,
  StepperActions,
  StepperContent,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTrigger,
} from '@/components/ui/stepper';
import { MultiStepForm, useMultiStepForm, type MultiStepFormStep } from '@/components/ui/multi-step-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { CESTA } from '@/data/cesta';
import { PRODUKTY } from '@/data/ponuka';
import { cn } from '@/lib/utils';
import { Bunka, Kus, Mriezka, Recept, Stav, TOASTER } from './Spolocne';

const FAZY = [
  { t: 'Príjem', i: ClipboardList, d: 'Jedna presná úloha.' },
  { t: 'Diagnóza', i: Stethoscope, d: 'Mapa vstup → kroky → rozhodnutie → výsledok.' },
  { t: 'Liečba', i: Pill, d: 'Písomný ďalší krok, vlastníctvo, termín.' },
];

/** Tri stupne veľkosti v jednom riadku (statické, activeStep = 1). */
function Velkost({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return (
    <Stepper activeStep={1} className="w-full">
      <StepperList className="w-full">
        {[0, 1, 2].map((i) => (
          <StepperItem key={i} index={i} className={cn(i < 2 && 'flex-1')}>
            <StepperTrigger size={size} tabIndex={-1} aria-label={`Krok ${i + 1}`} />
            {i < 2 && <StepperSeparator />}
          </StepperItem>
        ))}
      </StepperList>
    </Stepper>
  );
}

export default function Kroky() {
  const [krok, setKrok] = useState(0);
  const [cesta, setCesta] = useState(CESTA.length - 1);

  return (
    <div className="flex flex-col gap-16">
      <Kus
        id="stepper"
        meno="stepper"
        veta="Indikátor krokov s obsahom: controlled aj uncontrolled, vodorovne aj zvislo, 3 veľkosti, číslo alebo ikona, hotové tlačidlá StepperActions."
        pozor={[
          'id „stepper-trigger-N“ natvrdo: dva steppery na stránke = duplicitné id',
          'StepperActions predvolene „Previous / Next / Complete“',
          'klik na krok preskočí validáciu, ak ho neriadiš cez onStepChange',
          'hotový krok = bg-success (žltá), aktívny = ink + scale-110',
        ]}
      >
        <Mriezka className="lg:grid-cols-2">
          <Bunka nazov="horizontal · StepperActions s vlastnými popismi" stlpec>
            <Stepper activeStep={krok} onStepChange={setKrok} className="flex-col">
              <StepperList>
                {FAZY.map((f, i) => (
                  <StepperItem key={f.t} index={i} className={cn(i < FAZY.length - 1 && 'flex-1')}>
                    <StepperTrigger aria-label={f.t} />
                    {i < FAZY.length - 1 && <StepperSeparator />}
                  </StepperItem>
                ))}
              </StepperList>
              {FAZY.map((f, i) => (
                <StepperContent key={f.t} index={i}>
                  <p className="font-display text-xl font-extrabold uppercase">{f.t}</p>
                  <p>{f.d}</p>
                </StepperContent>
              ))}
              <StepperActions
                prevLabel="Späť"
                nextLabel="Ďalej"
                completeLabel="Hotovo"
                onComplete={() => toast.success('Liečba naplánovaná', { toasterId: TOASTER, description: 'Ukážka stepperu.' })}
              />
            </Stepper>
          </Bunka>
          <Bunka nazov="showStepNumber={false} · ikony · size lg" stlpec>
            <Stepper className="flex-col">
              <StepperList>
                {FAZY.map((f, i) => (
                  <StepperItem key={f.t} index={i} className={cn(i < FAZY.length - 1 && 'flex-1')}>
                    <StepperTrigger size="lg" showStepNumber={false} aria-label={f.t}>
                      <f.i className="size-5" />
                    </StepperTrigger>
                    {i < FAZY.length - 1 && <StepperSeparator />}
                  </StepperItem>
                ))}
              </StepperList>
              <StepperContent index={0}>Uncontrolled: klikni na ikonu. Hotový krok ukáže fajku namiesto ikony.</StepperContent>
              <StepperContent index={1}>Druhý krok.</StepperContent>
              <StepperContent index={2}>Tretí krok.</StepperContent>
            </Stepper>
          </Bunka>
          <Bunka nazov="size sm · md · lg" stlpec>
            <Velkost size="sm" />
            <Velkost size="md" />
            <Velkost size="lg" />
          </Bunka>
          <Bunka nazov="vlastné akcie (children StepperActions)" stlpec>
            <Stepper className="flex-col" totalSteps={2}>
              <StepperList>
                <StepperItem index={0} className="flex-1">
                  <StepperTrigger size="sm" aria-label="Otázka" />
                  <StepperSeparator />
                </StepperItem>
                <StepperItem index={1}>
                  <StepperTrigger size="sm" aria-label="Odpoveď" />
                </StepperItem>
              </StepperList>
              <StepperContent index={0}>Kto výsledok potrebuje a čo s ním urobí?</StepperContent>
              <StepperContent index={1}>Jedna presná úloha.</StepperContent>
              <StepperActions>
                <span className="font-mono text-xs">children nahradí predvolené tlačidlá · totalSteps={'{2}'}</span>
              </StepperActions>
            </Stepper>
          </Bunka>
        </Mriezka>
        <Recept nazov="Kto som: cesta nemocnica → XVADUR (src/data/cesta.ts)">
          <Stepper orientation="vertical" activeStep={cesta} onStepChange={setCesta}>
            <StepperList className="w-full">
              {CESTA.map((c, i) => (
                <StepperItem key={c.nazov} index={i} className="w-full items-start">
                  <div className="flex w-full items-start gap-4">
                    <StepperTrigger aria-label={c.nazov} className="shrink-0" />
                    <button type="button" onClick={() => setCesta(i)} className="flex min-h-11 min-w-0 flex-col text-left">
                      <span className="font-mono text-xs font-bold uppercase">{c.kedy}</span>
                      <span className="font-display text-xl font-extrabold uppercase">{c.nazov}</span>
                    </button>
                  </div>
                  {i === cesta && (
                    <div className="mt-2 ml-14 max-w-xl rounded-lg border-3 border-ink bg-white p-4">
                      <p>{c.text}</p>
                      {c.citat && <p className="mt-2 font-serif text-xl italic">„{c.citat}“</p>}
                    </div>
                  )}
                  {i < CESTA.length - 1 && <StepperSeparator />}
                </StepperItem>
              ))}
            </StepperList>
          </Stepper>
          <Stav>zvislý stepper ako časová os príbehu: hotové kroky žltou, dnešok čiernou</Stav>
        </Recept>
      </Kus>

      <Kus
        id="multi-step-form"
        meno="multi-step-form"
        veta="Mozog viackrokového formulára bez závislostí: hodnoty, chyby, touched, aktívny krok, validátor na krok, next / back / goTo / submit. Stepper je iba jeho obraz."
        pozor={['next() nevráti, či prešiel → ak chceš hlásenie, pozri isStepValid', 'chyby sa ukážu až po pokuse ísť ďalej']}
      >
        <Recept nazov="zápis do čakárne (PRODUKTY)" badge="ukážka · nič sa neodosiela">
          <MultiStepForm<Cakaren>
            steps={KROKY_CAKAREN}
            initialValues={{ produkt: '', email: '', suhlas: false }}
            onSubmit={(v) =>
              toast.success('Si v čakárni', {
                toasterId: TOASTER,
                description: `${PRODUKTY.find((p) => p.id === v.produkt)?.nazov} · ${v.email} (ukážka)`,
              })
            }
          >
            <CakarenForm />
          </MultiStepForm>
        </Recept>
        <Mriezka>
          <Bunka nazov="API (useMultiStepForm)" stlpec className="sm:col-span-2 lg:col-span-3">
            <p className="font-mono text-sm break-words">
              values · setValue(name, value) · errors · touched · activeStep · next() · back() · goTo(i) · canGoNext · isStepValid · isFirstStep ·
              isLastStep · submit()
            </p>
          </Bunka>
        </Mriezka>
      </Kus>
    </div>
  );
}

type Cakaren = { produkt: string; email: string; suhlas: boolean };

const KROKY_CAKAREN: MultiStepFormStep<Cakaren>[] = [
  { id: 'produkt', validate: (v) => (v.produkt ? null : { produkt: 'Vyber, na čo čakáš.' }) },
  { id: 'email', validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email) ? null : { email: 'E-mail nevyzerá správne.' }) },
  { id: 'suhlas', validate: (v) => (v.suhlas ? null : { suhlas: 'Bez súhlasu ti nenapíšem.' }) },
];

function CakarenForm() {
  const f = useMultiStepForm<Cakaren>();
  const NAZVY = ['Čo', 'Kam', 'Súhlas'];
  return (
    <div className="flex flex-col gap-5">
      <Stepper activeStep={f.activeStep} onStepChange={f.goTo} className="flex-col">
        <StepperList>
          {NAZVY.map((n, i) => (
            <StepperItem key={n} index={i} className={cn(i < NAZVY.length - 1 && 'flex-1')}>
              <StepperTrigger size="sm" aria-label={n} />
              {i < NAZVY.length - 1 && <StepperSeparator />}
            </StepperItem>
          ))}
        </StepperList>
      </Stepper>

      <div className="min-h-40 rounded-lg border-3 border-ink bg-white p-4">
        {f.activeStep === 0 && (
          <Field>
            <FieldLabel>Na čo čakáš?</FieldLabel>
            <RadioGroup value={f.values.produkt} onValueChange={(v) => f.setValue('produkt', v)} aria-label="Produkt" className="gap-1">
              {PRODUKTY.map((p) => (
                <Label key={p.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-base font-medium normal-case tracking-normal">
                  <RadioGroupItem value={p.id} className="data-[state=checked]:bg-yellow" />
                  <span>
                    <span className="font-bold">{p.nazov}</span> <span className="text-sm text-muted-foreground">· {p.nalepka}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
            <FieldError>{f.errors.produkt}</FieldError>
          </Field>
        )}
        {f.activeStep === 1 && (
          <Field>
            <FieldLabel htmlFor="kit-cak-email">E-mail</FieldLabel>
            <Input
              id="kit-cak-email"
              type="email"
              inputMode="email"
              value={f.values.email}
              onChange={(e) => f.setValue('email', e.target.value)}
              aria-invalid={!!f.errors.email}
              className={f.errors.email ? 'border-stamp' : undefined}
            />
            <FieldError>{f.errors.email}</FieldError>
          </Field>
        )}
        {f.activeStep === 2 && (
          <Field>
            <Label className="flex min-h-11 cursor-pointer items-center gap-3 text-base font-medium normal-case tracking-normal">
              <Checkbox checked={f.values.suhlas} onCheckedChange={(c) => f.setValue('suhlas', c === true)} />
              Napíš mi, keď sa otvorí.
            </Label>
            <FieldError>{f.errors.suhlas}</FieldError>
          </Field>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={f.back} disabled={f.isFirstStep}>
          Späť
        </Button>
        {f.isLastStep ? (
          <Button variant="accent" className="text-ink" onClick={f.submit}>
            Zapísať sa
          </Button>
        ) : (
          <Button onClick={f.next}>Ďalej</Button>
        )}
      </div>
      <pre className="overflow-x-auto rounded-lg border-3 border-ink bg-ink p-3 font-mono text-xs text-paper">
        {JSON.stringify(
          { activeStep: f.activeStep, isStepValid: f.isStepValid, canGoNext: f.canGoNext, values: f.values, errors: f.errors, touched: f.touched },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
