import Link from "next/link";
import { forbidden, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CustomersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) unauthorized();
  if (session.user.role !== "admin") forbidden();

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";

  const customers = await prisma.user.findMany({
    where: {
      role: "customer",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, email: true, _count: { select: { vehicles: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Clientes</h1>
      <form className="flex gap-2">
        <Input name="search" defaultValue={search} placeholder="Buscar por nombre o correo" />
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>
      <Card>
        <CardHeader>
          <CardTitle>{customers.length} clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No se encontraron clientes.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {customers.map((customer) => (
                <li key={customer.id} className="flex items-center justify-between py-3">
                  <Link href={`/panel/clientes/${customer.id}`} className="hover:underline">
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {customer._count.vehicles} vehículo(s)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
