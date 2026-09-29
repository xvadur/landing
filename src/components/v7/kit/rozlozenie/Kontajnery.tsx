/** Kit · Rozloženie 1/4 — kontajnery: card, accordion, collapsible, tabs, separator, aspect-ratio, scroll-area, resizable. */
import * as React from 'react';
import { ChevronDown, Stethoscope, Activity, ClipboardList, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VLAJKA, PRODUKTY } from '@/data/ponuka';
import { PRIPAD_MAKLER, DOKAZY, VYSLEDKY } from '@/data/fakty';
import { CESTA } from '@/data/cesta';
import { Kus, Mriezka, Variant } from './Kus';
import { ANAMNEZA } from './data';

/** Accordion: otvorený stav je v BoldKite bg-accent (= hot). Hot patrí iba CTA, preto žltá. */
/** Radix obalí trigger do <h3>; globálne h3 (global.css) mu dá display veľkosť → text-base vracia veľkosť BoldKitu. */
const ACC_OPEN = '[&[data-state=open]]:bg-yellow min-h-14 text-left text-base';
const ACC_VELKY = '[&[data-state=open]]:bg-yellow min-h-14 text-left';
const TAB = 'min-h-11';
const TAB_Z = 'min-h-11 data-[state=active]:bg-yellow data-[state=active]:text-ink';
const noHover = 'shadow-none hover:translate-x-0 hover:translate-y-0';

