"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart-context";

type Product = { id: string; name: string; price: number | string; stock: number; images: string[] };

export function AddToCartForm({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return <p className="text-sm text-destructive">Producto agotado.</p>;
  }

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images[0] ?? null,
        stock: product.stock,
      },
      quantity
    );
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
            className="w-24"
          />
        </div>
        <Button onClick={handleAdd}>Agregar al carrito</Button>
      </div>
      {added && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-success">Agregado al carrito.</span>
          <button onClick={() => router.push("/carrito")} className="underline">
            Ver carrito
          </button>
        </div>
      )}
    </div>
  );
}
