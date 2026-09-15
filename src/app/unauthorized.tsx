import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <main className="flex flex-1 items-center py-16">
      <Container>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle>401 — No autenticado</CardTitle>
            <CardDescription>Necesitas iniciar sesión para ver esta página.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className={buttonVariants({ variant: "primary" })}>
              Ir al login
            </Link>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
