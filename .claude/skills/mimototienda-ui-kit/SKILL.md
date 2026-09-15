---
name: mimototienda-ui-kit
description: >-
  Inventario de tokens de diseño y componentes UI base de MiMotoTienda.
  Usar SIEMPRE antes de crear un componente visual nuevo (botón, input,
  formulario, card, badge, layout, colores) o de escribir clases Tailwind
  con colores — para reusar lo que ya existe en vez de duplicarlo, y para
  no usar colores crudos de Tailwind en vez de los tokens del proyecto.
  Dispara con: "botón", "formulario", "input", "card", "badge", "layout",
  "colores", "paleta", "tema", "componente UI", "diseño".
---

# UI kit de MiMotoTienda

Este proyecto es una demo de e-commerce + portal de seguimiento de vehículos
(ver `docs/`). Antes de escribir un componente visual nuevo o clases con
colores, revisa este archivo. Si algo similar ya existe, reusarlo o
extenderlo (props/variants) en vez de crear uno nuevo. Si terminas creando
un componente compartido nuevo en `src/components/ui/`, agrégalo a la tabla
de abajo en el mismo cambio.

## Regla de oro: nunca colores Tailwind crudos

Ningún componente usa `bg-blue-600`, `text-slate-900`, `border-zinc-200`,
etc. directamente. Todo pasa por los tokens semánticos definidos en
`src/app/globals.css` (sección `:root` / `@theme inline`), consumidos como
clases Tailwind normales:

| Token | Uso |
|---|---|
| `background` / `foreground` | fondo y texto base de la página |
| `card` / `card-foreground` | fondo y texto de tarjetas |
| `primary` / `primary-foreground` | acento de marca (botón principal, focus ring) |
| `secondary` / `secondary-foreground` | acción secundaria |
| `muted` / `muted-foreground` | texto/superficie de baja énfasis |
| `accent` / `accent-foreground` | hover de elementos interactivos |
| `destructive` / `destructive-foreground` | acciones peligrosas, errores |
| `success` / `success-foreground` | estados positivos (pagado, aprobado) |
| `warning` / `warning-foreground` | estados de alerta (cotización pendiente) |
| `border`, `input`, `ring` | bordes, fondo de inputs, anillo de foco |

Ejemplo: `<div className="bg-card text-card-foreground border border-border">`.

Cambiar la paleta de marca más adelante (cuando el cliente confirme colores
del taller) es editar únicamente los valores en `src/app/globals.css` — los
componentes no cambian.

Ambos modos (claro/oscuro) están definidos: el bloque `:root` es el modo
claro, `@media (prefers-color-scheme: dark)` redefine los mismos nombres
para oscuro. Un componente nuevo no necesita lógica de tema, solo usar los
tokens.

## Íconos

`lucide-react` es la librería de íconos del proyecto (ya instalada). Usarla
para cualquier ícono nuevo — no agregar otra librería de íconos ni usar
emojis/texto como reemplazo de un ícono real (ver `password-input.tsx` para
el patrón: `import { Eye, EyeOff } from "lucide-react"`).

## Utilidad `cn()`

`src/lib/cn.ts` combina `clsx` + `tailwind-merge`. Todo componente que acepte
`className` como prop lo mezcla así: `cn("clases-base", className)`. No
reimplementar esto con template strings.

## Convención de variantes

Los componentes con variantes (color/tamaño) usan `class-variance-authority`
(`cva`), exportando tanto el componente como su función `xxxVariants` (ver
`button.tsx`, `badge.tsx`) para poder reusar los estilos en elementos no-React
(ej. un `<Link>` estilizado como botón con `buttonVariants({ variant, size })`).

## Inventario de componentes (`src/components/ui/`)

