/** Katalóg vendor · neobrutalism.dev (2/3): Input, Textarea, Select, RadioGroup (+ RadioGroupCard), Progress. */
import { useEffect, useState } from 'react';
import { Input } from '@/components/vendor/neobrutalism/input';
import { Textarea } from '@/components/vendor/neobrutalism/textarea';
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
import { RadioGroup, RadioGroupCard, RadioGroupItem } from '@/components/vendor/neobrutalism/radio-group';
import { Progress, ProgressLabel, ProgressValue } from '@/components/vendor/neobrutalism/progress';
import { Button } from '@/components/vendor/neobrutalism/button';
import { LAKADLO, NEWSLETTER, PRODUKTY, VLAJKA } from '@/data/ponuka';
import { Kus, Mriezka, Realne, Varianta, Zakazane } from './shared';

export default function NeoFormular() {
  const [krok, setKrok] = useState(1);
  const [pct, setPct] = useState(20);
  // Progress: indikátor sa posúva springom z theme.css — ukážka striedania hodnôt
  useEffect(() => {
    const t = setInterval(() => setPct((p) => (p >= 100 ? 20 : p + 20)), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ---------------- Input ---------------- */}
      <Kus
        id="nb-input"
        nazov="Input"
        subor="vendor/neobrutalism/input.tsx"
        veta="Pole 48 px, text 16 px (iOS bez zoomu), tieň rastie pri fokuse, chyba cez aria-invalid."
      >
        <Mriezka cols={2}>
          <Varianta props='type="email" · placeholder'>
            <label className="grid w-full gap-2">
              <span className="eyebrow">E-mail</span>
              <Input type="email" placeholder="ty@firma.sk" />
            </label>
          </Varianta>
          <Varianta props='aria-invalid="true"'>
            <label className="grid w-full gap-2">
              <span className="eyebrow">E-mail (chyba)</span>
              <Input type="email" defaultValue="ty@firma" aria-invalid="true" />
            </label>
          </Varianta>
          <Varianta props="disabled">
            <Input disabled defaultValue="Zatvorené" aria-label="Zatvorené pole" />
          </Varianta>
          <Varianta props='type="file" (file: display písmo)'>
            <Input type="file" aria-label="Súbor" />
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- Textarea ---------------- */}
      <Kus
        id="nb-textarea"
        nazov="Textarea"
        subor="vendor/neobrutalism/textarea.tsx"
        veta="Viacriadkové pole s rovnakým rámom a stavmi ako Input, min. výška 8 rem."
      >
        <Mriezka cols={3}>
          <Varianta props="default">
            <Textarea aria-label="Čo ťa bolí" placeholder="Jedna úloha, ktorá sa opakuje…" />
          </Varianta>
          <Varianta props='aria-invalid="true"'>
            <Textarea aria-label="Chyba" aria-invalid="true" defaultValue="Príliš krátke." />
          </Varianta>
          <Varianta props="disabled">
            <Textarea aria-label="Zatvorené" disabled defaultValue="Zápis je zatvorený." />
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- Select ---------------- */}
      <Kus
        id="nb-select"
        nazov="Select"
        subor="vendor/neobrutalism/select.tsx"
        veta="Výber zo zoznamu (Radix): spúšťač ako Input, popover brutal, skupiny, štítky, delič, zakázaná položka."
      >
        <Mriezka cols={3}>
          {(['white', 'yellow', 'paper'] as const).map((t) => (
            <Varianta key={t} props={`SelectTrigger tone="${t}"`}>
              <Select>
                <SelectTrigger tone={t} aria-label={`Výber ${t}`}>
                  <SelectValue placeholder="Vyber termín" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="po">Pondelok 14:00</SelectItem>
                  <SelectItem value="ut">Utorok 16:00</SelectItem>
                  <SelectItem value="pi" disabled>
                    Piatok (obsadené)
                  </SelectItem>
                </SelectContent>
              </Select>
            </Varianta>
          ))}
          <Varianta props='SelectContent position="item-aligned" · disabled trigger'>
            <Select defaultValue="b">
              <SelectTrigger aria-label="Item-aligned">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem value="a">Príjem</SelectItem>
                <SelectItem value="b">Diagnóza</SelectItem>
                <SelectItem value="c">Liečba</SelectItem>
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger aria-label="Zakázaný výber">
                <SelectValue placeholder="disabled" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x">x</SelectItem>
              </SelectContent>
            </Select>
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- RadioGroup ---------------- */}
      <Kus
        id="nb-radio"
        nazov="RadioGroup · RadioGroupItem · RadioGroupCard"
        subor="vendor/neobrutalism/radio-group.tsx"
        veta="Jedna voľba z viacerých: kruh 24 px s dotykovou plochou 44 px, alebo celá karta ako cieľ (kvíz)."
      >
        <Mriezka cols={3}>
          <Varianta props="RadioGroupItem · orientation vertikálne (grid)">
            <RadioGroup defaultValue="a" aria-label="Kruhy">
              {['a', 'b'].map((v) => (
                <label key={v} className="flex min-h-11 items-center gap-3 font-medium">
                  <RadioGroupItem value={v} /> Voľba {v.toUpperCase()}
                </label>
              ))}
              <label className="flex min-h-11 items-center gap-3 font-medium">
                <RadioGroupItem value="c" disabled /> disabled
              </label>
            </RadioGroup>
          </Varianta>
          <Varianta props='orientation="horizontal" (className grid-flow-col)'>
            <RadioGroup defaultValue="30" orientation="horizontal" className="grid-flow-col" aria-label="Dĺžka">
              {['15', '30', '60'].map((v) => (
                <label key={v} className="flex min-h-11 items-center gap-2 font-mono">
                  <RadioGroupItem value={v} /> {v} min
                </label>
              ))}
            </RadioGroup>
          </Varianta>
          <Varianta props='aria-invalid · RadioGroupCard disabled'>
            <RadioGroup aria-label="Chyba" className="w-full">
              <label className="flex min-h-11 items-center gap-3">
                <RadioGroupItem value="x" aria-invalid="true" /> povinné
              </label>
              <RadioGroupCard value="y" disabled>
                Obsadené
              </RadioGroupCard>
            </RadioGroup>
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- Progress ---------------- */}
      <Kus
        id="nb-progress"
        nazov="Progress · ProgressLabel · ProgressValue"
        subor="vendor/neobrutalism/progress.tsx"
        veta="Pás postupu (Radix) s tónom a výškou; indikátor sa posúva springom, pri reduced motion skočí."
      >
        <Mriezka cols={3}>
          {(['hot', 'yellow', 'ink'] as const).map((t) => (
            <Varianta key={t} props={`tone="${t}" value={${pct}}`}>
              <div className="grid w-full gap-2">
                <div className="flex items-center">
                  <ProgressLabel>{t}</ProgressLabel>
                  <ProgressValue>{pct} %</ProgressValue>
                </div>
                <Progress tone={t} value={pct} aria-label={`Postup ${t}`} />
              </div>
            </Varianta>
          ))}
          {(['sm', 'default', 'lg'] as const).map((s) => (
            <Varianta key={s} props={`size="${s}" · value 0 / 60 / 100`}>
              <div className="grid w-full gap-3">
                <Progress size={s} value={0} aria-label="0 %" />
                <Progress size={s} value={60} aria-label="60 %" />
                <Progress size={s} value={100} aria-label="100 %" />
              </div>
            </Varianta>
          ))}
        </Mriezka>
        <Zakazane tony={['pink', 'lilac', 'lime', 'sky']} />
      </Kus>

      <Realne zdroj="ponuka.ts (VLAJKA, PRODUKTY, LAKADLO, NEWSLETTER) — zápis do čakárne (ukážka, neodosiela sa)">
        <form
          className="grid max-w-2xl gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setKrok((k) => Math.min(3, k + 1));
          }}
        >
          <div className="grid gap-2">
            <div className="flex items-center">
              <ProgressLabel>Krok {krok} z 3</ProgressLabel>
              <ProgressValue>{Math.round((krok / 3) * 100)} %</ProgressValue>
            </div>
            <Progress value={(krok / 3) * 100} tone="yellow" aria-label="Postup zápisu" />
          </div>
          <fieldset className="grid gap-3">
            <legend className="eyebrow mb-3">Čo chceš?</legend>
            <RadioGroup defaultValue="vysetrenie" aria-label="Čo chceš">
              <RadioGroupCard value="vysetrenie">
                {VLAJKA.nazov} · {VLAJKA.trvanie} · {VLAJKA.cena}
              </RadioGroupCard>
              <RadioGroupCard value={LAKADLO.id}>{LAKADLO.nazov}</RadioGroupCard>
              <RadioGroupCard value={NEWSLETTER.id}>{NEWSLETTER.nazov}: {NEWSLETTER.popis}</RadioGroupCard>
            </RadioGroup>
          </fieldset>
          <label className="grid gap-2">
            <span className="eyebrow">Čakáreň produktu</span>
            <Select defaultValue={PRODUKTY[0]?.id}>
              <SelectTrigger aria-label="Produkt">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Liečba</SelectLabel>
                  {PRODUKTY.slice(0, 2).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nazov}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Na samoštúdium</SelectLabel>
                  {PRODUKTY.slice(2).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nazov}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2">
            <span className="eyebrow">E-mail</span>
            <Input type="email" placeholder="ty@firma.sk" autoComplete="email" />
          </label>
          <label className="grid gap-2">
            <span className="eyebrow">Triáž: jedna úloha, ktorá sa opakuje</span>
            <Textarea placeholder={VLAJKA.body[0]} />
          </label>
          <Button type="submit" tone="hot" size="lg" className="w-fit">
            Zapísať sa
          </Button>
        </form>
      </Realne>
    </>
  );
}
