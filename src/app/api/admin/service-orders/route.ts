import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { createServiceOrderSchema } from "@/lib/validation/service-orders";

export async function POST(request: Request) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const body = await request.json();
  const parsed = createServiceOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const { vehicleId, mechanicId, problemDescription } = parsed.data;

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
  }

  const mechanic = await prisma.user.findUnique({ where: { id: mechanicId } });
  if (!mechanic || mechanic.role !== "mechanic" || !mechanic.active) {
    return NextResponse.json({ error: "Mecánico no válido" }, { status: 422 });
  }

  // La orden y su primer evento de timeline (regla del contrato: todo cambio
  // de status queda reflejado en ServiceOrderEvent) se crean juntos.
  const serviceOrder = await prisma.serviceOrder.create({
    data: {
      vehicleId,
      customerId: vehicle.ownerId,
      mechanicId,
      problemDescription,
      status: "received",
      events: {
        create: {
          status: "received",
          note: "Orden creada",
          authorId: check.user.id,
        },
      },
    },
  });

  return NextResponse.json(serviceOrder, { status: 201 });
}
