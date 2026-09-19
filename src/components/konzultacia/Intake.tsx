/** Intake formulár konzultácie (ostrov, client:visible s rootMargin). Natívne prvky s brutal triedami (ui.ts),
 *  natívny select (NativeSelect, bez Radixu — rozpočet JS), štítok zdroja = utilita `sticker`.
 *  Bez backendu: po odoslaní vznikne slovenský payload → OTVORIŤ WHATSAPP (wa.me/?text=) · POSLAŤ E-MAIL (mailto)
 *  · KOPÍROVAŤ (sonner toast). Predvyplnenie z query (zdieľaný kontrakt): z=kviz|plan, kto, hodiny, sadzba, krok. */
import { useEffect, useMemo, useRef, useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  ChatCircleDotsIcon,
  CheckIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
} from '@phosphor-icons/react';

import { NativeSelect } from './NativeSelect';
import { BTN_HOT, BTN_LIME, BTN_WHITE, INPUT, TEXTAREA } from './ui';
import {
  CASTO_OPTIONS,
  EMPTY_INTAKE,
  KTO_OPTIONS,
  buildPayload,
  hodinyText,
  intakeFromPrefill,
  krokText,
  mailtoUrl,
  readPrefill,
  sadzbaText,
  whatsappUrl,
  zdrojLabel,
  type CastoValue,
  type Intake as IntakeData,
  type KtoValue,
  type Prefill,
} from './payload';

const EMPTY_PREFILL: Prefill = { z: null, kto: null, hodiny: null, sadzba: null, krok: null };

