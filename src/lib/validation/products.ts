import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.uuid(),
  images: z.array(z.url()).default([]),
});

export const updateProductSchema = createProductSchema.partial().extend({
  active: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1),
});

export const updateCategorySchema = createCategorySchema.partial();
