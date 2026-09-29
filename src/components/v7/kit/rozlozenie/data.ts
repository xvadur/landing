/** Kit · Rozloženie — dáta pre ukážky a recepty (29. 9. 2026).
 *  Bio: poradie zastávok podľa Adamovho zadania (elektrotechnická → Boh → nemocnica → psychológia → odchod → AI → agenti
 *  → XVADUR). Texty iba zo src/data/cesta.ts a src/components/v54/Anamneza.astro. Zastávky bez textu na webe majú
 *  `doplni: true` → na karte je badge „text doplní Adam“ a žiadny vymyslený detail.
 *  Projekty: Jakub, Lucia, Hriech, Korpus zo src/data/fakty.ts (DOKAZY, PRIPAD_*, KORPUS, ZIVE_CISLA). */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import { DOKAZY, KORPUS, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, ZIVE_CISLA, ZIVE_CISLA_SNIMKA, type Dokaz } from '@/data/fakty';

export type Zastavka = {
  id: string;
  /** krátky čas tak, ako je na webe; bez zdroja „—“ */
  kedy: string;
  nazov: string;
  /** podnázov iba z Adamovho zadania (miesto, rola) */
  kde?: string;
  text?: string;
  citat?: string;
  /** text na webe zatiaľ nie je */
  doplni?: boolean;
  /** kapitola pre recept „vrstvy“ */
  kapitola: 'zaklad' | 'sluzba' | 'stavba';
};

const krok = (nazov: string): Krok => {
  const k = CESTA.find((c) => c.nazov === nazov);
  if (!k) throw new Error(`cesta.ts: chýba krok ${nazov}`);
  return k;
};

const nemocnica = krok('Nemocnica');
const vyhodili = krok('Vyhodili ma');
const ai = krok('AI');
const agenti = krok('Agenti');
const xvadur = krok('XVADUR');

export const BIO: Zastavka[] = [
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'stredná škola, Bratislava', doplni: true, kapitola: 'zaklad' },
  // Viera: text napíšeme s Adamom (29. 9.: celý beat 1 nie, „Zmaturoval som dobre“ znižuje). Dovtedy bez textu.
  // Psychológia: Adamova ratifikovaná veta zo src/data/beaty.ts (beat 3, 19. 9. 2026).
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true, kapitola: 'zaklad' },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text, kapitola: 'sluzba' },
  { id: 'psychologia', kedy: 'Jung', nazov: 'Psychológia', text: BEATY.find((x) => x.titulok === 'Psychológia cez Junga')!.text, kapitola: 'sluzba' },
  { id: 'odchod', kedy: vyhodili.kedy, nazov: vyhodili.nazov, text: vyhodili.text, citat: vyhodili.citat, kapitola: 'sluzba' },
  { id: 'ai', kedy: ai.kedy, nazov: ai.nazov, text: ai.text, kapitola: 'stavba' },
  { id: 'agenti', kedy: agenti.kedy, nazov: agenti.nazov, text: agenti.text, kapitola: 'stavba' },
  { id: 'xvadur', kedy: xvadur.kedy, nazov: xvadur.nazov, text: xvadur.text, kapitola: 'stavba' },
];

export const KAPITOLY = [
  { id: 'zaklad', nazov: 'Základ', veta: 'Škola a viera.' },
  { id: 'sluzba', nazov: 'Služba', veta: 'Nemocnica, psychológia, odchod.' },
  { id: 'stavba', nazov: 'Stavba', veta: 'AI, agenti, XVADUR.' },
] as const;

/** Doslovné vety z Anamneza.astro. */
export const ANAMNEZA = {
  eyebrow: '✚ 01 · Anamnéza',
  nadpis: 'Z nemocnice k agentom',
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  cta: 'Ďalší pacient: ty →',
  peciatka: '8 rokov pri lôžku',
};

const dokaz = (id: string): Dokaz => {
  const d = DOKAZY.find((x) => x.id === id);
  if (!d) throw new Error(`fakty.ts: chýba dôkaz ${id}`);
  return d;
};

export type Projekt = {
  id: string;
  nazov: string;
  stitky: string[];
  cislo: string;
  cisloPopis: string;
  riadok: string;
  obrazok: string | null;
  url: string | null;
  stav: string;
  mal?: readonly string[];
  dostal?: readonly string[];
  stavText?: string;
  cisla?: { value: string; label: string }[];
};

const STAV: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };
const zDokazu = (d: Dokaz) => ({
  id: d.id,
  nazov: d.nazov,
  stitky: d.stitky,
  cislo: d.cislo,
  cisloPopis: d.cisloPopis,
  riadok: d.riadok,
  obrazok: d.obrazok,
  url: d.url,
  stav: STAV[d.stav],
});

const korpusCisla = ZIVE_CISLA.filter((z) => z.kluc === 'words_month' || z.kluc === 'streak_days').map((z) => ({
  value: z.value.toLocaleString('sk-SK').replace(/[\u00a0\u202f]/g, ' '),
  label: z.label,
}));

export const PROJEKTY: Projekt[] = [
  {
    ...zDokazu(dokaz('system-pre-maklera')),
    mal: PRIPAD_MAKLER.mal,
    dostal: PRIPAD_MAKLER.dostal,
    stavText: PRIPAD_MAKLER.stav,
    cisla: [...PRIPAD_MAKLER.cisla],
  },
  {
    ...zDokazu(dokaz('terapeutka')),
    mal: PRIPAD_TERAPEUTKA.mal,
    dostal: PRIPAD_TERAPEUTKA.dostal,
    stavText: PRIPAD_TERAPEUTKA.stav,
  },
  {
    ...zDokazu(dokaz('hriech')),
    cisla: [
      { value: '59', label: 'stránok mediálnej kritiky' },
      { value: '10', label: 'redakcií v mape' },
      { value: '558', label: 'ľudí v mape' },
    ],
  },
  {
    ...zDokazu(dokaz('korpus')),
    stavText: `Za prihlásením (adam.xvadur.com). Pulz: snímka ${ZIVE_CISLA_SNIMKA}.`,
    cisla: [
      { value: KORPUS.slova, label: `vlastných slov od ${KORPUS.od}` },
      { value: KORPUS.prompty, label: 'promptov' },
      ...korpusCisla,
    ],
  },
];

export const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

/** Sekcie domova V5.4 (Pilulky.astro) — na navigačné ukážky. */
export const SEKCIE = [
  { id: 'uvod', label: 'Príjem' },
  { id: 'anamneza', label: 'Anamnéza' },
  { id: 'nastroje', label: 'Nástroje' },
  { id: 'liecba', label: 'Liečba' },
  { id: 'chorobopisy', label: 'Chorobopisy' },
  { id: 'texty', label: 'Texty' },
];
