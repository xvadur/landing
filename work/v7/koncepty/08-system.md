# V7-08 — Nemocničný systém

Vetva: `v7-08-system` · výstup: `work/v7/vystup/08/` · médiá: `public/v7/08/`

**Idea.** Web je desktop starého nemocničného informačného systému, prestavaný do neobrutalizmu. Bloky sú okná a aplikácie.

**Layout.** Plocha s ikonami a oknami, ktoré sa dajú otvárať, ťahať a zavrieť (desktop). Hlavný panel dole. Chorobopisy ako tabuľka pacientov s detailom. Vyšetrenie ako formulár prijatia. Mobil: okná ako karty pod sebou na celú šírku.

**Komponenty (minimum, smieš pridať).** dialog, resizable, menubar, context-menu, command (Cmd+K vyhľadávanie v systéme), sidebar, data-table (chorobopisy), tabs, tree-view, stat-card, heatmap-chart, date-picker, time-picker, sonner (systémové hlásenia). neobrutalism.dev window prvky podľa potreby.

**Pohyb.** Motion: okná sa otvárajú po krokoch (`--bk-ease-step`), ťahanie s tvrdým tieňom, systémové hlásenia. Podpis: pri načítaní „boot“ systému (niekoľko riadkov v Geist Mono), potom sa otvorí okno Príjem.

**Higgsfield.** Pozadie plochy: risograf obraz nemocničnej sesterskej stanice. Okno „kamera“: slučka 4 s Adam pri počítači v uniforme (Soul ID, potom CRT efekt). 4 ikony aplikácií ako ploché 3D objekty s obrysom.

**Proti konkurencii.** Konkurencia ukazuje screenshoty; tu si návštevník systém sám ovláda. Je to dôkaz, že Adam stavia systémy, nie iba stránky.

Iný než ostatné varianty: nepreberaj layout ani podpisový pohyb z iných konceptov v `work/v7/koncepty/`.
