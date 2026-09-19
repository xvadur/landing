/** Triedy brutal rethemu pre natívne prvky formulára Intake (bez vendorovaných komponentov → bez cn/tw-merge/cva/Slot,
 *  ≈ 10 kB gz menej na /konzultacia/). Rovnaké tokeny ako neobrutalism input/textarea/button v základe:
 *  rám 3 px ink, radius 8, tieň 3/3 → 6/6 pri fokuse, výška ≥ 48 px, text 16 px (iOS bez zoomu), aria-invalid → horúci rám + pink. */

const POLE =
  'w-full min-w-0 rounded-lg border-3 border-ink bg-white font-sans text-base font-medium text-ink shadow-brutal-sm transition-shadow duration-(--duration-base) selection:bg-ink selection:text-yellow placeholder:text-ink/50 focus:shadow-brutal disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-hot aria-invalid:bg-pink';

export const INPUT = `${POLE} flex h-12 px-4 py-2`;
export const TEXTAREA = `${POLE} flex min-h-32 px-4 py-3 leading-relaxed`;
export const SELECT = `${POLE} h-12 cursor-pointer appearance-none truncate py-2 pr-12 pl-4`;

/** Tlačidlo (vzor zo základu, veľkosť „lg“: min-h-14 px-7 text-lg). */
const BTN =
  'press inline-flex min-h-14 shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg border-3 border-ink px-7 font-display text-lg font-extrabold uppercase tracking-wide shadow-brutal [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0';
export const BTN_HOT = `${BTN} bg-hot text-ink hover:bg-hot-hover active:bg-hot-press`;
export const BTN_LIME = `${BTN} bg-lime text-ink hover:bg-lime-hover active:bg-lime-press`;
export const BTN_WHITE = `${BTN} bg-white text-ink hover:bg-white-hover active:bg-white-press`;
