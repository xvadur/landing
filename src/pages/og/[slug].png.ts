import type { APIRoute, GetStaticPaths } from 'astro';
import { ROUTES } from '@/data/routes';
import { renderOgPng } from '@/lib/og';

/** /og/<slug>.png pre každú cestu zo src/data/routes.ts + /og/default.png. Generuje sa pri builde. */
export const getStaticPaths = (() => {
  const items = ROUTES.map((r) => ({
    params: { slug: r.slug },
    props: { title: r.title.replace(/\s+—\s+XVADUR$/u, ''), description: r.description, eyebrow: `xvadur.com${r.path}` },
  }));
  items.push({
    params: { slug: 'default' },
    props: {
      title: 'Jeden človek. Celý aparát.',
      description: 'Adam Rudavský — AI agenti, weby a systémy pre ľudí, ktorí robia firmu sami.',
      eyebrow: 'xvadur.com',
    },
  });
  return items;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng({
    title: props.title as string,
    description: props.description as string,
    eyebrow: props.eyebrow as string,
  });
  const body = new Uint8Array(png.byteLength);
  body.set(png);
  return new Response(body.buffer as ArrayBuffer, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
