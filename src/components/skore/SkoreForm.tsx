/** Skóre webu makléra — ostrov: URL → POST /api/skore → výsledok (merač, 4 zložky, klišé, prvý krok, detaily).
 *  Ostrov: <SkoreForm client:idle />. Skeleton pri načítaní = React Bits Noise (zrno animované len na desktope s myšou).
 *  Bez Motion (podstránka lite). A11y: krátky sr-only aria-live stav, chyba role="alert" mimo live regiónu,
 *  po výsledku fokus na h2 verdiktu; scrollIntoView bez smooth pod reduced motion. */
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  ChatTeardropTextIcon,
  MagnifyingGlassIcon,
  SealCheckIcon,
  WarningIcon,
  XIcon,
} from '@phosphor-icons/react';

import { Input } from '@/components/vendor/neobrutalism/input';
import { Button } from '@/components/vendor/neobrutalism/button';
import Noise from '@/components/vendor/reactbits/Noise';
import { isDesktopPointer } from '@/components/vendor/reactbits/motion-guards';
import Gauge from './Gauge';
import { verdiktSkore, type SkoreVysledok } from '@/lib/skore-analyzer';
import { KOTVY } from '@/data/fakty';
import { cn } from '@/lib/utils';

type Odpoved = SkoreVysledok & { ok: true; url: string; orezane: boolean };
type Stav = { s: 'idle' } | { s: 'loading'; url: string } | { s: 'done'; data: Odpoved } | { s: 'error'; text: string };

/** Vzor v placeholderi: doména bez záznamu (overené 19. 9. 2026 curl → bez odpovede), nie živý web tretej strany. */
const PLACEHOLDER = 'www.vas-web.sk';

/* Texty ku kotvám = porovnanie s trhom, nie príslušnosť k vzorke (analyzovaný web vo výskume 416 webov nie je). */
const PRVY_KROK_TEXT: Record<SkoreVysledok['prvyKrok'], { titul: string; text: string }> = {
  rezervacia: {
    titul: 'Rezervácia termínu',
    text: `Termín ako prvý krok ponúka len ${KOTVY.prvyKrokRezervacia.value} zo ${KOTVY.prvyKrokRezervacia.z} webov.`,
  },
  kontakt: {
    titul: '„Kontakt“',
    text: `Ako ${KOTVY.prvyKrokKontakt.value} zo ${KOTVY.prvyKrokKontakt.z} webov: telefón alebo všeobecný formulár. Klient nevie, čo dostane.`,
  },
  ziadny: {
    titul: 'Žiadny',
    text: 'Na stránke sme nenašli pomenovaný ďalší krok.',
  },
};

export default function SkoreForm({ className }: { className?: string }) {
  const [url, setUrl] = useState('');
  const [stav, setStav] = useState<Stav>({ s: 'idle' });
  const id = useId();
  const vysledokRef = useRef<HTMLDivElement | null>(null);
  const verdiktRef = useRef<HTMLHeadingElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (stav.s !== 'done' && stav.s !== 'error') return;
    // JS `behavior: 'smooth'` prebíja CSS scroll-behavior — pod reduced motion scrollujeme natívne.
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    vysledokRef.current?.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
    if (stav.s === 'done') verdiktRef.current?.focus({ preventScroll: true });
  }, [stav.s]);

  const verdikt = stav.s === 'done' ? verdiktSkore(stav.data.skore, { ...stav.data.detaily, prvyKrok: stav.data.prvyKrok }) : null;

  async function odoslat(e: { preventDefault(): void }) {
    e.preventDefault();
    const u = url.trim();
    if (!u) {
      setStav({ s: 'error', text: 'Zadajte adresu webu.' });
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStav({ s: 'loading', url: u });
    try {
      const res = await fetch('/api/skore/', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ url: u }),
        signal: ctrl.signal,
      });
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('application/json')) {
        setStav({ s: 'error', text: 'Analyzér práve neodpovedá. Skúste to o chvíľu.' });
        return;
      }
      const data = (await res.json()) as Partial<Odpoved> & { chyba?: string };
      if (!res.ok || !data.ok) {
        setStav({ s: 'error', text: data.chyba ?? 'Analýza sa nepodarila.' });
        return;
      }
      setStav({ s: 'done', data: data as Odpoved });
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      setStav({ s: 'error', text: 'Spojenie zlyhalo. Skúste to znova.' });
    }
  }

  return (
    <div className={cn('flex flex-col gap-10', className)}>
      <form onSubmit={odoslat} className="flex flex-col gap-4" aria-describedby={`${id}-pomoc`}>
        <label htmlFor={`${id}-url`} className="eyebrow">
          Adresa webu
        </label>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            id={`${id}-url`}
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            placeholder={PLACEHOLDER}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={stav.s === 'error' ? true : undefined}
            className="h-14 flex-1 font-mono text-lg"
            required
          />
          <Button type="submit" tone="hot" size="lg" disabled={stav.s === 'loading'} className="w-full sm:w-auto">
            {stav.s === 'loading' ? 'Čítam…' : 'Zistiť skóre'}
            <MagnifyingGlassIcon weight="bold" aria-hidden="true" />
          </Button>
        </div>
        <p id={`${id}-pomoc`} className="max-w-prose text-sm text-ink/70">
          Stiahneme len vloženú stránku (do 1 MB, do 8 sekúnd) a porovnáme ju s tým, čo píše {KOTVY.kancelarieSFrazou.z}{' '}
          bratislavských kancelárií. Nič sa neukladá.
        </p>
      </form>

      {/* krátky stavový riadok pre čítačky — celý výsledok nie je live región */}
      <p className="sr-only" aria-live="polite">
        {stav.s === 'loading' && `Čítam stránku ${stav.url}.`}
        {stav.s === 'done' && verdikt && `Skóre ${stav.data.skore} zo 100 — ${verdikt.titul}`}
      </p>

      <div ref={vysledokRef} className="scroll-mt-24">
        {stav.s === 'loading' && <Skeleton url={stav.url} />}
        {stav.s === 'error' && (
          <div role="alert" className="flex items-start gap-4 rounded-lg border-3 border-ink bg-pink p-5 shadow-brutal">
            <WarningIcon size={28} weight="bold" aria-hidden="true" className="shrink-0 text-hot" />
            <div>
              <p className="font-display text-xl font-extrabold uppercase">Nejde to</p>
              <p className="mt-1">{stav.text}</p>
            </div>
          </div>
        )}
        {stav.s === 'done' && verdikt && <Vysledok data={stav.data} verdikt={verdikt} verdiktRef={verdiktRef} />}
      </div>
    </div>
  );
}

