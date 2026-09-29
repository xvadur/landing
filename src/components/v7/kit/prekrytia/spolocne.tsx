/** Kit · Prekrytia — spoločné kúsky: rám sekcie kusu, mriežka variantov, hook na malé okno a dáta z Adamovho obsahu.
 *  Čísla iba zo src/data/fakty.ts a public/pulse.json (cez ZIVE_CISLA = tá istá snímka). */
import * as React from 'react';
import { DOKAZY, POSTAVIL, KORPUS, KOTVY, ZIVE_CISLA, ZIVE_CISLA_SNIMKA, type Dokaz } from '@/data/fakty';
import { cn } from '@/lib/utils';

/** Toaster tohto katalógu má id „kit“, aby hlásenia nešli aj do site Toastera z Base (ten nemá id). */
export const KIT_TOASTER = 'kit';
/** Druhý Toaster: BoldKit sonner.tsx bez opravy (vľavo dole), na porovnanie. */
export const KIT_TOASTER_BOLDKIT = 'kit-boldkit';

/** Rám jedného kusu: meno (Geist Mono), jedna veta, deti = mriežka variantov a reálna kombinácia. */
export function Kus({
  id,
  meno,
  veta,
  subor,
  children,
}: {
  id: string;
  meno: string;
  veta: string;
  subor: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t-3 border-ink py-12 sm:py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={`${id}-h`} className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
          {meno}
        </h2>
        <code className="font-mono text-xs text-ink/60">{subor}</code>
      </div>
      <p className="mt-3 max-w-2xl text-lg">{veta}</p>
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </section>
  );
}

/** Blok variantov s popisom (eyebrow) a voliteľnou poznámkou. */
export function Blok({
  nazov,
  pozn,
  className,
  children,
}: {
  nazov: string;
  pozn?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-lg border-3 border-ink bg-white p-4 sm:p-6', className)}>
      <p className="eyebrow">{nazov}</p>
      {pozn && <p className="mt-1 text-sm text-ink/70">{pozn}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** Štítok stavu „zatvorené / otvorené“ pri ukážke. */
export function Stav({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm border-2 border-ink bg-paper px-1.5 font-mono text-[11px] font-bold uppercase tracking-wider">
      {children}
    </span>
  );
}

/** true pod 640 px — sheet ide zdola namiesto sprava, drawer namiesto dialógu. */
export function useMaloOkno(query = '(max-width: 639px)') {
  const [malo, setMalo] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMalo(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return malo;
}

/** Menu položky BoldKitu majú focus:bg-accent (= hot, text paper). Hot patrí iba CTA a X → prebíjame na žltú s ink. */
export const POLOZKA = 'min-h-11 cursor-pointer text-base focus:bg-yellow focus:text-ink data-[state=open]:bg-yellow';

/* ---------------- dáta ---------------- */

export type Hra = { id: string; cislo: string; nazov: string; text: string | null; href: string | null };

export const HRY: Hra[] = [
  {
    id: 'skrtaci-test',
    cislo: '01',
    nazov: 'Škrtací test',
    text: `Vlož svoj text. Škrtneme frázy, ktoré má každý. ${KOTVY.kancelarieSFrazou.value} zo ${KOTVY.kancelarieSFrazou.z} kancelárií má v texte aspoň jednu zo šiestich fráz.`,
    href: '/hry/skrtaci-test/',
  },
  { id: 'miliarda-bilion', cislo: '02', nazov: 'Miliarda → bilión', text: null, href: null },
  { id: 'strach-o-meter', cislo: '03', nazov: 'Strach-o-meter', text: null, href: null },
];

/** Projekty pre sheet s detailom: izba dôkazov + fakty z POSTAVIL (ak existujú). */
export type ProjektDetail = Dokaz & { fakty: { label: string; value: string; note: string }[] };

export const PROJEKTY: ProjektDetail[] = ['hriech', 'netopier', 'korpus', 'system-pre-maklera', 'terapeutka', 'senior-atlas'].map(
  (id) => {
    const d = DOKAZY.find((x) => x.id === id)!;
    const p = POSTAVIL.find((x) => x.id === id);
    let fakty: { label: string; value: string; note: string }[] = p?.fakty ?? [];
    if (id === 'korpus')
      fakty = [
        { label: 'Vlastné slová', value: KORPUS.slova, note: `od ${KORPUS.od}` },
        { label: 'Prompty', value: KORPUS.prompty, note: `k ${KORPUS.kDatumu}` },
      ];
    return { ...d, fakty };
  },
);

export const STAV_TEXT: Record<Dokaz['stav'], string> = { zive: 'živé', interne: 'interné', coskoro: 'čoskoro' };

export { ZIVE_CISLA, ZIVE_CISLA_SNIMKA, KORPUS };
