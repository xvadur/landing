/** Kit · Prekrytia: sonner.tsx — všetky typy hlásení (default, message, success, info, warning, error, loading,
 *  promise, custom, action + cancel, description, closeButton, invert, duration Infinity, dismiss) a všetkých šesť
 *  pozícií (position na jednom hlásení). Toaster je v KitToaster (id „kit“), hlásenia idú s toasterId. */
import * as React from 'react';
import { toast, type ExternalToast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ZIVE_CISLA, ZIVE_CISLA_SNIMKA } from '@/data/fakty';
import { Blok, KIT_TOASTER, Kus, Stav } from './spolocne';

type Poz = NonNullable<ExternalToast['position']>;
const POZICIE: Poz[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
const streak = ZIVE_CISLA.find((z) => z.kluc === 'streak_days')!;

export default function Hlasenia() {
  const [posledne, setPosledne] = React.useState<string>('—');
  const ciel = KIT_TOASTER;
  const k = (o: ExternalToast = {}): ExternalToast => ({ toasterId: ciel, ...o });
  const spusti = (meno: string, f: () => void) => () => {
    setPosledne(meno);
    f();
  };

  const TYPY: { meno: string; f: () => void; data?: string }[] = [
    { meno: 'toast()', f: () => toast('Termín rezervovaný', k({ description: 'Štvrtok 16:00 · 30 minút (ukážka)' })), data: 'toast' },
    { meno: 'toast.message', f: () => toast.message('Nový text na webe', k({ description: 'Texty · Substack' })) },
    { meno: 'toast.success', f: () => toast.success('Nula fráz. Text je tvoj.', k()), data: 'toast-success' },
    { meno: 'toast.info', f: () => toast.info(`${streak.value} ${streak.label}`, k({ description: `Korpus, snímka ${ZIVE_CISLA_SNIMKA}` })) },
    { meno: 'toast.warning', f: () => toast.warning('Termín je o menej ako 24 hodín', k({ description: 'Vyber neskorší (ukážka).' })) },
    { meno: 'toast.error', f: () => toast.error('Rezervácia zlyhala', k({ description: 'Termín medzitým obsadil niekto iný.' })), data: 'toast-error' },
    { meno: 'toast.loading', f: () => { const id = toast.loading('Škrtám frázy…', k()); window.setTimeout(() => toast.success('Hotovo', k({ id })), 1600); } },
    {
      meno: 'toast.promise',
      f: () => {
        toast.promise(new Promise<string>((r) => window.setTimeout(() => r('štvrtok 16:00'), 1400)), {
          loading: 'Hľadám voľný termín…',
          success: (t) => `Voľný termín: ${t} (ukážka)`,
          error: 'Nič voľné',
          toasterId: ciel,
        });
      },
    },
    {
      meno: 'action + cancel',
      f: () =>
        toast('Termín zrušený', k({
          description: 'Vrátiť späť do 5 s.',
          action: { label: 'Vrátiť', onClick: () => toast.success('Vrátené', k()) },
          cancel: { label: 'OK', onClick: () => undefined },
        })),
      data: 'toast-action',
    },
    { meno: 'closeButton', f: () => toast('Hlásenie s krížikom', k({ closeButton: true })) },
    { meno: 'invert', f: () => toast('Invertované farby', k({ invert: true, description: 'invert: true' })) },
    { meno: 'duration: Infinity', f: () => toast('Visí, kým ho nezavrieš', k({ duration: Infinity, closeButton: true })) },
    {
      meno: 'toast.custom',
      f: () =>
        toast.custom(
          (id) => (
            <div className="flex w-[min(92vw,356px)] items-center gap-3 rounded-lg border-3 border-ink bg-yellow p-4 shadow-brutal">
              <span className="font-display text-3xl font-extrabold">✚</span>
              <div className="flex-1">
                <p className="font-display font-extrabold uppercase">Vlastné JSX</p>
                <p className="text-sm">Celý obsah je tvoj, sonner dá iba pozíciu a animáciu.</p>
              </div>
              <button type="button" className="min-h-11 border-2 border-ink bg-white px-3 font-bold" onClick={() => toast.dismiss(id)}>
                OK
              </button>
            </div>
          ),
          k(),
        ),
    },
  ];

  return (
    <Kus
      id="sonner"
      meno="sonner"
      subor="src/components/ui/sonner.tsx"
      veta="Hlásenie v rohu, ktoré samo zmizne: potvrdenie rezervácie, výsledok hry, chyba. Nezastaví prácu na stránke."
    >
      <Blok
        nazov="Typy a voľby"
        pozn="BoldKit sonner.tsx: unstyled + tokeny (štýl sa naozaj prejaví), bez ThemeProvider. success = žltá, warning = biela s alarmovým okrajom, error = stamp."
      >
        <div className="mb-3 flex flex-wrap items-center gap-4">
          <Stav>zatvorené</Stav>
          <span className="font-mono text-sm">posledné: {posledne}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TYPY.map((t) => (
            <Button key={t.meno} variant="outline" className="h-auto min-h-11 whitespace-normal font-mono normal-case" onClick={spusti(t.meno, t.f)} data-open={t.data}>
              {t.meno}
            </Button>
          ))}
          <Button variant="secondary" className="min-h-11" onClick={spusti('toast.dismiss()', () => toast.dismiss())}>
            Zavrieť všetky
          </Button>
        </div>
      </Blok>

      <Blok nazov="Pozície · position na hlásení" pozn="Jeden Toaster, šesť pozícií. Na mobile (pod 600 px) sonner všetky roztiahne na šírku.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {POZICIE.map((p) => (
            <Button
              key={p}
              variant="outline"
              className="min-h-11 font-mono normal-case"
              data-open={`toast-${p}`}
              onClick={spusti(p, () => toast(`Pozícia ${p}`, k({ position: p, description: 'Vyšetrenie · 30 minút' })))}
            >
              {p}
            </Button>
          ))}
        </div>
      </Blok>
    </Kus>
  );
}
