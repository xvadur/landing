/** Katalóg vendor · React Bits (MIT + Commons Clause, len ako súčasť webu): ClickSpark, CountUp, DecryptedText, Magnet,
 *  Noise, Stepper (+ Step), TiltedCard. GSAP kusy (ScrambledText, SplitText) sú v ReactBitsGsap.tsx a načítajú sa lenivo
 *  až po hydratácii (GSAP pluginy sa registrujú pri importe → nie na serveri). */
import { lazy, Suspense, useState } from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import ClickSpark from '@/components/vendor/reactbits/ClickSpark';
import CountUp from '@/components/vendor/reactbits/CountUp';
import DecryptedText from '@/components/vendor/reactbits/DecryptedText';
import Magnet from '@/components/vendor/reactbits/Magnet';
import Noise from '@/components/vendor/reactbits/Noise';
import Stepper, { Step } from '@/components/vendor/reactbits/Stepper';
import TiltedCard from '@/components/vendor/reactbits/TiltedCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sticker } from '@/components/ui/sticker';
import { CTA_HLAVNE, MOTTO_1, MOTTO_2, NALEPKA_NEMOCNICA } from '@/components/hero/hero-data';
import { DOKAZY, KORPUS, MARQUEE_FAKTY } from '@/data/fakty';
import { VLAJKA } from '@/data/ponuka';
import { Kus, Mriezka, Pozn, Realne, Varianta, Znova, useMounted } from './shared';

const ReactBitsGsap = lazy(() => import('./ReactBitsGsap'));

const MOTTO = `${MOTTO_1} ${MOTTO_2}`;
const hriech = DOKAZY.find((d) => d.id === 'hriech');

