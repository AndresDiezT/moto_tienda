# MiMotoTienda

Demo de e-commerce + portal de seguimiento de vehículos para un taller de
motos en Bogotá. **Es una demo para mostrarle a un cliente potencial**, no
producción real — ver `docs/01-requerimientos-y-arquitectura.md` sección 0
(pagos en sandbox de Mercado Pago, facturación DIAN simulada, envíos
simulados).

Toda la definición de producto, arquitectura y plan de trabajo vive en
`docs/`. Empezar por ahí, en el orden indicado en `docs/README.md` si existe,
o: `01-requerimientos-y-arquitectura.md` → `ADR/` → `ARCHITECTURE/` →
`PRODUCT/` → `CONTRACTS-API/` → `PLAN/plan-de-trabajo.md`.

## Stack

Next.js (App Router) + TypeScript full-stack, Prisma ORM 7 (driver adapter
`@prisma/adapter-pg`) sobre PostgreSQL, Supabase (base de datos administrada
+ Storage de archivos), Auth.js (Fase 1), Mercado Pago sandbox (Fase 3/4).
Ver `docs/ADR/0001-stack-tecnico.md`.

## Desarrollo local

1. Copiar `.env.example` a `.env` y completar con las credenciales del
   proyecto de Supabase (ver sección siguiente).
2. Instalar dependencias: `npm install`.
3. Generar el cliente de Prisma: `npx prisma generate` (ya corrido en el
   repo, solo hace falta si cambia `prisma/schema.prisma`).
4. Aplicar el schema a la base de datos: `npx prisma migrate dev`.
5. Levantar el servidor: `npm run dev` → [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Ver `.env.example` para la lista completa y comentada. Resumen:

| Variable | Para qué | Dónde se usa |
|---|---|---|
| `DATABASE_URL` | Conexión pooled (pgbouncer, puerto 6543) | Runtime de la app — `src/lib/prisma.ts` |
| `DIRECT_URL` | Conexión directa (puerto 5432) | Solo la Prisma CLI (`migrate`, `studio`) — `prisma.config.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase | Cliente de Storage — `src/lib/supabase.ts` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (pública, reemplaza a la antigua `anon`) | Reservada para Fase 1 (Auth) |
| `SUPABASE_SECRET_KEY` | Secret key (solo servidor, reemplaza a la antigua `service_role`) | Cliente de Storage — `src/lib/supabase.ts` |

Las credenciales de Mercado Pago y Auth.js se agregan en las fases que las
necesitan (ver `docs/PLAN/plan-de-trabajo.md`).

## Despliegue

- **App:** Vercel. Conectar el repositorio y configurar las mismas variables
  de entorno de la tabla anterior en el proyecto de Vercel (Settings →
  Environment Variables). No requiere `vercel.json`: Next.js se detecta
  automáticamente.
- **Base de datos y storage de archivos:** Supabase (un solo proyecto cubre
  ambos). Crear el proyecto, copiar la connection string pooled y la directa
  desde Project Settings → Database, y crear un bucket público llamado
  `uploads` en Storage (usado por `src/lib/storage.ts`, ver
  `docs/CONTRACTS-API/archivos.md`).
- Antes del primer deploy con datos reales, correr las migraciones contra la
  base de datos de Supabase: `npx prisma migrate deploy`.

## Estructura relevante

- `docs/` — documentación de producto/arquitectura (fuente de verdad).
- `prisma/schema.prisma` — modelo de datos (ver `docs/ARCHITECTURE/modelo-de-datos.md`).
- `src/lib/` — clientes compartidos (`prisma.ts`, `supabase.ts`, `storage.ts`, `cn.ts`).
- `src/components/ui/` — componentes UI base; inventario y tokens de diseño
  documentados en `.claude/skills/mimototienda-ui-kit/SKILL.md`.
