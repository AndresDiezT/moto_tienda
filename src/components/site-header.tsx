import Link from "next/link";
import { auth } from "@/auth";
import { landingPathForRole } from "@/lib/roles";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CartLink } from "@/components/cart-link";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-border">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            MiMotoTienda
          </Link>
          <Link href="/tienda" className="text-sm text-muted-foreground hover:text-foreground">
            Tienda
          </Link>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <CartLink />
          {session ? (
            <Link
              href={landingPathForRole(session.user.role)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {session.user.name}
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Iniciar sesión
              </Link>
              <Link href="/registro" className={buttonVariants({ variant: "primary", size: "sm" })}>
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}
