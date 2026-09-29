/** V7-10 · Podnos 04 · Inštrumentár. Doslova podnos: 12 nástrojov (v54/Nastroje.astro), každý v bunke, pri hoveri
 *  sa zdvihne. Farby bez hot (hot iba CTA a X). Posledná bunka = zástupná plocha makro záberu nástrojov. */
import { Dlazdica, Etiketa } from './Dlazdica';
import { NASTROJE } from './data';
import { AsciiTorus } from '@/components/ui/ascii-shapes';

export default function Nastroje() {
  return (
    <div className="v10-mriezka">
      <Dlazdica tone="yellow" className="col-span-2 md:col-span-6 lg:col-span-4 lg:row-span-2" stitok="I-00 · podnos" bezMagnetu>
        <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <Etiketa cislo="04" nazov="Inštrumentár" />
          <h2 className="font-display text-[clamp(2.4rem,1.4rem+3vw,3.8rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">Moje nástroje</h2>
          <p className="mt-auto text-lg leading-snug">
            Nie som programátor. Po slovensky rozprávam k počítaču a tieto nástroje robia, čo poviem. Každý deň od januára 2025.
          </p>
        </div>
      </Dlazdica>
      {NASTROJE.map((n, i) => (
        <Dlazdica key={n.nazov} tone={n.tone} className="col-span-1 md:col-span-2 lg:col-span-2" stitok={`I-${String(i + 1).padStart(2, '0')}`}>
          <div className="flex h-full flex-col gap-2 p-3 sm:p-4">
            <span
              className="v10-znak flex h-10 w-10 shrink-0 items-center justify-center border-3 border-ink bg-paper font-display text-xl text-ink"
              aria-hidden="true"
            >
              {n.znak}
            </span>
            <h3 className="font-display text-[1.35rem] leading-none font-extrabold tracking-tight uppercase sm:text-2xl">{n.nazov}</h3>
            <p className="text-sm leading-snug opacity-85">{n.na}</p>
          </div>
        </Dlazdica>
      ))}
      <Dlazdica tone="ink" className="col-span-2 md:col-span-6 lg:col-span-4" stitok="I-13 · makro">
        <div className="relative flex h-full min-h-36 items-end overflow-hidden p-3 sm:p-4">
          <AsciiTorus size="sm" color="var(--color-yellow)" speed="slow" className="absolute inset-0 m-auto h-fit w-fit text-[8px] leading-[1.05]" aria-hidden="true" />
          <p className="relative border-2 border-paper bg-ink px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-paper uppercase">
            HIGGSFIELD: v710-makro-nastroje · 16:9
          </p>
        </div>
      </Dlazdica>
    </div>
  );
}
