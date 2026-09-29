# V7 · Dáta Korpusu na webe — návrh kontraktu (29. 9. 2026)

## Čo chce Adam
Živé dáta z Korpusu (písanie s AI): **heatmapa aktívnych dní**, **slová dnes**, **séria dní**, prompty dnes. Majú
svietiť na hero alebo v bio a dať sa prekliknúť na stránku štatistík v rámci xvadur.com.

## Čo je dnes
- `public/pulse.json` = statická snímka so 4 číslami: `words_month`, `prompts_today`, `streak_days`, `projects_active`, `updated_at`.
- Zdroj: démon adam.xvadur na Adamovom počítači (`http://127.0.0.1:7777/public/pulse.json`), prenos `node scripts/pulse-snapshot.mjs`.
- **Denná rada neexistuje**, preto heatmapa zatiaľ nejde zo skutočných dát.

## Návrh: pulz v3 (iba súhrnné čísla, žiadny text)
```json
{
  "version": 3,
  "updated_at": "2026-09-29T18:00:00Z",
  "words_month": 138927,
  "prompts_today": 88,
  "streak_days": 65,
  "projects_active": 6,
  "words_today": 4210,
  "words_total": 812345,
  "active_days_total": 420,
  "days": [["2025-09-30", 5120, 41], ["2025-10-01", 0, 0]]
}
```
- `days` = posledných 365 dní, každý `[dátum, slová, prompty]`, zoradené od najstaršieho. Približne 9 kB.
- Prvé štyri kľúče ostávajú kvôli spätnej kompatibilite (Vitálne funkcie na V5.4).
- Súkromie: žiadne texty ani názvy konverzácií, iba počty za deň.

## Ako sa dáta dostanú na web
| | A: snímka pri builde | B: živo cez Worker (odporúčané) |
|---|---|---|
| Ako | `pulse-snapshot.mjs` zapíše `public/pulse.json`, commit, deploy | démon na Macu každých 15 min pošle `POST /api/pulz/` s tajným tokenom, Worker uloží do KV, web číta `GET /api/pulz/` (cache 60 s) |
| Čerstvosť | iba po deployi | do 15 minút |
| Treba | nič nové | secret `PULZ_TOKEN`, route `src/pages/api/pulz.ts`, úloha na Macu (launchd/cron) |
| Riziko | staré čísla | Mac vypnutý = web ukáže posledné čísla a čas „aktualizované pred …“ |

## Na webe
- **Hero / bio:** malý svietiaci widget (slová dnes, séria, sparkline 30 dní), klik vedie na stránku štatistík.
- **Stránka štatistík:** návrh `/vitalne/` (zdravotnícka línia) s kalendárovou heatmapou 53 × 7, grafmi po mesiacoch a hodinách a súčtami.
- Podania z katalógu: `/kit/grafy/`, sekcia „Korpus — návrh“ (ukážkové denné rady sú označené).

## Čaká na Adama
1. Vie démon adam.xvadur vrátiť dennú radu (slová a prompty po dňoch)? Ak áno, stačí rozšíriť jeho `public/pulse.json` o polia vyššie.
2. A alebo B.
3. Názov stránky štatistík: `/vitalne/`, `/stats/`, alebo iný.
