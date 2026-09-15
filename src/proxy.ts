import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Chequeo optimista (HU-01.4, criterio 1): un usuario no autenticado que
// intenta entrar a una ruta protegida es redirigido al login. El chequeo de
// ROL (criterio 2: "no autorizado" en acceso indebido) se hace en cada
// página/endpoint con forbidden()/unauthorized(), no acá — ver
// docs de Next.js sobre por qué Proxy no debe ser la única capa de
// autorización.
const PROTECTED_PREFIXES = ["/cuenta", "/panel"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
