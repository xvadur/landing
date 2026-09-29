/** V7-01 · Zápis e-mailu — FUNKČNÝ, logika a payload ako src/components/v5/ZapisForm.tsx:
 *  POST /api/zapis/ { email, zdroj, produkt, utm: utm(), stranka, web (honeypot) }, udalosť `zapis_odoslany` pri novom
 *  zápise, inline potvrdenie + sonner. Keď API nie je: slušná chyba s e-mailom. UI z BoldKitu (field, input, button).
 *  Ostrov: <Zapis client:visible zdroj="lakadlo" … />. */
import * as React from 'react';
import { toast } from 'sonner';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import { TOASTER } from './klient';

type Props = {
  zdroj: 'cakacka' | 'lakadlo' | 'newsletter';
  produkt?: string;
  tlacidlo?: string;
  hotovo?: string;
  tmavy?: boolean;
  className?: string;
};

export default function Zapis({ zdroj, produkt, tlacidlo = 'Chcem vedieť ako prvý', hotovo, tmavy, className }: Props) {
  const idp = React.useId();
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
      const text =
        d.potvrdenie === 'uz-zapisany'
          ? 'Tento e-mail už mám. Ozvem sa.'
          : (hotovo ?? (d.potvrdenie === 'odoslane' ? 'Hotovo. Potvrdenie ti prišlo do e-mailu.' : 'Hotovo, zapísal som si ťa.'));
      setStav('ok');
      setSprava(text);
      toast.success('Zapísané', { toasterId: TOASTER, description: text });
      if (d.novy) track('zapis_odoslany', { miesto: `v7-01:${zdroj}:${produkt ?? ''}` });
    } catch (err) {
      const text =
        err instanceof Error && !/fetch|JSON|network|Unexpected/i.test(err.message)
          ? err.message
          : 'Zápis teraz nejde. Napíš mi na adam@xvadur.com a zapíšem ťa ručne.';
      setStav('chyba');
      setSprava(text);
      toast.error('Zápis neprešiel', { toasterId: TOASTER, description: text });
    }
  }

  if (stav === 'ok')
    return (
      <p role="status" className={cn('flex min-h-12 items-center gap-3 border-3 border-ink bg-yellow px-4 py-2 font-display text-base font-extrabold text-ink shadow-[4px_4px_0_0_var(--color-ink)]', className)}>
        <span aria-hidden="true">✓</span>
        {sprava}
      </p>
    );

  return (
    <form onSubmit={odosli} className={cn('flex flex-col gap-2', className)}>
      <Field>
        <FieldLabel htmlFor={`${idp}-e`} className={cn('sr-only')}>
          E-mail
        </FieldLabel>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id={`${idp}-e`}
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="tvoj@email.sk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={stav === 'chyba' ? true : undefined}
            className="h-12 flex-1 bg-white text-base text-ink"
          />
          <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <Button type="submit" variant="accent" size="lg" disabled={stav === 'posielam'} className="whitespace-normal">
            {stav === 'posielam' ? (
              <>
                <Spinner size="sm" /> Posielam…
              </>
            ) : (
              tlacidlo
            )}
          </Button>
        </div>
        <FieldDescription className={cn('text-sm', tmavy ? 'text-paper/75' : 'text-ink/70')} role={stav === 'chyba' ? 'alert' : undefined}>
          {stav === 'chyba' ? sprava : 'Žiadny spam. Odhlásiš sa jedným klikom.'}
        </FieldDescription>
      </Field>
    </form>
  );
}
