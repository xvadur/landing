import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'radix-ui';
import { toast } from 'sonner';
import { ArrowRightIcon, ChatCircleDotsIcon, CheckIcon, CopyIcon, EnvelopeSimpleIcon, XIcon } from '@phosphor-icons/react';

/** Konzultačný wizard — port z legacy/src/App.jsx (kroky, texty a payload ostávajú verbatim), nové tokeny.
 *  4 otázky → WhatsApp wa.me/?text= payload · mailto:adam@xvadur.com · kopírovanie so sonner toastom.
 *  Ostrov: <Wizard client:idle label="ZAČAŤ CEZ 4 OTÁZKY" />  (vykreslí tlačidlo + dialóg)
 *  Otvorenie odinakiaľ: klik na [data-wizard] alebo document.dispatchEvent(new CustomEvent('xvadur:wizard')). */

const wizardSteps = [
  {
    key: 'problem',
    eyebrow: '01 / ČO RIEŠIŠ',
    title: 'Kde ťa AI práve brzdí?',
    options: [
      'Web alebo digitálny produkt',
      'Automatizácia a workflow',
      'Obsah, výskum alebo médiá',
      'Dáta a vizualizácia',
      'Neviem to ešte pomenovať',
    ],
  },
  {
    key: 'state',
    eyebrow: '02 / KDE SI',
    title: 'V akom stave je problém?',
    options: [
      'Je to zatiaľ iba nápad',
      'Už niečo skúšam',
      'Mám nástroje, ale nefungujú spolu',
      'Potrebujem prerobiť existujúci systém',
    ],
  },
  {
    key: 'outcome',
    eyebrow: '03 / ČO POTREBUJEŠ',
    title: 'S čím chceš odísť?',
    options: ['Odporúčaný workflow', 'Výber stacku', 'Prototyp riešenia', 'Smer implementácie'],
  },
] as const;

type Key = (typeof wizardSteps)[number]['key'];
type Answers = Partial<Record<Key, string>>;

export const EMAIL = 'adam@xvadur.com';

