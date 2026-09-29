/** V7-08 · okno Kamera (zástupná plocha pre slučku z Higgsfieldu: Adam pri počítači v uniforme, 4 s, potom CRT)
 *  a okno Denník systému (Magic UI Terminal: boot log). CRT canvas beží iba ≥ 1024 px s myšou, inak statický poster. */
import { Cctv, TerminalSquare } from 'lucide-react';
import { AnimatedSpan, Terminal, TypingAnimation } from '@/components/vendor/magicui/terminal';
import { NALEPKA_NEMOCNICA } from '@/components/hero/hero-data';
import CanvasCrt from './CanvasCrt';
import Okno, { useDesktop } from './Okno';

export function OknoKamera() {
  const desktop = useDesktop();
  return (
    <Okno
      id="kamera"
      ikona={<Cctv />}
      className="lg:col-span-4 lg:col-start-8 lg:-mt-2 lg:translate-x-6"
      stav={<>CAM 02 · sesterňa · slučka 4 s · čaká na záber</>}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
        {desktop ? (
          <CanvasCrt className="absolute inset-0" />
        ) : (
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
            <rect width="400" height="300" fill="var(--color-ink)" />
            <path d="M0 190 H140 L150 190 L160 170 L172 210 L182 110 L194 240 L204 180 L214 190 H400" fill="none" stroke="var(--color-yellow)" strokeWidth="5" strokeLinejoin="round" />
          </svg>
        )}
        <div className="crt-riadky pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-paper uppercase">
          <span className="inline-block h-3 w-3 animate-[v708-blik_1s_steps(2)_infinite] border-2 border-paper bg-stamp" aria-hidden="true" />
          REC · CAM 02
        </div>
        <div className="absolute right-3 bottom-3 left-3 flex flex-wrap items-end justify-between gap-2">
          <span className="border-3 border-ink bg-yellow px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-ink uppercase">HIGGSFIELD: v7-08-kamera</span>
          <span className="border-2 border-paper px-1.5 font-mono text-[10px] font-bold tracking-wider text-paper uppercase">{NALEPKA_NEMOCNICA}</span>
        </div>
      </div>
      <p className="sr-only">Zástupná plocha pre video: Adam pri počítači v zdravotníckej uniforme, slučka 4 sekundy s efektom monitora.</p>
    </Okno>
  );
}

export function OknoDennik() {
  return (
    <Okno id="dennik" ikona={<TerminalSquare />} className="lg:col-span-4 lg:col-start-9 lg:mt-10" stav={<>BOOT.LOG · iba na čítanie</>}>
      <Terminal
        title="xvadur@nemocnica: ~"
        className="max-w-none rounded-none border-0 shadow-none [&_.bg-hot]:bg-stamp [&_pre]:max-h-none"
      >
        <TypingAnimation duration={22}>$ xvadur boot --profil zdravotnik</TypingAnimation>
        <AnimatedSpan className="text-yellow">✔ kontrola pamäte: 8 rokov v nemocnici</AnimatedSpan>
        <AnimatedSpan className="text-yellow">✔ anamnéza: nemocnica → AI → agenti → XVADUR</AnimatedSpan>
        <AnimatedSpan className="text-yellow">✔ chorobopisy: Jakub · Lucia · Hriech · Korpus</AnimatedSpan>
        <AnimatedSpan className="text-yellow">✔ pulz Korpusu: /pulse.json</AnimatedSpan>
        <AnimatedSpan className="text-yellow">✔ vyšetrenie: Po–Pi 14:00–19:00, 30 minút</AnimatedSpan>
        <TypingAnimation duration={26} className="text-paper">&gt; príjem otvorený. Ďalší pacient: ty.</TypingAnimation>
      </Terminal>
    </Okno>
  );
}
