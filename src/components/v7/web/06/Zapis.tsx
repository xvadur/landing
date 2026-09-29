/** V7-06 · Zápis e-mailu — FUNKČNÝ, tá istá logika a payload ako src/components/v5/ZapisForm.tsx:
 *  POST /api/zapis/ { email, zdroj, produkt, utm, stranka, web(honeypot) }, udalosť `zapis_odoslany` pri novom zápise.
 *  UI z BoldKitu: input-group (ikona + e-mail + tlačidlo v jednom ráme), button, spinner, alert; potvrdenie cez sonner. */
import { useId, useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';
import { TOASTER_ID } from './data';

type Props = {
  zdroj: 'cakacka' | 'lakadlo' | 'newsletter';
  produkt?: string;
  tlacidlo?: string;
  hotovo?: string;
  tmavy?: boolean;
  className?: string;
};

export default function Zapis({ zdroj, produkt, tlacidlo = 'Chcem vedieť ako prvý', hotovo, tmavy, className }: Props) {
  const idp = useId();
  const [email, setEmail] = useState('');
  const [stav, setStav] = useState<'nic' | 'posielam' | 'ok' | 'chyba'>('nic');
  const [sprava, setSprava] = useState('');

  async function odosli(e: FormEvent<HTMLFormElement>) {
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
      setStav('chyba');
      setSprava(
        err instanceof Error && !/fetch|JSON|network|Unexpected/i.test(err.message)
          ? err.message
          : 'Zápis teraz nejde. Napíš mi na adam@xvadur.com a zapíšem ťa ručne.',
      );
    }
  }

  if (stav === 'ok') {
    return (
      <p role="status" className={cn('flex min-h-12 items-center gap-3 border-3 border-ink bg-yellow px-4 py-2 font-display text-base font-extrabold text-ink shadow-brutal-sm', className)}>
        <span aria-hidden="true">✓</span>
        {sprava}
      </p>
    );
  }

  return (
    <form onSubmit={odosli} className={cn('flex flex-col gap-3', className)}>
      <label htmlFor={`${idp}-e`} className="sr-only">
        E-mail
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <InputGroup className="min-h-12 flex-1 bg-white">
          <InputGroupAddon>
            <Mail className="h-5 w-5" aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
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
            className="text-base normal-case"
          />
        </InputGroup>
        {/* honeypot: ľudia ho nevidia, roboti vyplnia */}
        <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <Button type="submit" variant="accent" size="lg" disabled={stav === 'posielam'} className="min-h-12 max-w-full whitespace-normal">
          {stav === 'posielam' ? (
            <>
              <Spinner size="sm" aria-label="Posielam" /> Posielam…
            </>
          ) : (
            tlacidlo
          )}
        </Button>
      </div>
      {stav === 'chyba' ? (
        <Alert variant="destructive" className="py-3">
          <AlertTitle>Zápis neprešiel</AlertTitle>
          <AlertDescription>{sprava}</AlertDescription>
        </Alert>
      ) : (
        <p className={cn('text-sm', tmavy ? 'text-paper/75' : 'text-ink/70')}>Žiadny spam. Odhlásiš sa jedným klikom.</p>
      )}
    </form>
  );
}
