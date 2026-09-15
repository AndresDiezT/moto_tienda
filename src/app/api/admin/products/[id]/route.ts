import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { updateProductSchema } from "@/lib/validation/products";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/products/[id]">
) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
    include: { category: { select: { id: true, name: true } } },
  });
  return NextResponse.json(product);
}
