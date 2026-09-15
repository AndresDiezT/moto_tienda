import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, type ServiceOrderStatus } from "@/generated/prisma/client";
import { getSessionUser } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId") ?? undefined;
  const status = (searchParams.get("status") as ServiceOrderStatus | null) ?? undefined;
  const mechanicId = searchParams.get("mechanicId") ?? undefined;

  const conditions: Prisma.ServiceOrderWhereInput[] = [];

  // El filtrado por rol se aplica siempre acá, nunca solo en la UI (HU-01.4,
  // regla 4 de docs/ARCHITECTURE/modelo-de-datos.md).
  if (user.role === "customer") {
    conditions.push({ customerId: user.id });
  } else if (user.role === "mechanic") {
    conditions.push({ mechanicId: user.id });
  } else if (mechanicId) {
    conditions.push({ mechanicId });
  }

  if (vehicleId) conditions.push({ vehicleId });
  if (status) conditions.push({ status });

  const serviceOrders = await prisma.serviceOrder.findMany({
    where: conditions.length > 0 ? { AND: conditions } : {},
    include: {
      vehicle: { select: { id: true, brand: true, model: true, plate: true } },
      mechanic: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(serviceOrders);
}
