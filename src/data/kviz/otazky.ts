/** Otázky kvízu AI-readiness (/kviz/). 5 základných + adaptívne doplnkové (2 alebo 5).
 *  Formulácie otázok a možností sú vlastné (krátke, bez marketingu); doplnkové otázky vychádzajú
 *  zo šiestich diagnostických otázok packu 04. Body = príspevok do skóre 0–100 (pozri logika.ts). */

export type Moznost = {
  value: string;
  label: string;
  /** druhý riadok: konkrétny príklad */
  hint?: string;
  /** body do skóre pripravenosti (0 = nič) */
  body: number;
};

export type OtazkaRadio = {
  id: 'kto' | 'opakuje' | 'skusal' | 'data' | 'vlastnik' | 'stabilny' | 'kontrola' | 'pristupy';
  typ: 'radio';
  eyebrow: string;
  otazka: string;
  moznosti: Moznost[];
};

export type OtazkaCislo = {
  id: 'hodiny' | 'sadzba';
  typ: 'cislo';
  eyebrow: string;
  otazka: string;
  pomoc: string;
  jednotka: string;
  min: number;
  max: number;
  krok: number;
  /** rýchla voľba (len pohodlie, nie tvrdenie) */
  rychle: number[];
  /** maximum bodov do skóre; hodiny sa škálujú lineárne po `plnyBodPri` */
  body: number;
  plnyBodPri?: number;
};

export type Otazka = OtazkaRadio | OtazkaCislo;
export type OtazkaId = Otazka['id'];

export const ZAKLADNE: Otazka[] = [
  {
    id: 'kto',
    typ: 'radio',
    eyebrow: '01 / Kto si',
    otazka: 'Kto si?',
    moznosti: [
      { value: 'autor', label: 'Autor s poznámkami', hint: 'Píšem, tvorím, radím. Poznámok veľa, hotových výstupov málo.', body: 0 },
      {
        value: 'nastroje',
        label: 'Človek skladajúci viac nástrojov',
        hint: 'Tabuľka, mail, CRM, chat. Kopírujem medzi nimi.',
        body: 0,
      },
      { value: 'firma', label: 'Firma, ktorá uvažuje o agentovi', hint: 'Máme tím a proces. Časť práce má bežať sama.', body: 0 },
    ],
  },
  {
    id: 'opakuje',
    typ: 'radio',
    eyebrow: '02 / Čo sa opakuje',
    otazka: 'Čo sa ti opakuje najčastejšie?',
    moznosti: [
      { value: 'text', label: 'Rovnaký text', hint: 'Ponuky, odpovede, zhrnutia, správy.', body: 20 },
      { value: 'prenos', label: 'Prenos údajov medzi nástrojmi', hint: 'Z formulára do tabuľky, z mailu do CRM.', body: 20 },
      { value: 'rozhodovanie', label: 'Rozhodovanie podľa prípadu', hint: 'Každý prípad je iný, vyberám postup.', body: 12 },
      { value: 'nejasne', label: 'Nejasné zadania', hint: 'Najprv zisťujem, čo vlastne treba.', body: 5 },
    ],
  },
  {
    id: 'hodiny',
    typ: 'cislo',
    eyebrow: '03 / Hodiny týždenne',
    otazka: 'Koľko hodín týždenne ti to zoberie?',
    pomoc: 'Odhad stačí. Rátaj aj opravy a hľadanie podkladov.',
    jednotka: 'h / týždeň',
    min: 0,
    max: 80,
    krok: 1,
    rychle: [2, 5, 10, 20],
    body: 15,
    plnyBodPri: 10,
  },
  {
    id: 'sadzba',
    typ: 'cislo',
    eyebrow: '04 / Hodinová sadzba',
    otazka: 'Koľko stojí hodina tvojej práce?',
    pomoc: 'Čo si účtuješ, alebo čo ťa stojí človek, ktorý to robí.',
    jednotka: '€ / hodina',
    min: 0,
    max: 500,
    krok: 1,
    rychle: [15, 25, 40, 60],
    body: 0,
  },
  {
    id: 'skusal',
    typ: 'radio',
    eyebrow: '05 / Čo si skúšal',
    otazka: 'Čo si s AI už skúšal?',
    moznosti: [
      { value: 'nic', label: 'Nič, zatiaľ len čítam', body: 0 },
      { value: 'chat', label: 'Chat, keď treba', hint: 'Zakaždým odznova, bez uloženého postupu.', body: 5 },
      { value: 'prompty', label: 'Mám prompty alebo šablóny', hint: 'Používam ich opakovane.', body: 12 },
      { value: 'automatizacia', label: 'Automatizáciu', hint: 'Prepojenia nástrojov, skripty.', body: 15 },
      { value: 'nasadene', label: 'Niečo beží, ale nedrží', hint: 'Výsledky treba stále opravovať.', body: 10 },
    ],
  },
];

