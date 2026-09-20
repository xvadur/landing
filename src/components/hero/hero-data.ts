/** Hero — jediný zdroj textov pre ostrov (Hero.tsx) aj statický fallback (HeroStatic.astro).
 *  Ratifikované 19. 9. 2026 (01_SMEROVANIE §8): len „DIVIDED," / „WE ARE USELESS." + wordmark XVADUR, bez slovenského riadku.
 *  Téza a intro verbatim zo spec 05 §2 bod 1. */
/* EYEBROW vypustený 20. 9. (trikrat XVADUR nad sebou). */
export const MOTTO_1 = 'DIVIDED,';
export const MOTTO_2 = 'WE ARE USELESS.';
export const TEZA = 'Vysvetľujem AI. Staviam systémy. Ukazujem, ako.';
export const INTRO =
  'Desať rokov som držal zmeny v nemocnici. Dnes staviam agentové systémy, weby a nástroje, ktoré držia prácu za ľudí — a všetko, čo postavím, ukážem.';
export const CTA = { label: 'Vstúp', href: '#kto-som' };
export const PILULKY = [
  { label: 'Kto som', href: '#kto-som', bg: 'bg-yellow', rotate: 'rotate-[-3deg]' },
  { label: 'Čo som postavil', href: '#postavil', bg: 'bg-pink', rotate: 'rotate-[2deg]' },
  { label: 'Hry', href: '#hry', bg: 'bg-sky', rotate: 'rotate-[-2deg]' },
  { label: 'Texty', href: '#texty', bg: 'bg-lime', rotate: 'rotate-[3deg]' },
];
export const WORDMARK = { src: '/brand/xvadur-ink.svg', width: 678, height: 130 };
/** Scéna hera: fotka Adama. Dočasne augustový obraz; cieľ = výrez z Higgsfieldu (od pŕs hore, roztiahnuté ruky, PNG bez pozadia). */
export const SCENA_SRC = '/assets/hero-adam.webp';

/** Motto: clamp podľa šírky viewportu — spodná hranica 4 rem (64 px na 375), horná 10 rem (160 px; ≈ 158 px na 1440).
 *  Strop 10 rem je odvodený z merania: „WE ARE USELESS." pri wdth 100 má ≈ 7,24 em, kontajner max-w-7xl je 1200 px →
 *  160 px × 7,24 = 1158 px < 1200 na 1440 aj 1920 px. Doc 10 §4 pýta 160–240 px, ale väčšie motto by sa na 2. riadku
 *  zalomilo a hero by pri každom cykle wdth-breathe poskočil (odchýlka zapísaná v NOTES). Od 640 px riadky nelámu
 *  (whitespace-nowrap v MOTTO_LINE_CLASS), pod 640 px sa „WE ARE USELESS." zalomí na dva riadky. */
export const MOTTO_CLASS =
  'font-display font-extrabold uppercase tracking-[-0.04em] text-[clamp(4rem,0.5rem+11vw,10rem)] leading-[0.86]';
/** Jeden riadok motta: od sm nikdy nezalomiť (šírka pri wdth 100 vždy sadne, pozri výpočet vyššie); pb 0,06 em má aj
 *  statický riadok, aby výška motta bola rovnaká pred SplitText aj po ňom (žiadny posun obsahu pod mottom). */
export const MOTTO_LINE_CLASS = 'block pb-[0.06em] sm:whitespace-nowrap';
/** Tlačidlo VSTÚP (vzor z kontraktu základu). */
export const CTA_CLASS =
  'press inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg border-3 border-ink bg-hot px-8 font-display text-2xl font-extrabold uppercase text-ink shadow-brutal-lg sm:w-auto';
/** Výška hlavičky (Header z Base ≈ 71 px) sa v hero aj v Dvere počíta ako 4,5 rem — jedna hodnota na oboch miestach
 *  (`min-h-[calc(100dvh-4.5rem)]`, `lg:h-[calc(100svh-4.5rem)]`, ScrollTrigger `start: 'top 72px'`). */
export const PILL_CLASS =
  'press inline-flex min-h-11 items-center rounded-lg border-3 border-ink px-4 font-display text-base font-extrabold uppercase tracking-wide text-ink shadow-brutal-sm';
