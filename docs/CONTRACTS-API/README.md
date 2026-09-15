# CONTRACTS-API

Contratos de la API: endpoints, request/response, códigos de error, modelos de datos expuestos.

Es la fuente de verdad de "qué expone el backend" — frontend y backend se ponen de acuerdo aquí antes de implementar, y sirve de referencia mientras se construye.

Un archivo por dominio/recurso, cada uno con sus endpoints, parámetros y ejemplos de request/response:

- [`auth.md`](./auth.md) — registro, login, sesión, recuperación de contraseña.
- [`usuarios.md`](./usuarios.md) — gestión admin de mecánicos y clientes.
- [`productos.md`](./productos.md) — catálogo, categorías.
- [`pedidos.md`](./pedidos.md) — pedidos de tienda, checkout, pago (webhook compartido con órdenes de servicio).
- [`vehiculos.md`](./vehiculos.md) — registro y gestión de vehículos.
- [`direcciones.md`](./direcciones.md) — direcciones de envío guardadas por el cliente.
- [`ordenes-servicio.md`](./ordenes-servicio.md) — órdenes de servicio, timeline, cotización, pago.
- [`facturas.md`](./facturas.md) — lectura de facturas simuladas (la generación es automática en el servidor, no un endpoint).
- [`dashboard.md`](./dashboard.md) — resumen para el panel admin.
- [`archivos.md`](./archivos.md) — subida de imágenes/fotos (URLs firmadas), usado por productos y órdenes de servicio.

Convenciones: rutas bajo `/api/admin/*` requieren rol `admin`; el resto valida el rol según se indica en cada endpoint. Los pagos usan un único webhook (`POST /api/payments/webhook/mercadopago`, documentado en `pedidos.md`) compartido entre pedidos de tienda y órdenes de servicio.