/** Doplnkové otázky. `vzdy` = v oboch vetvách (+2); ostatné len v dlhšej vetve (+5). */
export const DOPLNKOVE: (OtazkaRadio & { vzdy: boolean })[] = [
  {
    id: 'data',
    typ: 'radio',
    vzdy: true,
    eyebrow: 'Podklady',
    otazka: 'Kde sú podklady, ktoré k tej úlohe potrebuješ?',
    moznosti: [
      { value: 'poruke', label: 'Po ruke', hint: 'V jednom alebo dvoch nástrojoch.', body: 15 },
      { value: 'roztrusene', label: 'Roztrúsené', hint: 'Hľadám ich, skladám z viacerých miest.', body: 8 },
      { value: 'chybaju', label: 'Často chýbajú', hint: 'Musím si ich pýtať.', body: 0 },
    ],
  },
  {
    id: 'vlastnik',
    typ: 'radio',
    vzdy: true,
    eyebrow: 'Výsledok',
    otazka: 'Kto rozhodne, že výsledok je dobrý?',
    moznosti: [
      { value: 'ja', label: 'Ja', hint: 'Viem presne opísať, ako vyzerá dobrý výsledok.', body: 15 },
      { value: 'iny', label: 'Klient alebo šéf', hint: 'Kritérium nemáme napísané.', body: 7 },
      { value: 'nikto', label: 'Nikto', hint: 'Nemá to nikto na starosti.', body: 0 },
    ],
  },
  {
    id: 'stabilny',
    typ: 'radio',
    vzdy: false,
    eyebrow: 'Postup',
    otazka: 'Je postup vždy rovnaký?',
    moznosti: [
      { value: 'ano', label: 'Áno', hint: 'Rovnaké kroky v rovnakom poradí.', body: 10 },
      { value: 'vacsinou', label: 'Väčšinou', hint: 'S pár výnimkami.', body: 6 },
      { value: 'kazdy', label: 'Každý prípad je iný', body: 2 },
    ],
  },
  {
    id: 'kontrola',
    typ: 'radio',
    vzdy: false,
    eyebrow: 'Kontrola',
    otazka: 'Kto výsledok skontroluje, kým sa použije?',
    moznosti: [
      { value: 'vzdy', label: 'Vždy ja alebo kolega', body: 10 },
      { value: 'niekedy', label: 'Niekedy', body: 5 },
      { value: 'nikto', label: 'Nikto, ide rovno von', body: 0 },
    ],
  },
  {
    id: 'pristupy',
    typ: 'radio',
    vzdy: false,
    eyebrow: 'Prístupy',
    otazka: 'Môžeš povoliť prepojenie nástrojov?',
    moznosti: [
      { value: 'ano', label: 'Áno, rozhodujem sám', hint: 'Mám účty aj prístupy.', body: 10 },
      { value: 'opytat', label: 'Musím sa opýtať', body: 5 },
      { value: 'nie', label: 'Nie alebo neviem', body: 0 },
    ],
  },
];
