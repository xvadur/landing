/** Tlačidlá domova v6 — jeden zdroj tried (vzor z kontraktu základu: text na hot je vždy ink). */
export const BTN =
  'press inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border-3 border-ink px-5 font-display text-lg font-extrabold uppercase tracking-wide shadow-brutal';
export const BTN_HOT = `${BTN} bg-hot text-ink hover:bg-hot-hover`;
export const BTN_WHITE = `${BTN} bg-white text-ink hover:bg-white-hover`;
export const BTN_INK = `${BTN} bg-ink text-paper hover:bg-ink-hover`;
/** veľké CTA v hero */
export const BTN_HOT_LG = `${BTN_HOT} min-h-14 px-7 text-xl sm:text-2xl shadow-brutal-lg`;
/** textový odkaz s hrubým podčiarknutím */
export const LINK =
  'inline-flex min-h-11 items-center gap-2 font-display text-lg font-extrabold uppercase underline decoration-[3px] underline-offset-4 hover:decoration-hot';
