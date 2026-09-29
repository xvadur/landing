/** Katalóg V7 · shapes.tsx: všetkých 55 exportovaných SVG tvarov + 11 skupinových exportov. Ovládací panel mení props
 *  celej mriežky naraz (color, strokeColor, filled, size, strokeWidth, animation, speed; rotácia cez style, prop nemá). */
import * as React from 'react';
import * as S from '@/components/ui/shapes';
import { Badge } from '@/components/ui/badge';
import { CESTA } from '@/data/cesta';
import { VLAJKA } from '@/data/ponuka';
import { POSTAVIL } from '@/data/fakty';
import { Bunka, Chyba, FARBY, farbaCss, Kus, Panel, Pod, Posuvnik, Prepinac, Vyber, type FarbaId } from './Spolocne';

type ShapeComp = React.ForwardRefExoticComponent<
  React.SVGProps<SVGSVGElement> & {
    size?: number;
    strokeWidth?: number;
    filled?: boolean;
    color?: string;
    strokeColor?: string;
    animation?: Anim;
    speed?: 'slow' | 'normal' | 'fast';
  } & React.RefAttributes<SVGSVGElement>
>;
type Anim =
  | 'none'
  | 'spin'
  | 'pulse'
  | 'float'
  | 'wiggle'
  | 'bounce'
  | 'glitch'
  | 'spin-step'
  | 'pulse-hard'
  | 'marquee-stamp';

