/** Rezervácia konzultácie (XDR-210): z reklamy rovno na termín. Tri kroky v jednom ostrove:
 *  deň → čas → meno, e-mail, téma → POST /api/rezervacia/. Voľné termíny z GET /api/terminy/ (pravidlá v
 *  src/data/terminy.ts). Po úspechu: konfety (Magic UI, bez reduced motion), zhrnutie, „Pridať do kalendára“ (.ics),
 *  udalosť `konzultacia_rezervacia` (Meta/TikTok Schedule). Keď API nie je (statický náhľad, výpadok): WhatsApp/e-mail.
 *  Ostrov: <Rezervacia client:visible /> */
import { useEffect, useId, useMemo, useState, type SubmitEvent } from 'react';
import { Input } from '@/components/vendor/neobrutalism/input';
import { fireConfetti } from '@/components/vendor/magicui/confetti';
import { track, utm } from '@/lib/meranie';
import { ics, slotText } from '@/lib/ics';
import { TERMINY } from '@/data/terminy';
import { cn } from '@/lib/utils';

type Den = { datum: string; sloty: string[] };

const denText = (datum: string) => {
  const [y, m, d] = datum.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!, 12));
  return {
    den: new Intl.DateTimeFormat('sk-SK', { weekday: 'short', timeZone: 'UTC' }).format(dt).replace('.', ''),
    cislo: `${d}. ${m}.`,
  };
};
const casText = (iso: string) =>
  new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', timeZone: TERMINY.zona }).format(new Date(iso));

const KROK = 'font-mono text-sm font-bold uppercase tracking-[0.14em]';
const CHIP =
  'press flex min-h-12 shrink-0 flex-col items-center justify-center rounded-lg border-3 border-ink px-4 py-2 font-display font-extrabold uppercase shadow-brutal-sm';

