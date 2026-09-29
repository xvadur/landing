/** Kit · Formuláre: select, native-select, combobox, tag-input. */
import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NativeSelect } from '@/components/ui/native-select';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxMultiTrigger,
  ComboboxSeparator,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import { TagInput } from '@/components/ui/tag-input';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { PRODUKTY, VLAJKA } from '@/data/ponuka';
import { cn } from '@/lib/utils';
import { Bunka, Kus, Mriezka, Recept, Stav } from './Spolocne';

/** Nástroje z domova V5.4 (src/components/v54/Nastroje.astro). */
const NASTROJE = [
  { v: 'claude-code', t: 'Claude Code', na: 'hlavný operačný stôl' },
  { v: 'codex', t: 'Codex', na: 'druhý chirurg' },
  { v: 'cloudflare', t: 'Cloudflare', na: 'weby, Workers, domény' },
  { v: 'supabase', t: 'Supabase', na: 'CRM a databázy' },
  { v: 'linear', t: 'Linear', na: 'úlohy od príjmu po odovzdanie' },
  { v: 'telegram', t: 'Telegram', na: 'agent vo vrecku klienta' },
  { v: 'astro', t: 'Astro', na: 'rýchle weby' },
  { v: 'resend', t: 'Resend', na: 'potvrdenia e-mailom' },
  { v: 'python', t: 'Python', na: 'crawlery, korpusy' },
  { v: 'notion', t: 'Notion', na: 'archív a databázy' },
];
const BEZNE = [
  { v: 'excel', t: 'Excel' },
  { v: 'gmail', t: 'Gmail' },
  { v: 'whatsapp', t: 'WhatsApp' },
];

/** Položka výberu: fokus v BoldKite je bg-accent (hot) s paper textom → porušenie; tu žltá s ink. */
const POLOZKA = 'focus:bg-yellow focus:text-ink min-h-11';

