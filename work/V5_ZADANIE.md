# V5 — zadanie (dohoda 26. 9. 2026)

Linear: tím Xvadur, projekt xvadur.com, míľnik „V5 · Predajný web“. Popis úlohy v Lineari je zadanie; tento súbor je kostra, aby agent mal všetko v repe.

**Cieľ:** web nie je vizitka. Je to naložený neobrutalistický vizuálny zážitok, ktorý predáva a je pripravený na platenú reklamu. Mobil prvý. Vendorované komponenty naplno, symboly (X, šípka, hviezdička, pečiatka, nálepky).

Vetva `v5` z `main`. Žiadny push ani deploy bez Adamovho slova „deploy“. Náhľad: `npm run build && npx wrangler versions upload -c dist/server/wrangler.json`.

## Kostra domova

| # | Sekcia | Úloha | Jadro |
|---|---|---|---|
| 0 | Opona | — | ostáva ako v4 (`Opona.astro`), hero sa z nej rozloží |
| 1 | Hero | XDR-205 | menu v jednom riadku + stále „Konzultácia“; XVADUR cez šírku (o štvrtinu menší ako v4) s čiarou XVA \| DUR, náklon za kurzorom; motto „DIVIDED, WE ARE USELESS.“ (dešifrovanie); fotka ako nálepka cez D-U-R; veta + „Dohodni si konzultáciu“ + „Kto som ↓“; čierna lišta so živými číslami a zelenou diódou; symboly s parallaxom, ClickSpark. Preč: pilulky, stavový pás, vodoznak, menu pod wordmarkom. |
| 2 | Kto som | XDR-206 | 7 zastávok, pinnutá sekcia s vodorovným pohybom (GSAP ScrollTrigger); mobil = karty so swipe; reduced motion = statický zoznam |
| 3 | Pred a po | XDR-207 | dve karty: deň bez agenta ✕ / s agentom ✓ (booking a follow-upy, Korpus, Netopier) + pás výsledkov |
| 4 | Izba dôkazov | XDR-208 | projekty ako karty so štítkami, číslom, obrázkom a overeným odkazom s dátumom; senior/gramata „čoskoro“; Jakub ako prípadová štúdia |
| 5 | Služba a produkty | XDR-209 | vlajka = konzultácia 30 min; produkty ako čakačky („Chcem vedieť ako prvý“): kohorta „Postav si prvého agenta“ (január), „Agent pre teba“ (Telegram, 90 dní), harness kit, webinár „Claude Code po slovensky“; blok „prečo nie iba ChatGPT“ |
| 6 | Konzultácia | XDR-210 | rezervácia 30 min cez kalendár na webe, WhatsApp druhá možnosť; tlačidlo na každej stránke; udalosti klik a rezervácia |
| 7 | Zber e-mailov | XDR-211 | jeden formulár, e-mail + zdroj (produkt / lákadlo / UTM) do úložiska, potvrdenie cez Resend; lákadlo za e-mail |
| 8 | Texty, Hriech, hry | XDR-214 | posledný článok + Hriech; hry ako jedna karta „čoskoro“; nič „V STAVBE“ bez dizajnu |

Mimo V5 v tomto kole: XDR-213 (šablóna), XDR-212 (domény, deploy).

## Pravidlá

- Fakty iba zo `src/data/fakty.ts`. Rozpory (XDR-200) ostávajú v dnešnom znení a sú označené komentárom.
- Makléri, kvíz a skóre ostávajú na svojich URL; z domova a hlavného menu ustúpia.
- Externé odkazy iba s overeným HTTP 200 a dátumom overenia.
- Mobil 375 px bez horizontálneho scrollu, ciele ≥ 44 px, reduced motion = statické.
- Hotové = `npm run check`, `npm run build`, `npm test` zelené + Playwright screenshoty 1440 a 375.

Konkurencia a laťka: `work/V5_KONKURENCIA.md`. Pravidlá dizajnu: `STACK.md` → „Zákon dizajnu“.
