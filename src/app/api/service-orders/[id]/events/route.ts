import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { addServiceOrderEventSchema } from "@/lib/validation/service-orders";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/service-orders/[id]/events">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const serviceOrder = await prisma.serviceOrder.findUnique({ where: { id } });
  if (!serviceOrder) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const isAssignedMechanic = user.role === "mechanic" && serviceOrder.mechanicId === user.id;
  const isAdmin = user.role === "admin";
  if (!isAssignedMechanic && !isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = addServiceOrderEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const { status, note, photos } = parsed.data;

  // ADR-0005: ningún endpoint de esta lista valida el estado del pago antes
  // de aceptar la transición — el mecánico puede avanzar sin esperar el pago.
  const [, event] = await prisma.$transaction([
    prisma.serviceOrder.update({ where: { id }, data: { status } }),
    prisma.serviceOrderEvent.create({
      data: { serviceOrderId: id, status, note, photos, authorId: user.id },
    }),
  ]);

  return NextResponse.json(event, { status: 201 });
}
