# MiMotoTienda — Requerimientos y Arquitectura

> **Nota sobre este documento (vigente):** este fue el primer documento del proyecto y sigue siendo la fuente de la visión general y el contexto de negocio. Desde que existen `ADR/`, `ARCHITECTURE/` y `PRODUCT/`, el **detalle** de stack, alcance funcional y modelo de datos vive ahí y es la fuente autoritativa si hay diferencia con lo escrito aquí:
> - Stack técnico (sección 2) → decisión formal en `docs/ADR/0001-stack-tecnico.md`.
> - Alcance funcional (sección 4) → detallado como épicas e historias en `docs/PRODUCT/`.
> - Modelo de datos (sección 5, ya marcado como preliminar) → versión completa en `docs/ARCHITECTURE/modelo-de-datos.md`.
> - Decisiones confirmadas (sección 8) → registradas como ADR en `docs/ADR/` (0002, 0003, 0004, 0005).
>
> Las secciones 0, 1, 3, 6, 7 y 9 (alcance de demo, resumen, roles, no funcionales, fuera de alcance, preguntas abiertas) no tienen aún un documento que las reemplace y siguen siendo la referencia principal.

## 0. Alcance de esta fase: Demo / Prueba de concepto

Este proyecto arranca como una **muestra** para un dueño de taller que mencionó la necesidad de forma casual, sin compromiso todavía. El objetivo es construir un demo funcional y mostrable que le permita decidir si quiere continuar, **no** un sistema listo para producción real con dinero e integraciones legales reales.

Implicaciones concretas para esta fase:

- **Pagos:** se integra Mercado Pago en **modo sandbox/pruebas** (checkout funcional, tarjetas de prueba), no con la cuenta real del comercio. Pasar a producción es trivial más adelante (cambiar credenciales) si el cliente confirma.
- **Facturación electrónica (DIAN):** se **simula** — al pagar se genera un documento con pinta de factura (PDF/registro en base de datos con número consecutivo) pero **sin envío real a la DIAN ni proveedor autorizado contratado**. Integrar un proveedor real (Factus/Alegra/Siigo/etc.) es trabajo de una fase posterior si el proyecto avanza.
- **Envíos a domicilio:** se **simula** — se captura la dirección y se muestra un costo de envío (tarifa fija o calculada de forma simple), sin integración real con ninguna transportadora.
- El resto del alcance (tienda, panel admin, portal de seguimiento de vehículos con mecánicos) se construye funcional de verdad, ya que es lo que mejor demuestra el valor al cliente.

Esto se debe mantener en mente en todo el documento: donde se mencione "facturación electrónica" o "envío", se entiende como simulado para esta fase, con el modelo de datos preparado para conectar el proveedor real después sin rediseñar todo.

## 1. Resumen del proyecto

Plataforma web para un taller de motos con dos grandes módulos:

1. **Tienda en línea (e-commerce):** el taller vende repuestos, accesorios u otros productos, con pagos en línea (Mercado Pago).
2. **Portal de seguimiento de servicio:** los clientes que dejan su moto en el taller pueden entrar con su cuenta y ver el estado de la reparación/mantenimiento en tiempo real.

Ambos módulos comparten el mismo sitio, la misma cuenta de usuario y (probablemente) el mismo panel de administración para el dueño del taller.

## 2. Stack técnico

- **Framework:** Next.js (App Router) + TypeScript, full-stack (API Routes / Server Actions en Node — sin backend separado).
- **Base de datos:** PostgreSQL.
- **ORM:** Prisma.
- **Autenticación:** Auth.js (NextAuth) — credenciales (email/password) como mínimo; posible login social después.
- **Pagos:** Mercado Pago (Checkout Pro o API de pagos).
- **Almacenamiento de archivos** (fotos de vehículos/productos): proveedor S3-compatible (Supabase Storage o Cloudinary — por definir).
- **Hosting:** Vercel (app) + base de datos administrada (Supabase / Neon / Railway — por definir).
- **Notificaciones:** email transaccional (Resend o similar) para empezar; WhatsApp/SMS quedan fuera de alcance inicial.

