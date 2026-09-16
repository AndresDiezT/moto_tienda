import "server-only";
import { prisma } from "@/lib/prisma";
import type { ServiceOrderStatus } from "@/generated/prisma/enums";

// HU-04.1 / docs/CONTRACTS-API/dashboard.md: forma exacta de la respuesta,
// compartida entre el endpoint GET /api/admin/dashboard/summary y la página
// del panel para que no se desincronicen.
const PENDING_ORDER_STATUSES = ["paid", "preparing", "ready_or_shipped"] as const;

const ACTIVE_SERVICE_ORDER_STATUSES: ServiceOrderStatus[] = [
  "received",
  "diagnosing",
  "quote_sent",
  "approved",
  "in_repair",
  "quality_check",
  "ready_for_pickup",
];

export type DashboardSummary = {
  pendingOrders: number;
  activeServiceOrdersByStatus: Record<string, number>;
  quotesPendingApproval: number;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [pendingOrders, serviceOrdersByStatus, quotesPendingApproval] = await Promise.all([
    prisma.order.count({ where: { status: { in: [...PENDING_ORDER_STATUSES] } } }),
    prisma.serviceOrder.groupBy({
      by: ["status"],
      where: { status: { not: "delivered" } },
      _count: { _all: true },
    }),
    prisma.serviceOrder.count({ where: { quoteStatus: "pending" } }),
  ]);

  const countByStatus = new Map(serviceOrdersByStatus.map((row) => [row.status, row._count._all]));
  const activeServiceOrdersByStatus = Object.fromEntries(
    ACTIVE_SERVICE_ORDER_STATUSES.map((status) => [status, countByStatus.get(status) ?? 0])
  );

  return { pendingOrders, activeServiceOrdersByStatus, quotesPendingApproval };
}
