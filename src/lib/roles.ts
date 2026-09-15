import type { Role } from "@/generated/prisma/enums";

// HU-01.2: tras iniciar sesión, cada rol va a su vista correspondiente.
// Las rutas reales de tienda/vehículos llegan en fases posteriores; por
// ahora customer aterriza en /cuenta y mechanic en el placeholder /panel/ordenes.
export function landingPathForRole(role: Role): string {
  switch (role) {
    case "admin":
      return "/panel/mecanicos";
    case "mechanic":
      return "/panel/ordenes";
    case "customer":
    default:
      return "/cuenta";
  }
}

// HU-01.4: "un admin tiene acceso completo a todas las secciones" — el admin
// siempre pasa, sin importar la lista de roles permitidos de la sección.
export function canAccess(userRole: Role, allowedRoles: Role[]): boolean {
  return userRole === "admin" || allowedRoles.includes(userRole);
}
