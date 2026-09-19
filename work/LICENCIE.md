# Licencie — xvadur.com v4 (overené 19. 9. 2026, `gh api repos/<repo>` + LICENSE + package.json)

| Knižnica | Licencia | Stav | Poznámka |
|---|---|---|---|
| React Bits (DavidHDev/react-bits) | **MIT + Commons Clause v1.0** (gh api: NOASSERTION) | **limit** | Použitie v komerčnom webe je dovolené („as part of an application, website, or product“). Zakázané: predávať, sublicencovať alebo redistribuovať komponenty samotné — samostatne, v balíku alebo ako port. Vendorovať do `src/components/vendor/react-bits/` je v poriadku, kým je to súčasť webu; **nesmú ísť do zdieľaného `packages/ui` ako distribuovaný kit** (HAPEN, Lucia). V každom prevzatom súbore ponechať hlavičku s copyrightom „(c) 2026 David Haz“. Nie je to čisté MIT → Vendor fáza nech pri každom komponente zváži Fancy/Magic UI ekvivalent, ak existuje. |
| Fancy Components (danielpetho/fancy) | MIT | ok | copy-paste, ponechať notice |
| Magic UI (magicuidesign/magicui) | MIT | ok | copy-paste, ponechať notice |
| Motion Primitives (ibelick/motion-primitives) | MIT | ok | copy-paste, ponechať notice |
| neobrutalism.dev (ekmas/neobrutalism-components) | MIT | ok | shadcn registry, vendorovaný kód; neudržiavané nevadí |
| @paper-design/shaders + shaders-react | **Apache-2.0** (nie MIT, ako uvádza doc 10) | ok | permisívna; ponechať LICENSE/NOTICE v node_modules (npm balík, nie copy-paste) |
| GSAP 3.15 (+ ScrollTrigger, SplitText…) | GSAP Standard „no charge“ License (Webflow, účinná 30. 4. 2025) | ok | „Permitted Uses“ = akýkoľvek web/webapp, komerčné použitie a všetky pluginy zadarmo (FAQ: „Can I really use GSAP in commercial projects without paying anything? Yes“). Zakázané len no-code animačné nástroje konkurujúce Webflow. Neodstraňovať notices. |
| Rive runtime (@rive-app/react-canvas-lite, canvas-lite; rive-app/rive-react, rive-wasm) | MIT | ok | editor zadarmo, platí sa až pri exporte (Cadet) — v1 bez maskota, netýka sa |
| Motion (`motion`) | MIT | ok | |
| Lenis | MIT | ok | |
| vaul · sonner · cmdk · radix-ui | MIT | ok | |
| NumberFlow · auto-animate · Embla | MIT | ok | |
| Phosphor Icons React | MIT | ok | |
| matter-js | MIT | ok | |
| tw-animate-css · clsx · tailwind-merge · CVA | MIT | ok | |
| satori | MPL-2.0 | ok | používa sa len pri builde (OG karty); MPL vyžaduje zverejniť zmeny v samotnom satori, nie v našom kóde — žiadne zmeny nerobíme |
| @resvg/resvg-js | MPL-2.0 | ok | build-time only, to isté |
| Fonty: Bricolage Grotesque, Space Grotesk, Geist Mono, Instrument Serif (fontsource) | OFL-1.1 | ok | self-host povolený, nepredávať fonty samostatne |
| Astro · React · Tailwind · @astrojs/* | MIT | ok | |

**Zhrnutie:** jediný limit je React Bits (MIT + Commons Clause): dovolené vo webe, zakázané redistribuovať komponenty ako kit. paper-design je Apache-2.0, nie MIT. Všetko ostatné MIT/OFL/MPL (build-time). Nič sa nekupuje.