export default function Kontajnery() {
  const [otvorene, setOtvorene] = React.useState(false);
  const [acc, setAcc] = React.useState<string>('triaz');
  return (
    <div>
      {/* ---------------- CARD ---------------- */}
      <Kus id="card" meno="card" subor="card.tsx" veta="Základná doska: rám 3 px, tvrdý tieň, hlavička a pätička oddelené čiarou. Na produkty, chorobopisy, zastávky príbehu.">
        <Mriezka>
          <Variant props="<Card> (role=article)">
            <Card>
              <CardContent>{VLAJKA.titulok}</CardContent>
            </Card>
          </Variant>
          <Variant props="Header + Title + Description + Content + Footer">
            <Card>
              <CardHeader>
                <CardTitle>{VLAJKA.nazov}</CardTitle>
                <CardDescription>
                  {VLAJKA.trvanie} · {VLAJKA.cena}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">{VLAJKA.body[0]}</CardContent>
              <CardFooter className="gap-3">
                <Button variant="accent" className="text-ink">
                  Objednať vyšetrenie
                </Button>
              </CardFooter>
            </Card>
          </Variant>
          <Variant props="interactive (hover a active: tieň zmizne)">
            <Card interactive tabIndex={0} role="link" aria-label={PRODUKTY[1].nazov}>
              <CardHeader>
                <CardTitle>{PRODUKTY[1].nazov}</CardTitle>
                <CardDescription>{PRODUKTY[1].nalepka}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">{PRODUKTY[1].popis}</CardContent>
            </Card>
          </Variant>
          <Variant props="className: bg-yellow · CardHeader bez čiary">
            <Card className="bg-yellow">
              <CardHeader className="border-b-0 pb-0">
                <CardTitle>{PRODUKTY[0].nazov}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{PRODUKTY[0].popis}</CardContent>
            </Card>
          </Variant>
          <Variant props="className: bg-ink text-paper · CardDescription text-paper/70">
            <Card className="bg-ink text-paper">
              <CardHeader className="border-paper/30">
                <CardTitle>{PRODUKTY[2].nazov}</CardTitle>
                <CardDescription className="text-paper/70">{PRODUKTY[2].pre}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">{PRODUKTY[2].popis}</CardContent>
            </Card>
          </Variant>
          <Variant props="className: rounded-lg + shadow-brutal (zákon webu)">
            <Card className="overflow-hidden rounded-lg shadow-brutal">
              <CardHeader className="bg-paper">
                <CardTitle className="font-display text-3xl font-extrabold">{PRIPAD_MAKLER.cisla[0].value}</CardTitle>
                <CardDescription>{PRIPAD_MAKLER.cisla[0].label}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">{PRIPAD_MAKLER.stav}</CardContent>
            </Card>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- ACCORDION ---------------- */}
      <Kus id="accordion" meno="accordion" subor="accordion.tsx" veta="Rozbaľovací zoznam na Radixe: jeden otvorený naraz alebo viac. Na FAQ, postup liečby, detail chorobopisu.">
        <Mriezka className="lg:grid-cols-2">
          <Variant props='type="single" collapsible · kontrolované value (Liečba)'>
            <Accordion type="single" collapsible value={acc} onValueChange={setAcc}>
              {['triaz', 'diagnoza', 'plan'].map((id, i) => (
                <AccordionItem key={id} value={id}>
                  <AccordionTrigger className={ACC_OPEN}>{['Triáž', 'Diagnóza', 'Plán liečby'][i]}</AccordionTrigger>
                  <AccordionContent className="text-base">{VLAJKA.body[i]}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-3 font-mono text-xs">value = „{acc || '—'}“</p>
          </Variant>
          <Variant props='type="multiple" · defaultValue={[…]} · disabled položka'>
            <Accordion type="multiple" defaultValue={['kohorta', 'agent-pre-teba']}>
              {PRODUKTY.slice(0, 4).map((p, i) => (
                <AccordionItem key={p.id} value={p.id} disabled={i === 3}>
                  <AccordionTrigger className={ACC_OPEN}>
                    <span className="flex flex-col gap-1">
                      {p.nazov}
                      <span className="font-mono text-xs font-medium normal-case">{i === 3 ? 'disabled' : p.nalepka}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-base">{p.popis}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Variant>
          <Variant props="pôvodný open stav bg-accent (= hot) — len na porovnanie">
            <Accordion type="single" collapsible defaultValue="a">
              <AccordionItem value="a">
                <AccordionTrigger className="min-h-14 text-left text-base">Pôvodný vzhľad BoldKitu</AccordionTrigger>
                <AccordionContent>Otvorený riadok svieti hot. Na webe nie: hot je iba CTA a X.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Variant>
          <Variant props='bez tieňa, medzery · orientation="horizontal" · trigger bez text-base = display h3 z global.css'>
            <Accordion type="single" collapsible orientation="horizontal" className="flex flex-col gap-3">
              {CESTA.slice(0, 3).map((k) => (
                <AccordionItem key={k.nazov} value={k.nazov} className="border-b-3 shadow-none">
                  <AccordionTrigger className={ACC_VELKY}>
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-xs">{k.kedy}</span>
                      {k.nazov}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-base">{k.text}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- COLLAPSIBLE ---------------- */}
      <Kus id="collapsible" meno="collapsible" subor="collapsible.tsx" veta="Jeden skrytý blok s vlastným spúšťačom. Na citát, dovetok, „čítať viac“ pri zastávke príbehu.">
        <Mriezka>
          <Variant props="nekontrolované · Trigger asChild → Button">
            <Collapsible className="flex flex-col gap-3">
              <p className="text-lg font-bold">{CESTA[1].text}</p>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-fit">
                  Citát <ChevronDown className="transition-transform" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <blockquote className="border-l-4 border-ink pl-4 font-display text-xl font-bold">„{CESTA[1].citat}“</blockquote>
              </CollapsibleContent>
            </Collapsible>
          </Variant>
          <Variant props="defaultOpen">
            <Collapsible defaultOpen className="flex flex-col gap-3 border-3 border-ink bg-white p-4">
              <CollapsibleTrigger className="flex min-h-11 items-center justify-between font-bold uppercase">
                {ANAMNEZA.citat} <ChevronDown className="h-5 w-5 shrink-0" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p>{ANAMNEZA.dovetok}</p>
              </CollapsibleContent>
            </Collapsible>
          </Variant>
          <Variant props="kontrolované open / onOpenChange · disabled">
            <Collapsible open={otvorene} onOpenChange={setOtvorene} className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <CollapsibleTrigger asChild>
                  <Button variant="secondary">{otvorene ? 'Zavrieť' : 'Čo dostal Jakub'}</Button>
                </CollapsibleTrigger>
                <Button variant="outline" disabled>
                  disabled
                </Button>
              </div>
              <CollapsibleContent>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                  {PRIPAD_MAKLER.dostal.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- TABS ---------------- */}
      <Kus id="tabs" meno="tabs" subor="tabs.tsx" veta="Záložky na Radixe: vodorovne, zvislo, ručná aktivácia, vypnutá záložka. Na kapitoly príbehu a prepínanie pacientov.">
        <Mriezka className="lg:grid-cols-2">
          <Variant props='defaultValue · orientation="horizontal" (predvolené)'>
            <Tabs defaultValue="triaz">
              <div className="overflow-x-auto pb-2">
                <TabsList>
                  <TabsTrigger className={TAB} value="triaz">Triáž</TabsTrigger>
                  <TabsTrigger className={TAB} value="zasah">Zásah</TabsTrigger>
                  <TabsTrigger className={TAB} value="odovzdanie">Odovzdanie</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="triaz">{VLAJKA.body[0]}</TabsContent>
              <TabsContent value="zasah">{VLAJKA.body[1]}</TabsContent>
              <TabsContent value="odovzdanie">{VLAJKA.body[2]}</TabsContent>
            </Tabs>
          </Variant>
          <Variant props="ikony v TabsTrigger (gap-1.5) · disabled · TabsList grid na celú šírku · aktívna žltá">
            <Tabs defaultValue="pacient">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger className={TAB_Z} value="pacient">
                  <Stethoscope className="h-4 w-4" /> Pacient
                </TabsTrigger>
                <TabsTrigger className={TAB_Z} value="vitalne">
                  <Activity className="h-4 w-4" /> Vitálne
                </TabsTrigger>
                <TabsTrigger className={TAB_Z} value="zamknute" disabled>
                  <Lock className="h-4 w-4" /> Zámok
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pacient">{PRIPAD_MAKLER.kto}: {DOKAZY[0].riadok}</TabsContent>
              <TabsContent value="vitalne">{VYSLEDKY[5].value} · {VYSLEDKY[5].label.toLowerCase()} ({VYSLEDKY[5].note})</TabsContent>
            </Tabs>
          </Variant>
          <Variant props='orientation="vertical" · TabsList flex-col h-auto'>
            <Tabs defaultValue={CESTA[0].nazov} orientation="vertical" className="flex flex-col gap-4 sm:flex-row">
              <TabsList className="h-auto flex-row flex-wrap items-stretch justify-start sm:w-44 sm:flex-col">
                {CESTA.map((k) => (
                  <TabsTrigger key={k.nazov} className={`${TAB} justify-start`} value={k.nazov}>
                    {k.nazov}
                  </TabsTrigger>
                ))}
              </TabsList>
              {CESTA.map((k) => (
                <TabsContent key={k.nazov} value={k.nazov} className="mt-0 flex-1">
                  <p className="font-mono text-xs">{k.kedy}</p>
                  <p className="mt-2">{k.text}</p>
                </TabsContent>
              ))}
            </Tabs>
          </Variant>
          <Variant props='activationMode="manual" (šípky presúvajú fokus, Enter prepne) · pôvodná farba bg-primary'>
            <Tabs defaultValue="mal" activationMode="manual">
              <TabsList>
                <TabsTrigger className="min-h-11" value="mal">
                  <ClipboardList className="h-4 w-4" /> Mal
                </TabsTrigger>
                <TabsTrigger className="min-h-11" value="dostal">
                  Dostal
                </TabsTrigger>
              </TabsList>
              <TabsContent value="mal">
                <ul className="list-disc pl-5 text-sm">
                  {PRIPAD_MAKLER.mal.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="dostal">
                <ul className="list-disc pl-5 text-sm">
                  {PRIPAD_MAKLER.dostal.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- SEPARATOR ---------------- */}
      <Kus id="separator" meno="separator" subor="separator.tsx" veta="Čiara 3 px vodorovne alebo zvislo, dekoratívna alebo sémantická. Na rytmus textu a pás čísel.">
        <Mriezka>
          <Variant props='orientation="horizontal" (predvolené), decorative'>
            <div className="flex flex-col gap-3">
              <p className="font-bold">{ANAMNEZA.nadpis}</p>
              <Separator />
              <p className="text-sm">{ANAMNEZA.dovetok}</p>
            </div>
          </Variant>
          <Variant props='orientation="vertical" · v riadku čísel'>
            <div className="flex h-16 items-center gap-4">
              {PRIPAD_MAKLER.cisla.map((c, i) => (
                <React.Fragment key={c.label}>
                  {i > 0 && <Separator orientation="vertical" />}
                  <div className="min-w-0">
                    <p className="font-display text-xl font-extrabold whitespace-nowrap">{c.value}</p>
                    <p className="font-mono text-[10px] leading-tight uppercase">{c.label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Variant>
          <Variant props="decorative={false} (role=separator) · className: h-[6px] bg-stamp · s textom">
            <div className="flex items-center gap-3">
              <Separator decorative={false} className="h-[6px] flex-1 bg-stamp" />
              <span className="font-mono text-xs font-bold uppercase">✚ záznam</span>
              <Separator decorative={false} className="h-[6px] flex-1 bg-stamp" />
            </div>
          </Variant>
          <Variant props="className: bg-transparent border-t-3 border-dashed">
            <Separator className="h-0 border-t-3 border-dashed border-ink bg-transparent" />
          </Variant>
          <Variant props="className: bg-yellow h-3 · na tmavom">
            <div className="bg-ink p-4">
              <Separator className="h-3 bg-yellow" />
            </div>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- ASPECT-RATIO ---------------- */}
      <Kus id="aspect-ratio" meno="aspect-ratio" subor="aspect-ratio.tsx" veta="Rám s pevným pomerom strán (Radix, bez štýlu). Na fotky projektov, video z Higgsfieldu, portrét v bio.">
        <Mriezka className="lg:grid-cols-4">
          {(
            [
              ['ratio={16 / 9}', 16 / 9, '/assets/dokazy/hriech.webp', 'object-top'],
              ['ratio={4 / 3}', 4 / 3, '/assets/dokazy/terapeutka.webp', 'object-top'],
              ['ratio={1}', 1, '/assets/hero-adam.webp', 'object-[48%_20%]'],
              ['ratio={3 / 4} (portrét)', 3 / 4, '/assets/hero-adam.webp', 'object-[48%_30%]'],
            ] as const
          ).map(([p, r, src, pos]) => (
            <Variant key={p} props={p}>
              <div className="border-3 border-ink bg-paper shadow-brutal-sm">
                <AspectRatio ratio={r}>
                  <img src={src} alt="" loading="lazy" className={`h-full w-full object-cover ${pos}`} />
                </AspectRatio>
              </div>
            </Variant>
          ))}
          <Variant props="ratio={21 / 9} · typografický panel bez obrázka" className="sm:col-span-2">
            <div className="border-3 border-ink bg-yellow">
              <AspectRatio ratio={21 / 9} className="flex flex-col justify-end p-4">
                <p className="font-display text-4xl leading-none font-extrabold">{DOKAZY[4].cislo}</p>
                <p className="font-mono text-xs uppercase">{DOKAZY[4].cisloPopis}</p>
              </AspectRatio>
            </div>
          </Variant>
          <Variant props="ratio={9 / 16} · miesto pre vertikálne video" className="sm:col-span-2 lg:col-span-2">
            <div className="mx-auto w-40 border-3 border-dashed border-ink bg-white">
              <AspectRatio ratio={9 / 16} className="flex items-center justify-center p-3 text-center font-mono text-xs">
                zástupná plocha 9 : 16
              </AspectRatio>
            </div>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- SCROLL-AREA ---------------- */}
      <Kus id="scroll-area" meno="scroll-area" subor="scroll-area.tsx" veta="Vlastný posuvník (Radix) so štvorcovým čiernym palcom, zvislo aj vodorovne. Na dlhý záznam, pás kariet, register.">
        <Mriezka>
          <Variant props='zvislý (predvolený ScrollBar) · h-72'>
            <ScrollArea className="h-72 border-3 border-ink bg-white">
              <ol className="flex flex-col">
                {CESTA.map((k, i) => (
                  <li key={k.nazov} className="border-b-3 border-ink p-4 last:border-b-0">
                    <p className="font-mono text-xs">
                      Záznam {String(i + 1).padStart(2, '0')} · {k.kedy}
                    </p>
                    <p className="font-bold uppercase">{k.nazov}</p>
                    <p className="text-sm">{k.text}</p>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </Variant>
          <Variant props='<ScrollBar orientation="horizontal" /> · pás kariet' className="sm:col-span-2">
            <ScrollArea className="w-full border-3 border-ink bg-paper">
              <ul className="flex w-max gap-4 p-4">
                {VYSLEDKY.map((v) => (
                  <li key={v.label} className="w-44 shrink-0 border-3 border-ink bg-white p-3">
                    <p className="font-display text-2xl font-extrabold">{v.value}</p>
                    <p className="font-mono text-xs uppercase">{v.label}</p>
                    <p className="text-xs text-ink/70">{v.note}</p>
                  </li>
                ))}
              </ul>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Variant>
          <Variant props='type="always" (ďalšie: auto · scroll · hover) · žltý palec cez className na tmavom' className="sm:col-span-2 lg:col-span-1">
            <ScrollArea type="always" className="h-48 bg-ink p-3 text-paper [&_[data-orientation=vertical]>div]:bg-yellow">
              <div className="flex flex-col gap-3 pr-4">
                {PRODUKTY.map((p) => (
                  <p key={p.id} className="text-sm">
                    <b className="uppercase">{p.nazov}.</b> {p.popis}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- RESIZABLE ---------------- */}
      <Kus id="resizable" meno="resizable" subor="resizable.tsx" veta="Panely s ťahadlom (react-resizable-panels): vodorovne, zvislo, vnorene, s minimom a zbalením. Na „pred a po“, porovnanie verzií.">
        <Mriezka className="lg:grid-cols-2">
          <Variant props='direction="horizontal" · withHandle · minSize={25} · „Mal / Dostal“'>
            <ResizablePanelGroup direction="horizontal" className="min-h-64 border-3 border-ink">
              <ResizablePanel defaultSize={50} minSize={25} className="bg-paper p-4">
                <p className="font-mono text-xs font-bold uppercase">Mal</p>
                <ul className="mt-2 flex flex-col gap-2 text-sm">
                  {PRIPAD_MAKLER.mal.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={25} className="bg-yellow p-4">
                <p className="font-mono text-xs font-bold uppercase">Dostal</p>
                <ul className="mt-2 flex flex-col gap-2 text-sm">
                  {PRIPAD_MAKLER.dostal.slice(0, 3).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </ResizablePanel>
            </ResizablePanelGroup>
          </Variant>
          <Variant props='direction="vertical" · bez withHandle'>
            <ResizablePanelGroup direction="vertical" className="min-h-64 border-3 border-ink">
              <ResizablePanel defaultSize={40} className="flex items-center bg-white p-4">
                <p className="font-bold uppercase">{CESTA[0].nazov}</p>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={60} className="flex items-center bg-ink p-4 text-paper">
                <p className="font-bold uppercase">{CESTA[4].nazov}</p>
              </ResizablePanel>
            </ResizablePanelGroup>
          </Variant>
          <Variant props="vnorené skupiny · collapsible + collapsedSize={0}" className="lg:col-span-2">
            <ResizablePanelGroup direction="horizontal" className="min-h-72 border-3 border-ink">
              <ResizablePanel defaultSize={30} minSize={15} collapsible collapsedSize={0} className="bg-paper p-4">
                <p className="font-mono text-xs font-bold uppercase">Register</p>
                <ul className="mt-2 flex flex-col gap-1 text-sm">
                  {DOKAZY.slice(0, 5).map((d) => (
                    <li key={d.id}>{d.nazov}</li>
                  ))}
                </ul>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={70}>
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={55} className="bg-white p-4">
                    <p className="font-display text-3xl font-extrabold">{DOKAZY[1].cislo}</p>
                    <p className="text-sm">{DOKAZY[1].riadok}</p>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={45} className="bg-yellow p-4">
                    <p className="text-sm">{DOKAZY[4].riadok}</p>
                    <Badge variant="outline" className={`mt-2 ${noHover}`}>
                      ťahaj rukoväť, register sa dá zbaliť
                    </Badge>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </Variant>
        </Mriezka>
      </Kus>
    </div>
  );
}

