"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Address = { id: string; line1: string; city: string; reference: string | null };

export function AddressesManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState({ line1: "", city: "", reference: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, reference: form.reference || null }),
      });
      if (!res.ok) {
        setError("Revisa los datos ingresados.");
        return;
      }
      const created = (await res.json()) as Address;
      setAddresses((list) => [created, ...list]);
      setForm({ line1: "", city: "", reference: "" });
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.status === 409) {
      alert("Esta dirección ya se usó en un pedido y no se puede eliminar.");
      return;
    }
    if (res.ok) {
      setAddresses((list) => list.filter((a) => a.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Agregar dirección</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="line1">Dirección</Label>
              <Input
                id="line1"
                required
                value={form.line1}
                onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                required
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reference">Referencia (opcional)</Label>
              <Input
                id="reference"
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Agregar dirección"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis direcciones</CardTitle>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes direcciones guardadas.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {addresses.map((address) => (
                <li key={address.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{address.line1}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}
                      {address.reference && ` — ${address.reference}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(address.id)}>
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
