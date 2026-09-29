/** V7-04 · dve StatCard v anamnéze (render na serveri, bez hydratácie): prax a Korpus celkom, čísla z fakty.ts. */
import { Cross, PenLine } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { KORPUS, MARQUEE_FAKTY } from '@/data/fakty';

export default function BioCisla() {
  const prax = MARQUEE_FAKTY.find((f) => f.label === 'Nemocnica')!;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <StatCard
        variant="compact"
        role="group"
        title="Prax"
        value={prax.value}
        colorScheme="destructive"
        change={prax.note}
        trend="neutral"
        comparison=""
        icon={<Cross aria-hidden="true" />}
      />
      <StatCard
        variant="compact"
        role="group"
        title="Slov v Korpuse"
        value={KORPUS.slova}
        colorScheme="secondary"
        change={`${KORPUS.prompty} promptov`}
        trend="neutral"
        comparison={`od ${KORPUS.od}`}
        icon={<PenLine aria-hidden="true" />}
      />
    </div>
  );
}
