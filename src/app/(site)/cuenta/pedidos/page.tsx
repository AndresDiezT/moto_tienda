import Link from "next/link";
import { unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/status-badge";

export default async function OrdersHistoryPage() {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["customer"])) forbidden();

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex-1 py-12">
      <Container className="max-w-2xl">
        <h1 className="mb-6 text-xl font-semibold">Mis pedidos</h1>
        <Card>
          <CardHeader>
            <CardTitle>{orders.length} pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no has hecho pedidos.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {orders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between py-3">
                    <Link href={`/cuenta/pedidos/${order.id}`} className="hover:underline">
                      <p className="text-sm font-medium">
                        {new Date(order.createdAt).toLocaleDateString("es-CO", { dateStyle: "medium" })}
                      </p>
                      <p className="text-sm text-muted-foreground">
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
      </Container>
    </main>
  );
}
