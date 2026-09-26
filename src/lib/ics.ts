/** Pozvánka do kalendára (.ics) pre konzultáciu — server (príloha e-mailu) aj klient (tlačidlo „Pridať do kalendára“). */
export function slotText(iso: string): string {
  return new Intl.DateTimeFormat('sk-SK', {
    timeZone: 'Europe/Bratislava',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const ics_cas = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function ics(o: { id: string; slot: string; trvanieMin: number; meno?: string; email?: string }): string {
  const zac = new Date(o.slot);
  const kon = new Date(zac.getTime() + o.trvanieMin * 60000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//XVADUR//Konzultacia//SK',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${o.id}@xvadur.com`,
    `DTSTAMP:${ics_cas(new Date())}`,
    `DTSTART:${ics_cas(zac)}`,
    `DTEND:${ics_cas(kon)}`,
    'SUMMARY:Konzultácia s Adamom (XVADUR)',
    'DESCRIPTION:30 minút\\, jedna úloha. Odkaz na hovor príde deň vopred. Kontakt: adam@xvadur.com',
    'ORGANIZER;CN=Adam Rudavský:mailto:adam@xvadur.com',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
