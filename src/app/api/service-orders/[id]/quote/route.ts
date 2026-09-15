import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { createQuoteSchema } from "@/lib/validation/quotes";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/service-orders/[id]/quote">
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

  const isAssignedMechanic = user.role === "mechanic" && order.mechanicId === user.id;
  const isAdmin = user.role === "admin";
  if (!isAssignedMechanic && !isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (order.quoteStatus === "approved") {
    return NextResponse.json({ error: "La cotización ya fue aprobada" }, { status: 409 });
  }

  const body = await request.json();
  const parsed = createQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const { estimatedCost, detail } = parsed.data;

  const [updated] = await prisma.$transaction([
    prisma.serviceOrder.update({
      where: { id },
      data: { estimatedCost, status: "quote_sent", quoteStatus: "pending" },
    }),
    prisma.serviceOrderEvent.create({
      data: {
        serviceOrderId: id,
        status: "quote_sent",
        note: detail ?? `Cotización enviada: $${estimatedCost.toLocaleString("es-CO")} COP`,
        authorId: user.id,
      },
    }),
  ]);

  return NextResponse.json(updated);
}
