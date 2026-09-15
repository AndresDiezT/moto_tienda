import { forbidden, notFound, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/status-badge";
import { UpdateOrderStatus } from "@/components/orders/update-order-status";
import { PaymentStatus } from "@/components/payments/payment-status";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) unauthorized();
  if (session.user.role !== "admin") forbidden();

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
      address: true,
      payments: { include: { invoice: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Pedido de {order.customer.name} —{" "}
              {new Date(order.createdAt).toLocaleDateString("es-CO", { dateStyle: "medium" })}
            </CardTitle>
            <OrderStatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">{order.customer.email}</p>
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
          <p className="text-right font-semibold">
            Total: ${Number(order.total).toLocaleString("es-CO")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
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
    </div>
  );
}
