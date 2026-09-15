import { z } from "zod";

export const createAddressSchema = z.object({
  line1: z.string().trim().min(1),
  city: z.string().trim().min(1),
  reference: z.string().trim().optional().nullable(),
});

export const updateAddressSchema = createAddressSchema.partial();
