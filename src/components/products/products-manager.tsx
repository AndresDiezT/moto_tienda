"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductForm } from "@/components/products/product-form";

type Product = {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  active: boolean;
  category: { id: string; name: string };
};
type Category = { id: string; name: string };

function ProductRow({
  product: initial,
  onUpdated,
}: {
  product: Product;
  onUpdated: (product: Product) => void;
}) {
  const [product, setProduct] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ price: String(product.price), stock: String(product.stock) });
  const [pending, setPending] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return;
      const updated = (await res.json()) as Product;
      setProduct(updated);
      onUpdated(updated);
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground">
            {product.category.name} · ${Number(product.price).toLocaleString("es-CO")} · Stock:{" "}
            {product.stock}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={product.active ? "success" : "default"}>
            {product.active ? "Activo" : "Inactivo"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
            {editing ? "Cerrar" : "Editar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => patch({ active: !product.active })}
          >
            {product.active ? "Desactivar" : "Activar"}
          </Button>
        </div>
      </div>
      {editing && (
        <div className="flex items-end gap-2 rounded-md border border-border p-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`price-${product.id}`}>Precio</Label>
            <Input
              id={`price-${product.id}`}
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-32"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`stock-${product.id}`}>Stock</Label>
            <Input
              id={`stock-${product.id}`}
              type="number"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              className="w-24"
            />
          </div>
          <Button
            size="sm"
            disabled={pending}
            onClick={() => patch({ price: Number(form.price), stock: Number(form.stock) })}
          >
            Guardar
          </Button>
        </div>
      )}
    </li>
  );
}

export function ProductsManager({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear producto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            categories={categories}
            onCreated={(p) => setProducts((list) => [p as Product, ...list])}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay productos.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onUpdated={(updated) =>
                    setProducts((list) => list.map((p) => (p.id === updated.id ? updated : p)))
                  }
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
