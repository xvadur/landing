# V7-02 — Scroll-film

Vetva: `v7-02-film` · výstup: `work/v7/vystup/02/` · médiá: `public/v7/02/`

**Idea.** Jedna nepretržitá filmová jazda: od nemocničnej chodby cez dvere do dielne, kde pracujú agenti. Scroll je ovládač filmu.

**Layout.** Pinnutá scéna: video v ráme (80 % šírky, rám 3 px, tvrdý tieň) sa pri scrollovaní prehráva snímku po snímke (scroll-scrub). Karty blokov vchádzajú zboku nad video v kapitolách (anamnéza, liečba, chorobopisy). Po filme klasický koniec: tézy, vyšetrenie, zápis.

**Komponenty (minimum, smieš pridať).** layered-card (kapitoly), timeline (cesta), stat-card, sticker (Adam v rohu rámu), progress (priebeh filmu), carousel (chorobopisy), stepper (vyšetrenie po krokoch), multi-step-form, marquee. React Bits SplitText alebo GSAP SplitText na titulky kapitol.

**Pohyb.** GSAP ScrollTrigger scrub na `<video>` (currentTime) alebo sekvencia snímok v canvase. Podpis: film sa zastaví na tvrdom strihu a karta „dopadne“ s `--bk-ease-stamp`.

**Higgsfield.** Seedance 2.5 image-to-video, 3 zábery po 5 s spojené tvrdým strihom: (1) nemocničná chodba, sestra odchádza, (2) dvere s nápisom zmenenej smeny, (3) dielňa s monitormi a papiermi, agenti ako ploché piktogramy. Všetko ploché tvrdé svetlo, risograf. Kľúčové snímky 1920×1080, kódované s krátkym GOP (každá snímka kľúčová) kvôli scrubu.

**Proti konkurencii.** Nikto z konkurencie nerozpráva príbeh pohybom; itashu a nexana majú statické sekcie. Film je dôkaz osobného príbehu, ktorý konkurencia nemá.

Iný než ostatné varianty: nepreberaj layout ani podpisový pohyb z iných konceptov v `work/v7/koncepty/`.
