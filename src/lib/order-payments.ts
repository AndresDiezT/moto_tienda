import "server-only";
import { prisma } from "@/lib/prisma";
import { getNextInvoiceNumber } from "@/lib/invoices";

// Análogo a handleServiceOrderPaymentApproved (src/lib/service-order-payments.ts)
// pero para pedidos de tienda: además de la factura, marca el Order "paid" y
// descuenta stock (docs/CONTRACTS-API/pedidos.md, webhook de Mercado Pago).
export async function handleOrderPaymentApproved(paymentId: string, orderId: string) {
  const existingInvoice = await prisma.invoice.findUnique({ where: { paymentId } });
  if (existingInvoice) return existingInvoice; // notificación duplicada — no reprocesar

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "paid" } });
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    const number = await getNextInvoiceNumber(tx, "store");
    await tx.invoice.create({
      data: {
        paymentId,
        number,
        series: "store",
        provider: "simulado",
        pdfUrl: "",
        status: "issued",
      },
    });
  });

  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { paymentId } });
  return prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl: `/api/invoices/${invoice.id}/pdf` },
  });
}
