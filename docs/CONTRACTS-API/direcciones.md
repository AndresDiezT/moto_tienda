# Contratos — Direcciones de envío (Address)

Ver `docs/PRODUCT/historias-usuario/epic-02-tienda-en-linea/hu-02.9-gestionar-direcciones.md`.

El cliente puede guardar varias direcciones y elegir una al hacer checkout con entrega a domicilio (`pedidos.md`, `POST /api/orders`).

## POST /api/addresses
**Rol:** customer autenticado.

Request:
```json
{ "line1": "string", "city": "string", "reference": "string | null" }
```
Response `201`: la dirección creada, asociada al usuario en sesión.

## GET /api/addresses
**Rol:** customer autenticado (solo las propias).

Response `200`: lista de direcciones guardadas del cliente en sesión.

## PATCH /api/addresses/:id
**Rol:** customer, dueño de la dirección.

Request: campos parciales (`line1`, `city`, `reference`). Response `200`. Errores: `403` si la dirección no le pertenece.

## DELETE /api/addresses/:id
**Rol:** customer, dueño de la dirección.

Response `204`. Errores: `409` si la dirección está referenciada por un pedido existente (no se borra, solo se puede dejar de usar hacia adelante).
