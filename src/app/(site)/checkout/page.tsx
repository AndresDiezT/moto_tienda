import { unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { CheckoutForm } from "@/components/orders/checkout-form";

// HU-02.4: el carrito puede armarse sin sesión, pero el checkout requiere login.
export default async function CheckoutPage() {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["customer"])) forbidden();

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex-1 py-12">
      <Container className="max-w-xl">
        <h1 className="mb-6 text-xl font-semibold">Checkout</h1>
        <CheckoutForm initialAddresses={addresses} />
      </Container>
    </main>
  );
}