export default function ReactBits() {
  const mounted = useMounted();
  const [kluc, setKluc] = useState(0);
  const [start, setStart] = useState(false);
  const [stav, setStav] = useState('čaká');
  const [krok, setKrok] = useState(1);
  const [hotovo, setHotovo] = useState(false);

  return (
    <>
      {/* ---------------- ClickSpark ---------------- */}
      <Kus
        id="rb-clickspark"
        nazov="ClickSpark"
        subor="vendor/reactbits/ClickSpark.tsx"
        veta="Iskry z miesta kliknutia (canvas, pointerdown = aj dotyk); farba z tokenu; reduced motion = bez iskier."
      >
        <Mriezka cols={4}>
          {(
            [
              ['hot', 'ease-out', 8, 22, 12, 400, 1, 3],
              ['ink', 'linear', 4, 40, 20, 600, 1, 5],
              ['yellow', 'ease-in', 12, 30, 16, 300, 1.4, 4],
              ['stamp', 'ease-in-out', 6, 50, 8, 800, 1, 2],
            ] as const
          ).map(([c, e, n, r, s, d, x, w]) => (
            <Varianta
              key={c}
              props={`sparkColor="${c}" easing="${e}" sparkCount=${n} sparkRadius=${r} sparkSize=${s} duration=${d} extraScale=${x} lineWidth=${w}`}
            >
              <ClickSpark sparkColor={c} easing={e} sparkCount={n} sparkRadius={r} sparkSize={s} duration={d} extraScale={x} lineWidth={w} className="w-full">
                <div className="grid h-28 w-full place-items-center rounded-lg border-3 border-dashed border-ink bg-paper font-mono text-sm">
                  klikni sem
                </div>
              </ClickSpark>
            </Varianta>
          ))}
        </Mriezka>
        <Realne zdroj="hero-data.ts (CTA_HLAVNE)">
          <ClickSpark sparkColor="ink" sparkCount={10} sparkRadius={34} lineWidth={4}>
            <Button variant="accent" size="lg">
              {CTA_HLAVNE.label} <ArrowRightIcon weight="bold" />
            </Button>
          </ClickSpark>
        </Realne>
      </Kus>

      {/* ---------------- CountUp ---------------- */}
      <Kus
        id="rb-countup"
        nazov="CountUp"
        subor="vendor/reactbits/CountUp.tsx"
        veta="Počítadlo od–do pri zobrazení (Motion spring): slovenský formát, prefix, sufix, štart na povel (startWhen), callbacky."
      >
        <div className="flex justify-end">
          <Znova onClick={() => setKluc((k) => k + 1)} />
        </div>
        <Mriezka cols={3} key={`cu-${kluc}`}>
          <Varianta props="to=2034 (separator pevná medzera)">
            <CountUp to={2034} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="from=0 to=100 direction='down' duration=1 (100 → 0)">
            <CountUp from={0} to={100} direction="down" duration={1} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="to=2.3 decimal=',' suffix=' mil.' delay=0.5">
            <CountUp to={2.3} suffix=" mil." delay={0.5} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="to=275333 separator='' (bez oddeľovača) as='strong'">
            <CountUp to={275333} separator="" as="strong" className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="prefix='× ' to=47 suffix=' / 47' duration=3">
            <CountUp prefix="× " to={47} suffix=" / 47" duration={3} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props={`startWhen={${start}} onStart onEnd → stav: ${stav}`}>
            <CountUp
              to={65}
              suffix=" dní"
              startWhen={start}
              onStart={() => setStav('beží')}
              onEnd={() => setStav('hotovo')}
              className="font-display text-4xl font-extrabold"
            />
            <Button size="sm" variant="outline" onClick={() => setStart(true)}>
              Štart
            </Button>
          </Varianta>
        </Mriezka>
        <Realne zdroj="fakty.ts (MARQUEE_FAKTY)">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MARQUEE_FAKTY.map((f) => {
              const n = Number(f.value.replace(/[^\d]/g, '').slice(0, f.value.includes('/') ? 2 : undefined));
              const suf = f.value.includes('/') ? ' / 47' : ` ${f.value.replace(/[\d\s/]/g, '').trim()}`;
              return (
                <div key={f.label} className="rounded-lg border-3 border-ink bg-white p-3 shadow-brutal-sm">
                  <dt className="eyebrow">{f.label}</dt>
                  <dd className="font-display text-2xl font-extrabold">
                    <CountUp to={n} suffix={suf} />
                  </dd>
                </div>
              );
            })}
          </dl>
        </Realne>
      </Kus>

      {/* ---------------- DecryptedText ---------------- */}
      <Kus
        id="rb-decrypted"
        nazov="DecryptedText"
        subor="vendor/reactbits/DecryptedText.tsx"
        veta="Text sa dešifruje zo šumu znakov (čistý React, ~2 kB): pri zobrazení, hoveri alebo kliku; sekvenčne od začiatku, konca alebo stredu."
      >
        {mounted ? (
        <Mriezka cols={3} key={`dt-${kluc}`}>
            <Varianta props="animateOn='view' sequential revealDirection='start' initialEncrypted">
              <DecryptedText text={MOTTO} animateOn="view" sequential revealDirection="start" initialEncrypted speed={40} className="font-display text-xl font-extrabold" encryptedClassName="font-display text-xl font-extrabold text-ink/40" />
            </Varianta>
            <Varianta props="animateOn='view' sequential revealDirection='end'">
              <DecryptedText text={MOTTO} animateOn="view" sequential revealDirection="end" initialEncrypted speed={40} className="font-display text-xl font-extrabold" encryptedClassName="font-display text-xl font-extrabold text-stamp" />
            </Varianta>
            <Varianta props="animateOn='view' sequential revealDirection='center'">
              <DecryptedText text={MOTTO} animateOn="view" sequential revealDirection="center" initialEncrypted speed={40} className="font-display text-xl font-extrabold" encryptedClassName="font-display text-xl font-extrabold text-ink/40" />
            </Varianta>
            <Varianta props="animateOn='hover' maxIterations=20 speed=30 (nesekvenčne)">
              <DecryptedText text={NALEPKA_NEMOCNICA} animateOn="hover" maxIterations={20} speed={30} className="font-mono text-lg font-bold" encryptedClassName="font-mono text-lg font-bold text-stamp" />
            </Varianta>
            <Varianta props="animateOn='click' clickMode='toggle' useOriginalCharsOnly">
              <DecryptedText text="KLIKNI: DIAGNÓZA" animateOn="click" clickMode="toggle" useOriginalCharsOnly sequential parentClassName="cursor-pointer min-h-11 inline-flex items-center" className="font-display text-xl font-extrabold" encryptedClassName="font-display text-xl font-extrabold text-ink/40" />
            </Varianta>
            <Varianta props="animateOn='inViewHover' characters='X×.:' clickMode='once'">
              <DecryptedText text="PRÍJEM OTVORENÝ" animateOn="inViewHover" characters="X×.:" maxIterations={14} className="font-display text-xl font-extrabold" encryptedClassName="font-display text-xl font-extrabold text-ink/40" />
            </Varianta>
          </Mriezka>
        ) : (
          <Pozn>DecryptedText s initialEncrypted sa vykreslí až po hydratácii (inak hydratačná chyba React #418).</Pozn>
        )}
        <Pozn>Čítačka vždy dostane pôvodný text (sr-only). Reduced motion = hotový text, žiadny interval.</Pozn>
      </Kus>

      {/* ---------------- Magnet ---------------- */}
      <Kus
        id="rb-magnet"
        nazov="Magnet"
        subor="vendor/reactbits/Magnet.tsx"
        veta="Prvok sa ťahá ku kurzoru v dosahu (padding); iba jemný ukazovateľ bez reduced motion, dotyk = statický."
      >
        <Mriezka cols={3}>
          <Varianta props="padding=100 magnetStrength=2 (default)">
            <Magnet>
              <Button variant="outline">Default</Button>
            </Magnet>
          </Varianta>
          <Varianta props="padding=40 magnetStrength=6 (slabší ťah, menší dosah)">
            <Magnet padding={40} magnetStrength={6}>
              <Button variant="outline">Slabý</Button>
            </Magnet>
          </Varianta>
          <Varianta props="activeTransition='transform 120ms steps(3)' inactiveTransition='… steps(3)'">
            <Magnet activeTransition="transform 120ms steps(3, end)" inactiveTransition="transform 240ms steps(3, end)" padding={80}>
              <Button variant="secondary">Stupňovitý</Button>
            </Magnet>
          </Varianta>
          <Varianta props="disabled · wrapperClassName · innerClassName">
            <Magnet disabled wrapperClassName="rounded-lg border-3 border-dashed border-ink p-2" innerClassName="bg-yellow">
              <span className="block px-3 py-2 font-mono text-sm">vypnutý</span>
            </Magnet>
          </Varianta>
        </Mriezka>
        <Realne zdroj="hero-data.ts (CTA_HLAVNE)">
          <Magnet padding={120} magnetStrength={3}>
            <Button variant="accent" size="xl">
              {CTA_HLAVNE.label}
            </Button>
          </Magnet>
        </Realne>
      </Kus>

      {/* ---------------- Noise ---------------- */}
      <Kus
        id="rb-noise"
        nazov="Noise"
        subor="vendor/reactbits/Noise.tsx"
        veta="Filmové zrno na canvase cez rodiča (mix-blend-multiply); beží len vo viewporte, reduced motion = nakreslí sa raz."
      >
        <Mriezka cols={4}>
          {(
            [
              [256, 2, 18, true],
              [64, 1, 40, true],
              [512, 6, 30, true],
              [128, 2, 60, false],
            ] as const
          ).map(([s, r, a, an]) => (
            <Varianta key={`${s}-${a}`} props={`patternSize=${s} patternRefreshInterval=${r} patternAlpha=${a} animate=${an}`}>
              <div className="relative h-28 w-full overflow-hidden rounded-lg border-3 border-ink bg-yellow">
                <Noise patternSize={s} patternRefreshInterval={r} patternAlpha={a} animate={an} />
              </div>
            </Varianta>
          ))}
        </Mriezka>
        <Realne zdroj="hero-data.ts (motto)">
          <div className="relative overflow-hidden rounded-lg border-3 border-ink bg-paper p-6 shadow-brutal sm:p-10">
            <Noise patternAlpha={26} />
            <p lang="en" className="relative font-display text-display-xs font-extrabold uppercase leading-[0.9]">
              {MOTTO_1}
              <br />
              {MOTTO_2}
            </p>
          </div>
        </Realne>
      </Kus>

      {/* ---------------- GSAP: ScrambledText + SplitText (lenivo) ---------------- */}
      {mounted ? (
        <Suspense fallback={<Pozn>Načítavam GSAP ukážky…</Pozn>}>
          <ReactBitsGsap />
        </Suspense>
      ) : (
        <Pozn>ScrambledText a SplitText (GSAP) sa načítajú po hydratácii.</Pozn>
      )}

      {/* ---------------- Stepper ---------------- */}
      <Kus
        id="rb-stepper"
        nazov="Stepper · Step"
        subor="vendor/reactbits/Stepper.tsx"
        veta="Karta s krokmi: indikátory 44 px (biely / hot / hotový), ink spojky, Späť / Ďalej / Dokončiť, posun krokov (Motion)."
      >
        <Mriezka cols={2}>
          <Varianta props={`default · onStepChange → krok ${krok} · onFinalStepCompleted · completedContent`}>
            <Stepper
              key={`st-${kluc}`}
              onStepChange={setKrok}
              onFinalStepCompleted={() => setHotovo(true)}
              completedContent={<p className="font-display text-xl font-extrabold uppercase">Odovzdané{hotovo ? ' ✔' : ''}</p>}
            >
              <Step>
                <p className="font-display text-2xl font-extrabold uppercase">Triáž</p>
                <p>{VLAJKA.body[0]}</p>
              </Step>
              <Step>
                <p className="font-display text-2xl font-extrabold uppercase">Diagnóza</p>
                <p>{VLAJKA.body[1]}</p>
              </Step>
              <Step>
                <p className="font-display text-2xl font-extrabold uppercase">Plán liečby</p>
                <p>{VLAJKA.body[2]}</p>
              </Step>
            </Stepper>
          </Varianta>
          <Varianta props="initialStep=2 · disableStepIndicators · stepCircleContainerClassName='bg-yellow' · texty tlačidiel · nextButtonProps">
            <Stepper
              initialStep={2}
              disableStepIndicators
              stepCircleContainerClassName="bg-yellow"
              backButtonText="Naspäť"
              nextButtonText="Pokračuj"
              completeButtonText="Zapíš ma"
              nextButtonProps={{ 'aria-describedby': 'rb-st-pozn' }}
            >
              <Step>Krok 1</Step>
              <Step>Len dopredu: indikátory sa nedajú klikať (kvíz).</Step>
              <Step>Posledný krok.</Step>
            </Stepper>
          </Varianta>
          <Varianta props="renderStepIndicator (vlastný indikátor: X pečiatka)">
            <Stepper
              renderStepIndicator={({ step, currentStep, onStepClick }) => (
                <button
                  type="button"
                  onClick={() => onStepClick(step)}
                  aria-label={`Krok ${step}`}
                  aria-current={step === currentStep ? 'step' : undefined}
                  className={
                    step === currentStep
                      ? 'press grid size-11 place-items-center rounded-full border-3 border-ink bg-ink font-display text-lg font-extrabold text-yellow'
                      : 'press grid size-11 place-items-center rounded-full border-3 border-ink bg-white font-display text-lg font-extrabold'
                  }
                >
                  {step < currentStep ? '×' : step}
                </button>
              )}
            >
              <Step>Príjem</Step>
              <Step>Anamnéza</Step>
              <Step>Liečba</Step>
              <Step>Kontrola</Step>
            </Stepper>
          </Varianta>
          <Varianta props="contentClassName · footerClassName · stepContainerClassName">
            <Pozn>
              <span id="rb-st-pozn">Hotový krok je bg-lime (pastel) — v Stepper.tsx riadok s `status === 'complete'`; zákon V5.3 by chcel bg-yellow alebo bg-ink.</span>
            </Pozn>
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- TiltedCard ---------------- */}
      <Kus
        id="rb-tilted"
        nazov="TiltedCard"
        subor="vendor/reactbits/TiltedCard.tsx"
        veta="Karta sa nakláňa za kurzorom (Motion spring, perspektíva) s bublinou-nálepkou; na dotyku statická s lift/press."
      >
        <Mriezka cols={3}>
          <Varianta props="imageSrc captionText rotateAmplitude=10 scaleOnHover=1.04 (default)">
            <TiltedCard imageSrc={hriech?.obrazok ?? undefined} altText="Hriech, náhľad" captionText="hriech.xvadur.com" imageHeight="160px" />
          </Varianta>
          <Varianta props="rotateAmplitude=20 scaleOnHover=1.1 showTooltip={false} surfaceClassName='bg-yellow'">
            <TiltedCard rotateAmplitude={20} scaleOnHover={1.1} showTooltip={false} surfaceClassName="bg-yellow">
              <div className="p-6 font-display text-3xl font-extrabold">{KORPUS.slova}</div>
            </TiltedCard>
          </Varianta>
          <Varianta props="overlayContent displayOverlayContent containerHeight='200px'">
            <TiltedCard
              imageSrc="/assets/dokazy/terapeutka.webp"
              altText="Web terapeutky, náhľad"
              imageHeight="200px"
              containerHeight="200px"
              displayOverlayContent
              overlayContent={
                <Badge variant="secondary" className="m-3">
                  2. klient
                </Badge>
              }
            />
          </Varianta>
        </Mriezka>
        {hriech ? (
          <Realne zdroj="fakty.ts (DOKAZY: hriech)">
            <div className="max-w-sm">
              <TiltedCard imageSrc={hriech.obrazok ?? undefined} altText={hriech.nazov} captionText={`${hriech.cislo} ${hriech.cisloPopis}`} imageHeight="220px">
                <div className="border-t-3 border-ink p-4">
                  <Sticker variant="secondary" rotation="slight" className="mb-2">
                    {hriech.stitky.join(' · ')}
                  </Sticker>
                  <p className="font-display text-2xl font-extrabold uppercase">{hriech.nazov}</p>
                  <p className="text-sm">{hriech.riadok}</p>
                </div>
              </TiltedCard>
            </div>
          </Realne>
        ) : null}
      </Kus>
    </>
  );
}
