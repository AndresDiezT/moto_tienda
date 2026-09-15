"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type VehicleOption = { id: string; brand: string; model: string; plate: string; ownerName: string };
type MechanicOption = { id: string; name: string };

export function CreateServiceOrderForm({
  vehicles,
  mechanics,
  defaultVehicleId,
}: {
  vehicles: VehicleOption[];
  mechanics: MechanicOption[];
  defaultVehicleId?: string;
}) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState(defaultVehicleId ?? vehicles[0]?.id ?? "");
  const [mechanicId, setMechanicId] = useState(mechanics[0]?.id ?? "");
  const [problemDescription, setProblemDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, mechanicId, problemDescription }),
      });
      if (!res.ok) {
        setError("Revisa los datos ingresados.");
        return;
      }
      const order = (await res.json()) as { id: string };
      router.push(`/panel/ordenes/${order.id}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (vehicles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay vehículos registrados todavía. Registra uno desde la ficha de un cliente.
      </p>
    );
  }
  if (mechanics.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay mecánicos activos. Crea uno primero en la sección de mecánicos.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vehicleId">Vehículo</Label>
        <Select id="vehicleId" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} — {v.plate} ({v.ownerName})
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mechanicId">Mecánico asignado</Label>
        <Select id="mechanicId" value={mechanicId} onChange={(e) => setMechanicId(e.target.value)}>
          {mechanics.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="problemDescription">Descripción del problema</Label>
        <Textarea
          id="problemDescription"
          required
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear orden"}
      </Button>
    </form>
  );
}
