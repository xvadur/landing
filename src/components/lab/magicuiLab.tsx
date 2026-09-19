/** Magic UI Lab — ranná prehliadka + kompilačný test každého vendorovaného Magic UI komponentu.
 *  Ostrov: <MagicuiLab client:only="react" /> (Confetti a Dock siahajú na window/canvas; client:visible tiež prejde,
 *  lebo všetko okrem canvas-confetti je SSR-safe). Texty: motto, fakty z @/data/fakty.ts, klišé z @/data/frazy.ts.
 *  Žiadne nové čísla. Odkazy: len Substack + GitHub (overené 200, 19. 9. 2026), mailto adam@xvadur.com, wa.me payload. */
import { useRef, useState } from 'react';
import { ArrowUpIcon, ConfettiIcon, EnvelopeIcon, GithubLogoIcon, NewspaperIcon, WhatsappLogoIcon } from '@phosphor-icons/react';

import { KOTVY, MARQUEE_FAKTY, POSTAVIL } from '@/data/fakty';
import { CITACIE, FRAZY_RODINY } from '@/data/frazy';
import { EMAIL, whatsappUrl } from '@/components/port/Wizard';
import { Marquee } from '@/components/vendor/magicui/marquee';
import { AnimatedSpan, Terminal, TypingAnimation } from '@/components/vendor/magicui/terminal';
import { Confetti, ConfettiButton, type ConfettiRef } from '@/components/vendor/magicui/confetti';
import { ScrollProgress } from '@/components/vendor/magicui/scroll-progress';
import { Dock, DockIcon } from '@/components/vendor/magicui/dock';
import { NumberTicker } from '@/components/vendor/magicui/number-ticker';
import { ShineBorder } from '@/components/vendor/magicui/shine-border';

const MOTTO = ['DIVIDED,', 'WE ARE USELESS.'];
const SYSTEM = POSTAVIL.find((p) => p.id === 'system-pre-maklera');
const ZAKLADNE = FRAZY_RODINY.filter((r) => r.zakladna);

const WA_PAYLOAD = 'Ahoj Adam, chcem 30 minút o svojom AI probléme.';

