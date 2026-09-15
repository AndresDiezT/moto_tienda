import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <main className="flex flex-1 items-center py-16">
      <Container>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle>403 — No autorizado</CardTitle>
            <CardDescription>Tu cuenta no tiene acceso a esta sección.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Volver al inicio
            </Link>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
