/** Katalóg V7 · ascii-shapes.tsx: 17 animovaných ASCII tvarov (textContent v <pre>, rAF, pauza mimo obrazovky a pri reduced motion).
 *  Props: size (sm/md/lg/hero), charset (blocks/braille/classic/line/dots), color, speed, animated, multicolor. */
import * as React from 'react';
import * as A from '@/components/ui/ascii-shapes';
import type { AsciiCharset, AsciiSize, AsciiSpeed, AsciiShapeProps } from '@/components/ui/ascii-shapes';
import { KORPUS } from '@/data/fakty';
import { Bunka, Opravene, FARBY, farbaCss, Kus, Panel, Pod, Prepinac, Vyber, type FarbaId } from './Spolocne';

type AsciiComp = React.ForwardRefExoticComponent<AsciiShapeProps & React.RefAttributes<HTMLPreElement>>;

const TVARY: { meno: string; C: AsciiComp; charset: AsciiCharset; co: string }[] = [
  { meno: 'AsciiSpiral', C: A.AsciiSpiral, charset: 'classic', co: 'rotujúca špirála' },
  { meno: 'AsciiRose', C: A.AsciiRose, charset: 'braille', co: 'ruža k = 5' },
  { meno: 'AsciiWave', C: A.AsciiWave, charset: 'classic', co: 'súčet 3 sínusov' },
  { meno: 'AsciiVortex', C: A.AsciiVortex, charset: 'blocks', co: 'vír' },
  { meno: 'AsciiPulse', C: A.AsciiPulse, charset: 'dots', co: 'kruhy z centra (pulz)' },
  { meno: 'AsciiMatrix', C: A.AsciiMatrix, charset: 'classic', co: 'padajúce stĺpce' },
  { meno: 'AsciiGrid', C: A.AsciiGrid, charset: 'line', co: 'mriežka s vlnou' },
  { meno: 'AsciiTorus', C: A.AsciiTorus, charset: 'blocks', co: '3D torus, z-buffer' },
  { meno: 'AsciiSphere', C: A.AsciiSphere, charset: 'classic', co: '3D guľa so svetlom' },
  { meno: 'AsciiCube', C: A.AsciiCube, charset: 'blocks', co: '3D kocka' },
  { meno: 'AsciiHelix', C: A.AsciiHelix, charset: 'braille', co: 'skrutkovica' },
  { meno: 'AsciiDonut', C: A.AsciiDonut, charset: 'classic', co: 'klasický donut.c' },
  { meno: 'AsciiTrefoilKnot', C: A.AsciiTrefoilKnot, charset: 'blocks', co: 'trojlístkový uzol' },
  { meno: 'AsciiGeodesicDome', C: A.AsciiGeodesicDome, charset: 'classic', co: 'geodetická kupola' },
  { meno: 'AsciiSaturn', C: A.AsciiSaturn, charset: 'blocks', co: 'planéta s prstencom' },
  { meno: 'AsciiHyperboloid', C: A.AsciiHyperboloid, charset: 'classic', co: 'hyperboloid' },
  { meno: 'AsciiDNA', C: A.AsciiDNA, charset: 'braille', co: 'dvojzávitnica DNA' },
];

const CHARSETY: AsciiCharset[] = ['blocks', 'braille', 'classic', 'line', 'dots'];
const ZNAKY: Record<AsciiCharset, string> = {
  blocks: '░ ▒ ▓ █',
  braille: '⠁ ⠃ ⠇ ⠿ ⠷',
  classic: '. : o * # @',
  line: '- / | \\ + X',
  dots: '. · • ●',
};
const VELKOSTI: AsciiSize[] = ['sm', 'md', 'lg', 'hero'];
const RYCHLOSTI: AsciiSpeed[] = ['slow', 'normal', 'fast'];

