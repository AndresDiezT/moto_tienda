import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { createProductSchema } from "@/lib/validation/products";

export async function POST(request: Request) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const product = await prisma.product.create({
    data: parsed.data,
    include: { category: { select: { id: true, name: true } } },
  });
  return NextResponse.json(product, { status: 201 });
}
