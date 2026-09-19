/** Titulok beatu v „Kto som": Fancy VerticalCutReveal (Motion) — z Astra sa text posiela ako prop `text`
 *  (Astro deti do React ostrova prichádzajú ako slot, nie string).
 *  Ostrov: client:media="(min-width: 1024px) and (prefers-reduced-motion: no-preference)" — mobil a reduced nikdy nehydratujú (0 kB Motion), preto SSR vykreslí obyčajný
 *  text (VerticalCutReveal by na serveri dal znaky posunuté o 100 % = neviditeľné bez JS). Po hydratácii na desktope
 *  sa text vymení za VerticalCutReveal, ktorý vstúpi až vo viewporte; reduced motion = statický (stráž vo vendore). */
import { useEffect, useState } from 'react';
import VerticalCutReveal from '@/components/vendor/fancy/text/vertical-cut-reveal';

export default function Titulok({ text }: { text: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{text}</>;
  return (
    <VerticalCutReveal splitBy="words" staggerDuration={0.06} staggerFrom="first" transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
      {text}
    </VerticalCutReveal>
  );
}
