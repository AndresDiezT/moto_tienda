"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VehicleFormValues = {
  brand: string;
  model: string;
  year: string;
  plate: string;
  vin: string;
};

const EMPTY: VehicleFormValues = { brand: "", model: "", year: "", plate: "", vin: "" };

export function VehicleForm({
  endpoint,
  customerId,
  onCreated,
}: {
  endpoint: string;
  customerId?: string;
  onCreated: (vehicle: unknown) => void;
}) {
  const [form, setForm] = useState<VehicleFormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(field: keyof VehicleFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(customerId ? { customerId } : {}),
          brand: form.brand,
          model: form.model,
          year: Number(form.year),
          plate: form.plate,
          vin: form.vin || null,
        }),
      });
      if (res.status === 409) {
        setError("Ya existe un vehículo con esa placa.");
        return;
      }
      if (!res.ok) {
        setError("Revisa los datos ingresados.");
        return;
      }
      onCreated(await res.json());
      setForm(EMPTY);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="brand">Marca</Label>
        <Input id="brand" required value={form.brand} onChange={update("brand")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="model">Modelo</Label>
        <Input id="model" required value={form.model} onChange={update("model")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="year">Año</Label>
        <Input
          id="year"
          type="number"
          required
          min={1900}
          value={form.year}
          onChange={update("year")}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="plate">Placa</Label>
        <Input id="plate" required value={form.plate} onChange={update("plate")} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="vin">VIN (opcional)</Label>
        <Input id="vin" value={form.vin} onChange={update("vin")} />
      </div>
      {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Registrar vehículo"}
        </Button>
      </div>
    </form>
  );
}
