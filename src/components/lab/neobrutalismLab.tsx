/** NeobrutalismLab — ranná prehliadka a kompilačný test vendorovaných neobrutalism.dev komponentov.
 *  Každý komponent z src/components/vendor/neobrutalism/ je tu namontovaný s tokenmi značky a reálnym textom
 *  (motto, fakty z src/data/fakty.ts, frázy z src/data/frazy.ts, beaty z src/data/beaty.ts, nav z src/data/nav.ts).
 *  Ostrov: <NeobrutalismLab client:visible /> (Radix dialógy siahajú na window až po montáži, client:only netreba).
 *  Nič z tejto stránky nie je verejný obsah — je to výklad komponentov. */
import * as React from 'react';
import { ArrowRightIcon, CheckIcon, ChatCircleDotsIcon, EnvelopeSimpleIcon, InfoIcon } from '@phosphor-icons/react';

import { BEATY } from '@/data/beaty';
import { KOTVY, MARQUEE_FAKTY, POSTAVIL } from '@/data/fakty';
import { CITACIE, FRAZY_RODINY, PRAZDNE_PRIDAVNE } from '@/data/frazy';
import { COMMAND_ITEMS, NAV } from '@/data/nav';

import { Badge } from '@/components/vendor/neobrutalism/badge';
import { Button } from '@/components/vendor/neobrutalism/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/vendor/neobrutalism/card';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/vendor/neobrutalism/command';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/vendor/neobrutalism/dialog';
import { Input } from '@/components/vendor/neobrutalism/input';
import { Progress, ProgressLabel, ProgressValue } from '@/components/vendor/neobrutalism/progress';
import { RadioGroup, RadioGroupCard, RadioGroupItem } from '@/components/vendor/neobrutalism/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/vendor/neobrutalism/select';
import { Separator } from '@/components/vendor/neobrutalism/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/vendor/neobrutalism/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/vendor/neobrutalism/tabs';
import { Textarea } from '@/components/vendor/neobrutalism/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/vendor/neobrutalism/tooltip';

const MOTTO = ['DIVIDED,', 'WE ARE USELESS.'] as const;
const TONES = ['yellow', 'hot', 'white', 'paper', 'pink', 'lilac', 'lime', 'sky', 'ink'] as const;
const ZAKLADNE = FRAZY_RODINY.filter((r) => r.zakladna);
const KOTVY_ZOZNAM = Object.entries(KOTVY).map(([id, k]) => ({ id, ...k }));

