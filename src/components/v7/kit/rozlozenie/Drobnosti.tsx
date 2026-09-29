/** Kit · Rozloženie 4/4 — obsahové kusy: timeline, tree-view, avatar, badge, kbd, alert, empty-state. */
import * as React from 'react';
import { AlertTriangle, CalendarX, Check, Clock, Globe, Info, Newspaper, Stethoscope, User, Database, Bot, Inbox } from 'lucide-react';
import {
  Timeline,
  TimelineCard,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from '@/components/ui/timeline';
import { TreeView, type TreeNode } from '@/components/ui/tree-view';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Kbd, KbdCombo } from '@/components/ui/kbd';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateIllustration,
  EmptyStatePreset,
  EmptyStateTitle,
  type EmptyStatePresetType,
} from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { DOKAZY, KORPUS, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, ZIVE_CISLA_SNIMKA } from '@/data/fakty';
import { VLAJKA } from '@/data/ponuka';
import { CESTA } from '@/data/cesta';
import { Kus, Mriezka, Variant } from './Kus';
import { BIO } from './data';

const noHover = 'hover:translate-x-0 hover:translate-y-0';
/** Strom: riadok má py-1.5 (≈ 32 px); na 44 px ho natiahneme z koreňa. Výber bg-accent (= hot) → žltá. */
const STROM = '[&_[role=treeitem]>div:first-child]:min-h-11 [&_[role=treeitem]>div.bg-accent:first-child]:bg-yellow';

const EKOSYSTEM: TreeNode[] = [
  {
    id: 'xvadur',
    label: 'xvadur.com',
    icon: <Globe className="h-4 w-4" />,
    children: [
      { id: 'domov', label: 'Domov V5.4', children: CESTA.map((k) => ({ id: `d-${k.nazov}`, label: k.nazov })) },
      { id: 'kit', label: 'Kit (tento katalóg)' },
      { id: 'hry', label: 'Hry', disabled: true },
    ],
  },
  {
    id: 'pacienti',
    label: 'Pacienti',
    icon: <Stethoscope className="h-4 w-4" />,
    children: [
      { id: 'jakub', label: PRIPAD_MAKLER.kto, icon: <User className="h-4 w-4" /> },
      { id: 'lucia', label: PRIPAD_TERAPEUTKA.kto, icon: <User className="h-4 w-4" /> },
    ],
  },
  {
    id: 'hriech',
    label: 'Hriech',
    icon: <Newspaper className="h-4 w-4" />,
    children: [{ id: 'netopier', label: 'Netopier (backend Hriechu)', icon: <Bot className="h-4 w-4" /> }],
  },
  { id: 'korpus', label: `Korpus · ${KORPUS.slova} slov`, icon: <Database className="h-4 w-4" /> },
];

/** Predvoľby majú texty natvrdo po anglicky; tu slovenské customTitle. */
const PRESETY: [EmptyStatePresetType, string][] = [
  ['no-results', 'Nič sa nenašlo'],
  ['no-data', 'Zatiaľ bez dát'],
  ['empty-inbox', 'Prázdna pošta'],
  ['empty-folder', 'Prázdny priečinok'],
  ['no-users', 'Žiadni pacienti'],
  ['empty-cart', 'Prázdny košík'],
  ['no-notifications', 'Bez upozornení'],
  ['no-images', 'Bez obrázkov'],
  ['error', 'Niečo sa pokazilo'],
  ['offline', 'Si offline'],
  ['permission-denied', 'Bez prístupu'],
  ['coming-soon', 'Čoskoro'],
  ['maintenance', 'Údržba'],
  ['upload', 'Nahraj súbor'],
];

