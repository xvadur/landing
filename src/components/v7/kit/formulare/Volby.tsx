/** Kit · Formuláre: checkbox, radio-group, switch, slider, rating. */
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Rating } from '@/components/ui/rating';
import { Label } from '@/components/ui/label';
import { RIESENIA } from '@/components/konzultacia/data';
import { NEWSLETTER } from '@/data/ponuka';
import { Bunka, Kus, Mriezka, Recept, Stav } from './Spolocne';

/** Riadok s ovládačom a popisom: cieľ dotyku ≥ 44 px drží celý riadok, nie 20 px štvorček. */
const RIADOK = 'flex min-h-11 cursor-pointer items-center gap-3 font-medium normal-case tracking-normal text-base';

const PRINES = [
  'jeden príklad úlohy, ktorú chceš zlepšiť',
  'ukážku toho, ako vyzerá dobrý výsledok',
  'ako často úlohu robíš',
  'v čom dnes pracuješ',
];

const BOLEST = ['žiadna', 'občas', 'otravuje', 'brzdí ma', 'stojím', 'horí'];

export default function Volby() {
  const [prines, setPrines] = useState<string[]>([PRINES[0]!]);
  const [suhlas, setSuhlas] = useState(false);
  const [triaz, setTriaz] = useState('');
  const [pripomen, setPripomen] = useState(true);
  const [vydanie, setVydanie] = useState(false);
  const [hodiny, setHodiny] = useState([6]);
  const [okno, setOkno] = useState([14, 19]);
  const [bolest, setBolest] = useState(4);
  const [hover, setHover] = useState<number | null>(null);

  const vsetko = prines.length === PRINES.length ? true : prines.length === 0 ? false : 'indeterminate';
  const diagnoza = RIESENIA.find((r) => r.pozorovanie === triaz);
  const b = hover ?? bolest;

  return (
    <div className="flex flex-col gap-16">
      <Kus
        id="checkbox"
        meno="checkbox"
        veta="Zaškrtávacie políčko (Radix): checked, unchecked, indeterminate, disabled. Tieň sa pri hoveri zatlačí."
      >
        <Mriezka>
          <Bunka nazov="unchecked · checked · indeterminate">
            <Checkbox aria-label="Nezaškrtnuté" />
            <Checkbox defaultChecked aria-label="Zaškrtnuté" />
            <Checkbox checked="indeterminate" aria-label="Neurčité" />
          </Bunka>
          <Bunka nazov="disabled · disabled checked">
            <Checkbox disabled aria-label="Vypnuté" />
            <Checkbox disabled defaultChecked aria-label="Vypnuté zaškrtnuté" />
          </Bunka>
          <Bunka nazov="s Label (cieľ 44 px)">
            <Label className={RIADOK}>
              <Checkbox defaultChecked /> Súhlasím s tykaním
            </Label>
          </Bunka>
        </Mriezka>
        <Recept nazov="čo si priniesť na vyšetrenie (VSTUP_TEXT)">
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-2 font-bold">Na vyšetrenie si prines:</legend>
            <Label className={RIADOK}>
              <Checkbox
                checked={vsetko}
                onCheckedChange={(c) => setPrines(c === true ? [...PRINES] : [])}
              />
              <span className="font-bold">všetko naraz</span>
            </Label>
            {PRINES.map((p) => (
              <Label key={p} className={`${RIADOK} pl-6`}>
                <Checkbox
                  checked={prines.includes(p)}
                  onCheckedChange={(c) => setPrines((xs) => (c === true ? [...xs, p] : xs.filter((x) => x !== p)))}
                />
                {p}
              </Label>
            ))}
            <Label className={`${RIADOK} mt-3 border-t-3 border-ink pt-3`}>
              <Checkbox checked={suhlas} onCheckedChange={(c) => setSuhlas(c === true)} />
              Súhlasím so spracovaním e-mailu kvôli termínu.
            </Label>
          </fieldset>
          <Stav>
            rodič = {String(vsetko)} · súhlas = {String(suhlas)}
          </Stav>
        </Recept>
      </Kus>

      <Kus
        id="radio-group"
        meno="radio-group"
        veta="Jedna voľba zo skupiny (Radix): šípky presúvajú výber, orientation pre klávesnicu, disabled na skupine aj položke."
      >
        <Mriezka>
          <Bunka nazov="zvislo (default)" stlpec>
            <RadioGroup defaultValue="30" aria-label="Dĺžka">
              {['15', '30', '60'].map((v) => (
                <Label key={v} className={RIADOK}>
                  <RadioGroupItem value={v} /> {v} minút
                </Label>
              ))}
            </RadioGroup>
          </Bunka>
          <Bunka nazov='orientation="horizontal"' stlpec>
            <RadioGroup defaultValue="ut" orientation="horizontal" className="flex flex-wrap gap-x-5" aria-label="Deň">
              {['po', 'ut', 'st', 'št', 'pi'].map((v) => (
                <Label key={v} className={RIADOK}>
                  <RadioGroupItem value={v} /> {v}
                </Label>
              ))}
            </RadioGroup>
          </Bunka>
          <Bunka nazov="disabled položka · disabled skupina" stlpec>
            <RadioGroup defaultValue="a" aria-label="Formát">
              <Label className={RIADOK}>
                <RadioGroupItem value="a" /> Online
              </Label>
              <Label className={RIADOK}>
                <RadioGroupItem value="b" disabled /> Osobne (zatiaľ nie)
              </Label>
            </RadioGroup>
            <RadioGroup defaultValue="x" disabled aria-label="Vypnuté">
              <Label className={RIADOK}>
                <RadioGroupItem value="x" /> celá skupina vypnutá
              </Label>
            </RadioGroup>
          </Bunka>
        </Mriezka>
        <Recept nazov="triáž → diagnóza (RIESENIA, konzultácia)">
          <p className="font-bold">Čo z toho najviac sedí na tvoju úlohu?</p>
          <RadioGroup value={triaz} onValueChange={setTriaz} aria-label="Triáž" className="gap-1">
            {RIESENIA.map((r) => (
              <Label key={r.pozorovanie} className={RIADOK}>
                <RadioGroupItem value={r.pozorovanie} />
                {r.pozorovanie}
              </Label>
            ))}
          </RadioGroup>
          {diagnoza && (
            <div className="rounded-lg border-3 border-ink bg-white p-4" role="status">
              <p className="font-mono text-xs font-bold uppercase">Diagnóza</p>
              <p className="text-lg font-bold">{diagnoza.krok}</p>
              <p>{diagnoza.dovod}</p>
            </div>
          )}
        </Recept>
      </Kus>

      <Kus
        id="switch"
        meno="switch"
        veta="Vypínač (Radix Switch) pre okamžité nastavenia: zapnutý sčernie, jazdec skočí doprava."
      >
        <Mriezka>
          <Bunka nazov="off · on">
            <Switch aria-label="Vypnutý" />
            <Switch defaultChecked aria-label="Zapnutý" />
          </Bunka>
          <Bunka nazov="disabled · disabled on">
            <Switch disabled aria-label="Vypnutý, nedostupný" />
            <Switch disabled defaultChecked aria-label="Zapnutý, nedostupný" />
          </Bunka>
          <Bunka nazov="s Label">
            <Label className={RIADOK}>
              <Switch defaultChecked /> Tmavá ordinácia
            </Label>
          </Bunka>
        </Mriezka>
        <Recept nazov="nastavenia po rezervácii">
          <div className="flex flex-col gap-2">
            <Label className={`${RIADOK} justify-between rounded-lg border-3 border-ink bg-white px-4 py-2`}>
              Pripomenúť deň vopred e-mailom
              <Switch checked={pripomen} onCheckedChange={setPripomen} />
            </Label>
            <Label className={`${RIADOK} justify-between rounded-lg border-3 border-ink bg-white px-4 py-2`}>
              <span>
                Zapísať ma do {NEWSLETTER.nazov}
                <span className="block text-sm text-muted-foreground">{NEWSLETTER.popis}</span>
              </span>
              <Switch checked={vydanie} onCheckedChange={setVydanie} />
            </Label>
          </div>
          <Stav>
            pripomienka = {String(pripomen)} · vydanie = {String(vydanie)}
          </Stav>
        </Recept>
      </Kus>

      <Kus
        id="slider"
        meno="slider"
        veta="Vlastný posuvník s pružinou (jelly): jeden alebo dva jazdce, krok, zvislo, stiffness / damping / mass menia charakter pohybu."
        pozor={['bez name/form: do formulára ručne']}
      >
        <Mriezka>
          <Bunka nazov="jeden jazdec · default" stlpec>
            <Slider defaultValue={[40]} aria-label="Hodnota" />
          </Bunka>
          <Bunka nazov="dva jazdce (rozsah)" stlpec>
            <Slider defaultValue={[20, 70]} aria-label="Rozsah" />
          </Bunka>
          <Bunka nazov="step={25}" stlpec>
            <Slider defaultValue={[50]} step={25} aria-label="Krok 25" />
          </Bunka>
          <Bunka nazov="rosol: stiffness 120 · damping 8" stlpec>
            <Slider defaultValue={[30]} stiffness={120} damping={8} aria-label="Mäkká pružina" />
          </Bunka>
          <Bunka nazov="tvrdý: stiffness 900 · damping 60" stlpec>
            <Slider defaultValue={[70]} stiffness={900} damping={60} aria-label="Tvrdá pružina" />
          </Bunka>
          <Bunka nazov='orientation="vertical" · disabled'>
            <div className="flex h-40 gap-10 px-4">
              <Slider orientation="vertical" defaultValue={[60]} aria-label="Zvislý" />
              <Slider orientation="vertical" defaultValue={[30]} disabled aria-label="Vypnutý" />
            </div>
          </Bunka>
        </Mriezka>
        <Recept nazov="anamnéza: koľko času úloha berie">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="font-bold">
                Koľko hodín týždenne ti úloha zožerie? <span className="font-mono">{hodiny[0]} h</span>
              </p>
              <Slider value={hodiny} onValueChange={setHodiny} min={0} max={20} aria-label="Hodiny týždenne" />
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-bold">
                Kedy sa ti hodí? <span className="font-mono">{okno[0]}:00 – {okno[1]}:00</span>
              </p>
              <Slider value={okno} onValueChange={setOkno} min={14} max={19} aria-label="Okno vyšetrenia" />
            </div>
          </div>
          <Stav>Ordinačné hodiny sú 14:00 – 19:00 (src/data/terminy.ts), preto min 14 a max 19.</Stav>
        </Recept>
      </Kus>

      <Kus
        id="rating"
        meno="rating"
        veta="Hodnotenie ikonami: hviezda, srdce, kruh; 4 veľkosti, max, polovičky (precision 0.5), readOnly, disabled, onHoverChange."
        pozor={['polovičky iba šípkami, klik dá celé číslo']}
      >
        <Mriezka>
          <Bunka nazov='icon="star" · "heart" · "circle"' stlpec>
            <Rating defaultValue={4} />
            <Rating defaultValue={3} icon="heart" />
            <Rating defaultValue={2} icon="circle" />
          </Bunka>
          <Bunka nazov="size sm · md · lg · xl" stlpec>
            <Rating defaultValue={3} size="sm" />
            <Rating defaultValue={3} size="md" />
            <Rating defaultValue={3} size="lg" />
            <Rating defaultValue={3} size="xl" />
          </Bunka>
          <Bunka nazov="precision 0.5 · readOnly · disabled · max 10" stlpec>
            <Rating defaultValue={3.5} precision={0.5} size="lg" />
            <Rating value={5} readOnly size="lg" />
            <Rating defaultValue={2} disabled size="lg" />
            <Rating defaultValue={7} max={10} icon="circle" size="sm" />
          </Bunka>
        </Mriezka>
        <Recept nazov="škála bolesti 0–10 (ako na príjme)">
          <p className="font-bold">Ako veľmi ťa tá úloha bolí?</p>
          <div className="overflow-x-auto pb-1">
            <Rating
              value={bolest}
              onChange={setBolest}
              onHoverChange={setHover}
              max={10}
              icon="circle"
              size="xl"
              className="gap-1 [&_button]:min-h-11 [&_button]:min-w-8 [&_button]:text-stamp"
            />
          </div>
          <p className="font-mono text-lg font-bold" aria-live="polite">
            {b} / 10 · {BOLEST[Math.min(5, Math.round(b / 2))]}
          </p>
        </Recept>
      </Kus>
    </div>
  );
}
