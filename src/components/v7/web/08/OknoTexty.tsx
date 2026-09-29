/** V7-08 · okno Texty = zoznam súborov. Posledné texty z kolekcie `texty` (prop z Astra), odkazy na /texty/, Substack
 *  a Hriech (overené v fakty.ts). Texty z v5/TextyHry.astro („Mimo ordinácie.“). */
import { ArrowRight, ExternalLink, FileText, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { DOKAZY, OVERENE_DNA_TEXT } from '@/data/fakty';
import { SUBSTACK_URL } from '@/components/texty/citanie';
import Okno from './Okno';
import type { Text } from './data';

const hriech = DOKAZY.find((d) => d.id === 'hriech')!;

export default function OknoTexty({ texty }: { texty: Text[] }) {
  const [prvy, ...dalsie] = texty;
  return (
    <Okno id="texty" ikona={<Newspaper />} className="lg:col-span-7 lg:mt-10 lg:translate-x-4" stav={<>TEXTY.TXT · {texty.length} najnovšie · všetko na /texty/</>}>
      <div className="flex flex-col gap-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-bold tracking-[0.16em] uppercase">Texty · Hriech</p>
            <p className="font-display text-3xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-4xl">Mimo ordinácie.</p>
          </div>
          <p className="max-w-sm text-base">Píšem o tom, čo staviam. A v Hriechu stanovujem diagnózu slovenským médiám.</p>
        </div>

        {prvy && (
          <article className="relative flex flex-col gap-3 border-3 border-ink bg-yellow p-5 shadow-[6px_6px_0_0_var(--color-ink)]">
            <p className="font-mono text-xs font-bold uppercase">Posledný text · {prvy.datum}</p>
            <h3 className="font-display text-2xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-3xl">
              <a href={`/texty/${prvy.id}/`} className="no-underline hover:underline hover:decoration-4">
                {prvy.title}
              </a>
            </h3>
            <p className="font-serif text-xl leading-snug italic">{prvy.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={`/texty/${prvy.id}/`}>
                  Čítať <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/texty/">Všetky texty</a>
              </Button>
              <Button asChild variant="outline">
                <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer">
                  Substack <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            </div>
          </article>
        )}

        {dalsie.length > 0 && (
          <ul className="flex list-none flex-col border-3 border-ink p-0" aria-label="Ďalšie texty">
            {dalsie.map((t, i) => (
              <li key={t.id} className={i > 0 ? 'border-t-3 border-ink' : ''}>
                <a href={`/texty/${t.id}/`} className="flex min-h-12 items-center gap-3 bg-white px-3 py-2 hover:bg-yellow focus-visible:bg-yellow">
                  <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate font-bold">{t.title}</span>
                  <span className="shrink-0 font-mono text-xs">{t.datum}</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3 border-3 border-ink bg-ink p-4 text-paper">
          <p className="font-display text-xl font-extrabold uppercase">Diagnóza médií:</p>
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <a
                href={hriech.url!}
                target="_blank"
                rel="noopener noreferrer"
                data-track="dokaz_klik"
                data-track-miesto="v708-texty"
                className="inline-flex min-h-11 items-center gap-2 border-3 border-paper bg-white px-4 font-display font-extrabold text-ink uppercase"
              >
                hriech.xvadur.com <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </HoverCardTrigger>
            <HoverCardContent className="w-72">
              <img src={hriech.obrazok!} alt="Hriech — náhľad publikácie" width={960} height={600} loading="lazy" className="aspect-[16/10] w-full border-3 border-ink object-cover object-top" />
              <p className="mt-2 text-sm">{hriech.riadok}</p>
            </HoverCardContent>
          </HoverCard>
          <p className="w-full text-sm text-paper/75">
            {hriech.riadok} Odkaz overený {OVERENE_DNA_TEXT}.
          </p>
        </div>
      </div>
    </Okno>
  );
}
