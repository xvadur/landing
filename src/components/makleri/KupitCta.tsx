/** CTA „KÚPIŤ PLÁN ZA 9 €“ (neobrutalism Button). Číta STRIPE_URL zo src/data/makleri/config.ts:
 *  prázdny (dnes) → tlačidlo disabled s textom „PLATBA ČOSKORO“ + viditeľný stav (CTA_CAKA_STAV, aria-describedby);
 *  vyplnený → <a> na Stripe Payment Link. Vykresľuje sa staticky v Astro (bez client direktívy → 0 kB JS).
 *  Sekundárne odkazy: Skóre webu makléra → /skore/, Konzultácia → /konzultacia/. Farbu textu dedí z rodiča
 *  (v čiernom páse musí mať rodič `text-ink`). Retheme cez tokeny, žiadny hex. */
import { useId } from 'react';

import { Button } from '@/components/vendor/neobrutalism/button';
import { CTA_CAKA, CTA_CAKA_STAV, CTA_KUPIT, STRIPE_URL, stripeReady } from '@/data/makleri/config';

export default function KupitCta({
  size = 'xl',
  align = 'start',
  sekundarne = true,
}: {
  size?: 'lg' | 'xl';
  align?: 'start' | 'center';
  sekundarne?: boolean;
}) {
  const ready = stripeReady();
  const stavId = useId();
  const wrap = align === 'center' ? 'items-center text-center' : 'items-start';
  return (
    <div className={`flex flex-col gap-4 ${wrap}`}>
      {ready ? (
        <Button asChild tone="hot" size={size} className="w-full sm:w-auto">
          <a href={STRIPE_URL} data-cursor="vstup">
            {CTA_KUPIT}
          </a>
        </Button>
      ) : (
        <>
          <Button
            disabled
            aria-disabled="true"
            aria-describedby={stavId}
            tone="white"
            size={size}
            className="w-full cursor-not-allowed border-dashed text-ink shadow-brutal-none disabled:opacity-100 sm:w-auto"
          >
            {CTA_CAKA}
          </Button>
          <p id={stavId} className="-mt-2 font-mono text-sm font-medium tracking-[0.06em] opacity-80">
            {CTA_CAKA_STAV}
          </p>
        </>
      )}
      {sekundarne && (
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 font-display text-base font-extrabold uppercase">
          <a
            href="/skore/"
            className="inline-flex min-h-11 items-center underline decoration-[3px] underline-offset-4 hover:decoration-hot"
          >
            Skóre webu makléra →
          </a>
          <a
            href="/konzultacia/"
            className="inline-flex min-h-11 items-center underline decoration-[3px] underline-offset-4 hover:decoration-hot"
          >
            Konzultácia →
          </a>
        </p>
      )}
    </div>
  );
}
