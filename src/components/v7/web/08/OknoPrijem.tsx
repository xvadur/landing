/** V7-08 · okno Príjem (hero). Po boote systému sa otvorí prvé (po krokoch). Fotka Adama = zástupná plocha 4 : 5 ako
 *  nálepka (ink rám, tvrdý tieň), motto z hero-data (DecryptedText, React Bits), veta, CTA na vyšetrenie (hot, text ink). */
import { ArrowRight, Stethoscope } from 'lucide-react';
import DecryptedText from '@/components/vendor/reactbits/DecryptedText';
import { Button } from '@/components/ui/button';
import { Sticker, Stamp } from '@/components/ui/sticker';
import { CrossShape, PillShape } from '@/components/ui/shapes';
import { KbdCombo } from '@/components/ui/kbd';
import { CTA_HLAVNE, MENO, MOTTO_1, MOTTO_2, NALEPKA_NEMOCNICA, PECIATKA, VETA } from '@/components/hero/hero-data';
import Okno from './Okno';
import { otvorOkno, posli } from './store';

export function FotkaAdama({ className = '' }: { className?: string }) {
  return (
    <figure
      className={`fotka relative aspect-[4/5] w-full overflow-hidden border-3 border-ink bg-paper shadow-[8px_8px_0_0_var(--color-ink)] ${className}`}
      role="img"
      aria-label="Zástupná plocha: fotka Adama od ramien hore v zdravotníckej uniforme s fonendoskopom"
    >
      <div className="tx-halftone absolute inset-0 [--tx:22%]" aria-hidden="true" />
      {/* piktogram sestry: hlava, plecia, fonendoskop — iba tvary, žiadna tvár */}
      <svg viewBox="0 0 200 250" className="absolute inset-x-0 bottom-0 h-[86%] w-full" aria-hidden="true">
        <circle cx="100" cy="86" r="44" fill="var(--color-white)" stroke="var(--color-ink)" strokeWidth="6" />
        <path d="M22 250 C 26 178 56 150 100 150 C 144 150 174 178 178 250 Z" fill="var(--color-white)" stroke="var(--color-ink)" strokeWidth="6" />
        <path d="M78 152 L100 190 L122 152" fill="none" stroke="var(--color-ink)" strokeWidth="6" strokeLinejoin="round" />
        <path d="M66 160 C 56 200 70 222 96 222 C 122 222 140 204 132 170" fill="none" stroke="var(--color-ink)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="132" cy="166" r="9" fill="var(--color-yellow)" stroke="var(--color-ink)" strokeWidth="5" />
        <rect x="88" y="44" width="24" height="10" fill="var(--color-stamp)" stroke="var(--color-ink)" strokeWidth="4" />
      </svg>
      <figcaption className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
        <span className="border-3 border-ink bg-ink px-2 py-1 font-mono text-xs font-bold tracking-wider text-paper uppercase">Fotka Adama</span>
        <span className="border-2 border-ink bg-white px-1.5 font-mono text-[10px] font-bold tracking-wider uppercase">HIGGSFIELD: v7-08-portret</span>
      </figcaption>
    </figure>
  );
}

export default function OknoPrijem() {
  return (
    <Okno
      id="prijem"
      ikona={<Stethoscope />}
      listaAkoText
      className="lg:col-span-7 lg:row-span-2"
      stav={
        <>
          <span className="inline-block h-2.5 w-2.5 border-2 border-ink bg-yellow" aria-hidden="true" /> Príjem otvorený · pacient: ty
        </>
      }
    >
      <div className="relative grid gap-8 overflow-hidden p-4 sm:p-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center lg:p-8">
        <div className="relative mx-auto w-full max-w-[300px] md:max-w-none">
          <div className="-rotate-2">
            <FotkaAdama />
          </div>
          <Sticker variant="secondary" size="default" rotation="medium-right" className="absolute -right-2 -bottom-4 font-mono">
            {NALEPKA_NEMOCNICA}
          </Sticker>
          <Stamp variant="default" size="sm" rotation="slight" doubleRing className="absolute -top-3 -right-3 text-[10px]">
            {PECIATKA}
          </Stamp>
        </div>

        <div className="relative flex min-w-0 flex-col gap-5">
          <p className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold tracking-[0.16em] uppercase">
            <img src="/brand/x.svg" alt="" width="18" height="22" className="h-5 w-auto" />
            {MENO} · zdravotník, ktorý stavia AI agentov
          </p>
          <h1 className="relative m-0">
            <img src="/brand/xvadur-ink.svg" alt="XVADUR" width="678" height="130" className="h-auto w-full max-w-[520px]" />
            <svg viewBox="0 0 520 26" className="mt-1 h-5 w-full max-w-[520px]" aria-hidden="true" preserveAspectRatio="none">
              <path
                className="ekg-ciara"
                d="M0 16 H190 L204 16 L214 4 L226 24 L236 10 L246 16 H330 L340 16 L352 2 L362 24 L372 16 H520"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>
          </h1>
          <p lang="en" className="font-display text-[clamp(2rem,1rem+3.6vw,3.6rem)] leading-[0.9] font-extrabold tracking-[-0.04em] uppercase" aria-label={`${MOTTO_1} ${MOTTO_2}`}>
            <span className="block" aria-hidden="true">
              <DecryptedText text={MOTTO_1} animateOn="view" sequential revealDirection="center" speed={45} encryptedClassName="text-stamp" />
            </span>
            <span className="block" aria-hidden="true">
              <DecryptedText text={MOTTO_2} animateOn="view" sequential revealDirection="center" speed={40} encryptedClassName="text-stamp" />
            </span>
          </p>
          <p className="max-w-xl text-lg leading-snug sm:text-xl">{VETA}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="accent"
              size="xl"
              className="max-w-full whitespace-normal text-left"
              data-track="konzultacia_klik"
              data-track-miesto="v708-prijem"
              onClick={() => otvorOkno('vysetrenie')}
            >
              {CTA_HLAVNE.label} <ArrowRight aria-hidden="true" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => otvorOkno('anamneza')}>
              Kto som
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <KbdCombo keys={['⌘', 'K']} aria-hidden="true" />
            <button
              type="button"
              onClick={() => posli({ typ: 'paleta' })}
              className="flex min-h-11 items-center text-left font-mono text-xs font-bold tracking-wider uppercase underline decoration-2 underline-offset-4"
            >
              Celý systém: texty, Hriech, Netopier, Korpus, hry
            </button>
          </div>
          <CrossShape size={64} color="var(--color-stamp)" strokeColor="var(--color-ink)" animation="spin-step" speed="slow" className="pointer-events-none absolute -top-4 right-0 hidden lg:block" />
          <PillShape size={90} color="var(--color-yellow)" className="pointer-events-none absolute right-8 bottom-0 hidden rotate-[-24deg] xl:block" />
        </div>
      </div>
    </Okno>
  );
}
