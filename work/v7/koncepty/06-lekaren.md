# V7-06 — Lekáreň

Vetva: `v7-06-lekaren` · výstup: `work/v7/vystup/06/` · médiá: `public/v7/06/`

**Idea.** Služby sú lieky na recept. Každá liečba je balenie s príbalovým letákom: indikácia, dávkovanie, účinok, vedľajšie účinky (vtipne).

**Layout.** Regál lekárne ako mriežka balení. Klik na balenie otvorí príbalový leták (sheet alebo drawer). Hero: Adam za pultom lekárne. Chorobopisy ako „recepty“ klientov. Vyšetrenie ako „predpis“.

**Komponenty (minimum, smieš pridať).** card, hover-card, sheet alebo drawer (leták), accordion (časti letáku), tabs, badge, rating, stat-card, donut-chart, sticker, date-picker, time-picker, sonner. Magic UI 3D karta alebo Aceternity 3D card na naklápanie balení.

**Pohyb.** Motion: naklápanie balení za myšou (3D), otvorenie letáku ako rozloženie papiera. Podpis: balenie sa pri hoveri pootočí a ukáže zadnú stranu so zložením.

**Higgsfield.** Product-photoshoot `conceptual_product`: 3–5 krabičiek liekov XVADUR v neobrutalizme (hrubý obrys, ploché farby, tvrdý tieň), jedna na službu, čisté pozadie. Hero: Adam za pultom (Soul ID). Slučka 4 s: krabička sa otáča na pulte.

**Proti konkurencii.** nexana a valeriana majú cenníky v tabuľkách; tu je ponuka hmatateľná ako produkt v regáli a každá služba má jasnú indikáciu. itashu má tri produkty; tu sú tri lieky s letákom, ktorý sa dá čítať.

Iný než ostatné varianty: nepreberaj layout ani podpisový pohyb z iných konceptov v `work/v7/koncepty/`.
