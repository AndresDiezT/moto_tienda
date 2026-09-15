import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/passwords";
import type { Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

// `next-auth/jwt` solo re-exporta desde @auth/core (`export * from ...`),
// y TypeScript no puede aplicar `declare module` de augmentation sobre un
// módulo sin una exportación local directa (TS2664) — por eso el token se
// tipa con un cast local en vez de augmentar next-auth/jwt.
type AppJwt = { id: string; role: Role } & Record<string, unknown>;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : undefined;
        const password =
          typeof credentials?.password === "string" ? credentials.password : undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        (token as AppJwt).id = user.id;
        (token as AppJwt).role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as AppJwt;
      session.user.id = t.id;
      session.user.role = t.role;
      return session;
    },
  },
});
