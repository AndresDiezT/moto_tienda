import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/service-orders/[id]/quote/reject">
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

  // No cambia ServiceOrder.status (el contrato solo pide mover quote_status);
  // el evento queda con el status actual como snapshot.
  const [updated] = await prisma.$transaction([
    prisma.serviceOrder.update({ where: { id }, data: { quoteStatus: "rejected" } }),
    prisma.serviceOrderEvent.create({
      data: {
        serviceOrderId: id,
        status: order.status,
        note: "Cotización rechazada por el cliente",
        authorId: user.id,
      },
    }),
  ]);

  return NextResponse.json(updated);
}
