import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { assignMechanicSchema } from "@/lib/validation/service-orders";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/service-orders/[id]/assign">
) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = assignMechanicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const mechanic = await prisma.user.findUnique({ where: { id: parsed.data.mechanicId } });
  if (!mechanic || mechanic.role !== "mechanic" || !mechanic.active) {
    return NextResponse.json({ error: "Mecánico no válido" }, { status: 422 });
  }

  const serviceOrder = await prisma.serviceOrder.update({
    where: { id },
    data: { mechanicId: parsed.data.mechanicId },
  });

  return NextResponse.json(serviceOrder);
}
