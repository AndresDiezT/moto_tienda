import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, type OrderStatus } from "@/generated/prisma/client";
import { getSessionUser, requireRole } from "@/lib/auth-helpers";
import { createOrderSchema } from "@/lib/validation/orders";
import { FIXED_SHIPPING_COST } from "@/lib/shipping";

export async function POST(request: Request) {
  const check = await requireRole("customer");
  if (!check.ok) return check.response;

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const { items, deliveryMethod, addressId } = parsed.data;

  if (deliveryMethod === "delivery") {
    if (!addressId) {
      return NextResponse.json(
        { error: "addressId es obligatorio para envío a domicilio" },
        { status: 422 }
      );
    }
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== check.user.id) {
      return NextResponse.json({ error: "La dirección no te pertenece" }, { status: 403 });
    }
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });

  const productById = new Map(products.map((p) => [p.id, p]));
  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product || product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stock insuficiente para el producto ${item.productId}` },
        { status: 409 }
      );
    }
  }

  // Los precios se recalculan siempre desde Product — nunca se confía en un
  // precio enviado por el cliente (ver docs/CONTRACTS-API/pedidos.md).
  const subtotal = items.reduce((sum, item) => {
    const product = productById.get(item.productId)!;
    return sum + Number(product.price) * item.quantity;
  }, 0);
  const shippingCost = deliveryMethod === "delivery" ? FIXED_SHIPPING_COST : 0;

  const order = await prisma.order.create({
    data: {
      customerId: check.user.id,
      status: "pending_payment",
      deliveryMethod,
      addressId: deliveryMethod === "delivery" ? addressId : null,
      shippingCost,
      subtotal,
      total: subtotal + shippingCost,
      items: {
        create: items.map((item) => {
          const product = productById.get(item.productId)!;
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
          };
        }),
      },
    },
  });

  return NextResponse.json({ order: { id: order.id, status: order.status, total: order.total } }, {
    status: 201,
  });
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conditions: Prisma.OrderWhereInput[] = [];

  if (user.role === "customer") {
    conditions.push({ customerId: user.id });
  } else if (user.role === "admin") {
    const status = searchParams.get("status") as OrderStatus | null;
    const customerId = searchParams.get("customerId");
    if (status) conditions.push({ status });
    if (customerId) conditions.push({ customerId });
  } else {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: conditions.length > 0 ? { AND: conditions } : {},
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      deliveryMethod: o.deliveryMethod,
      createdAt: o.createdAt,
    }))
  );
}
