import "server-only";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

// Mecanismo de subida de archivos — docs/CONTRACTS-API/archivos.md.
// El endpoint protegido está en src/app/api/uploads/sign/route.ts.

const BUCKET = "uploads";

const UPLOAD_PURPOSES = {
  "product-image": { prefix: "products", allowedRoles: ["admin"] },
  "service-order-photo": { prefix: "service-orders", allowedRoles: ["admin", "mechanic"] },
} as const;

export type UploadPurpose = keyof typeof UPLOAD_PURPOSES;

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Las signed upload URLs de Supabase Storage expiran a las 2 horas fijas;
// no es un valor configurable por la API (a diferencia de las signed URLs
// de descarga, que sí aceptan `expiresIn`).
const SIGNED_UPLOAD_EXPIRES_IN_SECONDS = 7200;

export function purposeAllowsRole(purpose: UploadPurpose, role: string): boolean {
  return (UPLOAD_PURPOSES[purpose].allowedRoles as readonly string[]).includes(role);
}

export async function createSignedUpload(purpose: UploadPurpose, contentType: string) {
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new Error(`Tipo de archivo no permitido: ${contentType}`);
  }

  const extension = contentType.split("/")[1];
  const path = `${UPLOAD_PURPOSES[purpose].prefix}/${randomUUID()}.${extension}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`No se pudo generar la URL de subida: ${error?.message ?? "desconocido"}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  return {
    uploadUrl: data.signedUrl,
    publicUrl: publicUrlData.publicUrl,
    expiresInSeconds: SIGNED_UPLOAD_EXPIRES_IN_SECONDS,
  };
}
