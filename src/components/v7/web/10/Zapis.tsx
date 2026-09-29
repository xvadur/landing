/** V7-10 · funkčný zápis e-mailu. Logika a payload 1:1 ako src/components/v5/ZapisForm.tsx:
 *  POST /api/zapis/ { email, zdroj, produkt, utm, stranka, web(honeypot) } → udalosť `zapis_odoslany`.
 *  UI z BoldKitu (field, input, button) + sonner (toaster v7-10). Keď API nie je (statický náhľad), slušná chyba. */
import * as React from 'react';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { MathCurveLoader } from '@/components/ui/math-curve-loader';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import { TOASTER_ID } from './data';

type Props = {
  zdroj: 'cakacka' | 'lakadlo' | 'newsletter';
  produkt?: string;
  tlacidlo?: string;
  hotovo?: string;
  popis?: string;
  tmavy?: boolean;
  /** vždy pod sebou (úzky popover) */
  stlpec?: boolean;
  className?: string;
};

export default function Zapis({ zdroj, produkt, tlacidlo = 'Chcem vedieť ako prvý', hotovo, popis = 'Žiadny spam. Odhlásiš sa jedným klikom.', tmavy, stlpec, className }: Props) {
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
      toast.success('Zapísané', { toasterId: TOASTER_ID, description: text });
      if (d.novy) track('zapis_odoslany', { miesto: `${zdroj}:${produkt ?? ''}` });
    } catch (err) {
      const text =
        err instanceof Error && !/fetch|JSON|network/i.test(err.message)
          ? err.message
          : 'Zápis teraz nejde. Napíš mi na adam@xvadur.com a zapíšem ťa ručne.';
      setStav('chyba');
      setSprava(text);
      toast.error('Zápis nevyšiel', { toasterId: TOASTER_ID, description: text });
    }
  }

  if (stav === 'ok') {
    return (
      <p role="status" className={cn('flex min-h-12 items-center gap-3 border-3 border-ink bg-yellow px-4 py-2 font-display text-base font-extrabold text-ink', className)}>
        <span aria-hidden="true">✓</span>
        {sprava}
      </p>
    );
  }

  return (
    <form onSubmit={odosli} className={cn('flex flex-col gap-2', className)}>
      <Field>
        <FieldLabel htmlFor={`${idp}-e`} className="sr-only">
          E-mail
        </FieldLabel>
        <div className={cn('flex flex-col gap-3', !stlpec && 'sm:flex-row')}>
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
            aria-describedby={`${idp}-d`}
            className="h-12 flex-1 bg-white text-base text-ink"
          />
          <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <Button type="submit" variant="accent" size="lg" disabled={stav === 'posielam'} className="h-12 max-w-full shrink-0 whitespace-normal">
            {stav === 'posielam' ? (
              <>
                <MathCurveLoader curve="lissajous" size="xs" speed="fast" aria-hidden="true" /> Posielam…
              </>
            ) : (
              <>
                {tlacidlo} <ArrowRight aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
        <FieldDescription id={`${idp}-d`} role={stav === 'chyba' ? 'alert' : undefined} className={cn('text-sm', tmavy ? 'text-paper/75' : 'text-ink/70', stav === 'chyba' && 'font-bold')}>
          {stav === 'chyba' ? sprava : popis}
        </FieldDescription>
      </Field>
    </form>
  );
}
