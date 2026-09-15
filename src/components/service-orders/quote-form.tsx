"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { QuoteStatus } from "@/generated/prisma/enums";

export function QuoteForm({
  serviceOrderId,
  currentEstimatedCost,
  quoteStatus,
}: {
  serviceOrderId: string;
  currentEstimatedCost: number | null;
  quoteStatus: QuoteStatus | null;
}) {
  const router = useRouter();
  const [estimatedCost, setEstimatedCost] = useState(
    currentEstimatedCost !== null ? String(currentEstimatedCost) : ""
  );
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (quoteStatus === "approved") {
    return (
      <p className="text-sm text-muted-foreground">
        La cotización ya fue aprobada por el cliente y no se puede modificar.
      </p>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/service-orders/${serviceOrderId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedCost: Number(estimatedCost), detail: detail || undefined }),
      });
      if (!res.ok) {
        setError("Revisa los datos ingresados.");
        return;
      }
      setDetail("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="estimatedCost">Costo estimado (COP)</Label>
        <Input
          id="estimatedCost"
          type="number"
          min={0}
          step="1"
          required
          value={estimatedCost}
          onChange={(e) => setEstimatedCost(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="detail">Detalle (opcional)</Label>
        <Textarea id="detail" value={detail} onChange={(e) => setDetail(e.target.value)} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : quoteStatus ? "Actualizar cotización" : "Enviar cotización"}
      </Button>
    </form>
  );
}
