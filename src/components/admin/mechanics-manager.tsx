"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Mechanic = { id: string; name: string; email: string; active: boolean };

export function MechanicsManager({ initialMechanics }: { initialMechanics: Mechanic[] }) {
  const [mechanics, setMechanics] = useState(initialMechanics);
  const [form, setForm] = useState({ name: "", email: "", phone: "", temporaryPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/mechanics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 409) {
        setError("Ese correo ya está registrado.");
        return;
      }
      if (!res.ok) {
        setError("Revisa los datos ingresados.");
        return;
      }
      const created = (await res.json()) as Mechanic;
      setMechanics((list) => [...list, created].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ name: "", email: "", phone: "", temporaryPassword: "" });
    } finally {
      setPending(false);
    }
  }

  async function toggleActive(mechanic: Mechanic) {
    const res = await fetch(`/api/admin/mechanics/${mechanic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !mechanic.active }),
    });
    if (!res.ok) return;
    const updated = (await res.json()) as Mechanic;
    setMechanics((list) => list.map((m) => (m.id === updated.id ? updated : m)));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear mecánico</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" required value={form.name} onChange={update("name")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={update("email")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" required value={form.phone} onChange={update("phone")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="temporaryPassword">Contraseña inicial</Label>
              <PasswordInput
                id="temporaryPassword"
                minLength={8}
                required
                value={form.temporaryPassword}
                onChange={update("temporaryPassword")}
              />
            </div>
            {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Creando..." : "Crear mecánico"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mecánicos</CardTitle>
        </CardHeader>
        <CardContent>
          {mechanics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay mecánicos registrados.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {mechanics.map((mechanic) => (
                <li key={mechanic.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{mechanic.name}</p>
                    <p className="text-sm text-muted-foreground">{mechanic.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={mechanic.active ? "success" : "default"}>
                      {mechanic.active ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => toggleActive(mechanic)}>
                      {mechanic.active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