function Blok({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="border-b-3 border-ink py-12">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h2 id={`${id}-h`} className="mb-6 font-display text-display-xs font-extrabold uppercase tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function MagicuiLab() {
  const confettiRef = useRef<ConfettiRef>(null);
  const [tickerKey, setTickerKey] = useState(0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <ScrollProgress color="hot" />

      <header className="border-b-3 border-ink py-10">
        <p className="eyebrow mb-3">Magic UI · vendorované · MIT</p>
        <p className="font-display text-display font-extrabold uppercase leading-[0.9] tracking-tighter" aria-label="Motto">
          {MOTTO[0]}
          <br />
          {MOTTO[1]}
        </p>
        <p className="mt-4 max-w-2xl text-lg text-ink/70">
          Sedem komponentov v brutal ráme: marquee, terminál, konfety, priebeh scrollu, dock, číselník, lesklý rám. Tokeny, žiadny
          ručný hex. Pri obmedzenom pohybe všetko stojí alebo sa len prelína.
        </p>
      </header>

      {/* 1 · Marquee */}
      <Blok id="marquee" eyebrow="§3 #7" title="Marquee">
        <Marquee bordered duration={30} className="bg-yellow py-3 font-display text-2xl font-extrabold uppercase">
          {MARQUEE_FAKTY.map((f) => (
            <span key={f.label} className="flex items-center gap-6">
              <span>{f.value}</span>
              <span className="text-hot" aria-hidden="true">
                ×
              </span>
            </span>
          ))}
        </Marquee>
        <Marquee reverse bordered duration={36} className="mt-4 bg-pink py-3 font-mono text-sm uppercase">
          {CITACIE.slice(0, 6).map((c) => (
            <span key={`${c.kto}-${c.text}`} className="flex items-center gap-6">
              <span>
                „{c.text}“ <span className="text-ink/60">— {c.kto}</span>
              </span>
              <span className="text-hot" aria-hidden="true">
                ×
              </span>
            </span>
          ))}
        </Marquee>
        <div className="mt-4 flex gap-4">
          <Marquee vertical bordered duration={18} className="h-48 w-64 bg-lilac px-4 py-2 font-display text-lg font-bold uppercase">
            {ZAKLADNE.map((r) => (
              <span key={r.rodina} className="py-1">
                {r.rodina}
              </span>
            ))}
          </Marquee>
          <p className="max-w-md self-center text-ink/70">
            Vertikálny pás: šesť základných rodín fráz z Dňa 1. Vodorovný pás beží cez globálne triedy <code>.marquee</code>, vertikál cez vlastné
            keyframes. Hover = pauza.
          </p>
        </div>
      </Blok>

      {/* 2 · Terminal */}
      <Blok id="terminal" eyebrow="§3 #13" title="Terminal">
        <div className="grid gap-6 lg:grid-cols-2">
          <Terminal title="xvadur · systém pre makléra" className="max-w-none">
            <TypingAnimation className="text-yellow">$ xvadur check --pred-vydanim</TypingAnimation>
            <AnimatedSpan className="text-lime">✓ web</AnimatedSpan>
            <AnimatedSpan className="text-lime">✓ rezervácie</AnimatedSpan>
            <AnimatedSpan className="text-lime">✓ CRM · 23 tabuliek</AnimatedSpan>
            <AnimatedSpan className="text-lime">✓ follow-upy</AnimatedSpan>
            <AnimatedSpan className="text-lime">✓ Telegram</AnimatedSpan>
            <TypingAnimation className="font-bold text-paper">{`${SYSTEM?.cislo ?? '47 / 47'} kontrol prešlo.`}</TypingAnimation>
          </Terminal>
          <Terminal variant="white" title="skóre webu · vzorka" className="max-w-none">
            <TypingAnimation className="text-hot">$ xvadur skore --frazy</TypingAnimation>
            {ZAKLADNE.map((r) => (
              <AnimatedSpan key={r.rodina}>
                {r.z47 !== null ? `${String(r.z47).padStart(2, ' ')} / 47` : '   —   '} · {r.rodina}
              </AnimatedSpan>
            ))}
            <TypingAnimation className="font-bold">{`${KOTVY.kancelarieSFrazou.value} / ${KOTVY.kancelarieSFrazou.z} kancelárií má aspoň jednu.`}</TypingAnimation>
          </Terminal>
        </div>
      </Blok>

      {/* 3 · Confetti */}
      <Blok id="confetti" eyebrow="§3 #16" title="Confetti">
        <div className="relative overflow-hidden rounded-lg border-3 border-ink bg-lime p-6 shadow-brutal">
          <Confetti ref={confettiRef} manualstart className="absolute inset-0 z-0 size-full" />
          <div className="relative z-10 flex flex-wrap items-center gap-4">
            <ConfettiButton>
              <ConfettiIcon weight="bold" className="size-6" />0 fráz. Hotovo.
            </ConfettiButton>
            <button
              type="button"
              onClick={() => confettiRef.current?.fire({ origin: { y: 0.4 } })}
              className="press inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-white px-5 font-display text-lg font-extrabold uppercase shadow-brutal"
            >
              Vystreliť do plátna
            </button>
            <p className="max-w-sm text-sm text-ink/70">
              Štvorce vo farbách tokenov (yellow, pink, lilac, lime, sky, hot). Pri obmedzenom pohybe sa nič nevystrelí.
            </p>
          </div>
        </div>
      </Blok>

      {/* 4 · NumberTicker */}
      <Blok id="number-ticker" eyebrow="§3 #14 · záloha k NumberFlow" title="Number Ticker">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" key={tickerKey}>
          <Karta label={KOTVY.makleriPodLogom.note}>
            <NumberTicker value={KOTVY.makleriPodLogom.value} suffix={` / ${KOTVY.makleriPodLogom.z}`} />
          </Karta>
          <Karta label={KOTVY.prvyKrokKontakt.note}>
            <NumberTicker value={KOTVY.prvyKrokKontakt.value} suffix={` / ${KOTVY.prvyKrokKontakt.z}`} delay={0.2} />
          </Karta>
          <Karta label={KOTVY.prvyKrokRezervacia.note}>
            <NumberTicker value={KOTVY.prvyKrokRezervacia.value} suffix={` / ${KOTVY.prvyKrokRezervacia.z}`} delay={0.4} />
          </Karta>
          <Karta label={KOTVY.webyBezVety.note}>
            <NumberTicker value={KOTVY.webyBezVety.z} startValue={KOTVY.webyBezVety.z} direction="down" suffix={` → ${KOTVY.webyBezVety.value}`} delay={0.6} />
          </Karta>
        </div>
        <button
          type="button"
          onClick={() => setTickerKey((k) => k + 1)}
          className="press mt-4 inline-flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-white px-5 font-display text-lg font-extrabold uppercase shadow-brutal"
        >
          Spustiť znova
        </button>
      </Blok>

      {/* 5 · ShineBorder */}
      <Blok id="shine-border" eyebrow="§3 · voliteľné" title="Shine Border">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative rounded-lg border-3 border-ink bg-white p-6 shadow-brutal">
            <ShineBorder />
            <p className="eyebrow mb-2">Lesk hot → yellow</p>
            <p className="font-display text-2xl font-extrabold uppercase">{MARQUEE_FAKTY[1]?.value}</p>
            <p className="text-ink/70">{MARQUEE_FAKTY[1]?.note}</p>
          </div>
          <div className="relative rounded-lg border-3 border-ink bg-ink p-6 text-paper shadow-brutal">
            <ShineBorder shineColor={['var(--color-sky)', 'var(--color-pink)', 'var(--color-lime)']} duration={8} />
            <p className="eyebrow mb-2 text-paper/70">Lesk sky → pink → lime</p>
            <p className="font-display text-2xl font-extrabold uppercase">{MARQUEE_FAKTY[0]?.value}</p>
            <p className="text-paper/70">{MARQUEE_FAKTY[0]?.note}</p>
          </div>
        </div>
      </Blok>

      {/* 6 · Dock */}
      <Blok id="dock" eyebrow="§3 #24 · pätička" title="Dock">
        <Dock bg="paper" className="mt-0">
          <DockIcon href="https://substack.com/@xvadur" label="Substack" external color="yellow">
            <NewspaperIcon weight="bold" className="size-6" />
          </DockIcon>
          <DockIcon href="https://github.com/xvadur" label="GitHub" external color="lilac">
            <GithubLogoIcon weight="bold" className="size-6" />
          </DockIcon>
          <DockIcon href={`mailto:${EMAIL}`} label={`E-mail ${EMAIL}`} color="sky">
            <EnvelopeIcon weight="bold" className="size-6" />
          </DockIcon>
          <DockIcon href={whatsappUrl(WA_PAYLOAD)} label="WhatsApp" external color="lime">
            <WhatsappLogoIcon weight="bold" className="size-6" />
          </DockIcon>
          <DockIcon href="#marquee" label="Hore" color="hot">
            <ArrowUpIcon weight="bold" className="size-6" />
          </DockIcon>
        </Dock>
        <p className="mt-4 max-w-md text-sm text-ink/70">
          Základ 44 px, zväčšenie na 64 px pri myši (pružina). Pri obmedzenom pohybe a na dotyku bez zväčšenia. Sociálne odkazy len Substack a
          GitHub.
        </p>
      </Blok>

      <ScrollProgress color="ink" className="top-2 h-1 border-b-0" />
    </div>
  );
}

function Karta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-3 border-ink bg-white p-5 shadow-brutal">
      <p className="font-display text-4xl font-extrabold tabular-nums">{children}</p>
      <p className="mt-2 text-sm text-ink/70">{label}</p>
    </div>
  );
}
