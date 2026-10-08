# V7-04 — Triáž

Vetva: `v7-04-triaz` · výstup: `work/v7/vystup/04/` · médiá: `public/v7/04/`

**Idea.** Web ako triážna linka urgentného príjmu. Päť farieb triáže je presne paleta webu: alarmová červená, hot, žltá, biela, ink.

**Layout.** Vertikálny tok so stálou bočnou triážnou páskou (desktop vľavo, mobil hore ako pás). Každý blok má triážnu úroveň a farbu. Náramok pacienta ako hlavička. Vyšetrenie je „prijatie pacienta“ po krokoch.

**Komponenty (minimum, smieš pridať).** stepper, timeline, badge (triážne úrovne), layered-card, sticker, stat-card, radial-bar-chart, funnel-chart (cesta klienta), accordion (tézy), multi-step-form (vyšetrenie), input-otp alebo tag-input (príznaky), sonner. Motion Primitives na prechody pásky.

**Pohyb.** BoldKit `--bk-ease-stamp`: pečiatky a triážne štítky „dopadajú“ pri vstupe bloku. CSS `animation-timeline: view()` na odhaľovanie. Podpis: triážna páska sa pri scrollovaní prefarbí a pečiatka udrie na aktuálny blok.

**Higgsfield.** Päť pop-art / risograf obrazov, jeden na triážnu úroveň (sanitka, triážna sestra s tabletom, čakáreň, monitor, prepúšťacia správa). Hero: Adam ako triážna sestra, nálepka (Soul ID). Krátka slučka 3 s: blikajúci maják sanitky v risografe.

**Proti konkurencii.** Konkurencia predáva „AI riešenia“ všeobecne; triáž ukazuje, že Adam vie rozlíšiť, čo je urgentné, a klient sa v tom nájde za sekundu.

Iný než ostatné varianty: nepreberaj layout ani podpisový pohyb z iných konceptov v `work/v7/koncepty/`.
