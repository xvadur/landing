/** Konfigurácia produktu Neviditeľný maklér (/makleri/, /makleri/plan/).
 *  Zdroj: xvadur_brand/01_current_personal_brand/13_NEVIDITELNY_MAKLER_LAUNCH_2026-09-15.md §2, §6.
 *  STRIPE_URL: Stripe Payment Link 9 € (success URL xvadur.com/makleri/plan/). Kým je prázdny,
 *  tlačidlo na landingu je disabled s textom „PLATBA ČOSKORO“. Adam doplní odkaz jedným riadkom. */

export const STRIPE_URL = '';

/** Cena tak, ako sa vypisuje (pack §2 „Cena: 9 € jednorazovo“). */
export const CENA = '9 €';

/** Text tlačidla, keď Stripe beží / keď nebeží. */
export const CTA_KUPIT = 'KÚPIŤ PLÁN ZA 9 €';
export const CTA_CAKA = 'PLATBA ČOSKORO';
/** Viditeľný stav pod disabled tlačidlom (kým STRIPE_URL nie je vyplnený). */
export const CTA_CAKA_STAV = 'Stripe Payment Link sa pripravuje.';
/** Foot landingu, kým platba nebeží (pack §3 „Platba cez Stripe. Stránka sa otvorí hneď.“ sa vypíše až so Stripe). */
export const FOOT_CAKA = 'Platba sa pripravuje.';

/** PDF export plánu (scripts/export-makleri-pdf.mjs → public/makleri/). */
export const PDF_PATH = '/makleri/neviditelny-makler-plan.pdf';

/** Kam vedie Deň 8 (Launch Partner most). */
export const KONZULTACIA_Z_PLANU = '/konzultacia/?z=plan';

/** Kontakt (ratifikované 19. 9.: WhatsApp wa.me/?text= + adam@xvadur.com). */
export const EMAIL = 'adam@xvadur.com';
export const WHATSAPP_TEXT = 'Ahoj Adam, prichádzam z xvadur.com/makleri a mám otázku k plánu Neviditeľný maklér.';
export const WHATSAPP_URL = `https://wa.me/?text=${encodeURIComponent(WHATSAPP_TEXT)}`;
export const MAILTO_URL = `mailto:${EMAIL}?subject=${encodeURIComponent('Neviditeľný maklér — otázka')}&body=${encodeURIComponent(WHATSAPP_TEXT)}`;

export function stripeReady(): boolean {
  return STRIPE_URL.trim().length > 0;
}
