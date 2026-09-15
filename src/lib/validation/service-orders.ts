import { z } from "zod";

export const createServiceOrderSchema = z.object({
  vehicleId: z.uuid(),
  mechanicId: z.uuid(),
  problemDescription: z.string().trim().min(1),
});

export const assignMechanicSchema = z.object({
  mechanicId: z.uuid(),
});

// No incluye "received" (estado inicial, no se llega acá) ni "quote_sent" /
// "approved" (Fase 3, vía los endpoints de cotización) — ver nota de
// docs/CONTRACTS-API/ordenes-servicio.md sobre POST .../events.
export const addServiceOrderEventSchema = z.object({
  status: z.enum(["diagnosing", "in_repair", "quality_check", "ready_for_pickup", "delivered"]),
  note: z.string().trim().optional(),
  photos: z.array(z.url()).optional().default([]),
});
