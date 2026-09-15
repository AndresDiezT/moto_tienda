"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MarkPaidInPersonButton({ serviceOrderId }: { serviceOrderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("¿Confirmas que el cliente ya pagó en efectivo/datáfono en el taller?")) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/admin/service-orders/${serviceOrderId}/pay-in-person`, {
        method: "POST",
      });
      if (!res.ok) {
        setError("No se pudo registrar el pago.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button variant="outline" onClick={handleClick} disabled={pending}>
        {pending ? "Registrando..." : "Registrar pago recibido en el taller"}
      </Button>
    </div>
  );
}
