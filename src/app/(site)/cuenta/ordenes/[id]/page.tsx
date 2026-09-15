import { notFound, unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceOrderStatusBadge } from "@/components/service-orders/status-badge";
import { ServiceOrderTimeline } from "@/components/service-orders/timeline";
import { QuoteApproval } from "@/components/service-orders/quote-approval";
import { PayButton } from "@/components/service-orders/pay-button";
import { PaymentStatus } from "@/components/payments/payment-status";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerServiceOrderPage({ params }: Props) {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["customer"])) forbidden();

  const { id } = await params;
  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      vehicle: true,
      mechanic: { select: { name: true } },
      events: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
      payments: { include: { invoice: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();
  if (order.customerId !== session.user.id) forbidden();

  const hasApprovedPayment = order.payments.some((p) => p.status === "approved");

  return (
    <main className="flex-1 py-12">
      <Container className="flex max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {order.vehicle.brand} {order.vehicle.model} — {order.vehicle.plate}
              </CardTitle>
              <ServiceOrderStatusBadge status={order.status} />
            </div>
            <CardDescription>{order.problemDescription}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {order.mechanic ? `Mecánico asignado: ${order.mechanic.name}` : "Sin mecánico asignado."}
          </CardContent>
        </Card>

        {order.quoteStatus === "pending" && order.estimatedCost !== null && (
          <QuoteApproval serviceOrderId={order.id} estimatedCost={Number(order.estimatedCost)} />
        )}

        {order.quoteStatus === "rejected" && (
          <p className="text-sm text-muted-foreground">
            Rechazaste esta cotización. El taller se pondrá en contacto contigo.
          </p>
        )}

        {order.quoteStatus === "approved" && !hasApprovedPayment && (
          <PayButton serviceOrderId={order.id} />
        )}

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

        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Historial</h2>
          <ServiceOrderTimeline events={order.events} />
        </div>
      </Container>
    </main>
  );
}
