import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { updateMechanicSchema } from "@/lib/validation/auth";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/mechanics/[id]">
) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = updateMechanicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const mechanic = await prisma.user.update({
    where: { id, role: "mechanic" },
    data: { active: parsed.data.active },
  });

  return NextResponse.json({
    id: mechanic.id,
    name: mechanic.name,
    email: mechanic.email,
    active: mechanic.active,
  });
}
