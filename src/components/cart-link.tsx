"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { buttonVariants } from "@/components/ui/button";

export function CartLink() {
  const { count } = useCart();

  return (
    <Link href="/carrito" className={buttonVariants({ variant: "ghost", size: "sm" })}>
      {/* El conteo depende de localStorage: en SSR siempre es 0, así que
          puede diferir del primer render del cliente — no es un bug. */}
      <span suppressHydrationWarning>Carrito{count > 0 ? ` (${count})` : ""}</span>
    </Link>
  );
}
