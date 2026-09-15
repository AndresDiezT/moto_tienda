import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;

  const customers = await prisma.user.findMany({
    where: {
      role: "customer",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      _count: { select: { vehicles: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      active: c.active,
      vehicleCount: c._count.vehicles,
    }))
  );
}
