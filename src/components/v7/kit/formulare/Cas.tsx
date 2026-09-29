/** Kit · Formuláre: calendar, date-picker, date-range-picker, time-picker. Vykreslí sa až v prehliadači (useKlient),
 *  lebo „dnes“ v statickom HTML by bol čas buildu. */
import { useMemo, useState } from 'react';
import { addDays, format, startOfMonth, startOfWeek, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { sk } from 'react-day-picker/locale';
import { Calendar } from '@/components/ui/calendar';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRangePicker, type DateRangePickerPreset } from '@/components/ui/date-range-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Button } from '@/components/ui/button';
import { vsetkyTerminy, TERMINY } from '@/data/terminy';
import { Bunka, Kus, Mriezka, Recept, Stav, useKlient } from './Spolocne';


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
      >
        {klient ? <KalendarUkazky /> : <Kostra />}
      </Kus>
      <Kus
        id="date-picker"
        meno="date-picker"
        veta="Tlačidlo, ktoré otvorí kalendár v popoveri. Controlled aj uncontrolled, formát popisu cez date-fns."
      >
        {klient ? <DatePickerUkazky /> : <Kostra />}
      </Kus>
      <Kus
        id="date-range-picker"
        meno="date-range-picker"
        veta="Výber rozsahu s predvoľbami vľavo; na mobile (< 640 px) jeden mesiac a predvoľby hore. minDate / maxDate, vlastné predvoľby."
      >
        {klient ? <RozsahUkazky /> : <Kostra />}
      </Kus>
      <Kus
        id="time-picker"
        meno="time-picker"
        veta="Výber času v stĺpcoch: 12h / 24h, krok minút 1–30, sekundy, minTime / maxTime (zakázané hodnoty sú disabled)."
        pozor={['mimo minTime/maxTime je hodina vypnutá, ale kombinácia s minútou môže ticho neprejsť']}
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
        <Bunka nazov="predvolený (sk, dnes žltý)">
          <Calendar mode="single" />
        </Bunka>
        <Bunka nazov="single · selected">
          <Calendar mode="single" selected={jeden} onSelect={setJeden} locale={sk} />
        </Bunka>
        <Bunka nazov='mode="multiple" · showOutsideDays={false}'>
          <Calendar mode="multiple" selected={viac} onSelect={setViac} locale={sk} showOutsideDays={false} />
        </Bunka>
        <Bunka nazov='mode="range" · numberOfMonths={2}' className="sm:col-span-2">
          <div className="-mx-1 w-full overflow-x-auto px-1 pb-2" data-lenis-prevent>
            <Calendar mode="range" selected={rozsah} onSelect={setRozsah} numberOfMonths={2} locale={sk} className="w-max" />
          </div>
        </Bunka>
        <Bunka nazov="disabled víkendy + minulosť · showWeekNumber">
          <Calendar
            mode="single"
            locale={sk}
            showWeekNumber
            disabled={[{ dayOfWeek: [0, 6] }, { before: dnes }]}
            classNames={{ week_number: 'w-11 min-w-9 shrink text-center font-mono text-xs text-muted-foreground' }}
          />
        </Bunka>
        <Bunka nazov='captionLayout="dropdown"'>
          <Calendar mode="single" locale={sk} captionLayout="dropdown" startMonth={new Date(2025, 0)} endMonth={new Date(2026, 11)} defaultMonth={new Date(2025, 0)} />
        </Bunka>
        <Bunka nazov="dropdown · footer">
          <Calendar
            mode="single"
            locale={sk}
            captionLayout="dropdown"
            startMonth={new Date(2025, 0)}
            endMonth={new Date(2026, 11)}
            defaultMonth={new Date(2025, 0)}
            footer={<p className="pt-2 text-xs font-bold">Január 2025: začiatok s AI.</p>}
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
        <Bunka nazov="predvolené texty (sk)">
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
        <Bunka nazov="predvolené predvoľby (sk), 2 mesiace" stlpec>
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
        <Bunka nazov='format="12h"'>
          <TimePicker format="12h" />
        </Bunka>
        <Bunka nazov='format="24h" (predvolený)'>
          <TimePicker value={t} onChange={setT} />
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
          onChange={setVolanie}
          placeholder="Vyber čas"
          size="lg"
          className="w-full max-w-[220px] bg-white"
        />
        <Stav>value = {hhmm(volanie)} · prvý klik na hodinu = celá hodina</Stav>
      </Recept>
    </>
  );
}
