/** Kit · Prekrytia: popover.tsx, hover-card.tsx, tooltip.tsx — plávajúce vrstvy pri spúšťači (Radix popper:
 *  side, align, sideOffset, kolízie). Obsah: slovník liečby (ponuka.ts), Hriech, Korpus, Jakub (fakty.ts). */
import * as React from 'react';
import { toast } from 'sonner';
import { Copy, Download, Share2, Info } from 'lucide-react';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Kbd, KbdCombo } from '@/components/ui/kbd';
import { VLAJKA, PRODUKTY } from '@/data/ponuka';
import { DOKAZY, KORPUS } from '@/data/fakty';
import { Blok, KIT_TOASTER, Kus, Stav } from './spolocne';

type Strana = 'top' | 'right' | 'bottom' | 'left';
const STRANY: Strana[] = ['top', 'right', 'bottom', 'left'];
const ZAROVNANIA = ['start', 'center', 'end'] as const;
const hriech = DOKAZY.find((d) => d.id === 'hriech')!;
const jakub = DOKAZY.find((d) => d.id === 'system-pre-maklera')!;
const kohorta = PRODUKTY.find((p) => p.id === 'kohorta')!;

const SLOVNIK = [
  { slovo: 'Triáž', text: VLAJKA.body[0]! },
  { slovo: 'Diagnóza', text: VLAJKA.body[1]! },
  { slovo: 'Plán liečby', text: VLAJKA.body[2]! },
];

