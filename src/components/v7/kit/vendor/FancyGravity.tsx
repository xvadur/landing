/** Katalóg vendor · Fancy Gravity + MatterBody (matter-js). Načítava sa lenivo z Fancy.tsx po hydratácii. */
import { useRef, useState } from 'react';
import decomp from 'poly-decomp';
import { Common } from 'matter-js';
import { Gravity, MatterBody, type GravityRef } from '@/components/vendor/fancy/physics/gravity';
import { Button } from '@/components/ui/button';
import { MOTTO_1, MOTTO_2 } from '@/components/hero/hero-data';
import { MARQUEE_FAKTY } from '@/data/fakty';
import { Kus, Pozn, Realne, Varianta } from './shared';

// Gravity volá Common.setDecomp až vo svojom useEffect, ale MatterBody (dieťa) sa registruje skôr (efekty detí bežia
// pred rodičom) → konkávne X by dostalo konvexný obal + warning. Obchádzka: decomp nastaviť už pri importe.
Common.setDecomp(decomp);

const X_D = 'M0 0H26L53 43L80 0H106L66 65L106 130H79L53 87L27 130H0L40 65Z';

export default function FancyGravity() {
  const ref = useRef<GravityRef>(null);
  const [debug, setDebug] = useState(false);
  const [gx, setGx] = useState(0);
  return (
    <Kus
      id="fa-gravity"
      nazov="Gravity · MatterBody"
      subor="vendor/fancy/physics/gravity.tsx"
      veta="Fyzika (matter-js): nálepky padajú, odrážajú sa a dajú sa chytiť myšou aj prstom; engine beží len vo viewporte."
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => ref.current?.stop()}>
          ref.stop()
        </Button>
        <Button variant="outline" onClick={() => ref.current?.start()}>
          ref.start()
        </Button>
        <Button variant="outline" onClick={() => ref.current?.reset()}>
          ref.reset()
        </Button>
        <Button variant={debug ? 'secondary' : 'outline'} onClick={() => setDebug((d) => !d)}>
          debug {debug ? 'zap' : 'vyp'}
        </Button>
        <Button variant={gx ? 'secondary' : 'outline'} onClick={() => setGx((g) => (g ? 0 : 0.5))}>
          gravity x = {gx}
        </Button>
      </div>
      <Varianta props={`gravity={{ x: ${gx}, y: 1 }} · addTopWall · grabCursor · startOnView · resetOnResize · decomp · debug=${debug}`}>
        <div className="relative h-[440px] w-full overflow-hidden rounded-lg border-3 border-ink bg-paper tx-dots">
          <Gravity key={`${debug}-${gx}`} ref={ref} debug={debug} gravity={{ x: gx, y: 1 }} decomp={decomp}>
            <MatterBody x="20%" y="10%" angle={-8}>
              <span className="sticker block text-lg">rectangle</span>
            </MatterBody>
            <MatterBody x="50%" y="15%" bodyType="circle" matterBodyOptions={{ restitution: 0.9, friction: 0.05 }}>
              <span className="grid size-20 place-items-center rounded-full border-3 border-ink bg-white font-mono text-xs font-bold shadow-brutal-sm">
                circle 0.9
              </span>
            </MatterBody>
            <MatterBody x="75%" y="5%" bodyType="svg" sampleLength={8} angle={12}>
              <svg viewBox="0 0 106 130" width="64" height="78" aria-hidden="true">
                <path d={X_D} fill="var(--color-hot)" stroke="var(--color-ink)" strokeWidth={4} />
              </svg>
            </MatterBody>
            <MatterBody x="40%" y="40%" isDraggable={false} matterBodyOptions={{ isStatic: true }}>
              <span className="block rounded-lg border-3 border-ink bg-ink px-4 py-2 font-mono text-sm text-paper">isStatic · isDraggable=false</span>
            </MatterBody>
          </Gravity>
        </div>
      </Varianta>
      <Realne zdroj="hero-data.ts (motto) + fakty.ts (MARQUEE_FAKTY)">
        <div className="relative h-[420px] w-full overflow-hidden rounded-lg border-3 border-ink bg-yellow">
          <Gravity>
            <MatterBody x="30%" y="10%" angle={-6}>
              <span lang="en" className="block rounded-lg border-3 border-ink bg-ink px-4 py-2 font-display text-2xl font-extrabold text-paper">
                {MOTTO_1}
              </span>
            </MatterBody>
            <MatterBody x="65%" y="10%" angle={5}>
              <span lang="en" className="block rounded-lg border-3 border-ink bg-white px-4 py-2 font-display text-xl font-extrabold">
                {MOTTO_2}
              </span>
            </MatterBody>
            {MARQUEE_FAKTY.map((f, i) => (
              <MatterBody key={f.label} x={`${15 + i * 22}%`} y="30%" angle={(i % 2 ? 1 : -1) * 10}>
                <span className="sticker block text-base">{f.value}</span>
              </MatterBody>
            ))}
          </Gravity>
        </div>
      </Realne>
      <Pozn>
        Reduced motion: svet sa dopočíta naraz a nálepky ležia na dne. Konkávne SVG (X) potrebuje decomp (poly-decomp), inak konvexný obal
        a warning. Na 375 px krátke nálepky, inak sa štart clampuje do stien.
      </Pozn>
    </Kus>
  );
}
