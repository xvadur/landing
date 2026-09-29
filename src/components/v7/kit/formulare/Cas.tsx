/** Kit · Formuláre: calendar, date-picker, date-range-picker, time-picker. Vykreslí sa až v prehliadači (useKlient),
 *  lebo „dnes“ v statickom HTML by bol čas buildu. */
import { useMemo, useState } from 'react';
import { addDays, format, startOfMonth, startOfWeek, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { sk } from 'react-day-picker/locale';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRangePicker, type DateRangePickerPreset } from '@/components/ui/date-range-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Button } from '@/components/ui/button';
import { vsetkyTerminy, TERMINY } from '@/data/terminy';
import { Bunka, KAL_OPRAVA, Kus, Mriezka, Recept, Stav, useKlient } from './Spolocne';


const kluc = (d: Date) => format(d, 'yyyy-MM-dd');
const zKluca = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const casBratislava = (iso: string) =>
  new Intl.DateTimeFormat('sk-SK', { hour: '2-digit', minute: '2-digit', timeZone: TERMINY.zona }).format(new Date(iso));
const hhmm = (d?: Date) => (d ? format(d, 'HH:mm') : '—');
const naCas = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

/** captionLayout="dropdown": BoldKit nemá štýly pre dropdowns a rdp style.css sa nenačítava → natívny select je
 *  vidno vedľa popisu. Oprava: select neviditeľne cez popis, popis ako tlačidlo. */
const DROPDOWN_OPRAVA = {
  month_caption: 'flex justify-center items-center pt-1 relative px-10',
  dropdowns: 'flex items-center gap-2',
  dropdown_root: 'relative inline-flex min-h-9 items-center border-2 border-foreground bg-background px-2',
  dropdown: 'absolute inset-0 w-full cursor-pointer opacity-0',
  caption_label: 'flex items-center gap-1 text-sm font-bold uppercase tracking-wide',
};

/** Calendar mapuje Chevron iba na vľavo / vpravo; dropdown pýta „down“ a dostane šípku doprava. */
function Sipka({ orientation, className }: { orientation?: 'up' | 'down' | 'left' | 'right'; className?: string }) {
  const Ikona = orientation === 'left' ? ChevronLeft : orientation === 'right' ? ChevronRight : orientation === 'up' ? ChevronUp : ChevronDown;
  return <Ikona className={cn('h-4 w-4 stroke-[3]', className)} />;
}

function Kostra() {
  return <div className="h-72 animate-pulse rounded-lg border-3 border-ink/30 bg-white motion-reduce:animate-none" aria-busy="true" />;
}

export default function Cas() {
  const klient = useKlient();
  return (
    <div className="flex flex-col gap-16">
      <Kus
        id="calendar"
        meno="calendar"
        veta="Mesačný kalendár (react-day-picker 9): single, multiple, range, viac mesiacov, locale, zakázané dni, čísla týždňov, rozbaľovací mesiac, pätička, modifikátory."
        pozor={[
          'today a range_middle = bg-accent (hot) s paper textom → classNames oprava',
          'bez locale je po anglicky a týždeň začína nedeľou',
          'deň 36 px < 44 px cieľ',
          'captionLayout="dropdown" nemá štýly',
        ]}
      >
        {klient ? <KalendarUkazky /> : <Kostra />}
      </Kus>
      <Kus
        id="date-picker"
        meno="date-picker"
        veta="Tlačidlo, ktoré otvorí kalendár v popoveri. Controlled aj uncontrolled, formát popisu cez date-fns."
        pozor={[
          'neprepúšťa props kalendára: nedá sa dať locale, disabled dni ani weekStartsOn',
          'predvolený text „Pick a date“ a formát „LLL dd, y“ po anglicky',
          'šírka 260 px natvrdo (prepíš className)',
        ]}
      >
        {klient ? <DatePickerUkazky /> : <Kostra />}
      </Kus>
      <Kus
        id="date-range-picker"
        meno="date-range-picker"
        veta="Výber rozsahu s predvoľbami vľavo; na mobile (< 640 px) jeden mesiac a predvoľby hore. minDate / maxDate, vlastné predvoľby."
        pozor={[
          'nadpis „Presets“ a predvolené predvoľby po anglicky',
          'range_middle aj vybraná predvoľba = hot (nedá sa prepísať zvonka)',
          'popis rozsahu vždy „LLL dd, y“',
        ]}
      >
        {klient ? <RozsahUkazky /> : <Kostra />}
      </Kus>
      <Kus
        id="time-picker"
        meno="time-picker"
        veta="Výber času v stĺpcoch: 12h / 24h, krok minút 1–30, sekundy, minTime / maxTime (zakázané hodnoty sú disabled)."
        pozor={[
          'hlavičky „Hour / Min / Sec / Period“ po anglicky',
          'prvý klik na hodinu zdedí aktuálne minúty (napr. 14:37 pri kroku 30)',
          'mimo minTime/maxTime klik ticho nič neurobí',
          'riadky ~30 px < 44 px cieľ',
        ]}
      >
        {klient ? <CasUkazky /> : <Kostra />}
      </Kus>
    </div>
  );
}

