/** Lab: React Bits vendorované komponenty s tokenmi v4 a reálnym slovenským obsahom (fakty.ts, frazy.ts, beaty.ts).
 *  Slúži ako kompilačný test aj ranná ukážka. Mount: <ReactbitsLab client:only="react" /> (ScrambledText + SplitText
 *  registrujú GSAP pluginy pri importe). Čísla len z src/data — nič vymyslené. */
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRightIcon, XIcon } from '@phosphor-icons/react';
import { MARQUEE_FAKTY, POSTAVIL, KOTVY } from '@/data/fakty';
import { FRAZY_RODINY } from '@/data/frazy';
import { BEATY } from '@/data/beaty';
import ScrambledText from '@/components/vendor/reactbits/ScrambledText';
import DecryptedText from '@/components/vendor/reactbits/DecryptedText';
import Magnet from '@/components/vendor/reactbits/Magnet';
import ClickSpark from '@/components/vendor/reactbits/ClickSpark';
import TiltedCard from '@/components/vendor/reactbits/TiltedCard';
import CountUp from '@/components/vendor/reactbits/CountUp';
import Stepper, { Step } from '@/components/vendor/reactbits/Stepper';
import Noise from '@/components/vendor/reactbits/Noise';
import SplitText from '@/components/vendor/reactbits/SplitText';

const MOTTO_1 = 'DIVIDED,';
const MOTTO_2 = 'WE ARE USELESS.';

