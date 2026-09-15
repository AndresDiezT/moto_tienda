import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 items-center py-16">
      <Container>
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>MiMotoTienda</CardTitle>
            <CardDescription>
              Demo en construcción — tienda en línea y portal de seguimiento de vehículos
              para el taller.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Fase 0 completada: proyecto, base de datos y componentes base. Próxima fase:
            autenticación y cuentas.
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
