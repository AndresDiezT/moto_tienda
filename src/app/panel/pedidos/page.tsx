import Link from "next/link";
import { forbidden, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/status-badge";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) unauthorized();
  if (session.user.role !== "admin") forbidden();

  const params = await searchParams;
  const status = typeof params.status === "string" ? (params.status as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Pedidos de la tienda</h1>

      <form className="flex items-end gap-2">
        <Select name="status" defaultValue={status ?? ""} className="max-w-xs">
          <option value="">Todos los estados</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>{orders.length} pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay pedidos para mostrar.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-3">
                  <Link href={`/panel/pedidos/${order.id}`} className="hover:underline">
                    <p className="text-sm font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("es-CO", { dateStyle: "medium" })} —
                      ${Number(order.total).toLocaleString("es-CO")}
                    </p>
                  </Link>
                  <OrderStatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
