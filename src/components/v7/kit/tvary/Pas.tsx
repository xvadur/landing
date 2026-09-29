/** Katalóg V7 · marquee.tsx: nekonečný pás (Marquee, MarqueeItem, MarqueeSeparator). */
import * as React from 'react';
import { Marquee, MarqueeItem, MarqueeSeparator } from '@/components/ui/marquee';
import { CrossShape, PillShape } from '@/components/ui/shapes';
import { MARQUEE_FAKTY } from '@/data/fakty';
import { CESTA } from '@/data/cesta';
import { MOTTO_1, MOTTO_2 } from '@/components/hero/hero-data';
import { Chyba, Kus, Pod } from './Spolocne';

function Riadok({ popis, children }: { popis: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="font-mono text-xs">{popis}</p>
      {children}
    </div>
  );
}

const Polozky = () => (
  <>
    {MARQUEE_FAKTY.map((f) => (
      <React.Fragment key={f.label}>
        <MarqueeItem>{f.value}</MarqueeItem>
        <MarqueeSeparator />
      </React.Fragment>
    ))}
  </>
);

export default function Pas() {
  return (
    <Kus
      id="marquee"
      meno="marquee"
      subor="src/components/ui/marquee.tsx · Marquee, MarqueeItem, MarqueeSeparator"
      pocet="3 exporty"
      veta="Bežiaci pás faktov, mena alebo motta: rozdeľuje sekcie, nesie čísla (459 webov, 2 034 maklérov, 47 / 47), v hero môže bežať za fotkou."
    >
      <Chyba>
        <code>speed=&quot;slow&quot;</code> a <code>&quot;fast&quot;</code> používajú triedy <code>animate-marquee-slow / -fast</code>, ktoré v CSS <strong>nie sú</strong> →
        pás stojí (v katalógu záplata). <code>normal</code> ide cez token <code>--animate-marquee</code> (posun −50 %, 40 s): obe polovice sa
        hýbu o polovicu vlastnej šírky, takže pri <code>repeat</code> nepárnom alebo s medzerou <code>gap-8</code> na konci polovice pás poskočí.
        Rýchlosť sa dá ladiť premennou <code>--marquee-duration</code> cez style. Reduced motion zastaví globálny guard v global.css (komponent sám nie).
      </Chyba>
      <Riadok popis='direction="left" speed="normal" (default) · pauseOnHover · bordered · repeat=4'>
        <Marquee className="bg-yellow">
          <Polozky />
        </Marquee>
      </Riadok>
      <Riadok popis='direction="right"'>
        <Marquee direction="right">
          <Polozky />
        </Marquee>
      </Riadok>
      <Riadok popis='speed="slow" (záplata) · speed="fast" (záplata)'>
        <div className="flex flex-col gap-3">
          <Marquee speed="slow">
            <Polozky />
          </Marquee>
          <Marquee speed="fast" className="bg-ink text-paper">
            <Polozky />
          </Marquee>
        </div>
      </Riadok>
      <Riadok popis="style={{ '--marquee-duration': '12s' }} · bez záplaty, ladí rýchlosť normal">
        <Marquee style={{ ['--marquee-duration' as string]: '12s' }}>
          <Polozky />
        </Marquee>
      </Riadok>
      <Riadok popis="bordered={false} · pauseOnHover={false} · repeat={2}">
        <Marquee bordered={false} pauseOnHover={false} repeat={2} className="bg-paper">
          <Polozky />
        </Marquee>
      </Riadok>
      <Riadok popis="MarqueeSeparator s vlastným obsahom: tvar, X znak, text">
        <Marquee className="bg-white">
          {CESTA.map((k, i) => (
            <React.Fragment key={k.nazov}>
              <MarqueeItem>
                <span className="font-mono text-xs">{k.kedy}</span> {k.nazov}
              </MarqueeItem>
              <MarqueeSeparator>
                {i % 3 === 0 ? (
                  <CrossShape size={26} strokeWidth={4} color="var(--color-stamp)" />
                ) : i % 3 === 1 ? (
                  <img src="/brand/x.svg" alt="" width={32} height={32} className="h-8 w-8" />
                ) : (
                  <PillShape size={48} strokeWidth={4} color="var(--color-yellow)" />
                )}
              </MarqueeSeparator>
            </React.Fragment>
          ))}
        </Marquee>
      </Riadok>

      <Pod poznamka="Motto ako obrí pás (display písmo cez className na MarqueeItem), dva pásy proti sebe a natočené.">
        Kombinácia s Adamovým obsahom
      </Pod>
      <div className="relative -mx-4 overflow-hidden py-10 sm:mx-0">
        <Marquee className="-rotate-2 border-x-0 bg-yellow" style={{ ['--marquee-duration' as string]: '30s' }}>
          <MarqueeItem lang="en" className="font-display text-4xl font-extrabold sm:text-6xl">
            {MOTTO_1} {MOTTO_2}
          </MarqueeItem>
          <MarqueeSeparator>
            <CrossShape size={40} strokeWidth={4} color="var(--color-stamp)" />
          </MarqueeSeparator>
        </Marquee>
        <Marquee direction="right" className="mt-2 rotate-1 border-x-0 bg-ink text-paper" style={{ ['--marquee-duration' as string]: '24s' }}>
          <MarqueeItem className="font-mono text-base">XVADUR · príjem · diagnóza · liečba</MarqueeItem>
          <MarqueeSeparator className="text-yellow">✚</MarqueeSeparator>
        </Marquee>
      </div>
    </Kus>
  );
}