/** Meno, kategória (podľa skupinových exportov), východzia trieda farby a pomer strán (z kódu). */
const ZOZNAM: { meno: keyof typeof S.shapes; kat: string; trieda: string; pomer?: string; pozn?: string }[] = [
  { meno: 'TriangleShape', kat: 'Geometric', trieda: 'text-accent' },
  { meno: 'DiamondBadge', kat: 'Geometric', trieda: 'text-primary' },
  { meno: 'PentagonShape', kat: 'Geometric', trieda: 'text-primary' },
  { meno: 'HexagonShape', kat: 'Geometric', trieda: 'text-secondary' },
  { meno: 'OctagonShape', kat: 'Geometric', trieda: 'text-accent' },
  { meno: 'CrossShape', kat: 'Geometric', trieda: 'text-accent', pozn: 'zdravotnícky kríž' },
  { meno: 'TrapezoidShape', kat: 'Geometric', trieda: 'text-secondary', pomer: '1 : 0,6' },
  { meno: 'ParallelogramShape', kat: 'Geometric', trieda: 'text-info', pomer: '1 : 0,5' },
  { meno: 'RhombusShape', kat: 'Geometric', trieda: 'text-info' },
  { meno: 'EllipseShape', kat: 'Geometric', trieda: 'text-primary', pomer: '1 : 0,7', pozn: 'osi čiarkované' },
  { meno: 'HeptagonShape', kat: 'Geometric', trieda: 'text-secondary' },
  { meno: 'DecagonShape', kat: 'Geometric', trieda: 'text-accent' },
  { meno: 'KochSnowflakeShape', kat: 'Mathematical', trieda: 'text-info', pozn: 'fraktál, 2 iterácie' },
  { meno: 'PenroseTriangleShape', kat: 'Mathematical', trieda: 'text-warning' },
  { meno: 'TrefoilShape', kat: 'Mathematical', trieda: 'text-primary', pozn: 'uzol, 120 bodov' },
  { meno: 'FibonacciSpiralShape', kat: 'Mathematical', trieda: 'text-accent', pozn: 'filled ignoruje' },
  { meno: 'MobiusStripShape', kat: 'Mathematical', trieda: 'text-secondary', pomer: '1 : 0,6' },
  { meno: 'TorusShape', kat: 'Mathematical', trieda: 'text-primary' },
  { meno: 'Star4Shape', kat: 'Star', trieda: 'text-info' },
  { meno: 'Star5Shape', kat: 'Star', trieda: 'text-accent' },
  { meno: 'Star6Shape', kat: 'Star', trieda: 'text-accent' },
  { meno: 'BurstShape', kat: 'Star', trieda: 'text-primary' },
  { meno: 'ExplosionShape', kat: 'Star', trieda: 'text-warning' },
  { meno: 'SplatShape', kat: 'Star', trieda: 'text-destructive' },
  { meno: 'LightningShape', kat: 'Star', trieda: 'text-warning' },
  { meno: 'BlobShape', kat: 'Organic', trieda: 'text-secondary' },
  { meno: 'WaveShape', kat: 'Organic', trieda: 'text-secondary', pomer: '1 : 0,5' },
  { meno: 'CloudShape', kat: 'Organic', trieda: 'text-info', pomer: '1 : 0,7' },
  { meno: 'HeartShape', kat: 'Organic', trieda: 'text-destructive' },
  { meno: 'AppleShape', kat: 'Organic', trieda: 'text-destructive', pozn: 'list vždy ink' },
  { meno: 'SunShape', kat: 'Celestial', trieda: 'text-warning' },
  { meno: 'CrescentShape', kat: 'Celestial', trieda: 'text-warning' },
  { meno: 'RainbowShape', kat: 'Celestial', trieda: 'text-primary', pomer: '1 : 0,6', pozn: 'color prefarbí všetky 3 oblúky' },
  { meno: 'PlanetShape', kat: 'Celestial', trieda: 'text-secondary' },
  { meno: 'UmbrellaShape', kat: 'Celestial', trieda: 'text-info' },
  { meno: 'ArrowBadge', kat: 'Badge', trieda: 'text-accent', pomer: '1 : 0,6' },
  { meno: 'ZigzagBanner', kat: 'Badge', trieda: 'text-warning', pomer: '1 : 0,5' },
  { meno: 'RibbonShape', kat: 'Badge', trieda: 'text-primary', pomer: '1 : 0,4' },
  { meno: 'ShieldShape', kat: 'Badge', trieda: 'text-success' },
  { meno: 'TagShape', kat: 'Badge', trieda: 'text-warning', pomer: '1 : 0,6', pozn: 'dierka vždy ink' },
  { meno: 'PriceTagShape', kat: 'Badge', trieda: 'text-accent', pomer: '1 : 0,6' },
  { meno: 'TicketShape', kat: 'Badge', trieda: 'text-success', pomer: '1 : 0,5' },
  { meno: 'CouponShape', kat: 'Badge', trieda: 'text-success', pomer: '1 : 0,5' },
  { meno: 'BookmarkShape', kat: 'Badge', trieda: 'text-destructive' },
  { meno: 'FlagShape', kat: 'Badge', trieda: 'text-warning' },
  { meno: 'PillShape', kat: 'Badge', trieda: 'text-primary', pomer: '1 : 0,4', pozn: 'tabletka' },
  { meno: 'SealShape', kat: 'Badge', trieda: 'text-success' },
  { meno: 'WavyRectangleShape', kat: 'Badge + Ticket', trieda: 'text-accent', pomer: '1 : 0,7' },
  { meno: 'GearShape', kat: 'Mechanical', trieda: 'text-primary' },
  { meno: 'SpeechBubble', kat: 'Communication', trieda: 'text-info' },
  { meno: 'CursorShape', kat: 'Communication', trieda: 'text-success' },
  { meno: 'EyeShape', kat: 'Communication', trieda: 'text-secondary', pomer: '1 : 0,6', pozn: 'zrenica vždy ink' },
  { meno: 'ScribbleCircle', kat: 'Decorative', trieda: 'text-info' },
  { meno: 'ScribbleUnderline', kat: 'Decorative', trieda: 'text-primary', pomer: '1 : 0,2', pozn: 'bez filled/color/strokeColor' },
  { meno: 'PaperTearShape', kat: 'Decorative', trieda: 'text-card', pomer: '1 : 0,3' },
];

