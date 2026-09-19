# NOTES_vendor_neobrutalism — neobrutalism.dev vendorované do xvadur.com v4 (19. 9. 2026)

Vlastník: `src/components/vendor/neobrutalism/**`, `src/components/lab/neobrutalismLab.tsx`, tento súbor. Nič iné som nemenil. Bez `npm install`, bez `astro build`, bez dev servera.

## Rozhodnutie o zdroji (dôležité)
- Registry `https://www.neobrutalism.dev/r/<name>.json` od **8. 9. 2026** (commit `565962a` „Rewrite ui components on Base UI") beží na **`@base-ui/react`**, ktorý v repe **nie je**. Základ stojí na Radixe (`radix-ui` 1.6.7, Wizard/CommandK/Drawer) a doc 10 §1 hovorí „Headless a a11y: Radix Primitives". Dva headless enginy naraz by rozbili JS rozpočet a konzistenciu.
- Preto som vendoroval **Radix verziu** knižnice z commitu tesne pred prepisom: `ekmas/neobrutalism-components@be6e0e2` (`src/components/ui/*.tsx`, 22. 3. 2025, React 19 + Tailwind 4). Z novšej Base UI verzie som prevzal len užitočné pridavky bez závislosti (`Card size`, `Tabs variant="line"`, `ProgressLabel/Value`, `showCloseButton`).
- `separator.json` v registry neexistuje (404) → `separator.tsx` je shadcn Separator (MIT) na `radix-ui` Separator + variant `x` (utilita `x-divider`).
- Licencia: `src/components/vendor/neobrutalism/LICENSE.md` (MIT, (c) 2023 Samuel Breznjak; separator shadcn MIT).

## Chýbajúce závislosti
**Žiadne.** Všetko beží na `radix-ui`, `cmdk`, `class-variance-authority`, `@phosphor-icons/react`, `clsx`/`tailwind-merge` (cez `cn()`), ktoré sú v `package.json`. `@base-ui/react` ani `lucide-react` netreba (nahradené), `tw-animate-css` sa nepoužíva (animácie sú v `theme.css`).

## Čo som nahradil / odstránil
| Pôvodne | Teraz |
|---|---|
| `@radix-ui/react-*` samostatné balíky | `import { Dialog, Select, RadioGroup, Progress, Tabs, Tooltip, Slot, Separator } from 'radix-ui'` |
| `lucide-react` (X, Search, Check, ChevronDown/Up, Circle) | Phosphor `XIcon, MagnifyingGlassIcon, CheckIcon, CaretDownIcon, CaretUpIcon, CircleIcon` (weight bold/fill) |
| `"use client"` | odstránené, nahradené komentárom v hlavičke (Astro ostrov ju nepotrebuje; Rollup by inak varoval) |
| `rounded-base`, `border-2 border-border`, `shadow-shadow`, `font-base`, `font-heading`, `hover:translate-x-boxShadowX…`, `ring-black`, `text-black`, `red-500` | `rounded-lg border-3 border-ink shadow-brutal`, `font-sans font-medium` / `font-display font-extrabold uppercase`, presety `lift` / `press`, fokus = globálny `:focus-visible` 3 px hot, chyby = `border-hot bg-pink` |
| `tw-animate-css` triedy (`animate-in fade-in-0 zoom-in-95 slide-in-from-*`) | `theme.css`: `data-state`/`data-side` keyframes `nb-drop` (card-drop preset), `nb-fade-*`, `nb-pop`, `nb-slide-*`; reduced motion → 120 ms fade |
| Dialog centrovaný cez `translate(-50%,-50%)` | obsah v overlayi ako grid (mobil dole, desktop stred) — vzor z `port/Wizard.tsx`, aby card-drop transform nekolidoval |
| výšky `h-10` (40 px) | všetky ciele ≥ 44 px: tlačidlá `min-h-12/11/14/16`, ikonové `size-12/11/14`, input/select 48 px, položky menu `min-h-11`, radio 24 px + 44 px dotyková plocha cez `::before` |
| `next/*` | nič také v týchto komponentoch nebolo |

## `theme.css` (importujú ho všetky komponenty; global.css nedotknutý)
Mapuje mená knižnice na tokeny: `--background → --color-paper`, `--secondary-background → --color-white`, `--foreground/--border → --color-ink`, `--main → --color-yellow`, `--main-foreground → --color-ink`, `--ring → --color-hot`, `--overlay → --color-overlay`, `--radius-base → --radius-lg` (8 px), `--border-width → --border-width-brutal` (3 px), `--shadow → --shadow-brutal` (6/6, pod 640 px 4/4), `--box-shadow-x/y → --brutal-x`, `--font-weight-base 500`, `--font-weight-heading 800`, `--chart-1..5 → *-deep`. Pozor: Tailwind 4 emituje len **použité** `@theme` premenné, preto majú aliasy tieňov fallbacky s rovnakými hodnotami. Žiadny hex.

## Komponenty → import → props → poznámky
Alias `@/components/vendor/neobrutalism` (components.json); barrel `index.ts` existuje, ale v ostrovoch importuj priamo zo súboru.

| Komponent | Import | Props navyše / zmeny | Poznámky |
|---|---|---|---|
| `Button`, `buttonVariants` | `…/neobrutalism/button` | `variant: default · noShadow · neutral · reverse · ghost`; **`tone: yellow(=main) · hot · white · paper · pink · lilac · lime · sky · ink`** (hover/press cez `<farba>-hover/-press`); `size: sm(44) · default(48) · lg(56) · xl(64) · icon(48) · icon-sm(44) · icon-lg(56)`; `asChild` (Radix Slot, pre `<a>`) | default `type="button"`; `reverse` = bez tieňa, tieň 8/8 pri hoveri (`lift`); ostatné `press` |
| `Badge`, `badgeVariants` | `…/badge` | `variant: default(tieň 3/3) · flat · sticker(display písmo)`; `tone` 9 farieb; **`tilt: none · left(−6°) · right(3°)`**; `asChild` | mono eyebrow typografia; `variant="sticker" tilt="left"` = „V STAVBE" |
| `Card` + `CardHeader/Title/Description/Action/Content/Footer`, `cardVariants` | `…/card` | `tone: white · paper · yellow · pink · lilac · lime · sky · ink`; `variant: default · flat · lg(9/9)`; **`interactive`** (= `lift`); **`stamp`** (X pečiatka, `x-stamp`); `size: default · sm`; `CardTitle as="h2|h3|h4|div"` (default h3) | `CardAction` a `stamp` naraz sa prekrývajú v rohu — použiť jedno; `card-drop` stagger cez `className="card-drop" style={{'--i': i}}` |
| `Dialog*` (Root, Trigger, Portal, Overlay, Close, Content, Header, Footer, Title, Description) | `…/dialog` | `DialogContent`: `showCloseButton` (default true, 44 px, aria-label „Zavrieť"), **`tone: white · paper · yellow · pink · lilac · lime · sky`**, **`size: sm(480) · default(640) · lg(760)`** | overlay `z-[100]` grid; `data-lenis-prevent`; otvorenie card-drop, zatvorenie fade; Title = display-xs uppercase |
| `Sheet*` (ako Dialog + `SheetContent side`) | `…/sheet` | `side: right · left · top · bottom` (default right, 88vw/420 px), `showCloseButton` | bg paper, hrana 3 px ink; header/footer majú vlastné 3 px linky. **Mobil-nav ostáva vaul** (`site/Drawer.tsx`) |
| `Input` | `…/input` | žiadne nové | 48 px, `text-base` (iOS bez zoomu), tieň 3/3 → 6/6 pri fokuse, `aria-invalid` = horúci rám + ružová; label si dodáva stránka |
| `Textarea` | `…/textarea` | žiadne nové | min-h 8 rem, inak ako Input |
| `Select*` (Root, Group, Value, Trigger, Content, Label, Item, Separator, ScrollUp/Down) | `…/select` | `SelectTrigger tone: white · yellow · paper`; `SelectContent position` (default popper), `sideOffset` 8 | trigger ako Input + `press`; popover biely `z-[110]` s tieňom 6/6, `data-lenis-prevent`; položky `min-h-11`, zvýraznené = žltá + rám + tieň 3/3 |
| `RadioGroup`, `RadioGroupItem`, **`RadioGroupCard`** | `…/radio-group` | `RadioGroupCard {value, disabled, id?}` = `<label>` s kruhom + text, celá karta klikacia (≥ 48 px), zvolená = žltá + tieň 6/6 | `RadioGroupItem` musí byť **vnútri `RadioGroup`** (Radix kontext, inak runtime error); kruh 24 px + 44 px dotyk cez `::before` |
| `Progress`, `ProgressLabel`, `ProgressValue` | `…/progress` | `value`, `max` (default 100), **`tone: hot · yellow · pink · lilac · lime · sky · ink`** (pastely = `-deep`), `size: sm · default · lg` | `role=progressbar` + aria-valuenow/max z Radixu; dodať `aria-label`; posun spring (reduced motion skok) |
| `Command*` (Command, CommandDialog, Input, List, Empty, Group, Item, Shortcut, Separator) | `…/command` | `CommandDialog {title, description}` (sr-only, SK default); `CommandInput eyebrow` (default „Kam?") | rovnaký vizuál ako `site/CommandK.tsx` (žltý riadok, ESC, položky min-h-11 žlté). Základ už má CommandK ostrov — toto je pre vlastné palety (kvíz, hry) |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsListVariants` | `…/tabs` | `TabsList variant: default · line`; `orientation` (Radix) | horizontálny zoznam má `contain: inline-size` + `overflow-x-auto` — dlhé názvy scrollujú, neroztiahnu grid (overené na 375 px) |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | `…/tooltip` | `TooltipContent tone: yellow · ink · white`, `sideOffset` 8 | `z-[120]`; len hover/fokus — na dotyku nesmie niesť jedinú informáciu |
| `Separator` | `…/separator` | `orientation`, `decorative`, **`variant: default · x`**, `label` | `x` = `x-divider` (X + linka + mono štítok) |

## Lab
`src/components/lab/neobrutalismLab.tsx` — `export default NeobrutalismLab`, ostrov `<NeobrutalismLab client:visible />` (nič nesiaha na `window` pri importe). Montuje všetkých 14 komponentov s reálnym textom: motto „DIVIDED, / WE ARE USELESS.", `POSTAVIL` + `MARQUEE_FAKTY` + `KOTVY` z `fakty.ts`, `FRAZY_RODINY` (6 základných) + `CITACIE` + `PRAZDNE_PRIDAVNE` z `frazy.ts`, `BEATY` z `beaty.ts`, `NAV`/`COMMAND_ITEMS` z `nav.ts`. Vlastný ⌘K listener (ak je na stránke aj site CommandK, otvoria sa obe — na lab stránke dať `islands="lite"` alebo Lab bez palety). Nadpisy v Labe začínajú h2 (h1 dáva stránka).

## Overené (bez astro build)
- `tsc --noEmit` cez scratch tsconfig (strict, astro/client typy) nad `vendor/neobrutalism/**` + `lab/neobrutalismLab.tsx`: **0 chýb** v 16 súboroch. (Projektový `npx tsc -p tsconfig.json` padá na TS5101 `baseUrl` deprecated v TypeScript 6 — treba `ignoreDeprecations: "6.0"` v tsconfig.json, čo je read-only pre mňa; `astro check` má vlastný runner.)
- Tailwind 4 kompilácia (`@tailwindcss/node` + oxide scanner nad mojimi súbormi): všetky triedy rozpoznané (vrátane `has-data-[state=checked]:`, `[--card-spacing:--spacing(6)]`, `duration-(--duration-base)`, `contain-inline-size`); `theme.css` prejde lightningcss bez varovaní.
- SSR `renderToString(<Lab/>)` cez esbuild bundle: 86 kB HTML, bez lorem/TODO, 0 chýb.
- Playwright na statickej testovacej stránke (python http.server 4199, len scratch): dialóg/sheet/select/tabs/radio/progress/⌘K/tooltip fungujú, 0 page errors; **375 px: scrollWidth = 375**, dialóg 8 px od okrajov; reduced motion: dialóg = 120 ms fade; jediné ciele < 44 px sú 24 px kruhy rádia (dotyk 44 px cez `::before`, karta 48 px).
- Screenshoty v scratch (nie v repe).

## Otvorené / pre ostatných
- `tsconfig.json`: pridať `"ignoreDeprecations": "6.0"` (TS 6 + `baseUrl`), inak priamy `tsc` nefunguje — Lab/základ agent.
- Lab stránka: `src/pages/lab.astro` je placeholder; Lab agent nech tam dá `<NeobrutalismLab client:visible />` (import `@/components/lab/neobrutalismLab`) do `<Section>` — a `islands="lite"` alebo vypnúť ⌘K v Labe, aby sa neotvárali dve palety.
- JS: Radix Dialog/Select/Tabs/Tooltip/RadioGroup/Progress + cmdk sú už v základe (Wizard, CommandK), takže podstránky pridajú len samotné komponenty (~2–6 kB gz každý). Select je najťažší (Radix Select ≈ 20 kB gz, ak ho základ ešte nemá).
- Ak niekto vloží ďalší neobrutalism.dev komponent zo súčasného registry, príde s `@base-ui/react` — buď ho preportovať na `radix-ui` podľa vzoru tu, alebo nechať Lab agenta nainštalovať Base UI (neodporúčam, dva enginy).
