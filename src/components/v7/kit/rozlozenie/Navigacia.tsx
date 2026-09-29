/** Kit · Rozloženie 3/4 — navigácia: sidebar, navigation-menu, menubar, breadcrumb, pagination. */
import * as React from 'react';
import { Activity, ClipboardList, FileText, HeartPulse, Home, Stethoscope, Users, Slash, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarToggle,
  useSidebar,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { PRODUKTY, VLAJKA } from '@/data/ponuka';
import { CESTA } from '@/data/cesta';
import { Kus, Mriezka, Variant } from './Kus';
import { BIO, SEKCIE } from './data';

const noHover = 'shadow-none hover:translate-x-0 hover:translate-y-0';
/** Aktívna položka / výber je v BoldKite bg-accent (= hot). Hot iba CTA → žltá. */
const AKTIVNA = 'bg-yellow';

function SidebarStav() {
  const { state, isMobile } = useSidebar();
  return (
    <p className="font-mono text-xs">
      state = {state} · isMobile = {String(isMobile)}
    </p>
  );
}

function SidebarUkazka() {
  const [collapsible, setCollapsible] = React.useState<'icon' | 'none' | 'hidden'>('icon');
  const [side, setSide] = React.useState<'left' | 'right'>('left');
  const [akt, setAkt] = React.useState('anamneza');
  const polozky = [
    { id: 'uvod', label: 'Príjem', icon: <Home className="h-5 w-5" /> },
    { id: 'anamneza', label: 'Anamnéza', icon: <ClipboardList className="h-5 w-5" /> },
    { id: 'nastroje', label: 'Nástroje', icon: <Stethoscope className="h-5 w-5" /> },
    { id: 'liecba', label: 'Liečba', icon: <HeartPulse className="h-5 w-5" /> },
    { id: 'chorobopisy', label: 'Chorobopisy', icon: <Users className="h-5 w-5" /> },
    { id: 'texty', label: 'Texty', icon: <FileText className="h-5 w-5" /> },
  ];
  const vybrana = polozky.find((p) => p.id === akt)!;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-mono text-xs font-bold">collapsible</span>
        <ToggleGroup type="single" value={collapsible} onValueChange={(v) => v && setCollapsible(v as typeof collapsible)}>
          {(['icon', 'none', 'hidden'] as const).map((c) => (
            <ToggleGroupItem key={c} value={c} className="min-h-11 font-mono">
              {c}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="font-mono text-xs font-bold">side</span>
        <ToggleGroup type="single" value={side} onValueChange={(v) => v && setSide(v as typeof side)}>
          {(['left', 'right'] as const).map((c) => (
            <ToggleGroupItem key={c} value={c} className="min-h-11 font-mono">
              {c}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <TooltipProvider delayDuration={100}>
        <SidebarProvider className={`h-[440px] min-h-0 overflow-hidden border-3 border-ink ${side === 'right' ? 'flex-row-reverse' : ''}`}>
          <Sidebar collapsible={collapsible} side={side} className="bg-paper">
            <SidebarHeader className="min-h-16 gap-3">
              <img src="/brand/x.svg" alt="" className="h-7 w-7 shrink-0" />
              <span className="font-display text-xl font-extrabold group-data-[state=collapsed]/sidebar:hidden">XVADUR</span>
            </SidebarHeader>
            <SidebarContent className="flex flex-col gap-4 overflow-x-hidden">
              <SidebarGroup>
                <SidebarGroupLabel>Domov V5.4</SidebarGroupLabel>
                {polozky.map((p) => (
                  <SidebarItem
                    key={p.id}
                    icon={p.icon}
                    tooltip={p.label}
                    variant={p.id === akt ? 'active' : 'default'}
                    className={`min-h-11 font-bold uppercase ${p.id === akt ? AKTIVNA : ''}`}
                    aria-current={p.id === akt ? 'page' : undefined}
                    onClick={() => setAkt(p.id)}
                  >
                    {p.label}
                  </SidebarItem>
                ))}
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Stav</SidebarGroupLabel>
                <SidebarItem icon={<Activity className="h-5 w-5" />} tooltip="Vitálne funkcie" className="min-h-11" disabled>
                  Vitálne (disabled)
                </SidebarItem>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="font-mono text-xs">
              <span className="group-data-[state=collapsed]/sidebar:hidden">{VLAJKA.nazov} · {VLAJKA.trvanie}</span>
              <span className="hidden group-data-[state=collapsed]/sidebar:inline">✚</span>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex flex-col gap-4 bg-white p-5">
            <div className="flex items-center gap-3">
              <SidebarToggle className="h-11 w-11" aria-label="Prepnúť bočný panel" />
              <SidebarStav />
            </div>
            <p className="font-display text-4xl font-extrabold uppercase">{vybrana.label}</p>
            <p className="max-w-md text-sm">
              Na šírke pod 768 px sa Sidebar vykreslí ako Sheet (vysúvací panel) a otvorí ho tlačidlo vľavo. Nad 768 px sa zbalí na ikony (icon), zmizne
              (hidden) alebo ostane (none). Ctrl/⌘ + B prepína panel globálne.
            </p>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}

export default function Navigacia() {
  const [tonovanie, setTon] = React.useState('vysetrenie');
  const [vitalne, setVitalne] = React.useState(true);
  const [ekg, setEkg] = React.useState(false);
  const [strana, setStrana] = React.useState(0);
  const klik = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    fn();
  };

  return (
    <div>
      {/* ---------------- SIDEBAR ---------------- */}
      <Kus id="sidebar" meno="sidebar" subor="sidebar.tsx" veta="Bočný panel s poskytovateľom stavu: zbalenie na ikony, skrytie, strana, tooltipy, mobilný Sheet a skratka Ctrl/⌘ + B. Na katalóg, texty, register chorobopisov.">
        <Variant props="SidebarProvider + Sidebar (collapsible, side) + Header/Content/Group/GroupLabel/Item (variant active, icon, tooltip)/Separator/Footer + Toggle + Inset">
          <SidebarUkazka />
        </Variant>
      </Kus>

      {/* ---------------- NAVIGATION-MENU ---------------- */}
      <Kus id="navigation-menu" meno="navigation-menu" subor="navigation-menu.tsx" veta="Hlavné menu s rozbaľovacími panelmi (Radix), otvára sa na hover aj klik, šípky z klávesnice. Na hlavičku webu a ekosystému.">
        <Mriezka className="lg:grid-cols-1">
          <Variant props='defaultValue="liecba" (otvorené pri načítaní) · Trigger + Content (panel priamo pod položkou) · Link s navigationMenuTriggerStyle() · Indicator · Liečba: open žltý (className), Anamnéza: pôvodný hot'>
            <div className="min-h-[27rem] sm:min-h-72">
              <NavigationMenu defaultValue="liecba" className="max-w-full justify-start">
                <NavigationMenuList className="flex-wrap justify-start gap-3">
                  <NavigationMenuItem value="liecba">
                    <NavigationMenuTrigger className="h-11 focus:bg-yellow focus:text-ink data-[state=open]:bg-yellow data-[state=open]:text-ink">Liečba</NavigationMenuTrigger>
                    <NavigationMenuContent className="w-[min(88vw,30rem)]">
                      <ul className="grid gap-0 sm:grid-cols-2">
                        {PRODUKTY.slice(0, 4).map((p) => (
                          <li key={p.id} className="border-b-3 border-ink last:border-b-0 sm:[&:nth-child(odd)]:border-r-3">
                            <NavigationMenuLink href={`#${p.id}`} onClick={(e) => e.preventDefault()} className="flex min-h-11 flex-col gap-1 p-3 hover:bg-yellow focus:bg-yellow">
                              <span className="font-bold uppercase">{p.nazov}</span>
                              <span className="text-xs">{p.nalepka}</span>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-11">Anamnéza</NavigationMenuTrigger>
                    <NavigationMenuContent className="w-[min(88vw,22rem)] p-3">
                      <ol className="flex flex-col gap-1">
                        {BIO.map((b, i) => (
                          <li key={b.id} className="flex items-baseline gap-2 text-sm">
                            <span className="font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                            <span className="font-bold uppercase">{b.nazov}</span>
                            <span className="ml-auto font-mono text-xs">{b.kedy}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-2 font-mono text-[11px]">tento trigger má pôvodný open stav bg-accent (hot, text paper)</p>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#chorobopisy" onClick={(e) => e.preventDefault()} className={navigationMenuTriggerStyle() + ' h-11'}>
                      Chorobopisy
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-11" disabled>
                      Hry (disabled)
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuIndicator />
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </Variant>
          <Variant props='orientation="vertical" · delayDuration={0}'>
            <div className="min-h-64">
              <NavigationMenu orientation="vertical" delayDuration={0} className="max-w-full items-start justify-start">
                <NavigationMenuList className="flex-col items-start">
                  {SEKCIE.slice(0, 4).map((s) => (
                    <NavigationMenuItem key={s.id}>
                      <NavigationMenuLink href={`#${s.id}`} onClick={(e) => e.preventDefault()} className={navigationMenuTriggerStyle() + ' h-11 w-44 justify-start'}>
                        {s.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- MENUBAR ---------------- */}
      <Kus id="menubar" meno="menubar" subor="menubar.tsx" veta="Lišta ako v desktopovej aplikácii: položky so skratkami, zaškrtávanie, prepínač, podmenu, vypnuté položky. Na nástroje, hry, „operačný systém“ Netopiera.">
        <Variant props="MenubarMenu/Trigger/Content · Item (inset, disabled, shortcut) · Label · Separator · Group · CheckboxItem · RadioGroup/RadioItem · Sub/SubTrigger/SubContent">
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto pb-3">
              <Menubar className="h-auto w-max">
                <MenubarMenu>
                  <MenubarTrigger className="min-h-11">Chorobopis</MenubarTrigger>
                  <MenubarContent>
                    <MenubarLabel>Pacient</MenubarLabel>
                    <MenubarGroup>
                      <MenubarItem className="min-h-11 focus:bg-yellow focus:text-ink">
                        Nový záznam <MenubarShortcut>⌘N</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem className="min-h-11 focus:bg-yellow focus:text-ink">
                        Otvoriť <MenubarShortcut>⌘O</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem className="min-h-11" disabled>
                        Zdieľať (disabled)
                      </MenubarItem>
                    </MenubarGroup>
                    <MenubarSeparator />
                    <MenubarSub>
                      <MenubarSubTrigger className="min-h-11 focus:bg-yellow data-[state=open]:bg-yellow">Exportovať</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem className="min-h-11 focus:bg-yellow focus:text-ink">PDF</MenubarItem>
                        <MenubarItem className="min-h-11 focus:bg-yellow focus:text-ink">Markdown</MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarItem inset className="min-h-11">
                      inset položka
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className="min-h-11 data-[state=open]:bg-yellow data-[state=open]:text-ink">Zobraziť</MenubarTrigger>
                  <MenubarContent>
                    <MenubarCheckboxItem className="min-h-11" checked={vitalne} onCheckedChange={setVitalne}>
                      Vitálne funkcie
                    </MenubarCheckboxItem>
                    <MenubarCheckboxItem className="min-h-11" checked={ekg} onCheckedChange={setEkg}>
                      EKG čiara
                    </MenubarCheckboxItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger className="min-h-11">Liečba</MenubarTrigger>
                  <MenubarContent>
                    <MenubarRadioGroup value={tonovanie} onValueChange={setTon}>
                      <MenubarRadioItem className="min-h-11" value="vysetrenie">
                        {VLAJKA.nazov}
                      </MenubarRadioItem>
                      {PRODUKTY.slice(0, 3).map((p) => (
                        <MenubarRadioItem key={p.id} className="min-h-11" value={p.id}>
                          {p.nazov}
                        </MenubarRadioItem>
                      ))}
                    </MenubarRadioGroup>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>
            <p className="font-mono text-xs">
              vitálne = {String(vitalne)} · ekg = {String(ekg)} · liečba = {tonovanie}
            </p>
            <p className="text-sm">Prvé menu má pôvodný focus bg-accent prepísaný na žltú, „Liečba“ ostáva v pôvodnej farbe na porovnanie.</p>
          </div>
        </Variant>
      </Kus>

      {/* ---------------- BREADCRUMB ---------------- */}
      <Kus id="breadcrumb" meno="breadcrumb" subor="breadcrumb.tsx" veta="Omrvinky: kde som a odkiaľ som prišiel. Vlastný oddeľovač, výpustka, odkaz cez asChild. Na texty, chorobopisy aj ako mini-príbeh.">
        <Mriezka className="lg:grid-cols-2">
          <Variant props="predvolený oddeľovač (ChevronRight) · BreadcrumbPage (aria-current)">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="inline-flex min-h-11 items-center">Domov</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/kit/" className="inline-flex min-h-11 items-center">Kit</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Rozloženie</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Variant>
          <Variant props="vlastný oddeľovač <Slash /> · BreadcrumbEllipsis">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="inline-flex min-h-11 items-center">Domov</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <Slash className="-rotate-12" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <Slash className="-rotate-12" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>Chorobopisy</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Variant>
          <Variant props='asChild (<a> vlastný) · oddeľovač „✚“ · veľké písmo · cesta ako mini-príbeh' className="lg:col-span-2">
            <Breadcrumb>
              <BreadcrumbList className="gap-2 font-display text-xl font-extrabold text-ink uppercase sm:gap-3 sm:text-3xl">
                {BIO.map((b, i) => (
                  <React.Fragment key={b.id}>
                    {i > 0 && <BreadcrumbSeparator className="font-mono text-base text-stamp">✚</BreadcrumbSeparator>}
                    <BreadcrumbItem>
                      {i === BIO.length - 1 ? (
                        <BreadcrumbPage className="bg-yellow px-1">{b.nazov}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <a href={`#bio-${b.id}`} className="font-display font-extrabold! text-ink/60 hover:text-ink">
                            {b.nazov}
                          </a>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </Variant>
        </Mriezka>
      </Kus>

      {/* ---------------- PAGINATION ---------------- */}
      <Kus id="pagination" meno="pagination" subor="pagination.tsx" veta="Stránkovanie z tlačidiel BoldKitu: aktívna strana, výpustka, predchádzajúca a ďalšia. Na texty, zoznam chorobopisov, listovanie príbehom.">
        <Mriezka className="lg:grid-cols-2">
          <Variant props="PaginationPrevious/Next (text natvrdo „Previous/Next“) · isActive · Ellipsis">
            <div className="overflow-x-auto pb-2">
              <Pagination className="justify-start">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={klik(() => undefined)} />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" onClick={klik(() => undefined)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive onClick={klik(() => undefined)}>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" onClick={klik(() => undefined)} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </Variant>
          <Variant props='PaginationLink size: "sm" | "default" | "lg" | "icon"'>
            <div className="flex flex-wrap items-center gap-3">
              {(['sm', 'default', 'lg', 'icon'] as const).map((s, i) => (
                <PaginationLink key={s} href="#" size={s} isActive={i === 1} onClick={klik(() => undefined)} className={s === 'sm' ? 'min-h-11' : ''}>
                  {s === 'icon' ? '4' : s}
                </PaginationLink>
              ))}
            </div>
          </Variant>
          <Variant props="slovenská náhrada: PaginationLink size=default + vlastné šípky · stav listuje cestou" className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              <div className="border-3 border-ink bg-white p-4">
                <p className="font-mono text-xs">
                  Záznam {String(strana + 1).padStart(2, '0')} / {String(CESTA.length).padStart(2, '0')} · {CESTA[strana].kedy}
                </p>
                <p className="font-display text-3xl font-extrabold uppercase">{CESTA[strana].nazov}</p>
                <p className="text-sm">{CESTA[strana].text}</p>
              </div>
              <Pagination className="justify-start">
                <PaginationContent className="flex-wrap">
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      size="default"
                      aria-label="Predchádzajúci záznam"
                      aria-disabled={strana === 0}
                      className={`gap-1 pl-2.5 ${strana === 0 ? 'pointer-events-none opacity-50' : ''}`}
                      onClick={klik(() => setStrana((s) => Math.max(0, s - 1)))}
                    >
                      <ChevronLeft className="h-4 w-4 stroke-[3]" /> Späť
                    </PaginationLink>
                  </PaginationItem>
                  {CESTA.map((k, i) => (
                    <PaginationItem key={k.nazov}>
                      <PaginationLink href="#" isActive={i === strana} aria-label={`Záznam ${i + 1}: ${k.nazov}`} onClick={klik(() => setStrana(i))}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      size="default"
                      aria-label="Ďalší záznam"
                      aria-disabled={strana === CESTA.length - 1}
                      className={`gap-1 pr-2.5 ${strana === CESTA.length - 1 ? 'pointer-events-none opacity-50' : ''}`}
                      onClick={klik(() => setStrana((s) => Math.min(CESTA.length - 1, s + 1)))}
                    >
                      Ďalej <ChevronRight className="h-4 w-4 stroke-[3]" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <Badge variant="outline" className={`w-fit ${noHover}`}>
                aria-disabled rieši ukážka, komponent ho nemá
              </Badge>
            </div>
          </Variant>
        </Mriezka>
      </Kus>
    </div>
  );
}
