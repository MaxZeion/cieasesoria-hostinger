import { defineCollection, z } from 'astro:content';

const newsCollection = defineCollection({
    type: 'content', // v2.5.0+ (equivale a la gestión de archivos Markdown/MDX)
    schema: z.object({
        title: z.string(),
        date: z.date(),
        author: z.string().default('Equipo'),
        image: z.string().optional(),
        card_image: z.string().optional(), // For dark backgrounds (e.g., listing cards)
        draft: z.boolean().default(false),
    }),
});

export const collections = {
    'news': newsCollection,
};
