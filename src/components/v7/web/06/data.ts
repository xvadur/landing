/** V7-06 Lekáreň — dáta variantu. Texty iba zo src/data/{ponuka,fakty,cesta,beaty,terminy}.ts,
 *  src/components/konzultacia/data.ts, src/components/hero/hero-data.ts a src/components/v54/*. Nič nové sa nevymýšľa;
 *  jediný vlastný text sú zjavne hravé „vedľajšie účinky“ (bez čísel, na webe označené „s nadsázkou“).
 *  BIO je kópia receptu z v7/kit/rozlozenie/data.ts (kit sa nesmie importovať). */
import { BEATY } from '@/data/beaty';
import { CESTA, type Krok } from '@/data/cesta';
import { DOKAZY, KORPUS, PRIPAD_MAKLER, PRIPAD_TERAPEUTKA, ZIVE_CISLA_SNIMKA, KOTVY, type Dokaz } from '@/data/fakty';
import { PRECO_NIE_CHATGPT, PRODUKTY, VLAJKA, type Produkt } from '@/data/ponuka';
import { PRIEBEH, VSTUP_TEXT, VSTUP_CITLIVE } from '@/components/konzultacia/data';

/* ------------------------------------------------------------------ balenia (liečba) */

export type Sekcia =
  | { typ: 'text'; nadpis: string; text: string; body?: readonly string[] }
  | { typ: 'citat'; nadpis: string; text: string; pozn?: string }
  | { typ: 'priebeh'; nadpis: string }
  | { typ: 'porovnanie'; nadpis: string }
  | { typ: 'ucinky'; nadpis: string; body: string[] }
  | { typ: 'vyzdvihnutie'; nadpis: string };

export type Balenie = {
  id: string;
  /** 01 Triáž · 02 Zásah · 03 Odovzdanie (Liecba.astro) */
  polica: '01' | '02' | '03';
  nazov: string;
  /** forma / dávkovanie (nálepka z ponuka.ts) */
  forma: string;
  pre: string;
  popis: string;
  /** zadná strana krabičky */
  zlozenie: string[];
  farba: 'bg-yellow' | 'bg-white' | 'bg-paper' | 'bg-ink';
  /** piktogram na čelnej strane */
  znak: 'kriz' | 'tabletka' | 'blesk' | 'stit' | 'bublina';
  /** vyšetrenie = rezervácia; ostatné = čakáreň (zápis e-mailu) */
  zapis: string | null;
  letak: Sekcia[];
};

const produkt = (id: string): Produkt => {
  const p = PRODUKTY.find((x) => x.id === id);
  if (!p) throw new Error(`ponuka.ts: chýba produkt ${id}`);
  return p;
};

const VEDLAJSIE = 'Možné vedľajšie účinky';

