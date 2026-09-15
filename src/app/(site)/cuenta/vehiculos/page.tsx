import { unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { VehiclesList } from "@/components/vehicles/vehicles-list";

export default async function CustomerVehiclesPage() {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["customer"])) forbidden();

  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex-1 py-12">
      <Container className="max-w-2xl">
        <h1 className="mb-6 text-xl font-semibold">Mis vehículos</h1>
        <VehiclesList
          initialVehicles={vehicles}
          createEndpoint="/api/vehicles"
          basePath="/cuenta/vehiculos"
          listTitle="Mis vehículos"
          emptyMessage="Todavía no tienes vehículos registrados."
        />
      </Container>
    </main>
  );
}
