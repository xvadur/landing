/** Katalóg vendor · @paper-design/shaders-react — 3 neobrutalistické shadery (1-bit dithering, halftone mriežka, cik-cak vlny).
 *  WebGL iba na desktope ≥ 1024 px s myšou; mobil / dotyk = statická CSS textúra. Reduced motion = speed 0 (stojí).
 *  Farby: parser shaderov nepozná oklch ani var() → tokenRgb() (1 px canvas) za behu. */
import { Dithering, DotGrid, Waves } from '@paper-design/shaders-react';
import { Mriezka, Pozn, Varianta, useDesktopFx, useReduced, useTokenRgb } from './shared';

export default function MotoryShadery() {
  const fx = useDesktopFx();
  const reduced = useReduced();
  const c = useTokenRgb(['ink', 'paper', 'yellow', 'white']);
  const plocha = 'relative h-56 w-full overflow-hidden rounded-lg border-3 border-ink';

  if (!fx || !c) {
    return (
      <>
        <Mriezka cols={3}>
          <Varianta props="Dithering (mobil: statická textúra tx-halftone)">
            <div className={`${plocha} bg-yellow tx-halftone`} />
          </Varianta>
          <Varianta props="DotGrid (mobil: tx-dots)">
            <div className={`${plocha} bg-yellow tx-dots`} />
          </Varianta>
          <Varianta props="Waves (mobil: plná plocha)">
            <div className={`${plocha} bg-ink`} />
          </Varianta>
        </Mriezka>
        <Pozn>
          {reduced ? 'Reduced motion' : 'Mobil alebo dotyk'}: WebGL sa nespúšťa (zákon 7: ťažké efekty iba ≥ 1024 px s myšou).
        </Pozn>
      </>
    );
  }

  return (
    <>
      <Mriezka cols={3}>
        <Varianta props="Dithering shape='wave' type='4x4' size=3 speed=0.5 · colorBack paper · colorFront ink">
          <div className={plocha}>
            <Dithering shape="wave" type="4x4" size={3} speed={reduced ? 0 : 0.5} colorBack={c.paper} colorFront={c.ink} className="absolute inset-0" />
          </div>
        </Varianta>
        <Varianta props="Dithering shape='sphere' type='8x8' size=4 scale=0.7 · yellow / ink">
          <div className={plocha}>
            <Dithering shape="sphere" type="8x8" size={4} scale={0.7} speed={reduced ? 0 : 0.8} colorBack={c.yellow} colorFront={c.ink} className="absolute inset-0" />
          </div>
        </Varianta>
        <Varianta props="Dithering shape='ripple' type='random' size=2 · white / ink">
          <div className={plocha}>
            <Dithering shape="ripple" type="random" size={2} speed={reduced ? 0 : 0.4} colorBack={c.white} colorFront={c.ink} className="absolute inset-0" />
          </div>
        </Varianta>
        <Varianta props="DotGrid shape='square' size=4 gapX=18 gapY=18 sizeRange=0.6 (statický, bez speed)">
          <div className={plocha}>
            <DotGrid shape="square" size={4} gapX={18} gapY={18} sizeRange={0.6} opacityRange={0} strokeWidth={0} colorBack={c.yellow} colorFill={c.ink} colorStroke={c.ink} className="absolute inset-0" />
          </div>
        </Varianta>
        <Varianta props="DotGrid shape='circle' strokeWidth=2 colorFill paper colorStroke ink">
          <div className={plocha}>
            <DotGrid shape="circle" size={6} gapX={28} gapY={28} strokeWidth={2} colorBack={c.white} colorFill={c.paper} colorStroke={c.ink} className="absolute inset-0" />
          </div>
        </Varianta>
        <Varianta props="Waves shape=0 (cik-cak) softness=0 amplitude=0.5 frequency=0.6 spacing=0.7 rotation=45">
          <div className={plocha}>
            <Waves shape={0} softness={0} amplitude={0.5} frequency={0.6} spacing={0.7} proportion={0.35} rotation={45} colorFront={c.ink} colorBack={c.yellow} className="absolute inset-0" />
          </div>
        </Varianta>
      </Mriezka>
      <Pozn>
        WebGL beží len vo viewporte (ShaderMount pauzuje mimo obrazu). speed=0 zastaví rAF úplne. Hodí sa na pozadie hero pásu
        (Dithering wave) alebo na „röntgen“ plochu Anamnézy (DotGrid).
      </Pozn>
    </>
  );
}
