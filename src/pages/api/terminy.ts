/** GET /api/terminy/ (XDR-210): voľné termíny konzultácie na 14 dní (pravidlá src/data/terminy.ts mínus obsadené). */
import type { APIRoute } from 'astro';
import { vsetkyTerminy } from '@/data/terminy';
import { json, kv, PREFIX } from '@/lib/server/uloziste';

export const prerender = false;

export const GET: APIRoute = async () => {
  const store = kv();
  const dni = vsetkyTerminy();
  const obsadene = new Set<string>();
  if (store) {
    const zoznam = await store.list({ prefix: `${PREFIX}slot:`, limit: 1000 });
    for (const k of zoznam.keys) obsadene.add(k.name.slice(`${PREFIX}slot:`.length));
  }
  return json({
    ok: true,
    zona: 'Europe/Bratislava',
    dni: dni.map((d) => ({ datum: d.datum, sloty: d.sloty.filter((s) => !obsadene.has(s)) })).filter((d) => d.sloty.length),
  });
};
