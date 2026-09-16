import Link from "next/link";
import { redirect, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { landingPathForRole } from "@/lib/roles";
import { getDashboardSummary } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERVICE_ORDER_STATUS_LABELS } from "@/lib/service-order-status";

// HU-04.1: resumen del taller, solo para admin — mechanic y customer
// siguen aterrizando en su propia vista tras el login (ver landingPathForRole).
export default async function PanelIndexPage() {
  const session = await auth();
  if (!session) unauthorized();
  if (session.user.role !== "admin") {
    redirect(landingPathForRole(session.user.role));
  }

  const { pendingOrders, activeServiceOrdersByStatus, quotesPendingApproval } =
    await getDashboardSummary();
  const serviceOrdersByStatus = Object.entries(activeServiceOrdersByStatus).filter(
    ([, count]) => count > 0
  );
  const activeCount = serviceOrdersByStatus.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Panel del taller</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/panel/pedidos">
          <Card className="h-full transition-colors hover:border-primary">
            <CardHeader>
              <CardTitle>Pedidos de tienda pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{pendingOrders}</p>
              <p className="text-sm text-muted-foreground">
                Pagados, en preparación o listos/enviados.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/panel/ordenes?status=quote_sent">
          <Card className="h-full transition-colors hover:border-primary">
            <CardHeader>
              <CardTitle>Cotizaciones pendientes de aprobación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{quotesPendingApproval}</p>
              <p className="text-sm text-muted-foreground">Esperando respuesta del cliente.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Órdenes de servicio activas ({activeCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceOrdersByStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay órdenes activas.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {serviceOrdersByStatus.map(([status, count]) => (
                <li key={status} className="flex items-center justify-between py-3">
                  <Link
                    href={`/panel/ordenes?status=${status}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {SERVICE_ORDER_STATUS_LABELS[status as keyof typeof SERVICE_ORDER_STATUS_LABELS]}
                  </Link>
                  <Badge variant="primary">{count}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
