/** Produkt /makleri/plan/ — Deň 1–8 VERBATIM z packu 13 §2
 *  (xvadur_brand/01_current_personal_brand/13_NEVIDITELNY_MAKLER_LAUNCH_2026-09-15.md).
 *  Štruktúra dňa = Prečo / Úloha / Artefakt / Čas tak, ako je v packu. Kurzíva packu (*…*) v Úlohe je v `ulohaKurziva`
 *  (podreťazce `uloha`, ktoré stránka vykreslí v <em>). */

export type Den = {
  n: number;
  id: string;
  nazov: string;
  preco: string;
  uloha: string;
  /** časti `uloha`, ktoré má pack kurzívou (*…*) */
  ulohaKurziva?: string[];
  artefakt: string;
  cas: string;
};

export const DNI: Den[] = [
  {
    n: 1,
    id: 'den-1',
    nazov: 'Škrtací test',
    preco:
      '31 zo 47 kancelárií má v texte aspoň jednu z týchto fráz: komplexný/kompletný servis (21), dlhoročné skúsenosti (11), profesionálny prístup (7), individuálny prístup (7), najlepšia/najvyššia cena (7), bez starostí (2).',
    uloha:
      'Skopírujte text zo svojho profilu, webu alebo bio. Škrtnite každú z tých šiestich fráz a každé prídavné meno, za ktorým nie je číslo alebo meno. Prečítajte, čo zostalo.',
    artefakt: 'Škrtnutý text, odfotený. (Väčšinou zostane meno, telefón a názov kancelárie. To je diagnóza.)',
    cas: '15 min.',
  },
  {
    n: 2,
    id: 'den-2',
    nazov: 'Jedna veta, ktorú nemá nikto',
    preco:
      'V 459 weboch sme hľadali vetu, ktorá spája jedného človeka a aparát za ním: 0 výskytov. Vetu o rozhodnutí pred inzerciou: 0. Priestor je prázdny presne tam, kde je konkrétny.',
    uloha:
      'Napíšte jednu vetu podľa vzoru [čo držíte vy osobne] + [čo je za vami] alebo [konkrétna situácia klienta] + [čo urobíte ako prvé]. Zakázané: všetko škrtnuté z Dňa 1. Vzor (Jakub Olša): „Predaj držím osobne. Za mnou pracuje celý aparát.“',
    ulohaKurziva: ['[čo držíte vy osobne] + [čo je za vami]', '[konkrétna situácia klienta] + [čo urobíte ako prvé]'],
    artefakt: 'Jedna veta. Ide do bio, na web, do podpisu.',
    cas: '30 min. Napíšte desať, vyberte jednu.',
  },
  {
    n: 3,
    id: 'den-3',
    nazov: 'Meno pred logom',
    preco:
      '2 034 ľudí v bratislavskom trhu; 2 006 z nich existuje online ako riadok pod logom kancelárie. Klient, ktorý vás hľadá, nájde kanceláriu. Kancelária mu dá toho, kto má práve službu.',
    uloha:
      'Jedna stránka, kde ste prvý vy: meno, tvár, veta z Dňa 2, jedno číslo (predaje / roky / štvrť), jeden ďalší krok. Bez webu: Instagram bio + pripnutý príspevok s tými istými piatimi prvkami. Podstránka na webe kancelárie sa nepočíta — tam ste tretí riadok zľava.',
    artefakt: 'URL, ktorá sa dá poslať klientovi a nezačína názvom kancelárie.',
    cas: '60 min. (Canva one-pager, Notion public page, Carrd, alebo pripnutý post.)',
  },
  {
    n: 4,
    id: 'den-4',
    nazov: 'Prvý dôkaz, nie sľub',
    preco:
      'Zo 416 webov má použiteľný dôkaz (prípad, nie „20 rokov“) 96. Väčšina „referencií“ je fotka bytu bez rozhodnutia.',
    uloha:
      'Jeden uzavretý predaj, päť viet, bez mena klienta: (1) situácia majiteľa, (2) problém alebo rozhodnutie, (3) čo ste zmenili a prečo, (4) čo sa stalo, (5) výsledok alebo poctivo označený stav. Číslo bez zdroja nie je dôkaz — ak nemáte presnú cenu, dajte rozsah alebo ju vynechajte.',
    artefakt: 'Jeden dôkazový blok pod vetou na stránke z Dňa 3.',
    cas: '30 min.',
  },
  {
    n: 5,
    id: 'den-5',
    nazov: 'Téma, ktorú ľudia poznajú',
    preco:
      'Jakub Chovanec (Bratislava, 3 832 sledovateľov k 9. 9. 2026): 12 reels, 7-tisíc až 92-tisíc pozretí, medián 20 700. Témy: Eurovea, hrad, parkovanie, pozemky (715-tisíc). Jeho videá bytov: 7 až 11-tisíc. Predávajúci si to pozrie a povie: chcem, aby si môj byt všimlo toľko ľudí.',
    uloha:
      'Jedna téma z vašej štvrte, ktorú si pozrie aj človek, čo nič nepredáva: nová zastávka, cena parkovania, čo stojí rekonštrukcia paneláku, prečo sa v tejto ulici predáva pomaly. 30 sekúnd, telefón, vaša tvár, bez loga kancelárie v prvom zábere. Prvá veta = číslo alebo otázka.',
    artefakt: 'Jedno video, publikované.',
    cas: '45 min vrátane troch pokusov.',
  },
  {
    n: 6,
    id: 'den-6',
    nazov: 'Prvý krok, ktorý nie je „Kontakt“',
    preco:
      'Na 267 zo 416 webov je jediný ďalší krok „Kontakt“, telefón alebo všeobecný formulár. Rezerváciu termínu ponúka ako prvý krok 15 webov. Klient nevie, čo dostane, keď klikne.',
    uloha:
      'Pomenujte prvú vec, ktorú klient od vás dostane za 30 minút, a s čím odíde („Predajný scenár: či predať, prenajať alebo počkať, a s akou cenou“). Založte booking odkaz (Google Calendar appointment / Calendly) a dajte ho namiesto „Kontakt“ na stránku z Dňa 3.',
    artefakt: 'Pomenovaný prvý krok + funkčný booking link.',
    cas: '30 min.',
  },
  {
    n: 7,
    id: 'den-7',
    nazov: 'Test za 5 eur',
    preco:
      'Adamov test: 3 € na TikTok Promote → 16 000 pozretí. Chovanec má doloženú platenú podporu lokálnych tém. Pozornosť je lacná. Drahá je konverzia — preto meriame kliky, nie pozretia.',
    uloha:
      '5 € za video z Dňa 5. Cieľ: vaše mesto, 25–55. Odkaz na stránku z Dňa 3 v popise. Po 48 hodinách zapíšte: pozretia, návštevy profilu, kliky na odkaz, rezervácie.',
    artefakt: 'Štyri čísla.',
    cas: '10 min nastavenie, 48 h čakanie.',
  },
];

