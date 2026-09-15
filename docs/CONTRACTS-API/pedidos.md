# Contratos — Pedidos de tienda (Order)

Ver `docs/PRODUCT/historias-usuario/epic-02-tienda-en-linea/`.

> El carrito (HU-02.3) es estado del cliente (front-end), no un recurso persistido en el backend — se valida stock y precio real solo al crear el pedido.
>
> `addressId` debe ser una dirección previamente creada por el cliente — ver [`direcciones.md`](./direcciones.md) (HU-02.9).

## POST /api/orders
**Rol:** customer autenticado. **HU:** 02.4

Request:
```json
{
  "items": [ { "productId": "uuid", "quantity": 1 } ],
  "deliveryMethod": "pickup | delivery",
  "addressId": "uuid | null"
}
```
Valida stock disponible y recalcula precios desde `Product` (nunca confía en el precio enviado por el cliente). Si `deliveryMethod = delivery`, `addressId` es obligatorio y se aplica `shipping_cost` fijo (simulado, ver ADR-0002).

Response `201`:
```json
{ "order": { "id": "uuid", "status": "pending_payment", "total": 0 } }
```
Errores: `409` stock insuficiente en algún ítem · `422` `addressId` faltante con `delivery` · `403` si `addressId` no pertenece al cliente en sesión.

## POST /api/orders/:id/pay
**Rol:** customer, dueño del pedido. **HU:** 02.5

Inicia el checkout de Mercado Pago (sandbox) para el pedido. Response `200`: `{ "checkoutUrl": "string" }` (redirección a Mercado Pago).

## POST /api/payments/webhook/mercadopago
**Rol:** público (autenticado por firma de Mercado Pago, no por sesión de usuario). Recurso compartido con `ordenes-servicio.md`.

Recibe la notificación de pago de Mercado Pago. Al confirmarse `approved`:
1. Marca el `Payment` correspondiente como `approved`.
2. Marca el `Order` como `paid` y descuenta stock.
3. Genera la `Invoice` simulada (ver `facturas.md`, HU-05.1).

## GET /api/orders
**Rol:** customer autenticado (solo los propios) o admin (todos, con filtros). **HU:** 02.6, 02.8

Query (solo admin): `?status=&customerId=`

Response `200`: lista de pedidos con `id, status, total, deliveryMethod, createdAt`.

## GET /api/orders/:id
**Rol:** customer dueño del pedido, o admin. **HU:** 02.6, 02.8

Response `200`: detalle completo con items, dirección (si aplica), estado de pago, factura asociada (si existe).

## PATCH /api/admin/orders/:id/status
**Rol:** admin. **HU:** 02.8

Request: `{ "status": "preparing | ready_or_shipped | delivered | cancelled" }`. Response `200`.