export default function Ascii() {
  const [charset, setCharset] = React.useState<AsciiCharset | 'vlastny'>('vlastny');
  const [speed, setSpeed] = React.useState<AsciiSpeed>('normal');
  const [animated, setAnimated] = React.useState(true);
  const [multicolor, setMulticolor] = React.useState(false);
  const [farba, setFarba] = React.useState<FarbaId | 'vychodzia'>('vychodzia');
  const [velky, setVelky] = React.useState<(typeof TVARY)[number]['meno']>('AsciiPulse');
  const [velkost, setVelkost] = React.useState<AsciiSize>('md');

  const Velky = TVARY.find((t) => t.meno === velky)!.C;

  return (
    <Kus
      id="ascii-shapes"
      meno="ascii-shapes"
      subor="src/components/ui/ascii-shapes.tsx · 17 tvarov · 5 znakových sád · 4 veľkosti"
      pocet="17 tvarov"
      veta="Matematické a 3D tvary vykreslené znakmi v <pre>: textúra monitora, pozadie hera, „živý“ prvok bez obrázka. Pod kapotou rAF, ktorý sa zastaví mimo obrazovky, v skrytom tabe a pri reduced motion."
    >
      <Panel>
        <Vyber
          label="charset"
          hodnoty={[{ id: 'vlastny' as const, label: 'východzí tvaru' }, ...CHARSETY.map((c) => ({ id: c, label: c }))]}
          hodnota={charset}
          onZmena={setCharset}
        />
        <Vyber
          label="color"
          hodnoty={[{ id: 'vychodzia' as const, label: 'currentColor' }, ...FARBY.filter((f) => f.id !== 'hot').map((f) => ({ id: f.id, label: f.label }))]}
          hodnota={farba}
          onZmena={setFarba}
        />
        <div className="flex flex-col gap-3">
          <Vyber label="speed" hodnoty={RYCHLOSTI} hodnota={speed} onZmena={setSpeed} />
          <div className="flex flex-wrap gap-2">
            <Prepinac label="animated" zap={animated} onZmena={setAnimated} />
            <Prepinac label="multicolor" zap={multicolor} onZmena={setMulticolor} />
          </div>
        </div>
      </Panel>
      <Opravene>
        <code>multicolor</code> strieda čitateľné tokeny ink, stamp, ink, sivá (žltá a biela na papieri zanikali, hot patrí CTA).
        Pri <code>animated=false</code> sa ukáže prvý snímok (t = 0).
      </Opravene>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="Všetky ASCII tvary">
        {TVARY.map((t) => (
          <li key={t.meno} className="min-w-0">
            <Bunka
              className="h-full"
              popis={
                <>
                  <strong className="block text-[0.78rem]">{t.meno}</strong>
                  {t.co} · východzí charset {t.charset}
                </>
              }
            >
              <div className="max-w-full overflow-x-auto">
              <t.C
                size="md"
                charset={charset === 'vlastny' ? undefined : charset}
                speed={speed}
                animated={animated}
                multicolor={multicolor}
                color={farbaCss(farba)}
              />
              </div>
            </Bunka>
          </li>
        ))}
      </ul>

      <Pod poznamka="Ten istý tvar vo všetkých piatich znakových sadách (size sm = 24 × 12; pri 3D tvaroch je sm príliš hrubé, mriežka vyššie je md).">Znakové sady</Pod>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {CHARSETY.map((c) => (
          <Bunka key={c} popis={<>charset=&quot;{c}&quot; · {ZNAKY[c]}</>}>
            <A.AsciiSphere size="sm" charset={c} speed={speed} animated={animated} />
          </Bunka>
        ))}
      </div>

      <Pod poznamka="sm = 24 × 12 znakov, md = 48 × 24, lg = 72 × 36, hero = 120 × 60. Hero má pri text-xs ~870 px, preto je v posuvnom kontajneri. Veľkosť písma (a tým rozmer) meníš cez className.">
        Veľkosti
      </Pod>
      <Panel className="lg:grid-cols-2">
        <Vyber label="tvar" hodnoty={TVARY.map((t) => ({ id: t.meno, label: t.meno.replace('Ascii', '') }))} hodnota={velky} onZmena={setVelky} />
        <Vyber label="size" hodnoty={VELKOSTI} hodnota={velkost} onZmena={setVelkost} />
      </Panel>
      <div className="overflow-x-auto rounded-lg border-3 border-ink bg-paper p-4">
        <Velky
          key={velky + velkost}
          size={velkost}
          charset={charset === 'vlastny' ? undefined : charset}
          speed={speed}
          animated={animated}
          color={farbaCss(farba)}
        />
      </div>

      <Pod poznamka="Monitor Korpusu: AsciiPulse ako „srdce“ zápisu, čierne pozadie, žlté znaky. Číslo je skutočné (Korpus v2, fakty.ts).">
        Kombinácia s Adamovým obsahom
      </Pod>
      <div className="grid items-stretch gap-4 md:grid-cols-[auto_1fr]">
        <div className="overflow-x-auto rounded-lg border-3 border-ink bg-ink p-3">
          <A.AsciiPulse size="md" color="var(--color-yellow)" className="border-yellow bg-ink" />
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-lg border-3 border-ink bg-yellow p-5 shadow-brutal">
          <p className="eyebrow">Vitálne funkcie · Korpus</p>
          <p className="font-display text-display-sm font-extrabold">{KORPUS.slova}</p>
          <p className="text-base">
            napísaných slov v promptoch od {KORPUS.od} ({KORPUS.prompty} promptov, stav k {KORPUS.kDatumu}).
          </p>
          <div className="overflow-x-auto">
            <A.AsciiWave size="sm" charset="line" color="var(--color-ink)" className="bg-yellow" />
          </div>
        </div>
      </div>
    </Kus>
  );
}
