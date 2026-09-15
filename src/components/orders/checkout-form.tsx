"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FIXED_SHIPPING_COST } from "@/lib/shipping";
import type { Address } from "@/components/addresses/addresses-manager";

export function CheckoutForm({ initialAddresses }: { initialAddresses: Address[] }) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [addressId, setAddressId] = useState(initialAddresses[0]?.id ?? "");
  const [newAddress, setNewAddress] = useState({ line1: "", city: "", reference: "" });
  const [addingAddress, setAddingAddress] = useState(initialAddresses.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const shippingCost = deliveryMethod === "delivery" ? FIXED_SHIPPING_COST : 0;
  const total = subtotal + shippingCost;

  async function handleAddAddress() {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newAddress, reference: newAddress.reference || null }),
    });
    if (!res.ok) {
      setError("No se pudo guardar la dirección.");
      return null;
    }
    const created = (await res.json()) as Address;
    setAddresses((list) => [created, ...list]);
    setAddressId(created.id);
    setAddingAddress(false);
    return created.id;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      let finalAddressId = addressId;
      if (deliveryMethod === "delivery" && addingAddress) {
        const created = await handleAddAddress();
        if (!created) return;
        finalAddressId = created;
      }
      if (deliveryMethod === "delivery" && !finalAddressId) {
        setError("Selecciona o agrega una dirección de envío.");
        return;
      }

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          deliveryMethod,
          addressId: deliveryMethod === "delivery" ? finalAddressId : null,
        }),
      });
      if (!orderRes.ok) {
        setError("No se pudo crear el pedido. Puede que el stock haya cambiado.");
        return;
      }
      const { order } = (await orderRes.json()) as { order: { id: string } };

      const payRes = await fetch(`/api/orders/${order.id}/pay`, { method: "POST" });
      if (!payRes.ok) {
        setError("El pedido se creó, pero no se pudo iniciar el pago. Intenta de nuevo desde tus pedidos.");
        clear();
        router.push(`/cuenta/pedidos/${order.id}`);
        return;
      }
      const { checkoutUrl } = (await payRes.json()) as { checkoutUrl: string };
      clear();
      window.location.href = checkoutUrl;
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Método de entrega</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={deliveryMethod === "pickup"}
              onChange={() => setDeliveryMethod("pickup")}
            />
            Retiro en tienda (sin costo)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={deliveryMethod === "delivery"}
              onChange={() => setDeliveryMethod("delivery")}
            />
            Envío a domicilio (${FIXED_SHIPPING_COST.toLocaleString("es-CO")})
          </label>
        </CardContent>
      </Card>

      {deliveryMethod === "delivery" && (
        <Card>
          <CardHeader>
            <CardTitle>Dirección de envío</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {addresses.length > 0 && !addingAddress && (
              <>
                <Select value={addressId} onChange={(e) => setAddressId(e.target.value)}>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.line1}, {a.city}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => setAddingAddress(true)}
                  className="text-left text-sm underline"
                >
                  Usar una dirección nueva
                </button>
              </>
            )}
            {addingAddress && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="line1">Dirección</Label>
                  <Input
                    id="line1"
                    required
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress((f) => ({ ...f, line1: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress((f) => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reference">Referencia (opcional)</Label>
                  <Input
                    id="reference"
                    value={newAddress.reference}
                    onChange={(e) => setNewAddress((f) => ({ ...f, reference: e.target.value }))}
                  />
                </div>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAddingAddress(false)}
                    className="text-left text-sm underline"
                  >
                    Usar una dirección guardada
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Total: ${total.toLocaleString("es-CO")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Procesando..." : "Confirmar y pagar"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
