/** V7-08 · okno Zápis = formulár zápisu e-mailu. FUNKČNÝ: POST /api/zapis/ { email, zdroj, produkt, utm, stranka, web }
 *  ako v5/ZapisForm.tsx (uz-zapisany, odoslane, track zapis_odoslany). Voľba: Vydanie (newsletter), lákadlo alebo čakáreň
 *  produktu (radio-group + select). Liečba vie okno otvoriť s predvoleným produktom (udalosť v708 → zapis). */
import * as React from 'react';
import { Mail, MailPlus } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { LAKADLO, NEWSLETTER, PRODUKTY } from '@/data/ponuka';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import Okno from './Okno';
import { pocuvaj, posli, predvolbaZapisu } from './store';

type Zdroj = 'newsletter' | 'lakadlo' | 'cakacka';

const VOLBY: { zdroj: Zdroj; nazov: string; popis: string }[] = [
  { zdroj: 'newsletter', nazov: `Newsletter ${NEWSLETTER.nazov}`, popis: NEWSLETTER.popis },
  { zdroj: 'lakadlo', nazov: LAKADLO.nazov, popis: LAKADLO.popis },
  { zdroj: 'cakacka', nazov: 'Čakáreň produktu', popis: 'Chcem vedieť ako prvý, keď sa produkt otvorí.' },
];

export default function OknoZapis() {
  const [zdroj, setZdroj] = React.useState<Zdroj>('newsletter');
  const [produkt, setProdukt] = React.useState(PRODUKTY[0]!.id);
  const [email, setEmail] = React.useState('');
  const [stav, setStav] = React.useState<'nic' | 'posielam' | 'ok' | 'chyba'>('nic');
  const [sprava, setSprava] = React.useState('');
  const web = React.useRef('');

  React.useEffect(() => {
    const nastav = (z: Zdroj, p: string) => {
      setZdroj(z);
      if (z === 'cakacka') setProdukt(p);
      setStav('nic');
    };
    if (predvolbaZapisu) nastav(predvolbaZapisu.zdroj, predvolbaZapisu.produkt);
    return pocuvaj((u) => {
      if (u.typ === 'zapis') nastav(u.zdroj, u.produkt);
    });
  }, []);

  const produktId = zdroj === 'newsletter' ? NEWSLETTER.id : zdroj === 'lakadlo' ? LAKADLO.id : produkt;

  async function odosli(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (stav === 'posielam') return;
    setStav('posielam');
    try {
      const r = await fetch('/api/zapis/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, zdroj, produkt: produktId, utm: utm(), stranka: location.pathname, web: web.current }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) throw new Error(d?.chyba || 'Zápis sa nepodaril.');
      const text =
        d.potvrdenie === 'uz-zapisany'
          ? 'Tento e-mail už mám. Ozvem sa.'
          : zdroj === 'lakadlo'
            ? 'Hotovo. Návod ti pošlem, keď ho dopíšem.'
            : zdroj === 'newsletter'
              ? 'Hotovo. Prvé vydanie ti príde do e-mailu.'
              : d.potvrdenie === 'odoslane'
                ? 'Hotovo. Potvrdenie ti prišlo do e-mailu.'
                : 'Hotovo, zapísal som si ťa.';
      setStav('ok');
      setSprava(text);
      posli({ typ: 'hlasenie', text: 'Zápis prijatý', popis: text, druh: 'success' });
      if (d.novy) track('zapis_odoslany', { miesto: `v708-${zdroj}:${produktId}` });
    } catch (err) {
      const text =
        err instanceof Error && !/fetch|JSON|network|Failed/i.test(err.message) ? err.message : 'Zápis teraz nejde. Napíš mi na adam@xvadur.com a zapíšem ťa ručne.';
      setStav('chyba');
      setSprava(text);
      posli({ typ: 'hlasenie', text: 'Zápis sa nepodaril', popis: text, druh: 'error' });
    }
  }

  return (
    <Okno id="zapis" ikona={<MailPlus />} className="lg:col-span-5 lg:mt-4" stav={<>ZAPIS.FRM · žiadny spam · odhlásiš sa jedným klikom</>}>
      <div className="flex flex-col gap-5 bg-ink p-4 text-paper sm:p-6">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.16em] text-yellow uppercase">Zadarmo za e-mail</p>
          <p className="font-display text-3xl leading-[0.9] font-extrabold tracking-tight uppercase">Zapíš sa do systému.</p>
        </div>
        <RadioGroup value={zdroj} onValueChange={(v) => setZdroj(v as Zdroj)} className="gap-3" aria-label="Kam ťa zapísať">
          {VOLBY.map((v) => (
            <Label
              key={v.zdroj}
              htmlFor={`v708-z-${v.zdroj}`}
              className={cn(
                'flex min-h-11 cursor-pointer items-start gap-3 border-3 border-paper p-3 tracking-normal normal-case',
                zdroj === v.zdroj ? 'bg-yellow text-ink' : 'bg-transparent text-paper',
              )}
            >
              <RadioGroupItem id={`v708-z-${v.zdroj}`} value={v.zdroj} className="mt-0.5 bg-white" />
              <span className="flex flex-col gap-1">
                <span className="font-display text-lg leading-none font-extrabold uppercase">{v.nazov}</span>
                <span className="text-sm font-medium">{v.popis}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>

        {zdroj === 'cakacka' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="v708-produkt" className="text-paper">
              Produkt
            </Label>
            <Select value={produkt} onValueChange={setProdukt}>
              <SelectTrigger id="v708-produkt" className="min-h-11 bg-white text-ink">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUKTY.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="min-h-11">
                    {p.nazov} · {p.nalepka}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {stav === 'ok' ? (
          <p role="status" className="flex min-h-12 items-center gap-3 border-3 border-ink bg-yellow px-4 py-2 font-display text-base font-extrabold text-ink">
            <span aria-hidden="true">✓</span>
            {sprava}
          </p>
        ) : (
          <form onSubmit={odosli} className="flex flex-col gap-2">
            <label htmlFor="v708-zapis-email" className="sr-only">
              E-mail
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <InputGroup className="min-h-12 flex-1 bg-white text-ink">
                <InputGroupAddon>
                  <Mail aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  id="v708-zapis-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tvoj@email.sk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={stav === 'chyba' ? true : undefined}
                  className="text-base"
                />
              </InputGroup>
              <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" onChange={(e) => (web.current = e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <Button type="submit" variant="accent" size="lg" disabled={stav === 'posielam'} className="border-paper">
                {stav === 'posielam' ? (
                  <>
                    <Spinner size="sm" aria-label="Posielam" /> Posielam…
                  </>
                ) : zdroj === 'newsletter' ? (
                  'Odoberať'
                ) : zdroj === 'lakadlo' ? (
                  'Pošli mi návod'
                ) : (
                  'Chcem vedieť ako prvý'
                )}
              </Button>
            </div>
            <p className={cn('text-sm', stav === 'chyba' ? 'font-bold text-yellow' : 'text-paper/70')} role={stav === 'chyba' ? 'alert' : undefined}>
              {stav === 'chyba' ? sprava : 'Žiadny spam. Odhlásiš sa jedným klikom.'}
            </p>
          </form>
        )}
      </div>
    </Okno>
  );
}
