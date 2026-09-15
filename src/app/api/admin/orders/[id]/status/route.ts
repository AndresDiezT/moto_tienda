import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { updateOrderStatusSchema } from "@/lib/validation/orders";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/orders/[id]/status">
) {
  const check = await requireRole("admin");
  if (!check.ok) return check.response;

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const order = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json(order);
}
