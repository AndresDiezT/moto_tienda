import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/admin/vehicles/[id]/service-orders">
) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const { id } = await ctx.params;
  const serviceOrders = await prisma.serviceOrder.findMany({
    where: { vehicleId: id },
    include: { mechanic: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(serviceOrders);
}
