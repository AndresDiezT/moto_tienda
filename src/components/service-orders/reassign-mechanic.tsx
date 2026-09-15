"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ReassignMechanic({
  serviceOrderId,
  mechanics,
  currentMechanicId,
}: {
  serviceOrderId: string;
  mechanics: { id: string; name: string }[];
  currentMechanicId: string | null;
}) {
  const router = useRouter();
  const [mechanicId, setMechanicId] = useState(currentMechanicId ?? "");
  const [pending, setPending] = useState(false);

  async function handleChange(newMechanicId: string) {
    setMechanicId(newMechanicId);
    setPending(true);
    try {
      await fetch(`/api/admin/service-orders/${serviceOrderId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mechanicId: newMechanicId }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="reassign">Mecánico asignado</Label>
      <Select
        id="reassign"
        value={mechanicId}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
      >
        {mechanics.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
