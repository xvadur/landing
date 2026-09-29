/** Katalóg V7 · sticker.tsx: Sticker, Stamp, StickyNote vo všetkých variantoch (cva) a prepínačoch. */
import { Sticker, Stamp, StickyNote } from '@/components/ui/sticker';
import { CESTA } from '@/data/cesta';
import { VLAJKA, PRODUKTY } from '@/data/ponuka';
import { NALEPKA_NEMOCNICA } from '@/components/hero/hero-data';
import { Bunka, Chyba, Kus, Pod } from './Spolocne';

const ST_VAR = ['default', 'primary', 'secondary', 'destructive', 'outline', 'neon'] as const;
const ST_SIZE = ['sm', 'default', 'lg', 'xl'] as const;
const ST_ROT = ['none', 'slight', 'medium', 'heavy', 'slight-right', 'medium-right', 'heavy-right'] as const;
const ST_SHADOW = ['none', 'default', 'colored', 'double'] as const;

const SP_VAR = ['default', 'secondary', 'accent', 'destructive', 'outline'] as const;
const SP_SIZE = ['sm', 'default', 'lg', 'xl'] as const;
const SP_ROT = ['none', 'slight', 'medium', 'heavy'] as const;

const SN_VAR = ['yellow', 'pink', 'blue', 'green', 'purple'] as const;
const SN_TOKEN: Record<(typeof SN_VAR)[number], string> = {
  yellow: 'bg-accent = hot',
  pink: 'bg-primary = ink',
  blue: 'bg-info = white',
  green: 'bg-success = yellow',
  purple: 'bg-secondary = yellow',
};
const SN_SIZE = ['sm', 'default', 'lg'] as const;
const SN_ROT = ['none', 'left', 'right', 'tilt-left', 'tilt-right'] as const;

