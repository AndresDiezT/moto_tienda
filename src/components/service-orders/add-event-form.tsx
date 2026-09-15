"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PhotoUploader } from "@/components/ui/photo-uploader";
import { EVENT_ASSIGNABLE_STATUSES, SERVICE_ORDER_STATUS_LABELS } from "@/lib/service-order-status";
import type { ServiceOrderStatus } from "@/generated/prisma/enums";

export function AddServiceOrderEventForm({
  serviceOrderId,
  currentStatus,
}: {
  serviceOrderId: string;
  currentStatus: ServiceOrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ServiceOrderStatus>(
    EVENT_ASSIGNABLE_STATUSES.includes(currentStatus) ? currentStatus : EVENT_ASSIGNABLE_STATUSES[0]
  );
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/service-orders/${serviceOrderId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note || undefined, photos }),
      });
      if (!res.ok) {
        setError("No se pudo registrar la actualización.");
        return;
      }
      setNote("");
      setPhotos([]);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Nuevo estado</Label>
        <Select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ServiceOrderStatus)}
        >
          {EVENT_ASSIGNABLE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {SERVICE_ORDER_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note">Nota (opcional)</Label>
        <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Fotos (opcional)</Label>
        <PhotoUploader purpose="service-order-photo" photos={photos} onChange={setPhotos} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Actualizar estado"}
      </Button>
    </form>
  );
}
