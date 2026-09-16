import Link from "next/link";
import { unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { Container } from "@/components/ui/container";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["mechanic", "admin"])) forbidden();

  const isAdmin = session.user.role === "admin";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <Container className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {isAdmin ? (
              <Link href="/panel" className="font-medium">
                Panel del taller
              </Link>
            ) : (
              <span className="font-medium">Panel del taller</span>
            )}
            {isAdmin && (
              <>
                <Link href="/panel/clientes" className="text-muted-foreground hover:text-foreground">
                  Clientes
                </Link>
                <Link href="/panel/mecanicos" className="text-muted-foreground hover:text-foreground">
                  Mecánicos
                </Link>
                <Link href="/panel/productos" className="text-muted-foreground hover:text-foreground">
                  Productos
                </Link>
                <Link href="/panel/pedidos" className="text-muted-foreground hover:text-foreground">
                  Pedidos
                </Link>
              </>
            )}
            <Link href="/panel/ordenes" className="text-muted-foreground hover:text-foreground">
              Órdenes de servicio
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <LogoutButton size="sm" />
          </div>
        </Container>
      </header>
      <main className="flex-1 py-8">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
