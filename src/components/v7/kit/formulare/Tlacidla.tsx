/** Kit · Formuláre: button, button-group, toggle, toggle-group. Prvý ostrov stránky (client:load) — nesie aj toaster katalógu. */
import { useState } from 'react';
import { ArrowRight, Bell, BellOff, Loader2, Minus, Phone, Plus, Stethoscope, ClipboardList, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TERMINY } from '@/data/terminy';
import { Bunka, Kus, KitToaster, Mriezka, Recept, Stav } from './Spolocne';

/* hot je iba na CTA; text na hot je ink priamo z tokenu (--color-accent-foreground v boldkit.css). */

const VARIANTY = [
  ['default', 'Primárne'],
  ['secondary', 'Sekundárne'],
  ['accent', 'Objednať sa'],
  ['destructive', 'Zrušiť termín'],
  ['outline', 'Obrys'],
  ['ghost', 'Duch'],
  ['link', 'Odkaz'],
  ['noShadow', 'Bez tieňa'],
  ['reverse', 'Opačný tieň'],
] as const;

const VELKOSTI = [
  ['sm', 'sm · 36 px'],
  ['default', 'default · 44 px'],
  ['lg', 'lg · 48 px'],
  ['xl', 'xl · 56 px'],
] as const;

const ANIMACIE = ['none', 'pulse', 'bounce', 'shake', 'wiggle', 'pop'] as const;
const DNI = ['Po', 'Ut', 'St', 'Št', 'Pi'];

