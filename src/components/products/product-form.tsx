"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PhotoUploader } from "@/components/ui/photo-uploader";

type Category = { id: string; name: string };

export function ProductForm({
  categories,
  onCreated,
}: {
  categories: Category[];
  onCreated: (product: unknown) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: categories[0]?.id ?? "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          categoryId: form.categoryId,
          images,
        }),
      });
      if (!res.ok) {
        setError("Revisa los datos ingresados.");
        return;
      }
      onCreated(await res.json());
      setForm({ name: "", description: "", price: "", stock: "", categoryId: categories[0]?.id ?? "" });
      setImages([]);
    } finally {
      setPending(false);
    }
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Crea primero una categoría para poder registrar productos.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoryId">Categoría</Label>
        <Select
          id="categoryId"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="price">Precio (COP)</Label>
        <Input
          id="price"
          type="number"
          min={0}
          required
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stock">Stock</Label>
        <Input
          id="stock"
          type="number"
          min={0}
          required
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          required
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Imágenes</Label>
        <PhotoUploader purpose="product-image" photos={images} onChange={setImages} />
      </div>
      {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