export function buildPayload(answers: Answers, detail: string) {
  return [
    'Ahoj Adam, prichádzam z xvadur.com a chcem vyriešiť AI problém.',
    '',
    `Riešim: ${answers.problem || '—'}`,
    `Aktuálny stav: ${answers.state || '—'}`,
    `Chcem odísť s: ${answers.outcome || '—'}`,
    detail.trim() ? `Kontext: ${detail.trim()}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export function whatsappUrl(payload: string) {
  return `https://wa.me/?text=${encodeURIComponent(payload)}`;
}

export function mailtoUrl(payload: string) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent('AI problém — konzultácia')}&body=${encodeURIComponent(payload)}`;
}

const btn =
  'press inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border-3 border-ink px-5 font-display text-lg font-extrabold uppercase tracking-wide shadow-brutal';

export default function Wizard({
  label = 'ZAČAŤ CEZ 4 OTÁZKY',
  variant = 'hot',
  className = '',
}: {
  label?: string;
  variant?: 'hot' | 'yellow' | 'white';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [detail, setDetail] = useState('');

  useEffect(() => {
    const onEvent = () => setOpen(true);
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('[data-wizard]')) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('xvadur:wizard', onEvent);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('xvadur:wizard', onEvent);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const payload = useMemo(() => buildPayload(answers, detail), [answers, detail]);

  const isDetail = step === wizardSteps.length;
  const isSummary = step === wizardSteps.length + 1;
  const current = !isDetail && !isSummary ? wizardSteps[step] : null;

  const choose = (option: string) => {
    if (!current) return;
    setAnswers((existing) => ({ ...existing, [current.key]: option }));
    setStep((value) => value + 1);
  };
  const reset = () => {
    setStep(0);
    setAnswers({});
    setDetail('');
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      toast.success('Skopírované', { description: 'Správa je v schránke. Pošli ju, kam chceš.' });
    } catch {
      toast.error('Nepodarilo sa skopírovať', { description: 'Označ text a skopíruj ho ručne.' });
    }
  };

  const variantClass = { hot: 'bg-hot text-ink', yellow: 'bg-yellow text-ink', white: 'bg-white text-ink' }[variant];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={`${btn} ${variantClass} ${className}`}>
        <span>{label}</span>
        <ArrowRightIcon weight="bold" size={22} aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] grid place-items-end bg-overlay p-2 sm:place-items-center sm:p-5 overflow-y-auto">
          <Dialog.Content
            className="brutal w-[min(760px,100%)] max-h-[calc(100dvh-1rem)] overflow-y-auto shadow-brutal-xl outline-none sm:max-h-[calc(100dvh-2.5rem)]"
            data-lenis-prevent
          >
            <div className="flex items-center justify-between gap-4 border-b-3 border-ink bg-ink px-4 py-3 text-paper">
              <Dialog.Title className="eyebrow">AI problém / Konzultácia</Dialog.Title>
              <Dialog.Description className="sr-only">
                Štyri otázky. Na konci sa otvorí WhatsApp alebo e-mail s pripravenou správou.
              </Dialog.Description>
              <Dialog.Close
                className="flex h-11 w-11 items-center justify-center rounded-lg border-3 border-paper text-paper hover:bg-hot hover:text-ink"
                aria-label="Zavrieť"
              >
                <XIcon weight="bold" size={22} aria-hidden="true" />
              </Dialog.Close>
            </div>

            <div className="grid grid-cols-5 gap-1.5 px-4 pt-3" aria-label={`Krok ${Math.min(step + 1, 5)} z 5`}>
              {[0, 1, 2, 3, 4].map((item) => (
                <span
                  key={item}
                  className={`h-2.5 rounded-sm border-2 border-ink ${item <= step ? 'bg-hot' : 'bg-paper'}`}
                />
              ))}
            </div>

            {current && (
              <div className="p-5 sm:p-10">
                <p className="eyebrow">{current.eyebrow}</p>
                <h2 className="mt-3 font-display text-display-sm font-extrabold uppercase leading-[0.92] tracking-tight">
                  {current.title}
                </h2>
                <div className="mt-7 grid gap-3">
                  {current.options.map((option, i) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(option)}
                      style={{ ['--i' as string]: i }}
                      className="lift flex min-h-12 w-full items-center justify-between gap-4 rounded-lg border-3 border-ink bg-paper px-4 py-3 text-left font-bold shadow-brutal-sm hover:bg-yellow"
                    >
                      <span>{option}</span>
                      <ArrowRightIcon weight="bold" size={20} aria-hidden="true" />
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="mt-6 underline underline-offset-4">
                    Späť
                  </button>
                )}
              </div>
            )}

            {isDetail && (
              <div className="p-5 sm:p-10">
                <p className="eyebrow">04 / KONTEXT</p>
                <h2 className="mt-3 font-display text-display-sm font-extrabold uppercase leading-[0.92] tracking-tight">
                  Čo by som mal vedieť?
                </h2>
                <p className="mt-4 text-lg">Stačia dve vety. Nemusíš mať hotové zadanie ani poznať správne AI slová.</p>
                <label htmlFor="wizard-detail" className="sr-only">
                  Kontext
                </label>
                <textarea
                  id="wizard-detail"
                  autoFocus
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  placeholder="Napríklad: Každý týždeň ručne spracúvame desiatky dopytov..."
                  className="mt-5 block min-h-[150px] w-full resize-y rounded-lg border-3 border-ink bg-white p-4 shadow-brutal-sm"
                />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <button type="button" onClick={() => setStep(step - 1)} className="underline underline-offset-4">
                    Späť
                  </button>
                  <button type="button" onClick={() => setStep(step + 1)} className={`${btn} bg-yellow`}>
                    <span>POKRAČOVAŤ</span>
                    <ArrowRightIcon weight="bold" size={22} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {isSummary && (
              <div className="p-5 text-center sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-3 border-ink bg-lime shadow-brutal-sm">
                  <CheckIcon weight="bold" size={28} aria-hidden="true" />
                </div>
                <p className="eyebrow mt-4">05 / HOTOVO</p>
                <h2 className="mt-3 font-display text-display-sm font-extrabold uppercase leading-[0.92] tracking-tight">
                  Pošli mi to do WhatsAppu.
                </h2>
                <pre className="mt-6 whitespace-pre-wrap rounded-lg border-3 border-ink bg-paper p-4 text-left font-sans text-base leading-relaxed">
                  {payload}
                </pre>
                <p className="mt-4 text-lg">WhatsApp sa otvorí s pripravenou správou. Odoslanie zostáva na tebe.</p>
                <a
                  href={whatsappUrl(payload)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                  className={`${btn} mt-5 w-full bg-lime`}
                >
                  <span>OTVORIŤ WHATSAPP</span>
                  <ChatCircleDotsIcon weight="fill" size={24} aria-hidden="true" />
                </a>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <a href={mailtoUrl(payload)} className={`${btn} bg-white`}>
                    <span>Poslať e-mailom</span>
                    <EnvelopeSimpleIcon weight="bold" size={22} aria-hidden="true" />
                  </a>
                  <button type="button" onClick={copy} className={`${btn} bg-white`}>
                    <span>Skopírovať</span>
                    <CopyIcon weight="bold" size={22} aria-hidden="true" />
                  </button>
                </div>
                <button type="button" onClick={reset} className="mt-6 underline underline-offset-4">
                  Vyplniť znova
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
