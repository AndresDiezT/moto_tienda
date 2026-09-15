import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { createAddressSchema } from "@/lib/validation/addresses";

export async function POST(request: Request) {
  const check = await requireRole("customer");
  if (!check.ok) return check.response;

  const body = await request.json();
  const parsed = createAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const address = await prisma.address.create({
    data: { ...parsed.data, userId: check.user.id },
  });
  return NextResponse.json(address, { status: 201 });
}

export async function GET() {
  const check = await requireRole("customer");
  if (!check.ok) return check.response;

  const addresses = await prisma.address.findMany({
    where: { userId: check.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(addresses);
}