const SKUPINY: { meno: string; obj: Record<string, unknown> }[] = [
  { meno: 'GeometricShapes', obj: S.GeometricShapes },
  { meno: 'MathematicalShapes', obj: S.MathematicalShapes },
  { meno: 'StarShapes', obj: S.StarShapes },
  { meno: 'OrganicShapes', obj: S.OrganicShapes },
  { meno: 'CelestialShapes', obj: S.CelestialShapes },
  { meno: 'BadgeShapes', obj: S.BadgeShapes },
  { meno: 'MechanicalShapes', obj: S.MechanicalShapes },
  { meno: 'CommunicationShapes', obj: S.CommunicationShapes },
  { meno: 'DecorativeShapes', obj: S.DecorativeShapes },
  { meno: 'TicketShapes', obj: S.TicketShapes },
  { meno: 'shapes (všetky)', obj: S.shapes },
];

const ANIMACIE: Anim[] = ['none', 'spin', 'pulse', 'float', 'wiggle', 'bounce', 'glitch', 'spin-step', 'pulse-hard', 'marquee-stamp'];
const RYCHLOSTI = ['slow', 'normal', 'fast'] as const;
const FARBY_VYBER = [{ id: 'vychodzia' as const, label: 'východzia' }, ...FARBY.map((f) => ({ id: f.id, label: f.label }))];

/** Vykreslí tvar; ScribbleUnderline nemá filled/color/strokeColor (neznámy prop by šiel do DOM → varovanie Reactu). */
function Tvar({
  meno,
  p,
  style,
  className,
}: {
  meno: keyof typeof S.shapes;
  p: { size: number; strokeWidth: number; filled: boolean; color?: string; strokeColor?: string; animation: Anim; speed: 'slow' | 'normal' | 'fast' };
  style?: React.CSSProperties;
  className?: string;
}) {
  const C = S.shapes[meno] as unknown as ShapeComp;
  if (meno === 'ScribbleUnderline') {
    // color ide cez ...props na <svg color>, čo je platný SVG atribút → currentColor (náhodou funguje)
    return <C size={p.size} strokeWidth={p.strokeWidth} animation={p.animation} speed={p.speed} color={p.color} style={style} className={className} />;
  }
  return <C {...p} style={style} className={className} />;
}

