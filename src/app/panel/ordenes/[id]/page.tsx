import Link from "next/link";
import { forbidden, notFound, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceOrderStatusBadge } from "@/components/service-orders/status-badge";
import { ServiceOrderTimeline } from "@/components/service-orders/timeline";
import { AddServiceOrderEventForm } from "@/components/service-orders/add-event-form";
import { ReassignMechanic } from "@/components/service-orders/reassign-mechanic";
import { QuoteForm } from "@/components/service-orders/quote-form";
import { PaymentStatus } from "@/components/payments/payment-status";
import { MarkPaidInPersonButton } from "@/components/service-orders/mark-paid-in-person-button";

type Props = { params: Promise<{ id: string }> };

export default async function ServiceOrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) unauthorized();

  const { id } = await params;
  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      vehicle: true,
      customer: { select: { id: true, name: true, email: true } },
      mechanic: { select: { id: true, name: true } },
      events: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
      payments: { include: { invoice: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const isAssignedMechanic = session.user.role === "mechanic" && order.mechanicId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isAssignedMechanic && !isAdmin) forbidden();

  const activeMechanics = isAdmin
    ? await prisma.user.findMany({
        where: { role: "mechanic", active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
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
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Cliente:{" "}
            {isAdmin ? (
              <Link href={`/panel/clientes/${order.customer.id}`} className="hover:underline">
                {order.customer.name}
              </Link>
            ) : (
              order.customer.name
            )}
          </p>
          {isAdmin ? (
            <ReassignMechanic
              serviceOrderId={order.id}
              mechanics={activeMechanics}
              currentMechanicId={order.mechanicId}
            />
          ) : (
            <p>Mecánico asignado: {order.mechanic?.name ?? "—"}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cotización</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteForm
            serviceOrderId={order.id}
            currentEstimatedCost={order.estimatedCost !== null ? Number(order.estimatedCost) : null}
            quoteStatus={order.quoteStatus}
          />
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

      {isAdmin &&
        order.quoteStatus === "approved" &&
        !order.payments.some((p) => p.status === "approved") && (
          <MarkPaidInPersonButton serviceOrderId={order.id} />
        )}

      <Card>
        <CardHeader>
          <CardTitle>Actualizar estado</CardTitle>
        </CardHeader>
        <CardContent>
          <AddServiceOrderEventForm serviceOrderId={order.id} currentStatus={order.status} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Historial</h2>
        <ServiceOrderTimeline events={order.events} />
      </div>
    </div>
  );
}
