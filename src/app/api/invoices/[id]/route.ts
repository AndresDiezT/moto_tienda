import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/invoices/[id]">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payment: { include: { serviceOrder: true, order: true } } },
  });
  if (!invoice) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const ownerId = invoice.payment.serviceOrder?.customerId ?? invoice.payment.order?.customerId;
  if (user.role !== "admin" && ownerId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(invoice);
}
