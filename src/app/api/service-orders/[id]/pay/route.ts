import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { mpPreference } from "@/lib/mercadopago";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/service-orders/[id]/pay">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: { vehicle: true, payments: true },
  });
  if (!order) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  if (order.customerId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (order.quoteStatus !== "approved" || order.estimatedCost === null) {
    return NextResponse.json({ error: "La cotización no está aprobada" }, { status: 409 });
  }
  if (order.payments.some((p) => p.status === "approved")) {
    return NextResponse.json({ error: "Esta orden ya está pagada" }, { status: 409 });
  }

  // Un Payment "pending" por intento de pago (HU-03.7: reintentar si falla).
  const payment = await prisma.payment.create({
    data: {
      provider: "mercadopago",
      status: "pending",
      amount: order.estimatedCost,
      serviceOrderId: order.id,
    },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  try {
    const preference = await mpPreference.create({
      body: {
        items: [
          {
            id: order.id,
            title: `Servicio de taller — ${order.vehicle.brand} ${order.vehicle.model}`,
            quantity: 1,
            currency_id: "COP",
            unit_price: Number(order.estimatedCost),
          },
        ],
        // Nuestro id de Payment, no el de Mercado Pago — así el webhook
        // encuentra el registro local (ver docs/CONTRACTS-API/pedidos.md).
        external_reference: payment.id,
        back_urls: {
          success: `${appUrl}/cuenta/ordenes/${order.id}`,
          pending: `${appUrl}/cuenta/ordenes/${order.id}`,
          failure: `${appUrl}/cuenta/ordenes/${order.id}`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/payments/webhook/mercadopago`,
      },
    });

    return NextResponse.json({
      checkoutUrl: preference.sandbox_init_point ?? preference.init_point,
    });
  } catch (error) {
    // Sin credenciales reales de Mercado Pago configuradas (o si su API no
    // responde), no dejamos un Payment "pending" huérfano ni un 500 crudo.
    await prisma.payment.delete({ where: { id: payment.id } });
    console.error("[service-orders/pay] Error creando preferencia de Mercado Pago:", error);
    return NextResponse.json(
      { error: "No se pudo conectar con Mercado Pago. Intenta de nuevo más tarde." },
      { status: 502 }
    );
  }
}
