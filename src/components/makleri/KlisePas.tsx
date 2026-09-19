/** Pás klišé rodín (Magic UI Marquee, doc 10 §3 #7) pre /makleri/ — 6 základných rodín z Dňa 1 (src/data/frazy.ts)
 *  s počtom kancelárií zo 47 (pack 13 §1). Čisto CSS pás: vykresľuje sa bez client direktívy (0 kB JS),
 *  reduced motion = stojí (global.css). Retheme cez tokeny. Dĺžka cyklu = tokenových 40 s: prop `duration` vendor
 *  Marquee pri statickom renderi nezapíše (custom property v React `style` sa v SSR stratí — pozri NOTES_makleri.md). */
import { Marquee } from '@/components/vendor/magicui/marquee';
import { FRAZY_RODINY } from '@/data/frazy';

export default function KlisePas({ reverse = false }: { reverse?: boolean }) {
  const rodiny = FRAZY_RODINY.filter((r) => r.zakladna);
  return (
    <Marquee
      reverse={reverse}
      repeat={4}
      gap="0"
      bordered
      className="bg-pink text-ink"
      role="marquee"
      aria-label="Šesť rodín fráz, ktoré má každý"
    >
      {rodiny.map((r) => (
        <span
          key={r.rodina}
          className="flex items-center gap-5 whitespace-nowrap py-3 pr-5 font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl"
        >
          <span className="line-through decoration-hot decoration-[3px]">{r.rodina}</span>
          <span className="rounded-lg border-3 border-ink bg-white px-2.5 py-1 font-mono text-sm font-medium tracking-[0.14em] shadow-brutal-sm">
            {r.z47} / 47
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-7 w-7 text-hot" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M0 0H26L53 43L80 0H106L66 65L106 130H79L53 87L27 130H0L40 65Z" transform="translate(63,48) scale(1.23)" />
          </svg>
        </span>
      ))}
    </Marquee>
  );
}
