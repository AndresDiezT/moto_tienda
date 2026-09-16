import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  const auth = await requireRole("customer");
  if (!auth.ok) return auth.response;

  const invoices = await prisma.invoice.findMany({
    where: {
      payment: {
        OR: [
          { order: { customerId: auth.user.id } },
          { serviceOrder: { customerId: auth.user.id } },
        ],
      },
    },
    include: { payment: { select: { amount: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({
    items: invoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      series: invoice.series,
      issuedAt: invoice.issuedAt,
      total: Number(invoice.payment.amount),
    })),
  });
}
