/** Kit · Prekrytia: dialog.tsx a alert-dialog.tsx vo všetkých podobách (základ, formulár, dlhý obsah, široký, bez krížika,
 *  kontrolovaný, nemodálny; alert deštruktívny, potvrdenie, async s čakaním). Prvý ostrov stránky (client:load),
 *  preto nesie aj KitToaster. Obsah: VLAJKA (ponuka.ts), CESTA (cesta.ts), Hriech (fakty.ts). */
import * as React from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VLAJKA } from '@/data/ponuka';
import { CESTA } from '@/data/cesta';
import { DOKAZY } from '@/data/fakty';
import KitToaster from './KitToaster';
import { Blok, KIT_TOASTER, Kus, Stav } from './spolocne';

/** Dialog BoldKitu má na mobile w-full (od okraja po okraj) → vraciame 16 px okraje. */
const MOBIL = 'w-[calc(100%-2rem)] max-h-[88dvh] overflow-y-auto';
const hriech = DOKAZY.find((d) => d.id === 'hriech')!;

export default function Dialogy() {
  const [kontrola, setKontrola] = React.useState(false);
  const [pocet, setPocet] = React.useState(0);
  const [nemodal, setNemodal] = React.useState(false);
  const [caka, setCaka] = React.useState(false);
  const [asyncOpen, setAsyncOpen] = React.useState(false);

  return (
    <>
      <KitToaster />
      <Kus
        id="dialog"
        meno="dialog"
        subor="src/components/ui/dialog.tsx"
        veta="Modálne okno nad stránkou: zamkne scroll a fokus, zavrie sa Esc, klikom mimo alebo krížikom. Na vyšetrenie, zápis, náhľad hry."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Blok nazov="Základ · Header, Title, Description, Footer, Close" pozn="Zatvorené = spúšťač. Otvorené = obsah v portáli nad overlayom bg-black/70.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-open="dialog">Vyšetrenie · detail</Button>
                </DialogTrigger>
                <DialogContent className={MOBIL}>
                  <DialogHeader>
                    <p className="eyebrow">✚ {VLAJKA.trvanie} · {VLAJKA.cena}</p>
                    <DialogTitle className="font-display text-2xl font-extrabold">{VLAJKA.nazov}</DialogTitle>
                    <DialogDescription className="text-base text-ink/75">{VLAJKA.titulok}</DialogDescription>
                  </DialogHeader>
                  <ol className="grid gap-2">
                    {VLAJKA.body.map((b, i) => (
                      <li key={b} className="flex gap-3 rounded-lg border-3 border-ink bg-white p-3 text-sm">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-yellow font-mono text-xs font-bold">
                          {i + 1}
                        </span>
                        {b}
                      </li>
                    ))}
                  </ol>
                  <DialogFooter className="gap-3">
                    <DialogClose asChild>
                      <Button variant="outline">Zatvoriť</Button>
                    </DialogClose>
                    <Button asChild variant="accent" className="text-ink">
                      <a href="/konzultacia/#termin">Vybrať termín</a>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Blok>

          <Blok nazov="S formulárom · Input + Label" pozn="Fokus skočí do prvého poľa. Tu sa nič neodosiela.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" data-open="dialog-form">
                    Zápis do čakárne
                  </Button>
                </DialogTrigger>
                <DialogContent className={MOBIL}>
                  <DialogHeader>
                    <DialogTitle>Čakáreň · Postav si prvého agenta</DialogTitle>
                    <DialogDescription>Kohorta so štartom v januári. Daj e-mail a ozvem sa ako prvému.</DialogDescription>
                  </DialogHeader>
                  <form
                    className="grid gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      toast('Ukážka katalógu', { description: 'Nič sa neodoslalo.', toasterId: KIT_TOASTER });
                    }}
                  >
                    <Label htmlFor="kit-email">E-mail</Label>
                    <Input id="kit-email" type="email" placeholder="ty@firma.sk" autoComplete="email" />
                    <DialogFooter className="mt-2 gap-3">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Neskôr
                        </Button>
                      </DialogClose>
                      <Button type="submit">Zapísať</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </Blok>

          <Blok nazov="Dlhý obsah · scroll vo vnútri" pozn="Anamnéza v piatich krokoch. max-h + overflow-y-auto cez className, BoldKit to sám nerieši.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" data-open="dialog-dlhy">
                    Anamnéza · celá cesta
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${MOBIL} max-h-[80dvh] sm:max-w-xl`}>
                  <DialogHeader>
                    <DialogTitle>Z nemocnice k agentom</DialogTitle>
                    <DialogDescription>Päť zastávok. Zvyšok je záznam.</DialogDescription>
                  </DialogHeader>
                  <ol className="grid gap-3">
                    {CESTA.map((k) => (
                      <li key={k.nazov} className="rounded-lg border-3 border-ink bg-white p-4">
                        <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink/60">{k.kedy}</p>
                        <p className="font-display text-xl font-extrabold uppercase">{k.nazov}</p>
                        <p className="mt-1 text-sm">{k.text}</p>
                        {k.citat && <p className="mt-2 font-serif text-lg italic">„{k.citat}“</p>}
                      </li>
                    ))}
                  </ol>
                </DialogContent>
              </Dialog>
            </div>
          </Blok>

          <Blok nazov="Široký · obrázok · bez krížika" pozn="className sm:max-w-2xl p-0; krížik skrytý cez [&>button:last-child]:hidden, zatvára vlastné tlačidlo.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" data-open="dialog-siroky">
                    Hriech · náhľad
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${MOBIL} gap-0 overflow-hidden p-0 sm:max-w-2xl [&>button:last-child]:hidden`}>
                  <img
                    src={hriech.obrazok!}
                    alt="Hriech — náhľad publikácie"
                    width={960}
                    height={600}
                    className="aspect-[16/10] w-full border-b-3 border-ink object-cover object-top"
                  />
                  <div className="grid gap-3 p-6">
                    <DialogHeader>
                      <p className="eyebrow">Diagnóza médií</p>
                      <DialogTitle className="font-display text-3xl font-extrabold">{hriech.nazov}</DialogTitle>
                      <DialogDescription className="text-base text-ink/75">{hriech.riadok}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                      <DialogClose asChild>
                        <Button variant="outline">Späť</Button>
                      </DialogClose>
                      <Button asChild>
                        <a href={hriech.url!} target="_blank" rel="noopener noreferrer">
                          hriech.xvadur.com ↗
                        </a>
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Blok>

          <Blok nazov="Kontrolovaný · open + onOpenChange" pozn="Stav drží rodič: dá sa otvoriť z hocikade (paleta, sprievodca, URL hash).">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>{kontrola ? 'otvorené' : 'zatvorené'}</Stav>
              <Button
                variant="outline"
                data-open="dialog-kontrola"
                onClick={() => {
                  setPocet((n) => n + 1);
                  setKontrola(true);
                }}
              >
                Otvoriť z kódu
              </Button>
              <span className="font-mono text-sm">otvorené {pocet}×</span>
              <Dialog open={kontrola} onOpenChange={setKontrola}>
                <DialogContent className={MOBIL}>
                  <DialogHeader>
                    <DialogTitle>Otvorené z kódu</DialogTitle>
                    <DialogDescription>
                      Žiadny DialogTrigger. Tlačidlo mimo dialógu nastaví open=true, Esc a krížik volajú onOpenChange(false).
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </Blok>

          <Blok nazov="Nemodálny · modal={false}" pozn="Bez overlayu, stránka ostáva klikateľná, scroll nie je zamknutý. Hodí sa na plávajúci panel.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>{nemodal ? 'otvorené' : 'zatvorené'}</Stav>
              <Dialog open={nemodal} onOpenChange={setNemodal} modal={false}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-open="dialog-nemodal">
                    Nemodálny panel
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className={`${MOBIL} sm:max-w-sm`}
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle>Stránka žije ďalej</DialogTitle>
                    <DialogDescription>Scrolluj a klikaj pod ním. Zavrie ho iba krížik alebo Esc.</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </Blok>
        </div>
      </Kus>

      <Kus
        id="alert-dialog"
        meno="alert-dialog"
        subor="src/components/ui/alert-dialog.tsx"
        veta="Otázka, na ktorú treba odpovedať: nezavrie sa klikom mimo, iba Zrušiť, Potvrdiť alebo Esc. Na zrušenie rezervácie a odchod z rozohranej hry."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <Blok nazov="Deštruktívny · Action ako destructive">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" data-open="alert">
                    Zrušiť termín
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[calc(100%-2rem)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Zrušiť vyšetrenie?</AlertDialogTitle>
                    <AlertDialogDescription>Termín sa uvoľní pre ďalšieho pacienta. Nový si vieš vybrať kedykoľvek.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Nechať termín</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground"
                      onClick={() => toast.error('Termín zrušený (ukážka)', { toasterId: KIT_TOASTER })}
                    >
                      Zrušiť termín
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Blok>

          <Blok nazov="Potvrdenie · odchod z hry">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>zatvorené</Stav>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" data-open="alert-hra">
                    Odísť zo Škrtacieho testu
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[calc(100%-2rem)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Odísť z hry?</AlertDialogTitle>
                    <AlertDialogDescription>Tvoj text a škrty sa neuložia. Hra beží iba v tvojom prehliadači.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hrať ďalej</AlertDialogCancel>
                    <AlertDialogAction>Odísť</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Blok>

          <Blok nazov="Async · čaká na výsledok" pozn="Action s e.preventDefault(), kým beží požiadavka; Spinner v tlačidle.">
            <div className="flex flex-wrap items-center gap-3">
              <Stav>{asyncOpen ? 'otvorené' : 'zatvorené'}</Stav>
              <AlertDialog open={asyncOpen} onOpenChange={(o) => !caka && setAsyncOpen(o)}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" data-open="alert-async">
                    Presunúť termín
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[calc(100%-2rem)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Presunúť na najbližší voľný?</AlertDialogTitle>
                    <AlertDialogDescription>Termíny sú Po–Pi 14:00–19:00. Tu sa nič nepresúva, je to ukážka.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={caka}>Nechať</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={caka}
                      onClick={(e) => {
                        e.preventDefault();
                        setCaka(true);
                        window.setTimeout(() => {
                          setCaka(false);
                          setAsyncOpen(false);
                          toast.success('Presunuté (ukážka)', { toasterId: KIT_TOASTER });
                        }, 1200);
                      }}
                    >
                      {caka && <Loader2 className="animate-spin" aria-hidden="true" />}
                      {caka ? 'Presúvam…' : 'Presunúť'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Blok>
        </div>
      </Kus>
    </>
  );
}