export const BALENIA: Balenie[] = [
  {
    id: 'vysetrenie',
    polica: '01',
    nazov: VLAJKA.nazov,
    forma: `${VLAJKA.trvanie} · ${VLAJKA.cena}`,
    pre: 'Pre každého, kto prinesie jednu úlohu',
    popis: VLAJKA.titulok,
    zlozenie: VLAJKA.body.map((b) => b.split(':')[0]!.trim()),
    farba: 'bg-ink',
    znak: 'kriz',
    zapis: null,
    letak: [
      { typ: 'text', nadpis: `Čo je ${VLAJKA.nazov} a na čo sa používa`, text: VLAJKA.titulok, body: VLAJKA.body },
      { typ: 'citat', nadpis: 'Čo potrebuješ vedieť predtým', text: VSTUP_TEXT, pozn: VSTUP_CITLIVE },
      { typ: 'priebeh', nadpis: `Dávkovanie: ${VLAJKA.trvanie}` },
      {
        typ: 'ucinky',
        nadpis: VEDLAJSIE,
        body: [
          'Opakovanej úlohe začneš hovoriť „pacient“.',
          'Riziko, že si písomný ďalší krok naozaj spravíš.',
          'Chuť priniesť na ďalšie vyšetrenie ešte jednu úlohu.',
        ],
      },
      { typ: 'vyzdvihnutie', nadpis: 'Ako si ho vyzdvihnúť' },
    ],
  },
  (() => {
    const p = produkt('agent-pre-teba');
    return {
      id: p.id,
      polica: '02' as const,
      nazov: p.nazov,
      forma: p.nalepka,
      pre: p.pre,
      popis: p.popis,
      zlozenie: p.body,
      farba: 'bg-white' as const,
      znak: 'blesk' as const,
      zapis: p.id,
      letak: [
        { typ: 'text' as const, nadpis: `Čo je ${p.nazov} a na čo sa používa`, text: p.popis, body: [p.pre] },
        { typ: 'porovnanie' as const, nadpis: 'Chat alebo agent?' },
        { typ: 'text' as const, nadpis: `Dávkovanie: ${p.nalepka}`, text: 'Zloženie balenia:', body: p.body },
        {
          typ: 'ucinky' as const,
          nadpis: VEDLAJSIE,
          body: [
            'Telegram sa ozve skôr, než si spomenieš.',
            'Piatkové poobedie bez „ešte musím“.',
            'Zvyk pýtať sa pri každej úlohe: nemôže to robiť agent?',
          ],
        },
        { typ: 'vyzdvihnutie' as const, nadpis: 'Kedy bude v predaji' },
      ],
    };
  })(),
  ...(['kohorta', 'harness-kit', 'webinar'] as const).map((id, i) => {
    const p = produkt(id);
    const ucinky: Record<string, string[]> = {
      kohorta: ['Pri večeri budeš o agentoch hovoriť dlhšie, než rodina chce.', 'Nutkanie postaviť druhého agenta hneď po prvom.'],
      'harness-kit': ['Poriadok v priečinkoch, ktorý ťa prekvapí.', 'Pravidlá pre agentov začneš kopírovať do každého projektu.'],
      webinar: ['Otázky, ktoré si si doteraz netrúfol položiť.', 'Chuť skúsiť to hneď po skončení.'],
    };
    return {
      id: p.id,
      polica: '03' as const,
      nazov: p.nazov,
      forma: p.nalepka,
      pre: p.pre,
      popis: p.popis,
      zlozenie: p.body,
      farba: p.farba,
      znak: (['tabletka', 'stit', 'bublina'] as const)[i]!,
      zapis: p.id,
      letak: [
        { typ: 'text' as const, nadpis: `Čo je ${p.nazov} a na čo sa používa`, text: p.popis, body: [p.pre] },
        { typ: 'text' as const, nadpis: 'Zloženie', text: 'V balení nájdeš:', body: p.body },
        { typ: 'text' as const, nadpis: `Dávkovanie: ${p.nalepka}`, text: p.pre },
        { typ: 'ucinky' as const, nadpis: VEDLAJSIE, body: ucinky[id]! },
        { typ: 'vyzdvihnutie' as const, nadpis: 'Kedy bude v predaji' },
      ],
    };
  }),
];

export const POLICE = [
  { id: '01', nazov: 'Triáž', veta: 'Najprv zistím, čo bolí.' },
  { id: '02', nazov: 'Zásah', veta: 'Potom najmenší zásah, ktorý pomôže.' },
  { id: '03', nazov: 'Odovzdanie', veta: 'Na konci ti to odovzdám tak, aby to išlo aj bezo mňa.' },
] as const;

/** Úvod Liečby doslovne z v54/Liecba.astro. */
export const LIECBA_UVOD =
  'Postup ako na zmene. Najprv zistím, čo bolí. Potom najmenší zásah, ktorý pomôže. Na konci ti to odovzdám tak, aby to išlo aj bezo mňa.';

export { PRECO_NIE_CHATGPT, PRIEBEH, VLAJKA };

/** Minúty z PRIEBEH („0–5 min“ → 5) pre donut „zloženie 30 minút“. */
export const PRIEBEH_MINUTY = PRIEBEH.map((k) => {
  const [od, doMin] = k.cas.replace(' min', '').split('–').map(Number);
  return { cas: k.cas, minuty: (doMin ?? 0) - (od ?? 0), vznikne: k.vznikne };
});

/* ------------------------------------------------------------------ recepty (chorobopisy) */

const dokaz = (id: string): Dokaz => {
  const d = DOKAZY.find((x) => x.id === id);
  if (!d) throw new Error(`fakty.ts: chýba dôkaz ${id}`);
  return d;
};

export const STAV: Record<Dokaz['stav'], string> = { zive: 'Živé', interne: 'Beží interne', coskoro: 'Čoskoro' };

export type Recept = {
  id: string;
  kratko: string;
  pacient: string;
  dg: string;
  stitky: string[];
  cislo: string;
  cisloPopis: string;
  obrazok: string | null;
  url: string | null;
  poznamka?: string;
  stav: Dokaz['stav'];
  mal?: readonly string[];
  rp?: readonly string[];
  stavText?: string;
  cisla?: { value: string; label: string }[];
};

const zDokazu = (d: Dokaz, kratko: string): Recept => ({
  id: d.id,
  kratko,
  pacient: d.nazov,
  dg: d.riadok,
  stitky: d.stitky,
  cislo: d.cislo,
  cisloPopis: d.cisloPopis,
  obrazok: d.obrazok,
  url: d.url,
  poznamka: d.poznamka,
  stav: d.stav,
});

