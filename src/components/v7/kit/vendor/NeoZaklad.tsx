/** Katalóg vendor · neobrutalism.dev (1/3): Button, Badge, Card, Separator, Tabs, Tooltip.
 *  Všetky props podľa src/components/vendor/neobrutalism/*.tsx. Pastelové tóny (pink/lilac/lime/sky) kus má,
 *  ale zákon V5.3 ich zakazuje → iba textom (Zakazane). */
import { ArrowRightIcon, FirstAidKitIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '@/components/vendor/neobrutalism/button';
import { Badge } from '@/components/vendor/neobrutalism/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/vendor/neobrutalism/card';
import { Separator } from '@/components/vendor/neobrutalism/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/vendor/neobrutalism/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/vendor/neobrutalism/tooltip';
import { CTA_HLAVNE, CTA_KTO } from '@/components/hero/hero-data';
import { PRODUKTY, VLAJKA } from '@/data/ponuka';
import { KORPUS, MARQUEE_FAKTY } from '@/data/fakty';
import { Kus, Mriezka, Realne, Varianta, Zakazane } from './shared';

const TONY = ['yellow', 'hot', 'white', 'paper', 'ink'] as const;
const PASTELY = ['pink', 'lilac', 'lime', 'sky'];

export default function NeoZaklad() {
  return (
    <>
      {/* ---------------- Button ---------------- */}
      <Kus
        id="nb-button"
        nazov="Button"
        subor="vendor/neobrutalism/button.tsx"
        veta="Tlačidlo a odkaz v jednom (asChild): tvar a pohyb (variant), farba z tokenu (tone), výška ≥ 44 px (size)."
      >
        <Mriezka cols={3}>
          {(['default', 'noShadow', 'neutral', 'reverse', 'ghost'] as const).map((v) => (
            <Varianta key={v} props={`variant="${v}"`}>
              <Button variant={v}>Vyšetrenie</Button>
            </Varianta>
          ))}
          <Varianta props='disabled · aria-disabled'>
            <Button disabled>disabled</Button>
            <Button aria-disabled="true" tone="white">
              aria-disabled
            </Button>
          </Varianta>
        </Mriezka>
        <Mriezka cols={3}>
          {TONY.map((t) => (
            <Varianta key={t} props={`tone="${t}"${t === 'hot' ? ' · len CTA' : ''}`}>
              <Button tone={t}>Tón {t}</Button>
              <Button tone={t} variant="reverse">
                reverse
              </Button>
            </Varianta>
          ))}
        </Mriezka>
        <Zakazane tony={PASTELY} />
        <Varianta props='size="sm" | "default" | "lg" | "xl" | "icon-sm" | "icon" | "icon-lg"'>
          <Button size="sm">sm</Button>
          <Button>default</Button>
          <Button size="lg">lg</Button>
          <Button size="xl">xl</Button>
          <Button size="icon-sm" tone="white" aria-label="Zavrieť (icon-sm)">
            <XIcon weight="bold" />
          </Button>
          <Button size="icon" tone="white" aria-label="Zavrieť (icon)">
            <XIcon weight="bold" />
          </Button>
          <Button size="icon-lg" tone="white" aria-label="Zavrieť (icon-lg)">
            <XIcon weight="bold" />
          </Button>
        </Varianta>
        <Varianta props='asChild → <a href> · compound: variant="neutral" (biela) · variant="ghost" (priehľadné)'>
          <Button asChild variant="neutral">
            <a href="#nb-card">asChild odkaz</a>
          </Button>
          <Button variant="ghost">ghost</Button>
        </Varianta>
        <Realne zdroj="hero-data.ts (CTA_HLAVNE, CTA_KTO)">
          <div className="flex flex-wrap gap-4">
            <Button asChild tone="hot" size="lg" className="max-w-full whitespace-normal py-2 text-left">
              <a href="#podpis-korpus">
                {CTA_HLAVNE.label} <ArrowRightIcon weight="bold" />
              </a>
            </Button>
            <Button asChild tone="white" variant="reverse" size="lg">
              <a href="#podpis-cesta">{CTA_KTO.label}</a>
            </Button>
          </div>
        </Realne>
      </Kus>

      {/* ---------------- Badge ---------------- */}
      <Kus
        id="nb-badge"
        nazov="Badge"
        subor="vendor/neobrutalism/badge.tsx"
        veta="Mono štítok alebo nálepka (variant sticker), natočená cez tilt — termíny, stavy, formáty."
      >
        <Mriezka cols={3}>
          {(['default', 'flat', 'sticker'] as const).map((v) => (
            <Varianta key={v} props={`variant="${v}"`}>
              <Badge variant={v}>V stavbe</Badge>
            </Varianta>
          ))}
        </Mriezka>
        <Mriezka cols={3}>
          {TONY.map((t) => (
            <Varianta key={t} props={`tone="${t}"${t === 'hot' ? ' · zákon: hot len CTA a X' : ''}`}>
              <Badge tone={t}>{t}</Badge>
              <Badge tone={t} variant="sticker">
                {t}
              </Badge>
            </Varianta>
          ))}
          <Varianta props='tilt="none" | "left" | "right"'>
            <Badge tilt="none">none</Badge>
            <Badge tilt="left" variant="sticker">
              left
            </Badge>
            <Badge tilt="right" variant="sticker" tone="white">
              right
            </Badge>
          </Varianta>
        </Mriezka>
        <Zakazane tony={PASTELY} />
        <Realne zdroj="ponuka.ts (PRODUKTY[].nalepka)">
          <div className="flex flex-wrap gap-3">
            {PRODUKTY.map((p, i) => (
              <Badge key={p.id} variant={i === 0 ? 'sticker' : 'default'} tilt={i === 0 ? 'left' : 'none'} tone={i % 2 ? 'white' : 'yellow'}>
                {p.nalepka}
              </Badge>
            ))}
          </div>
        </Realne>
      </Kus>

      {/* ---------------- Card ---------------- */}
      <Kus
        id="nb-card"
        nazov="Card"
        subor="vendor/neobrutalism/card.tsx"
        veta="Brutal karta so skladačkou Header / Title / Description / Action / Content / Footer; lift, X pečiatka, menšie rozostupy."
      >
        <Mriezka cols={3}>
          {(['default', 'flat', 'lg'] as const).map((v) => (
            <Card key={v} variant={v}>
              <CardHeader>
                <CardTitle>variant {v}</CardTitle>
                <CardDescription>tieň: {v === 'default' ? '6/6 (mobil 4/4)' : v === 'lg' ? '9/9' : 'žiadny'}</CardDescription>
              </CardHeader>
            </Card>
          ))}
          {(['white', 'paper', 'yellow', 'ink'] as const).map((t) => (
            <Card key={t} tone={t} size="sm">
              <CardHeader>
                <CardTitle as="h4">tone {t}</CardTitle>
                <CardDescription>size="sm" · --card-spacing 4</CardDescription>
              </CardHeader>
            </Card>
          ))}
          <Card interactive stamp>
            <CardHeader>
              <CardTitle as="h4">interactive + stamp</CardTitle>
              <CardDescription>lift pri hoveri, X pečiatka v rohu</CardDescription>
            </CardHeader>
          </Card>
        </Mriezka>
        <Zakazane tony={PASTELY} />
        <Realne zdroj="ponuka.ts (VLAJKA)">
          <Card tone="yellow" variant="lg" className="max-w-xl">
            <CardHeader className="border-b">
              <CardTitle as="h4">{VLAJKA.nazov}</CardTitle>
              <CardDescription>
                {VLAJKA.trvanie} · {VLAJKA.cena}
              </CardDescription>
              <CardAction>
                <Badge variant="sticker" tone="white" tilt="right">
                  <FirstAidKitIcon weight="bold" /> Triáž
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="font-display text-xl font-extrabold leading-tight">{VLAJKA.titulok}</p>
              <ul className="mt-4 grid gap-2">
                {VLAJKA.body.map((b) => (
                  <li key={b} className="text-base">
                    × {b}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="border-t">
              <Button tone="hot" className="max-w-full whitespace-normal py-2 text-left">{CTA_HLAVNE.label}</Button>
            </CardFooter>
          </Card>
        </Realne>
      </Kus>

      {/* ---------------- Separator ---------------- */}
      <Kus
        id="nb-separator"
        nazov="Separator"
        subor="vendor/neobrutalism/separator.tsx"
        veta="Hrubá 3 px linka (vodorovne aj zvisle) alebo X delič sekcie so štítkom."
      >
        <Mriezka cols={3}>
          <Varianta props='orientation="horizontal"'>
            <Separator />
          </Varianta>
          <Varianta props='orientation="vertical"'>
            <div className="flex h-12 items-center gap-4">
              <span className="font-mono text-sm">Príjem</span>
              <Separator orientation="vertical" />
              <span className="font-mono text-sm">Diagnóza</span>
              <Separator orientation="vertical" />
              <span className="font-mono text-sm">Liečba</span>
            </div>
          </Varianta>
          <Varianta props='variant="x" label="…"'>
            <Separator variant="x" label="02 · Anamnéza" />
          </Varianta>
        </Mriezka>
        <Realne zdroj="v54 (poradie sekcií domova)">
          <div className="grid gap-4">
            {['01 · Príjem', '02 · Anamnéza', '03 · Liečba', '04 · Chorobopisy'].map((l) => (
              <Separator key={l} variant="x" label={l} />
            ))}
          </div>
        </Realne>
      </Kus>

      {/* ---------------- Tabs ---------------- */}
      <Kus
        id="nb-tabs"
        nazov="Tabs"
        subor="vendor/neobrutalism/tabs.tsx"
        veta="Záložky v lište (default) alebo s horúcou linkou (line), vodorovne aj zvisle; lišta na mobile scrolluje."
      >
        <Mriezka cols={2}>
          {(['default', 'line'] as const).map((v) => (
            <Varianta key={v} props={`TabsList variant="${v}" · orientation="horizontal" · disabled trigger`}>
              <Tabs defaultValue="a" className="w-full">
                <TabsList variant={v}>
                  <TabsTrigger value="a">Triáž</TabsTrigger>
                  <TabsTrigger value="b">Zásah</TabsTrigger>
                  <TabsTrigger value="c" disabled>
                    Odovzdanie
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="a">Zistím, čo bolí.</TabsContent>
                <TabsContent value="b">Najmenší zásah, ktorý pomôže.</TabsContent>
              </Tabs>
            </Varianta>
          ))}
          {(['default', 'line'] as const).map((v) => (
            <Varianta key={`v-${v}`} props={`TabsList variant="${v}" · orientation="vertical"`}>
              <Tabs defaultValue="a" orientation="vertical" className="w-full">
                <TabsList variant={v}>
                  <TabsTrigger value="a">Príjem</TabsTrigger>
                  <TabsTrigger value="b">Diagnóza</TabsTrigger>
                </TabsList>
                <TabsContent value="a">Prídeš s problémom.</TabsContent>
                <TabsContent value="b">Odídeš s plánom.</TabsContent>
              </Tabs>
            </Varianta>
          ))}
        </Mriezka>
        <Realne zdroj="ponuka.ts (PRODUKTY)">
          <Tabs defaultValue={PRODUKTY[0]?.id}>
            <TabsList>
              {PRODUKTY.map((p) => (
                <TabsTrigger key={p.id} value={p.id}>
                  {p.nazov}
                </TabsTrigger>
              ))}
            </TabsList>
            {PRODUKTY.map((p) => (
              <TabsContent key={p.id} value={p.id}>
                <Card size="sm" tone={p.farba === 'bg-yellow' ? 'yellow' : 'white'}>
                  <CardHeader>
                    <CardTitle as="h4">{p.nazov}</CardTitle>
                    <CardDescription>
                      {p.pre} · {p.nalepka}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{p.popis}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </Realne>
      </Kus>

      {/* ---------------- Tooltip ---------------- */}
      <Kus
        id="nb-tooltip"
        nazov="Tooltip"
        subor="vendor/neobrutalism/tooltip.tsx"
        veta="Bublina pri hoveri a fokuse (desktop, klávesnica); na dotyku nesmie niesť jedinú informáciu."
      >
        <TooltipProvider>
          <Mriezka cols={3}>
            {(['yellow', 'ink', 'white'] as const).map((t) => (
              <Varianta key={t} props={`TooltipContent tone="${t}"`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button tone="white" size="sm">
                      Fokus / hover
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent tone={t}>Tón {t}</TooltipContent>
                </Tooltip>
              </Varianta>
            ))}
            <Varianta props='side="top" | "right" | "bottom" | "left" · sideOffset=8'>
              {(['top', 'right', 'bottom', 'left'] as const).map((s) => (
                <Tooltip key={s}>
                  <TooltipTrigger asChild>
                    <Button tone="paper" size="sm">
                      {s}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={s}>side {s}</TooltipContent>
                </Tooltip>
              ))}
            </Varianta>
          </Mriezka>
          <Realne zdroj="fakty.ts (MARQUEE_FAKTY, KORPUS)">
            <div className="flex flex-wrap gap-3">
              {MARQUEE_FAKTY.map((f) => (
                <Tooltip key={f.label}>
                  <TooltipTrigger asChild>
                    <button type="button" className="press min-h-11 rounded-lg border-3 border-ink bg-white px-4 font-mono text-base font-bold shadow-brutal-sm">
                      {f.value}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent tone="ink">
                    {f.label}: {f.note}
                  </TooltipContent>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="press min-h-11 rounded-lg border-3 border-ink bg-yellow px-4 font-mono text-base font-bold shadow-brutal-sm">
                    {KORPUS.slova} slov
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Korpus: {KORPUS.prompty} promptov od {KORPUS.od}, k {KORPUS.kDatumu}
                </TooltipContent>
              </Tooltip>
            </div>
          </Realne>
        </TooltipProvider>
      </Kus>
    </>
  );
}
