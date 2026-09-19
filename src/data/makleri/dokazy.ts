/** Sekcia „Dôkazy“ na /makleri/ — tabuľka packu 13 §1 VERBATIM
 *  (xvadur_brand/01_current_personal_brand/13_NEVIDITELNY_MAKLER_LAUNCH_2026-09-15.md).
 *  `cislo` nesie tučné časti ako **…** presne ako pack; vykresľuje sa cez `boldSegments()`.
 *  14 citácií webov kancelárií sú v src/data/frazy.ts (CITACIE) — rovnaký zdroj, rovnaké znenie.
 *  Kotvy s číslami pre number-flow sú z src/data/fakty.ts (KOTVY). Dátumy v `zdroj` majú pevnú medzeru (16.\u00A08.),
 *  aby sa v úzkom stĺpci nezalomili — text je inak verbatim. */

export type DokazRiadok = { cislo: string; zdroj: string };

export const DOKAZY_UVOD =
  'Všetky čísla sú z Adamovho výskumu (snapshoty 16. 8. a 8.–9. 9. 2026) alebo z Adamových vlastných meraní. Kde číslo nemáme, je to napísané.';

export const DOKAZY: DokazRiadok[] = [
  {
    cislo: '**31 zo 47** kancelárií má v texte aspoň jednu zo 6 rodín fráz',
    zdroj: 'top50-copy-evidence, 16.\u00A08.',
  },
  {
    cislo:
      'komplexný/kompletný servis **21/47** · dlhoročné skúsenosti **11/47** · profesionálny prístup **7** · individuálny prístup **7** · najlepšia cena **7** · bez starostí **2**',
    zdroj: 'tamtiež',
  },
  {
    cislo:
      'Na **416** weboch: profesionalita **98×**, skúsenosti **92×**, proces/stratégia **86×**, komplexný **64×**, ocenenia/najlepší **59×**, rýchlosť **49×**, osobný prístup **40×**',
    zdroj: 'copy-intelligence, 16.\u00A08.',
  },
  {
    cislo:
      'Prvý krok na webe = „Kontakt“ / telefón / všeobecný formulár: **267 zo 416 (64 %)**. Rezervácia termínu ako prvý krok: **15 zo 416 (3,6 %)**',
    zdroj: 'tamtiež',
  },
  {
    cislo:
      '„Jeden človek + celý aparát“ ako veta: **0 výskytov**. „Rozhodnutie pred inzerciou“: **0**. „Jeden maklér“: 6. „Predajná stratégia“: 12',
    zdroj: 'exact-phrase scan',
  },
  {
    cislo: '**2 034** ľudí v bratislavskom realitnom trhu, **2 006** priradených ku kancelárii',
    zdroj: 'broker-agency map, 15.\u00A08.',
  },
  {
    cislo:
      'BOSEN: ~**200** historických Google reklám; jedna (Svätý Jur, „komplexné služby a osobitný prístup“) 100–125 tis. zobrazení za 2,3 roka. Meta: 262 zachytených kariet, 52 s „komplexný/kompletný“',
    zdroj: 'Google Ads Transparency + Meta Library, 9.\u00A09.',
  },
  {
    cislo:
      'Jakub Chovanec: **3 832** sledovateľov, 12 reels **7 082 – 92 000** pozretí, medián **20 700**; pozemky **715 tis.**; jeho videá bytov 7–11 tis. Doložená platená podpora lokálnych tém (hrad: 4 642 účtov)',
    zdroj: 'IG + Meta Library, 9.\u00A09.',
  },
  { cislo: 'Adam: **3 € TikTok Promote → 16 000 pozretí**', zdroj: 'Adamov test' },
  { cislo: 'BOSEN: 160 maklérov, ~3 byty ročne na makléra', zdroj: 'Adamovo pozorovanie' },
  {
    cislo: 'Urban & Partner má na jednej stránke „už 20 rokov“ aj „Od roku 1999“ — v roku 2026',
    zdroj: 'urbanpartner.sk/o-nas',
  },
];

export const CITACIE_UVOD = 'Presné citácie s menami kancelárií (verejný text ich webov, august 2026):';

/** Poznámka packu pri jednej citácii (Relax Properties: „Individuálny prístup“ (celý blok)). */
export const CITACIE_POZNAMKY: Record<string, string> = {
  'Relax Properties': 'celý blok',
};

/** Rozdelí „a **b** c“ na segmenty [{text, bold}] pre vykreslenie bez dangerouslySetInnerHTML. */
export function boldSegments(s: string): { text: string; bold: boolean }[] {
  return s
    .split('**')
    .map((text, i) => ({ text, bold: i % 2 === 1 }))
    .filter((seg) => seg.text.length > 0);
}
