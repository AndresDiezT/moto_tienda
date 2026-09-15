import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-helpers";
import { adminCreateVehicleSchema } from "@/lib/validation/vehicles";

export async function POST(request: Request) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const body = await request.json();
  const parsed = adminCreateVehicleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const { customerId, ...vehicleFields } = parsed.data;

  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer || customer.role !== "customer") {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const existing = await prisma.vehicle.findUnique({
    where: { ownerId_plate: { ownerId: customerId, plate: vehicleFields.plate } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Ese cliente ya tiene un vehículo con esa placa" },
      { status: 409 }
    );
  }

  const vehicle = await prisma.vehicle.create({
    data: { ...vehicleFields, ownerId: customerId },
  });

  return NextResponse.json(vehicle, { status: 201 });
}

export async function GET(request: Request) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const conditions: Prisma.VehicleWhereInput[] = [];
  if (customerId) conditions.push({ ownerId: customerId });
  if (search) {
    conditions.push({
      OR: [
        { plate: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: conditions.length > 0 ? { AND: conditions } : {},
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles);
}
