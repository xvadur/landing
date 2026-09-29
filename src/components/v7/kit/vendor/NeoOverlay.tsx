/** Katalóg vendor · neobrutalism.dev (3/3): Dialog, Sheet, Command (+ CommandDialog). */
import { useState } from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { Button } from '@/components/vendor/neobrutalism/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/vendor/neobrutalism/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type SheetSide,
} from '@/components/vendor/neobrutalism/sheet';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/vendor/neobrutalism/command';
import { PRECO_NIE_CHATGPT, VLAJKA } from '@/data/ponuka';
import { CESTA } from '@/data/cesta';
import { DALSIE, NAV } from '@/data/nav';
import { Kus, Mriezka, Realne, Varianta, Zakazane } from './shared';

export default function NeoOverlay() {
  const [cmdOpen, setCmdOpen] = useState(false);
  return (
    <>
      {/* ---------------- Dialog ---------------- */}
      <Kus
        id="nb-dialog"
        nazov="Dialog"
        subor="vendor/neobrutalism/dialog.tsx"
        veta="Modálne okno (Radix): na mobile od spodu, na desktope v strede; otvorí sa pádom karty (card-drop), zatvorí 120 ms fade."
      >
        <Mriezka cols={3}>
          {(['white', 'paper', 'yellow'] as const).map((t) => (
            <Varianta key={t} props={`DialogContent tone="${t}"`}>
              <Dialog>
                <DialogTrigger asChild>
                  <Button tone="white" size="sm">
                    Otvoriť {t}
                  </Button>
                </DialogTrigger>
                <DialogContent tone={t}>
                  <DialogHeader>
                    <DialogTitle>Tón {t}</DialogTitle>
                    <DialogDescription>Plocha dialógu z tokenu.</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </Varianta>
          ))}
          {(['sm', 'default', 'lg'] as const).map((s) => (
            <Varianta key={s} props={`size="${s}" (${s === 'sm' ? 480 : s === 'lg' ? 760 : 640} px)`}>
              <Dialog>
                <DialogTrigger asChild>
                  <Button tone="white" size="sm">
                    Šírka {s}
                  </Button>
                </DialogTrigger>
                <DialogContent size={s}>
                  <DialogHeader>
                    <DialogTitle>Šírka {s}</DialogTitle>
                    <DialogDescription>Na mobile vždy celá šírka mínus 8 px.</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </Varianta>
          ))}
          <Varianta props="showCloseButton={false} · DialogFooter · DialogClose">
            <Dialog>
              <DialogTrigger asChild>
                <Button tone="white" size="sm">
                  Bez krížika
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false} size="sm">
                <DialogHeader>
                  <DialogTitle>Naozaj?</DialogTitle>
                  <DialogDescription>Zavrieť sa dá len tlačidlom alebo Esc.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button tone="white">Späť</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button tone="hot">Áno</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Varianta>
        </Mriezka>
        <Zakazane tony={['pink', 'lilac', 'lime', 'sky']} />
        <Realne zdroj="ponuka.ts (PRECO_NIE_CHATGPT, VLAJKA)">
          <Dialog>
            <DialogTrigger asChild>
              <Button tone="yellow" size="lg">
                Prečo nie iba ChatGPT?
              </Button>
            </DialogTrigger>
            <DialogContent size="lg">
              <DialogHeader>
                <DialogTitle>Chat odpovie. Agent koná.</DialogTitle>
                <DialogDescription>Rozdiel, ktorý vysvetlím na vyšetrení.</DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border-3 border-ink">
                <div className="grid grid-cols-2 border-b-3 border-ink font-display font-extrabold uppercase">
                  <span className="bg-white px-3 py-2">Chat</span>
                  <span className="border-l-3 border-ink bg-yellow px-3 py-2">Agent</span>
                </div>
                {PRECO_NIE_CHATGPT.map((r, i) => (
                  <div key={i} className="grid grid-cols-2 border-t-3 border-ink text-sm first-of-type:border-t-0 sm:text-base">
                    <span className="bg-white px-3 py-2 text-ink/70 line-through decoration-stamp decoration-2">{r.chat}</span>
                    <span className="border-l-3 border-ink px-3 py-2">{r.agent}</span>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button tone="hot">
                    {VLAJKA.nazov} · {VLAJKA.trvanie} <ArrowRightIcon weight="bold" />
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Realne>
      </Kus>

      {/* ---------------- Sheet ---------------- */}
      <Kus
        id="nb-sheet"
        nazov="Sheet"
        subor="vendor/neobrutalism/sheet.tsx"
        veta="Panel, ktorý vyjde z hrany obrazovky (Radix Dialog): side top / right / bottom / left, papierová plocha, rám na hrane."
      >
        <Mriezka cols={4}>
          {(['top', 'right', 'bottom', 'left'] as SheetSide[]).map((side) => (
            <Varianta key={side} props={`side="${side}"`}>
              <Sheet>
                <SheetTrigger asChild>
                  <Button tone="white" size="sm">
                    {side}
                  </Button>
                </SheetTrigger>
                <SheetContent side={side}>
                  <SheetHeader>
                    <SheetTitle>Panel {side}</SheetTitle>
                    <SheetDescription>Vysúva sa z hrany {side}, zatvára 120 ms fade.</SheetDescription>
                  </SheetHeader>
                  <div className="p-4">Obsah panelu.</div>
                </SheetContent>
              </Sheet>
            </Varianta>
          ))}
        </Mriezka>
        <Realne zdroj="cesta.ts (CESTA) · showCloseButton={false} + SheetFooter">
          <Sheet>
            <SheetTrigger asChild>
              <Button tone="yellow">Anamnéza v paneli</Button>
            </SheetTrigger>
            <SheetContent side="right" showCloseButton={false}>
              <SheetHeader>
                <SheetTitle>Anamnéza</SheetTitle>
                <SheetDescription>Nemocnica → vyhodili → AI → agenti → XVADUR.</SheetDescription>
              </SheetHeader>
              <ol className="grid gap-4 px-4">
                {CESTA.map((k) => (
                  <li key={k.nazov} className="rounded-lg border-3 border-ink bg-white p-3 shadow-brutal-sm">
                    <p className="eyebrow">{k.kedy}</p>
                    <p className="font-display text-lg font-extrabold uppercase">{k.nazov}</p>
                    <p className="text-sm">{k.text}</p>
                  </li>
                ))}
              </ol>
              <SheetFooter>
                <SheetClose asChild>
                  <Button tone="white">Zavrieť</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </Realne>
      </Kus>

      {/* ---------------- Command ---------------- */}
      <Kus
        id="nb-command"
        nazov="Command · CommandDialog"
        subor="vendor/neobrutalism/command.tsx"
        veta="Príkazová paleta (cmdk): hľadanie, skupiny, delič, skratky, prázdny stav; inline alebo v dialógu (⌘K)."
      >
        <Mriezka cols={2}>
          <Varianta props='Command inline · CommandInput eyebrow="Kam?" · CommandEmpty · disabled item'>
            <Command className="h-auto">
              <CommandInput placeholder="Napíš: liečba, texty…" />
              <CommandList>
                <CommandEmpty>Nič také tu nie je.</CommandEmpty>
                <CommandGroup heading="Domov">
                  {NAV.map((n) => (
                    <CommandItem key={n.href} value={n.label}>
                      {n.label}
                      <CommandShortcut>{n.href}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Ďalšie">
                  {DALSIE.map((n) => (
                    <CommandItem key={n.href} value={n.label} disabled={n.label === 'KVÍZ'}>
                      {n.label}
                      <CommandShortcut>{n.label === 'KVÍZ' ? 'disabled' : n.href}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </Varianta>
          <Varianta props='CommandDialog title description · CommandInput eyebrow="Pacient?"'>
            <Button tone="white" onClick={() => setCmdOpen(true)}>
              Otvoriť paletu
            </Button>
            <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen} title="Kartotéka" description="Vyber sekciu domova.">
              <CommandInput eyebrow="Pacient?" placeholder="Hľadaj v chorobopise" />
              <CommandList>
                <CommandEmpty>Bez nálezu.</CommandEmpty>
                <CommandGroup heading="Cesta">
                  {CESTA.map((k) => (
                    <CommandItem key={k.nazov} value={k.nazov} onSelect={() => setCmdOpen(false)}>
                      {k.nazov}
                      <CommandShortcut>{k.kedy}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </Varianta>
        </Mriezka>
      </Kus>
    </>
  );
}
