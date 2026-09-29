/** V7-08 · okno Anamnéza = prieskumník súborov. Desktop: resizable (strom kapitol | záznamy v scroll-area), výber
 *  v strome posunie záznamy na zastávku. Mobil: iba záznamy pod sebou (timeline), všetky texty sú v HTML vždy.
 *  Texty: src/data/cesta.ts + BIO (katalóg), štítok „text doplní Adam“ tam, kde text na webe nie je. */
import * as React from 'react';
import { ArrowRight, Check, FileText, Folder, FolderOpen } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TreeView, type TreeNode } from '@/components/ui/tree-view';
import { Timeline, TimelineCard, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineTitle } from '@/components/ui/timeline';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stamp } from '@/components/ui/sticker';
import { cn } from '@/lib/utils';
import Okno, { useDesktop } from './Okno';
import { ANAMNEZA, BIO, KAPITOLY, type Zastavka } from './data';
import { otvorOkno } from './store';

const bezPosunu = 'shadow-none hover:translate-x-0 hover:translate-y-0';

export function DoplniAdam() {
  return (
    <Badge variant="outline" className={cn('w-fit border-dashed font-mono normal-case', bezPosunu)}>
      text doplní Adam
    </Badge>
  );
}

const STROM: TreeNode[] = KAPITOLY.map((k) => ({
  id: `k-${k.id}`,
  label: `${k.nazov}/`,
  icon: <Folder className="h-4 w-4" />,
  children: BIO.filter((z) => z.kapitola === k.id).map((z) => ({
    id: z.id,
    label: `${z.nazov}${z.kedy !== '—' ? ` · ${z.kedy}` : ''}`,
    icon: <FileText className="h-4 w-4" />,
  })),
}));
const ROZBALENE = KAPITOLY.map((k) => `k-${k.id}`);

function Zaznamy({ vybrane }: { vybrane: string | null }) {
  return (
    <Timeline className="relative">
      {BIO.map((z, i) => {
        const st = z.id === 'xvadur' ? 'current' : z.doplni ? 'upcoming' : 'completed';
        return (
          <TimelineItem key={z.id} status={st} id={`anam-${z.id}`} data-zaznam={z.id} className="scroll-mt-4">
            <div className="flex flex-col">
              <TimelineDot status={st} size="lg">
                {st === 'completed' ? <Check className="h-5 w-5 stroke-[3]" /> : <span className={cn('font-mono text-xs font-bold', st === 'current' && 'text-paper')}>{i + 1}</span>}
              </TimelineDot>
              {i < BIO.length - 1 && <TimelineConnector status={BIO[i + 1]!.doplni ? 'upcoming' : 'completed'} className="ml-[18.5px] flex-1" />}
            </div>
            <TimelineContent className="min-w-0 pb-6">
              <TimelineCard
                className={cn(
                  'transition-colors',
                  z.doplni ? 'border-dashed bg-paper shadow-none' : z.id === 'odchod' ? 'bg-white' : '',
                  vybrane === z.id && 'bg-yellow',
                )}
              >
                <p className="font-mono text-xs font-bold uppercase">
                  Záznam {String(i + 1).padStart(2, '0')} · {z.kedy}
                </p>
                <TimelineTitle className="font-display text-xl leading-none font-extrabold uppercase sm:text-2xl">{z.nazov}</TimelineTitle>
                {z.kde && <p className="mt-1 font-mono text-xs uppercase">{z.kde}</p>}
                <Separator className="my-3 h-[2px]" />
                {z.doplni ? (
                  <DoplniAdam />
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-base leading-snug">{z.text}</p>
                    {z.citat && <blockquote className="border-l-4 border-stamp pl-4 font-display text-lg leading-snug font-bold">„{z.citat}“</blockquote>}
                  </div>
                )}
              </TimelineCard>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

function Hlavicka() {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs font-bold tracking-[0.16em] uppercase">✚ Anamnéza · C:\XVADUR\CESTA</p>
      <p className="font-display text-3xl leading-[0.9] font-extrabold tracking-tight uppercase sm:text-4xl">{ANAMNEZA.nadpis}</p>
      <p className="font-display text-xl leading-snug font-bold">„{ANAMNEZA.citat}“</p>
      <p className="text-base">{ANAMNEZA.dovetok}</p>
    </div>
  );
}

export default function OknoAnamneza() {
  const desktop = useDesktop();
  const [vybrane, setVybrane] = React.useState<string | null>(null);
  const zaznamy = React.useRef<HTMLDivElement>(null);

  function vyber(ids: string[]) {
    const id = ids[0];
    if (!id || id.startsWith('k-')) return;
    setVybrane(id);
    const el = zaznamy.current?.querySelector<HTMLElement>(`[data-zaznam="${id}"]`);
    const vp = el?.closest<HTMLElement>('[data-radix-scroll-area-viewport]');
    if (el && vp) vp.scrollTo({ top: el.offsetTop - 8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  const pata = (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="accent" size="lg" onClick={() => otvorOkno('vysetrenie')}>
        {ANAMNEZA.cta.replace(' →', '')} <ArrowRight aria-hidden="true" />
      </Button>
      <Stamp variant="destructive" size="sm" rotation="slight" className="text-[9px] leading-tight">
        {ANAMNEZA.peciatka}
      </Stamp>
    </div>
  );

  return (
    <Okno id="anamneza" ikona={<FolderOpen />} className="lg:col-span-8 lg:mt-4" stav={<>{BIO.length} záznamov · 3 priečinky · vyber záznam v strome</>}>
      {desktop ? (
        <ResizablePanelGroup direction="horizontal" className="h-[560px]">
          <ResizablePanel defaultSize={38} minSize={26} className="flex flex-col gap-5 bg-paper p-5">
            <Hlavicka />
            <div className="border-3 border-ink bg-white p-2">
              <TreeView
                data={STROM}
                selectionMode="single"
                selectedIds={vybrane ? [vybrane] : []}
                onSelectedChange={vyber}
                expandedIds={ROZBALENE}
                aria-label="Priečinky anamnézy"
                className="[&_[role=treeitem]>div>span:last-child]:font-bold"
              />
            </div>
            <div className="mt-auto">{pata}</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={62} minSize={40}>
            <ScrollArea className="h-full" data-lenis-prevent>
              <div ref={zaznamy} className="relative p-5">
                <Zaznamy vybrane={vybrane} />
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
          <Hlavicka />
          <div ref={zaznamy}>
            <Zaznamy vybrane={vybrane} />
          </div>
          {pata}
        </div>
      )}
    </Okno>
  );
}
