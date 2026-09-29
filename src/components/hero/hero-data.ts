/** Hero V5 (XDR-205, dohodnuté 26. 9. 2026) — jediný zdroj textov pre ostrov Hero.tsx aj statický SSR render.
 *  Motto „DIVIDED," / „WE ARE USELESS." ostáva (ratifikované 19. 9.), veta pod mottom je z popisu XDR-205. */
export const MENO = 'Adam Rudavský';
export const MOTTO_1 = 'DIVIDED,';
export const MOTTO_2 = 'WE ARE USELESS.';
/** ROZPOR 1 vyriešený 29. 9. 2026 [A]: 8 rokov (8/2017 – 7/2025), src/data/fakty.ts. */
export const VETA = 'Osem rokov som držal zmeny v nemocnici. Dnes staviam agentov, ktorí držia prácu za ľudí.';
export const CTA_HLAVNE = { label: 'Objednaj sa na vyšetrenie', href: '#konzultacia' };
export const CTA_KTO = { label: 'Kto som', href: '#kto-som' };
/** Nálepka po okraji hera (XDR-205). ROZPOR 1 ako pri VETA. */
export const NALEPKA_NEMOCNICA = '8 rokov v nemocnici';
export const PECIATKA = 'Vitálne';

/** Fotka: zatiaľ zástupná ilustrácia ZdravotnikPlaceholder (src/components/v5/Symboly.tsx), XDR-199. */

/** Motto: o niečo menšie než v4 (hero má teraz aj fotku a živý pás). 375 px → 3 rem, 1440 px ≈ 7 rem. */
export const MOTTO_CLASS =
  'font-display font-extrabold uppercase tracking-[-0.04em] text-[clamp(2.6rem,0.9rem+7vw,6.25rem)] leading-[0.86]';
export const MOTTO_LINE_CLASS = 'block pb-[0.06em] sm:whitespace-nowrap';

export const BTN =
  'press inline-flex min-h-13 items-center justify-center gap-3 rounded-lg border-3 border-ink px-6 font-display text-lg font-extrabold uppercase text-ink shadow-brutal-lg sm:text-xl';
