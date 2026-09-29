# V7 — spustenie 10 cloudových sessions

Predpoklady (raz, Adam):
1. Vetva `v7-zaklad` je pushnutá na GitHub (`xvadur/landing`).
2. Cloudové prostredie má sieť Custom podľa `SIET.md`.
3. Higgsfield sa v tomto kole nerobí (Adam 29. 9. 2026): konektor, rozpočet kreditov ani Soul ID netreba. Varianty majú zástupné plochy a prompty v `SHOTS.md`; Higgsfield príde v druhom kole pre vybrané varianty.

Spustenie z koreňa repa na vetve `v7-zaklad` (cloud klonuje aktuálnu vetvu z GitHubu), každý príkaz = samostatná session:

```bash
claude --cloud "Si agent V7-01. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/01-monitor.md a postav variant podľa nich na vetve v7-01-monitor. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
claude --cloud "Si agent V7-02. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/02-film.md a postav variant podľa nich na vetve v7-02-film. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
claude --cloud "Si agent V7-03. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/03-rozlozeny.md a postav variant podľa nich na vetve v7-03-rozlozeny. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
claude --cloud "Si agent V7-04. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/04-triaz.md a postav variant podľa nich na vetve v7-04-triaz. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
claude --cloud "Si agent V7-05. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/05-komiks.md a postav variant podľa nich na vetve v7-05-komiks. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
claude --cloud "Si agent V7-06. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/06-lekaren.md a postav variant podľa nich na vetve v7-06-lekaren. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
claude --cloud "Si agent V7-07. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/07-orientacia.md a postav variant podľa nich na vetve v7-07-orientacia. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
claude --cloud "Si agent V7-08. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/08-system.md a postav variant podľa nich na vetve v7-08-system. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
claude --cloud "Si agent V7-09. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/09-plagat.md a postav variant podľa nich na vetve v7-09-plagat. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
claude --cloud "Si agent V7-10. Prečítaj work/v7/ZADANIE.md, work/v7/HIGGSFIELD.md a work/v7/koncepty/10-instrumentar.md a postav variant podľa nich na vetve v7-10-instrumentar. Higgsfield nepoužívaj, iba zástupné plochy a SHOTS.md. Pracuj autonómne do podmienky hotového, potom pushni vetvu."
```

Alebo v desktop appke: nová session → Cloud → repozitár xvadur/landing, vetva `v7-zaklad` → rovnaký text.

Po dobehnutí hlavná session stiahne všetky vetvy `v7-*`, postaví ich lokálne, prejde v prehliadači (1440 a 375) a pripraví porovnanie pre Adama.