export default function Tlacidla() {
  const [pocet, setPocet] = useState(1);
  const [pripomen, setPripomen] = useState(true);
  const [faza, setFaza] = useState('diagnoza');
  const [cas, setCas] = useState('17:00');
  const [dni, setDni] = useState<string[]>(['Po', 'St']);
  const [posielam, setPosielam] = useState(false);

  return (
    <div className="flex flex-col gap-16">
      <KitToaster />

      <Kus
        id="button"
        meno="button"
        veta="Tlačidlo: 9 variantov, 5 veľkostí, 6 animácií, asChild pre odkazy. Tvrdý tieň sa pri hoveri „zatlačí“."
      >
        <Mriezka>
          <Bunka nazov="variant" className="sm:col-span-2 lg:col-span-3">
            {VARIANTY.map(([v, t]) => (
              <Button key={v} variant={v}>
                {t}
              </Button>
            ))}
          </Bunka>
          <Bunka nazov="size" className="sm:col-span-2">
            {VELKOSTI.map(([s, t]) => (
              <Button key={s} size={s} variant="outline">
                {t}
              </Button>
            ))}
            <Button size="icon" aria-label="Zavolať">
              <Phone />
            </Button>
          </Bunka>
          <Bunka nazov="stavy">
            <Button disabled>Disabled</Button>
            <Button
              variant="secondary"
              disabled={posielam}
              onClick={() => {
                setPosielam(true);
                setTimeout(() => setPosielam(false), 1600);
              }}
            >
              {posielam ? <Loader2 className="animate-spin motion-reduce:animate-none" /> : null}
              {posielam ? 'Objednávam…' : 'Klikni: loading'}
            </Button>
          </Bunka>
          <Bunka nazov="animation (hover / trvalé)" className="sm:col-span-2">
            {ANIMACIE.map((a) => (
              <Button key={a} animation={a} variant="outline" size="sm" className="min-h-11">
                {a}
              </Button>
            ))}
          </Bunka>
          <Bunka nazov="asChild + ikony">
            <Button asChild variant="outline">
              <a href="/kit/">Späť na kit</a>
            </Button>
            <Button variant="default">
              <Stethoscope /> S ikonou
            </Button>
          </Bunka>
        </Mriezka>
        <Recept nazov="CTA vyšetrenia (Konzultacia.astro, Liecba.astro)">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="accent" size="xl" className="max-w-full whitespace-normal">
              Objednať sa na vyšetrenie <ArrowRight />
            </Button>
            <Button variant="outline" size="lg">
              Chcem vedieť ako prvý →
            </Button>
            <Button variant="ghost" size="lg">
              ✚ Scrolluj a spoznaj ma
            </Button>
          </div>
          <p className="text-sm">Jediné hot tlačidlo na obrazovke je CTA. Ostatné sú obrys alebo duch.</p>
        </Recept>
      </Kus>

      <Kus
        id="button-group"
        meno="button-group"
        veta="Spojí tlačidlá do jedného bloku: spoločné rámy, jeden tieň, vodorovne aj zvislo."
        pozor={['žiadny stav „vybraté“: na prepínanie použi toggle-group']}
      >
        <Mriezka>
          <Bunka nazov="horizontal">
            <ButtonGroup>
              <Button variant="outline">Príjem</Button>
              <Button variant="outline">Diagnóza</Button>
              <Button variant="outline">Liečba</Button>
            </ButtonGroup>
          </Bunka>
          <Bunka nazov="vertical">
            <ButtonGroup orientation="vertical">
              <Button variant="outline">Anamnéza</Button>
              <Button variant="outline">Inštrumentár</Button>
              <Button variant="outline">Liečba</Button>
            </ButtonGroup>
          </Bunka>
          <Bunka nazov="počítadlo (icon + text)">
            <ButtonGroup aria-label="Počet ľudí na vyšetrení">
              <Button variant="outline" size="icon" aria-label="Menej" onClick={() => setPocet((p) => Math.max(1, p - 1))}>
                <Minus />
              </Button>
              <Button variant="secondary" className="pointer-events-none w-16 tabular-nums" tabIndex={-1} aria-live="polite">
                {pocet}
              </Button>
              <Button variant="outline" size="icon" aria-label="Viac" onClick={() => setPocet((p) => Math.min(4, p + 1))}>
                <Plus />
              </Button>
            </ButtonGroup>
          </Bunka>
        </Mriezka>
        <Recept nazov="navigácia sekcií domova V5.4">
          <div className="overflow-x-auto pb-2" data-lenis-prevent>
            <ButtonGroup aria-label="Sekcie domova">
              {['01 Anamnéza', '02 Inštrumentár', '03 Liečba', 'Chorobopisy', 'Vyšetrenie'].map((s, i) => (
                <Button key={s} variant={i === 2 ? 'secondary' : 'outline'} aria-current={i === 2 ? 'true' : undefined}>
                  {s}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </Recept>
      </Kus>

      <Kus
        id="toggle"
        meno="toggle"
        veta="Tlačidlo s dvoma stavmi (aria-pressed). Zapnuté sa zatlačí a sčernie."
      >
        <Mriezka>
          <Bunka nazov="variant default · outline">
            <Toggle aria-label="Pripomienka">
              <Bell /> default
            </Toggle>
            <Toggle variant="outline" defaultPressed>
              <Bell /> outline, zapnuté
            </Toggle>
          </Bunka>
          <Bunka nazov="size sm · default · lg">
            <Toggle size="sm" variant="outline">
              sm
            </Toggle>
            <Toggle size="default" variant="outline">
              default
            </Toggle>
            <Toggle size="lg" variant="outline">
              lg
            </Toggle>
          </Bunka>
          <Bunka nazov="disabled">
            <Toggle disabled variant="outline">
              vypnutý
            </Toggle>
            <Toggle disabled defaultPressed variant="outline">
              zapnutý
            </Toggle>
          </Bunka>
        </Mriezka>
        <Recept nazov="pripomienka pred vyšetrením">
          <div className="flex flex-wrap items-center gap-4">
            <Toggle size="lg" variant="outline" pressed={pripomen} onPressedChange={setPripomen} aria-label="Pripomenúť deň vopred">
              {pripomen ? <Bell /> : <BellOff />}
              {pripomen ? 'Pripomeniem deň vopred' : 'Bez pripomienky'}
            </Toggle>
          </div>
          <Stav>pressed = {String(pripomen)}</Stav>
        </Recept>
      </Kus>

      <Kus
        id="toggle-group"
        meno="toggle-group"
        veta="Skupina prepínačov: single (jedna voľba, ako rádio) alebo multiple (viac volieb). Variant a veľkosť dedí z rodiča."
        pozor={['type="single" dovolí odznačiť → vynúť hodnotu v onValueChange']}
      >
        <Mriezka>
          <Bunka nazov='type="single"'>
            <ToggleGroup type="single" defaultValue="diagnoza" aria-label="Fáza">
              <ToggleGroupItem value="prijem" aria-label="Príjem">
                <ClipboardList />
              </ToggleGroupItem>
              <ToggleGroupItem value="diagnoza" aria-label="Diagnóza">
                <Stethoscope />
              </ToggleGroupItem>
              <ToggleGroupItem value="liecba" aria-label="Liečba">
                <Pill />
              </ToggleGroupItem>
            </ToggleGroup>
          </Bunka>
          <Bunka nazov='type="multiple" · outline'>
            <ToggleGroup type="multiple" variant="outline" value={dni} onValueChange={setDni} aria-label="Dni">
              {DNI.map((d) => (
                <ToggleGroupItem key={d} value={d}>
                  {d}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Stav>value = [{dni.join(', ')}]</Stav>
          </Bunka>
          <Bunka nazov="size lg · zvislo · disabled položka">
            <ToggleGroup type="single" size="lg" variant="outline" className="flex-col items-stretch" orientation="vertical" value={faza} onValueChange={(v) => v && setFaza(v)}>
              <ToggleGroupItem value="prijem">Príjem</ToggleGroupItem>
              <ToggleGroupItem value="diagnoza">Diagnóza</ToggleGroupItem>
              <ToggleGroupItem value="liecba" disabled>
                Liečba (neskôr)
              </ToggleGroupItem>
            </ToggleGroup>
          </Bunka>
        </Mriezka>
        <Recept nazov="ordinačné hodiny (src/data/terminy.ts)">
          <p className="font-bold">2 · Čas (30 minút)</p>
          <ToggleGroup
            type="single"
            size="lg"
            variant="outline"
            value={cas}
            onValueChange={(v) => v && setCas(v)}
            className="grid grid-cols-3 gap-3 sm:flex sm:justify-start"
            aria-label="Čas vyšetrenia"
          >
            {TERMINY.casy.map((c) => (
              <ToggleGroupItem key={c} value={c} className="min-h-12 font-mono text-base">
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Stav>vybraté: {cas} · pravidlo Po–Pi 14:00–19:00, celé hodiny</Stav>
        </Recept>
      </Kus>
    </div>
  );
}