/* ---------- skeleton ---------- */

function Skeleton({ url }: { url: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border-3 border-ink bg-white p-6 shadow-brutal sm:p-8" aria-busy="true">
      <Noise patternSize={200} patternAlpha={22} animate={isDesktopPointer()} />
      <div className="relative z-10 grid gap-6 md:grid-cols-[18rem_1fr] md:items-center">
        <div className="mx-auto h-36 w-64 rounded-t-full border-3 border-ink border-b-0 bg-paper" />
        <div className="flex flex-col gap-3">
          <p className="eyebrow">Čítam stránku</p>
          <p className="truncate font-mono text-lg">{url}</p>
          <div className="h-6 w-3/4 rounded-lg bg-paper" />
          <div className="h-6 w-1/2 rounded-lg bg-paper" />
          <div className="h-6 w-2/3 rounded-lg bg-paper" />
        </div>
      </div>
    </div>
  );
}

/* ---------- výsledok ---------- */

function Vysledok({
  data,
  verdikt: v,
  verdiktRef,
}: {
  data: Odpoved;
  verdikt: { titul: string; text: string };
  verdiktRef: RefObject<HTMLHeadingElement | null>;
}) {
  const b = data.detaily.body;
  const krok = PRVY_KROK_TEXT[data.prvyKrok];

  return (
    <div className="flex flex-col gap-10">
      {/* merač + verdikt */}
      <section aria-labelledby="skore-verdikt" className="relative overflow-hidden rounded-lg border-3 border-ink bg-white shadow-brutal-lg">
        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[18rem_1fr] md:items-center">
          <Gauge value={data.skore} />
          <div>
            <p className="eyebrow mb-3">
              {data.detaily.host} · skóre webu
            </p>
            <h2
              id="skore-verdikt"
              ref={verdiktRef}
              tabIndex={-1}
              className="font-display text-display-xs font-extrabold uppercase leading-[0.95] tracking-tight"
            >
              {v.titul}
            </h2>
            <p className="mt-4 max-w-prose text-lg">{v.text}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[3px] border-t-3 border-ink bg-ink font-mono text-sm sm:grid-cols-4">
          <Zlozka label="Frázy" body={b.frazy} max={40} />
          <Zlozka label="Prvý krok" body={b.prvyKrok} max={30} />
          <Zlozka label="Dôkaz" body={b.dokaz} max={20} />
          <Zlozka label="Nástroj" body={b.nastroj} max={10} />
        </div>
      </section>

      {/* štyri zložky */}
      <div className="grid gap-5 md:grid-cols-2">
        <Karta
          tone="bg-yellow"
          Icon={XIcon}
          eyebrow={`01 · Frázy · ${b.frazy} / 40`}
          titul={
            data.klise.length === 0
              ? 'Ani jedna zo 6 rodín fráz.'
              : `${data.klise.length} zo 6 rodín fráz, ${data.detaily.frazySpolu}× na stránke.`
          }
          text={`${KOTVY.kancelarieSFrazou.value} zo ${KOTVY.kancelarieSFrazou.z} kancelárií má v texte aspoň jednu.`}
        >
          {data.klise.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2" role="list">
              {data.klise.map((k) => (
                <li key={k.rodina} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border-3 border-ink bg-white px-3 py-2">
                  <span className="font-display font-extrabold uppercase">{k.rodina}</span>
                  <span className="font-mono text-sm">{k.pocet}×</span>
                  <span className="w-full text-sm text-ink/70">
                    {k.priklady.map((p, i) => (
                      <span key={p}>
                        {i > 0 && ' · '}
                        <mark className="bg-transparent text-ink/70 line-through decoration-hot decoration-[3px]">{p}</mark>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Karta>

        <Karta
          tone="bg-sky"
          Icon={data.prvyKrok === 'rezervacia' ? CalendarCheckIcon : ChatTeardropTextIcon}
          eyebrow={`02 · Prvý krok · ${b.prvyKrok} / 30`}
          titul={krok.titul}
          text={krok.text}
        >
          <p className="mt-4 text-sm text-ink/80">{data.detaily.prvyKrokDovod}</p>
        </Karta>

        <Karta
          tone="bg-lime"
          Icon={SealCheckIcon}
          eyebrow={`03 · Dôkaz · ${b.dokaz} / 20`}
          titul={data.detaily.dokaz ? 'Dôkaz s číslom je tu.' : 'Dôkaz chýba.'}
          text={`${KOTVY.dokazNaWebe.value} zo ${KOTVY.dokazNaWebe.z} webov má použiteľný dôkaz: prípad, nie „20 rokov“.`}
        >
          <p className="mt-4 text-sm text-ink/80">{data.detaily.dokazDovod}</p>
        </Karta>

        <Karta
          tone="bg-lilac"
          Icon={CalendarCheckIcon}
          eyebrow={`04 · Nástroj · ${b.nastroj} / 10`}
          titul={
            data.bookingWidget
              ? 'Rezervačný nástroj na stránke.'
              : data.formulare > 0
                ? `${data.formulare === 1 ? 'Jeden formulár' : `${data.formulare} formuláre`}, bez rezervácie.`
                : 'Bez formulára, bez rezervácie.'
          }
          text="Booking odkaz namiesto „Kontakt“ je Deň 6 plánu Neviditeľný maklér."
        >
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm">
            <dt className="text-ink/60">Formuláre</dt>
            <dd>{data.formulare}</dd>
            <dt className="text-ink/60">Rezervácia</dt>
            <dd>{data.bookingWidget ? 'áno' : 'nie'}</dd>
            <dt className="text-ink/60">Platforma</dt>
            <dd>{data.vendor ?? 'nerozpoznaná'}</dd>
            <dt className="text-ink/60">Slová</dt>
            <dd>{data.detaily.slova.toLocaleString('sk-SK')}</dd>
          </dl>
        </Karta>
      </div>

      {data.orezane && (
        <p className="text-sm text-ink/70">Stránka bola väčšia než 1 MB — analyzovali sme prvý megabajt.</p>
      )}

      {/* CTA */}
      <div className="flex flex-col gap-5 rounded-lg border-3 border-ink bg-ink p-6 text-paper shadow-brutal sm:p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow mb-2 text-paper/70">Čo s tým</p>
          <p className="font-display text-2xl font-extrabold uppercase leading-tight sm:text-3xl">
            Neviditeľný maklér: 7 dní, po ktorých vás klient nájde bez loga kancelárie.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <a
            href="/makleri/"
            className="press inline-flex min-h-14 items-center justify-center gap-3 rounded-lg border-3 border-paper bg-hot px-6 font-display text-lg font-extrabold uppercase text-ink shadow-[6px_6px_0_0_var(--color-paper)]"
          >
            Chcem plán
            <ArrowRightIcon weight="bold" aria-hidden="true" />
          </a>
          <a
            href="/hry/skrtaci-test/"
            className="inline-flex min-h-11 items-center justify-center gap-2 font-display text-lg font-extrabold uppercase underline decoration-hot decoration-[3px] underline-offset-4"
          >
            Škrtnúť si text sám →
          </a>
        </div>
      </div>
    </div>
  );
}

function Zlozka({ label, body, max }: { label: string; body: number; max: number }) {
  return (
    <div className="flex flex-col gap-1 bg-white px-4 py-3">
      <span className="eyebrow text-ink/60">{label}</span>
      <span className="font-display text-2xl font-extrabold tabular-nums">
        {body}
        <span className="text-base text-ink/60"> / {max}</span>
      </span>
    </div>
  );
}

function Karta({
  tone,
  Icon,
  eyebrow,
  titul,
  text,
  children,
}: {
  tone: string;
  Icon: typeof XIcon;
  eyebrow: string;
  titul: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <article className={cn('relative flex flex-col rounded-lg border-3 border-ink p-6 shadow-brutal', tone)}>
      <div className="flex items-start justify-between gap-4">
        <p className="eyebrow">{eyebrow}</p>
        <Icon size={32} weight="bold" aria-hidden="true" className="shrink-0" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-extrabold uppercase leading-tight">{titul}</h3>
      <p className="mt-2 text-base">{text}</p>
      {children}
    </article>
  );
}