export default function Nalepky() {
  return (
    <Kus
      id="sticker"
      meno="sticker"
      subor="src/components/ui/sticker.tsx · Sticker, Stamp, StickyNote (+ stickerVariants, stampVariants, stickyNoteVariants)"
      pocet="3 komponenty"
      veta="Nalepené štítky, okrúhle pečiatky a lístočky: dôkaz (OVERENÉ), stav (V STAVBE, NOVÉ), citát z príbehu, poznámka k cene. Na hero sú to „nálepky na fotke“."
    >
      <Chyba>
        Sticker <code>default</code>, Stamp <code>accent</code> a StickyNote <code>yellow</code> dávajú <strong>paper text na hot</strong> (3,2 : 1),
        lebo <code>--color-accent-foreground</code> v tokens.css je paper. Zákon: text na hot je vždy ink → v kombináciách nižšie
        <code> className=&quot;text-ink&quot;</code>. Variant <code>neon</code> má natvrdo hex <code>#ff2d78</code> (pastelová ružová) — na webe nepoužívať.
        StickyNote mená farieb nesedia: „yellow“ je hot, „pink“ je ink, „blue“ je biela.
      </Chyba>

      <Pod poznamka="variant × size (rotation none, shadow default).">Sticker · varianty a veľkosti</Pod>
      <div className="overflow-x-auto rounded-lg border-3 border-ink bg-white p-4">
        <table className="w-full min-w-[640px] border-separate border-spacing-3 text-left">
          <thead>
            <tr className="font-mono text-xs">
              <th />
              {ST_SIZE.map((s) => (
                <th key={s}>size=&quot;{s}&quot;</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ST_VAR.map((v) => (
              <tr key={v}>
                <th className="font-mono text-xs font-normal">
                  {v}
                  {v === 'neon' ? <span className="block font-bold">hex!</span> : null}
                </th>
                {ST_SIZE.map((s) => (
                  <td key={s} className="py-2">
                    <Sticker variant={v} size={s} rotation="none">
                      Triáž
                    </Sticker>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pod poznamka="rotation (7 hodnôt) a shadow (4 hodnoty); primary aj colored/double tiene sú v tokenoch ink, takže vyzerajú rovnako ako default.">
        Sticker · rotácia a tieň
      </Pod>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {ST_ROT.map((r) => (
          <Bunka key={r} popis={<>rotation=&quot;{r}&quot;</>}>
            <Sticker variant="secondary" rotation={r}>
              Vyšetrenie
            </Sticker>
          </Bunka>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ST_SHADOW.map((s) => (
          <Bunka key={s} popis={<>shadow=&quot;{s}&quot;</>}>
            <Sticker variant="outline" shadow={s}>
              Diagnóza
            </Sticker>
          </Bunka>
        ))}
      </div>

      <Pod poznamka="dashed = čiarkovaný obrys okolo (::before), tape = páska hore (::after, bg-accent/80 = hot), interactive = na hover/klik sa „zatlačí“ (bez tieňa).">
        Sticker · prepínače
      </Pod>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Bunka popis="dashed">
          <Sticker variant="outline" dashed>
            Čakáreň
          </Sticker>
        </Bunka>
        <Bunka popis="tape">
          <Sticker variant="secondary" tape className="mt-3">
            Nové
          </Sticker>
        </Bunka>
        <Bunka popis="interactive (hover / klik)">
          <Sticker variant="primary" interactive tabIndex={0} role="button" className="min-h-11">
            Klikni
          </Sticker>
        </Bunka>
        <Bunka popis="dashed + tape + heavy">
          <Sticker variant="secondary" dashed tape rotation="heavy" className="mt-3">
            V stavbe
          </Sticker>
        </Bunka>
      </div>

      <Pod poznamka="Okrúhla pečiatka, rám border-4, tieň 4/4. variant × size, rotation, doubleRing (ring-2 s odsadením).">Stamp</Pod>
      <div className="overflow-x-auto rounded-lg border-3 border-ink bg-white p-4">
        <table className="w-full min-w-[640px] border-separate border-spacing-4 text-left">
          <thead>
            <tr className="font-mono text-xs">
              <th />
              {SP_SIZE.map((s) => (
                <th key={s}>size=&quot;{s}&quot;</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SP_VAR.map((v) => (
              <tr key={v}>
                <th className="font-mono text-xs font-normal">{v}</th>
                {SP_SIZE.map((s) => (
                  <td key={s} className="py-2">
                    <Stamp variant={v} size={s}>
                      Overené
                    </Stamp>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {SP_ROT.map((r) => (
          <Bunka key={r} popis={<>rotation=&quot;{r}&quot;</>}>
            <Stamp variant="destructive" rotation={r} size="sm">
              ✚
            </Stamp>
          </Bunka>
        ))}
        <Bunka popis="doubleRing">
          <Stamp variant="outline" doubleRing size="sm">
            47/47
          </Stamp>
        </Bunka>
      </div>

      <Pod poznamka="Lístoček: variant (mená farieb z pôvodného kitu, v tokenoch iné), size, rotation, pin (špendlík bg-destructive = stamp), folded (zahnutý roh, default áno).">
        StickyNote
      </Pod>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {SN_VAR.map((v) => (
          <Bunka key={v} popis={<>variant=&quot;{v}&quot; · {SN_TOKEN[v]}</>} className="[&>div]:py-6">
            <StickyNote variant={v} size="sm">
              Triáž o 14:00
            </StickyNote>
          </Bunka>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {SN_ROT.map((r) => (
          <Bunka key={r} popis={<>rotation=&quot;{r}&quot;</>} className="[&>div]:py-6">
            <StickyNote variant="green" rotation={r} size="sm">
              Diagnóza
            </StickyNote>
          </Bunka>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        {SN_SIZE.map((s) => (
          <Bunka key={s} popis={<>size=&quot;{s}&quot;</>} className="[&>div]:py-6">
            <StickyNote variant="blue" size={s} rotation="none">
              Plán liečby
            </StickyNote>
          </Bunka>
        ))}
        <Bunka popis="pin · folded={false}" className="[&>div]:py-6">
          <StickyNote variant="blue" pin folded={false} rotation="right" size="sm">
            Chorobopis
          </StickyNote>
        </Bunka>
      </div>

      <Pod poznamka="Nástenka vyšetrenia: texty z ponuka.ts, cesta.ts a hero-data.ts.">Kombinácia s Adamovým obsahom</Pod>
      <div className="relative grid gap-8 overflow-hidden rounded-lg border-3 border-ink bg-paper p-6 pt-10 tx-dots sm:grid-cols-2 lg:grid-cols-3">
        <StickyNote variant="green" pin rotation="left" size="lg" className="max-w-sm">
          <p className="font-mono text-xs uppercase">{VLAJKA.nazov} · {VLAJKA.trvanie}</p>
          <p className="mt-2 font-display text-xl leading-tight font-extrabold">{VLAJKA.titulok}</p>
        </StickyNote>
        <StickyNote variant="blue" pin rotation="right" className="max-w-sm">
          <p className="font-serif text-xl leading-snug italic">„{CESTA[1].citat}“</p>
          <p className="mt-3 font-mono text-xs uppercase">
            {CESTA[1].kedy} · {CESTA[1].nazov}
          </p>
        </StickyNote>
        <div className="flex flex-wrap items-center justify-center gap-6 py-4">
          <Stamp variant="destructive" size="lg" doubleRing>
            Overené
          </Stamp>
          <Sticker variant="secondary" rotation="heavy-right" tape size="lg">
            {NALEPKA_NEMOCNICA}
          </Sticker>
          <Sticker variant="default" className="text-ink" rotation="slight">
            {VLAJKA.cena}
          </Sticker>
          {PRODUKTY.slice(0, 2).map((p, i) => (
            <Sticker key={p.id} variant="outline" rotation={i ? 'slight-right' : 'slight'} dashed size="sm">
              {p.nalepka}
            </Sticker>
          ))}
        </div>
      </div>
    </Kus>
  );
}