| Componente | Archivo | Props/variants clave | Cuándo usarlo |
|---|---|---|---|
| `Button` | `button.tsx` | `variant`: primary\|secondary\|outline\|ghost\|destructive · `size`: sm\|md\|lg | Cualquier acción clickeable. Exporta `buttonVariants` para estilizar otros elementos (ej. `<Link>`) igual que un botón. |
| `Input` | `input.tsx` | props nativas de `<input>` | Campos de texto/email/número en formularios. |
| `PasswordInput` | `password-input.tsx` | props nativas de `<input>` (sin `type`, lo fija internamente) | Todo campo de contraseña: envuelve `Input` con botón "Mostrar/Ocultar". Usar siempre en vez de `<Input type="password">` a mano. |
| `Textarea` | `textarea.tsx` | props nativas de `<textarea>` | Campos de texto largo (descripción de problema, nota de servicio). |
| `Select` | `select.tsx` | props nativas de `<select>` | Selects nativos (categoría, estado, mecánico asignado). |
| `Label` | `label.tsx` | props nativas de `<label>` | Etiqueta de campo de formulario; usar con `htmlFor`. |
| `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter` | `card.tsx` | — | Contenedor con borde/superficie para agrupar contenido (fichas de producto, resumen de orden, panel de dashboard). |
| `Badge` | `badge.tsx` | `variant`: default\|primary\|success\|warning\|destructive | Estados cortos tipo pill: estado de pedido/orden de servicio, "agotado", rol de usuario. |
| `Container` | `container.tsx` | — | Wrapper de ancho máximo + padding lateral responsive; usar en el nivel más alto de cada página, no anidar. |
| `PhotoUploader` | `photo-uploader.tsx` | `purpose`: "product-image"\|"service-order-photo" · `photos`/`onChange` (lista de URLs, controlado) | Subir fotos vía el flujo de signed URL de `docs/CONTRACTS-API/archivos.md` (`src/lib/storage.ts` + `/api/uploads/sign`). No reimplementar el flujo de subida a mano. |

## Componentes de dominio (no genéricos)

No son parte del UI kit reusable (dependen de modelos concretos), pero evitan
duplicar lógica de presentación entre las vistas de cliente/admin/mecánico:

| Componente | Archivo | Uso |
|---|---|---|
| `ServiceOrderStatusBadge` | `src/components/service-orders/status-badge.tsx` | Badge con la etiqueta en español + color correcto para un `ServiceOrderStatus` (mapa en `src/lib/service-order-status.ts`, no hardcodear el label en otro lado). |
| `ServiceOrderTimeline` | `src/components/service-orders/timeline.tsx` | Lista de eventos (más reciente primero) con estado, nota, fotos y autor — usar en toda vista que muestre el historial de una orden de servicio. |
| `OrderStatusBadge` | `src/components/orders/status-badge.tsx` | Igual que `ServiceOrderStatusBadge` pero para `OrderStatus` (pedidos de tienda); mapa en `src/lib/order-status.ts`. |
| `PaymentStatus` | `src/components/payments/payment-status.tsx` | Lista de pagos con proveedor (Mercado Pago/efectivo), estado y link a factura — **genérico entre `ServiceOrder` y `Order`** (recibe `payments` con forma plana, no un modelo Prisma directo). Reusar acá en vez de armar la tabla de pagos a mano. |

## Qué falta a propósito (no crear todavía sin necesidad real)

No hay `Dialog`/`Modal`, `Toast`, `Tooltip`, `DataTable`, ni componentes de
navegación (`Navbar`, `Sidebar`) — se construirán cuando una historia de
usuario concreta los necesite (ver `docs/PLAN/plan-de-trabajo.md`), para no
adivinar una API que después no encaje. Si una fase futura los necesita,
créalos ahí y agrégalos a la tabla de arriba.

## Mantenimiento de este skill

Actualiza este archivo en el mismo commit que:
1. Agregues o borres un componente en `src/components/ui/`.
2. Agregues, renombres o quites un token de color en `globals.css`.
3. Cambies la convención de variantes (ej. si se reemplaza `cva`).
