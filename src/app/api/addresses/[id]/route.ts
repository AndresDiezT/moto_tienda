import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { updateAddressSchema } from "@/lib/validation/addresses";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/addresses/[id]">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await prisma.address.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/addresses/[id]">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orderCount = await prisma.order.count({ where: { addressId: id } });
  if (orderCount > 0) {
    return NextResponse.json(
      { error: "Esta dirección ya se usó en un pedido y no se puede eliminar" },
      { status: 409 }
    );
  }

  await prisma.address.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
