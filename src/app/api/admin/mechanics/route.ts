import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/passwords";
import { requireRole } from "@/lib/auth-helpers";
import { createMechanicSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const body = await request.json();
  const parsed = createMechanicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const { name, email, phone, temporaryPassword } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
  }

  const passwordHash = await hashPassword(temporaryPassword);
  const mechanic = await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "mechanic", active: true },
  });

  return NextResponse.json(
    {
      id: mechanic.id,
      name: mechanic.name,
      email: mechanic.email,
      role: mechanic.role,
      active: mechanic.active,
    },
    { status: 201 }
  );
}

export async function GET() {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const mechanics = await prisma.user.findMany({
    where: { role: "mechanic" },
    select: { id: true, name: true, email: true, active: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(mechanics);
}
