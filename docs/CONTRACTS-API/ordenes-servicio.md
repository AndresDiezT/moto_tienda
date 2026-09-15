# Contratos — Órdenes de servicio (ServiceOrder)

Ver `docs/PRODUCT/historias-usuario/epic-03-seguimiento-de-vehiculos/`.

> **Regla de timeline:** todo endpoint que cambia `ServiceOrder.status` o `quote_status` (incluyendo cotización, aprobación, rechazo y pago) crea también un `ServiceOrderEvent` correspondiente, con `note` generada por el sistema si el usuario no escribió una. Así el timeline que ve el cliente (HU-03.4, "cada cambio de estado") queda completo sin depender de que el mecánico recuerde registrar cada paso manualmente.
>
> **Pago no bloquea reparación:** por decisión de producto (ver `docs/ADR/0005-inicio-de-reparacion-no-bloqueado-por-pago.md`), ningún endpoint de esta lista valida el estado del pago antes de aceptar un cambio de estado de la orden.
>
> Las fotos (`photos: string[]`) se suben antes mediante el flujo descrito en [`archivos.md`](./archivos.md); aquí solo se referencian las URLs ya subidas.

## POST /api/admin/service-orders
**Rol:** admin. **HU:** 03.2

Request:
```json
{ "vehicleId": "uuid", "mechanicId": "uuid", "problemDescription": "string" }
```
Crea la orden con `status: "received"`. Response `201`.

## PATCH /api/admin/service-orders/:id/assign
**Rol:** admin. **HU:** 03.2

Request: `{ "mechanicId": "uuid" }` — reasignar a otro mecánico. Response `200`.

## GET /api/service-orders
**Rol:** customer (solo las de sus vehículos), mechanic (solo las asignadas a él), admin (todas). **HU:** 03.4, 03.8

Query: `?vehicleId=&status=` (admin también: `&mechanicId=`)

Response `200`: lista con `id, vehicle, status, mechanic, createdAt`. El filtrado por rol se aplica siempre en el backend, no solo en la UI (ver `docs/ARCHITECTURE/modelo-de-datos.md`, regla 4).

## GET /api/service-orders/:id
**Rol:** customer dueño del vehículo, mechanic asignado, o admin. **HU:** 03.4, 03.8

Response `200`: detalle completo + `events[]` (timeline, orden cronológico) + cotización + estado de pago + factura si existe.

Errores: `403` si el usuario no es dueño/asignado/admin.

## POST /api/service-orders/:id/events
**Rol:** mechanic asignado a esa orden, o admin. **HU:** 03.3

Request:
```json
{ "status": "diagnosing | in_repair | quality_check | ready_for_pickup | delivered", "note": "string", "photos": ["url"] }
```
Crea un nuevo `ServiceOrderEvent` (append-only, ver regla 1 del modelo de datos) y actualiza `ServiceOrder.status`. Response `201`.

Errores: `403` si el mecánico no es el asignado a la orden.

## POST /api/service-orders/:id/quote
**Rol:** admin o mecánico asignado. **HU:** 03.5

> Nota: fuera de `/api/admin/*` a propósito — un mecánico asignado también puede cargar la cotización (HU-03.5), y las rutas `/api/admin/*` están reservadas a rol `admin` exclusivamente (ver convención en `README.md`).

Request: `{ "estimatedCost": 0, "detail": "string" }`. Cambia `status` a `quote_sent` y `quote_status` a `pending`. Response `200`.

## POST /api/service-orders/:id/quote/approve
**Rol:** customer dueño del vehículo. **HU:** 03.6

Cambia `quote_status` a `approved` y `status` a `approved`, habilita el pago. Response `200`. Errores: `409` si no hay cotización cargada.

## POST /api/service-orders/:id/quote/reject
**Rol:** customer dueño del vehículo. **HU:** 03.6

Cambia `quote_status` a `rejected`. Response `200`.

Errores comunes a los tres endpoints de cotización: `403` si el usuario no es el mecánico asignado (para cargar) o el dueño del vehículo (para aprobar/rechazar).

## POST /api/service-orders/:id/pay
**Rol:** customer dueño del vehículo. **HU:** 03.7

Solo disponible si `quote_status = approved`. Inicia el checkout de Mercado Pago (sandbox). Response `200`: `{ "checkoutUrl": "string" }`.

Confirmación de pago vía el mismo webhook de `pedidos.md` (`POST /api/payments/webhook/mercadopago`), que al aprobar genera la `Invoice` de servicio (ver `facturas.md`, HU-05.2).

Errores: `409` si la cotización no está aprobada.
