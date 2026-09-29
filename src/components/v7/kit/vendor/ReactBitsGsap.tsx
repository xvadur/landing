/** Katalóg vendor · React Bits na GSAP: ScrambledText (SplitText + ScrambleTextPlugin) a SplitText (SplitText + ScrollTrigger).
 *  Načítava sa lenivo z ReactBits.tsx až po hydratácii — GSAP pluginy sa registrujú pri importe. */
import { useState } from 'react';
import ScrambledText from '@/components/vendor/reactbits/ScrambledText';
import SplitText from '@/components/vendor/reactbits/SplitText';
import { VLAJKA } from '@/data/ponuka';
import { CESTA } from '@/data/cesta';
import { Kus, Mriezka, Pozn, Realne, Varianta, Znova } from './shared';

/** ScrambledText delí iba na znaky (type 'chars') → slová sa lámu uprostred. Obchádzka: každé slovo v nowrap spane
 *  (SplitText rešpektuje vnorené prvky). */
function Slova({ text }: { text: string }) {
  const w = text.split(' ');
  return (
    <>
      {w.map((x, i) => (
        <span key={i}>
          <span className="whitespace-nowrap">{x}</span>
          {i < w.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  );
}

export default function ReactBitsGsap() {
  const [kluc, setKluc] = useState(0);
  return (
    <>
      <Kus
        id="rb-scrambled"
        nazov="ScrambledText"
        subor="vendor/reactbits/ScrambledText.tsx"
        veta="Znaky okolo kurzora sa rozmiešajú a zložia späť (GSAP ScrambleText); len myš, na dotyku a pri reduced motion statický text."
      >
        <Mriezka cols={3}>
          <Varianta props="radius=100 duration=1.2 speed=0.5 scrambleChars='X×.:' (default)">
            <ScrambledText className="font-mono text-base">
              <Slova text="Prejdi myšou po texte. Znaky sa rozsypú na X a bodky." />
            </ScrambledText>
          </Varianta>
          <Varianta props="radius=40 duration=0.4 speed=1 scrambleChars='01'">
            <ScrambledText radius={40} duration={0.4} speed={1} scrambleChars="01" className="font-mono text-base">
              <Slova text="Malý polomer, rýchle binárne miešanie." />
            </ScrambledText>
          </Varianta>
          <Varianta props="as='h4' radius=160 duration=2 scrambleChars='ÁČĎÉÍĽŇÓŠŤÚÝŽ'">
            <ScrambledText as="h4" radius={160} duration={2} scrambleChars="ÁČĎÉÍĽŇÓŠŤÚÝŽ" className="font-display text-2xl font-extrabold uppercase">
              <Slova text="Diakritika ostáva" />
            </ScrambledText>
          </Varianta>
        </Mriezka>
        <Realne zdroj="ponuka.ts (VLAJKA.titulok)">
          <ScrambledText as="p" radius={120} className="font-display text-display-xs font-extrabold uppercase leading-[0.95]">
            <Slova text={VLAJKA.titulok} />
          </ScrambledText>
        </Realne>
      </Kus>

      <Kus
        id="rb-splittext"
        nazov="SplitText"
        subor="vendor/reactbits/SplitText.tsx"
        veta="Text sa rozdelí na znaky / slová / riadky a vojde so staggerom (GSAP SplitText + ScrollTrigger); from/to berie aj šírku písma (wdth)."
      >
        <div className="flex justify-end">
          <Znova onClick={() => setKluc((k) => k + 1)} />
        </div>
        <Mriezka cols={2} key={kluc}>
          <Varianta props="splitType='chars' from={{opacity:0,y:40}} ease='power3.out' (default)">
            <SplitText text="PRÍJEM" tag="h4" className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="splitType='chars' ease='steps(4)' duration=0.4 delay=60 from={{y:'100%'}}">
            <SplitText text="DIAGNÓZA" tag="h4" splitType="chars" ease="steps(4)" duration={0.4} delay={60} from={{ y: '100%', opacity: 1 }} to={{ y: '0%', opacity: 1 }} className="font-display text-4xl font-extrabold" />
          </Varianta>
          <Varianta props="splitType='words' from={{opacity:0,x:-24}} ease='steps(3)' delay=120">
            <SplitText text="Najmenší zásah, ktorý pomôže." tag="p" splitType="words" from={{ opacity: 0, x: -24 }} to={{ opacity: 1, x: 0 }} ease="steps(3)" delay={120} duration={0.3} className="font-display text-2xl font-extrabold" />
          </Varianta>
          <Varianta props="splitType='lines' textAlign='left' threshold=0.3 rootMargin='0px'">
            <SplitText text={CESTA[0]?.text ?? ''} tag="p" splitType="lines" threshold={0.3} rootMargin="0px" textAlign="left" from={{ opacity: 0, y: 20 }} to={{ opacity: 1, y: 0 }} className="text-lg" />
          </Varianta>
          <Varianta props="splitType='words, chars' · from wdth 75 → 100 (fontVariationSettings)">
            <SplitText
              text="LIEČBA"
              tag="h4"
              splitType="words, chars"
              from={{ opacity: 0, fontVariationSettings: "'wdth' 75" }}
              to={{ opacity: 1, fontVariationSettings: "'wdth' 100" }}
              ease="steps(5)"
              duration={0.6}
              className="font-display text-4xl font-extrabold"
            />
          </Varianta>
          <Varianta props="immediate (bez ScrollTriggeru, hero nad ohybom) · onLetterAnimationComplete">
            <SplitText text="ODOVZDANIE" tag="h4" immediate ease="steps(6)" duration={0.5} delay={40} className="font-display text-4xl font-extrabold" />
          </Varianta>
        </Mriezka>
        <Pozn>
          Pravidlo enginu (hlavička SplitText.tsx): prvok s GSAP nedostáva Motion ani CSS presety lift / press / card-drop. Reduced motion =
          statický text bez splitu. ease „steps(n)“ = GSAP SteppedEase — tvrdé, stupňovité nabehnutie.
        </Pozn>
      </Kus>
    </>
  );
}