> Justificación: un solo lenguaje (TypeScript) en todo el stack simplifica mantenimiento para un solo desarrollador, comparte tipos entre frontend/backend, y el ecosistema de Mercado Pago + Prisma en Node está maduro. Un backend en Python no aporta ventaja clara ya que el panel admin será una UI a medida, no el admin genérico de Django.

## 3. Roles de usuario

| Rol | Descripción |
|---|---|
| **Cliente** | Se registra, compra productos, registra/ve sus vehículos y el estado de las órdenes de servicio de su(s) moto(s). |
| **Mecánico** | Usuario propio (login propio). Se le asignan órdenes de servicio (vehículos) y solo puede actualizar el estado/notas/fotos de las órdenes que tiene asignadas. |
| **Admin (dueño del taller)** | Gestiona catálogo de productos, pedidos de la tienda, órdenes de servicio, usuarios, y tiene visibilidad total. |

## 4. Alcance funcional

### 4.1 Tienda en línea
- Catálogo de productos propios del taller (categorías, búsqueda, filtros básicos). MVP: sin gestión de proveedores/terceros (posible fase futura).
- Ficha de producto (imágenes, descripción, precio, stock).
- Carrito de compras.
- Checkout con pago en línea vía Mercado Pago (modo sandbox/pruebas en esta fase), con **factura electrónica simulada** generada por la compra (ver 4.4).
- Método de entrega por pedido: **retiro en tienda** o **domicilio** (dirección de envío del cliente, con costo de envío simulado — tarifa fija).
- Historial de pedidos del cliente (estado: pendiente, pagado, en preparación, enviado/listo para retiro, entregado, cancelado).
- Gestión de inventario básica (stock por producto) desde el panel admin.

### 4.2 Portal de seguimiento de vehículos
- El cliente registra su(s) vehículo(s) (marca, modelo, año, placa/patente).
- El taller (admin) crea una **orden de servicio** asociada a un vehículo y cliente, y le **asigna un mecánico**.
- La orden tiene un **estado** con historial tipo línea de tiempo (ej.: Recibido → En diagnóstico → Presupuesto enviado → Aprobado → En reparación → Control de calidad → Listo para entrega → Entregado).
- El mecánico asignado (o el admin) añade notas y fotos en cada actualización de estado; el mecánico solo ve/edita las órdenes que tiene asignadas.
- El cliente ve el estado actual y el historial completo de su vehículo, en tiempo real (o al refrescar).
- **Cotización y pago del servicio:** el taller carga un presupuesto en la orden, el cliente lo aprueba y **paga en línea** (Mercado Pago sandbox) desde el portal — el pago del servicio se maneja igual que el de la tienda, no es presencial.
- Al pagar el servicio también se genera **factura electrónica simulada**.
- (Opcional/futuro) Notificación por email cuando cambia el estado.

### 4.4 Facturación electrónica (Colombia — DIAN) — simulada en esta fase
- El taller opera en Bogotá y en un escenario real debe emitir factura electrónica válida ante la DIAN por cada venta (productos y servicios). **En esta fase de demo esto se simula**, no hay envío real a la DIAN.
- Al pagar (tienda o servicio), el sistema genera una `Invoice` local con número consecutivo y un PDF simple de "factura", suficiente para mostrar el flujo completo end-to-end.
- El modelo de datos deja un lugar para `proveedor` y `CUFE` en `Invoice` para que, si el cliente decide continuar, conectar un proveedor real autorizado por la DIAN (ej. Factus, Alegra, Siigo, Taxxa) sea un cambio acotado y no un rediseño.

### 4.3 Panel de administración (taller)
- CRUD de productos y categorías.
- Gestión de pedidos de la tienda (cambiar estado, ver detalle, ver pago).
- Gestión de órdenes de servicio (crear, asignar, actualizar estado, adjuntar fotos/notas, cotizar).
- Gestión de vehículos y clientes.
- (Opcional) Gestión de usuarios/roles.

