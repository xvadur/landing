/** Katalóg vendor · GSAP (ScrollTrigger + SplitText) — 3 stupňovité ukážky. Lenivo z Motory.tsx (pluginy pri importe).
 *  Pravidlo: GSAP hýbe iba prvkami s data-gsap-*; na tých istých prvkoch nie je Motion ani CSS preset (lift/press). */
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { VLAJKA } from '@/data/ponuka';
import { Mriezka, Pozn, Varianta } from './shared';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const FAZY = ['Triáž', 'Diagnóza', 'Liečba', 'Kontrola'];

export default function MotoryGsap() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const lenis = window.__lenis;
      const upd = () => ScrollTrigger.update();
      lenis?.on('scroll', upd);
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = root.current;
        if (!el) return;

        // 1) pečiatka: karta padá na miesto v 4 schodoch, tieň (--sh) rastie od 0 do 9 px — scrub na scroll
        const karta = el.querySelector<HTMLElement>('[data-gsap-karta]');
        if (karta) {
          gsap.fromTo(
            karta,
            { y: -48, rotate: -6, '--sh': 0 },
            {
              y: 0,
              rotate: 0,
              '--sh': 9,
              ease: 'steps(4)',
              scrollTrigger: { trigger: karta, start: 'top 90%', end: 'top 45%', scrub: true },
            },
          );
        }

        // 2) SplitText: písmená sa „vyrazia“ jedno po druhom (ease steps(1) = zjavenie bez medzikroku)
        const text = el.querySelector<HTMLElement>('[data-gsap-text]');
        if (text) {
          // 'words, chars' + nowrap slová: samotné 'chars' láme slová uprostred (vidieť na ScrambledText)
          const split = SplitText.create(text, { type: 'words, chars', wordsClass: 'inline-block whitespace-nowrap', charsClass: 'inline-block' });
          gsap.from(split.chars, {
            opacity: 0,
            scale: 1.8,
            duration: 0.12,
            ease: 'steps(1)',
            stagger: 0.05,
            scrollTrigger: { trigger: text, start: 'top 85%', toggleActions: 'play none none reverse' },
          });
        }

        // 3) snap: priebeh v 4 fázach, pás rastie po schodoch a scroll sa zastaví na každej fáze
        const pas = el.querySelector<HTMLElement>('[data-gsap-pas]');
        const faza = el.querySelector<HTMLElement>('[data-gsap-faza]');
        const scena = el.querySelector<HTMLElement>('[data-gsap-scena]');
        if (pas && faza && scena) {
          gsap.fromTo(
            pas,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'steps(4)',
              scrollTrigger: {
                trigger: scena,
                start: 'top 70%',
                end: 'bottom 40%',
                scrub: true,
                onUpdate: (st) => {
                  faza.textContent = FAZY[Math.min(FAZY.length - 1, Math.floor(st.progress * FAZY.length))] ?? '';
                },
              },
            },
          );
        }
      });
      return () => {
        lenis?.off('scroll', upd);
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-4">
      <Mriezka cols={3}>
        <Varianta props="fromTo · scrub · ease 'steps(4)' · CSS premenná --sh (tieň) tweenuje GSAP" plocha="bg-paper">
          <div
            data-gsap-karta
            className="w-full rounded-lg border-3 border-ink bg-yellow p-5"
            style={{ boxShadow: 'calc(var(--sh, 6) * 1px) calc(var(--sh, 6) * 1px) 0 0 var(--color-ink)' }}
          >
            <p className="eyebrow">Vyšetrenie</p>
            <p className="font-display text-2xl font-extrabold uppercase">{VLAJKA.trvanie}</p>
          </div>
        </Varianta>
        <Varianta props="SplitText.create(words, chars) · from {opacity 0, scale 1.8} · ease 'steps(1)' · stagger 0.05">
          <p data-gsap-text className="font-display text-3xl font-extrabold uppercase leading-none">
            Príjem · Diagnóza · Liečba
          </p>
        </Varianta>
        <Varianta props="scrub · ease 'steps(4)' · onUpdate → fáza (pinnutá verzia je v Podpise 4)">
          <div data-gsap-scena className="grid w-full gap-3">
            <p data-gsap-faza className="font-display text-3xl font-extrabold uppercase">
              {FAZY[0]}
            </p>
            <div className="h-5 overflow-hidden rounded-lg border-3 border-ink bg-white">
              <div data-gsap-pas className="h-full origin-left bg-ink" />
            </div>
            <ol className="grid grid-cols-4 gap-1 font-mono text-[10px] uppercase">
              {FAZY.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ol>
          </div>
        </Varianta>
      </Mriezka>
      <Pozn>
        Lenis → ScrollTrigger.update (window.__lenis.on('scroll')). Reduced motion: gsap.matchMedia nič nespustí, prvky sú v konečnom stave.
      </Pozn>
    </div>
  );
}
