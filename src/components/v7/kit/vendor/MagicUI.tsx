/** Katalóg vendor · Magic UI (MIT): Marquee, Terminal (+ TypingAnimation, AnimatedSpan), NumberTicker, ScrollProgress,
 *  Dock (+ DockIcon), ShineBorder, Confetti (+ ConfettiButton, fireConfetti, useConfetti). */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArticleIcon,
  FirstAidKitIcon,
  GameControllerIcon,
  HouseIcon,
  PillIcon,
  UserIcon,
} from '@phosphor-icons/react';
import { Marquee } from '@/components/vendor/magicui/marquee';
import { AnimatedSpan, Terminal, TypingAnimation } from '@/components/vendor/magicui/terminal';
import { NumberTicker } from '@/components/vendor/magicui/number-ticker';
import { ScrollProgress } from '@/components/vendor/magicui/scroll-progress';
import { Dock, DockIcon } from '@/components/vendor/magicui/dock';
import { ShineBorder } from '@/components/vendor/magicui/shine-border';
import { Confetti, ConfettiButton, fireConfetti, useConfetti, type ConfettiRef } from '@/components/vendor/magicui/confetti';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KORPUS, MARQUEE_FAKTY, VYSLEDKY } from '@/data/fakty';
import { NAV } from '@/data/nav';
import { VLAJKA } from '@/data/ponuka';
import { Kus, Mriezka, Pozn, Realne, Varianta, Zakazane, Znova, tokenHex } from './shared';

/** Konfety len v povolených tónoch (vendor default berie aj pastely) — hex sa počíta z tokenov za behu. */
function useBrandColors() {
  const [c, setC] = useState<string[] | undefined>(undefined);
  useEffect(() => {
    const out = ['yellow', 'hot', 'ink', 'white'].map(tokenHex).filter((x): x is string => !!x);
    setC(out.length ? out : undefined);
  }, []);
  return c;
}

const DOCK_IKONY = [HouseIcon, UserIcon, FirstAidKitIcon, PillIcon, ArticleIcon, GameControllerIcon];

function ZapisPotvrdenie({ colors }: { colors?: string[] }) {
  const ctx = useConfetti();
  return (
    <Button variant="accent" size="lg" onClick={() => void ctx?.fire({ colors, origin: { y: 0.8 } })}>
      useConfetti() → fire
    </Button>
  );
}

