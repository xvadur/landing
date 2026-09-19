/** Intake konzultácie — čistá logika bez Reactu (testovateľná): možnosti, payload, odkazy, čítanie query.
 *  Zdieľaný kontrakt query parametrov (kvíz / plán → /konzultacia/): z=kviz|plan, kto, hodiny, sadzba, krok.
 *  Kvíz posiela kto=<segment slug>, hodiny=<n> (týždenne), sadzba=<n> (€/h), krok=<slug z @/data/kviz/kroky>. */
import { krokBySlug } from '@/data/kviz/kroky';

export const EMAIL = 'adam@xvadur.com';
export const SUBJECT = 'Konzultácia';

/** Kto si — podľa verejnej ponuky (pack 04): autor s poznámkami, človek skladajúci viac nástrojov, firma s agentom; + maklér (spec 05). */
export const KTO_OPTIONS = [
  { value: 'autor', label: 'Autor alebo tvorca s poznámkami' },
  { value: 'nastroje', label: 'Skladám viac nástrojov dokopy' },
  { value: 'firma', label: 'Firma, ktorá uvažuje o agentovi' },
  { value: 'makler', label: 'Realitný maklér' },
  { value: 'ine', label: 'Iné' },
] as const;

export const CASTO_OPTIONS = [
  { value: 'denne', label: 'Denne' },
  { value: 'tyzdenne', label: 'Niekoľkokrát týždenne' },
  { value: 'mesacne', label: 'Niekoľkokrát mesačne' },
  { value: 'nepravidelne', label: 'Nepravidelne' },
] as const;

export type KtoValue = (typeof KTO_OPTIONS)[number]['value'];
export type CastoValue = (typeof CASTO_OPTIONS)[number]['value'];

export type Prefill = {
  z: 'kviz' | 'plan' | null;
  kto: string | null;
  hodiny: string | null;
  sadzba: string | null;
  krok: string | null;
};

export type Intake = {
  kto: KtoValue | '';
  ktoIne: string;
  uloha: string;
  casto: CastoValue | '';
  nastroje: string;
  dolezite: string;
  kontakt: string;
};

export const EMPTY_INTAKE: Intake = {
  kto: '',
  ktoIne: '',
  uloha: '',
  casto: '',
  nastroje: '',
  dolezite: '',
  kontakt: '',
};

/** Rodovo neutrálne štítky (rovnaké ako inline skript v hero na /konzultacia/). */
const ZDROJ_LABEL: Record<NonNullable<Prefill['z']>, string> = {
  kviz: 'Prichádzaš z kvízu',
  plan: 'Z plánu Neviditeľný maklér',
};

export function zdrojLabel(z: Prefill['z']): string | null {
  return z ? ZDROJ_LABEL[z] : null;
}

/** Bezpečné orezanie hodnoty z URL (bez nových riadkov, max 120 znakov). */
function clean(value: string | null): string | null {
  if (value == null) return null;
  const v = value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 120);
  return v.length ? v : null;
}

export function readPrefill(search: string): Prefill {
  const p = new URLSearchParams(search);
  const zRaw = p.get('z');
  const z = zRaw === 'kviz' || zRaw === 'plan' ? zRaw : null;
  return {
    z,
    kto: clean(p.get('kto')),
    hodiny: clean(p.get('hodiny')),
    sadzba: clean(p.get('sadzba')),
    krok: clean(p.get('krok')),
  };
}

/** Aliasy sa porovnávajú na celé slová (nie podreťazce): „realitný agent“ → makler (realitny má prednosť pred agent),
 *  „kabinet“ nesedí na „ine“. Poradie = priorita. */
const KTO_ALIASES: [string, KtoValue][] = [
  ['autor', 'autor'],
  ['tvorca', 'autor'],
  ['nastroje', 'nastroje'],
  ['freelancer', 'nastroje'],
  ['szco', 'nastroje'],
  ['makler', 'makler'],
  ['realitny', 'makler'],
  ['firma', 'firma'],
  ['agent', 'firma'],
];

