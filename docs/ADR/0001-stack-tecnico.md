# 0001. Stack técnico: Next.js + Node full-stack

## Estado
Aceptada

## Contexto
El proyecto necesita un stack para dos módulos (tienda en línea + portal de seguimiento de vehículos) más un panel de administración, construidos por un solo desarrollador. Se evaluó Next.js combinado con un backend en Node (API routes/Server Actions dentro del mismo proyecto) frente a Next.js con un backend separado en Python (Django/FastAPI).

## Decisión
Se usa **Next.js (App Router) + TypeScript full-stack**, sin backend separado: la API vive en API Routes/Server Actions de Node dentro del mismo proyecto Next.js.

## Alternativas consideradas
- **Next.js + Python (Django/FastAPI):** Django ofrece un admin panel potente out-of-the-box, pero el panel de este proyecto es una UI a medida (con la misma identidad visual de la tienda y el portal), por lo que esa ventaja no aplica. Mantener dos lenguajes/servicios agrega complejidad de despliegue y de tipos compartidos sin un beneficio claro para este caso.
- **MERN (Node/Express separado + React):** Más piezas que mantener que una app Next.js full-stack, sin ganancia real ya que no hay necesidad inmediata de una API desacoplada (no hay app móvil nativa planeada, ver `docs/01-requerimientos-y-arquitectura.md` sección 7).

## Consecuencias
- Un solo lenguaje (TypeScript) en todo el stack, tipos compartidos entre frontend y backend.
- Prisma como ORM sobre PostgreSQL, Auth.js para autenticación, Mercado Pago SDK de Node para pagos.
- Si en el futuro se necesita una API pública desacoplada (ej. app móvil nativa), se puede extraer sin rediseñar el modelo de datos ni la lógica de negocio.
