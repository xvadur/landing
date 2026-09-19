/** Lab: Motion Primitives — každý vendorovaný komponent naživo s tokenmi a skutočným obsahom
 *  (motto, fakty.ts, frazy.ts, beaty.ts). Zároveň kompilačný test. Mount: `client:visible`
 *  (žiadny window pri importe). Nadpisy začínajú h2 — h1 dáva stránka. */
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { ArrowRightIcon, ArrowLeftIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { KOTVY, MARQUEE_FAKTY, POSTAVIL } from '@/data/fakty';
import { FRAZY_RODINY } from '@/data/frazy';
import { BEATY } from '@/data/beaty';
import { cn } from '@/lib/utils';
import {
  AnimatedNumber,
  Cursor,
  InView,
  inViewDropVariants,
  Magnetic,
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  TextScramble,
  TransitionPanel,
  transitionPanelSlideVariants,
} from '@/components/vendor/motionprimitives';

const BTN =
  'press inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink px-5 font-display text-lg font-extrabold uppercase shadow-brutal';
const BTN_HOT = cn(BTN, 'bg-hot text-ink hover:bg-hot-hover');
const BTN_WHITE = cn(BTN, 'bg-white text-ink hover:bg-white-hover');

const PASTELY = ['bg-yellow', 'bg-pink', 'bg-lilac', 'bg-lime', 'bg-sky'] as const;

function Nadpis({ cislo, nazov, poznamka }: { cislo: string; nazov: string; poznamka: string }) {
  return (
    <header className="mb-6">
      <p className="eyebrow">Motion Primitives · {cislo}</p>
      <h2 className="mt-2 font-display text-display-sm font-extrabold uppercase tracking-tight">{nazov}</h2>
      <p className="mt-2 max-w-2xl text-ink/60">{poznamka}</p>
    </header>
  );
}

/* 1 — TextScramble: motto (ratifikované 19. 9.: len dva riadky, bez slovenského) */
function UkazkaScramble() {
  const [beh, setBeh] = useState(true);
  const znova = () => {
    setBeh(false);
    window.setTimeout(() => setBeh(true), 30);
  };
  return (
    <section aria-labelledby="mp-scramble">
      <Nadpis cislo="text-scramble" nazov="Scramble" poznamka="Záloha za React Bits ScrambleText. Sada znakov má slovenskú diakritiku a X. Pri reduced motion sa text vykreslí rovno." />
      <div className="brutal bg-yellow p-6 sm:p-10">
        <p id="mp-scramble" className="sr-only">Motto</p>
        <TextScramble
          as="span"
          trigger={beh}
          className="block font-display text-display font-extrabold uppercase leading-[0.9] tracking-tight"
          aria-label="DIVIDED,"
        >
          DIVIDED,
        </TextScramble>
        <TextScramble
          as="span"
          trigger={beh}
          duration={1.1}
          className="block font-display text-display font-extrabold uppercase leading-[0.9] tracking-tight"
          aria-label="WE ARE USELESS."
        >
          WE ARE USELESS.
        </TextScramble>
        <button type="button" onClick={znova} className={cn(BTN_WHITE, 'mt-8')}>
          <ArrowsClockwiseIcon weight="bold" size={22} aria-hidden="true" />
          Znova
        </button>
      </div>
    </section>
  );
}

/* 2 — Magnetic: CTA VSTÚP (doc 10 §3 #5, záloha za React Bits Magnet) */
function UkazkaMagnetic() {
  return (
    <section aria-labelledby="mp-magnetic">
      <Nadpis cislo="magnetic" nazov="Magnetické CTA" poznamka="Tlačidlo VSTÚP sa ťahá za myšou v polomere 120 px; dotyk a reduced motion ho nechajú na mieste. Vzor tlačidla z global.css, hard shadow press." />
      <div className="brutal flex min-h-56 items-center justify-center bg-pink p-6 tx-dots">
        <h3 id="mp-magnetic" className="sr-only">Vstup</h3>
        <Magnetic intensity={0.5} range={120}>
          <a href="/hry/" className={BTN_HOT} data-cursor="vstup">
            Vstúp
            <ArrowRightIcon weight="bold" size={22} aria-hidden="true" />
          </a>
        </Magnetic>
      </div>
    </section>
  );
}

/* 3 — InView + AnimatedNumber: trhové kotvy (fakty.ts KOTVY, pack13 §1) */
function Kotva({ index, label, value, z, note }: { index: number; label: string; value: number; z: number; note: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const videne = useInView(ref, { once: true, margin: '-10% 0px' });
  return (
    <InView as="li" variants={inViewDropVariants} transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }} once viewOptions={{ once: true, margin: '-10% 0px' }} className="h-full">
      <div ref={ref} className={cn('brutal flex h-full flex-col gap-2 p-5', PASTELY[index % PASTELY.length])}>
        <p className="eyebrow">{label}</p>
        <p className="font-display text-display-sm font-extrabold tracking-tight">
          <AnimatedNumber value={videne ? value : 0} springOptions={{ stiffness: 90, damping: 22, mass: 0.6 }} />
          <span className="text-ink/60"> / {z.toLocaleString('sk-SK')}</span>
        </p>
        <p className="text-sm">{note}</p>
      </div>
    </InView>
  );
}