/** Deň 8 — Keď to začne fungovať (zadarmo, verejný). Launch Partner most. Verbatim pack §2. */
export const DEN_8 = {
  n: 8,
  id: 'den-8',
  nazov: 'Keď to začne fungovať',
  podtitul: 'zadarmo, verejný',
  odseky: [
    'Dopyt príde z videa, z portálu, z telefónu, z Facebooku — a stratí sa, lebo ste boli na obhliadke. To už nie je marketing. To je systém: každý dopyt má zdroj, stav a ďalší krok; odpoveď do 60 sekúnd; follow-up bez vás; termín v kalendári; Telegram ráno.',
    'Postavil som ho jednému maklérovi v Bratislave. Beriem troch ďalších ako Launch Partnerov: 500 € nastavenie + 300 €/mesiac, minimálne 3 mesiace, výmenou za spätnú väzbu a anonymizovanú prípadovú štúdiu. Po prvých troch: 1 500 € + 500–600 €/mesiac.',
  ],
  /** tučné v packu: „500 € nastavenie + 300 €/mesiac“ */
  tucne: '500 € nastavenie + 300 €/mesiac',
  cta: '15-minútový hovor',
} as const;

/** Položky sticky navigácie dní. */
export const DNI_NAV = [
  ...DNI.map((d) => ({ id: d.id, n: d.n, label: d.nazov })),
  { id: DEN_8.id, n: DEN_8.n, label: DEN_8.nazov },
];
