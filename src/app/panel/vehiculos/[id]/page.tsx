import Link from "next/link";
import { forbidden, notFound, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { VehicleDetailCard } from "@/components/vehicles/vehicle-detail-card";
import { ServiceOrderStatusBadge } from "@/components/service-orders/status-badge";

type Props = { params: Promise<{ id: string }> };

export default async function AdminVehicleDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) unauthorized();
  if (session.user.role !== "admin") forbidden();

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      serviceOrders: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!vehicle) notFound();

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Dueño:{" "}
        <Link href={`/panel/clientes/${vehicle.owner.id}`} className="hover:underline">
          {vehicle.owner.name}
        </Link>
      </p>

      <VehicleDetailCard vehicle={vehicle} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Órdenes de servicio</CardTitle>
          <Link
            href={`/panel/ordenes/nueva?vehicleId=${vehicle.id}`}
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            Crear orden
          </Link>
        </CardHeader>
        <CardContent>
          {vehicle.serviceOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este vehículo todavía no tiene órdenes de servicio.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {vehicle.serviceOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-3">
                  <Link href={`/panel/ordenes/${order.id}`} className="text-sm hover:underline">
                    Orden del{" "}
                    {new Date(order.createdAt).toLocaleDateString("es-CO", { dateStyle: "medium" })}
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
