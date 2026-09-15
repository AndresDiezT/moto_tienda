import { NextResponse } from "next/server";
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
import { handleServiceOrderPaymentApproved } from "@/lib/service-order-payments";
import { handleOrderPaymentApproved } from "@/lib/order-payments";
import type { PaymentStatus } from "@/generated/prisma/enums";

function mapMpStatus(status: string | undefined): PaymentStatus {
  switch (status) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "cancelled";
    default:
      return "pending";
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? searchParams.get("topic");
  const dataId = searchParams.get("data.id") ?? searchParams.get("id");

  if (type !== "payment" || !dataId) {
    // Otros tipos de notificación (merchant_order, etc.) — se ignoran.
    return new NextResponse(null, { status: 200 });
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret: process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "",
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.error("[mercadopago webhook] firma inválida:", error.reason);
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
    throw error;
  }

  const mpPaymentData = await mpPayment.get({ id: dataId });
  const ourPaymentId = mpPaymentData.external_reference;
  if (!ourPaymentId) {
    return new NextResponse(null, { status: 200 });
  }

  const payment = await prisma.payment.findUnique({ where: { id: ourPaymentId } });
  if (!payment) {
    console.error(`[mercadopago webhook] Payment local no encontrado: ${ourPaymentId}`);
    return new NextResponse(null, { status: 200 });
  }

  const newStatus = mapMpStatus(mpPaymentData.status);
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      externalReference: mpPaymentData.id ? String(mpPaymentData.id) : undefined,
    },
  });

  if (newStatus !== "approved") {
    return new NextResponse(null, { status: 200 });
  }

  if (payment.serviceOrderId) {
    await handleServiceOrderPaymentApproved(
      payment.id,
      payment.serviceOrderId,
      "Pago del servicio aprobado (Mercado Pago)"
    );
  } else if (payment.orderId) {
    await handleOrderPaymentApproved(payment.id, payment.orderId);
  }

  return new NextResponse(null, { status: 200 });
}
