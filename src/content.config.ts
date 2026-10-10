import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { groepIds } from './lib/artikelgroepen';

const artikelen = defineCollection({
  loader: glob({ base: './src/content/artikelen', pattern: '*.md' }),
  schema: z.object({
    titel: z.string(),
    samenvatting: z.string().max(220),
    groep: z.enum(groepIds),
    volgorde: z.number().int(),
    gepubliceerd: z.coerce.date(),
    gecontroleerd: z.coerce.date(),
    wcag: z.array(z.object({ nummer: z.string(), naam: z.string(), url: z.string().url() })).default([]),
    verwijzing: z.object({ tekst: z.string(), href: z.string() }),
  }),
});

export const collections = { artikelen };
