/** V7-10 · Podnos 09 · Zápis a texty. Lákadlo a newsletter (funkčný zápis /api/zapis/, texty z v5/Zber.astro),
 *  posledný text z kolekcie (prop z Astro), Hriech (overený odkaz), dvere ⌘K do celého ekosystému. */
import { ArrowRight, ArrowUpRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KbdCombo } from '@/components/ui/kbd';
import { ArrowBadge } from '@/components/ui/shapes';
import { DOKAZY, OVERENE_DNA_TEXT } from '@/data/fakty';
import { LAKADLO, NEWSLETTER } from '@/data/ponuka';
import { Dlazdica, Etiketa } from './Dlazdica';
import { UDALOST } from './data';
import Zapis from './Zapis';

export type Text = { id: string; title: string; description: string; datum: string };

const hriech = DOKAZY.find((d) => d.id === 'hriech')!;
const SUBSTACK = 'https://substack.com/@xvadur';
const DVERE = ['Texty', 'Hriech', 'Netopier', 'Korpus', 'Hry', 'Vyšetrenie'];

export default function ZapisTexty({ posledny }: { posledny: Text | null }) {
  return (
    <div className="v10-mriezka">
      <Dlazdica tone="yellow" className="col-span-2 md:col-span-6 lg:col-span-6 lg:row-span-2" stitok="Z-01 · newsletter" bezMagnetu>
        <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <Etiketa cislo="09" nazov="Zápis" />
          <h2 className="font-display text-[clamp(2.4rem,1.4rem+3vw,3.8rem)] leading-[0.86] font-extrabold tracking-tighter uppercase">{NEWSLETTER.nazov}</h2>
          <p className="max-w-lg text-lg leading-snug">{NEWSLETTER.popis}</p>
          <Zapis zdroj="newsletter" produkt={NEWSLETTER.id} tlacidlo="Odoberať" hotovo="Hotovo. Prvé vydanie ti príde do e-mailu." className="mt-auto" />
        </div>
      </Dlazdica>

      <Dlazdica tone="ink" className="col-span-2 md:col-span-6 lg:col-span-6 lg:row-span-2" stitok="Z-02 · lákadlo" bezMagnetu>
        <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow text-yellow">Zadarmo za e-mail</p>
            <Badge variant="secondary" className="shadow-none hover:translate-x-0 hover:translate-y-0">
              {LAKADLO.stav}
            </Badge>
          </div>
          <h3 className="font-display text-[clamp(2rem,1.3rem+2.2vw,3rem)] leading-[0.9] font-extrabold tracking-tight uppercase">{LAKADLO.nazov}</h3>
          <p className="max-w-lg text-lg leading-snug text-paper/85">{LAKADLO.popis}</p>
          <Zapis zdroj="lakadlo" produkt={LAKADLO.id} tlacidlo="Pošli mi návod" tmavy hotovo="Hotovo. Návod ti pošlem, keď ho dopíšem." className="mt-auto" />
        </div>
      </Dlazdica>

      <Dlazdica id="texty" tone="white" className="col-span-2 md:col-span-6 lg:col-span-6 lg:row-span-2" stitok="Z-03 · texty">
        <div className="flex h-full flex-col gap-3 p-5 sm:p-6">
          {posledny ? (
            <>
              <p className="eyebrow">Posledný text · {posledny.datum}</p>
              <h3 className="font-display text-[clamp(1.8rem,1.2rem+1.8vw,2.6rem)] leading-[0.92] font-extrabold tracking-tight uppercase">
                <a href={`/texty/${posledny.id}/`} className="relative z-[1] hover:underline hover:decoration-[4px]">
                  {posledny.title}
                </a>
              </h3>
              <p className="max-w-prose font-serif text-xl leading-snug italic sm:text-2xl">{posledny.description}</p>
            </>
          ) : (
            <h3 className="font-display text-3xl font-extrabold uppercase">Texty</h3>
          )}
          <div className="relative z-[1] mt-auto flex flex-wrap gap-3 pt-2">
            {posledny && (
              <Button asChild variant="secondary">
                <a href={`/texty/${posledny.id}/`}>
                  Čítať <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href="/texty/">
                <BookOpen aria-hidden="true" /> Všetky texty
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={SUBSTACK} target="_blank" rel="noopener noreferrer">
                Substack <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </Dlazdica>

      <Dlazdica tone="ink" className="col-span-2 md:col-span-3 lg:col-span-3 lg:row-span-2" stitok="Z-04 · médiá">
        <div className="flex h-full flex-col">
          <img src={hriech.obrazok!} alt="Hriech — náhľad publikácie" width={960} height={600} loading="lazy" decoding="async" className="aspect-[16/10] w-full border-b-3 border-ink object-cover object-top" />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <p className="eyebrow text-yellow">Diagnóza médií</p>
            <p className="text-sm leading-snug">{hriech.riadok}</p>
            <a
              href={hriech.url!}
              target="_blank"
              rel="noopener noreferrer"
              data-track="dokaz_klik"
              data-track-miesto="v710-hriech-texty"
              className="relative z-[1] mt-auto inline-flex min-h-11 w-fit items-center gap-1 border-3 border-paper bg-paper px-3 font-mono text-xs font-bold text-ink"
            >
              hriech.xvadur.com <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <p className="font-mono text-[10px] tracking-wider uppercase">overené {OVERENE_DNA_TEXT}</p>
          </div>
        </div>
      </Dlazdica>

      <Dlazdica tone="paper" className="col-span-2 md:col-span-3 lg:col-span-3 lg:row-span-2" stitok="Z-05 · dvere">
        <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
          <p className="font-mono text-xs font-bold tracking-[0.14em] uppercase">Ekosystém XVADUR</p>
          <h3 className="font-display text-3xl leading-[0.9] font-extrabold uppercase">Kam chceš ísť?</h3>
          <ul className="flex flex-wrap gap-1.5" aria-label="Dvere">
            {DVERE.map((d) => (
              <li key={d} className="border-2 border-ink bg-white px-2 py-0.5 font-mono text-xs font-bold uppercase">
                {d}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <Button type="button" variant="default" onClick={() => window.dispatchEvent(new CustomEvent(UDALOST.paleta))} className="relative z-[1]">
              Otvoriť paletu
            </Button>
            <KbdCombo keys={['⌘', 'K']} className="hidden lg:inline-flex" />
            <ArrowBadge size={40} color="var(--color-yellow)" aria-hidden="true" className="ml-auto hidden sm:block" />
          </div>
        </div>
      </Dlazdica>
    </div>
  );
}