function strip(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function words(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Hodnota `kto` z URL → možnosť selectu; nezhoda = „Iné“ + pôvodný text do doplnenia. */
export function ktoFromPrefill(kto: string | null): Pick<Intake, 'kto' | 'ktoIne'> {
  if (!kto) return { kto: '', ktoIne: '' };
  const key = strip(kto);
  const direct = KTO_OPTIONS.find((o) => o.value === key || strip(o.label) === key);
  if (direct) return { kto: direct.value, ktoIne: '' };
  const ws = words(kto);
  const alias = KTO_ALIASES.find(([k]) => ws.includes(k));
  if (alias) return { kto: alias[1], ktoIne: '' };
  return { kto: 'ine', ktoIne: kto };
}

/** krok=<slug> z kvízu → názov prvého kroku z tabuľky (pack 04); neznámy text ostáva ako prišiel. */
export function krokText(krok: string): string {
  return krokBySlug(krok)?.krok ?? krok;
}

/** Kvíz posiela hodinovú sadzbu ako číslo → doplníme jednotku; nečíselný text ostáva. */
export function sadzbaText(sadzba: string): string {
  return /^\d+([.,]\d+)?$/.test(sadzba) ? `${sadzba} €/h` : sadzba;
}

/** Kvíz posiela hodiny týždenne ako číslo → doplníme jednotku; nečíselný text ostáva. */
export function hodinyText(hodiny: string): string {
  return /^\d+([.,]\d+)?$/.test(hodiny) ? `${hodiny} h` : hodiny;
}

export function intakeFromPrefill(prefill: Prefill): Intake {
  return { ...EMPTY_INTAKE, ...ktoFromPrefill(prefill.kto) };
}

function label<T extends { value: string; label: string }>(options: readonly T[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '';
}

export function ktoText(intake: Intake): string {
  if (intake.kto === 'ine') return intake.ktoIne.trim() || 'Iné';
  return label(KTO_OPTIONS, intake.kto);
}

/** Slovenský payload pre WhatsApp / e-mail. Prázdne polia sa vynechajú; z kvízu/plánu ide len to, čo prišlo v URL. */
export function buildPayload(intake: Intake, prefill: Prefill): string {
  const lines: (string | null)[] = [
    'Ahoj Adam, prichádzam z xvadur.com a chcem prebrať jednu úlohu na bezplatnej konzultácii.',
    '',
    intake.kto ? `Kto som: ${ktoText(intake)}` : null,
    intake.uloha.trim() ? `Úloha: ${intake.uloha.trim()}` : null,
    intake.casto ? `Ako často ju robím: ${label(CASTO_OPTIONS, intake.casto)}` : null,
    intake.nastroje.trim() ? `V čom dnes pracujem: ${intake.nastroje.trim()}` : null,
    intake.dolezite.trim() ? `Pri výsledku je dôležité: ${intake.dolezite.trim()}` : null,
    intake.kontakt.trim() ? `Kontakt: ${intake.kontakt.trim()}` : null,
  ];

  const zKvizu: string[] = [];
  if (prefill.hodiny) zKvizu.push(`hodiny týždenne: ${hodinyText(prefill.hodiny)}`);
  if (prefill.sadzba) zKvizu.push(`sadzba: ${sadzbaText(prefill.sadzba)}`);
  if (prefill.krok) zKvizu.push(`navrhnutý prvý krok: ${krokText(prefill.krok)}`);
  // názov kroku z tabuľky končí bodkou → druhú nepridávať
  const veta = (t: string) => (t.endsWith('.') ? t : `${t}.`);
  if (prefill.z === 'kviz') lines.push('', veta(`Z kvízu na xvadur.com${zKvizu.length ? ': ' + zKvizu.join(', ') : ''}`));
  else if (prefill.z === 'plan') lines.push('', 'Prichádzam z plánu Neviditeľný maklér (Deň 8).');
  else if (zKvizu.length) lines.push('', veta(`Doplnenie: ${zKvizu.join(', ')}`));

  return lines.filter((l) => l !== null).join('\n');
}

export function whatsappUrl(payload: string) {
  return `https://wa.me/?text=${encodeURIComponent(payload)}`;
}

export function mailtoUrl(payload: string) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(payload)}`;
}
