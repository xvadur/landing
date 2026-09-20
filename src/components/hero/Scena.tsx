/** Scéna hera (20. 9., Adam): pod claimom, v prázdnom priestore, Adam od pŕs hore s roztiahnutými rukami a nad
 *  hlavou mu krúžia nástroje. Fotka: augustový obraz „Adam na meste" (fisheye, pixelové oblaky) priamo na papieri
 *  cez mix-blend-mode: multiply — svetlé pozadie fotky splynie s papierom, bez rámu (Adam, 20. 9.). Neskôr môže prísť
 *  výrez z Higgsfieldu (brief work/HIGGSFIELD_HERO_BRIEF.md).
 *  Nástroje = pastelové nálepky s ikonami (Phosphor) po eliptickej dráhe (CSS Motion Path, offset-path), každá
 *  s iným štartom; `offset-rotate: 0deg` drží nálepky vzpriamené. Reduced motion: dráha stojí. 0 kB knižníc. */
import {
  ChartLineUpIcon,
  ChatCircleDotsIcon,
  KeyboardIcon,
  RobotIcon,
  StethoscopeIcon,
  TerminalWindowIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const NASTROJE = [
  { Icon: TerminalWindowIcon, label: 'Terminál', bg: 'bg-yellow' },
  { Icon: RobotIcon, label: 'Agenti', bg: 'bg-lilac' },
  { Icon: StethoscopeIcon, label: 'Desať rokov v nemocnici', bg: 'bg-pink' },
  { Icon: ChatCircleDotsIcon, label: 'Chat', bg: 'bg-sky' },
  { Icon: ChartLineUpIcon, label: 'Dáta', bg: 'bg-lime' },
  { Icon: KeyboardIcon, label: 'Klávesnica', bg: 'bg-white' },
] as const;

/** Elipsa dráhy v jednotkách boxu 100 × 100 (stred 50/44, polosi 50 × 18) — nad hlavou, plocho ako obežná dráha. */
const DRAHA = 'M 50 26 A 50 18 0 1 1 49.99 26';

export default function Scena({ src, className }: { src: string; className?: string }) {
  return (
    <div className={cn('scena relative mx-auto w-[min(92vw,40rem)] lg:w-[min(40rem,60dvh)]', className)} aria-hidden="true">
      {/* obežná dráha nástrojov — box nad postavou, nálepky idú po elipse */}
      <div className="scena-orbit absolute inset-x-[-4%] top-0 z-20 h-[30%]">
        {NASTROJE.map(({ Icon, label, bg }, i) => (
          <span
            key={label}
            title={label}
            className={cn(
              'scena-nastroj absolute grid h-12 w-12 place-items-center rounded-lg border-3 border-ink shadow-brutal-sm sm:h-14 sm:w-14',
              bg,
            )}
            style={{ '--i': i, '--n': NASTROJE.length } as React.CSSProperties}
          >
            <Icon size={26} weight="bold" />
          </span>
        ))}
      </div>

      {/* postava: augustová fotka „na meste" priamo na papieri — svetlé pozadie fotky zmizne cez multiply,
          pixelové oblaky a mesto ostanú, nič nie je v ráme */}
      <div className="scena-postava relative z-10 mt-[16%]">
        <img
          src={src}
          alt=""
          width={1513}
          height={1040}
          className="scena-foto block w-full mix-blend-multiply"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
