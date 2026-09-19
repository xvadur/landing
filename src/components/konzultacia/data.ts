/** Obsah stránky /konzultacia/ — verbatim z packu 04 (01_current_personal_brand/pack-2026-09-11/04_KONZULTACIE_A_PONUKA.md).
 *  Žiadne čísla mimo packu; ceny sa neuvádzajú (pack 04: cena individuálne po zmapovaní). */

/** Verejná ponuka — verbatim. */
export const PONUKA = {
  titulok: 'Prines jednu úlohu. Pozrieme sa, čo s ňou dokáže AI.',
  odseky: [
    'Na bezplatnej úvodnej konzultácii prejdeme konkrétny príklad tvojej práce. Zistíme, čo sa opakuje, aké podklady máš a kde sa stráca čas alebo informácia. Ukážeme si vhodný postup a pomenujeme ďalší krok. Ak dáva zmysel niečo spoločne postaviť, pripravím samostatný rozsah a cenu.',
    'Je to vhodné pre autora s poznámkami, človeka skladajúceho viac nástrojov aj firmu, ktorá uvažuje o agentovi. Začneme tým, čo skutočne potrebuješ dosiahnuť.',
  ],
  kontakt: 'Napíš na adam@xvadur.com. Termín dohodneme osobne.',
};

/** Priebeh 30-minútového stretnutia — tabuľka verbatim. */
export type Krok = { cas: string; vedie: string; vznikne: string };
export const PRIEBEH: Krok[] = [
  { cas: '0–5 min', vedie: 'Kto výsledok potrebuje a čo s ním urobí? Ukáž posledný prípad.', vznikne: 'Jedna presná úloha.' },
  { cas: '5–12 min', vedie: 'Odkiaľ prichádzajú údaje? Čo sa opakuje? Kto rozhoduje?', vznikne: 'Mapa vstup → kroky → rozhodnutie → výsledok.' },
  { cas: '12–18 min', vedie: 'Kde je dnes najväčšie trenie? Čo by bolo chybou?', vznikne: 'Merateľné kritérium a zodpovedná osoba.' },
  { cas: '18–25 min', vedie: 'Na bezpečnej vzorke ukáž prompt alebo malý postup.', vznikne: 'Jeden kontrolovateľný návrh, prípadne presne pomenovaná prekážka.' },
  { cas: '25–30 min', vedie: 'Zhrň, čo klient zvládne sám a či treba realizáciu.', vznikne: 'Písomný ďalší krok, vlastníctvo, termín dohodnutý s klientom.' },
];
/** Interný pokyn z packu 04 („nezväčšovať… uzavrieť… povedať…“) prepísaný ako Adamov záväzok v 1. osobe — obsah nezmenený. */
export const PRIEBEH_POZNAMKA =
  'Ak sa ukáže zložité prostredie, nezväčšujem bezplatné stretnutie na audit celej firmy. Uzavriem jednu úlohu a pripravím ohraničený návrh. Ak AI nie je vhodná, poviem konkrétny dôvod a odporučím jednoduchší postup.';

/** Diagnostika: šesť otázok, ktoré menia riešenie — verbatim. */
export const OTAZKY: string[] = [
  'Aký predmet dostávaš a aký odovzdávaš? Vyžiadať skutočný príklad.',
  'Ktoré informácie musia byť presné a kto je ich vlastník?',
  'Je postup stabilný, alebo každý prípad vyžaduje iný úsudok?',
  'Kde sa výsledok použije a kto ho pred použitím skontroluje?',
  'Aké existujú prístupy k nástrojom a kto môže povoliť integráciu?',
  'Koľko času zaberá práca aj opravy dnes a čo by zmenu ospravedlnilo?',
];
export const OTAZKY_POZNAMKA =
  'Nemerané odpovede zostávajú odhadom klienta. Záznam „20 minút“ bez merania nie je baseline. Kritický výsledok má vždy vlastnú kontrolu človekom.';

/** Voľba najmenšieho užitočného riešenia — tabuľka verbatim. */
export type Riesenie = { pozorovanie: string; krok: string; dovod: string };
export const RIESENIA: Riesenie[] = [
  { pozorovanie: 'Zadanie býva nejasné, dáta sú dostupné.', krok: 'Lepší vstup a pracovná šablóna.', dovod: 'Integrácia nevyrieši nejasný cieľ.' },
  { pozorovanie: 'Rovnaký textový výsledok vzniká opakovane.', krok: 'Kontext + prompt/skill + kontrola.', dovod: 'Lacný a ľahko overiteľný prvý úsek.' },
  { pozorovanie: 'Stabilný prenos medzi nástrojmi.', krok: 'Jednoduchá automatizácia.', dovod: 'Predvídateľné pravidlá nepotrebujú autonómne plánovanie.' },
  { pozorovanie: 'Treba vyberať kroky podľa kontextu.', krok: 'Agent s ohraničenými nástrojmi a oprávneniami.', dovod: 'Má dôvod rozhodovať o postupe.' },
  { pozorovanie: 'Nikto nevlastní dáta alebo výsledok.', krok: 'Najprv určiť vlastníka a kritérium.', dovod: 'Inak by sme automatizovali neistotu.' },
];
export const RIESENIA_POZNAMKA = 'Nenútime agenta do úlohy, ktorú vyrieši jednoduchší postup.';

/** Vstup pred stretnutím — hotový text verbatim (správa od Adama). */
export const VSTUP_TEXT =
  'Ahoj, na náš rozhovor si priprav jeden príklad úlohy, ktorú chceš zlepšiť, a ukážku toho, ako vyzerá dobrý výsledok. Stačí anonymizovaný alebo vymyslený príklad. Užitočné bude vedieť, ako často úlohu robíš, v čom dnes pracuješ a čo je pri výsledku dôležité. Netreba pripravovať prezentáciu. Začneme týmto jedným prípadom a na konci si pomenujeme ďalší krok. Adam';
/** Interný pokyn z packu 04 („Prílohy si pýtať… začať…“) prepísaný ako Adamov záväzok v 1. osobe — obsah nezmenený. */
export const VSTUP_CITLIVE =
  'Prílohy si vypýtam len v rozsahu úlohy. Pri citlivom obsahu začneme zdieľanou obrazovkou, redigovanou vzorkou alebo syntetickým príkladom.';