export default function Plavajuce() {
  const [kotva, setKotva] = React.useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <Kus
        id="popover"
        meno="popover"
        subor="src/components/ui/popover.tsx"
        veta="Malé okno pri tlačidle, otvára sa klikom a môže mať vo vnútri formulár. Slovník pojmov, rýchly zápis, nastavenie hry."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Blok nazov="Slovník · text v popoveri" pozn="w-72 default, className mení šírku. Esc a klik mimo zatvárajú.">
            <p className="text-lg">
              Postup ako na zmene:{' '}
              {SLOVNIK.map((s, i) => (
                <React.Fragment key={s.slovo}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        data-open={i === 0 ? 'popover' : undefined}
                        className="min-h-11 font-bold underline decoration-[3px] decoration-yellow underline-offset-4 hover:decoration-ink"
                      >
                        {s.slovo}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]">
                      <p className="eyebrow">✚ {s.slovo}</p>
                      <p className="mt-2 text-sm">{s.text}</p>
                    </PopoverContent>
                  </Popover>
                  {i < SLOVNIK.length - 1 ? ' → ' : '.'}
                </React.Fragment>
              ))}
            </p>
            <div className="mt-3">
              <Stav>zatvorené</Stav>
            </div>
          </Blok>

          <Blok nazov="S formulárom · čakáreň" pozn="Fokus ide do prvého poľa. Formulár sa tu neodosiela.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" data-open="popover-form">
                    Chcem vedieť ako prvý
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)]">
                  <form
                    className="grid gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      toast('Ukážka katalógu', { description: 'Nič sa neodoslalo.', toasterId: KIT_TOASTER });
                    }}
                  >
                    <p className="font-display text-lg font-extrabold uppercase leading-tight">{kohorta.nazov}</p>
                    <p className="text-sm">{kohorta.nalepka}</p>
                    <Label htmlFor="kit-pop-mail">E-mail</Label>
                    <Input id="kit-pop-mail" type="email" placeholder="ty@firma.sk" />
                    <Button type="submit">Zapísať</Button>
                  </form>
                </PopoverContent>
              </Popover>
            </div>
          </Blok>

          <Blok nazov="side × align · sideOffset" pozn="Radix sám preklopí stranu, keď sa nezmestí (avoidCollisions).">
            <div className="flex flex-wrap gap-3">
              {STRANY.map((s) => (
                <Popover key={s}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" data-open={`popover-${s}`}>
                      {s}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side={s} sideOffset={12} className="w-56">
                    <p className="font-mono text-sm">side=&quot;{s}&quot; · sideOffset=12</p>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {ZAROVNANIA.map((a) => (
                <Popover key={a}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-40">
                      align {a}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align={a} className="w-64">
                    <p className="font-mono text-sm">align=&quot;{a}&quot;</p>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </Blok>

          <Blok nazov="PopoverAnchor · kotva inde než spúšťač" pozn="Tlačidlo otvára, ale okno sa prilepí k číslu Korpusu.">
            <Popover open={kotva} onOpenChange={setKotva}>
              <div className="flex flex-wrap items-end gap-4">
                <PopoverAnchor asChild>
                  <p className="font-display text-5xl font-extrabold leading-none">{KORPUS.slova}</p>
                </PopoverAnchor>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Čo je to číslo?" data-open="popover-kotva">
                    <Info aria-hidden="true" />
                  </Button>
                </PopoverTrigger>
              </div>
              <PopoverContent side="top" align="start" className="w-72 max-w-[calc(100vw-2rem)]">
                <p className="text-sm">
                  Vlastné slová v Korpuse od {KORPUS.od}, {KORPUS.prompty} promptov. Snímka {KORPUS.kDatumu}.
                </p>
              </PopoverContent>
            </Popover>
          </Blok>
        </div>
      </Kus>

      <Kus
        id="hover-card"
        meno="hover-card"
        subor="src/components/ui/hover-card.tsx"
        veta="Náhľad pri prejdení myšou (aj pri fokuse klávesnicou). Na odkazy v texte: čo je za menom projektu, skôr než klikneš."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Blok nazov="Náhľad projektu v texte" pozn="Na dotykovom displeji sa neotvorí ťuknutím — obsah musí byť dostupný aj inak.">
            <p className="text-lg leading-relaxed">
              V{' '}
              <HoverCard openDelay={150}>
                <HoverCardTrigger asChild>
                  <a
                    href={hriech.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-open="hover-card"
                    className="font-bold underline decoration-[3px] decoration-yellow underline-offset-4"
                  >
                    Hriechu
                  </a>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden p-0">
                  <img
                    src={hriech.obrazok!}
                    alt=""
                    width={960}
                    height={600}
                    className="aspect-[16/10] w-full border-b-3 border-ink object-cover object-top"
                  />
                  <div className="p-4">
                    <p className="font-display text-xl font-extrabold uppercase">{hriech.nazov}</p>
                    <p className="text-sm">
                      {hriech.cislo} {hriech.cisloPopis}. {hriech.riadok}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>{' '}
              stanovujem diagnózu slovenským médiám. Pre{' '}
              <HoverCard openDelay={150}>
                <HoverCardTrigger asChild>
                  <a href="#recepty" className="font-bold underline decoration-[3px] decoration-yellow underline-offset-4">
                    Jakuba
                  </a>
                </HoverCardTrigger>
                <HoverCardContent side="top" className="w-72 max-w-[calc(100vw-2rem)]">
                  <p className="eyebrow">Pacient · {jakub.stitky.join(' · ')}</p>
                  <p className="mt-2 font-display text-4xl font-extrabold">{jakub.cislo}</p>
                  <p className="text-sm">{jakub.cisloPopis}. {jakub.riadok}</p>
                </HoverCardContent>
              </HoverCard>{' '}
              som postavil web, rezervácie a CRM.
            </p>
          </Blok>

          <Blok nazov="openDelay / closeDelay · side" pozn="Default Radix 700 / 300 ms. Rýchly = 0 / 0, pomalý = 1000 / 600.">
            <div className="flex flex-wrap gap-3">
              {[
                { t: 'rýchly 0 ms', o: 0, c: 0, s: 'bottom' as Strana },
                { t: 'default 700 ms', o: 700, c: 300, s: 'right' as Strana },
                { t: 'pomalý 1 s', o: 1000, c: 600, s: 'top' as Strana },
              ].map((v) => (
                <HoverCard key={v.t} openDelay={v.o} closeDelay={v.c}>
                  <HoverCardTrigger asChild>
                    <Button variant="outline">{v.t}</Button>
                  </HoverCardTrigger>
                  <HoverCardContent side={v.s} className="w-60">
                    <p className="font-mono text-sm">
                      openDelay={v.o} · closeDelay={v.c} · side={v.s}
                    </p>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </Blok>
        </div>
      </Kus>

      <Kus
        id="tooltip"
        meno="tooltip"
        subor="src/components/ui/tooltip.tsx"
        veta="Krátky popis pri ikone alebo skratke. Čierny štítok s bielym textom; potrebuje TooltipProvider nad sebou."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Blok nazov="Ikonové tlačidlá · karta Škrtacieho testu" pozn="Tooltip nie je jediný popis: tlačidlá majú aj aria-label.">
            <div className="flex flex-wrap items-center gap-3">
              {[
                { l: 'Zdieľať výsledok', I: Share2 },
                { l: 'Kopírovať, čo zostalo', I: Copy },
                { l: 'Stiahnuť kartu 1080 × 1080', I: Download },
              ].map(({ l, I }, i) => (
                <Tooltip key={l}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" aria-label={l} data-open={i === 0 ? 'tooltip' : undefined}>
                      <I aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{l}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </Blok>

          <Blok nazov="side · s klávesovou skratkou · vypnuté tlačidlo">
            <div className="flex flex-wrap items-center gap-3">
              {STRANY.map((s) => (
                <Tooltip key={s}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-11">
                      {s}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={s}>side=&quot;{s}&quot;</TooltipContent>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary">Kam chceš ísť?</Button>
                </TooltipTrigger>
                <TooltipContent className="flex items-center gap-2 bg-ink">
                  Paleta <KbdCombo keys={['⌘', 'K']} size="sm" className="[&_kbd]:text-ink" />
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-flex">
                    <Button variant="outline" disabled className="pointer-events-none">
                      Miliarda → bilión
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">V stavbe. Vypnuté tlačidlo nechytá myš, preto obal &lt;span tabIndex=0&gt;.</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    delay 0 <Kbd size="sm">0</Kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-60">delayDuration=0 na jednom Tooltipe, zvyšok dedí 200 ms z Providera.</TooltipContent>
              </Tooltip>
            </div>
          </Blok>
        </div>
      </Kus>
    </TooltipProvider>
  );
}
