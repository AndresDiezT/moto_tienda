"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// El carrito es estado del cliente, no un recurso persistido en el backend
// (docs/CONTRACTS-API/pedidos.md) — se valida stock y precio real solo al
// crear el pedido (POST /api/orders). Se guarda en localStorage para que
// sobreviva a recargas y no se pierda al cambiar de página (HU-02.3).

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mimototienda-cart";

// Lee de forma perezosa (en el inicializador de useState, no en un efecto)
// para no disparar un setState dentro de un effect solo para el estado
// inicial — en el servidor no hay localStorage, así que ahí siempre parte
// vacío; el valor real del cliente llega en la primera hidratación.
function readInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage no disponible (modo privado, etc.) — no bloquea la funcionalidad, solo no persiste.
    }
  }, [items]);

  function addItem(item: Omit<CartItem, "quantity">, quantity: number) {
    setItems((current) => {
      const existing = current.find((i) => i.productId === item.productId);
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, item.stock);
        return current.map((i) =>
          i.productId === item.productId ? { ...i, quantity: newQuantity } : i
        );
      }
      return [...current, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((current) =>
      current
        .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(0, quantity) } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setItems((current) => current.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clear, subtotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
