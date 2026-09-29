/** Kit · Prekrytia: command.tsx (cmdk) — inline Command (staticky otvorený), CommandDialog, skupiny, skratky,
 *  prázdny stav, vypnutá položka, keywords, vlastný filter bez diakritiky, loop. ⌘K je naviazané v recepte 3. */
import * as React from 'react';
import { BookOpen, Gamepad2, Newspaper, Stethoscope, Database, Bug, Home } from 'lucide-react';
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
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { KbdCombo } from '@/components/ui/kbd';
import { NAV } from '@/data/nav';
import { Blok, Kus, Stav } from './spolocne';

const POLOZKA = 'text-base';

function Obsah({ onVyber }: { onVyber: (t: string) => void }) {
  return (
    <>
      <CommandInput placeholder="Hľadaj: hriech, skrtaci, korpus…" />
      <CommandList>
        <CommandEmpty>Nič také tu nie je.</CommandEmpty>
        <CommandGroup heading="Hry">
          <CommandItem className={POLOZKA} value="Škrtací test" keywords={['hra', 'frázy']} onSelect={onVyber}>
            <Gamepad2 aria-hidden="true" /> Škrtací test
            <CommandShortcut>01</CommandShortcut>
          </CommandItem>
          <CommandItem className={POLOZKA} value="Miliarda → bilión" disabled>
            <Gamepad2 aria-hidden="true" /> Miliarda → bilión · v stavbe
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ekosystém">
          <CommandItem className={POLOZKA} value="Hriech" keywords={['médiá', 'diagnóza']} onSelect={onVyber}>
            <Newspaper aria-hidden="true" /> Hriech
          </CommandItem>
          <CommandItem className={POLOZKA} value="Netopier" keywords={['médiá', 'prepisy']} onSelect={onVyber}>
            <Bug aria-hidden="true" /> Netopier
          </CommandItem>
          <CommandItem className={POLOZKA} value="Korpus" keywords={['slová', 'dáta']} onSelect={onVyber}>
            <Database aria-hidden="true" /> Korpus
          </CommandItem>
          <CommandItem className={POLOZKA} value="Texty" keywords={['články', 'substack']} onSelect={onVyber}>
            <BookOpen aria-hidden="true" /> Texty
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Domov">
          {NAV.slice(0, 3).map((n) => (
            <CommandItem key={n.href} className={POLOZKA} value={n.label} onSelect={onVyber}>
              <Home aria-hidden="true" /> {n.label.toLowerCase()}
            </CommandItem>
          ))}
          <CommandItem className={POLOZKA} value="Vyšetrenie" keywords={['konzultácia', 'termín']} onSelect={onVyber}>
            <Stethoscope aria-hidden="true" /> Vyšetrenie
            <CommandShortcut>30 min</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

export default function Paleta() {
  const [vybrate, setVybrate] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <Kus
      id="command"
      meno="command"
      subor="src/components/ui/command.tsx (cmdk)"
      veta="Vyhľadávacia paleta: píšeš a zoznam sa filtruje, šípky a Enter vyberú. Inline ako výber alebo v dialógu cez ⌘K."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Blok nazov="Inline Command · stále otvorený" pozn="loop, predvolený filter bez diakritiky (skús „skrtaci“ alebo „medi“), keywords, disabled, prázdny stav.">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Stav>otvorené</Stav>
            <span className="font-mono text-sm">vybraté: {vybrate ?? '—'}</span>
          </div>
          <Command loop className="border-3 border-ink shadow-brutal-sm" label="Ukážková paleta">
            <Obsah onVyber={setVybrate} />
          </Command>
        </Blok>

        <Blok nazov="CommandDialog · title, description" pozn="Na mobile 16 px okraje, výška do spodku obrazovky. className a commandProps (filter, loop…) sa dajú poslať.">
          <div className="flex flex-wrap items-center gap-3">
            <Stav>{open ? 'otvorené' : 'zatvorené'}</Stav>
            <Button onClick={() => setOpen(true)} data-open="command">
              Otvoriť paletu
            </Button>
            <span className="flex items-center gap-2 text-sm">
              recept 3 viaže <KbdCombo keys={['⌘', 'K']} size="sm" />
            </span>
          </div>
          <CommandDialog open={open} onOpenChange={setOpen} title="Paleta katalógu" description="Hľadaj v ekosystéme XVADUR">
            <Obsah
              onVyber={(t) => {
                setVybrate(t);
                setOpen(false);
              }}
            />
          </CommandDialog>
          <p className="mt-4 text-sm">
            Vybraté z dialógu sa zapíše vľavo. cmdk si pamätá hodnotu položky (value), nie text, preto má každá položka
            vlastné value.
          </p>
        </Blok>
      </div>
    </Kus>
  );
}
