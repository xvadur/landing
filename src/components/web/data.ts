/** Web XVADUR (V7, 29. 9. 2026): jeden domov, príbeh ako chrbtica. Adam: „potrebujem nádherný, redakčný a funkčný web,
 *  môj príbeh je taký krásny“. Stavebnica = BoldKit (src/components/ui/) po oprave (work/v7/katalog/OPRAVY.md).
 *  Texty IBA z dát, ktoré Adam ratifikoval: src/data/beaty.ts (19. 9.), src/data/cesta.ts (26. 9.), tézy z V5.4,
 *  fakty.ts. Kde text chýba, kapitola nesie `doplni` (štítok „text doplní Adam“) a nič sa nevymýšľa.
 *  Zakázané (STATUS 26. 9. + Adam 29. 9.): vety o maturite, škole, známkach („Zmaturoval som dobre“). */
import { BEATY } from '@/data/beaty';
import { CESTA } from '@/data/cesta';

const beat = (titulok: string) => {
  const b = BEATY.find((x) => x.titulok === titulok);
  if (!b) throw new Error(`beaty.ts: chýba beat ${titulok}`);
  return b;
};
const krok = (nazov: string) => {
  const k = CESTA.find((x) => x.nazov === nazov);
  if (!k) throw new Error(`cesta.ts: chýba krok ${nazov}`);
  return k;
};

export type Kapitola = {
  id: string;
  kedy: string;
  titul: string;
  text?: string;
  citat?: string;
  /** zdroj citátu (dátum / kontext), ak nie je súčasťou kroku */
  citatKedy?: string;
  doplni?: boolean;
};

export type Dejstvo = { id: string; rim: string; nazov: string; kapitoly: Kapitola[] };

const seniori = beat('Domov seniorov');
const psycho = beat('Psychológia cez Junga');
const nemocnica = krok('Nemocnica');
const odchod = krok('Vyhodili ma');
const ai = krok('AI');
const agenti = krok('Agenti');
const xvadur = krok('XVADUR');

export const DEJSTVA: Dejstvo[] = [
  {
    id: 'hladanie',
    rim: 'I',
    nazov: 'Hľadanie',
    kapitoly: [
      { id: 'elektro', kedy: 'Bratislava', titul: 'Elektrotechnika', doplni: true },
      { id: 'viera', kedy: '2017', titul: 'Viera', doplni: true },
      { id: 'seniori', kedy: '18', titul: 'Domov seniorov', text: seniori.text },
      { id: 'psychologia', kedy: 'Jung', titul: 'Psychológia', text: psycho.text },
    ],
  },
  {
    id: 'sluzba',
    rim: 'II',
    nazov: 'Služba',
    kapitoly: [
      {
        id: 'nemocnica',
        kedy: nemocnica.kedy,
        titul: nemocnica.nazov,
        text: nemocnica.text,
        citat: 'Výborný opatrovateľ nie je výborný zamestnanec.',
        citatKedy: 'o nemocnici',
      },
      { id: 'odchod', kedy: odchod.kedy, titul: odchod.nazov, text: odchod.text, citat: odchod.citat },
    ],
  },
  {
    id: 'stavba',
    rim: 'III',
    nazov: 'Stavba',
    kapitoly: [
      {
        id: 'ai',
        kedy: ai.kedy,
        titul: ai.nazov,
        text: ai.text,
        citat: 'Keď som mohol po slovensky rozprávať k počítaču, radikálne sa mi zmenil život. Mohol som začať tvoriť digitálne.',
        citatKedy: '22. 3. 2026',
      },
      {
        id: 'agenti',
        kedy: agenti.kedy,
        titul: agenti.nazov,
        text: agenti.text,
        citat: 'AI nemá robiť veci za človeka, AI má prinášať veci, ktoré by inak nemohli byť reálne.',
        citatKedy: 'o AI',
      },
      { id: 'xvadur', kedy: xvadur.kedy, titul: xvadur.nazov, text: xvadur.text },
    ],
  },
];

/** Poradové číslo kapitoly naprieč dejstvami (01 … 09). */
export const cisloKapitoly = (id: string) => {
  const vsetky = DEJSTVA.flatMap((d) => d.kapitoly);
  return String(vsetky.findIndex((k) => k.id === id) + 1).padStart(2, '0');
};

/** Tézy: Adamove doslovné vety (V5.4 Tezy.astro, jadro 27. 9. 2026). */
export const TEZY: { veta: string; kedy: string }[] = [
  { veta: 'Zdravotnícky systém sa strašne spolieha na iniciatívu zamestnancov a je to neudržateľné.', kedy: '8. 9. 2025' },
  { veta: 'AI je sandbox, ako Minecraft. Tá istá hra je v rukách dvoch ľudí absolútne odlišná.', kedy: '3. 8. 2025' },
  { veta: 'Svet sa tak zmenil, že už to, že sa zmenil, nie je vidno.', kedy: 'o dnešku' },
  { veta: 'Ja som neni chlapec, ktorý sa hrá s AI. Ja som podnikateľ, ktorý reálne robí veci s AI.', kedy: '1. 7. 2026' },
  { veta: 'Ľudia sa boja, že AI ovládne svet. Ja sa bojím, že AI bude za paywallom.', kedy: 'o AI' },
];

/** Hlavička: veta o Adamovi (hero-data.ts VETA) a motto. */
export { VETA, MOTTO_1, MOTTO_2 } from '@/components/hero/hero-data';
