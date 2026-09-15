import Link from "next/link";
import { notFound, unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceOrderStatusBadge } from "@/components/service-orders/status-badge";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerVehicleDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["customer"])) forbidden();

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      serviceOrders: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!vehicle) notFound();
  if (vehicle.ownerId !== session.user.id) forbidden();

  return (
    <main className="flex-1 py-12">
      <Container className="max-w-2xl">
        <h1 className="mb-6 text-xl font-semibold">
          {vehicle.brand} {vehicle.model} ({vehicle.year})
        </h1>
        <Card className="mb-6">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Placa: {vehicle.plate}
            {vehicle.vin && <> · VIN: {vehicle.vin}</>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Órdenes de servicio</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle.serviceOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay órdenes de servicio para este vehículo.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {vehicle.serviceOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between py-3">
                    <Link href={`/cuenta/ordenes/${order.id}`} className="text-sm hover:underline">
                      Orden del{" "}
                      {new Date(order.createdAt).toLocaleDateString("es-CO", {
                        dateStyle: "medium",
                      })}
                    </Link>
                    <ServiceOrderStatusBadge status={order.status} />
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
