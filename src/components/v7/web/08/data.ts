/** V7-08 · dáta pre okná. Texty doslovne zo src/data/{cesta,fakty,ponuka}.ts, hero-data.ts a v54 komponentov.
 *  BIO = kópia receptu z katalógu (src/components/v7/kit/rozlozenie/data.ts), nie import (katalóg sa môže meniť).
 *  Zastávky bez textu na webe majú `doplni: true` → štítok „text doplní Adam“. Beat 1 z beaty.ts sa nepoužíva. */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import { DOKAZY, KORPUS, POSTAVIL, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, KOTVY, type Dokaz } from '@/data/fakty';

export type Zastavka = {
  id: string;
  kedy: string;
  nazov: string;
  kde?: string;
  text?: string;
  citat?: string;
  doplni?: boolean;
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
const jung = BEATY.find((x) => x.titulok === 'Psychológia cez Junga');

export const BIO: Zastavka[] = [
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'stredná škola, Bratislava', doplni: true, kapitola: 'zaklad' },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true, kapitola: 'zaklad' },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text, kapitola: 'sluzba' },
  { id: 'psychologia', kedy: 'Jung', nazov: 'Psychológia', text: jung?.text, doplni: !jung, kapitola: 'sluzba' },
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

/** Doslovne z Anamneza.astro (cez katalóg). */
export const ANAMNEZA = {
  nadpis: 'Z nemocnice k agentom',
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  cta: 'Ďalší pacient: ty →',
  peciatka: '8 rokov pri lôžku',
};

/* ---------------- chorobopisy ---------------- */

export const STAV_TEXT: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };

export type Pacient = Dokaz & {
  fakty: { label: string; value: string; note: string }[];
  mal?: readonly string[];
  dostal?: readonly string[];
  stavText?: string;
};

/** Chorobopisy: Jakub, Lucia, Hriech, Korpus, potom ďalšie z DOKAZY (bez domén „čoskoro“ a bez zdravotných dát, ako v54). */
const PORADIE = ['system-pre-maklera', 'terapeutka', 'hriech', 'korpus', 'netopier', 'trhovy-dataset', 'agentovy-system', 'xvadur-com'];

export const PACIENTI: Pacient[] = PORADIE.map((id) => {
  const d = DOKAZY.find((x) => x.id === id)!;
  const p = POSTAVIL.find((x) => x.id === id);
  let fakty = p?.fakty.map(({ label, value, note }) => ({ label, value, note })) ?? [];
  if (id === 'korpus')
    fakty = [
      { label: 'Vlastné slová', value: KORPUS.slova, note: `od ${KORPUS.od}` },
      { label: 'Prompty', value: KORPUS.prompty, note: `k ${KORPUS.kDatumu}` },
    ];
  if (id === 'system-pre-maklera') return { ...d, fakty, mal: PRIPAD_MAKLER.mal, dostal: PRIPAD_MAKLER.dostal, stavText: PRIPAD_MAKLER.stav };
  if (id === 'terapeutka') return { ...d, fakty, mal: PRIPAD_TERAPEUTKA.mal, dostal: PRIPAD_TERAPEUTKA.dostal, stavText: PRIPAD_TERAPEUTKA.stav };
  return { ...d, fakty };
});

export const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* ---------------- hry ---------------- */

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

/* ---------------- texty ---------------- */

export type Text = { id: string; title: string; description: string; datum: string };
