import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/service-orders/[id]">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const serviceOrder = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      vehicle: true,
      customer: { select: { id: true, name: true, email: true } },
      mechanic: { select: { id: true, name: true, email: true } },
      events: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
      payments: true,
    },
  });

  if (!serviceOrder) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const isOwner = user.role === "customer" && serviceOrder.customerId === user.id;
  const isAssignedMechanic = user.role === "mechanic" && serviceOrder.mechanicId === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAssignedMechanic && !isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(serviceOrder);
}
