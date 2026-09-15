import { z } from "zod";

export const signUploadSchema = z.object({
  purpose: z.enum(["product-image", "service-order-photo"]),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});
