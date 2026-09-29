/** V7-01 · obrazovka Liečba: tri kanály monitora ako záložky (Triáž / Zásah / Odovzdanie). Texty doslovne
 *  z v54/Liecba.astro a src/data/ponuka.ts. Kusy: tabs, table, layered-card, sticker.
 *  Ostrov: <Liecba client:visible /> (záložky potrebujú hydratáciu; SSR vykreslí prvú). */
import { ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LayeredCard } from '@/components/ui/layered-card';
import { Sticker } from '@/components/ui/sticker';
import { PRECO_NIE_CHATGPT, PRODUKTY, VLAJKA } from '@/data/ponuka';
import Zaber from './Zaber';

const agent = PRODUKTY.find((p) => p.id === 'agent-pre-teba')!;
const ucenie = PRODUKTY.filter((p) => p.id !== 'agent-pre-teba');
const CTA =
  'inline-flex min-h-13 w-fit items-center gap-2 border-3 border-ink bg-hot px-6 font-display text-lg font-extrabold uppercase text-ink shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px]';

export default function Liecba() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink/60">✚ Liečba · služby</p>
          <h2 id="liecba-h" className="mt-3 font-display text-display-sm leading-[0.88] font-extrabold tracking-tighter uppercase">
            Triáž. Zásah.
            <br />
            Odovzdanie.
          </h2>
        </div>
        <p className="max-w-xl text-lg lg:col-span-5">
          Postup ako na zmene. Najprv zistím, čo bolí. Potom najmenší zásah, ktorý pomôže. Na konci ti to odovzdám tak, aby to išlo aj bezo mňa.
        </p>
      </div>

      <Tabs defaultValue="triaz" className="flex flex-col">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1 sm:w-fit">
          {[
            ['triaz', '01', 'Triáž'],
            ['zasah', '02', 'Zásah'],
            ['odovzdanie', '03', 'Odovzdanie'],
          ].map(([v, c, n]) => (
            <TabsTrigger key={v} value={v} className="min-h-11 flex-col gap-0 px-2 font-display text-sm sm:flex-row sm:gap-2 sm:px-5 sm:text-base">
              <span className="font-mono text-[10px] sm:text-xs">{c}</span> {n}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="triaz" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-5 lg:col-span-7">
              <p className="font-mono text-sm font-bold uppercase tracking-[0.14em]">
                {VLAJKA.nazov} · {VLAJKA.trvanie} · {VLAJKA.cena}
              </p>
              <p className="font-display text-3xl leading-tight font-extrabold sm:text-4xl">{VLAJKA.titulok}</p>
              <ol className="grid gap-3" role="list">
                {VLAJKA.body.map((b, i) => (
                  <li key={b} className="flex gap-4 border-3 border-ink bg-white p-4 shadow-[4px_4px_0_0_var(--color-ink)]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-ink bg-yellow font-mono font-bold">{i + 1}</span>
                    <span className="text-lg leading-snug">{b}</span>
                  </li>
                ))}
              </ol>
              <a href="#vysetrenie" data-m01-cta data-track="konzultacia_klik" data-track-miesto="v7-01-liecba" className={CTA}>
                Vyber si termín <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
            <Zaber id="01-sesterska-stanica" popis="sesterská stanica, monitory, tvrdé svetlo" pomer="4 / 3" tvar="mriezka" ton="yellow" className="lg:col-span-5 lg:self-start" />
          </div>
        </TabsContent>

        <TabsContent value="zasah" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-5">
              <p className="font-mono text-sm font-bold uppercase tracking-[0.14em]">
                {agent.nalepka} · {agent.pre}
              </p>
              <p className="font-display text-3xl leading-tight font-extrabold sm:text-4xl">
                {agent.nazov}. {agent.popis}
              </p>
              <ul className="flex flex-wrap gap-2" role="list">
                {agent.body.map((b) => (
                  <li key={b}>
                    <Sticker variant="secondary" size="sm" rotation="none" shadow="default">
                      {b}
                    </Sticker>
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0 border-3 border-ink bg-white shadow-[6px_6px_0_0_var(--color-ink)] lg:col-span-7">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2 font-display text-base">Chat</TableHead>
                    <TableHead className="w-1/2 border-l-3 border-ink bg-yellow font-display text-base text-ink">Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PRECO_NIE_CHATGPT.map((r) => (
                    <TableRow key={r.chat}>
                      <TableCell className="align-top text-ink/70 line-through decoration-stamp decoration-2">{r.chat}</TableCell>
                      <TableCell className="border-l-3 border-ink align-top font-bold">{r.agent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="odovzdanie" className="mt-6">
          <div className="flex flex-col gap-6">
            <p className="max-w-3xl font-display text-3xl leading-tight font-extrabold sm:text-4xl">
              Naučím ťa robiť to, čo robím ja. Po slovensky, na tvojej vlastnej úlohe.
            </p>
            <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6" role="list">
              {ucenie.map((p) => (
                <li key={p.id} className="pr-3 pb-3">
                  <LayeredCard layers="double" offset="sm" layerColor={p.farba === 'bg-yellow' ? 'primary' : 'secondary'} className="h-full">
                    <article className={`flex h-full flex-col gap-3 p-5 ${p.farba}`}>
                      <Sticker variant="outline" size="sm" rotation="slight" shadow="none" className="w-fit">
                        {p.nalepka}
                      </Sticker>
                      <h3 className="font-display text-2xl leading-none font-extrabold uppercase">{p.nazov}</h3>
                      <p className="font-mono text-xs font-bold uppercase">{p.pre}</p>
                      <ul className="flex flex-wrap gap-1.5" role="list">
                        {p.body.map((b) => (
                          <li key={b} className="border-2 border-ink bg-paper px-2 py-0.5 font-mono text-[11px] font-bold">
                            ✚ {b}
                          </li>
                        ))}
                      </ul>
                      <p className="text-base leading-snug">{p.popis}</p>
                      <a href="#zapis" className="mt-auto inline-flex min-h-11 items-center font-display text-base font-extrabold uppercase underline decoration-3 underline-offset-4">
                        Chcem vedieť ako prvý →
                      </a>
                    </article>
                  </LayeredCard>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
