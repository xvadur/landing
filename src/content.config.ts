/** Obsahové kolekcie (Astro 7, glob loader). Vlastník: agent Konzultácia + Texty.
 *  texty: src/content/texty/*.md → /texty/<slug>/ (src/pages/texty/[slug].astro).
 *  Schéma: title, date, description (perex), substack? (URL publikovanej verzie, ak existuje). */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const texty = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/texty' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    substack: z.url().optional(),
  }),
});

export const collections = { texty };