## 5. Modelo de datos preliminar (entidades)

- **User** — id, nombre, email, password_hash, rol (customer/admin/mechanic), teléfono.
- **Vehicle** — id, ownerId (User), marca, modelo, año, placa, VIN (opcional).
- **ServiceOrder** — id, vehicleId, customerId, mechanicId, estado actual, descripción del problema, costo estimado (cotización), costo final, estado de aprobación de cotización, fechas.
- **ServiceOrderEvent** — id, serviceOrderId, estado, nota, fotos[], autor (User), timestamp — historial/timeline.
- **Product** — id, nombre, descripción, precio, stock, categoría, imágenes[].
- **Category** — id, nombre.
- **Address** — id, userId, línea1, ciudad, referencia, etc. (para envíos a domicilio).
- **Order** (pedido de tienda) — id, customerId, items[], total, estado, método de entrega (retiro/domicilio), addressId (si domicilio).
- **OrderItem** — id, orderId, productId, cantidad, precio unitario.
- **Payment** — id, proveedor (Mercado Pago), estado, referencia externa, monto, orderId **o** serviceOrderId (el pago referencia una de las dos, no ambas).
- **Invoice** — id, paymentId, número/CUFE, proveedor de facturación electrónica, estado (emitida/anulada), url del PDF, fecha de emisión.

Este modelo es preliminar; se refina en el siguiente documento (modelo de datos detallado) una vez resueltas las preguntas abiertas.

## 6. Consideraciones no funcionales

- **Mobile-first:** clientes probablemente consultarán el estado de su moto desde el celular.
- **Seguridad:** rutas del panel admin protegidas por rol; un cliente solo puede ver sus propios vehículos/pedidos; un mecánico solo ve sus órdenes asignadas.
- **Auditoría:** el historial de estados de servicio no se debe poder editar/borrar, solo agregar eventos nuevos (trazabilidad).
- **Moneda y localización:** COP (pesos colombianos), zona horaria Bogotá.
- **Naturaleza del proyecto:** esta es una fase de demo/muestra (ver sección 0) — facturación DIAN y envíos van simulados, pagos en sandbox de Mercado Pago.

## 7. Fuera de alcance (por ahora)

- Apps móviles nativas.
- Multi-taller / multi-sucursal (confirmado: un solo local por ahora).
- Gestión de proveedores/terceros vendiendo en la tienda (confirmado: solo productos propios del taller en el MVP; posible fase futura).
- Notificaciones por WhatsApp/SMS (queda para una fase 2).
- Integración real con la DIAN y con transportadoras (simuladas en esta fase, ver sección 0).

## 8. Decisiones confirmadas

1. Un solo local (sin modelado de sucursales por ahora).
2. Mecánicos tienen usuario/login propio y se les asignan órdenes de servicio.
3. MVP vende solo productos propios del taller (sin proveedores externos).
4. El proyecto es una demo para mostrarle al dueño del taller y que decida si continuar — no producción real todavía.
5. Facturación electrónica DIAN: simulada en esta fase (sin proveedor real contratado).
6. Envíos a domicilio: simulados, con costo de tarifa fija (sin transportadora real integrada).
7. Los servicios de reparación también se cotizan y pagan en línea desde el sitio (Mercado Pago sandbox), no solo presencialmente.
8. La tienda soporta tanto retiro en tienda como envío a domicilio.

## 9. Preguntas abiertas

Ninguna bloqueante por ahora — el alcance de la demo quedó definido. Quedan como decisiones a revisar **solo si el cliente confirma continuar** tras ver la muestra:

1. Qué proveedor de facturación electrónica real usar (Factus, Alegra, Siigo, Taxxa, u otro) y si el taller ya tiene habilitación DIAN.
2. Si el taller quiere integrar una transportadora real (Servientrega, Interrapidísimo, etc.) o mantener tarifa fija de envío.
3. Volumen aproximado de clientes/vehículos y pedidos esperados, para dimensionar la versión de producción.
