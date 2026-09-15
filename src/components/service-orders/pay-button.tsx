"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PayButton({ serviceOrderId }: { serviceOrderId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/service-orders/${serviceOrderId}/pay`, { method: "POST" });
      if (!res.ok) {
        setError("No se pudo iniciar el pago. Intenta de nuevo.");
        return;
      }
      const { checkoutUrl } = (await res.json()) as { checkoutUrl: string };
      window.location.href = checkoutUrl;
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleClick} disabled={pending}>
        {pending ? "Redirigiendo a Mercado Pago..." : "Pagar servicio"}
      </Button>
    </div>
  );
}
