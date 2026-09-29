/** V7-01 · obrazovka Texty a záznamy: posledný text (kolekcia texty), Hriech ako vlastná publikácia, Substack,
 *  a „záznamy sestry“ = Adamove tézy ako zvislý pás záznamov monitora (Magic UI Marquee, čisté CSS).
 *  Texty z v5/TextyHry.astro a v54/Tezy.astro. Statické SSR. Kusy: card, badge, button, separator, shapes. */
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SpeechBubble } from '@/components/ui/shapes';
import { Marquee } from '@/components/vendor/magicui/marquee';
import { DOKAZY, OVERENE_DNA_TEXT } from '@/data/fakty';
import { TEZY } from './data';

export type Posledny = { id: string; title: string; description: string; datum: string } | null;

const hriech = DOKAZY.find((d) => d.id === 'hriech')!;
const bezPosunu = 'shadow-none hover:translate-x-0 hover:translate-y-0';

export default function Texty({ posledny, substack }: { posledny: Posledny; substack: string }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-12">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink/60">✚ Texty · Hriech · záznamy</p>
        <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <h2 id="texty-h" className="font-display text-display-sm leading-[0.88] font-extrabold tracking-tighter uppercase lg:col-span-7">
            Mimo
            <br />
            ordinácie.
          </h2>
          <p className="max-w-md text-lg lg:col-span-5">Píšem o tom, čo staviam. A v Hriechu stanovujem diagnózu slovenským médiám.</p>
        </div>
      </div>

      {posledny && (
        <Card className="relative flex flex-col bg-white lg:col-span-5">
          <CardHeader className="gap-2">
            <Badge variant="secondary" className={`w-fit ${bezPosunu}`}>
              Posledný text · {posledny.datum}
            </Badge>
            <CardTitle className="font-display text-3xl leading-[0.95] font-extrabold tracking-tight sm:text-4xl">
              <a href={`/texty/${posledny.id}/`} className="hover:underline hover:decoration-4">
                {posledny.title}
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="font-serif text-2xl leading-snug italic">{posledny.description}</p>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 bg-paper">
            <Button asChild variant="secondary">
              <a href={`/texty/${posledny.id}/`}>
                Čítať <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/texty/">Všetky texty</a>
            </Button>
            <Button asChild variant="outline">
              <a href={substack} target="_blank" rel="noopener noreferrer">
                Substack <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="flex flex-col overflow-hidden bg-ink text-paper lg:col-span-3">
        <img src={hriech.obrazok!} alt="Hriech — náhľad publikácie" width={960} height={600} loading="lazy" decoding="async" className="aspect-[16/10] w-full border-b-3 border-ink object-cover object-top" />
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-yellow">Diagnóza médií</p>
          <p className="font-display text-3xl font-extrabold uppercase">Hriech</p>
          <p className="text-base">{hriech.riadok}</p>
          <p className="font-display text-4xl font-extrabold text-yellow" data-m01-cislo>
            {hriech.cislo}
            <span className="ml-2 font-mono text-xs font-bold text-paper uppercase">{hriech.cisloPopis}</span>
          </p>
          <Button asChild variant="outline" className="mt-auto w-fit">
            <a href={hriech.url!} target="_blank" rel="noopener noreferrer" data-track="dokaz_klik" data-track-miesto="v7-01-texty">
              hriech.xvadur.com <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper/70">overené {OVERENE_DNA_TEXT}</p>
        </CardContent>
      </Card>

      <section aria-labelledby="zaznamy-h" className="flex min-w-0 flex-col border-3 border-ink bg-paper shadow-[6px_6px_0_0_var(--color-ink)] lg:col-span-4">
        <header className="flex items-center justify-between gap-3 border-b-3 border-ink bg-yellow px-4 py-3">
          <h3 id="zaznamy-h" className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
            Záznamy sestry · čo som si zapísal
          </h3>
          <SpeechBubble size={28} filled color="var(--color-white)" strokeColor="var(--color-ink)" aria-hidden="true" />
        </header>
        <ul className="sr-only">
          {TEZY.map((t) => (
            <li key={t.veta}>
              {t.veta} ({t.kedy})
            </li>
          ))}
        </ul>
        <div className="relative h-[26rem] overflow-hidden" aria-hidden="true">
          <Marquee vertical repeat={2} duration={70} gap="0.75rem" className="h-full px-3 pt-3">
            {TEZY.map((t) => (
              <figure key={t.veta} className="m-0 w-full border-3 border-ink bg-white p-4">
                <blockquote className="font-display text-lg leading-snug font-extrabold">„{t.veta}“</blockquote>
                <Separator className="my-2 h-[2px]" />
                <figcaption className="flex justify-between gap-2 font-mono text-[11px] font-bold uppercase">
                  <span>Adam Rudavský</span>
                  <span>{t.kedy}</span>
                </figcaption>
              </figure>
            ))}
          </Marquee>
        </div>
      </section>
    </div>
  );
}
