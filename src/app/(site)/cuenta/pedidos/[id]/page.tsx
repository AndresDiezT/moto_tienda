import { notFound, unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/status-badge";
import { PaymentStatus } from "@/components/payments/payment-status";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["customer"])) forbidden();

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true } } } },
      address: true,
      payments: { include: { invoice: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();
  if (order.customerId !== session.user.id) forbidden();

  return (
    <main className="flex-1 py-12">
      <Container className="flex max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Pedido del{" "}
                {new Date(order.createdAt).toLocaleDateString("es-CO", { dateStyle: "medium" })}
              </CardTitle>
              <OrderStatusBadge status={order.status} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="text-muted-foreground">
              Entrega:{" "}
              {order.deliveryMethod === "delivery"
                ? `Envío a domicilio${order.address ? ` — ${order.address.line1}, ${order.address.city}` : ""}`
                : "Retiro en tienda"}
            </p>
            <ul className="flex flex-col divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2">
                  <span>
                    {item.quantity} x {item.product.name}
                  </span>
                  <span>${(Number(item.unitPrice) * item.quantity).toLocaleString("es-CO")}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-1 border-t border-border pt-3 text-right">
              <span className="text-muted-foreground">
                Subtotal: ${Number(order.subtotal).toLocaleString("es-CO")}
              </span>
              {Number(order.shippingCost) > 0 && (
                <span className="text-muted-foreground">
                  Envío: ${Number(order.shippingCost).toLocaleString("es-CO")}
                </span>
              )}
              <span className="font-semibold">Total: ${Number(order.total).toLocaleString("es-CO")}</span>
            </div>
          </CardContent>
        </Card>

        <PaymentStatus
          payments={order.payments.map((p) => ({
            id: p.id,
            status: p.status,
            provider: p.provider,
            amount: Number(p.amount),
            createdAt: p.createdAt,
            invoice: p.invoice,
          }))}
        />
      </Container>
    </main>
  );
}
