/** Kit · Prekrytia: dropdown-menu.tsx a context-menu.tsx — všetky časti (Item, inset, disabled, Shortcut, Label,
 *  Separator, Group, CheckboxItem, RadioGroup/RadioItem, Sub/SubTrigger/SubContent). Obsah: izba dôkazov (fakty.ts).
 *  Položky svietia pri fokuse žltou s ink textom (priamo v kuse, hot patrí iba CTA a X). */
import * as React from 'react';
import { toast } from 'sonner';
import { ChevronDown, Copy, Download, ExternalLink, Share2, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DOKAZY, type Stitok } from '@/data/fakty';
import { cn } from '@/lib/utils';
import { Blok, KIT_TOASTER, Kus, POLOZKA, Stav } from './spolocne';

const STITKY: Stitok[] = ['AI agent', 'web', 'dáta', 'médiá'];
const kit = (t: string) => toast(t, { toasterId: KIT_TOASTER });

export default function Menu() {
  const [stitky, setStitky] = React.useState<Stitok[]>(['AI agent', 'médiá']);
  const [poradie, setPoradie] = React.useState('web');
  const [pripnute, setPripnute] = React.useState(false);
  const [pohlad, setPohlad] = React.useState('karta');

  const vyber = DOKAZY.filter((d) => d.stitky.some((s) => stitky.includes(s)));
  const zoradene = poradie === 'meno' ? [...vyber].sort((a, b) => a.nazov.localeCompare(b.nazov, 'sk')) : vyber;
  const jakub = DOKAZY[0]!;

  return (
    <>
      <Kus
        id="dropdown-menu"
        meno="dropdown-menu"
        subor="src/components/ui/dropdown-menu.tsx"
        veta="Zoznam akcií alebo volieb pod tlačidlom, ovládaný aj šípkami. Filter izby dôkazov, akcie pri hre, zdieľanie."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Blok nazov="Filter · Label, CheckboxItem, Separator, RadioGroup" pozn="Voľba ostane otvorená vďaka onSelect={e => e.preventDefault()}.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" data-open="dropdown">
                    <SlidersHorizontal aria-hidden="true" /> Filter · {stitky.length}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Štítky</DropdownMenuLabel>
                  {STITKY.map((s) => (
                    <DropdownMenuCheckboxItem
                      key={s}
                      className={POLOZKA}
                      checked={stitky.includes(s)}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(c) => setStitky((x) => (c ? [...x, s] : x.filter((y) => y !== s)))}
                    >
                      {s}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Poradie</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={poradie} onValueChange={setPoradie}>
                    <DropdownMenuRadioItem value="web" className={POLOZKA}>
                      ako na webe
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="meno" className={POLOZKA}>
                      podľa mena
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2" role="list" aria-live="polite">
              {zoradene.map((d) => (
                <li key={d.id}>
                  <Badge variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
                    {d.nazov} · {d.cislo}
                  </Badge>
                </li>
              ))}
              {zoradene.length === 0 && <li className="text-sm">Žiadny záznam. Zapni aspoň jeden štítok.</li>}
            </ul>
          </Blok>

          <Blok nazov="Akcie · Group, Shortcut, inset, disabled, Sub" pozn="Podmenu sa otvára šípkou doprava alebo prejdením.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button data-open="dropdown-akcie">
                    Škrtací test <ChevronDown aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" sideOffset={8}>
                  <DropdownMenuLabel>Hra 01</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem className={POLOZKA} onSelect={() => kit('Hrať (ukážka)')}>
                      Hrať znova <DropdownMenuShortcut>R</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={POLOZKA} onSelect={() => kit('Skopírované (ukážka)')}>
                      <Copy className="mr-2 h-4 w-4" aria-hidden="true" /> Kopírovať, čo zostalo
                      <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className={POLOZKA}>
                      <Share2 className="mr-2 h-4 w-4" aria-hidden="true" /> Zdieľať
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-56">
                      <DropdownMenuItem className={POLOZKA} onSelect={() => kit('Odkaz skopírovaný (ukážka)')}>
                        Kopírovať odkaz
                      </DropdownMenuItem>
                      <DropdownMenuItem className={POLOZKA} onSelect={() => kit('Karta 1080 × 1080 (ukážka)')}>
                        <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Stiahnuť kartu
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem inset className={POLOZKA} disabled>
                    Miliarda → bilión · v stavbe
                  </DropdownMenuItem>
                  <DropdownMenuItem inset className={POLOZKA} disabled>
                    Strach-o-meter · v stavbe
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Blok>
        </div>
      </Kus>

      <Kus
        id="context-menu"
        meno="context-menu"
        subor="src/components/ui/context-menu.tsx"
        veta="To isté menu, ale na pravý klik (na dotyku dlhé podržanie). Skryté skratky nad kartou projektu pre toho, kto ich hľadá."
      >
        <Blok nazov="Pravý klik na chorobopis · rovnaké časti ako dropdown" pozn="Nikdy jediná cesta k akcii: pravý klik nikto nečaká, na mobile je to dlhé podržanie.">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <article
                  data-open="context-menu"
                  className={cn(
                    'relative flex min-h-48 flex-1 select-none flex-col justify-between gap-3 rounded-lg border-3 border-ink p-5 shadow-brutal',
                    pripnute ? 'bg-yellow' : 'bg-paper',
                    pohlad === 'riadok' && 'min-h-0 flex-row items-center',
                  )}
                >
                  {pripnute && <span className="sticker absolute -top-3 right-4 text-xs">pripnuté</span>}
                  <p className="eyebrow">Chorobopis · pravý klik sem</p>
                  <p className="font-display text-2xl font-extrabold uppercase">{jakub.nazov}</p>
                  <p className="font-display text-5xl font-extrabold leading-none">{jakub.cislo}</p>
                </article>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuLabel>{jakub.nazov}</ContextMenuLabel>
                <ContextMenuItem className={POLOZKA} onSelect={() => kit('Detail (ukážka)')}>
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" /> Otvoriť detail
                  <ContextMenuShortcut>↵</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem className={POLOZKA} onSelect={() => kit(`Skopírované: ${jakub.cislo}`)}>
                  <Copy className="mr-2 h-4 w-4" aria-hidden="true" /> Kopírovať číslo
                </ContextMenuItem>
                <ContextMenuSub>
                  <ContextMenuSubTrigger className={POLOZKA}>
                    <Share2 className="mr-2 h-4 w-4" aria-hidden="true" /> Zdieľať
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-52">
                    <ContextMenuItem className={POLOZKA} onSelect={() => kit('Odkaz (ukážka)')}>
                      Kopírovať odkaz
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuCheckboxItem className={POLOZKA} checked={pripnute} onCheckedChange={setPripnute}>
                  Pripnúť navrch
                </ContextMenuCheckboxItem>
                <ContextMenuSeparator />
                <ContextMenuLabel inset>Zobrazenie</ContextMenuLabel>
                <ContextMenuRadioGroup value={pohlad} onValueChange={setPohlad}>
                  <ContextMenuRadioItem value="karta" className={POLOZKA}>
                    karta
                  </ContextMenuRadioItem>
                  <ContextMenuRadioItem value="riadok" className={POLOZKA}>
                    riadok
                  </ContextMenuRadioItem>
                </ContextMenuRadioGroup>
                <ContextMenuSeparator />
                <ContextMenuItem inset disabled className={POLOZKA}>
                  Upraviť · iba Adam
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <dl className="grid gap-1 font-mono text-sm md:w-56">
              <dt className="text-ink/60">pripnuté</dt>
              <dd>{pripnute ? 'áno' : 'nie'}</dd>
              <dt className="text-ink/60">zobrazenie</dt>
              <dd>{pohlad}</dd>
            </dl>
          </div>
        </Blok>
      </Kus>
    </>
  );
}
