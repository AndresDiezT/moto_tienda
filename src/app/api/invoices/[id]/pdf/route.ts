import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { renderServiceInvoicePdf, renderStoreInvoicePdf } from "@/lib/invoices";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/invoices/[id]/pdf">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      payment: {
        include: {
          serviceOrder: { include: { vehicle: true, customer: true } },
          order: {
            include: {
              customer: true,
              items: { include: { product: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });
  if (!invoice) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const { serviceOrder, order } = invoice.payment;
  const ownerId = serviceOrder?.customerId ?? order?.customerId;
  if (user.role !== "admin" && ownerId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let pdfBytes: Uint8Array;
  if (serviceOrder) {
    pdfBytes = await renderServiceInvoicePdf({
      number: invoice.number,
      issuedAt: invoice.issuedAt,
      customerName: serviceOrder.customer.name,
      vehicleLabel: `${serviceOrder.vehicle.brand} ${serviceOrder.vehicle.model} — ${serviceOrder.vehicle.plate}`,
      problemDescription: serviceOrder.problemDescription,
      amount: Number(invoice.payment.amount),
    });
  } else if (order) {
    pdfBytes = await renderStoreInvoicePdf({
      number: invoice.number,
      issuedAt: invoice.issuedAt,
      customerName: order.customer.name,
      deliveryMethod: order.deliveryMethod,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
    });
  } else {
    return NextResponse.json({ error: "Factura sin origen válido" }, { status: 500 });
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
