/** V7-07 · V · Východ: pred odchodom si zober návod (lákadlo) alebo newsletter. FUNKČNÝ zápis e-mailu:
 *  POST /api/zapis/ { email, zdroj, produkt, utm, stranka, web(honeypot) } ako src/components/v5/ZapisForm.tsx
 *  (udalosť zapis_odoslany pri novom zápise, „už zapísaný“, slušná chyba s e-mailom). UI: BoldKit field, input,
 *  button, alert, sticker. Ostrov: <Vychod client:visible />. */
import * as React from 'react';
import { DoorOpen, Mail, Send } from 'lucide-react';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sticker } from '@/components/ui/sticker';
import { LAKADLO, NEWSLETTER } from '@/data/ponuka';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import { miesto } from './data';
import { Portal } from './Portal';

type Props = { zdroj: 'lakadlo' | 'newsletter'; produkt: string; tlacidlo: string; hotovo: string; tmavy?: boolean };

function Zapis({ zdroj, produkt, tlacidlo, hotovo, tmavy }: Props) {
  const id = React.useId();
  const [email, setEmail] = React.useState('');
  const [stav, setStav] = React.useState<'nic' | 'posielam' | 'ok' | 'chyba'>('nic');
  const [sprava, setSprava] = React.useState('');

  async function odosli(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (stav === 'posielam') return;
    const web = (new FormData(e.currentTarget).get('web') as string) || '';
    setStav('posielam');
    try {
      const r = await fetch('/api/zapis/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, zdroj, produkt, utm: utm(), stranka: location.pathname, web }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) throw new Error(d?.chyba || 'Zápis sa nepodaril.');
      setStav('ok');
      setSprava(d.potvrdenie === 'uz-zapisany' ? 'Tento e-mail už mám. Ozvem sa.' : hotovo);
      if (d.novy) track('zapis_odoslany', { miesto: `${zdroj}:${produkt}` });
    } catch (err) {
      setStav('chyba');
      setSprava(err instanceof Error && !/fetch|JSON|network|Failed/i.test(err.message) ? err.message : 'Zápis teraz nejde. Napíš mi na adam@xvadur.com a zapíšem ťa ručne.');
    }
  }

  if (stav === 'ok') {
    return (
      <p role="status" className="flex min-h-12 items-center gap-3 border-3 border-ink bg-yellow px-4 py-2 font-display text-base font-extrabold text-ink shadow-brutal-sm">
        <span aria-hidden="true">✓</span>
        {sprava}
      </p>
    );
  }

  return (
    <form onSubmit={odosli} className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor={`${id}-e`} className={cn(tmavy && 'text-paper')}>
          E-mail
        </FieldLabel>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id={`${id}-e`}
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="tvoj@email.sk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={stav === 'chyba' ? true : undefined}
            className="h-12 flex-1 bg-white text-ink"
          />
          <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <Button type="submit" variant="accent" size="lg" disabled={stav === 'posielam'} className="min-h-12">
            <Send className="h-4 w-4" aria-hidden="true" /> {stav === 'posielam' ? 'Posielam…' : tlacidlo}
          </Button>
        </div>
        {stav !== 'chyba' && <FieldDescription className={cn(tmavy && 'text-paper/70')}>Žiadny spam. Odhlásiš sa jedným klikom.</FieldDescription>}
      </Field>
      {stav === 'chyba' && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Zápis neprešiel</AlertTitle>
          <AlertDescription>{sprava}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}

export default function Vychod() {
  return (
    <section id="vychod" data-miesto="vychod" aria-labelledby="vychod-h" className="relative border-b-3 border-ink bg-paper">
      <Portal m={miesto('vychod')} farba="white" />
      <div className="mx-auto grid w-full max-w-[1500px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-20">
        <div className="relative flex flex-col gap-5 border-3 border-ink bg-ink p-6 text-paper shadow-brutal-lg sm:p-8">
          <Sticker rotation="medium-right" size="lg" tape className="absolute -top-5 right-4 font-mono uppercase">
            Zadarmo za e-mail
          </Sticker>
          <p className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.14em] text-yellow uppercase">
            <DoorOpen className="h-4 w-4" aria-hidden="true" /> Pred odchodom
          </p>
          <h2 id="vychod-h" className="font-display text-[clamp(2.4rem,1.4rem+3.5vw,4rem)] leading-[0.9] font-extrabold tracking-tighter uppercase">
            {LAKADLO.nazov}
          </h2>
          <p className="max-w-lg text-lg text-paper/85">{LAKADLO.popis}</p>
          <Zapis zdroj="lakadlo" produkt={LAKADLO.id} tlacidlo="Pošli mi návod" hotovo="Hotovo. Návod ti pošlem, keď ho dopíšem." tmavy />
        </div>
        <div className="flex flex-col gap-5 border-3 border-ink bg-yellow p-6 shadow-brutal-lg sm:p-8">
          <p className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.14em] uppercase">
            <Mail className="h-4 w-4" aria-hidden="true" /> Newsletter
          </p>
          <h3 className="font-display text-[clamp(2.2rem,1.4rem+3vw,3.6rem)] leading-[0.9] font-extrabold tracking-tighter uppercase">{NEWSLETTER.nazov}</h3>
          <p className="text-lg">{NEWSLETTER.popis}</p>
          <Zapis zdroj="newsletter" produkt={NEWSLETTER.id} tlacidlo="Odoberať" hotovo="Hotovo. Prvé vydanie ti príde do e-mailu." />
        </div>
      </div>
    </section>
  );
}
