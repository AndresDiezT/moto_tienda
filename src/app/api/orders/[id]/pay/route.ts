import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { mpPreference } from "@/lib/mercadopago";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/orders/[id]/pay">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, payments: true },
  });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (order.customerId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (order.payments.some((p) => p.status === "approved")) {
    return NextResponse.json({ error: "Este pedido ya está pagado" }, { status: 409 });
  }

  const payment = await prisma.payment.create({
    data: {
      provider: "mercadopago",
      status: "pending",
      amount: order.total,
      orderId: order.id,
    },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const items = order.items.map((item) => ({
    id: item.productId,
    title: item.product.name,
    quantity: item.quantity,
    currency_id: "COP",
    unit_price: Number(item.unitPrice),
  }));
  if (Number(order.shippingCost) > 0) {
    items.push({
      id: "shipping",
      title: "Envío a domicilio",
      quantity: 1,
      currency_id: "COP",
      unit_price: Number(order.shippingCost),
    });
  }

  try {
    const preference = await mpPreference.create({
      body: {
        items,
        external_reference: payment.id,
        back_urls: {
          success: `${appUrl}/cuenta/pedidos/${order.id}`,
          pending: `${appUrl}/cuenta/pedidos/${order.id}`,
          failure: `${appUrl}/cuenta/pedidos/${order.id}`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/payments/webhook/mercadopago`,
      },
    });

    return NextResponse.json({
      checkoutUrl: preference.sandbox_init_point ?? preference.init_point,
    });
  } catch (error) {
    await prisma.payment.delete({ where: { id: payment.id } });
    console.error("[orders/pay] Error creando preferencia de Mercado Pago:", error);
    return NextResponse.json(
      { error: "No se pudo conectar con Mercado Pago. Intenta de nuevo más tarde." },
      { status: 502 }
    );
  }
}