function UkazkaCisla() {
  const kotvy = [
    { label: 'Kancelárie', ...KOTVY.kancelarieSFrazou },
    { label: 'Prvý krok = kontakt', ...KOTVY.prvyKrokKontakt },
    { label: 'Prvý krok = rezervácia', ...KOTVY.prvyKrokRezervacia },
    { label: 'Dôkaz na webe', ...KOTVY.dokazNaWebe },
    { label: 'Makléri pod logom', ...KOTVY.makleriPodLogom },
    { label: 'Veta o aparáte', ...KOTVY.webyBezVety },
  ];
  return (
    <section aria-labelledby="mp-cisla">
      <Nadpis cislo="in-view + animated-number" nazov="Čísla pri scrolle" poznamka="InView (karta padne na miesto) a AnimatedNumber (spring od 0 po hodnotu, formát sk-SK). Zdroj: fakty.ts KOTVY, pack 13 §1. Záloha za NumberFlow." />
      <h3 id="mp-cisla" className="sr-only">Trhové kotvy</h3>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kotvy.map((k, i) => (
          <Kotva key={k.label} index={i} label={k.label} value={k.value} z={k.z} note={k.note} />
        ))}
      </ul>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Fakty z marquee">
        {MARQUEE_FAKTY.map((f) => (
          <li key={f.label} className="brutal-flat bg-white px-3 py-1 font-mono text-sm">
            {f.value}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* 4 — TransitionPanel: kroky kvízu na rodinách prázdnych fráz (frazy.ts) */
function UkazkaPanel() {
  const rodiny = FRAZY_RODINY.filter((r) => r.zakladna);
  const [i, setI] = useState(0);
  const [smer, setSmer] = useState(1);
  const posun = (d: number) => {
    setSmer(d);
    setI((x) => (x + d + rodiny.length) % rodiny.length);
  };
  return (
    <section aria-labelledby="mp-panel">
      <Nadpis cislo="transition-panel" nazov="Panely pre kvíz" poznamka="Krok kvízu vojde zdola, tvrdo. Obsah: 6 základných rodín prázdnych fráz z frazy.ts (počty kancelárií zo 47 a webov zo 416, pack 13)." />
      <div className="brutal bg-white p-5 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 id="mp-panel" className="eyebrow">
            Rodina {i + 1} / {rodiny.length}
          </h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => posun(-1)} className={cn(BTN_WHITE, 'min-w-12 justify-center px-3')} aria-label="Predchádzajúca rodina">
              <ArrowLeftIcon weight="bold" size={22} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => posun(1)} className={cn(BTN_HOT, 'min-w-12 justify-center px-3')} aria-label="Ďalšia rodina">
              <ArrowRightIcon weight="bold" size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
        <TransitionPanel
          activeIndex={i}
          variants={transitionPanelSlideVariants}
          transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
          custom={smer}
          className="overflow-hidden"
        >
          {rodiny.map((r) => (
            <article key={r.rodina} className="min-h-40">
              <p className="font-display text-display-xs font-extrabold uppercase tracking-tight">{r.rodina}</p>
              <p className="mt-2 font-mono text-sm">
                {r.z47} zo 47 kancelárií
                {typeof r.na416 === 'number' ? ` · ${r.na416} zo 416 webov` : ''}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {r.vzory.slice(0, 6).map((v) => (
                  <li key={v} className="brutal-flat bg-paper px-3 py-1 text-sm">
                    <mark className="bg-transparent text-ink line-through decoration-hot decoration-[3px]">{v}</mark>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </TransitionPanel>
      </div>
    </section>
  );
}

/* 5 — MorphingDialog: karta „Čo som postavil“ → detail (doc 10 §3 #13) */
function KartaProjekt({ index, id }: { index: number; id: string }) {
  const p = POSTAVIL.find((x) => x.id === id) ?? POSTAVIL[index];
  const farba = PASTELY[index % PASTELY.length];
  return (
    <MorphingDialog>
      <MorphingDialogTrigger
        className={cn('brutal lift press flex h-full w-full flex-col items-start gap-2 p-5 text-left', farba)}
        aria-label={`Otvoriť detail: ${p.nazov}`}
      >
        <MorphingDialogTitle className="font-display text-display-sm font-extrabold tracking-tight">{p.cislo}</MorphingDialogTitle>
        <MorphingDialogSubtitle className="font-display text-xl font-extrabold uppercase">{p.nazov}</MorphingDialogSubtitle>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className={cn('relative w-full max-w-lg p-6 sm:p-8', farba)}>
          <MorphingDialogTitle className="font-display text-display font-extrabold tracking-tight">{p.cislo}</MorphingDialogTitle>
          <MorphingDialogSubtitle className="mt-1 font-display text-2xl font-extrabold uppercase">{p.nazov}</MorphingDialogSubtitle>
          <MorphingDialogDescription disableLayoutAnimation className="mt-4 space-y-4">
            <p>{p.riadok}</p>
            <dl className="grid grid-cols-2 gap-2">
              {p.fakty.map((f) => (
                <div key={f.label} className="brutal-flat bg-white p-3">
                  <dt className="eyebrow">{f.label}</dt>
                  <dd className="font-display text-xl font-extrabold">{f.value}</dd>
                </div>
              ))}
            </dl>
            {p.url ? (
              <a href={p.url} className={BTN_WHITE} target="_blank" rel="noopener">
                {p.domena ?? p.url}
                <ArrowRightIcon weight="bold" size={22} aria-hidden="true" />
              </a>
            ) : p.domena ? (
              <p className="font-mono text-sm text-ink/60">{p.domena}</p>
            ) : null}
          </MorphingDialogDescription>
          <MorphingDialogClose />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

function UkazkaDialog() {
  const karty = POSTAVIL.slice(0, 4);
  return (
    <section aria-labelledby="mp-dialog">
      <Nadpis cislo="morphing-dialog" nazov="Karta → detail" poznamka="Karta sa rozmorfuje do detailu (layoutId). Backdrop ink 80 % bez blur, obsah v brutal rámci, zatvorenie 44 px, Esc, klik mimo, fokus sa vráti na kartu. Obsah: prvé 4 karty z fakty.ts POSTAVIL." />
      <h3 id="mp-dialog" className="sr-only">Čo som postavil</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {karty.map((p, i) => (
          <KartaProjekt key={p.id} index={i} id={p.id} />
        ))}
      </div>
    </section>
  );
}

/* 6 — Cursor: X ako kurzor nad plochou (attachToParent); Base má vlastný globálny X kurzor */
function XZnak({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 106 130" className={className} aria-hidden="true">
      <path fill="currentColor" d="M0 0H26L53 43L80 0H106L66 65L106 130H79L53 87L27 130H0L40 65Z" />
    </svg>
  );
}

function UkazkaCursor() {
  const [pozicia, setPozicia] = useState<{ x: number; y: number } | null>(null);
  const beat = BEATY[4];
  return (
    <section aria-labelledby="mp-cursor">
      <Nadpis cislo="cursor" nazov="Kurzor X nad plochou" poznamka="Len desktop s myšou (≥ 1024 px, hover, pointer: fine) a bez reduced motion; inak sa nevykreslí nič. Tu s attachToParent — globálny X kurzor rieši site/Cursor.tsx." />
      <div className="brutal relative min-h-56 overflow-hidden bg-lilac p-6 tx-halftone [--tx:14%]">
        <h3 id="mp-cursor" className="font-display text-xl font-extrabold uppercase">
          {beat.rok} · {beat.titulok}
        </h3>
        <p className="mt-2 max-w-md">{beat.text}</p>
        <p className="mt-4 font-mono text-sm text-ink/60" aria-live="off">
          {pozicia ? `x ${Math.round(pozicia.x)} · y ${Math.round(pozicia.y)}` : 'Prejdi myšou po ploche.'}
        </p>
        <Cursor
          attachToParent
          springConfig={{ stiffness: 900, damping: 60, mass: 0.3 }}
          onPositionChange={(x, y) => setPozicia({ x, y })}
          variants={{ initial: { scale: 0.4, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.4, opacity: 0 } }}
          transition={{ duration: 0.15 }}
        >
          <XZnak className="h-8 w-7 text-hot drop-shadow-[2px_2px_0_var(--color-ink)]" />
        </Cursor>
      </div>
    </section>
  );
}

export default function MotionPrimitivesLab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="space-y-16" data-mounted={mounted ? 'true' : 'false'} data-lab="motionprimitives">
      <UkazkaScramble />
      <UkazkaMagnetic />
      <UkazkaCisla />
      <UkazkaPanel />
      <UkazkaDialog />
      <UkazkaCursor />
    </div>
  );
}
