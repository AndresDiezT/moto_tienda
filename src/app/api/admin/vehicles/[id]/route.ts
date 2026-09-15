import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { updateVehicleSchema } from "@/lib/validation/vehicles";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/vehicles/[id]">
) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = updateVehicleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(vehicle);
}