function Blok({ id, title, note, children }: { id: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="grid gap-5 py-10 first:pt-0">
      <Separator variant="x" label={title} />
      <div className="grid gap-2 lg:grid-cols-[1fr_2fr] lg:gap-8">
        <div>
          <h2 id={`${id}-h`} className="font-display text-display-xs font-extrabold uppercase leading-[0.95] tracking-tight">
            {title}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-ink/70">{note}</p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function NeobrutalismLab() {
  const [kotva, setKotva] = React.useState(KOTVY_ZOZNAM[0]!.id);
  const [projekt, setProjekt] = React.useState(POSTAVIL[0]!.id);
  const [rodina, setRodina] = React.useState(ZAKLADNE[0]!.rodina);
  const [paleta, setPaleta] = React.useState(false);
  const [text, setText] = React.useState(CITACIE[0]!.text);

  const k = KOTVY_ZOZNAM.find((x) => x.id === kotva) ?? KOTVY_ZOZNAM[0]!;
  const p = POSTAVIL.find((x) => x.id === projekt) ?? POSTAVIL[0]!;
  const r = ZAKLADNE.find((x) => x.rodina === rodina) ?? ZAKLADNE[0]!;
  const percento = Math.round((k.value / k.z) * 100);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaleta((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <TooltipProvider>
      <div className="grid gap-2">
        {/* ---------- BUTTON ---------- */}
        <Blok id="lab-button" title="Button" note="variant: default · noShadow · neutral · reverse · ghost; tone: 9 farieb tokenov; size: sm · default · lg · xl · icon; asChild pre <a>. Všetky ciele ≥ 44 px.">
          <div className="flex flex-wrap gap-4">
            <Button tone="hot" size="lg">
              Vstúp <ArrowRightIcon weight="bold" aria-hidden="true" />
            </Button>
            <Button>Začať cez 4 otázky</Button>
            <Button variant="neutral">Ako prebieha 30 minút</Button>
            <Button variant="reverse" tone="lilac">
              Škrtni ich
            </Button>
            <Button variant="noShadow" tone="sky" size="sm">
              Späť
            </Button>
            <Button variant="ghost">Celý príbeh</Button>
            <Button asChild tone="ink">
              <a href="/konzultacia/">Konzultácia</a>
            </Button>
            <Button size="icon" tone="pink" aria-label="Napísať e-mail">
              <EnvelopeSimpleIcon weight="bold" size={24} />
            </Button>
            <Button size="icon-sm" tone="lime" aria-label="Napísať na WhatsApp">
              <ChatCircleDotsIcon weight="bold" size={22} />
            </Button>
            <Button disabled>Nedostupné</Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {TONES.map((t) => (
              <Button key={t} tone={t} size="sm">
                {t}
              </Button>
            ))}
          </div>
        </Blok>

        {/* ---------- BADGE ---------- */}
        <Blok id="lab-badge" title="Badge" note="variant: default · flat · sticker; tone: 9 farieb; tilt: none · left · right. Sticker „V stavbe“ pre hry 2 a 3.">
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="sticker" tilt="left">
              V stavbe
            </Badge>
            <Badge tone="hot">Zadarmo</Badge>
            <Badge tone="lime">
              <CheckIcon weight="bold" aria-hidden="true" /> 47 / 47
            </Badge>
            {MARQUEE_FAKTY.map((f, i) => (
              <Badge key={f.label} tone={TONES[(i + 4) % TONES.length]} variant={i % 2 ? 'flat' : 'default'}>
                {f.value}
              </Badge>
            ))}
            <Badge variant="sticker" tone="pink" tilt="right">
              9 €
            </Badge>
            <Badge tone="ink" variant="flat">
              pack13
            </Badge>
          </div>
        </Blok>

        {/* ---------- CARD ---------- */}
        <Blok id="lab-card" title="Card" note="tone: white · paper · 6 pastelov · ink; variant: default · flat · lg; interactive = lift; stamp = X pečiatka; size = sm. Karty „Čo som postavil“ zo spec 05 §2.3.">
          <div className="grid gap-6 sm:grid-cols-2">
            {POSTAVIL.slice(0, 4).map((pr, i) => (
              <Card key={pr.id} tone={(['yellow', 'white', 'pink', 'sky'] as const)[i]} interactive stamp style={{ ['--i' as string]: i }} className="card-drop">
                <CardHeader>
                  <CardDescription className="eyebrow">{pr.nazov}</CardDescription>
                  <CardTitle className="text-display-xs">{pr.cislo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed">{pr.riadok}</p>
                </CardContent>
                <CardFooter className="border-t justify-between">
                  {pr.url ? (
                    <a href={pr.url} className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
                      {pr.domena}
                    </a>
                  ) : (
                    <span className="font-mono text-xs text-ink/70">{pr.domena ?? 'bez odkazu'}</span>
                  )}
                  <Badge tone="ink" variant="flat">
                    {pr.fakty[0]?.source ?? 'spec05'}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
            <Card tone="ink" variant="lg" size="sm" className="sm:col-span-2">
              <CardHeader>
                <CardTitle as="h3" className="text-display-sm">
                  {MOTTO[0]}
                  <br />
                  {MOTTO[1]}
                </CardTitle>
                <CardDescription className="text-paper/80">Motto v4 · hero (doc 10 §4)</CardDescription>
                <CardAction>
                  <Badge tone="hot" variant="sticker" tilt="right">
                    Hero
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          </div>
        </Blok>

        {/* ---------- DIALOG ---------- */}
        <Blok id="lab-dialog" title="Dialog" note="Overlay = grid (mobil dole, desktop stred), otvorenie = card-drop, zatvorenie = fade 120 ms; size sm · default · lg; tone plochy; showCloseButton.">
          <Dialog>
            <DialogTrigger asChild>
              <Button tone="hot">Otvoriť dialóg</Button>
            </DialogTrigger>
            <DialogContent tone="paper">
              <DialogHeader>
                <DialogTitle>
                  {MOTTO[0]}
                  <br />
                  {MOTTO[1]}
                </DialogTitle>
                <DialogDescription>{BEATY[6]!.text}</DialogDescription>
              </DialogHeader>
              <ul className="grid gap-2">
                {BEATY.slice(0, 3).map((b) => (
                  <li key={b.rok} className="flex gap-3 rounded-lg border-3 border-ink bg-white p-3">
                    <span className="eyebrow shrink-0 pt-1">{b.rok}</span>
                    <span className="text-sm">{b.text}</span>
                  </li>
                ))}
              </ul>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="neutral">Zavrieť</Button>
                </DialogClose>
                <Button asChild tone="hot">
                  <a href="/texty/">Celý príbeh</a>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Blok>

        {/* ---------- SHEET ---------- */}
        <Blok id="lab-sheet" title="Sheet" note="side: right · left · top · bottom; slide cez theme.css; hrana 3 px ink, bg paper. Mobilná navigácia ostáva vaul (site/Drawer), toto je pre panely s obsahom.">
          <div className="flex flex-wrap gap-4">
            {(['right', 'bottom'] as const).map((side) => (
              <Sheet key={side}>
                <SheetTrigger asChild>
                  <Button variant="neutral">Kto som · {side === 'right' ? 'sprava' : 'zdola'}</Button>
                </SheetTrigger>
                <SheetContent side={side}>
                  <SheetHeader>
                    <SheetTitle>Kto som</SheetTitle>
                    <SheetDescription>Sedem beatov ako mechanizmus, bez mien ľudí a inštitúcií.</SheetDescription>
                  </SheetHeader>
                  <ol className="grid gap-3 px-4">
                    {BEATY.map((b, i) => (
                      <li key={b.rok} className="grid grid-cols-[4.5rem_1fr] gap-3 border-b-3 border-ink pb-3 last:border-b-0">
                        <span className="eyebrow pt-1">
                          {String(i + 1).padStart(2, '0')} · {b.rok}
                        </span>
                        <span>
                          <strong className="block font-display text-lg font-extrabold uppercase leading-none">{b.titulok}</strong>
                          <span className="mt-1 block text-sm">{b.text}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button tone="hot">Zavrieť</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </Blok>

        {/* ---------- INPUT + TEXTAREA ---------- */}
        <Blok id="lab-input" title="Input · Textarea" note="48 px, text 16 px, tieň 3/3 → 6/6 pri fokuse, aria-invalid = horúci rám a ružová plocha. Labely vždy viditeľné.">
          <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-2">
              <label htmlFor="lab-web" className="eyebrow">
                Adresa webu
              </label>
              <Input id="lab-web" type="url" inputMode="url" placeholder="https://" autoComplete="url" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="lab-email" className="eyebrow">
                E-mail (neplatný stav)
              </label>
              <Input id="lab-email" type="email" defaultValue="adam@xvadur" aria-invalid="true" aria-describedby="lab-email-err" />
              <p id="lab-email-err" className="text-sm font-bold text-hot">
                Chýba doména.
              </p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="lab-text" className="eyebrow">
                Text z webu kancelárie
              </label>
              <Textarea id="lab-text" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
              <p className="text-sm text-ink/70">
                {text.length} znakov · citácia: {CITACIE[0]!.kto}
              </p>
            </div>
          </form>
        </Blok>

        {/* ---------- SELECT ---------- */}
        <Blok id="lab-select" title="Select" note="Trigger ako Input (tone white · yellow · paper), popover brutal so skupinami, položky ≥ 44 px, zvýraznenie žltou s rámom.">
          <div className="grid gap-4 sm:max-w-md">
            <label htmlFor="lab-projekt" className="eyebrow">
              Projekt
            </label>
            <Select value={projekt} onValueChange={setProjekt}>
              <SelectTrigger id="lab-projekt" aria-label="Vyber projekt">
                <SelectValue placeholder="Vyber projekt" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Čo som postavil</SelectLabel>
                  {POSTAVIL.slice(0, 4).map((pr) => (
                    <SelectItem key={pr.id} value={pr.id}>
                      {pr.nazov} · {pr.cislo}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Dáta a systémy</SelectLabel>
                  {POSTAVIL.slice(4).map((pr) => (
                    <SelectItem key={pr.id} value={pr.id}>
                      {pr.nazov} · {pr.cislo}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-base">{p.riadok}</p>
          </div>
        </Blok>

        {/* ---------- RADIO GROUP ---------- */}
        <Blok id="lab-radio" title="RadioGroup" note="RadioGroupItem = kruh 24 px; RadioGroupCard = celá karta ako cieľ (kvíz). Šesť základných rodín fráz z packu 13.">
          <fieldset className="grid gap-3">
            <legend className="eyebrow mb-3">Ktorú frázu má web kancelárie?</legend>
            <RadioGroup value={rodina} onValueChange={setRodina} aria-label="Rodina fráz">
              {ZAKLADNE.map((f) => (
                <RadioGroupCard key={f.rodina} value={f.rodina}>
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span>{f.rodina}</span>
                    <span className="font-mono text-xs font-medium normal-case text-ink/70">
                      {f.z47} / 47{f.na416 ? ` · ${f.na416} / 416` : ''}
                    </span>
                  </span>
                </RadioGroupCard>
              ))}
            </RadioGroup>
            <p className="mt-2 text-sm text-ink/70">
              Vzory ({r.vzory.length}): {r.vzory.slice(0, 4).join(' · ')}…
            </p>
            <RadioGroup defaultValue="kruh" aria-label="Samostatné prepínače" className="mt-4 flex flex-wrap gap-6">
              {['kruh', 'bez karty'].map((v) => (
                <span key={v} className="flex min-h-11 items-center gap-3">
                  <RadioGroupItem value={v} id={`lab-radio-${v.replace(' ', '-')}`} />
                  <label htmlFor={`lab-radio-${v.replace(' ', '-')}`} className="text-sm">
                    RadioGroupItem · {v}
                  </label>
                </span>
              ))}
            </RadioGroup>
          </fieldset>
        </Blok>

        {/* ---------- PROGRESS ---------- */}
        <Blok id="lab-progress" title="Progress" note="value/max, tone: hot · yellow · pink · lilac · lime · sky · ink, size sm · default · lg; ProgressLabel + ProgressValue (mono). Kotvy z packu 13 §1.">
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-2">
              {KOTVY_ZOZNAM.map((x) => (
                <Button key={x.id} size="sm" variant={x.id === kotva ? 'default' : 'neutral'} onClick={() => setKotva(x.id)} aria-pressed={x.id === kotva}>
                  {x.value} / {x.z}
                </Button>
              ))}
            </div>
            <div className="flex items-end gap-3">
              <ProgressLabel>{k.note}</ProgressLabel>
              <ProgressValue>
                {k.value} / {k.z} · {percento} %
              </ProgressValue>
            </div>
            <Progress value={k.value} max={k.z} aria-label={k.note} />
            <Progress value={31} max={47} tone="lilac" size="lg" aria-label="31 zo 47 kancelárií má frázu" />
            <Progress value={15} max={416} tone="sky" size="sm" aria-label="15 zo 416 webov ponúka rezerváciu" />
          </div>
        </Blok>

        {/* ---------- COMMAND ---------- */}
        <Blok id="lab-command" title="Command" note="cmdk: inline aj CommandDialog (⌘K / Ctrl K). Skupiny s eyebrow, položky ≥ 44 px, ESC v žltom riadku. V základe už beží site/CommandK.tsx — toto je vendorovaná verzia s rovnakým jazykom.">
          <div className="grid gap-4">
            <Command label="Kam?" loop>
              <CommandInput placeholder="Hry, kvíz, texty, konzultácia…" />
              <CommandList>
                <CommandEmpty>Nič také tu nie je.</CommandEmpty>
                <CommandGroup heading="Stránky">
                  {COMMAND_ITEMS.map((item) => (
                    <CommandItem key={item.href} value={`${item.label} ${item.href}`} onSelect={() => window.location.assign(item.href)}>
                      <span>{item.label}</span>
                      <CommandShortcut>
                        {item.href} <ArrowRightIcon weight="bold" size={14} aria-hidden="true" className="inline" />
                      </CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Frázy na škrtnutie">
                  {ZAKLADNE.map((f) => (
                    <CommandItem key={f.rodina} value={f.rodina} onSelect={() => setRodina(f.rodina)} className="normal-case font-sans font-bold">
                      {f.rodina}
                      <CommandShortcut>{f.z47} / 47</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div>
              <Button variant="neutral" onClick={() => setPaleta(true)}>
                Otvoriť paletu <kbd className="rounded-sm border-2 border-ink bg-white px-1.5 font-mono text-xs normal-case">⌘K</kbd>
              </Button>
            </div>
            <CommandDialog open={paleta} onOpenChange={setPaleta}>
              <CommandInput placeholder="Hry, kvíz, texty, konzultácia…" />
              <CommandList>
                <CommandEmpty>Nič také tu nie je.</CommandEmpty>
                <CommandGroup heading="Stránky">
                  {NAV.map((item) => (
                    <CommandItem key={item.href} value={`${item.label} ${item.href}`} onSelect={() => window.location.assign(item.href)}>
                      {item.label}
                      <CommandShortcut>{item.href}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </div>
        </Blok>

        {/* ---------- TABS ---------- */}
        <Blok id="lab-tabs" title="Tabs" note="variant default (biela lišta, žltá aktívna) a line (horúca linka); na mobile lišta scrolluje vodorovne; orientation vertical.">
          <div className="grid gap-8">
            <Tabs defaultValue="fakty">
              <TabsList aria-label="Dáta">
                <TabsTrigger value="fakty">Fakty</TabsTrigger>
                <TabsTrigger value="frazy">Frázy</TabsTrigger>
                <TabsTrigger value="citacie">Citácie</TabsTrigger>
              </TabsList>
              <TabsContent value="fakty">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {MARQUEE_FAKTY.map((f) => (
                    <li key={f.label} className="rounded-lg border-3 border-ink bg-white p-4 shadow-brutal-sm">
                      <span className="eyebrow block">{f.label}</span>
                      <span className="mt-1 block font-display text-3xl font-extrabold">{f.value}</span>
                      <span className="mt-1 block text-sm text-ink/70">{f.note}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="frazy">
                <ul className="grid gap-2">
                  {ZAKLADNE.map((f) => (
                    <li key={f.rodina} className="flex flex-wrap justify-between gap-2 rounded-lg border-3 border-ink bg-white px-4 py-3">
                      <span className="font-bold">{f.rodina}</span>
                      <span className="font-mono text-sm">{f.z47} / 47</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="citacie">
                <ul className="grid gap-2">
                  {CITACIE.slice(0, 6).map((c, i) => (
                    <li key={`${c.kto}-${i}`} className="rounded-lg border-3 border-ink bg-white px-4 py-3">
                      <q className="font-serif text-xl italic">{c.text}</q>
                      <span className="mt-1 block font-mono text-xs uppercase tracking-wider text-ink/70">{c.kto}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
            <Tabs defaultValue="d1">
              <TabsList variant="line" aria-label="Rodiny fráz">
                {ZAKLADNE.slice(0, 3).map((f, i) => (
                  <TabsTrigger key={f.rodina} value={`d${i + 1}`}>
                    {f.rodina.split(' / ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {ZAKLADNE.slice(0, 3).map((f, i) => (
                <TabsContent key={f.rodina} value={`d${i + 1}`}>
                  <p className="text-base">
                    <strong>{f.rodina}</strong> — {f.z47} zo 47 kancelárií{f.na416 ? `, ${f.na416} výskytov na 416 weboch` : ''}. Vzory: {f.vzory.slice(0, 5).join(', ')}.
                  </p>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </Blok>

        {/* ---------- TOOLTIP ---------- */}
        <Blok id="lab-tooltip" title="Tooltip" note="tone yellow · ink · white, tieň 3/3, pop cez theme.css. Len hover/fokus — na dotyku nesmie niesť jedinú informáciu (preto je poznámka aj v texte).">
          <div className="flex flex-wrap items-center gap-4">
            {MARQUEE_FAKTY.map((f, i) => (
              <Tooltip key={f.label}>
                <TooltipTrigger asChild>
                  <Button variant="neutral" size="sm">
                    {f.value} <InfoIcon weight="bold" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent tone={(['yellow', 'ink', 'white', 'yellow'] as const)[i]}>
                  {f.label}: {f.note}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink/70">
            {MARQUEE_FAKTY.map((f) => `${f.value} = ${f.note}`).join(' · ')}
          </p>
        </Blok>

        {/* ---------- SEPARATOR ---------- */}
        <Blok id="lab-separator" title="Separator" note="default: 3 px ink linka (horizontal/vertical); variant x: X delič so štítkom (utilita x-divider z global.css).">
          <div className="grid gap-5">
            <Separator />
            <Separator variant="x" label="Prázdne prídavné mená" />
            <div className="flex min-h-12 flex-wrap items-center gap-4">
              {PRAZDNE_PRIDAVNE.slice(0, 3).map((slovo, i) => (
                <React.Fragment key={slovo}>
                  {i > 0 && <Separator orientation="vertical" className="h-8" />}
                  <span className="font-display text-xl font-extrabold uppercase line-through decoration-hot decoration-[3px]">{slovo}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </Blok>
      </div>
    </TooltipProvider>
  );
}
