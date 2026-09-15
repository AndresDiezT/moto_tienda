import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleServiceOrderPaymentApproved } from "@/lib/service-order-payments";

// No está en docs/CONTRACTS-API/ordenes-servicio.md — se agregó como
// refinamiento de ADR-0004 (ver conversación de Fase 3): el pago en línea
// sigue siendo la vía principal, pero el admin puede registrar a mano un
// pago recibido en efectivo/datáfono físico en el mostrador, para que quede
// igual de trazable (factura simulada + evento de timeline) que uno online.
export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/admin/service-orders/[id]/pay-in-person">
) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const { id } = await ctx.params;
  const order = await prisma.serviceOrder.findUnique({ where: { id }, include: { payments: true } });
  if (!order) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  if (order.quoteStatus !== "approved" || order.estimatedCost === null) {
    return NextResponse.json({ error: "La cotización no está aprobada" }, { status: 409 });
  }
  if (order.payments.some((p) => p.status === "approved")) {
    return NextResponse.json({ error: "Esta orden ya está pagada" }, { status: 409 });
  }

  const payment = await prisma.payment.create({
    data: {
      provider: "cash",
      status: "approved",
      amount: order.estimatedCost,
      serviceOrderId: order.id,
    },
  });

  await handleServiceOrderPaymentApproved(
    payment.id,
    order.id,
    "Pago del servicio recibido en efectivo en el taller"
  );

  return NextResponse.json(payment, { status: 201 });
}
