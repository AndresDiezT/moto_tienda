import { unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { AddressesManager } from "@/components/addresses/addresses-manager";

export default async function AddressesPage() {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["customer"])) forbidden();

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex-1 py-12">
      <Container className="max-w-2xl">
        <h1 className="mb-6 text-xl font-semibold">Mis direcciones</h1>
        <AddressesManager initialAddresses={addresses} />
      </Container>
    </main>
  );
}
