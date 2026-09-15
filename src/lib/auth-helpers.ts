import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

// Helper para Route Handlers: valida sesión + rol y devuelve la respuesta de
// error ya armada cuando no corresponde, para no repetir el 401/403 en cada
// endpoint (ver HU-01.4: el filtrado por rol se aplica siempre en el
// backend, no solo en la UI).
export async function requireRole(...roles: Role[]) {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }
  if (!roles.includes(user.role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No autorizado" }, { status: 403 }),
    };
  }
  return { ok: true as const, user };
}
