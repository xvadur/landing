/** Katalóg vendor · Motion Primitives (MIT, ibelick): AnimatedNumber, Cursor, InView, Magnetic, MorphingDialog (celá skladačka),
 *  TextScramble, TransitionPanel. Všetko Motion → stavy komponentov. */
import { useState } from 'react';
import { MinusIcon, PlusIcon } from '@phosphor-icons/react';
import { AnimatedNumber } from '@/components/vendor/motionprimitives/animated-number';
import { Cursor } from '@/components/vendor/motionprimitives/cursor';
import { InView, inViewDropVariants } from '@/components/vendor/motionprimitives/in-view';
import { Magnetic } from '@/components/vendor/motionprimitives/magnetic';
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from '@/components/vendor/motionprimitives/morphing-dialog';
import { SCRAMBLE_CHARS_SK, TextScramble } from '@/components/vendor/motionprimitives/text-scramble';
import { TransitionPanel, transitionPanelSlideVariants } from '@/components/vendor/motionprimitives/transition-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XZnak } from '@/components/v5/Symboly';
import { MOTTO_1, MOTTO_2 } from '@/components/hero/hero-data';
import { CESTA } from '@/data/cesta';
import { DOKAZY, PRIPAD_MAKLER } from '@/data/fakty';
import { Kus, Mriezka, Pozn, Realne, Varianta, Znova } from './shared';

/** stupňovitý easing pre Motion (funkcia t → schod) — tvrdé, nie plávajúce */
const schody = (n: number) => (t: number) => Math.min(1, Math.ceil(t * n) / n);