export default function Vybery() {
  const [tema, setTema] = useState<string>('');
  const [nastroj, setNastroj] = useState('');
  const [open1, setOpen1] = useState(false);
  const [viac, setViac] = useState<string[]>(['claude-code', 'telegram']);
  const [open2, setOpen2] = useState(false);
  const [tagy, setTagy] = useState<string[]>(['Excel', 'Gmail']);

  const vsetky = [...NASTROJE, ...BEZNE];
  const meno = (v: string) => vsetky.find((n) => n.v === v)?.t ?? v;
  const vybranaTema = [VLAJKA, ...PRODUKTY].find((p) => ('id' in p ? p.id : 'vysetrenie') === tema);

  return (
    <div className="flex flex-col gap-16">
      <Kus
        id="select"
        meno="select"
        veta="Rozbaľovací výber (Radix Select) s vlastným zoznamom: skupiny, popisy, oddeľovač, vypnuté položky, dve polohy zoznamu."
        pozor={['fokus položky = bg-accent (hot) + paper text → prepíš className', 'SelectLabel pl-8 aj bez ikony']}
      >
        <Mriezka>
          <Bunka nazov="placeholder" stlpec>
            <Select>
              <SelectTrigger aria-label="Dĺžka">
                <SelectValue placeholder="Vyber dĺžku" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className={POLOZKA} value="30">
                  30 minút
                </SelectItem>
                <SelectItem className={POLOZKA} value="60" disabled>
                  60 minút (zatiaľ nie)
                </SelectItem>
              </SelectContent>
            </Select>
          </Bunka>
          <Bunka nazov="skupiny · label · separator" stlpec>
            <Select defaultValue="telegram">
              <SelectTrigger aria-label="Nástroj">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Operačný stôl</SelectLabel>
                  {NASTROJE.slice(0, 3).map((n) => (
                    <SelectItem className={POLOZKA} key={n.v} value={n.v}>
                      {n.t}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>U klienta</SelectLabel>
                  {NASTROJE.slice(3, 6).map((n) => (
                    <SelectItem className={POLOZKA} key={n.v} value={n.v}>
                      {n.t}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Bunka>
          <Bunka nazov='position="item-aligned" · disabled' stlpec>
            <Select defaultValue="st">
              <SelectTrigger aria-label="Deň">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                {['po', 'ut', 'st', 'št', 'pi'].map((d) => (
                  <SelectItem className={POLOZKA} key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger aria-label="Vypnutý">
                <SelectValue placeholder="Vypnutý výber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x">x</SelectItem>
              </SelectContent>
            </Select>
          </Bunka>
        </Mriezka>
        <Recept nazov="s čím prichádzaš (ponuka.ts)">
          <Field className="max-w-xl">
            <FieldLabel htmlFor="kit-tema-sel">Čo ťa zaujíma</FieldLabel>
            <Select value={tema} onValueChange={setTema}>
              <SelectTrigger id="kit-tema-sel" className="bg-white">
                <SelectValue placeholder="Vyber jednu vec" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className={POLOZKA} value="vysetrenie">
                  {VLAJKA.nazov} · {VLAJKA.trvanie}
                </SelectItem>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Čakáreň</SelectLabel>
                  {PRODUKTY.map((p) => (
                    <SelectItem className={POLOZKA} key={p.id} value={p.id}>
                      {p.nazov}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              {vybranaTema ? ('popis' in vybranaTema ? vybranaTema.popis : vybranaTema.titulok) : 'Vyber a ukážem popis.'}
            </FieldDescription>
          </Field>
        </Recept>
      </Kus>

      <Kus
        id="native-select"
        meno="native-select"
        veta="Natívny <select> v rámčeku: najľahší, systémový zoznam na mobile, vie optgroup a formulár bez JS."
        pozor={['uppercase natvrdo aj pre hodnoty']}
      >
        <Mriezka>
          <Bunka nazov="default" stlpec>
            <NativeSelect aria-label="Deň" defaultValue="st">
              {['po', 'ut', 'st', 'št', 'pi'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </NativeSelect>
          </Bunka>
          <Bunka nazov="optgroup" stlpec>
            <NativeSelect aria-label="Nástroj" defaultValue="linear">
              <optgroup label="Operačný stôl">
                {NASTROJE.slice(0, 3).map((n) => (
                  <option key={n.v} value={n.v}>
                    {n.t}
                  </option>
                ))}
              </optgroup>
              <optgroup label="U klienta">
                {NASTROJE.slice(3, 6).map((n) => (
                  <option key={n.v} value={n.v}>
                    {n.t}
                  </option>
                ))}
              </optgroup>
            </NativeSelect>
          </Bunka>
          <Bunka nazov="disabled · normal-case" stlpec>
            <NativeSelect disabled aria-label="Vypnutý">
              <option>vypnutý</option>
            </NativeSelect>
            <NativeSelect aria-label="Bez kriku" className="font-medium normal-case tracking-normal">
              <option>Pondelok</option>
              <option>Utorok</option>
            </NativeSelect>
          </Bunka>
        </Mriezka>
        <Recept nazov="záložný formulár bez JavaScriptu">
          <form className="flex max-w-xl flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="kit-den-nat" className="font-bold">
              Deň vyšetrenia (Po–Pi)
            </label>
            <NativeSelect id="kit-den-nat" name="den" className="bg-white normal-case">
              {['Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok'].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </NativeSelect>
          </form>
        </Recept>
      </Kus>

      <Kus
        id="combobox"
        meno="combobox"
        veta="Výber s vyhľadávaním (Popover + cmdk Command): jeden alebo viac, čipy s odobratím, skupiny, prázdny stav."
        pozor={['hodnotu a popis v triggeri skladáš sám', 'čip = bg-accent (hot) mimo CTA', 'predvolené texty „Select...“ po anglicky']}
      >
        <Mriezka>
          <Bunka nazov="jeden · hľadanie · prázdny stav" stlpec>
            <Combobox open={open1} onOpenChange={setOpen1}>
              <ComboboxTrigger value={nastroj ? meno(nastroj) : ''} placeholder="Vyber nástroj" open={open1} aria-label="Nástroj" />
              <ComboboxContent className="w-(--radix-popover-trigger-width) min-w-64">
                <ComboboxInput placeholder="Hľadaj nástroj…" />
                <ComboboxList>
                  <ComboboxEmpty>Taký nástroj nepoužívam.</ComboboxEmpty>
                  <ComboboxGroup heading="Inštrumentár">
                    {NASTROJE.map((n) => (
                      <ComboboxItem
                        key={n.v}
                        value={n.t}
                        className="min-h-11"
                        onSelect={() => {
                          setNastroj(n.v);
                          setOpen1(false);
                        }}
                      >
                        <Check className={cn(nastroj === n.v ? 'opacity-100' : 'opacity-0')} />
                        <span className="font-bold">{n.t}</span>
                        <span className="ml-auto truncate text-xs text-muted-foreground">{n.na}</span>
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Bunka>
          <Bunka nazov="viac · čipy (ComboboxMultiTrigger)" stlpec className="sm:col-span-2">
            <Combobox open={open2} onOpenChange={setOpen2}>
              <ComboboxMultiTrigger
                values={viac.map((v) => ({ value: v, label: meno(v) }))}
                onRemove={(v) => setViac((xs) => xs.filter((x) => x !== v))}
                placeholder="V čom pracuješ?"
                open={open2}
                aria-label="Nástroje"
                className="[&>span]:bg-yellow"
              />
              <ComboboxContent className="min-w-64">
                <ComboboxInput placeholder="Hľadaj…" />
                <ComboboxList>
                  <ComboboxEmpty>Nič.</ComboboxEmpty>
                  <ComboboxGroup heading="Moje">
                    {NASTROJE.slice(0, 6).map((n) => (
                      <ComboboxItem
                        key={n.v}
                        value={n.t}
                        className="min-h-11"
                        onSelect={() => setViac((xs) => (xs.includes(n.v) ? xs.filter((x) => x !== n.v) : [...xs, n.v]))}
                      >
                        <Check className={cn(viac.includes(n.v) ? 'opacity-100' : 'opacity-0')} />
                        {n.t}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                  <ComboboxSeparator />
                  <ComboboxGroup heading="Bežné">
                    {BEZNE.map((n) => (
                      <ComboboxItem
                        key={n.v}
                        value={n.t}
                        className="min-h-11"
                        onSelect={() => setViac((xs) => (xs.includes(n.v) ? xs.filter((x) => x !== n.v) : [...xs, n.v]))}
                      >
                        <Check className={cn(viac.includes(n.v) ? 'opacity-100' : 'opacity-0')} />
                        {n.t}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Stav>values = [{viac.join(', ')}] · čipy prefarbené na žltú cez [&amp;&gt;span]:bg-yellow</Stav>
          </Bunka>
        </Mriezka>
      </Kus>

      <Kus
        id="tag-input"
        meno="tag-input"
        veta="Pole na štítky: Enter alebo oddeľovač pridá, Backspace zmaže, návrhy s klávesnicou, limit, vlastná kontrola, duplicity."
        pozor={['chybové hlášky po anglicky („Maximum 3 tags allowed“, „Tag already exists“)', 'štítky uppercase']}
      >
        <Mriezka>
          <Bunka nazov="default · Enter / čiarka" stlpec>
            <TagInput placeholder="Pridaj a stlač Enter" aria-label="Štítky" defaultValue={['príjem']} />
          </Bunka>
          <Bunka nazov="suggestions (napíš „cl“)" stlpec>
            <TagInput suggestions={NASTROJE.map((n) => n.t)} placeholder="Nástroj…" aria-label="Nástroje s návrhmi" />
          </Bunka>
          <Bunka nazov="maxTags={3}" stlpec>
            <TagInput maxTags={3} defaultValue={['Po', 'St', 'Pi']} aria-label="Najviac tri dni" />
          </Bunka>
          <Bunka nazov="validateTag (bez číslic)" stlpec>
            <TagInput validateTag={(t) => (/\d/.test(t) ? 'Bez číslic, prosím.' : true)} placeholder="skús „a1“" aria-label="Bez číslic" />
          </Bunka>
          <Bunka nazov="delimiter /[,;]/ · allowDuplicates" stlpec>
            <TagInput delimiter={/[,;]/} allowDuplicates placeholder="vlož „a;b,a“" aria-label="Oddeľovače" />
          </Bunka>
          <Bunka nazov="disabled" stlpec>
            <TagInput disabled defaultValue={['Telegram', 'CRM']} aria-label="Vypnuté štítky" />
          </Bunka>
        </Mriezka>
        <Recept nazov="anamnéza: v čom dnes pracuješ">
          <Field className="max-w-xl">
            <FieldLabel htmlFor="kit-tagy">Nástroje (najviac 5)</FieldLabel>
            <TagInput
              id="kit-tagy"
              value={tagy}
              onChange={setTagy}
              maxTags={5}
              suggestions={[...NASTROJE, ...BEZNE].map((n) => n.t)}
              placeholder="Napr. Excel, Gmail…"
              className="bg-white"
            />
            <FieldDescription>Z toho vyjde, kam agenta pripojiť: kalendár, CRM, e-mail.</FieldDescription>
          </Field>
          <Stav>value = [{tagy.join(', ')}]</Stav>
        </Recept>
      </Kus>
    </div>
  );
}