function Field({
  id,
  label,
  hint,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-3 font-display text-lg font-extrabold uppercase tracking-wide">
        {label}
        {optional && <span className="eyebrow text-ink/60">voliteľné</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-base text-ink/70">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

export default function Intake() {
  const [prefill, setPrefill] = useState<Prefill>(EMPTY_PREFILL);
  const [data, setData] = useState<IntakeData>(EMPTY_INTAKE);
  const [sent, setSent] = useState(false);
  const [ulohaError, setUlohaError] = useState(false);

  useEffect(() => {
    const p = readPrefill(window.location.search);
    setPrefill(p);
    setData(intakeFromPrefill(p));
  }, []);

  // Fokus po prepnutí formulár ↔ výsledok (aktívny prvok zmizne z DOM, inak by fokus spadol na <body>).
  // Pri prvom vykreslení sa fokus neberie (stránka sa načítava, nie je čo prepínať).
  const prepnute = useRef(false);
  useEffect(() => {
    if (!prepnute.current) {
      prepnute.current = true;
      return;
    }
    const id = sent ? 'intake-vysledok' : 'intake-uloha';
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      if (sent) el.scrollIntoView({ block: 'start' });
      el.focus({ preventScroll: sent });
    }, 0);
    return () => window.clearTimeout(t);
  }, [sent]);

  const payload = useMemo(() => buildPayload(data, prefill), [data, prefill]);
  const set = <K extends keyof IntakeData>(key: K) => (value: IntakeData[K]) => setData((d) => ({ ...d, [key]: value }));

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data.uloha.trim()) {
      setUlohaError(true);
      document.getElementById('intake-uloha')?.focus();
      return;
    }
    setUlohaError(false);
    setSent(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      toast.success('Skopírované', { description: 'Správa je v schránke. Pošli ju, kam chceš.' });
    } catch {
      toast.error('Nepodarilo sa skopírovať', { description: 'Označ text a skopíruj ho ručne.' });
    }
  };

  const zdroj = zdrojLabel(prefill.z);
  const zKvizu = [
    prefill.hodiny ? { k: 'Hodiny týždenne', v: hodinyText(prefill.hodiny) } : null,
    prefill.sadzba ? { k: 'Sadzba', v: sadzbaText(prefill.sadzba) } : null,
    prefill.krok ? { k: 'Prvý krok', v: krokText(prefill.krok) } : null,
  ].filter((x): x is { k: string; v: string } => x !== null);

  if (sent) {
    return (
      <div id="intake-vysledok" tabIndex={-1} className="brutal w-full min-w-0 scroll-mt-24 p-5 outline-none sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-3 border-ink bg-lime shadow-brutal-sm">
            <CheckIcon weight="bold" size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Hotovo / Správa je pripravená</p>
            <h3 className="mt-1 font-display text-display-xs font-extrabold uppercase leading-[0.95] tracking-tight">
              Pošli mi to.
            </h3>
          </div>
        </div>
        <pre className="mt-6 max-w-full break-words whitespace-pre-wrap [overflow-wrap:anywhere] rounded-lg border-3 border-ink bg-paper p-4 font-sans text-base leading-relaxed">
          {payload}
        </pre>
        <p className="mt-4 text-lg">WhatsApp alebo e-mail sa otvorí s pripravenou správou. Odoslanie zostáva na tebe.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <a href={whatsappUrl(payload)} target="_blank" rel="noreferrer" className={`${BTN_LIME} w-full`}>
            Otvoriť WhatsApp
            <ChatCircleDotsIcon weight="fill" aria-hidden="true" />
          </a>
          <a href={mailtoUrl(payload)} className={`${BTN_WHITE} w-full`}>
            Poslať e-mail
            <EnvelopeSimpleIcon weight="bold" aria-hidden="true" />
          </a>
          <button type="button" className={`${BTN_WHITE} w-full`} onClick={copy}>
            Kopírovať
            <CopyIcon weight="bold" aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold underline decoration-[3px] underline-offset-4 hover:decoration-hot"
        >
          <ArrowCounterClockwiseIcon weight="bold" size={20} aria-hidden="true" />
          Upraviť odpovede
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="brutal w-full min-w-0 p-5 sm:p-8" aria-describedby="intake-uvod">
      {(zdroj || zKvizu.length > 0) && (
        <div className="mb-6 flex flex-col gap-4 rounded-lg border-3 border-ink bg-yellow p-4 shadow-brutal-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {zdroj && <span className="sticker mb-3 bg-hot text-ink [--sticker-rotate:-3deg]">{zdroj}</span>}
            {zKvizu.length > 0 && (
              <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
                {zKvizu.map((item) => (
                  <div key={item.k} className="contents">
                    <dt className="eyebrow text-ink/70">{item.k}</dt>
                    <dd className="break-words font-bold [overflow-wrap:anywhere]">{item.v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <p className="text-sm text-ink/70 sm:max-w-56 sm:text-right">Toto ide do správy automaticky. Nižšie doplň úlohu.</p>
        </div>
      )}

      <p id="intake-uvod" className="text-lg">
        Šesť polí, žiadna registrácia. Na konci sa otvorí WhatsApp alebo e-mail s hotovou správou.
      </p>

      <div className="mt-7 grid gap-6">
        <Field id="intake-kto" label="Kto si">
          <NativeSelect id="intake-kto" value={data.kto} onChange={(e) => set('kto')(e.target.value as KtoValue | '')}>
            <option value="">Vyber…</option>
            {KTO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
          {data.kto === 'ine' && (
            <div className="mt-2 grid gap-2">
              <label htmlFor="intake-kto-ine" className="eyebrow">
                Upresni
              </label>
              <input
                type="text"
                className={INPUT}
                id="intake-kto-ine"
                value={data.ktoIne}
                onChange={(e) => set('ktoIne')(e.target.value)}
                placeholder="Čím sa zaoberáš"
                maxLength={120}
              />
            </div>
          )}
        </Field>

        <Field
          id="intake-uloha"
          label="Jedna úloha"
          hint="Konkrétny príklad bez citlivých údajov. Stačí anonymizovaný alebo vymyslený."
        >
          <textarea
            className={TEXTAREA}
            id="intake-uloha"
            value={data.uloha}
            onChange={(e) => {
              set('uloha')(e.target.value);
              if (ulohaError && e.target.value.trim()) setUlohaError(false);
            }}
            required
            aria-required="true"
            aria-invalid={ulohaError || undefined}
            aria-describedby={ulohaError ? 'intake-uloha-chyba intake-uloha-hint' : 'intake-uloha-hint'}
            placeholder="Po každom hovore s klientom prepisujem poznámky do ponuky…"
            maxLength={1500}
          />
          {ulohaError && (
            <p id="intake-uloha-chyba" role="alert" className="border-l-[6px] border-hot pl-3 font-bold text-ink">
              Bez úlohy sa nemáme na čo pozrieť. Napíš aspoň jednu vetu.
            </p>
          )}
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="intake-casto" label="Ako často ju robíš">
            <NativeSelect id="intake-casto" value={data.casto} onChange={(e) => set('casto')(e.target.value as CastoValue | '')}>
              <option value="">Vyber…</option>
              {CASTO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>

          <Field id="intake-nastroje" label="V čom dnes pracuješ">
            <input
              type="text"
              className={INPUT}
              id="intake-nastroje"
              value={data.nastroje}
              onChange={(e) => set('nastroje')(e.target.value)}
              placeholder="E-mail, tabuľky, CRM, poznámky…"
              maxLength={200}
            />
          </Field>
        </div>

        <Field id="intake-dolezite" label="Čo je pri výsledku dôležité">
          <textarea
            className={`${TEXTAREA} min-h-24`}
            id="intake-dolezite"
            value={data.dolezite}
            onChange={(e) => set('dolezite')(e.target.value)}
            placeholder="Čo musí zostať správne, kto výsledok skontroluje, kde sa použije."
            maxLength={800}
          />
        </Field>

        <Field id="intake-kontakt" label="Kontakt" optional hint="Telefón alebo e-mail, ak chceš, aby som sa ozval ja.">
          <input
            type="text"
            className={INPUT}
            id="intake-kontakt"
            value={data.kontakt}
            onChange={(e) => set('kontakt')(e.target.value)}
            placeholder="+421 … alebo meno@domena.sk"
            aria-describedby="intake-kontakt-hint"
            autoComplete="on"
            maxLength={120}
          />
        </Field>
      </div>

      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className={`${BTN_HOT} w-full sm:w-auto`}>
          Pripraviť správu
          <ArrowRightIcon weight="bold" aria-hidden="true" />
        </button>
        <p className="text-sm text-ink/70">Nič sa neodosiela samo. Správa sa otvorí u teba.</p>
      </div>
    </form>
  );
}
