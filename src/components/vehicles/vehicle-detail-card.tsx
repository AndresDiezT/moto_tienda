"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin: string | null;
};

export function VehicleDetailCard({ vehicle: initialVehicle }: { vehicle: Vehicle }) {
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    brand: vehicle.brand,
    model: vehicle.model,
    year: String(vehicle.year),
    plate: vehicle.plate,
    vin: vehicle.vin ?? "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: form.brand,
          model: form.model,
          year: Number(form.year),
          plate: form.plate,
          vin: form.vin || null,
        }),
      });
      if (!res.ok) {
        setError("No se pudo guardar. Revisa los datos.");
        return;
      }
      setVehicle(await res.json());
      setEditing(false);
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placa: {vehicle.plate}
          {vehicle.vin && <> · VIN: {vehicle.vin}</>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar vehículo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
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
            <Input id="year" type="number" required value={form.year} onChange={update("year")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plate">Placa</Label>
            <Input id="plate" required value={form.plate} onChange={update("plate")} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="vin">VIN</Label>
            <Input id="vin" value={form.vin} onChange={update("vin")} />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
