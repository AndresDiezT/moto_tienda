import { forbidden, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateServiceOrderForm } from "@/components/service-orders/create-service-order-form";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NewServiceOrderPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) unauthorized();
  if (session.user.role !== "admin") forbidden();

  const params = await searchParams;
  const defaultVehicleId = typeof params.vehicleId === "string" ? params.vehicleId : undefined;

  const [vehicles, mechanics] = await Promise.all([
    prisma.vehicle.findMany({
      include: { owner: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "mechanic", active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Crear orden de servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateServiceOrderForm
          vehicles={vehicles.map((v) => ({
            id: v.id,
            brand: v.brand,
            model: v.model,
            plate: v.plate,
            ownerName: v.owner.name,
          }))}
          mechanics={mechanics}
          defaultVehicleId={defaultVehicleId}
        />
      </CardContent>
    </Card>
  );
}
