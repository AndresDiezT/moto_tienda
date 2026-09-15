import { Badge } from "@/components/ui/badge";
import type { ServiceOrderStatus } from "@/generated/prisma/enums";
import {
  SERVICE_ORDER_STATUS_BADGE_VARIANT,
  SERVICE_ORDER_STATUS_LABELS,
} from "@/lib/service-order-status";

export function ServiceOrderStatusBadge({ status }: { status: ServiceOrderStatus }) {
  return (
    <Badge variant={SERVICE_ORDER_STATUS_BADGE_VARIANT[status]}>
      {SERVICE_ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
