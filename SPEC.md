# Spec: nový xvadur.com (v9)

Stav: **návrh na schválenie**, 8. 10. 2026. Napísala session 2a52e58d z podkladu `_claude/handoff/2026-10-08-xvadur-com-spec.md`. Stavia nová konverzácia podľa časti „Postup buildu“. Čo je Adamovo rozhodnutie a čo môj návrh, je označené.

## Cieľ

Adam (8. 10.): „moderný, fakt kvalitný, prepracovaný web, ktorý pokorí celú slovenskú konkurenciu ponukou aj prevedením, motion designom a uvedením XVADURa. XVADUR je extrémne vzácny species.“ Laťka je najkrajší web roku 2025 (Awwwards, galéria https://claude.ai/artifact/R2suQHa1aopV1aAem1HC2s). Na Slovensku dnes nikto z 32 aktívnych konkurentov (`xvadur_core/06_firma/konkurencia-sk-ai-2026-10.md`) nemá web tejto triedy ani dôkaz s číslami.

Návštevník má po dvoch minútach vedieť:
1. Kto to je: zdravotník, ktorý žije v AI a stavia s ňou systémy.
2. Že je to skutočné: systémy bežia, každé číslo má pôvod.
3. Prečo je vzácny: osem rokov pri ľuďoch, elektrotechnika a top percento používateľov AI v jednom človeku.
4. Čo dostane: web a agenta, ktorí obslúžia jeho zákazníkov, za jasnú cenu.
5. Čo má urobiť: vyšetrenie zadarmo.

## Podmienka hotového

- Nový domov beží na xvadur.com, overený v prehliadači na 1440 aj 390 px so screenshotmi.
- Desať obrazoviek z tohto specu, každá s pohybom podľa specu a s pokojnou verziou pre `prefers-reduced-motion`.
- Každé číslo na webe má rozkliknuteľný pôvod: definícia, zdroj, dátum a metóda.
- Žiadne „10 rokov“ ani „vyhodili ma“ (platí `xvadur_core/01_pribeh/fakty.md`). Žiadna „živá“ hodnota staršia ako 48 hodín bez dátumu.
- Rezervácia vyšetrenia funguje cez existujúce API.
- `npm run check`, `npm test`, `npm run build` a QA skript `work/qa/v9.mjs` prejdú bez chýb a bez chýb v konzole.
- Adam povie, že sedí.

## Rozhodnutia Adama (8. 10.)

| Čo | Rozhodnutie |
|---|---|
| Fotky | vygenerovať cez Codex (skill `obrazok`) z jeho Soul fotky `public/v8/adam-hero.webp`, 0 € navyše |
| Cena | „500/250“: web a agent 500 €, starostlivosť 250 € mesačne (môj výklad, overiť jednou vetou pri F2); pred tým vyšetrenie zadarmo, moduly sa dokupujú |
| Jazyk | iba slovensky |
| Klienti | Jakub Olša aj Lucia s menom a snímkou webu |
| Dôkazy | Netopier, Korpus, GitHub, jadro a ďalšie materiály; výber spravia agenti |
| Smer | ide hlavne o dizajn; všetko doterajšie (V5.4 live, V7, v8, predloha 5. 10., Paper 6. 10.) je prekonané a slúži iba ako obsah |

## Návrhy Claude (schvaľuje Adam týmto specom)

- **Hlavná veta:** „Ostatní ťa AI učia. Ja v nej žijem.“ Odlišuje od celej slovenskej konkurencie, ktorá AI vyučuje (Gregor, Kiavčin, Digitálci, IT Learning), a röntgen ju ukazuje doslova: pod kožou je AI.
- **Druhá veta (manifest):** „Čo zostane, keď zavriem chat.“ Je to Adamov článok z 11. 9. Deep research z ChatGPT ho nezávisle navrhol ako najsilnejšiu tézu („I don't stop at the chat“).
- **Prvá obrazovka je röntgen** (predloha `work/predlohy/rontgen-hero.png`) podľa mechaniky víťaza roka, webu landonorris.com.
- **Bezplatná konzultácia sa volá Vyšetrenie zadarmo** a jej sekcia „Röntgen tvojej firmy“.
- **Stack:** ostáva Astro 7, GSAP, Lenis a Motion. Na WebGL pribudne OGL (asi 10 kB) namiesto three.js (asi 150 kB), lebo röntgen je 2D shader, nie 3D scéna.

## Hlas

Tyká, krátke vety, slovenčina s diakritikou, čísla iba z `fakty.md` a z `dokazy.json`. Vety z jadra, ktoré sa smú použiť doslova (`xvadur_core/07_texty/zasobnik.md`): „Osem rokov som debugoval ľudské telo.“, „Bojím sa paywallu, nie Terminátora.“, „Zmena príde potichu. Neprepustia ťa. Len už nikoho nenaberú.“, „Tutoriál nie je vedomosť.“, „Softvér bol zamknutý za vzdelaním.“, „Kurz ťa naučí, ako sa to robí. Ja ti to postavím.“ Rozmer sa hovorí ľudskou mierkou, nie metrikou (pamäť `rozmer-ludskou-recou`): 1,6 milióna slov je viac ako celý Harry Potter (1 084 170), kód je ako 15 programátorov počas dvoch rokov. Človekoroky, riadky kódu a tokeny na webe nie sú.

## Obrazovky

Poradie je príbeh: kto (1) → čo si myslí (2) → aký je veľký (3) → odkiaľ prišiel (4) → čo postavil (5, 6) → čo ti predá (7) → ako myslí (8) → čo robí dnes (9) → čo máš urobiť (10).

### 0. Úvod (pri prvej návšteve)
EKG čiara sa nakreslí cez prázdnu obrazovku, na vrchole sa z nej zloží ADAM RUDAVSKÝ a čiara odíde hore do röntgenu. Najviac 1,8 s, klikom sa preskočí, pri opakovanej návšteve sa nezobrazí (sessionStorage). Pri reduced motion sa nezobrazí.

### 1. Röntgen
- **Predloha:** `work/predlohy/rontgen-hero.png` a `work/referencie/lando-norris/01-hero-prilba.jpg`.
- **Obsah:** svetlá plocha s jemnými EKG čiarami. V strede portrét od hrude hore v žltej uniforme s červeným fonendoskopom. Vľavo hore ADAM (Instrument Serif) nad RUDAVSKÝ (Bricolage 800). V strede hore znak X. Vpravo hore žlté tlačidlo „Vyšetrenie“ a menu. Vľavo dole karta „Ďalší pacient · Tvoja firma · Vyšetrenie zadarmo“. Vpravo dole „Zdravotník, ktorý stavia s AI“.
- **Pohyb:** kruhová šošovka (priemer asi 34 vh) ide za kurzorom s oneskorením (lerp 0,12). V šošovke je röntgen tej istej hlavy: lebka, v nej plošný spoj a riadky Adamových verejných viet z jadra. Súkromné texty z korpusu nie. Okraj šošovky jemne láme obraz (OGL shader, záložná verzia cez CSS `mask-image`). Bez myši šošovka pomaly blúdi po tvári, aby obraz nebol mŕtvy (aj na snímke a na mobile). Na mobile sa šošovka ťahá prstom.
- **Prechod:** pri prvom posune sa portrét zmenší a cez röntgen sa po slovách zloží „Ostatní ťa AI učia. Ja v nej žijem.“ (pin na 100 vh). Pod ňou podnadpis: „Osem rokov som pracoval v zdravotníctve. Od januára 2025 robím s AI každý deň a napísal som jej viac slov ako celý Harry Potter. Tebe postavím web a agenta, ktorí obslúžia tvojich zákazníkov.“

### 2. Manifest
- **Predloha:** `lando-norris/02-podpis.jpg`, Terminal Industries v galérii.
- **Obsah:** tmavá plocha (atrament). Adamov podpis sa nakreslí žltou čiarou cez obrovský bežiaci pás „NEKONČÍM PRI ODPOVEDI · STAVIAM SYSTÉM OKOLO NEJ ·“. Pod ním nadpis „Čo zostane, keď zavriem chat.“ a tri vety z článku (`src/content/texty/co-zostane-ked-zavriem-chat.md`), ktoré sa pri posune rozsvecujú slovo po slove (SplitText scrub). Odkaz na celý článok.
- **Podpis:** z fotky jeho podpisu na papieri, ktorú vektorizujem. Kým nie je, kreslí sa znak X.

### 3. Vitálne funkcie
- **Predloha:** Anime.js v galérii (živá ukážka namiesto tabuľky).
- **Obsah:** monitor cez celú šírku, EKG čiara beží. Štyri hodnoty, každá s ľudským prekladom a odkazom „pôvod“:
  - Netopier dnes prečítal **N** dokumentov z **M** slovenských zdrojov (snímka pri builde s časom merania),
  - **1 624 283** slov napísaných AI, viac ako všetkých sedem kníh Harryho Pottera,
  - kód, ktorý by 15 programátorov bez AI písalo dva roky,
  - **7** spustených webov, dnes odpovedajú (overenie pri builde).
- **Pravidlo:** hodnota staršia ako 48 hodín ukáže „posledné meranie 6. 10.“ namiesto „naživo“.
- **Pôvod:** panel zboku (drawer) s definíciou, zdrojom, dátumom, metódou a vylúčeniami. Dáta sú v `src/data/v9/dokazy.json`.

### 4. Dve strany
- **Predloha:** `lando-norris/03-na-trati-mimo-trate.jpg`.
- **Obsah:** obrazovka rozdelená napoly. Vľavo „V uniforme“ (fotka v uniforme, profil): 2017 opatrovateľ v domove seniorov, 2021 sanitár na urgente, 12/2024 najlepší nezdravotnícky pracovník roka (iba s dokladom, inak bez), 5/2026 praktická sestra. Vpravo „V kóde“ (fotka v noci pri notebooku): 1. 1. 2025 AI každý deň, 5/2025 Aethero na nočných službách, 3/2026 XVADUR a prvý klient, dnes systémy pre ľudí a firmy. Stredom ide veta „Osem rokov som debugoval ľudské telo.“
- **Pohyb:** strana pod kurzorom sa rozšíri na 60 %, druhá stmavne. Na mobile sú strany pod sebou.

### 5. Sieň systémov
- **Predloha:** `lando-norris/04-sien-prilieb.jpg`, Tracing Art v galérii.
- **Obsah:** tmavá mriežka predmetov. Každý systém je jedno zátišie s rovnakým svetlom a pozadím (Codex), pod ním meno, rok a stav: beží, hotové, ukončené. Ukončené ostávajú, poctivosť robí dôveru. Návrh výberu (finálny spraví agent C): Aethero 2025 (zápisník), Kortex 2025, AI recepcia Elvi 2025 (telefón s hlasovou vlnou), OpenClaw / Jarvis 2026 (Telegram), Jakub 2026 (kľúče a kalendár), Lucia 2026, Senior Atlas 2026, Hriech 2026 (noviny), Netopier 2026 (radar), Korpus 2026 (kniha slov).
- **Pohyb:** pri prechode myšou sa predmet otočí o pár stupňov a zdvihne. Klik otvorí panel: problém, čo som postavil, čo robila AI, dôkaz s pôvodom, stav, odkaz.

### 6. Prípady
- **Jakub Olša, maklér** (hlboký prípad, celá obrazovka): „Problém nebol web.“ Reťaz návštevník → termín → agent v Telegrame → CRM → follow-up ako schéma, ktorá sa pri posune kreslí. 47 zo 47 kontrol pred vydaním, snímka jakubolsa.sk, citát od Jakuba, ak ho dodá.
- **Lucia, terapeutka:** web s rezerváciou, snímka a odkaz na demo.

### 7. Ponuka
- **Rozdiel:** „Kurz ťa naučí, ako sa to robí. Ja ti to postavím.“ Dva stĺpce: kurz (pozeráš, šablóny, si na to sám) proti XVADUR (povieš, kde to bolí; postavím; beží za teba; opravujem ja).
- **Cena:** karta „Web a agent · 500 € a 250 € mesačne“. Čo obsahuje: stavba, agent na Telegrame, nasadenie, starostlivosť. Moduly navyše: rezervácie, CRM, follow-up, reklama.
- **Pohyb:** karta ceny sa pri príchode „prihlási“ ako na monitore, číslice sa nabehnú (NumberFlow).

### 8. Ako myslím
Tri až štyri tézy obrovským písmom vo vodorovnom pine (posun zhora posúva tézy do strany). Pri každej malý podpis s rokom. Na konci odkaz na Texty a Hriech.

### 9. Teraz
Pás s dátumom aktualizácie: Staviam / Skúmam / Zmenil som názor na. Dáta v `src/data/v9/teraz.ts`. Starší ako 30 dní ukáže dátum výrazne.

### 10. Vyšetrenie
- **Obsah:** „Povedz mi, kde ťa to bolí.“ Tri krátke otázky: čo sa deje, čo sa opakuje alebo bolí, aké nástroje a dáta už máš. Potom štyri možné výsledky vyšetrenia: nič nestavať, zmeniť postup, prototyp, väčšia stavba. Potom výber termínu cez existujúce `/api/terminy` a `/api/rezervacia` (30 minút, online, zadarmo). Kontakt adam@xvadur.com a WhatsApp ako text.
- **Pätička:** XVADUR, Pezinok a Bratislava, GitHub, Texty, metódy čísel, čas posledného buildu.

### Navigácia
Sticky lišta s rovnakým rozložením ako hero: lockup, X, Vyšetrenie, menu. Menu cez celú obrazovku: Systémy, Prípady, Ponuka, Ako myslím, Teraz, Texty. Ďalšie URL (`/makleri`, `/skore`, `/kviz`, `/konzultacia`, `/texty`, `/hry`) ostávajú bez zmeny.

## Vizuálny systém

- **Farby:** papier `#F3F3EF`, atrament `#0E0F0D`, žltá z uniformy `#FFD60A` (jediný akcent, iba tlačidlá, podpis a značky), röntgen `#0A1626` a `#CFE3FF` (iba vnútri šošovky a v monitore). Červená fonendoskopu `#E0362C` iba ako signál (živé, chyba). Lando má dve farby, my máme dve a röntgen.
- **Písmo:** Instrument Serif (elegantná časť lockupu, citáty), Bricolage Grotesque 800 (nadpisy, tesný tracking), Geist (text, pribudne `@fontsource-variable/geist`), Geist Mono (čísla, štítky, pôvod). Space Grotesk z domova odchádza.
- **Mriežka:** 12 stĺpcov, návrh na 1440, okraje 40 px na desktope a 16 px na mobile.
- **Pohyb:** jeden podpisový pohyb na obrazovku, nič nehrá zbytočne. Lenis na posun, GSAP ScrollTrigger na piny (obrazovky 1, 2, 4, 8), SplitText na vety, OGL na šošovku. Krivky `expo.out` a `power3.inOut`, trvanie 0,6–1,2 s. Tlačidlá jemne magnetické. Vlastný kurzor iba na desktope s myšou.
- **Reduced motion:** bez pinov a šošovky. Röntgen ako statický rozdelený obraz, prechody 120 ms fade.

## Fotky a obrazy (Codex, skill `obrazok`, výstup `public/v9/`)

Jednotné štúdiové svetlo, čisté pozadie, rovnaká tvár podľa `public/v8/adam-hero.webp`.
1. `tvar.webp`: portrét od hrude hore v uniforme, výrez.
2. `rontgen.webp`: röntgen tej istej hlavy, rovnaká poloha a mierka ako `tvar.webp`. Vrstvy musia sedieť na pixel, posun sa doladí CSS premennými.
3. `uniforma.webp`: profil v uniforme na chodbe.
4. `kod.webp`: v noci pri notebooku, svetlo z obrazovky.
5. `systemy/*.webp`: 8–10 zátiší predmetov siene systémov, rovnaké svetlo a pozadie.
6. `og.png`: obrázok na zdieľanie z röntgenu.

Pred kódom každej obrazovky musí existovať jej predloha (obrázok) a stavia sa podľa nej (pamäte `obrazok-je-zadanie`, `kompozicia-z-predlohy-nie-z-tabulky`).

## Dôkazy: úloha pre agentov (Adamovo rozhodnutie)

Tri agenti naraz, iba na čítanie, model Sonnet, effort medium, strop 45 minút každý, odhad spolu do 1 milióna tokenov. Spúšťa ich nová konverzácia v F1, Adamovi pred spustením povie počet, model, čas a odhad.

- **A, Netopier a Hriech:** dokumenty spolu a za posledný deň, počet zdrojov, Národná rada, matica reči. Tri najsilnejšie verejné nálezy, stav hriech.xvadur.com. Zdroj `projekty/hriech/netopier/data/netopier.sqlite`, `STATUS.md`, `SMER.md`.
- **B, Korpus a GitHub:** slová (30 dní a spolu), správy, commity (90 dní a spolu), repozitáre, ktoré weby dnes odpovedajú HTTP 200. Pri každom definícia a čo je vylúčené. Žiadny text správ a nič súkromné. Zdroj `projekty/adam.xvadur/var/corpus.sqlite` (iba počty), `git log` repozitárov, `_claude/profil.md`.
- **C, klienti a jadro:** Jakub (47/47, čo beží, čo nie, leady), Lucia (demo, stav), systémy z `xvadur_core/02_dielo/register.md` (rok, stav, jedno overené číslo, predmet do siene), doklady k oceneniu 2024 a k maturite 2026.

Výstup: `src/data/v9/dokazy.json`, každá položka `{ id, tvrdenie, hodnota, jednotka, definicia, zdroj, datum, metoda, odkaz, verejne }`, a `src/data/v9/systemy.json`. Na web ide iba `verejne: true`. Finálny výber na stránku spraví hlavná session a ukáže ho Adamovi.

## Technika

- **Vetva** `v9` z `main` (na `main` je V5.4 s funkčným API). Komponenty v `src/components/v9/`, dáta v `src/data/v9/`, obrázky v `public/v9/`. `src/pages/index.astro` dostane nový domov, staré komponenty ostanú do upratania po nasadení.
- **Závislosti navyše:** `ogl`, `@fontsource-variable/geist`. GSAP SplitText je v GSAP 3.15 zadarmo.
- **Výkon:** JavaScript domova do 220 kB gz. Obrázky AVIF a WebP so `srcset`. LCP pod 2,5 s na mobile (4G). Shader sa spustí až po prvom vykreslení.
- **Prístupnosť:** ovládanie klávesnicou, viditeľný focus, alt texty, kontrast AA, šošovka má aj textový popis.
- **QA:** `work/qa/v9.mjs` (Playwright: 1440, 390, reduced motion, chyby konzoly, vodorovné pretečenie, snímky každej obrazovky do `work/screens/v9-*`).

## Postup buildu (nová konverzácia)

Každá fáza končí commitom, zápisom do `STATUS.md` a snímkami pre Adama. Ďalšia fáza ide, až keď Adam povie, že sedí.

| Fáza | Čo | Výstup |
|---|---|---|
| F0 | vetva `v9`, závislosti, tokeny, fonty, kostra stránky s desiatimi sekciami a Lenisom | kostra beží lokálne, build prejde |
| F1 | agenti A, B, C (po Adamovom súhlase s počtom a cenou); naraz obrázky 1–4 cez Codex | `dokazy.json`, `systemy.json`, `public/v9/` |
| F2 | predloha každej obrazovky (obrázok, skill `obrazok`), Adam ich vidí naraz v jednej galérii; overiť výklad ceny „500/250“ | schválené predlohy v `work/predlohy/v9/` |
| F3 | úvod a Röntgen v kóde (šošovka, prechod na hlavnú vetu) | snímky 1440 a 390 + krátke video pohybu |
| F4 | Manifest a Vitálne funkcie s pôvodom | snímky |
| F5 | Dve strany a Sieň systémov s panelom | snímky |
| F6 | Prípady, Ponuka, Ako myslím, Teraz | snímky |
| F7 | Vyšetrenie s rezerváciou, menu, pätička | rezervácia otestovaná proti `wrangler dev` |
| F8 | leštenie pohybu, mobil, výkon, prístupnosť, OG | QA skript bez chýb, Lighthouse |
| F9 | na slovo „deploy“: verzia Workera bez trafficu, potom produkcia, overenie na xvadur.com | snímka živého webu |

## Mimo rozsahu

Angličtina, CMS, 3D modely, nové podstránky (okrem panelov systémov), redizajn `/makleri`, `/skore`, `/kviz` a `/texty`, prihlásenie do Awwwards (platené, neskôr na pokyn), automatická aktualizácia živých čísel cez cron alebo LaunchAgent (externý krok, iba na pokyn; do vtedy snímka pri builde).

## Otvorené (predvolené riešenie v zátvorke)

- Doména (xvadur.com) a nefunkčné www.xvadur.com (opraviť v F9, úloha XDR-212).
- Výklad ceny „500/250“ (web a agent 500 €, 250 € mesačne).
- Podpis z fotky na papieri (kým nie je, znak X).
- Citát od Jakuba a od Lucie (bez citátu).
- Doklad k oceneniu 2024 a k maturite 2026 (bez dokladu sa ocenenie nepíše).
- Resend secrets na potvrdzovacie e-maily rezervácie (bez e-mailu, rezervácia sa uloží).

## Zdroje

`_claude/handoff/2026-10-08-xvadur-com-spec.md`, galéria `work/referencie/top-weby-2025.html`, `work/referencie/lando-norris/`, `work/research/2026-10-07-chatgpt-deep-research.md`, `work/predlohy/rontgen-hero.png`, `xvadur_core/01_pribeh/fakty.md`, `xvadur_core/07_texty/zasobnik.md`, `xvadur_core/04_myslenie/svetonazor.md`, `xvadur_core/02_dielo/register.md`, `xvadur_core/06_firma/konkurencia-sk-ai-2026-10.md`, `xvadur_core/06_firma/trh-ai-sk-cz-2026-10.md`, Paper https://app.paper.design/file/01M3Z15GZ1WBSYCZQ2Q9K4SVB1 (obsah).