export const RECEPTY: Recept[] = [
  {
    ...zDokazu(dokaz('system-pre-maklera'), 'Jakub'),
    mal: PRIPAD_MAKLER.mal,
    rp: PRIPAD_MAKLER.dostal,
    stavText: PRIPAD_MAKLER.stav,
    cisla: [...PRIPAD_MAKLER.cisla],
  },
  {
    ...zDokazu(dokaz('terapeutka'), 'Lucia'),
    mal: PRIPAD_TERAPEUTKA.mal,
    rp: PRIPAD_TERAPEUTKA.dostal,
    stavText: PRIPAD_TERAPEUTKA.stav,
  },
  {
    ...zDokazu(dokaz('hriech'), 'Hriech'),
    cisla: [
      { value: '59', label: 'stránok mediálnej kritiky' },
      { value: '10', label: 'redakcií v mape' },
      { value: '558', label: 'ľudí v mape' },
    ],
  },
  {
    ...zDokazu(dokaz('korpus'), 'Korpus'),
    stavText: `Za prihlásením (adam.xvadur.com). Pulz: snímka ${ZIVE_CISLA_SNIMKA}.`,
    cisla: [
      { value: KORPUS.slova, label: `vlastných slov od ${KORPUS.od}` },
      { value: KORPUS.prompty, label: 'promptov' },
    ],
  },
];

/** Ďalšie recepty na bodci: ostatné DOKAZY bez „čoskoro“ a bez zdravotných dát (ako v54/Chorobopisy). */
export const BODEC: Recept[] = DOKAZY.filter(
  (d) => d.stav !== 'coskoro' && d.id !== 'vlastne-data' && !RECEPTY.some((r) => r.id === d.id),
).map((d) => zDokazu(d, d.nazov));

export const domena = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* ------------------------------------------------------------------ hry (vzorky) */

export type Vzorka = { id: string; cislo: string; nazov: string; text: string | null; href: string | null };

export const VZORKY: Vzorka[] = [
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

/* ------------------------------------------------------------------ bio (kópia receptu kit/rozlozenie/data.ts) */

export type Zastavka = {
  id: string;
  kedy: string;
  nazov: string;
  kde?: string;
  text?: string;
  citat?: string;
  doplni?: boolean;
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
  { id: 'skola', kedy: '—', nazov: 'Elektrotechnická', kde: 'stredná škola, Bratislava', doplni: true },
  { id: 'viera', kedy: '2017', nazov: 'Viera v Boha', doplni: true },
  { id: 'nemocnica', kedy: nemocnica.kedy, nazov: nemocnica.nazov, kde: 'urgentný príjem', text: nemocnica.text },
  { id: 'psychologia', kedy: 'Jung', nazov: 'Psychológia', text: BEATY.find((x) => x.titulok === 'Psychológia cez Junga')?.text },
  { id: 'odchod', kedy: vyhodili.kedy, nazov: vyhodili.nazov, text: vyhodili.text, citat: vyhodili.citat },
  { id: 'ai', kedy: ai.kedy, nazov: ai.nazov, text: ai.text },
  { id: 'agenti', kedy: agenti.kedy, nazov: agenti.nazov, text: agenti.text },
  { id: 'xvadur', kedy: xvadur.kedy, nazov: xvadur.nazov, text: xvadur.text },
].map((z) => (z.text || z.doplni ? z : { ...z, doplni: true }));

/** Doslovné vety z v54/Anamneza.astro. */
export const ANAMNEZA = {
  nadpis: 'Z nemocnice k agentom',
  citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
  dovetok: 'Toto som pochopil po ôsmich rokoch. Zvyšok je záznam.',
  peciatka: '8 rokov pri lôžku',
};

/** Kotvy sekcií (lišta, ⌘K, sprievodca). */
export const SEKCIE = [
  { id: 'pult', label: 'Pult' },
  { id: 'regal', label: 'Regál' },
  { id: 'recepty', label: 'Recepty' },
  { id: 'vzorky', label: 'Vzorky' },
  { id: 'lekarnik', label: 'Lekárnik' },
  { id: 'predpis', label: 'Predpis' },
  { id: 'citanie', label: 'Čítanie' },
] as const;

/** Udalosti medzi ostrovmi (⌘K otvorí leták, recept alebo hru na mieste). */
export const UDALOST = {
  letak: 'lekaren:letak',
  recept: 'lekaren:recept',
  hra: 'lekaren:hra',
} as const;

export const TOASTER_ID = 'lekaren';
