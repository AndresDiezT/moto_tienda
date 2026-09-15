import { NextResponse } from "next/server";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }
  const { email, password } = parsed.data;

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    throw error;
  }

  // No se usa auth() acá: signIn() setea la cookie de sesión en la respuesta
  // saliente, pero no en la cache de cookies de ESTA request entrante, así
  // que auth() justo después seguiría viendo "sin sesión". Se arma la
  // respuesta con los datos que ya se validaron en signIn().
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 200 });
}