function KalendarUkazky() {
  const dnes = new Date();
  const [jeden, setJeden] = useState<Date | undefined>(addDays(dnes, 2));
  const [viac, setViac] = useState<Date[] | undefined>([dnes, addDays(dnes, 3)]);
  const [rozsah, setRozsah] = useState<DateRange | undefined>({ from: dnes, to: addDays(dnes, 9) });
  const dni = useMemo(() => vsetkyTerminy(), []);
  const volne = useMemo(() => dni.map((d) => zKluca(d.datum)), [dni]);
  const [ordinacia, setOrdinacia] = useState<Date | undefined>(volne[0]);
  const sloty = dni.find((d) => ordinacia && d.datum === kluc(ordinacia))?.sloty ?? [];

  return (
    <>
      <Mriezka>
        <Bunka nazov="surový: bez locale, today = hot">
          <Calendar mode="single" />
        </Bunka>
        <Bunka nazov="single · locale sk · oprava today">
          <Calendar mode="single" selected={jeden} onSelect={setJeden} locale={sk} classNames={KAL_OPRAVA} />
        </Bunka>
        <Bunka nazov='mode="multiple" · showOutsideDays={false}'>
          <Calendar mode="multiple" selected={viac} onSelect={setViac} locale={sk} showOutsideDays={false} classNames={KAL_OPRAVA} />
        </Bunka>
        <Bunka nazov='mode="range" · numberOfMonths={2}' className="sm:col-span-2">
          <div className="-mx-1 w-full overflow-x-auto px-1 pb-2" data-lenis-prevent>
            <Calendar mode="range" selected={rozsah} onSelect={setRozsah} numberOfMonths={2} locale={sk} classNames={KAL_OPRAVA} className="w-max" />
          </div>
        </Bunka>
        <Bunka nazov="disabled víkendy + minulosť · showWeekNumber">
          <Calendar
            mode="single"
            locale={sk}
            showWeekNumber
            disabled={[{ dayOfWeek: [0, 6] }, { before: dnes }]}
            classNames={{ ...KAL_OPRAVA, week_number: 'w-9 text-center font-mono text-xs text-muted-foreground', week_number_header: 'w-9' }}
          />
        </Bunka>
        <Bunka nazov='captionLayout="dropdown" · surový'>
          <Calendar mode="single" locale={sk} captionLayout="dropdown" startMonth={new Date(2025, 0)} endMonth={new Date(2026, 11)} defaultMonth={new Date(2025, 0)} classNames={KAL_OPRAVA} />
        </Bunka>
        <Bunka nazov="dropdown opravený (classNames + Chevron) · footer">
          <Calendar
            mode="single"
            locale={sk}
            captionLayout="dropdown"
            startMonth={new Date(2025, 0)}
            endMonth={new Date(2026, 11)}
            defaultMonth={new Date(2025, 0)}
            footer={<p className="pt-2 text-xs font-bold">Január 2025: začiatok s AI.</p>}
            classNames={{ ...KAL_OPRAVA, ...DROPDOWN_OPRAVA }}
            components={{ Chevron: Sipka }}
          />
        </Bunka>
      </Mriezka>
      <Recept nazov="ordinačné dni (vsetkyTerminy z src/data/terminy.ts)">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <Calendar
            mode="single"
            locale={sk}
            selected={ordinacia}
            onSelect={setOrdinacia}
            startMonth={dnes}
            endMonth={addDays(dnes, TERMINY.dopreduDni)}
            disabled={(d) => !dni.some((x) => x.datum === kluc(d))}
            modifiers={{ volne }}
            modifiersClassNames={{ volne: 'font-bold [&>button]:underline [&>button]:decoration-2 [&>button]:underline-offset-4' }}
            classNames={KAL_OPRAVA}
            className="self-start bg-white"
          />
          <div className="flex min-w-0 flex-col gap-3">
            <p className="font-bold">Po–Pi, 14:00–19:00, najskôr o 24 hodín, najďalej 14 dní dopredu.</p>
            <p className="font-mono text-sm">Podčiarknuté dni majú voľný termín. Ostatné sú zakázané.</p>
            {ordinacia && (
              <p className="font-display text-2xl font-extrabold uppercase">
                {new Intl.DateTimeFormat('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }).format(ordinacia)}
              </p>
            )}
            <ul className="flex flex-wrap gap-2" aria-label="Časy">
              {sloty.map((s) => (
                <li key={s} className="rounded-lg border-3 border-ink bg-white px-3 py-2 font-mono font-bold">
                  {casBratislava(s)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Recept>
    </>
  );
}

function DatePickerUkazky() {
  const [d, setD] = useState<Date | undefined>();
  return (
    <>
      <Mriezka>
        <Bunka nazov="surový (predvolené texty)">
          <DatePicker />
        </Bunka>
        <Bunka nazov='placeholder · dateFormat "d. M. yyyy"'>
          <DatePicker placeholder="Vyber deň" dateFormat="d. M. yyyy" className="w-full max-w-[260px]" />
        </Bunka>
        <Bunka nazov="defaultValue (uncontrolled)">
          <DatePicker defaultValue={addDays(new Date(), 1)} dateFormat="EEEE d. M." className="w-full max-w-[260px]" />
        </Bunka>
        <Bunka nazov="controlled + zmazať">
          <DatePicker value={d} onChange={setD} placeholder="Nič" dateFormat="d. M. yyyy" className="w-full max-w-[260px]" />
          <Button variant="ghost" onClick={() => setD(undefined)} disabled={!d}>
            Zmazať
          </Button>
          <Stav>value = {d ? kluc(d) : 'undefined'}</Stav>
        </Bunka>
        <Bunka nazov="disabled">
          <DatePicker disabled placeholder="Vypnuté" className="w-full max-w-[260px]" />
        </Bunka>
        <Bunka nazov="variant a size tlačidla prechádzajú">
          <DatePicker variant="secondary" size="lg" placeholder="Žlté, lg" className="w-full max-w-[260px]" />
        </Bunka>
      </Mriezka>
    </>
  );
}

function RozsahUkazky() {
  const dnes = new Date();
  const [r, setR] = useState<DateRange | undefined>();
  const predvolby: DateRangePickerPreset[] = [
    { label: 'Tento týždeň', value: { from: startOfWeek(dnes, { weekStartsOn: 1 }), to: dnes } },
    { label: 'Posledných 14 dní', value: { from: subDays(dnes, 13), to: dnes } },
    { label: 'Tento mesiac', value: { from: startOfMonth(dnes), to: dnes } },
    { label: 'Od januára 2025', value: { from: new Date(2025, 0, 1), to: dnes } },
  ];
  return (
    <>
      <Mriezka>
        <Bunka nazov="surový (predvoľby EN, 2 mesiace)" stlpec>
          <DateRangePicker />
        </Bunka>
        <Bunka nazov="vlastné predvoľby · placeholder" stlpec>
          <DateRangePicker presets={predvolby} placeholder="Obdobie Korpusu" value={r} onChange={setR} />
          <Stav>
            from = {r?.from ? kluc(r.from) : '—'} · to = {r?.to ? kluc(r.to) : '—'}
          </Stav>
        </Bunka>
        <Bunka nazov="showPresets={false} · numberOfMonths={1}" stlpec>
          <DateRangePicker showPresets={false} numberOfMonths={1} placeholder="Bez predvolieb" />
        </Bunka>
        <Bunka nazov="minDate dnes · maxDate +14 dní · align end" stlpec>
          <DateRangePicker minDate={subDays(dnes, 1)} maxDate={addDays(dnes, 14)} showPresets={false} align="end" placeholder="Najbližšie dva týždne" />
        </Bunka>
        <Bunka nazov="disabled" stlpec>
          <DateRangePicker disabled placeholder="Vypnuté" />
        </Bunka>
      </Mriezka>
    </>
  );
}

function CasUkazky() {
  const [t, setT] = useState<Date | undefined>();
  const [volanie, setVolanie] = useState<Date | undefined>(naCas(16));
  return (
    <>
      <Mriezka>
        <Bunka nazov='format="12h" (predvolené)'>
          <TimePicker />
        </Bunka>
        <Bunka nazov='format="24h"'>
          <TimePicker format="24h" placeholder="Vyber čas" value={t} onChange={setT} />
          <Stav>value = {hhmm(t)}</Stav>
        </Bunka>
        <Bunka nazov="minuteStep={15}">
          <TimePicker format="24h" minuteStep={15} defaultValue={naCas(14, 45)} />
        </Bunka>
        <Bunka nazov="showSeconds">
          <TimePicker format="24h" showSeconds defaultValue={naCas(18, 30)} className="w-[200px]" />
        </Bunka>
        <Bunka nazov="minTime 14:00 · maxTime 19:00 · krok 30">
          <TimePicker format="24h" minuteStep={30} minTime={naCas(14)} maxTime={naCas(19)} defaultValue={naCas(14)} />
        </Bunka>
        <Bunka nazov="disabled">
          <TimePicker disabled placeholder="Vypnuté" />
        </Bunka>
      </Mriezka>
      <Recept nazov="spätné zavolanie v ordinačných hodinách">
        <p className="font-bold">Kedy ti mám zavolať?</p>
        <TimePicker
          format="24h"
          minuteStep={30}
          minTime={naCas(14)}
          maxTime={naCas(19)}
          value={volanie}
          onChange={(d) => {
            // obchádzka: prvý klik na hodinu zdedí aktuálne minúty; zarovnáme na krok 30
            if (d && d.getMinutes() % 30 !== 0) d.setMinutes(0, 0, 0);
            setVolanie(d);
          }}
          placeholder="Vyber čas"
          size="lg"
          className="w-full max-w-[220px] bg-white"
        />
        <Stav>value = {hhmm(volanie)} · zarovnané na :00 / :30</Stav>
      </Recept>
    </>
  );
}