export default function MagicUI() {
  const colors = useBrandColors();
  const confettiRef = useRef<ConfettiRef>(null);
  const [kluc, setKluc] = useState(0);
  const faktyPas = useMemo(
    () =>
      MARQUEE_FAKTY.map((f) => (
        <span key={f.label} className="flex items-center gap-4 font-display text-2xl font-extrabold uppercase sm:text-3xl">
          {f.value}
          <span aria-hidden="true" className="text-hot">
            ×
          </span>
        </span>
      )),
    [],
  );

  return (
    <>
      <ScrollProgress color="yellow" />

      {/* ---------------- Marquee ---------------- */}
      <Kus
        id="mu-marquee"
        nazov="Marquee"
        subor="vendor/magicui/marquee.tsx"
        veta="Nekonečný pás cez globálne .marquee (CSS, 0 JS pohybu): smer, pauza pri hoveri, zvislý režim, opakovania, rýchlosť, medzera, rám."
      >
        <div className="grid min-w-0 gap-4">
          <Varianta props="default · repeat=4 · duration=40 · gap='2rem' · pauseOnHover">
            <div className="w-full min-w-0 overflow-hidden">
              <Marquee>{faktyPas}</Marquee>
            </div>
          </Varianta>
          <Varianta props="reverse · duration=12 · gap='4rem' · bordered · pauseOnHover={false}">
            <div className="w-full min-w-0 overflow-hidden bg-yellow">
              <Marquee reverse duration={12} gap="4rem" bordered pauseOnHover={false} className="py-3">
                {faktyPas}
              </Marquee>
            </div>
          </Varianta>
          <Mriezka cols={2}>
            <Varianta props="vertical · repeat=2 · duration=10 (rodič s pevnou výškou)">
              <div className="h-48 w-full overflow-hidden">
                <Marquee vertical repeat={2} duration={10} gap="1rem">
                  {VYSLEDKY.map((f) => (
                    <span key={f.label} className="block rounded-lg border-3 border-ink bg-white px-3 py-2 font-mono text-sm">
                      {f.value} · {f.label}
                    </span>
                  ))}
                </Marquee>
              </div>
            </Varianta>
            <Varianta props="repeat=3 → zaokrúhli na 4 (párne kvôli −50 %)">
              <Pozn>
                Marquee opakuje obsah párny počet krát; nepárne číslo zvýši o 1. Pri reduced motion pás stojí (global.css + vlastné
                pravidlo). Kópie majú aria-hidden.
              </Pozn>
            </Varianta>
          </Mriezka>
        </div>
      </Kus>

      {/* ---------------- Terminal ---------------- */}
      <Kus
        id="mu-terminal"
        nazov="Terminal · TypingAnimation · AnimatedSpan"
        subor="vendor/magicui/terminal.tsx"
        veta="Okno terminálu, v ktorom riadky bežia jeden po druhom: písanie po znakoch a riadky, ktoré sa objavia."
      >
        <div className="flex justify-end">
          <Znova onClick={() => setKluc((k) => k + 1)} />
        </div>
        <Mriezka cols={2} key={kluc}>
          <Varianta props='variant="ink" · sequence · startOnView · title' plocha="bg-paper">
            <Terminal title="claude · xvadur.com">
              <TypingAnimation>$ claude "postav rezerváciu pre makléra"</TypingAnimation>
              <AnimatedSpan className="text-yellow">✔ web s rezerváciou termínu</AnimatedSpan>
              <AnimatedSpan className="text-yellow">✔ CRM s 23 tabuľkami</AnimatedSpan>
              <AnimatedSpan className="text-yellow">✔ 47 / 47 kontrol pred vydaním</AnimatedSpan>
              <TypingAnimation duration={30}>Hotovo. Odovzdané.</TypingAnimation>
            </Terminal>
          </Varianta>
          <Varianta props='variant="white" · sequence={false} · AnimatedSpan delay · TypingAnimation duration=90 delay as="p"' plocha="bg-paper">
            <Terminal variant="white" sequence={false} title="korpus">
              <AnimatedSpan delay={0}>› slová: {KORPUS.slova}</AnimatedSpan>
              <AnimatedSpan delay={400}>› prompty: {KORPUS.prompty}</AnimatedSpan>
              <AnimatedSpan delay={800}>› od {KORPUS.od}</AnimatedSpan>
              <TypingAnimation as="p" duration={90} delay={1200}>
                každý deň aspoň jeden prompt
              </TypingAnimation>
            </Terminal>
          </Varianta>
        </Mriezka>
        <Pozn>Reduced motion: text sa vypíše naraz, riadky bez posunu (fade 120 ms). TypingAnimation berie iba string.</Pozn>
      </Kus>

      {/* ---------------- NumberTicker ---------------- */}
      <Kus
        id="mu-ticker"
        nazov="NumberTicker"
        subor="vendor/magicui/number-ticker.tsx"
        veta="Číslo, ktoré nabehne pružinou pri prvom zobrazení; slovenský formát (pevná medzera tisícov), prefix, sufix, smer."
      >
        <Mriezka cols={3} key={`t-${kluc}`}>
          <Varianta props="value · startValue=0 (default)">
            <NumberTicker value={572469} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props='direction="down" · startValue=0 · value=65'>
            <NumberTicker value={65} direction="down" className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="decimalPlaces=1 · suffix='\u00a0mld.' (NBSP, obyčajná medzera sa v inline-flex stratí) · delay=0.4">
            <NumberTicker value={16.3} decimalPlaces={1} suffix={'\u00a0mld.'} delay={0.4} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="prefix='×\u00a0' · startValue=40 · value=47 · suffix='\u00a0/ 47'">
            <NumberTicker value={47} startValue={40} prefix={'×\u00a0'} suffix={'\u00a0/ 47'} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="locale='en-US' (porovnanie formátu)">
            <NumberTicker value={2034} locale="en-US" className="font-display text-4xl font-extrabold" />
          </Varianta>
        </Mriezka>
        <Realne zdroj="fakty.ts (KORPUS, VYSLEDKY)">
          <p className="font-display text-display-xs font-extrabold uppercase leading-none">
            <NumberTicker value={Number(KORPUS.slova.replace(/\s/g, ''))} suffix={'\u00a0slov'} />
          </p>
          <p className="mt-2 font-mono text-sm">
            Korpus od {KORPUS.od}, {KORPUS.prompty} promptov, k {KORPUS.kDatumu}.
          </p>
        </Realne>
      </Kus>

      {/* ---------------- ScrollProgress ---------------- */}
      <Kus
        id="mu-scroll"
        nazov="ScrollProgress"
        subor="vendor/magicui/scroll-progress.tsx"
        veta="Pás priebehu čítania prilepený hore (Motion useScroll); je to stav, nie animácia, preto beží aj pri reduced motion."
      >
        <Varianta props='color="yellow" (práve beží hore na stránke) · color="hot" | "ink" | "yellow"'>
          <Pozn>
            Pozri úplný vrch okna: žltý pás s inkovým rámom rastie so scrollom. Na článkoch by stačil variant cez CSS
            animation-timeline: scroll() (0 JS) — pozri sekciu Pohybové motory. Hot sa sem nehodí (zákon: hot len CTA a X).
          </Pozn>
        </Varianta>
        <Zakazane prop="color" tony={['pink', 'lilac', 'lime', 'sky']} />
      </Kus>

      {/* ---------------- Dock ---------------- */}
      <Kus
        id="mu-dock"
        nazov="Dock · DockIcon"
        subor="vendor/magicui/dock.tsx"
        veta="Lišta ikon, ktoré sa pri myši zväčšujú (Motion spring); ikony sú odkazy s aria-label, dotyk = bez zväčšenia."
      >
        <Mriezka cols={2}>
          {(['white', 'paper', 'yellow', 'ink'] as const).map((bg) => (
            <Varianta key={bg} props={`bg="${bg}" · iconSize=44 · iconMagnification=64`}>
              <Dock bg={bg}>
                {(['yellow', 'white', 'paper', 'hot'] as const).map((c, i) => {
                  const Ik = DOCK_IKONY[i]!;
                  return (
                    <DockIcon key={c} color={c} label={`color ${c}`}>
                      <Ik weight="bold" className="size-full" />
                    </DockIcon>
                  );
                })}
              </Dock>
            </Varianta>
          ))}
          <Varianta props='direction="top" | "bottom" · iconDistance=60 · iconMagnification=80'>
            <Dock direction="bottom" iconDistance={60} iconMagnification={80}>
              <DockIcon label="dolu 1">
                <HouseIcon weight="bold" className="size-full" />
              </DockIcon>
              <DockIcon label="dolu 2" color="white">
                <UserIcon weight="bold" className="size-full" />
              </DockIcon>
            </Dock>
            <Dock direction="top" iconDistance={60} iconMagnification={80}>
              <DockIcon label="hore 1">
                <PillIcon weight="bold" className="size-full" />
              </DockIcon>
              <DockIcon label="hore 2" color="white">
                <ArticleIcon weight="bold" className="size-full" />
              </DockIcon>
            </Dock>
          </Varianta>
          <Varianta props="disableMagnification · iconSize=52 · DockIcon href external">
            <Dock disableMagnification iconSize={52}>
              <DockIcon label="Hriech (externý odkaz)" href="https://hriech.xvadur.com/" external color="white">
                <ArticleIcon weight="bold" className="size-full" />
              </DockIcon>
              <DockIcon label="Na vrch katalógu" href="#top" color="yellow">
                <HouseIcon weight="bold" className="size-full" />
              </DockIcon>
            </Dock>
          </Varianta>
        </Mriezka>
        <Zakazane prop="bg|color" tony={['pink', 'lilac', 'lime', 'sky']} />
        <Realne zdroj="nav.ts (NAV) — navigácia domova ako dock">
          <Dock bg="ink">
            <DockIcon label="Domov" href="/" color="yellow">
              <HouseIcon weight="bold" className="size-full" />
            </DockIcon>
            {NAV.map((n, i) => {
              const Ik = DOCK_IKONY[i + 1] ?? HouseIcon;
              return (
                <DockIcon key={n.href} label={n.label} href={n.href} color="white">
                  <Ik weight="bold" className="size-full" />
                </DockIcon>
              );
            })}
          </Dock>
        </Realne>
      </Kus>

      {/* ---------------- ShineBorder ---------------- */}
      <Kus
        id="mu-shine"
        nazov="ShineBorder"
        subor="vendor/magicui/shine-border.tsx"
        veta="Lesk, ktorý obieha po ráme rodiča (relative + rounded); pri reduced motion stojí."
      >
        <Mriezka cols={3}>
          <Varianta props="default · borderWidth=3 · duration=14 · hot + yellow">
            <div className="relative w-full rounded-lg bg-white p-6">
              <ShineBorder />
              <p className="font-display text-xl font-extrabold uppercase">Default</p>
            </div>
          </Varianta>
          <Varianta props="borderWidth=6 · duration=4 · shineColor='var(--color-ink)'">
            <div className="relative w-full rounded-lg bg-yellow p-6">
              <ShineBorder borderWidth={6} duration={4} shineColor="var(--color-ink)" />
              <p className="font-display text-xl font-extrabold uppercase">Rýchly ink</p>
            </div>
          </Varianta>
          <Varianta props="shineColor=[yellow, stamp, ink]">
            <div className="relative w-full rounded-lg bg-paper p-6">
              <ShineBorder shineColor={['var(--color-yellow)', 'var(--color-stamp)', 'var(--color-ink)']} />
              <p className="font-display text-xl font-extrabold uppercase">Alarm</p>
            </div>
          </Varianta>
        </Mriezka>
        <Realne zdroj="ponuka.ts (VLAJKA)">
          <div className="relative max-w-md rounded-lg border-3 border-ink bg-white p-6 shadow-brutal">
            <ShineBorder borderWidth={3} duration={8} shineColor="var(--color-yellow)" />
            <p className="eyebrow">Hlavná ponuka</p>
            <p className="mt-2 font-display text-3xl font-extrabold uppercase">{VLAJKA.nazov}</p>
            <p className="mt-2">{VLAJKA.titulok}</p>
          </div>
        </Realne>
      </Kus>

      {/* ---------------- Confetti ---------------- */}
      <Kus
        id="mu-confetti"
        nazov="Confetti · ConfettiButton · fireConfetti · useConfetti"
        subor="vendor/magicui/confetti.tsx"
        veta="Štvorcové konfety (canvas-confetti) na vlastnom plátne, z tlačidla alebo imperatívne; pri reduced motion nič nevystrelí."
      >
        <Mriezka cols={3}>
          <Varianta props="ConfettiButton (default: štvorce, 120 ks)">
            <ConfettiButton options={{ colors }}>Zapísané</ConfettiButton>
          </Varianta>
          <Varianta props="ConfettiButton options={{ spread: 160, particleCount: 60, scalar: 2 }}">
            <ConfettiButton options={{ colors, spread: 160, particleCount: 60, scalar: 2 }} className="bg-yellow">
              Veľké
            </ConfettiButton>
          </Varianta>
          <Varianta props="fireConfetti({ angle: 60, origin: { x: 0 } })">
            <Button variant="outline" onClick={() => void fireConfetti({ colors, angle: 60, origin: { x: 0, y: 0.7 } })}>
              Zľava
            </Button>
            <Button variant="outline" onClick={() => void fireConfetti({ colors, angle: 120, origin: { x: 1, y: 0.7 } })}>
              Sprava
            </Button>
          </Varianta>
        </Mriezka>
        <Varianta props="<Confetti ref manualstart options globalOptions={{ resize, useWorker }}> · ref.fire() · useConfetti()">
          <div className="relative h-56 w-full overflow-hidden rounded-lg border-3 border-ink bg-paper tx-dots">
            <Confetti
              ref={confettiRef}
              manualstart
              options={{ colors, gravity: 1.6, ticks: 120 }}
              globalOptions={{ resize: true, useWorker: true }}
              className="absolute inset-0 size-full"
            >
              <div className="relative z-10 flex h-full flex-wrap items-center justify-center gap-3 p-4">
                <Button onClick={() => void confettiRef.current?.fire({ origin: { y: 0.9 } })}>ref.fire()</Button>
                <ZapisPotvrdenie colors={colors} />
              </div>
            </Confetti>
          </div>
        </Varianta>
        <Pozn>
          Vendor default farby obsahujú pastely (TOKEN_COLORS v confetti.tsx) — v ukážkach ich prebíja `colors` z tokenov yellow, hot, ink,
          white. Plátno Confetti musí byť absolute v rodičovi s rozmermi.
        </Pozn>
        <div>
          <Badge variant="outline">canvas-confetti 1.9.4 · useWorker</Badge>
        </div>
      </Kus>
    </>
  );
}