export default function Tvary() {
  const [farba, setFarba] = React.useState<FarbaId | 'vychodzia'>('yellow');
  const [obrys, setObrys] = React.useState<FarbaId | 'vychodzia'>('vychodzia');
  const [filled, setFilled] = React.useState(true);
  const [size, setSize] = React.useState(88);
  const [sw, setSw] = React.useState(3);
  const [rot, setRot] = React.useState(0);
  const [anim, setAnim] = React.useState<Anim>('none');
  const [speed, setSpeed] = React.useState<(typeof RYCHLOSTI)[number]>('normal');

  const p = {
    size,
    strokeWidth: sw,
    filled,
    color: farbaCss(farba),
    strokeColor: farbaCss(obrys),
    animation: anim,
    speed,
  };
  const kod = `<Tvar size={${size}} strokeWidth={${sw}} filled={${filled}}${p.color ? ` color="${p.color}"` : ''}${p.strokeColor ? ` strokeColor="${p.strokeColor}"` : ''}${anim !== 'none' ? ` animation="${anim}" speed="${speed}"` : ''}${rot ? ` style={{ rotate: '${rot}deg' }}` : ''} />`;

  const zakl = { size: 72, strokeWidth: 3, filled: true, color: 'var(--color-yellow)', animation: 'none' as Anim, speed: 'normal' as const };

  return (
    <Kus
      id="shapes"
      meno="shapes"
      subor="src/components/ui/shapes.tsx · 55 tvarov · 11 skupinových exportov"
      pocet="55 tvarov"
      veta="SVG tvary s tvrdým obrysom: dekorácia hera, nálepky, pozadia sekcií, symboly (kríž, tabletka, štít, pečať). Každý berie size, strokeWidth, filled, color, strokeColor, animation a speed."
    >
      <Pod poznamka="Panel mení všetkých 55 naraz. Rotácia nie je prop, ide cez style / className (v kóde nižšie).">Ovládanie celej mriežky</Pod>
      <Panel>
        <Vyber label="color (výplň, pri obryse farba čiary)" hodnoty={FARBY_VYBER} hodnota={farba} onZmena={setFarba} />
        <Vyber label="strokeColor (obrys)" hodnoty={FARBY_VYBER} hodnota={obrys} onZmena={setObrys} />
        <div className="flex flex-col gap-3">
          <Prepinac label="filled" zap={filled} onZmena={setFilled} />
          <Posuvnik label="size" min={24} max={160} hodnota={size} onZmena={setSize} jednotka=" px" />
        </div>
        <Posuvnik label="strokeWidth" min={1} max={8} hodnota={sw} onZmena={setSw} />
        <Posuvnik label="rotácia (style)" min={0} max={345} step={15} hodnota={rot} onZmena={setRot} jednotka="°" />
        <Vyber label="animation" hodnoty={ANIMACIE} hodnota={anim} onZmena={setAnim} />
        <Vyber label="speed" hodnoty={RYCHLOSTI} hodnota={speed} onZmena={setSpeed} />
        <pre className="overflow-x-auto rounded-md border-2 border-ink bg-white p-2 font-mono text-[0.7rem] sm:col-span-2 lg:col-span-2">{kod}</pre>
      </Panel>
      <Chyba>
        Plynulé animácie <code>spin, pulse, float, wiggle, bounce, glitch</code> nemajú v <code>src/styles/motion.css</code> žiadne CSS
        (existujú len stupňové <code>spin-step, pulse-hard, marquee-stamp</code>). Na webe by tvar stál. V katalógu ich dopĺňa záplata v
        <code> src/pages/kit/tvary.astro</code> (trieda <code>kit-zaplata</code>). Východzie farby tvarov sú často <code>text-accent</code> = hot,
        čo zákon dizajnu dovoľuje iba na CTA a X — preto je v paneli predvolená žltá.
      </Chyba>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-label="Všetky tvary">
        {ZOZNAM.map((t) => (
          <li key={t.meno} className="min-w-0">
            <Bunka
              className="h-full"
              popis={
                <>
                  <strong className="block text-[0.78rem]">{t.meno}</strong>
                  <span className="block">{t.kat} · {t.trieda}{t.pomer ? ` · ${t.pomer}` : ''}</span>
                  {t.pozn ? <span className="block text-ink/70">{t.pozn}</span> : null}
                </>
              }
            >
              <div className="flex h-[170px] w-full items-center justify-center overflow-hidden">
                <Tvar meno={t.meno} p={p} style={rot ? { rotate: `${rot}deg` } : undefined} className="max-w-full" />
              </div>
            </Bunka>
          </li>
        ))}
      </ul>

      <Pod poznamka="Ten istý CrossShape (zdravotnícky kríž) vo všetkých stavoch: výplň, obrys, obrys inou farbou, hrúbky, veľkosti a všetkých 10 animácií.">
        Varianty jedného tvaru
      </Pod>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <Bunka popis="filled · color stamp">
          <S.CrossShape {...zakl} color="var(--color-stamp)" />
        </Bunka>
        <Bunka popis="filled={false} · color ink">
          <S.CrossShape {...zakl} filled={false} color="var(--color-ink)" />
        </Bunka>
        <Bunka popis="filled · strokeColor stamp">
          <S.CrossShape {...zakl} color="var(--color-white)" strokeColor="var(--color-stamp)" strokeWidth={6} />
        </Bunka>
        <Bunka popis="strokeWidth 1 / 8">
          <div className="flex gap-2">
            <S.CrossShape {...zakl} size={48} strokeWidth={1} />
            <S.CrossShape {...zakl} size={48} strokeWidth={8} />
          </div>
        </Bunka>
        <Bunka popis="size 24 · 48 · 96">
          <div className="flex items-end gap-2">
            <S.CrossShape {...zakl} size={24} />
            <S.CrossShape {...zakl} size={48} />
            <S.CrossShape {...zakl} size={96} />
          </div>
        </Bunka>
        <Bunka popis="rotate 45° (style)">
          <S.CrossShape {...zakl} style={{ rotate: '45deg' }} />
        </Bunka>
        {ANIMACIE.filter((a) => a !== 'none').map((a) => (
          <Bunka
            key={a}
            popis={
              <>
                animation=&quot;{a}&quot;{' '}
                {['spin-step', 'pulse-hard', 'marquee-stamp'].includes(a) ? <span className="text-ink/70">(v motion.css)</span> : <strong>(záplata)</strong>}
              </>
            }
          >
            <div className="flex h-24 w-full items-center justify-center overflow-hidden">
              <S.CrossShape {...zakl} size={56} color="var(--color-stamp)" animation={a} />
            </div>
          </Bunka>
        ))}
        <Bunka popis="speed slow / normal / fast (pulse-hard)">
          <div className="flex gap-2">
            {RYCHLOSTI.map((s) => (
              <S.HeartShape key={s} size={40} strokeWidth={3} color="var(--color-stamp)" animation="pulse-hard" speed={s} />
            ))}
          </div>
        </Bunka>
      </div>

      <Pod poznamka="Objekty na hromadné vykreslenie (napr. náhodný tvar do pozadia). Počet = Object.keys(). WavyRectangleShape je v BadgeShapes aj TicketShapes.">
        Skupinové exporty
      </Pod>
      <div className="flex flex-wrap gap-2">
        {SKUPINY.map((g) => (
          <Badge key={g.meno} variant="outline" className="font-mono normal-case">
            {g.meno} · {Object.keys(g.obj).length}
          </Badge>
        ))}
      </div>

      <Pod poznamka="Tvary ako nosiče textu: text leží absolútne nad SVG. Obsah z ponuka.ts, cesta.ts a fakty.ts.">Kombinácia s Adamovým obsahom</Pod>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative flex min-h-56 items-center justify-center rounded-lg border-3 border-ink bg-paper p-4 tx-dots">
          <div className="relative">
            <S.PillShape size={260} strokeWidth={4} color="var(--color-yellow)" className="max-w-full" />
            <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-extrabold uppercase">
              {VLAJKA.nazov} · {VLAJKA.trvanie}
            </span>
          </div>
        </div>
        <div className="relative flex min-h-56 items-center justify-center rounded-lg border-3 border-ink bg-white p-4">
          <div className="relative">
            <S.SealShape size={200} strokeWidth={4} color="var(--color-yellow)" animation="spin-step" speed="slow" />
            <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display text-3xl font-extrabold">{POSTAVIL[0].cislo}</span>
              <span className="font-mono text-[0.65rem] font-bold uppercase">kontrol pred vydaním</span>
            </span>
          </div>
        </div>
        <div className="relative flex min-h-56 flex-col items-start justify-center gap-1 rounded-lg border-3 border-ink bg-white p-5">
          <p className="font-display text-4xl font-extrabold">
            Ahoj, som <span className="font-serif font-normal italic">Adam</span>.
          </p>
          <S.ScribbleUnderline size={220} strokeWidth={4} color="var(--color-stamp)" />
          <p className="mt-2 font-mono text-xs uppercase">ScribbleUnderline pod menom · color cez SVG atribút</p>
        </div>
        <div className="relative flex min-h-64 items-center justify-center rounded-lg border-3 border-ink bg-paper p-4 sm:col-span-2 lg:col-span-2">
          <div className="relative w-full max-w-[420px]">
            <S.SpeechBubble size={420} strokeWidth={4} color="var(--color-white)" className="h-auto w-full" />
            <p className="absolute inset-x-[12%] top-[14%] font-serif text-lg leading-snug italic sm:text-2xl">„{CESTA[1].citat}“</p>
          </div>
        </div>
        <div className="relative flex min-h-56 items-center justify-center rounded-lg border-3 border-ink bg-ink p-4">
          <div className="relative">
            <S.ShieldShape size={180} strokeWidth={4} color="var(--color-paper)" strokeColor="var(--color-paper)" />
            <span className="absolute inset-0 flex items-center justify-center pb-4">
              <S.CrossShape size={64} strokeWidth={3} color="var(--color-stamp)" />
            </span>
          </div>
          <span className="sticker absolute right-3 bottom-3">Triáž</span>
        </div>
      </div>
    </Kus>
  );
}
