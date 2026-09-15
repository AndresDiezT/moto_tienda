"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuoteApproval({
  serviceOrderId,
  estimatedCost,
}: {
  serviceOrderId: string;
  estimatedCost: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(action: "approve" | "reject") {
    setError(null);
    setPending(action);
    try {
      const res = await fetch(`/api/service-orders/${serviceOrderId}/quote/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        setError("No se pudo procesar la acción.");
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cotización del taller</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-lg font-semibold">${estimatedCost.toLocaleString("es-CO")} COP</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={() => handle("approve")} disabled={pending !== null}>
            {pending === "approve" ? "Aprobando..." : "Aprobar"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handle("reject")}
            disabled={pending !== null}
          >
            {pending === "reject" ? "Rechazando..." : "Rechazar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
