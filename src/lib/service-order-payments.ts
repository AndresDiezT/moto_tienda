import "server-only";
import { prisma } from "@/lib/prisma";
import { getNextInvoiceNumber } from "@/lib/invoices";

// Compartido entre el webhook de Mercado Pago y el registro manual de pago
// presencial (admin) — ambos terminan igual: factura simulada + evento de
// timeline. ADR-0005: el pago no mueve ServiceOrder.status.
export async function handleServiceOrderPaymentApproved(
  paymentId: string,
  serviceOrderId: string,
  note: string
) {
  const existingInvoice = await prisma.invoice.findUnique({ where: { paymentId } });
  if (existingInvoice) return existingInvoice; // ya procesado (ej. notificación duplicada de MP)

  const order = await prisma.serviceOrder.findUniqueOrThrow({
    where: { id: serviceOrderId },
  });

  await prisma.$transaction(async (tx) => {
    const number = await getNextInvoiceNumber(tx, "service");
    await tx.invoice.create({
      data: {
        paymentId,
        number,
        series: "service",
        provider: "simulado",
        pdfUrl: "", // se completa abajo, ya con el id real de la factura
        status: "issued",
      },
    });
    await tx.serviceOrderEvent.create({
      data: {
        serviceOrderId,
        status: order.status,
        note,
        authorId: order.customerId,
      },
    });
  });

  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { paymentId } });
  return prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl: `/api/invoices/${invoice.id}/pdf` },
  });
}
