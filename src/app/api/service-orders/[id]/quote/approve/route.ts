import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/service-orders/[id]/quote/approve">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = await prisma.serviceOrder.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  if (order.customerId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (!order.quoteStatus || order.estimatedCost === null) {
    return NextResponse.json({ error: "No hay cotización cargada" }, { status: 409 });
  }

  const [updated] = await prisma.$transaction([
    prisma.serviceOrder.update({
      where: { id },
      data: { quoteStatus: "approved", status: "approved" },
    }),
    prisma.serviceOrderEvent.create({
      data: {
        serviceOrderId: id,
        status: "approved",
        note: "Cotización aprobada por el cliente",
        authorId: user.id,
      },
    }),
  ]);

  return NextResponse.json(updated);
}
