/** V7-04 · Cesta klienta ako lievik (BoldKit funnel-chart): vyšetrenie sa zužuje z 30 minút na jeden ďalší krok.
 *  Hodnoty = minúty, ktoré na začiatku fázy ostávajú (prepočet časov z konzultacia/data.ts PRIEBEH, nie nové čísla).
 *  Ostrov: <CestaKlienta client:visible /> */
import { FunnelChart } from '@/components/ui/funnel-chart';
import { CESTA_KLIENTA, CESTA_NAZVY } from './data';

/** Od alarmu (problém) po pokoj (ďalší krok); hot sa v dátach nepoužíva. */
const FARBY = ['hsl(var(--destructive))', 'hsl(var(--secondary))', 'hsl(var(--card))', 'hsl(var(--muted))', 'hsl(var(--foreground))'];

export default function CestaKlienta() {
  const data = CESTA_KLIENTA.map((k, i) => ({ name: `${CESTA_NAZVY[i]} · ${k.zostava} min`, value: k.zostava, fill: FARBY[i] }));
  return (
    <div className="w-[calc(100%-7.5rem)] sm:w-[calc(100%-9rem)] [&_svg]:!overflow-visible">
      <FunnelChart data={data} height={300} ariaLabel="Lievik vyšetrenia: 30, 25, 18, 12 a 5 minút do konca, od úlohy po ďalší krok" />
    </div>
  );
}
