import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center py-16">
      <Container>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle>Olvidé mi contraseña</CardTitle>
            <CardDescription>Te enviamos un enlace para restablecerla.</CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
