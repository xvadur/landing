# V7-07 — Orientačný systém nemocnice

Vetva: `v7-07-orientacia` · výstup: `work/v7/vystup/07/` · médiá: `public/v7/07/`

**Idea.** Web je nemocničná chodba s orientačným systémom: pavilóny, obrie šípky, piktogramy, výťah. Návštevník sa riadi značením.

**Layout.** Vodorovná chodba (desktop): pinnutý vodorovný posun cez pavilóny A–F, každý pavilón je blok. Obrie šípky a čísla pavilónov. Mobil: zvislý tok s tými istými tabuľami. Menu je výťahový panel s tlačidlami poschodí.

**Komponenty (minimum, smieš pridať).** navigation-menu, kbd (tlačidlá výťahu), shapes (šípky, piktogramy), badge, marquee (bežiaca tabuľa), stat-card, gauge-chart, timeline, carousel, date-picker, time-picker, tooltip. Motion Primitives alebo Magic UI na pohyb tabúľ.

**Pohyb.** GSAP ScrollTrigger vodorovný posun (pin + x). Podpis: pri prechode pavilónom sa preklopí veľká tabuľa ako na letisku (split-flap) s názvom bloku.

**Higgsfield.** Seedance: 6 s panoramatický dolly nemocničnou chodbou s orientačnými tabuľami, ploché svetlo, halftone (poistka: BoldKit halftone efekt). 6 statických obrazov pavilónov (piktogramy, dvere, výťah). Adam ako nálepka pri recepcii (Soul ID).

**Proti konkurencii.** Nikto z konkurencie nerieši orientáciu návštevníka; tu je navigácia zážitok a návštevník vždy vie, kde je a kam ide (vyšetrenie = cieľ chodby).

Iný než ostatné varianty: nepreberaj layout ani podpisový pohyb z iných konceptov v `work/v7/koncepty/`.