function Blok({ id, title, note, children, bg = 'bg-white' }: { id: string; title: string; note: string; children: React.ReactNode; bg?: string }) {
  return (
    <section id={id} className={`brutal ${bg} relative min-w-0 p-5 sm:p-8`} aria-labelledby={`${id}-h`}>
      <span className="x-stamp" />
      <p className="eyebrow text-ink/60">React Bits · {note}</p>
      <h2 id={`${id}-h`} className="mt-2 font-display text-display-xs font-extrabold uppercase tracking-tight">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

const zakladne = FRAZY_RODINY.filter((r) => r.zakladna);
const dataset = POSTAVIL.find((p) => p.id === 'trhovy-dataset');
const netopier = POSTAVIL.find((p) => p.id === 'netopier');

export default function ReactbitsLab() {
  const [krok, setKrok] = useState(1);
  const [hotovo, setHotovo] = useState(false);

  return (
    <div className="grid gap-8 [&>*]:min-w-0">
      {/* 1 — SplitText: hero motto (doc 10 §3 #2, §4) */}
      <Blok id="rb-splittext" title="SplitText" note="GSAP SplitText, hero motto" bg="bg-paper">
        <div className="tx-grain relative overflow-hidden rounded-lg border-3 border-ink bg-paper p-6 sm:p-10">
          <div className="relative z-10">
            <SplitText
              tag="h3"
              text={MOTTO_1}
              immediate
              splitType="chars"
              delay={40}
              duration={0.9}
              ease="power4.out"
              from={{ opacity: 0, y: 60, fontVariationSettings: "'wdth' 75" }}
              to={{ opacity: 1, y: 0, fontVariationSettings: "'wdth' 100" }}
              className="block font-display text-display font-extrabold uppercase leading-[0.9] tracking-tighter"
            />
            <SplitText
              tag="h3"
              text={MOTTO_2}
              immediate
              splitType="chars"
              delay={40}
              duration={0.9}
              ease="power4.out"
              from={{ opacity: 0, y: 60, fontVariationSettings: "'wdth' 75" }}
              to={{ opacity: 1, y: 0, fontVariationSettings: "'wdth' 100" }}
              className="block font-display text-display font-extrabold uppercase leading-[0.9] tracking-tighter"
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-ink/60">
          Písmená vstupujú po znakoch, šírka písma 75 → 100. Pri reduced motion sa vykreslí statický text. Prvok s GSAP nedostáva Motion ani presety.
        </p>
      </Blok>

      {/* 2 — ScrambledText: scramble za kurzorom (doc 10 §3 #2 druhý riadok, nav) */}
      <Blok id="rb-scrambled" title="ScrambledText" note="GSAP ScrambleText, hover za kurzorom" bg="bg-yellow">
        <ScrambledText
          as="p"
          radius={120}
          duration={1}
          speed={0.5}
          className="font-mono text-[clamp(1rem,0.6rem+2.4vw,2rem)] font-medium uppercase leading-tight"
        >
          {MARQUEE_FAKTY.map((f) => f.value).join(' · ')}
        </ScrambledText>
        <p className="mt-4 text-sm text-ink/70">Prejdi kurzorom cez čísla. Na dotyku a pri reduced motion je text statický.</p>
      </Blok>

      {/* 3 — DecryptedText: bez GSAP, pre lite podstránky */}
      <Blok id="rb-decrypted" title="DecryptedText" note="Motion, bez GSAP — pre podstránky" bg="bg-lilac">
        <p className="font-display text-display-xs font-extrabold uppercase leading-none">
          <DecryptedText text={zakladne[0]?.rodina.toUpperCase() ?? ''} animateOn="view" sequential speed={40} revealDirection="start" />
        </p>
        <p className="mt-3 font-sans text-lg">
          <DecryptedText text={`${KOTVY.kancelarieSFrazou.value} zo ${KOTVY.kancelarieSFrazou.z} ${KOTVY.kancelarieSFrazou.note}.`} animateOn="hover" speed={30} maxIterations={12} />
        </p>
        <button
          type="button"
          className="press mt-5 inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-white px-5 font-display text-lg font-extrabold uppercase shadow-brutal"
        >
          <DecryptedText text="KLIKNI A ROZLÚŠTI" animateOn="click" clickMode="toggle" sequential speed={35} />
        </button>
      </Blok>

      {/* 4 — Magnet + ClickSpark: CTA VSTÚP (doc 10 §3 #5) */}
      <Blok id="rb-magnet-spark" title="Magnet + ClickSpark" note="CTA VSTÚP" bg="bg-pink">
        <div className="flex flex-wrap items-center gap-6">
          <Magnet padding={80} magnetStrength={3}>
            <ClickSpark sparkColor="ink" sparkRadius={28} sparkSize={14} sparkCount={10}>
              <a
                href="/#kto-som"
                data-cursor="vstup"
                onClick={(e) => {
                  e.preventDefault();
                  toast('VSTÚP — iskry sú z tokenu ink, magnet ťahá do 80 px.');
                }}
                className="press inline-flex min-h-14 items-center gap-3 rounded-lg border-3 border-ink bg-hot px-7 font-display text-2xl font-extrabold uppercase text-ink shadow-brutal-lg"
              >
                Vstúp <ArrowRightIcon weight="bold" className="h-6 w-6" />
              </a>
            </ClickSpark>
          </Magnet>
          <ClickSpark sparkColor="hot" sparkRadius={40} sparkSize={18} sparkCount={12} lineWidth={4} className="rounded-lg">
            <button
              type="button"
              className="press inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-white px-5 font-display text-lg font-extrabold uppercase shadow-brutal"
            >
              <XIcon weight="bold" className="h-5 w-5 text-hot" /> Iskry hot
            </button>
          </ClickSpark>
        </div>
        <p className="mt-4 text-sm text-ink/70">Magnet beží len s myšou ≥ hover; iskry na klik/dotyk, pri reduced motion nič.</p>
      </Blok>

      {/* 5 — TiltedCard: showcase karta (doc 10 §3 #9) */}
      <Blok id="rb-tilted" title="TiltedCard" note="showcase karta s náklonom" bg="bg-sky">
        <div className="grid gap-6 sm:grid-cols-2">
          {[dataset, netopier].map(
            (p) =>
              p && (
                <TiltedCard key={p.id} captionText={p.nazov} rotateAmplitude={8} scaleOnHover={1.03}>
                  <div className="p-6">
                    <p className="eyebrow text-ink/60">{p.nazov}</p>
                    <p className="mt-2 font-display text-display-sm font-extrabold tracking-tight">{p.cislo}</p>
                    <p className="mt-3 text-base">{p.riadok}</p>
                  </div>
                </TiltedCard>
              ),
          )}
        </div>
      </Blok>

      {/* 6 — CountUp: čísla (doc 10 §3 #14, alternatíva k NumberFlow) */}
      <Blok id="rb-countup" title="CountUp" note="čísla pri scrolle, sk formát" bg="bg-lime">
        <dl className="grid gap-6 sm:grid-cols-3">
          <div className="brutal p-5">
            <dt className="eyebrow text-ink/60">Makléri v datasete</dt>
            <dd className="mt-2 font-display text-display-sm font-extrabold tracking-tight">
              <CountUp to={2034} duration={1.6} />
            </dd>
          </div>
          <div className="brutal p-5">
            <dt className="eyebrow text-ink/60">Kontroly pred vydaním</dt>
            <dd className="mt-2 font-display text-display-sm font-extrabold tracking-tight">
              <CountUp to={47} duration={1.2} suffix=" / 47" />
            </dd>
          </div>
          <div className="brutal p-5">
            <dt className="eyebrow text-ink/60">Slová v prepisoch</dt>
            <dd className="mt-2 font-display text-display-sm font-extrabold tracking-tight">
              <CountUp to={2.3} duration={1.4} suffix=" mil." />
            </dd>
          </div>
        </dl>
      </Blok>

      {/* 7 — Stepper: kvíz (doc 10 §3 #17) */}
      <Blok id="rb-stepper" title="Stepper" note="kvíz, 3 kroky" bg="bg-paper">
        <Stepper
          initialStep={1}
          onStepChange={setKrok}
          onFinalStepCompleted={() => {
            setHotovo(true);
            toast('Kvíz dokončený.');
          }}
          disableStepIndicators
          completedContent={
            <p className="font-display text-xl font-extrabold uppercase">
              Hotovo. {zakladne.length} rodín fráz, {KOTVY.kancelarieSFrazou.value} zo {KOTVY.kancelarieSFrazou.z} kancelárií ich má v texte.
            </p>
          }
        >
          {zakladne.slice(0, 3).map((r) => (
            <Step key={r.rodina}>
              <p className="eyebrow text-ink/60">Rodina fráz</p>
              <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight">{r.rodina}</p>
              <p className="mt-3 text-base">
                {r.z47} zo 47 kancelárií{typeof r.na416 === 'number' ? `, ${r.na416} výskytov na 416 weboch` : ''}.
              </p>
            </Step>
          ))}
        </Stepper>
        <p className="mt-4 text-sm text-ink/60">
          Krok {Math.min(krok, 3)} z 3{hotovo ? ' · dokončené' : ''}. Indikátory 44 px, rám 3 px, hot = aktívny, lime = hotový.
        </p>
      </Blok>

      {/* 8 — Noise: skeleton pri načítaní (doc 10 §3 #18) */}
      <Blok id="rb-noise" title="Noise" note="zrno / skeleton pri načítaní skóre" bg="bg-white">
        <div className="relative overflow-hidden rounded-lg border-3 border-ink bg-paper p-6 sm:p-10" aria-busy="true">
          <Noise patternSize={200} patternAlpha={28} patternRefreshInterval={3} />
          <p className="eyebrow relative z-10 text-ink/60">Skóre webu · počítam</p>
          <p className="relative z-10 mt-2 font-display text-display-xs font-extrabold uppercase">
            {KOTVY.webyBezVety.value} z {KOTVY.webyBezVety.z} webov
          </p>
          <p className="relative z-10 mt-2 max-w-md text-base">{KOTVY.webyBezVety.note}.</p>
        </div>
      </Blok>

      {/* 9 — kombinácia: beat ako karta s decrypted titulkom */}
      <Blok id="rb-beat" title="Kombinácia" note="Kto som — beat 1" bg="bg-yellow">
        <TiltedCard captionText={BEATY[0].rok} rotateAmplitude={6}>
          <div className="p-6">
            <p className="eyebrow text-ink/60">{BEATY[0].rok}</p>
            <p className="mt-2 font-display text-display-xs font-extrabold uppercase">
              <DecryptedText text={BEATY[0].titulok} animateOn="view" sequential speed={50} />
            </p>
            <p className="mt-3 text-base">{BEATY[0].text}</p>
          </div>
        </TiltedCard>
      </Blok>
    </div>
  );
}
