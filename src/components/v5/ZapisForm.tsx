/** Formulár zápisu e-mailu (XDR-211): jeden komponent pre čakačky produktov, lákadlo aj newsletter.
 *  POST /api/zapis/ { email, zdroj, produkt, utm, stranka, web(honeypot) }. Po úspechu udalosť `zapis_odoslany`
 *  (Meta Lead / TikTok SubmitForm), inline potvrdenie. Bez JS = nič (ostrov client:visible), preto popis pod
 *  formulárom odkazuje aj na e-mail. Ostrov: <ZapisForm client:visible zdroj="cakacka" produkt="kohorta" /> */
import { useId, useState, type SubmitEvent } from 'react';
import { Input } from '@/components/vendor/neobrutalism/input';
import { track, utm } from '@/lib/meranie';
import { cn } from '@/lib/utils';

type Props = {
  zdroj: 'cakacka' | 'lakadlo' | 'newsletter';
  produkt?: string;
  tlacidlo?: string;
  hotovo?: string;
  className?: string;
  tmavy?: boolean;
};

export default function ZapisForm({ zdroj, produkt, tlacidlo = 'Chcem vedieť ako prvý', hotovo, className, tmavy }: Props) {
  const idp = useId();
  const [email, setEmail] = useState('');
  const [stav, setStav] = useState<'nic' | 'posielam' | 'ok' | 'chyba'>('nic');
  const [sprava, setSprava] = useState('');

  async function odosli(e: SubmitEvent<HTMLFormElement>) {
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
      setSprava(
        d.potvrdenie === 'uz-zapisany'
          ? 'Tento e-mail už mám. Ozvem sa.'
          : hotovo ?? (d.potvrdenie === 'odoslane' ? 'Hotovo. Potvrdenie ti prišlo do e-mailu.' : 'Hotovo, zapísal som si ťa.'),
      );
      if (d.novy) track('zapis_odoslany', { miesto: `${zdroj}:${produkt ?? ''}` });
    } catch (err) {
      setStav('chyba');
      setSprava(
        err instanceof Error && !/fetch|JSON|network/i.test(err.message)
          ? err.message
          : 'Zápis teraz nejde. Napíš mi na adam@xvadur.com a zapíšem ťa ručne.',
      );
    }
  }

  if (stav === 'ok') {
    return (
      <p
        role="status"
        className={cn('flex min-h-12 items-center gap-3 rounded-lg border-3 border-ink bg-lime px-4 py-2 font-display text-base font-extrabold text-ink shadow-brutal-sm', className)}
      >
        <span aria-hidden="true">✓</span>
        {sprava}
      </p>
    );
  }

  return (
    <form onSubmit={odosli} className={cn('flex flex-col gap-2', className)} noValidate={false}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`${idp}-e`} className="sr-only">
          E-mail
        </label>
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
          className="flex-1"
        />
        {/* honeypot: ľudia ho nevidia, roboti vyplnia */}
        <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <button
          type="submit"
          disabled={stav === 'posielam'}
          className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-3 border-ink bg-hot px-4 font-display text-base font-extrabold uppercase text-ink shadow-brutal-sm disabled:opacity-60"
        >
          {stav === 'posielam' ? 'Posielam…' : tlacidlo}
        </button>
      </div>
      <p className={cn('text-sm', tmavy ? 'text-paper/70' : 'text-ink/70')} role={stav === 'chyba' ? 'alert' : undefined}>
        {stav === 'chyba' ? sprava : 'Žiadny spam. Odhlásiš sa jedným klikom.'}
      </p>
    </form>
  );
}
