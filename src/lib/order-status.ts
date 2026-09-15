import type { OrderStatus } from "@/generated/prisma/enums";
import type { BadgeProps } from "@/components/ui/badge";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pendiente de pago",
  paid: "Pagado",
  preparing: "En preparación",
  ready_or_shipped: "Listo/Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, NonNullable<BadgeProps["variant"]>> = {
  pending_payment: "warning",
  paid: "primary",
  preparing: "default",
  ready_or_shipped: "primary",
  delivered: "success",
  cancelled: "destructive",
};
