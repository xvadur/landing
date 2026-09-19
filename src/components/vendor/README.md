# vendor/ — vendorované komponenty (Vendor fáza)

Sem idú prevzaté komponenty, každý v podpriečinku podľa zdroja:

- `neobrutalism/` — shadcn CLI (`npx shadcn@latest add <url z neobrutalism.dev>`), alias `@/components/vendor/neobrutalism` (components.json)
- `reactbits/` — copy-paste; licencia MIT + Commons Clause: len ako súčasť webu, nie ako distribuovaný kit; ponechať hlavičku (c) David Haz
- `fancy/`, `magicui/`, `motion-primitives/` — copy-paste, MIT, ponechať notice

Pravidlá: každý komponent dostane retheme cez tokeny (`brutal`, `border-3 border-ink rounded-lg shadow-brutal`), nikdy ručný hex.
Farby: len `bg-paper/white/yellow/pink/lilac/lime/sky/hot/ink` a sémantické aliasy (`bg-background`, `bg-main`, `border-border`, `ring-ring`, `bg-overlay`).
Motion na stavy, GSAP na hero a pinnuté scény; nikdy oba na jednom prvku. `client:only="react"` pre všetko, čo siaha na `window` pri importe.
