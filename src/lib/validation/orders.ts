import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  addressId: z.uuid().nullable().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["preparing", "ready_or_shipped", "delivered", "cancelled"]),
});
