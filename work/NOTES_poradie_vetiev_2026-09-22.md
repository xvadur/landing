# Vetvy a Cloudflare — 22. 9. 2026

Zadanie: zachovať aktuálny main ako jedinú pracovnú vetvu a zistiť, či hlavná doména stále závisí od staging Pages. Súčasť širšej prípravy na polish, copy, layout, indexovanie a reklamy.

## Overené vstupy

- Lokálny aj vzdialený main: `fd4f2e45b629a7d891718dc610a33203e69f3796`.
- staging: `170bc3450b11291b33a381961395e77477af9eb7`; žiadne commity mimo main.
- hry-wip: `8fe7cc8f01f4cb57b325fafc69e3c6ae38e1d7fa`; jeden nezlúčený snapshot nedokončených hier a zmiešaných rozpracovaných zmien. Nemergovať celý snapshot do aktuálneho webu.
- claude/hero-pojebane-86a898: `6cb9453d2730f57d0a8937aa457d5a03222a7fd2`; jedna nezlúčená zmena wrangler.jsonc (custom domains pre apex aj www). Aktuálna produkcia má custom domain iba pre apex; commit nebol prevzatý.
- Hlavný checkout aj Claude worktree mali čisté tracked/untracked súbory. Claude worktree má 760 MB vrátane ignorovaných súborov; nemaže sa.
- Čítané: AGENTS.md, README.md, STATUS.md, work/NOTES_zaklad.md, najnovší brand handoff, Git refs/diffy, wrangler.jsonc, autentifikované Cloudflare API a verejné HTTP URL.

## Záloha a stav odstránenia

Kompletný Git bundle: `/Users/xvadur_mac/xvadur.com/.git/branch-backups/2026-09-22/before-cleanup.bundle`.

`git bundle verify` potvrdil samostatnú úplnú históriu a všetky štyri refs. Je lokálny, nie uploadnutý.

Príklad obnovy v prípade neskoršej potreby:

```sh
git fetch .git/branch-backups/2026-09-22/before-cleanup.bundle refs/heads/hry-wip:refs/heads/restore-hry-wip
```

Prvý pokus zastavila automatická kontrola oprávnení. Adam následne výslovne potvrdil odstránenie. Vzdialené staging a hry-wip boli atómovo odstránené s kontrolou pôvodných SHA. Lokálne staging, hry-wip a claude/hero-pojebane-86a898 boli odstránené. Ostáva iba main, nastavený na sledovanie origin/main. Claude worktree bol prepnutý na detached HEAD na rovnakom commite 6cb9453; jeho súbory vrátane ignorovaných ostali zachované. Main a jeho história sa nezmenili. Zápis statusu a tohto receipt ostáva lokálny, bez commitu a deployu.

## Cloudflare — aktuálny stav

- Prihlásenie cez existujúci Wrangler OAuth funguje mimo sieťového sandboxu; nový login nebol potrebný.
- xvadur.com: HTTP 200, HTML build fd4f2e4; Worker xvadur-com, production, aktívna custom domain.
- www.xvadur.com: ENOTFOUND; bez custom domain v API.
- staging.xvadur.com: HTTP 403, CNAME Cross-User Banned.
- landing-con.pages.dev a staging.landing-con.pages.dev: ENOTFOUND.
- Pages API/CLI: iba projekt jozef. Projekty landing a landing-con neexistujú v tomto účte.
- Zone routes pre apex aj www stále smerujú na xvadur-com.
- Deployment 2623bc0e-bacf-4e86-b339-6a543782c277, vytvorený 21. 9. 2026 02:26:38 UTC; verzia 7ae70634-bce2-4e2a-a942-8cff0c477270 na 100 %.

Žiadny deploy, zmena DNS, domén ani Cloudflare projektu nebola vykonaná. Zladenie wrangler.jsonc, oprava www a odstránenie neplatného staging DNS ostávajú samostatné otvorené kroky.

## Pokračovanie pôvodnej práce

Prvá orientácia potvrdila chýbajúci sitemap.xml (HTTP 404), existujúce canonical a OG metadáta, prázdny Stripe odkaz a rozostavané hry. Desktop/mobil hero boli vizuálne skontrolované po animácii; šírka 375 px pri prvej kontrole bez horizontálneho overflow. Toto nie je celowebový QA ani overenie Google indexácie. Vizuálny smer zachovať.