export default function Rezervacia() {
  const idp = useId();
  const [dni, setDni] = useState<Den[] | null>(null);
  const [nedostupne, setNedostupne] = useState(false);
  const [den, setDen] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [meno, setMeno] = useState('');
  const [email, setEmail] = useState('');
  const [tema, setTema] = useState('');
  const [stav, setStav] = useState<'nic' | 'posielam' | 'ok' | 'chyba'>('nic');
  const [sprava, setSprava] = useState('');

  function nacitaj() {
    fetch('/api/terminy/')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { dni: Den[] }) => {
        setDni(d.dni);
        setDen((cur) => (cur && d.dni.some((x) => x.datum === cur) ? cur : (d.dni[0]?.datum ?? null)));
      })
      .catch(() => setNedostupne(true));
  }
  useEffect(nacitaj, []);

  const sloty = useMemo(() => dni?.find((d) => d.datum === den)?.sloty ?? [], [dni, den]);

  async function odosli(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot || stav === 'posielam') return;
    setStav('posielam');
    const web = (new FormData(e.currentTarget).get('web') as string) || '';
    try {
      const r = await fetch('/api/rezervacia/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slot, meno, email, tema, utm: utm(), web }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) {
        if (r.status === 409) {
          setSlot(null);
          nacitaj();
        }
        throw new Error(d?.chyba || 'Rezervácia sa nepodarila.');
      }
      setStav('ok');
      setSprava(d.potvrdenie === 'odoslane' ? 'Potvrdenie s pozvánkou ti prišlo do e-mailu.' : 'Termín je zapísaný. Potvrdenie ti pošlem e-mailom.');
      track('konzultacia_rezervacia', { miesto: 'rezervacia' });
      void fireConfetti({ origin: { y: 0.7 } });
    } catch (err) {
      setStav('chyba');
      setSprava(err instanceof Error && !/fetch|JSON|network/i.test(err.message) ? err.message : 'Rezervácia teraz nejde. Skús WhatsApp nižšie.');
    }
  }

  function stiahniIcs() {
    if (!slot) return;
    const blob = new Blob([ics({ id: 'rez', slot, trvanieMin: TERMINY.trvanieMin })], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'konzultacia-xvadur.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  if (stav === 'ok' && slot) {
    return (
      <div role="status" className="flex flex-col gap-5 rounded-lg border-3 border-ink bg-yellow p-6 text-ink shadow-brutal-lg sm:p-8">
        <p className={KROK}>Hotovo ✓</p>
        <p className="font-display text-3xl leading-tight font-extrabold uppercase sm:text-4xl">{slotText(slot)}</p>
        <p className="text-lg">{sprava} Na vyšetrenie si prines jeden príklad úlohy, ktorú chceš vyliečiť. Netreba prezentáciu.</p>
        <button type="button" onClick={stiahniIcs} className={cn(CHIP, 'self-start bg-white text-base')}>
          Pridať do kalendára (.ics)
        </button>
      </div>
    );
  }

  if (nedostupne) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border-3 border-ink bg-white p-6 text-ink shadow-brutal">
        <p className={KROK}>Kalendár sa nenačítal</p>
        <p className="text-lg">Rezervácia teraz nejde. Napíš mi cez WhatsApp alebo na adam@xvadur.com a termín dohodneme hneď.</p>
      </div>
    );
  }

  return (
    <form onSubmit={odosli} className="flex flex-col gap-6 rounded-lg border-3 border-ink bg-white p-5 text-ink shadow-brutal-lg sm:p-8" aria-label="Rezervácia konzultácie">
      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className={KROK}>1 · Deň</legend>
        {!dni ? (
          <div className="flex gap-3 overflow-hidden" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-16 w-20 animate-pulse rounded-lg border-3 border-ink/30 bg-paper" />
            ))}
          </div>
        ) : dni.length === 0 ? (
          <p className="text-lg">Najbližšie dva týždne je plno. Napíš mi cez WhatsApp.</p>
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pt-1 pb-3" data-scroll-x data-lenis-prevent>
            {dni.map((d) => {
              const t = denText(d.datum);
              const on = d.datum === den;
              return (
                <button
                  key={d.datum}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setDen(d.datum);
                    setSlot(null);
                  }}
                  className={cn(CHIP, on ? 'bg-yellow' : 'bg-paper')}
                >
                  <span className="text-xs">{t.den}</span>
                  <span className="text-lg">{t.cislo}</span>
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {dni && dni.length > 0 && (
        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className={KROK}>2 · Čas (30 minút)</legend>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {sloty.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={s === slot}
                onClick={() => setSlot(s)}
                className={cn(CHIP, 'text-lg', s === slot ? 'bg-hot' : 'bg-paper')}
              >
                {casText(s)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className={cn('flex min-w-0 flex-col gap-3 transition-opacity', !slot && 'pointer-events-none opacity-40')} disabled={!slot}>
        <legend className={KROK}>3 · Príjem pacienta {slot && <span className="normal-case">— {slotText(slot)}</span>}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idp}-m`} className="mb-1 block text-sm font-bold">Meno</label>
            <Input id={`${idp}-m`} name="meno" required autoComplete="name" value={meno} onChange={(e) => setMeno(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${idp}-e`} className="mb-1 block text-sm font-bold">E-mail</label>
            <Input id={`${idp}-e`} name="email" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor={`${idp}-t`} className="mb-1 block text-sm font-bold">S čím prichádzaš? (nepovinné)</label>
          <textarea
            id={`${idp}-t`}
            name="tema"
            rows={3}
            maxLength={600}
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            className="w-full rounded-lg border-3 border-ink bg-white px-4 py-3 text-base shadow-brutal-sm focus:shadow-brutal"
            placeholder="Napr. odpovedám na tie isté dopyty stále dookola."
          />
        </div>
        <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <button
          type="submit"
          disabled={!slot || stav === 'posielam'}
          className="press mt-2 inline-flex min-h-14 items-center justify-center gap-2 rounded-lg border-3 border-ink bg-hot px-6 font-display text-xl font-extrabold uppercase text-ink shadow-brutal disabled:opacity-60"
        >
          {stav === 'posielam' ? 'Objednávam…' : 'Objednať sa na vyšetrenie'}
        </button>
        {stav === 'chyba' && (
          <p role="alert" className="rounded-lg border-3 border-ink bg-stamp px-4 py-3 font-bold text-paper">
            {sprava}
          </p>
        )}
      </fieldset>
    </form>
  );
}
