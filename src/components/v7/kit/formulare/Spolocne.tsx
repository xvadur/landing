/** Kit · Formuláre (V7 katalóg, 29. 9. 2026): spoločné rámy sekcií, toaster katalógu a drobné háčiky.
 *  Iba pre /kit/formulare/ (noindex). Farby len z tokenov. */
import { useEffect, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

/** Vlastný toaster katalógu. Sonner 2 filtruje podľa `toasterId`, takže site Toaster (bez id) tieto hlásenia neukáže. */
export const TOASTER = 'kit-formulare';

/** Toaster katalógu: BoldKit sonner.tsx tak, ako je (unstyled + tokeny, bez ThemeProvider). Lenis prepúšťa koliesko
 *  portálom (popover, select, combobox, time-picker) sám — site/Smooth.tsx (prevent). */
export function KitToaster() {
  return <Toaster id={TOASTER} position="bottom-center" />;
}

/** Dátumové ukážky sa vykreslia až v prehliadači: statické HTML by malo „dnes“ z času buildu a hydratácia by nesedela. */
export function useKlient() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}

export function Kus({
  id,
  meno,
  veta,
  subor,
  pozor,
  children,
}: {
  id: string;
  meno: string;
  veta: string;
  subor?: string;
  pozor?: string[];
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="flex scroll-mt-24 flex-col gap-6 border-t-3 border-ink pt-10">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 id={`${id}-h`} className="font-mono text-2xl font-bold tracking-tight">
            {meno}
          </h2>
          <code className="font-mono text-xs break-all text-muted-foreground">src/components/ui/{subor ?? meno}.tsx</code>
        </div>
        <p className="max-w-2xl text-lg leading-snug">{veta}</p>
        {pozor && pozor.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-1" aria-label="Problémy kusu">
            {pozor.map((p) => (
              <li key={p}>
                <Badge variant="destructive" className="normal-case tracking-normal">
                  {p}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </header>
      {children}
    </section>
  );
}

export function Mriezka({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>{children}</div>;
}

export function Bunka({
  nazov,
  children,
  className,
  stlpec = false,
}: {
  nazov: string;
  children: ReactNode;
  className?: string;
  stlpec?: boolean;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-3 rounded-lg border-3 border-ink bg-white p-4', className)}>
      <p className="font-mono text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">{nazov}</p>
      <div className={cn('flex min-w-0 gap-4', stlpec ? 'flex-col items-stretch' : 'flex-wrap items-center')}>{children}</div>
    </div>
  );
}

/** Reálna kombinácia s Adamovým obsahom. */
export function Recept({ nazov, children, badge }: { nazov: string; children: ReactNode; badge?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-lg border-3 border-ink bg-yellow p-4 shadow-brutal sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-mono text-xs font-bold tracking-[0.12em] uppercase">S tvojím obsahom · {nazov}</p>
        {badge && <Badge variant="outline">{badge}</Badge>}
      </div>
      {children}
    </div>
  );
}

/** Riadok so stavom (čo ukážka práve drží). */
export function Stav({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-xs break-words text-muted-foreground" aria-live="polite">
      {children}
    </p>
  );
}
