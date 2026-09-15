import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/reset-tokens";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  // Contrato: 202 siempre, sin revelar si el correo existe.
  if (!parsed.success) {
    return new NextResponse(null, { status: 202 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user && user.active) {
    const { token, tokenHash } = generateResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    // Envío simulado (ADR-0002 / HU-01.5): se loguea en vez de mandar email real.
    console.log(
      `[forgot-password] Enlace de restablecimiento para ${user.email}: /restablecer-password?token=${token}`
    );
  }

  return new NextResponse(null, { status: 202 });
}
