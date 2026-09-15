import { z } from "zod";

export const vehicleFieldsSchema = z.object({
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  plate: z
    .string()
    .trim()
    .min(1)
    .transform((v) => v.toUpperCase()),
  vin: z
    .string()
    .trim()
    .min(1)
    .optional()
    .nullable(),
});

export const createVehicleSchema = vehicleFieldsSchema;

export const adminCreateVehicleSchema = vehicleFieldsSchema.extend({
  customerId: z.uuid(),
});

export const updateVehicleSchema = vehicleFieldsSchema.partial();
