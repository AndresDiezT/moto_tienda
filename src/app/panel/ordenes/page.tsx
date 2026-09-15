import Link from "next/link";
import { unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, type ServiceOrderStatus } from "@/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { ServiceOrderStatusBadge } from "@/components/service-orders/status-badge";
import { SERVICE_ORDER_STATUS_LABELS } from "@/lib/service-order-status";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ServiceOrdersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) unauthorized();

  const params = await searchParams;
  const status = typeof params.status === "string" ? (params.status as ServiceOrderStatus) : undefined;

  const conditions: Prisma.ServiceOrderWhereInput[] = [];
  if (session.user.role === "mechanic") conditions.push({ mechanicId: session.user.id });
  if (status) conditions.push({ status });

  const orders = await prisma.serviceOrder.findMany({
    where: conditions.length > 0 ? { AND: conditions } : {},
    include: {
      vehicle: { select: { brand: true, model: true, plate: true } },
      customer: { select: { name: true } },
      mechanic: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Órdenes de servicio</h1>
        {session.user.role === "admin" && (
          <Link href="/panel/ordenes/nueva" className={buttonVariants({ size: "sm" })}>
            Crear orden
          </Link>
        )}
      </div>

      <form className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="status">
            Estado
          </label>
          <Select id="status" name="status" defaultValue={status ?? ""}>
            <option value="">Todos</option>
            {Object.entries(SERVICE_ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>{orders.length} órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay órdenes para mostrar.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-4 py-3">
                  <Link href={`/panel/ordenes/${order.id}`} className="hover:underline">
                    <p className="text-sm font-medium">
                      {order.vehicle.brand} {order.vehicle.model} — {order.vehicle.plate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer.name}
                      {order.mechanic ? ` · Mecánico: ${order.mechanic.name}` : ""}
                    </p>
                  </Link>
                  <ServiceOrderStatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
