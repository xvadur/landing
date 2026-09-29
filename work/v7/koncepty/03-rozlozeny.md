# V7-03 — Rozložený nástroj (exploded view)

Vetva: `v7-03-rozlozeny` · výstup: `work/v7/vystup/03/` · médiá: `public/v7/03/`

**Idea.** Ústredný objekt, fonendoskop spojený s čipom, sa pri scrollovaní rozloží na súčiastky. Každá súčiastka je jedna služba alebo projekt.

**Layout.** Objekt v strede obrazovky, pinnutý. Scroll ho rozkladá; od každej súčiastky vedie čiara k štítku (liečba 01–03, chorobopisy). Pod tým bento s detailmi a vyšetrenie.

**Komponenty (minimum, smieš pridať).** shapes (štítky a šípky), badge, card, hover-card (detail súčiastky), tabs, gauge-chart a sparkline (vitálne), timeline (anamnéza), date-picker, time-picker, sonner. Aceternity alebo Magic UI Beam na spojovacie čiary.

**Pohyb.** GSAP scrub na sekvenciu snímok (image sequence v canvase) alebo na vrstvy objektu v CSS 3D. Podpis: posledný krok rozkladu sa zastaví a súčiastky sa „zacvaknú“ do mriežky (`--bk-ease-rubber`).

**Higgsfield.** Hero objekt: ploché 3D s hrubým obrysom (fonendoskop + čip + káble), biele pozadie. Seedance: 5 s video „exploded view“ toho istého objektu (súčiastky sa rozídu do strán), statická kamera, tvrdé svetlo. 6 detailov súčiastok ako statické obrázky pre štítky.

**Proti konkurencii.** Exploded view je technika prémiových produktových webov; nikto v konkurencii ju nepoužíva na službu. Ukazuje, z čoho sa agent skladá, namiesto sľubu.

Iný než ostatné varianty: nepreberaj layout ani podpisový pohyb z iných konceptov v `work/v7/koncepty/`.
