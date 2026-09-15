"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string };

export function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  // CategoriesManager y ProductsManager (con ProductForm) son componentes
  // hermanos, cada uno con su propio estado inicializado desde el server —
  // crear/renombrar acá no le llega automáticamente al otro. router.refresh()
  // vuelve a pedirle al Server Component las props actualizadas a ambos.
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return;
      const created = (await res.json()) as Category;
      setCategories((list) => [...list, created]);
      setName("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleRename(id: string, newName: string) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (!res.ok) return;
    const updated = (await res.json()) as Category;
    setCategories((list) => list.map((c) => (c.id === updated.id ? updated : c)));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            placeholder="Nueva categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit" disabled={pending}>
            Agregar
          </Button>
        </form>
        <ul className="flex flex-col divide-y divide-border">
          {categories.map((category) => (
            <li key={category.id} className="py-2">
              <Input
                defaultValue={category.name}
                onBlur={(e) => {
                  if (e.target.value !== category.name && e.target.value.trim()) {
                    handleRename(category.id, e.target.value.trim());
                  }
                }}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
