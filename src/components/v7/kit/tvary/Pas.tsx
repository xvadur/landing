/** Katalóg V7 · marquee.tsx: nekonečný pás (Marquee, MarqueeItem, MarqueeSeparator). */
import * as React from 'react';
import { Marquee, MarqueeItem, MarqueeSeparator } from '@/components/ui/marquee';
import { CrossShape, PillShape } from '@/components/ui/shapes';
import { MARQUEE_FAKTY } from '@/data/fakty';
import { CESTA } from '@/data/cesta';
import { MOTTO_1, MOTTO_2 } from '@/components/hero/hero-data';
import { Kus, Opravene, Pod } from './Spolocne';

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
      <Opravene>
        <code>speed</code> slow / normal / fast ide cez keyframes <code>bk-marquee</code> v motion.css: každá stopa sa posunie o celú svoju
        šírku + medzeru, takže slučka nemá skok. Rýchlosť = násobok <code>--marquee-duration</code> (slow 4×, normal 2×, fast 0,8×);
        pri reduced motion pás stojí.
      </Opravene>
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
      <Riadok popis='speed="slow" · speed="fast"'>
        <div className="flex flex-col gap-3">
          <Marquee speed="slow">
            <Polozky />
          </Marquee>
          <Marquee speed="fast" className="bg-ink text-paper">
            <Polozky />
          </Marquee>
        </div>
      </Riadok>
      <Riadok popis="style={{ '--marquee-duration': '12s' }} · ladí rýchlosť">
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
