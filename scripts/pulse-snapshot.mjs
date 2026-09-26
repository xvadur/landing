// Snímka verejného pulzu Korpusu v2 do public/pulse.json (XDR-266). Iba 4 agregované čísla a čas, žiadny text.
// Zdroj: bežiaci démon adam.xvadur (http://127.0.0.1:7777/public/pulse.json) alebo PULSE_URL.
// node scripts/pulse-snapshot.mjs
import { writeFileSync } from 'node:fs';
const url = process.env.PULSE_URL ?? 'http://127.0.0.1:7777/public/pulse.json';
const KEYS = ['words_month', 'prompts_today', 'streak_days', 'projects_active'];
const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
if (!r.ok) throw new Error(`pulz: HTTP ${r.status}`);
const p = await r.json();
const cisty = Object.fromEntries(KEYS.map((k) => [k, Number(p[k])]));
if (!KEYS.every((k) => Number.isFinite(cisty[k]))) throw new Error('pulz: chýbajú čísla');
cisty.updated_at = String(p.updated_at);
writeFileSync(new URL('../public/pulse.json', import.meta.url), JSON.stringify(cisty) + '\n');
console.log(cisty);