export default function Drobnosti() {
  const [rozbalene, setRozbalene] = React.useState<string[]>(['xvadur', 'pacienti']);
  const [vybrane, setVybrane] = React.useState<string[]>(['jakub']);
  const [nacitava, setNacitava] = React.useState(false);
  const vsetkyRodice = ['xvadur', 'domov', 'pacienti', 'hriech'];

  return (
    <div>
      {/* ---------------- TIMELINE ---------------- */}
      <Kus id="timeline" meno="timeline" subor="timeline.tsx" veta="Časová os zo skladačky: bodka, spojnica, obsah, čas, karta. Zvislo aj vodorovne, tri stavy a tri veľkosti bodky. Srdce príbehu.">
        <Mriezka className="lg:grid-cols-2">
          <Variant props='orientation="vertical" · status completed / current / upcoming · Dot size md · Connector'>
            <Timeline>
              {CESTA.map((k, i) => {
                const st = i < CESTA.length - 1 ? 'completed' : 'current';
                return (
                  <TimelineItem key={k.nazov} status={st}>
                    <div className="flex flex-col">
                      <TimelineDot status={st}>{st === 'completed' ? <Check className="h-4 w-4 stroke-[3]" /> : null}</TimelineDot>
                      <TimelineConnector status={i === CESTA.length - 1 ? 'upcoming' : st} className="flex-1" />
                    </div>
                    <TimelineContent>
                      <TimelineHeader>
                        <TimelineTitle>{k.nazov}</TimelineTitle>
                        <TimelineTime>{k.kedy}</TimelineTime>
                      </TimelineHeader>
                      <TimelineDescription>{k.text}</TimelineDescription>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
              <TimelineItem status="upcoming">
                <TimelineDot status="upcoming" />
                <TimelineContent className="pb-0">
                  <TimelineTitle className="text-ink/60">Ďalší pacient: ty</TimelineTitle>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </Variant>
          <Variant props="Dot size sm / md / lg · TimelineCard · spojnica mimo md potrebuje ml opravu">
            <Timeline>
              {(['sm', 'md', 'lg'] as const).map((s, i) => {
                const ml = { sm: 'ml-[10.5px]', md: '', lg: 'ml-[18.5px]' }[s];
                const k = [CESTA[2], CESTA[3], CESTA[4]][i];
                return (
                  <TimelineItem key={s} status={i === 2 ? 'current' : 'completed'}>
                    <div className="flex flex-col">
                      <TimelineDot size={s} status={i === 2 ? 'current' : 'completed'} />
                      <TimelineConnector status="completed" className={`flex-1 ${ml}`} />
                    </div>
                    <TimelineContent>
                      <TimelineCard>
                        <TimelineHeader className="justify-between">
                          <TimelineTitle>{k.nazov}</TimelineTitle>
                          <Badge variant="outline" className={`shadow-none ${noHover}`}>
                            size={s}
                          </Badge>
                        </TimelineHeader>
                        <TimelineTime>{k.kedy}</TimelineTime>
                        <TimelineDescription className="text-ink">{k.text}</TimelineDescription>
                      </TimelineCard>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </Variant>
          <Variant props='orientation="horizontal" · overflow-x-auto · upcoming spojnica prerušovaná' className="lg:col-span-2">
            <div className="overflow-x-auto pb-4">
              <Timeline orientation="horizontal" className="w-max">
                {BIO.map((b, i) => {
                  const st = b.id === 'xvadur' ? 'current' : 'completed';
                  return (
                    <TimelineItem key={b.id} status={st} className="w-44 items-start gap-3">
                      <div className="flex w-full items-center">
                        <TimelineDot status={b.doplni ? 'upcoming' : st} size="sm">
                          <span className="font-mono text-[10px] font-bold">{i + 1}</span>
                        </TimelineDot>
                        {i < BIO.length - 1 && <TimelineConnector status={BIO[i + 1].doplni || b.doplni ? 'upcoming' : 'completed'} className="mt-0 flex-1" />}
                      </div>
                      <TimelineContent className="pr-4">
                        <TimelineTime>{b.kedy}</TimelineTime>
                        <TimelineTitle className="text-sm">{b.nazov}</TimelineTitle>
                        {b.doplni && (
                          <Badge variant="warning" className={`mt-2 shadow-none ${noHover}`}>
                            text doplní Adam
                          </Badge>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            </div>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- TREE-VIEW ---------------- */}
      <Kus id="tree-view" meno="tree-view" subor="tree-view.tsx" veta="Strom s ARIA navigáciou (jedna zastávka Tab, šípky, Home/End), výber jeden alebo viac, zaškrtávanie, ikony. Na mapu ekosystému, register, strom rozhodnutí.">
        <Mriezka>
          <Variant props='selectionMode="none" · defaultExpandedIds · showIcons (predvolené) · disabled uzol'>
            <TreeView data={EKOSYSTEM} defaultExpandedIds={['xvadur']} className={STROM} aria-label="Ekosystém XVADUR" />
          </Variant>
          <Variant props='selectionMode="single" · kontrolované expandedIds + selectedIds · tlačidlá mimo stromu'>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="min-h-11" onClick={() => setRozbalene(vsetkyRodice)}>
                  Rozbaliť všetko
                </Button>
                <Button size="sm" variant="outline" className="min-h-11" onClick={() => setRozbalene([])}>
                  Zbaliť
                </Button>
              </div>
              <TreeView
                data={EKOSYSTEM}
                selectionMode="single"
                expandedIds={rozbalene}
                onExpandedChange={setRozbalene}
                selectedIds={vybrane}
                onSelectedChange={setVybrane}
                className={STROM}
                aria-label="Ekosystém, jeden výber"
              />
              <p className="font-mono text-xs">selectedIds = [{vybrane.join(', ')}]</p>
            </div>
          </Variant>
          <Variant props='selectionMode="multiple" · showCheckboxes · showIcons={false} · pôvodný výber bg-accent'>
            <TreeView
              data={EKOSYSTEM}
              selectionMode="multiple"
              showCheckboxes
              showIcons={false}
              defaultExpandedIds={['pacienti', 'hriech']}
              defaultSelectedIds={['jakub', 'netopier']}
              className="[&_[role=treeitem]>div:first-child]:min-h-11"
              aria-label="Ekosystém, viac výberov"
            />
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- AVATAR ---------------- */}
      <Kus id="avatar" meno="avatar" subor="avatar.tsx" veta="Štvorcová fotka s rámom a tieňom, náhradné iniciály, kým sa obrázok nenačíta. Na autora textu, hlavičku bio, klientov.">
        <Mriezka>
          <Variant props="AvatarImage · veľkosti cez className (h-10 predvolené, h-16, h-24)">
            <div className="flex items-end gap-5">
              {['h-10 w-10', 'h-16 w-16', 'h-24 w-24'].map((s) => (
                <Avatar key={s} className={s}>
                  <AvatarImage src="/assets/hero-adam.webp" alt="Adam" className="origin-[47%_27%] scale-[2.4] object-[48%_50%]" />
                  <AvatarFallback>X</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </Variant>
          <Variant props="AvatarFallback (bez obrázka) · farby cez className">
            <div className="flex items-end gap-5">
              <Avatar className="h-14 w-14">
                <AvatarFallback>J</AvatarFallback>
              </Avatar>
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-yellow text-ink">L</AvatarFallback>
              </Avatar>
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-white text-ink">
                  <img src="/brand/x.svg" alt="" className="h-7 w-7" />
                </AvatarFallback>
              </Avatar>
            </div>
          </Variant>
          <Variant props="rounded-full (sticker) · skupina s presahom · bez hover posunu">
            <div className="flex items-center">
              {['J', 'L', 'H', 'K'].map((p, i) => (
                <Avatar key={p} className={`h-14 w-14 rounded-full ${noHover} ${i > 0 ? '-ml-4' : ''}`} style={{ zIndex: 10 - i }}>
                  <AvatarFallback className={['', 'bg-yellow text-ink', 'bg-stamp text-paper', 'bg-white text-ink'][i]}>{p}</AvatarFallback>
                </Avatar>
              ))}
              <span className="ml-4 font-mono text-xs">Jakub · Lucia · Hriech · Korpus</span>
            </div>
          </Variant>
          <Variant props="avatar + meno + rola (autor, hlavička bio)" className="sm:col-span-2">
            <div className="flex items-center gap-4 border-3 border-ink bg-white p-4">
              <Avatar className={`h-16 w-16 rounded-full ${noHover}`}>
                <AvatarImage src="/assets/hero-adam.webp" alt="" className="origin-[47%_27%] scale-[2.4] object-[48%_50%]" />
                <AvatarFallback>X</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-display text-2xl font-extrabold uppercase">Adam · XVADUR</p>
                <p className="text-sm">{CESTA[4].text}</p>
              </div>
            </div>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- BADGE ---------------- */}
      <Kus id="badge" meno="badge" subor="badge.tsx" veta="Štítok: 8 farebných variantov, všetky s tvrdým tieňom a posunom pri hoveri. Na stav projektu, štítky, „text doplní Adam“, „ukážkové dáta“.">
        <Mriezka>
          <Variant props='variant: default · secondary · accent · destructive · success · warning · info · outline' className="sm:col-span-2">
            <div className="flex flex-wrap gap-4">
              {(['default', 'secondary', 'accent', 'destructive', 'success', 'warning', 'info', 'outline'] as const).map((v) => (
                <Badge key={v} variant={v} className={v === 'accent' ? 'text-ink' : ''}>
                  {v}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-sm">secondary = success = warning (všetko žltá), info = biela. accent = hot, text opravený na ink.</p>
          </Variant>
          <Variant props="stavy projektov (Chorobopisy) · shadow-none bez hoveru">
            <div className="flex flex-wrap gap-3">
              <Badge className={`shadow-none ${noHover}`}>Živé</Badge>
              <Badge variant="outline" className={`shadow-none ${noHover}`}>
                Beží interne
              </Badge>
              <Badge variant="destructive" className={`shadow-none ${noHover}`}>
                Čoskoro
              </Badge>
              <Badge variant="warning" className={`shadow-none ${noHover}`}>
                text doplní Adam
              </Badge>
            </div>
          </Variant>
          <Variant props="štítky dôkazov (stitky) · rounded-full · font-mono">
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(DOKAZY.flatMap((d) => d.stitky))).map((s) => (
                <Badge key={s} variant="outline" className={`rounded-full font-mono shadow-none ${noHover}`}>
                  {s}
                </Badge>
              ))}
            </div>
          </Variant>
          <Variant props="badgeVariants() na odkaze <a> (interaktívny štítok, 44 px)">
            <a href="#timeline" className={badgeVariants({ variant: 'secondary', className: 'min-h-11 px-4 text-sm' })}>
              Skočiť na časovú os →
            </a>
          </Variant>
          <Variant props="veľkosť cez className (text-base px-4 py-2)">
            <Badge variant="default" className="px-4 py-2 font-display text-2xl">
              {KORPUS.slova}
            </Badge>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- KBD ---------------- */}
      <Kus id="kbd" meno="kbd" subor="kbd.tsx" veta="Klávesy: 3 varianty × 3 veľkosti a kombinácia s oddeľovačom. Na nápovedu k ⌘K, hrám a klávesovému ovládaniu.">
        <Mriezka>
          <Variant props="variant default · outline · ghost × size sm · md · lg" className="sm:col-span-2">
            <div className="grid grid-cols-3 gap-4">
              {(['default', 'outline', 'ghost'] as const).map((v) =>
                (['sm', 'md', 'lg'] as const).map((s) => (
                  <div key={v + s} className="flex flex-col items-start gap-1">
                    <Kbd variant={v} size={s}>
                      K
                    </Kbd>
                    <span className="font-mono text-[10px]">
                      {v}/{s}
                    </span>
                  </div>
                )),
              )}
            </div>
          </Variant>
          <Variant props="KbdCombo keys={[…]} · separator (predvolené „+“, vlastné „then“)">
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex flex-wrap items-center gap-3">
                <KbdCombo keys={['⌘', 'K']} /> paleta príkazov na webe
              </li>
              <li className="flex flex-wrap items-center gap-3">
                <KbdCombo keys={['Ctrl', 'B']} size="lg" /> bočný panel
              </li>
              <li className="flex flex-wrap items-center gap-3">
                <KbdCombo keys={['G', 'T']} separator="potom" variant="outline" /> na texty
              </li>
              <li className="flex flex-wrap items-center gap-3">
                <Kbd>←</Kbd>
                <Kbd>→</Kbd> karusel, strom, záložky
              </li>
            </ul>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- ALERT ---------------- */}
      <Kus id="alert" meno="alert" subor="alert.tsx" veta="Hlásenie s nadpisom, textom, ikonou a akciou (s načítavaním). Na stav rezervácie, poznámku „pred vydaním“, varovanie pri dátach.">
        <Mriezka className="lg:grid-cols-2">
          <Variant props='variant="default" · ikona <svg> (automaticky odsadí text)'>
            <Alert>
              <Stethoscope className="h-5 w-5" />
              <AlertTitle>{VLAJKA.nazov} · {VLAJKA.trvanie}</AlertTitle>
              <AlertDescription>{VLAJKA.cena}. {VLAJKA.titulok}</AlertDescription>
            </Alert>
          </Variant>
          <Variant props='variant="destructive" · AlertAction'>
            <Alert variant="destructive">
              <CalendarX className="h-5 w-5" />
              <AlertTitle>Termín je obsadený</AlertTitle>
              <AlertDescription>Vyber si iný čas v kalendári.</AlertDescription>
              <AlertAction className="min-h-11">Vybrať iný termín</AlertAction>
            </Alert>
          </Variant>
          <Variant props='variant="warning" (= žltá) · AlertAction loading'>
            <Alert variant="warning">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Pred vydaním</AlertTitle>
              <AlertDescription>{PRIPAD_MAKLER.stav}</AlertDescription>
              <AlertAction className="min-h-11" loading={nacitava} onClick={() => setNacitava((n) => !n)}>
                {nacitava ? 'Načítavam kontroly' : 'Skontrolovať znova'}
              </AlertAction>
            </Alert>
          </Variant>
          <Variant props='variant="success" (= žltá, rovnaké ako warning) · AlertAction disabled'>
            <Alert variant="success">
              <Check className="h-5 w-5" />
              <AlertTitle>Zapísané</AlertTitle>
              <AlertDescription>Termín je v kalendári. Potvrdenie príde e-mailom.</AlertDescription>
              <AlertAction className="min-h-11" disabled>
                Zrušiť (disabled)
              </AlertAction>
            </Alert>
          </Variant>
          <Variant props='variant="info" (= biela) · bez ikony'>
            <Alert variant="info">
              <AlertTitle>Snímka pulzu</AlertTitle>
              <AlertDescription>Vitálne funkcie sú zo snímky {ZIVE_CISLA_SNIMKA}.</AlertDescription>
            </Alert>
          </Variant>
          <Variant props='className: bg-ink text-paper · ikona Info'>
            <Alert className="bg-ink text-paper [&>svg]:text-yellow">
              <Info className="h-5 w-5" />
              <AlertTitle>Demo</AlertTitle>
              <AlertDescription>{PRIPAD_TERAPEUTKA.stav}</AlertDescription>
            </Alert>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- EMPTY-STATE ---------------- */}
      <Kus id="empty-state" meno="empty-state" subor="empty-state.tsx" veta="Prázdny stav zo skladačky alebo zo 14 predvolieb: 3 varianty, 4 veľkosti, zvislo alebo vodorovne, ikona v 8 farbách. Na „čoskoro“, prázdnu čakáreň, chybu.">
        <Mriezka>
          <Variant props='skladačka · variant="card" · size="md" · layout="vertical"'>
            <EmptyState variant="card">
              <EmptyStateIcon iconColor="secondary">
                <Clock />
              </EmptyStateIcon>
              <EmptyStateTitle>{DOKAZY.find((d) => d.id === 'senior-atlas')!.nazov}</EmptyStateTitle>
              <EmptyStateDescription>Čoskoro. Doména {DOKAZY.find((d) => d.id === 'senior-atlas')!.poznamka} zatiaľ neodpovedá.</EmptyStateDescription>
              <EmptyStateActions>
                <Button variant="outline">Dať vedieť</Button>
              </EmptyStateActions>
            </EmptyState>
          </Variant>
          <Variant props='variant="filled" (prerušovaný rám) · layout="horizontal" · size="sm"'>
            <EmptyState variant="filled" layout="horizontal" size="sm">
              <EmptyStateIcon size="sm">
                <Inbox />
              </EmptyStateIcon>
              <div className="flex flex-col">
                <EmptyStateTitle>Čakáreň je prázdna</EmptyStateTitle>
                <EmptyStateDescription>Ďalší pacient: ty.</EmptyStateDescription>
              </div>
            </EmptyState>
          </Variant>
          <Variant props='variant="default" · EmptyStateIllustration (vlastné SVG) · size="lg"'>
            <EmptyState size="lg">
              <EmptyStateIllustration maxWidth={120}>
                <img src="/brand/x.svg" alt="" className="w-full" />
              </EmptyStateIllustration>
              <EmptyStateTitle>Žiadny chorobopis</EmptyStateTitle>
              <EmptyStateDescription>Tu bude tvoj, keď prídeš na vyšetrenie.</EmptyStateDescription>
            </EmptyState>
          </Variant>
          <Variant props="EmptyStateIcon iconColor × 8 · size xs … xl" className="sm:col-span-2 lg:col-span-3">
            <div className="flex flex-wrap items-end gap-4">
              {(['default', 'primary', 'secondary', 'accent', 'muted', 'destructive', 'warning', 'success'] as const).map((c) => (
                <div key={c} className="flex flex-col items-center gap-1">
                  <EmptyStateIcon iconColor={c} size="sm" className={c === 'accent' ? 'text-ink' : ''}>
                    <Stethoscope />
                  </EmptyStateIcon>
                  <span className="font-mono text-[10px]">{c}</span>
                </div>
              ))}
              {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <EmptyStateIcon size={s}>
                    <Clock />
                  </EmptyStateIcon>
                  <span className="font-mono text-[10px]">{s}</span>
                </div>
              ))}
            </div>
          </Variant>
          <Variant props="EmptyStatePreset × 14 · customTitle (predvolené texty sú po anglicky) · iconColor z predvoľby" className="sm:col-span-2 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {PRESETY.map(([p, t]) => (
                <div key={p} className="flex flex-col items-center gap-1">
                  <EmptyStatePreset preset={p} customTitle={t} size="compact" iconSize="xs" className="w-full border-3 border-ink bg-white [&_h3]:text-xs [&_p]:hidden" />
                  <span className="font-mono text-[10px]">{p}</span>
                </div>
              ))}
            </div>
          </Variant>
          <Variant props='preset="coming-soon" · customTitle · customDescription · animation="fadeIn" · action' className="sm:col-span-2 lg:col-span-1">
            <EmptyStatePreset
              preset="coming-soon"
              variant="card"
              animation="fadeIn"
              iconColor="secondary"
              customTitle={DOKAZY.find((d) => d.id === 'gramata')!.nazov}
              customDescription={`${DOKAZY.find((d) => d.id === 'gramata')!.riadok} Čoskoro.`}
              action={<Button variant="secondary">Sledovať</Button>}
            />
          </Variant>
        </Mriezka>
      </Kus>
    </div>
  );
}
