# V7-05 — Komiks

Vetva: `v7-05-komiks` · výstup: `work/v7/vystup/05/` · médiá: `public/v7/05/`

**Idea.** Domov je komiksová strana. Adam je postava komiksu: sestra, ktorá zistí, že AI vie niesť prácu za ľudí.

**Layout.** Mriežka komiksových panelov rôznych veľkostí; scroll odkrýva panel po paneli. Bubliny s textami blokov. Onomatopoje ako grafické prvky (KLIK, BEEP). Vyšetrenie ako posledný panel „pokračovanie nabudúce: ty“.

**Komponenty (minimum, smieš pridať).** layered-card (panely), sticker, shapes (bubliny, výbuchy), badge, marquee, carousel (chorobopisy ako epizódy), stat-card, sparkline, accordion, date-picker, time-picker, dialog. React Bits text efekty, Fancy na písmo.

**Pohyb.** Motion: panely „vpadnú“ s krátkym prekmitom a zatrasením; bubliny sa nafúknu (`--bk-ease-rubber`). Podpis: pri scrollovaní sa rámy panelov na zlomok sekundy posunú ako tlač s posunom farieb.

**Higgsfield.** 8–10 panelov v štýle pop art s halftone rastrom a hrubým obrysom, Adam ako komiksová postava (Soul ID + štýl). 2 krátke slučky 3 s (monitor bliká, papiere letia). Hero panel: Adam v uniforme s fonendoskopom, pozadie výbuch v žltej.

**Proti konkurencii.** Svojtko má maskota; tu je sám Adam ako hrdina a príbeh sa dá prečítať za 30 sekúnd. Nikto z konkurencie nemá príbeh podaný ako médium.

Iný než ostatné varianty: nepreberaj layout ani podpisový pohyb z iných konceptov v `work/v7/koncepty/`.
