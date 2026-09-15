import "server-only";
import { randomBytes, createHash } from "crypto";

// Token de un solo uso para HU-01.5. Se guarda solo el hash en la base de
// datos; el valor en texto plano únicamente existe en el enlace "enviado"
// (simulado con console.log en esta fase, ver ADR-0002 / nota de HU-01.5).
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export function generateResetToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  return { token, tokenHash };
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
