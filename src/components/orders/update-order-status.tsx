"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/enums";

const ADMIN_ASSIGNABLE_STATUSES: OrderStatus[] = [
  "preparing",
  "ready_or_shipped",
  "delivered",
  "cancelled",
];

export function UpdateOrderStatus({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(status: string) {
    setPending(true);
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="status">Estado del pedido</Label>
      <Select
        id="status"
        defaultValue={currentStatus}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
      >
        {ADMIN_ASSIGNABLE_STATUSES.includes(currentStatus) ? null : (
          <option value={currentStatus}>{ORDER_STATUS_LABELS[currentStatus]}</option>
        )}
        {ADMIN_ASSIGNABLE_STATUSES.map((value) => (
          <option key={value} value={value}>
            {ORDER_STATUS_LABELS[value]}
          </option>
        ))}
      </Select>
    </div>
  );
}
