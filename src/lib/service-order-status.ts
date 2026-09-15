import type { ServiceOrderStatus } from "@/generated/prisma/enums";
import type { BadgeProps } from "@/components/ui/badge";

// Secuencia de HU-03.3: Recibido → En diagnóstico → Presupuesto enviado →
// Aprobado → En reparación → Control de calidad → Listo para entrega → Entregado.
export const SERVICE_ORDER_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  received: "Recibido",
  diagnosing: "En diagnóstico",
  quote_sent: "Presupuesto enviado",
  approved: "Aprobado",
  in_repair: "En reparación",
  quality_check: "Control de calidad",
  ready_for_pickup: "Listo para entrega",
  delivered: "Entregado",
};

export const SERVICE_ORDER_STATUS_BADGE_VARIANT: Record<
  ServiceOrderStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  received: "default",
  diagnosing: "default",
  quote_sent: "warning",
  approved: "primary",
  in_repair: "primary",
  quality_check: "primary",
  ready_for_pickup: "warning",
  delivered: "success",
};

// Estados que un mecánico/admin puede setear vía POST .../events (Fase 2).
// "received" es el inicial y "quote_sent"/"approved" llegan por los
// endpoints de cotización en Fase 3 — ver docs/CONTRACTS-API/ordenes-servicio.md.
export const EVENT_ASSIGNABLE_STATUSES: ServiceOrderStatus[] = [
  "diagnosing",
  "in_repair",
  "quality_check",
  "ready_for_pickup",
  "delivered",
];
