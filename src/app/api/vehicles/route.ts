import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { createVehicleSchema } from "@/lib/validation/vehicles";

export async function POST(request: Request) {
  const check = await requireRole("customer");
  if (!check.ok) return check.response;

  const body = await request.json();
  const parsed = createVehicleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await prisma.vehicle.findUnique({
    where: { ownerId_plate: { ownerId: check.user.id, plate: parsed.data.plate } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya tienes un vehículo con esa placa" }, { status: 409 });
  }

  const vehicle = await prisma.vehicle.create({
    data: { ...parsed.data, ownerId: check.user.id },
  });

  return NextResponse.json(vehicle, { status: 201 });
}

export async function GET() {
  const check = await requireRole("customer");
  if (!check.ok) return check.response;

  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: check.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles);
}
