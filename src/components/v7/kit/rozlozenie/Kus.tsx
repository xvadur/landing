/** Kit · Rozloženie — spoločný rám jednej ukážky: meno kusu (Geist Mono), jedna veta, mriežka variantov. */
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Kus({
  id,
  meno,
  veta,
  subor,
  children,
  className,
}: {
  id: string;
  meno: string;
  veta: string;
  subor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={cn('scroll-mt-24 border-t-3 border-ink py-12 sm:py-16', className)}>
      <header className="mb-8 flex flex-col gap-2">
        <h2 id={`${id}-h`} className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
          {meno}
        </h2>
        <p className="max-w-3xl text-lg">{veta}</p>
        <p className="font-mono text-xs text-ink/60">src/components/ui/{subor}</p>
      </header>
      <div className="flex flex-col gap-10">{children}</div>
    </section>
  );
}

/** Jedna bunka mriežky variantov: štítok (props) + ukážka. */
export function Variant({ props, children, className }: { props: string; children: React.ReactNode; className?: string }) {
  return (
    <figure className={cn('flex min-w-0 flex-col gap-3', className)}>
      <figcaption className="font-mono text-xs font-bold break-words text-ink/70">{props}</figcaption>
      <div className="min-w-0">{children}</div>
    </figure>
  );
}

export function Mriezka({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-[minmax(0,1fr)] gap-8 sm:grid-cols-2 lg:grid-cols-3', className)}>{children}</div>;
}

export function Podnadpis({ children }: { children: React.ReactNode }) {
  return <h3 className="eyebrow font-mono text-sm font-bold uppercase tracking-[0.16em] text-ink/70">{children}</h3>;
}

/** Badge pre zastávky bez textu. Nie hover posun (badge nie je tlačidlo). */
export function DoplniAdam({ className }: { className?: string }) {
  return (
    <Badge variant="warning" className={cn('shadow-none hover:translate-x-0 hover:translate-y-0', className)}>
      text doplní Adam
    </Badge>
  );
}

export function Ukazkove() {
  return (
    <Badge variant="outline" className="shadow-none hover:translate-x-0 hover:translate-y-0">
      ukážkové dáta
    </Badge>
  );
}
