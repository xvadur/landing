# V7 — sieť cloudového prostredia

Predvolená sieť **Trusted** pustí GitHub, npm a Google Fonts, ale nie weby knižníc. BoldKit a neobrutalism.dev idú aj z GitHubu, ostatné knižnice potrebujú svoje domény.

Nastavenie (Adam, raz): claude.ai/code → prostredie → Network access → **Custom** → zaškrtnúť **Also include default list of common package managers** → do Allowed domains vložiť zoznam nižšie.

Higgsfield cez MCP konektor ide mimo tohto zoznamu; `*.higgsfield.ai` je tu pre Higgsfield CLI.

```
*.higgsfield.ai
animate-ui.com
boldkit.dev
cdn.playwright.dev
cult-ui.com
dashboardcn.com
efferd.com
evilcharts.com
formcn.dev
francozeta-stepper.vercel.app
gamifykit.com
gymnopedies.shoota.work
higgsfield.ai
kokonutui.com
magicui.design
mapcn.dev
motion-menu-two.vercel.app
motion-primitives.com
neobrutalism.com
paletteui.xyz
playwright.azureedge.net
playwright.download.prss.microsoft.com
quiz-ui-phi.vercel.app
rawkitui.zerodegree.tech
reactbits.dev
registry.directory
remotionui.com
retroui.dev
reui.io
shadcn-heatmap.pages.dev
shadcnblocks.com
shadcnmaps.com
skiper-ui.com
smoothui.dev
snapcn.dev
square.lndev.me
tailark.com
ui-layouts.com
ui.aceternity.com
ui.bklit.com
ui.ilinxa.com
ui.saastro.io
ui.shadcn.com
ui.trophy.so
www.atelier-ui.com
www.boldkit.dev
www.brut-ui.site
www.dashboardblocks.com
www.fonttrio.xyz
www.kibo-ui.com
www.launchuicomponents.com
www.neobrutalism.dev
www.neobrutalui.live
www.quilldesignsystem.com
www.remocn.dev
www.scrollxui.dev
```
