import { forbidden, notFound, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehiclesList } from "@/components/vehicles/vehicles-list";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) unauthorized();
  if (session.user.role !== "admin") forbidden();

  const { id } = await params;
  const customer = await prisma.user.findUnique({
    where: { id, role: "customer" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      vehicles: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{customer.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {customer.email} · {customer.phone}
        </CardContent>
      </Card>

      <VehiclesList
        initialVehicles={customer.vehicles}
        createEndpoint="/api/admin/vehicles"
        basePath="/panel/vehiculos"
        customerId={customer.id}
        listTitle={`Vehículos de ${customer.name}`}
        emptyMessage="Este cliente todavía no tiene vehículos registrados."
      />
    </div>
  );
}
