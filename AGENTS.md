# Agenti v repe xvadur.com (v4)

- Zákon dizajnu: `~/xvadur_brand/xvadur_web_v4/10_VYBER_KNIZNIC_A_KOMPONENTOV.md`. Obsah: `05_WEB_V4_SPECIFIKACIA.md`. Ratifikácie: `01_SMEROVANIE.md` §7–§8.
- Kontrakt základu (cesty, tokeny, utility, Base, dáta, ostrovy, porty): `work/NOTES_zaklad.md`. Každý agent píše svoje poznámky do `work/NOTES_<meno>.md`.
- Zdieľané súbory (`astro.config.mjs`, `tsconfig.json`, `package.json`, `src/layouts/**`, `src/styles/**`, `src/components/site/**`, `src/components/vendor/**`, `src/data/**`, `src/lib/utils.ts`) sú pre page agentov len na čítanie; zmenu opíšu v NOTES.
- Slovenčina s diakritikou, žiadne lorem, žiadne vymyslené čísla (každé číslo má zdroj v `src/data/fakty.ts` alebo v packoch). Externé odkazy len s overeným HTTP 200.
- Build agenta: `npx astro build --outDir dist-<meno>`; preview `python3 -m http.server <port> -d dist-<meno>/client`; žiadny `astro dev`, žiadne browser MCP tooly; žiadny commit/push bez poverenia.
- Mobil 375 px bez horizontálneho scrollu, 16 px okraje, ciele ≥ 44 px, `prefers-reduced-motion` = 120 ms fade.
- Nič nie je hotové, publikované ani nasadené, kým to nie je odškrtnuté. Push len na Adamovo slovo „deploy“.
