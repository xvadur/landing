/** Kit · Formuláre: input, input-group, input-otp, textarea, field, label. */
import { useState } from 'react';
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { AtSign, Clock, Mail, Search, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Kbd } from '@/components/ui/kbd';
import { NEWSLETTER } from '@/data/ponuka';
import { Bunka, Kus, Mriezka, Recept, Stav, TOASTER } from './Spolocne';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Vstupy() {
  const [tema, setTema] = useState('');
  const [kod, setKod] = useState('');
  const [meno, setMeno] = useState('');
  const [email, setEmail] = useState('');
  const [dotknute, setDotknute] = useState<{ meno?: boolean; email?: boolean }>({});
  const [vydanie, setVydanie] = useState('');

  const chybaMeno = dotknute.meno && meno.trim().length < 2 ? 'Napíš meno, aspoň dve písmená.' : '';
  const chybaEmail = dotknute.email && !EMAIL.test(email) ? 'E-mail nevyzerá správne.' : '';

  return (
    <div className="flex flex-col gap-16">
      <Kus
        id="input"
        meno="input"
        veta="Jednoriadkové pole. Pri fokuse sa zatlačí do tieňa. Vie všetky natívne typy."
        pozor={['aria-invalid nemá štýl', 'hranaté rohy vs. rounded-lg zo zákona dizajnu', 'md:text-sm = 14 px na desktope']}
      >
        <Mriezka>
          <Bunka nazov='type="text" · placeholder' stlpec>
            <Input placeholder="Meno a priezvisko" aria-label="Meno" autoComplete="name" />
          </Bunka>
          <Bunka nazov='type="email" · inputMode' stlpec>
            <Input type="email" inputMode="email" placeholder="adam@xvadur.com" aria-label="E-mail" />
          </Bunka>
          <Bunka nazov='type="password"' stlpec>
            <Input type="password" defaultValue="tajne-heslo" aria-label="Heslo" autoComplete="off" />
          </Bunka>
          <Bunka nazov='type="number" · min · max' stlpec>
            <Input type="number" min={1} max={10} defaultValue={3} aria-label="Bolesť 1 až 10" />
          </Bunka>
          <Bunka nazov='type="search"' stlpec>
            <Input type="search" placeholder="Hľadaj v chorobopisoch…" aria-label="Hľadať" />
          </Bunka>
          <Bunka nazov='type="file"' stlpec>
            <Input type="file" aria-label="Príloha" className="h-auto py-2" />
          </Bunka>
          <Bunka nazov="disabled · readOnly" stlpec>
            <Input disabled placeholder="Vypnuté" aria-label="Vypnuté pole" />
            <Input readOnly value="30 minút · zatiaľ zadarmo" aria-label="Iba na čítanie" />
          </Bunka>
          <Bunka nazov="chyba (ručne: border-stamp)" stlpec>
            <Input aria-invalid defaultValue="adam@" aria-label="Zlý e-mail" className="border-stamp" />
          </Bunka>
        </Mriezka>
      </Kus>

      <Kus
        id="input-group"
        meno="input-group"
        veta="Jedno pole s prílohami vľavo a vpravo: ikona, text alebo tlačidlo. Zatlačí sa celé, keď je fokus vo vnútri."
        pozor={['InputGroupAddon má uppercase natvrdo', 'InputGroupInput text-sm = 14 px aj na mobile (iOS zoom)']}
      >
        <Mriezka>
          <Bunka nazov="leading ikona" stlpec>
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput placeholder="Hľadať" aria-label="Hľadať" />
              <InputGroupAddon position="trailing" className="bg-background">
                <Kbd size="sm">⌘K</Kbd>
              </InputGroupAddon>
            </InputGroup>
          </Bunka>
          <Bunka nazov="leading text" stlpec>
            <InputGroup>
              <InputGroupAddon>https://</InputGroupAddon>
              <InputGroupInput defaultValue="xvadur.com" aria-label="Web" />
            </InputGroup>
          </Bunka>
          <Bunka nazov="trailing text" stlpec>
            <InputGroup>
              <InputGroupAddon>
                <Clock />
              </InputGroupAddon>
              <InputGroupInput type="number" defaultValue={30} aria-label="Trvanie" />
              <InputGroupAddon position="trailing">min</InputGroupAddon>
            </InputGroup>
          </Bunka>
          <Bunka nazov="disabled" stlpec>
            <InputGroup className="opacity-60">
              <InputGroupAddon>
                <AtSign />
              </InputGroupAddon>
              <InputGroupInput disabled placeholder="vypnuté" aria-label="Vypnuté" />
            </InputGroup>
          </Bunka>
        </Mriezka>
        <Recept nazov={`zápis do ${NEWSLETTER.nazov}`} badge="ukážka · nič sa neodosiela">
          <p className="max-w-xl">{NEWSLETTER.popis}</p>
          <form
            className="max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              if (!EMAIL.test(vydanie)) {
                toast.error('E-mail nevyzerá správne', { toasterId: TOASTER });
                return;
              }
              toast.success('Zapísané do Vydania', { toasterId: TOASTER, description: 'Ukážka: nič sa neodoslalo.' });
              setVydanie('');
            }}
          >
            <InputGroup>
              <InputGroupAddon>
                <Mail />
              </InputGroupAddon>
              <InputGroupInput
                type="email"
                inputMode="email"
                placeholder="tvoj@email.sk"
                aria-label="E-mail pre Vydanie"
                value={vydanie}
                onChange={(e) => setVydanie(e.target.value)}
                className="min-h-11 text-base"
              />
              <button
                type="submit"
                className="flex min-h-11 items-center gap-2 border-l-3 border-ink bg-hot px-4 font-bold text-ink uppercase"
              >
                <Send className="size-4" /> <span className="hidden sm:inline">Zapísať</span>
                <span className="sr-only sm:hidden">Zapísať</span>
              </button>
            </InputGroup>
          </form>
        </Recept>
      </Kus>

      <Kus
        id="input-otp"
        meno="input-otp"
        veta="Kód po znakoch (knižnica input-otp): skupiny, oddeľovač, vzor povolených znakov, onComplete."
        pozor={['animate-caret-blink neexistuje → kurzor nebliká', 'sloty v skupine bez medzery: tiene sa prekrývajú']}
      >
        <Mriezka>
          <Bunka nazov="6 číslic · 2 skupiny · separator">
            <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} aria-label="Šesťmiestny kód">
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </Bunka>
          <Bunka nazov="4 znaky · písmená aj číslice · gap">
            <InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} defaultValue="X7" aria-label="Kód">
              <InputOTPGroup className="gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </Bunka>
          <Bunka nazov="disabled">
            <InputOTP maxLength={4} disabled value="2026" aria-label="Vypnutý kód">
              <InputOTPGroup className="gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </Bunka>
        </Mriezka>
        <Recept nazov="potvrdenie e-mailu pred vyšetrením" badge="ukážka · kód je 260926">
          <p>Poslal som ti šesťmiestny kód. Zadaj ho a termín je tvoj.</p>
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={kod}
            onChange={setKod}
            onComplete={(v: string) =>
              v === '260926'
                ? toast.success('Kód sedí', { toasterId: TOASTER, description: 'E-mail je overený (ukážka).' })
                : toast.error('Kód nesedí', { toasterId: TOASTER, description: 'Skús 260926.' })
            }
            aria-label="Kód z e-mailu"
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="bg-white" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Stav>value = „{kod}“</Stav>
        </Recept>
      </Kus>

      <Kus
        id="textarea"
        meno="textarea"
        veta="Viacriadkové pole, rovnaký zatlačený fokus ako input. Počítadlo a limit si pridáš sám."
        pozor={['bez počítadla a bez auto-výšky']}
      >
        <Mriezka>
          <Bunka nazov="default" stlpec>
            <Textarea placeholder="Čo sa opakuje v tvojej práci?" aria-label="Poznámka" />
          </Bunka>
          <Bunka nazov="rows={6} · resize-none" stlpec>
            <Textarea rows={6} className="resize-none" aria-label="Dlhá poznámka" defaultValue={'Anamnéza:\n– kto výsledok potrebuje\n– odkiaľ prichádzajú údaje\n– kde je trenie'} />
          </Bunka>
          <Bunka nazov="disabled" stlpec>
            <Textarea disabled placeholder="Vypnuté" aria-label="Vypnuté" />
          </Bunka>
        </Mriezka>
        <Recept nazov="3 · Príjem pacienta (Rezervacia.tsx)">
          <Field>
            <FieldLabel htmlFor="kit-tema">S čím prichádzaš? (nepovinné)</FieldLabel>
            <Textarea
              id="kit-tema"
              rows={3}
              maxLength={600}
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Napr. odpovedám na tie isté dopyty stále dookola."
              className="bg-white"
            />
            <FieldDescription className="text-right font-mono">{tema.length} / 600</FieldDescription>
          </Field>
        </Recept>
      </Kus>

      <Kus
        id="field"
        meno="field"
        veta="Skladačka formulára: FieldGroup › Field › FieldLabel + ovládač + FieldDescription + FieldError. Chyba sa vykreslí, iba keď má text."
        pozor={['FieldError nie je prepojená cez aria-describedby → dopoj ručne']}
      >
        <Mriezka>
          <Bunka nazov="Field · Label · Description" stlpec>
            <Field>
              <FieldLabel htmlFor="kit-f1">Meno</FieldLabel>
              <Input id="kit-f1" placeholder="Jakub" />
              <FieldDescription>Stačí krstné meno.</FieldDescription>
            </Field>
          </Bunka>
          <Bunka nazov="Field so FieldError" stlpec>
            <Field>
              <FieldLabel htmlFor="kit-f2">E-mail</FieldLabel>
              <Input id="kit-f2" defaultValue="lucia@" aria-invalid aria-describedby="kit-f2-e" className="border-stamp" />
              <FieldError id="kit-f2-e">E-mail nevyzerá správne.</FieldError>
            </Field>
          </Bunka>
          <Bunka nazov="FieldError bez textu = nič" stlpec>
            <Field>
              <FieldLabel htmlFor="kit-f3">Téma</FieldLabel>
              <Input id="kit-f3" defaultValue="Follow-upy" />
              <FieldError>{''}</FieldError>
            </Field>
          </Bunka>
        </Mriezka>
        <Recept nazov="príjem pacienta s kontrolou pri opustení poľa">
          <FieldGroup className="max-w-xl">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="kit-meno">Meno</FieldLabel>
                <Input
                  id="kit-meno"
                  autoComplete="name"
                  value={meno}
                  onChange={(e) => setMeno(e.target.value)}
                  onBlur={() => setDotknute((d) => ({ ...d, meno: true }))}
                  aria-invalid={!!chybaMeno}
                  aria-describedby={chybaMeno ? 'kit-meno-e' : undefined}
                  className={chybaMeno ? 'border-stamp bg-white' : 'bg-white'}
                />
                <FieldError id="kit-meno-e">{chybaMeno}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="kit-email">E-mail</FieldLabel>
                <Input
                  id="kit-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setDotknute((d) => ({ ...d, email: true }))}
                  aria-invalid={!!chybaEmail}
                  aria-describedby={chybaEmail ? 'kit-email-e' : 'kit-email-d'}
                  className={chybaEmail ? 'border-stamp bg-white' : 'bg-white'}
                />
                <FieldDescription id="kit-email-d">Potvrdenie ti príde sem.</FieldDescription>
                <FieldError id="kit-email-e">{chybaEmail}</FieldError>
              </Field>
            </div>
          </FieldGroup>
        </Recept>
      </Kus>

      <Kus
        id="label"
        meno="label"
        veta="Popis poľa (Radix Label): klik na popis presunie fokus. Vie reagovať na vypnutého súrodenca cez peer-disabled."
        pozor={['uppercase natvrdo: dlhé vety v popise kričia']}
      >
        <Mriezka>
          <Bunka nazov="htmlFor" stlpec>
            <Label htmlFor="kit-l1">Meno pacienta</Label>
            <Input id="kit-l1" placeholder="Klikni na popis vyššie" />
          </Bunka>
          <Bunka nazov="peer-disabled (checkbox pred popisom)">
            <div className="flex min-h-11 items-center gap-3">
              <Checkbox id="kit-l2" disabled />
              <Label htmlFor="kit-l2">Vypnutý súhlas</Label>
            </div>
          </Bunka>
          <Bunka nazov="povinné · normal-case">
            <Label htmlFor="kit-l3">
              E-mail <span className="text-stamp" aria-hidden="true">*</span>
            </Label>
            <Label htmlFor="kit-l3" className="font-medium normal-case tracking-normal">
              popis bez kriku, className normal-case
            </Label>
            <Input id="kit-l3" required aria-required placeholder="povinné" />
          </Bunka>
        </Mriezka>
      </Kus>
    </div>
  );
}
