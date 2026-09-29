# V7 — Higgsfield médiá v neobrutalizme

Higgsfield je hlavný zdroj médií pre V7. Použiť ho poriadne: hero video alebo loop, obrázky sekcií, textúry, pohybové slučky. Každý variant má vlastný zoznam záberov v koncepte.

## Prístup

- Higgsfield MCP (`https://mcp.higgsfield.ai/mcp`), keď je konektor v prostredí autorizovaný. Alebo oficiálny skill `higgsfield-ai/skills` (`higgsfield-generate`) s Higgsfield CLI.
- Keď Higgsfield v prostredí nie je dostupný: stav variant s **presnými zástupnými plochami** (rovnaký pomer strán, poster z CSS/SVG, štítok `HIGGSFIELD: <id záberu>`) a všetky prompty zapíš do `work/v7/vystup/NN/SHOTS.md`, aby sa dali vygenerovať neskôr jedným behom. Web musí vyzerať hotovo aj so zástupnými plochami.
- **Rozpočet kreditov na variant:** `ROZPOCET_KREDITOV` (doplní Adam pred spustením). Pred generovaním spíš plán záberov s odhadom ceny do `SHOTS.md` a drž sa rozpočtu.
- Poradie: najprv jeden hero obrázok, kontrola proti pravidlám nižšie, potom video z neho (image-to-video), potom zvyšok.

## Modely (výber podľa záberu)

| Záber | Model |
|---|---|
| portrét Adama | Soul so Soul ID (`SOUL_ID_ADAMA`, doplní Adam; bez neho sa Adamova tvár negeneruje, iba zástupná plocha) |
| hero video, filmový záber, scroll-scrub | Seedance 2.5 alebo Kling 3.0 (image-to-video z hero obrázka), Veo 3.1 pri zábere so zvukom |
| obrázky sekcií, objekty, produkty | GPT Image, Nano Banana, Seedream, Flux |
| textúry, pozadia, slučky | Seedream / Flux (obraz), Seedance (krátka slučka 3–5 s, bezšvová) |

## Pravidlá štýlu (povinné v každom prompte)

Neobrutalizmus je rám, Higgsfield je obsah v ráme. Médium musí ladiť s webom:

- **Paleta v obraze:** ink (takmer čierna), teplý papier, biela, citrónová žltá #ffe600, alarmová červená, oranžová #ed4e26 iba ako akcent. Žiadne pastely, žiadny modrý „tech“ nádych, žiadny tmavý vesmír.
- **Svetlo:** tvrdé, ploché, vysoký kontrast. Žiadne mäkké filmové svetlo, bokeh, lens flare, hmla, gradienty.
- **Grafické smery, ktoré sedia:** pop art, risograf (dvojfarebná tlač s posunom), halftone raster, papierová koláž, plastelína / claymation, ploché 3D s hrubým obrysom, izometria s tvrdými tieňmi, nemocničná piktografia.
- **Obrysy:** hrubé čierne obrysy objektov, kde to štýl dovolí.
- **Pohyb vo videu:** tvrdé strihy, zastavenia, skoky; kamera statická alebo presný dolly. Nie plávajúci dron, nie spomalené rozplývanie.
- **Zdravotnícka línia:** nemocnica, sestra, fonendoskop, EKG, monitor, chorobopis, triáž, lieky, nástroje. Nie polícia, spis, detektív.
- **Negatívny prompt (vždy):** soft light, bokeh, lens flare, fog, gradient, pastel colors, blue tint, dark space background, glossy 3D, text, logos, watermark, extra fingers.

Príklad štýlového dovetku k promptu (EN):
`flat hard light, high contrast, thick black outlines, limited palette of ink black, warm paper, lemon yellow #ffe600 and alarm red, risograph print texture with slight misregistration, neo-brutalist poster aesthetic`

## Na webe

- Video a obraz sedia v neobrutalistickom ráme (rám 3 px, tvrdý tieň), ako okno, monitor alebo nálepka. Plná šírka bez rámu iba tam, kde to koncept výslovne chce.
- Poistka: realistický záber sa dá prefiltrovať BoldKit canvas efektom (dither, halftone, CRT) do štýlu webu.
- Fotka Adama je nálepka: výrez, obrys ink 3 px, tvrdý tieň, natočenie ±2°. Podľa XDR-199: od ramien hore, zdravotnícka uniforma, fonendoskop.
- Súbory: `public/v7/NN/`, video s posterom, `preload="metadata"`, do 4 MB na klip, H.264 (+ AV1 ak je čas).
- Do `SHOTS.md` ku každému médiu: id, prompt, negatívny prompt, model, pomer strán, dĺžka, cena v kreditoch, cesta k súboru.
