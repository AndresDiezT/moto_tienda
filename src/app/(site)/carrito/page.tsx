"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="flex flex-1 items-center py-16">
        <Container className="max-w-md text-center">
          <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
          <Link href="/tienda" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
            Ir a la tienda
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1 py-12">
      <Container className="max-w-2xl">
        <h1 className="mb-6 text-xl font-semibold">Mi carrito</h1>
        <Card>
          <CardContent className="flex flex-col divide-y divide-border pt-6">
            {items.map((item) => (
              <div key={item.productId} className="flex flex-wrap items-center gap-4 py-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toLocaleString("es-CO")} c/u
                  </p>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                  className="w-20"
                />
                <p className="w-24 text-right text-sm font-medium">
                  ${(item.price * item.quantity).toLocaleString("es-CO")}
                </p>
                <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId)}>
                  Quitar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Total: ${subtotal.toLocaleString("es-CO")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/checkout" className={buttonVariants({ variant: "primary" })}>
              Continuar al checkout
            </Link>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
