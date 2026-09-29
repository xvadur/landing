# V7-01 — Monitor JIS

Vetva: `v7-01-monitor` · výstup: `work/v7/vystup/01/` · médiá: `public/v7/01/`

**Idea.** Celý domov je monitor pacienta na jednotke intenzívnej starostlivosti. Adam je pacient aj lekár: jeho vitálne funkcie sú živé čísla Korpusu.

**Layout.** Dashboard mriežka „obrazoviek“ cez celú plochu (desktop 12 stĺpcov, mobil 1). Scroll prepína medzi obrazovkami so snapom (príjem → vitálne → anamnéza → …). Horný pás: pacient XVADUR, čas, stav. EKG krivka beží pod celou stránkou ako navigácia (klik na kmit = skok na blok).

**Komponenty (minimum, smieš pridať).** gauge-chart, sparkline, heatmap-chart, stat-card, math-curve-background (EKG), tabs, badge, table, marquee (alarmy), sonner (alarm pri CTA), tooltip, date-picker + time-picker (vyšetrenie). Magic UI NumberTicker alebo NumberFlow na čísla.

**Pohyb.** BoldKit stupňovitý pohyb (`--bk-ease-step`), blikanie alarmov, prekresľovanie čísel po krokoch. Podpis: pri príchode na blok zaznie „alarm“ (vizuálne, bez zvuku) a čísla preskočia na živé hodnoty.

**Higgsfield.** Hero: loop 4 s, monitor pri posteli v nemocničnej izbe, EKG na obrazovke, tvrdé svetlo, risograf, potom cez BoldKit CRT efekt. Obrazovky sekcií: 3 statické zábery (sesterská stanica, chodba JIS, ruka na klávesnici s EKG na monitore). Adam: nálepka v uniforme (Soul ID).

**Proti konkurencii.** itashu je tmavý vesmír s hviezdičkami; tu je svetlý monitor so živými číslami, ktoré sa dajú overiť. Svojtko má obrí wordmark; tu je obrí XVADUR ako názov pacienta na monitore.

Iný než ostatné varianty: nepreberaj layout ani podpisový pohyb z iných konceptov v `work/v7/koncepty/`.
