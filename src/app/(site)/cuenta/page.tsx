import Link from "next/link";
import { unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AccountPage() {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["customer"])) forbidden();

  return (
    <main className="flex flex-1 items-center py-16">
      <Container>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle>Mi cuenta</CardTitle>
            <CardDescription>{session.user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Hola, {session.user.name}.</p>
            <Link href="/cuenta/vehiculos" className={buttonVariants({ variant: "outline" })}>
              Mis vehículos
            </Link>
            <Link href="/cuenta/pedidos" className={buttonVariants({ variant: "outline" })}>
              Mis pedidos
            </Link>
            <Link href="/cuenta/direcciones" className={buttonVariants({ variant: "outline" })}>
              Mis direcciones
            </Link>
            <LogoutButton />
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
