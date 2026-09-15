import { z } from "zod";

export const createQuoteSchema = z.object({
  estimatedCost: z.coerce.number().positive(),
  detail: z.string().trim().optional(),
});
