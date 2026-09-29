/** V7-05 · Komiks — FUNKČNÝ zápis e-mailu. Logika a payload ako src/components/v5/ZapisForm.tsx:
 *  POST /api/zapis/ { email, zdroj, produkt, utm, stranka, web (honeypot) }, udalosť `zapis_odoslany` pri novom zápise,
 *  inline potvrdenie. Chyba (aj statický náhľad bez API) = slušná správa s e-mailom. UI z BoldKitu (field, input, button,
 *  sonner). Ostrov: client:visible. */
import * as React from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import { TOASTER } from './data';

type Props = {
  zdroj: 'cakacka' | 'lakadlo' | 'newsletter';
  produkt?: string;
  tlacidlo?: string;
  hotovo?: string;
  tmavy?: boolean;
  id: string;
};

export default function Zapis05({ zdroj, produkt, tlacidlo = 'Chcem vedieť ako prvý', hotovo, tmavy, id }: Props) {
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
      const s =
        d.potvrdenie === 'uz-zapisany'
          ? 'Tento e-mail už mám. Ozvem sa.'
          : (hotovo ?? (d.potvrdenie === 'odoslane' ? 'Hotovo. Potvrdenie ti prišlo do e-mailu.' : 'Hotovo, zapísal som si ťa.'));
      setStav('ok');
      setSprava(s);
      toast.success('Zapísané', { toasterId: TOASTER, description: s });
      if (d.novy) track('zapis_odoslany', { miesto: `${zdroj}:${produkt ?? ''}` });
    } catch (err) {
      setStav('chyba');
      setSprava(
        err instanceof Error && !/fetch|JSON|network/i.test(err.message) ? err.message : 'Zápis teraz nejde. Napíš mi na adam@xvadur.com a zapíšem ťa ručne.',
      );
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
    <form onSubmit={odosli} className="flex flex-col gap-2">
      <Field>
        <FieldLabel htmlFor={`${id}-e`} className="sr-only">
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
            onChange={(ev) => setEmail(ev.target.value)}
            aria-invalid={stav === 'chyba' ? true : undefined}
            aria-describedby={`${id}-d`}
            className="h-12 flex-1 bg-white text-base text-ink"
          />
          {/* honeypot: ľudia ho nevidia, roboti vyplnia */}
          <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <Button type="submit" variant="accent" size="lg" disabled={stav === 'posielam'} className="h-12">
            <Send aria-hidden="true" /> {stav === 'posielam' ? 'Posielam…' : tlacidlo}
          </Button>
        </div>
        <FieldDescription
          id={`${id}-d`}
          role={stav === 'chyba' ? 'alert' : undefined}
          className={cn('text-sm', stav === 'chyba' ? 'border-3 border-ink bg-stamp px-3 py-2 font-bold text-paper' : tmavy ? 'text-paper/75' : 'text-ink/75')}
        >
          {stav === 'chyba' ? sprava : 'Žiadny spam. Odhlásiš sa jedným klikom.'}
        </FieldDescription>
      </Field>
    </form>
  );
}