export default function MotionPrimitives() {
  const [cislo, setCislo] = useState(2034);
  const [panel, setPanel] = useState(0);
  const [trig, setTrig] = useState(true);
  const [hotovo, setHotovo] = useState(0);
  const [kluc, setKluc] = useState(0);
  const karty = DOKAZY.filter((d) => d.obrazok).slice(0, 3);

  return (
    <>
      {/* ---------------- AnimatedNumber ---------------- */}
      <Kus
        id="mp-animated-number"
        nazov="AnimatedNumber"
        subor="vendor/motionprimitives/animated-number.tsx"
        veta="Číslo s pružinou medzi hodnotami (useSpring); formát sk-SK alebo vlastný; reduced motion = skok."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="icon" aria-label="Mínus 100" onClick={() => setCislo((c) => Math.max(0, c - 100))}>
            <MinusIcon weight="bold" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Plus 100" onClick={() => setCislo((c) => c + 100)}>
            <PlusIcon weight="bold" />
          </Button>
          <Button variant="outline" onClick={() => setCislo(2034)}>
            Späť na 2 034
          </Button>
        </div>
        <Mriezka cols={4}>
          <Varianta props="default spring · locale='sk-SK'">
            <AnimatedNumber value={cislo} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="springOptions={{ bounce: 0, duration: 300 }} (tvrdé)">
            <AnimatedNumber value={cislo} springOptions={{ bounce: 0, duration: 300 }} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="springOptions={{ stiffness: 60, damping: 8 }} as='strong'">
            <AnimatedNumber value={cislo} as="strong" springOptions={{ stiffness: 60, damping: 8 }} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="format={(n) => `${n} maklérov`} · locale='en-US' ignorovaný">
            <AnimatedNumber value={cislo} locale="en-US" format={(n) => `${n} maklérov`} className="font-mono text-2xl font-bold" />
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- Cursor ---------------- */}
      <Kus
        id="mp-cursor"
        nazov="Cursor"
        subor="vendor/motionprimitives/cursor.tsx"
        veta="Vlastný kurzor za myšou (spring); iba desktop ≥ 1024 px s myšou, lokálne cez attachToParent."
      >
        <Mriezka cols={2}>
          <Varianta props="attachToParent · springConfig={{ bounce: 0.001 }} · variants (X sa vyrazí ako pečiatka)">
            <div className="relative grid h-48 w-full place-items-center overflow-hidden rounded-lg border-3 border-ink bg-yellow tx-dots">
              <Cursor
                attachToParent
                springConfig={{ bounce: 0.001 }}
                variants={{ initial: { scale: 0.3, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.3, opacity: 0 } }}
                transition={{ ease: schody(3), duration: 0.18 }}
              >
                <XZnak className="w-10 text-hot" />
              </Cursor>
              <span className="font-mono text-sm">nad touto plochou je kurzor X</span>
            </div>
          </Varianta>
          <Varianta props="attachToParent · bez springConfig (duration 0 = presne) · štítok VSTÚP">
            <div className="relative grid h-48 w-full place-items-center overflow-hidden rounded-lg border-3 border-ink bg-white">
              <Cursor attachToParent>
                <span className="sticker [--sticker-rotate:-4deg]">Vstúp</span>
              </Cursor>
              <span className="font-mono text-sm">štítok ako kurzor</span>
            </div>
          </Varianta>
        </Mriezka>
        <Pozn>Bez attachToParent skryje systémový kurzor na celej stránke — domov už má vlastný X kurzor (site/Cursor.tsx), preto tu nie.</Pozn>
      </Kus>

      {/* ---------------- InView ---------------- */}
      <Kus
        id="mp-inview"
        nazov="InView"
        subor="vendor/motionprimitives/in-view.tsx"
        veta="Odhalenie pri scrollovaní (useInView): vlastné varianty, raz alebo vždy, okraj; reduced motion = 120 ms opacity."
      >
        <div className="flex justify-end">
          <Znova onClick={() => setKluc((k) => k + 1)} />
        </div>
        <Mriezka cols={3} key={`iv-${kluc}`}>
          <Varianta props="default variants (opacity) · once">
            <InView once>
              <p className="font-display text-2xl font-extrabold uppercase">Fade</p>
            </InView>
          </Varianta>
          <Varianta props="variants={inViewDropVariants} · transition steps(4)">
            <InView once variants={inViewDropVariants} transition={{ duration: 0.32, ease: schody(4) }}>
              <p className="rounded-lg border-3 border-ink bg-yellow px-4 py-3 font-display text-2xl font-extrabold uppercase shadow-brutal">Drop</p>
            </InView>
          </Varianta>
          <Varianta props="vlastné variants (x −100 % → 0, schody) · viewOptions={{ amount: 0.8 }} · as='section'">
            <InView
              as="section"
              viewOptions={{ amount: 0.8 }}
              variants={{ hidden: { x: '-100%' }, visible: { x: '0%' } }}
              transition={{ duration: 0.4, ease: schody(5) }}
            >
              <p className="rounded-lg border-3 border-ink bg-ink px-4 py-3 font-display text-2xl font-extrabold uppercase text-paper">Schody</p>
            </InView>
          </Varianta>
        </Mriezka>
        <Realne zdroj="fakty.ts (PRIPAD_MAKLER)">
          <p className="eyebrow mb-3">{PRIPAD_MAKLER.kto} · čo dostal</p>
          <ul className="grid gap-3">
            {PRIPAD_MAKLER.dostal.map((d, i) => (
              <InView key={`${d}-${kluc}`} as="li" once variants={inViewDropVariants} transition={{ duration: 0.24, delay: i * 0.08, ease: schody(3) }}>
                <span className="block rounded-lg border-3 border-ink bg-white px-4 py-3 shadow-brutal-sm">× {d}</span>
              </InView>
            ))}
          </ul>
        </Realne>
      </Kus>

      {/* ---------------- Magnetic ---------------- */}
      <Kus
        id="mp-magnetic"
        nazov="Magnetic"
        subor="vendor/motionprimitives/magnetic.tsx"
        veta="Magnetický obal (Motion spring): sila, dosah a kto spúšťa (prvok, rodič, celá stránka); dotyk a reduced motion = stojí."
      >
        <Mriezka cols={3}>
          <Varianta props="actionArea='self' intensity=0.6 range=100 (default)">
            <Magnetic>
              <Button variant="outline">Self</Button>
            </Magnetic>
          </Varianta>
          <Varianta props="actionArea='parent' intensity=0.3 range=200">
            <div className="grid h-28 w-full place-items-center rounded-lg border-3 border-dashed border-ink">
              <Magnetic actionArea="parent" intensity={0.3} range={200}>
                <Button variant="secondary">Parent</Button>
              </Magnetic>
            </div>
          </Varianta>
          <Varianta props="actionArea='global' intensity=0.15 range=400 springOptions tvrdé">
            <Magnetic actionArea="global" intensity={0.15} range={400} springOptions={{ stiffness: 400, damping: 40, mass: 0.2 }}>
              <Button variant="outline">Global</Button>
            </Magnetic>
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- MorphingDialog ---------------- */}
      <Kus
        id="mp-morphing"
        nazov="MorphingDialog (Trigger, Container, Content, Image, Title, Subtitle, Description, Close)"
        subor="vendor/motionprimitives/morphing-dialog.tsx"
        veta="Karta sa roztiahne do detailu (layoutId morph): obrázok, titulok a podtitul letia na nové miesto; reduced motion = fade."
      >
        <Mriezka cols={3}>
          {karty.map((d, i) => (
            <MorphingDialog key={d.id} transition={i === 1 ? { type: 'spring', bounce: 0.25, duration: 0.5 } : undefined}>
              <MorphingDialogTrigger aria-label={`Otvoriť ${d.nazov}`} className="brutal flex w-full flex-col overflow-hidden text-left hover:bg-paper">
                <MorphingDialogImage src={d.obrazok ?? ''} alt={d.nazov} className="h-40 w-full border-b-3 border-ink object-cover" />
                <div className="p-4">
                  <MorphingDialogTitle className="font-display text-2xl font-extrabold uppercase">{d.nazov}</MorphingDialogTitle>
                  <MorphingDialogSubtitle className="font-mono text-sm">
                    {d.cislo} {d.cisloPopis}
                  </MorphingDialogSubtitle>
                  <p className="mt-2 font-mono text-[11px] text-ink/60">
                    transition={i === 1 ? '{ spring, bounce 0.25 }' : 'morphingDialogTransition (bounce 0, 0.32 s)'}
                  </p>
                </div>
              </MorphingDialogTrigger>
              <MorphingDialogContainer>
                <MorphingDialogContent className="relative w-full max-w-lg">
                  <MorphingDialogImage src={d.obrazok ?? ''} alt={d.nazov} className="h-56 w-full border-b-3 border-ink object-cover" />
                  <div className="p-6">
                    <MorphingDialogTitle className="font-display text-3xl font-extrabold uppercase">{d.nazov}</MorphingDialogTitle>
                    <MorphingDialogSubtitle className="font-mono text-sm">
                      {d.cislo} {d.cisloPopis}
                    </MorphingDialogSubtitle>
                    <MorphingDialogDescription
                      disableLayoutAnimation
                      variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 12 } }}
                      className="mt-4"
                    >
                      <p>{d.riadok}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {d.stitky.map((s) => (
                          <Badge key={s} variant="secondary">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </MorphingDialogDescription>
                  </div>
                  <MorphingDialogClose />
                </MorphingDialogContent>
              </MorphingDialogContainer>
            </MorphingDialog>
          ))}
        </Mriezka>
        <Pozn>Reálny obsah: fakty.ts (DOKAZY s obrázkom). Zatváranie: Esc, klik mimo, X (44 px). Focus trap a návrat fokusu na kartu.</Pozn>
      </Kus>

      {/* ---------------- TextScramble ---------------- */}
      <Kus
        id="mp-textscramble"
        nazov="TextScramble"
        subor="vendor/motionprimitives/text-scramble.tsx"
        veta="Text sa zloží zľava doprava zo šumu (bez Motion runtime, ~1 kB); spúšťa sa prepnutím trigger."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setTrig((t) => !t)}>
            trigger = {String(trig)}
          </Button>
          <span className="font-mono text-sm">onScrambleComplete: {hotovo}×</span>
        </div>
        <Mriezka cols={3}>
          <Varianta props="duration=0.8 speed=0.04 characterSet=SCRAMBLE_CHARS_SK (default)">
            <TextScramble trigger={trig} as="span" className="font-display text-2xl font-extrabold" onScrambleComplete={() => setHotovo((h) => h + 1)}>
              {MOTTO_1}
            </TextScramble>
          </Varianta>
          <Varianta props="duration=2 speed=0.08 characterSet='X×'">
            <TextScramble trigger={trig} duration={2} speed={0.08} characterSet="X×" as="span" className="font-display text-2xl font-extrabold">
              {MOTTO_2}
            </TextScramble>
          </Varianta>
          <Varianta props="as='h4' duration=0.4 speed=0.02">
            <TextScramble trigger={trig} as="h4" duration={0.4} speed={0.02} className="font-mono text-xl font-bold normal-case">
              {`Znaky: ${SCRAMBLE_CHARS_SK.slice(26, 44)}`}
            </TextScramble>
          </Varianta>
        </Mriezka>
      </Kus>

      {/* ---------------- TransitionPanel ---------------- */}
      <Kus
        id="mp-transition-panel"
        nazov="TransitionPanel"
        subor="vendor/motionprimitives/transition-panel.tsx"
        veta="Prepínanie panelov (AnimatePresence popLayout): kroky kvízu, záložky; varianty enter / center / exit."
      >
        <Realne zdroj="cesta.ts (CESTA) · variants=transitionPanelSlideVariants · transition schody(4)">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Cesta">
            {CESTA.map((k, i) => (
              <Button
                key={k.nazov}
                role="tab"
                aria-selected={panel === i}
                variant={panel === i ? 'secondary' : 'outline'}
                size="sm"
                className="min-h-11"
                onClick={() => setPanel(i)}
              >
                {k.nazov}
              </Button>
            ))}
          </div>
          <TransitionPanel
            activeIndex={panel}
            variants={transitionPanelSlideVariants}
            transition={{ duration: 0.28, ease: schody(4) }}
            className="mt-4 overflow-hidden rounded-lg border-3 border-ink bg-white"
          >
            {CESTA.map((k) => (
              <div key={k.nazov} className="p-5 sm:p-6">
                <p className="eyebrow">{k.kedy}</p>
                <p className="mt-1 font-display text-3xl font-extrabold uppercase">{k.nazov}</p>
                <p className="mt-2 max-w-prose">{k.text}</p>
                {k.citat ? <p className="mt-3 font-serif text-xl italic">„{k.citat}“</p> : null}
              </div>
            ))}
          </TransitionPanel>
        </Realne>
      </Kus>
    </>
  );
}
