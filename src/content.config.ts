import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.md",
  }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    categories: z.array(z.string().min(1)).min(1),
  }),
});

export const collections = { blog };
