# Contratos — Vehículos

Ver `docs/PRODUCT/historias-usuario/epic-03-seguimiento-de-vehiculos/hu-03.1-*` y `epic-04-panel-de-administracion/hu-04.2-*`.

## POST /api/vehicles
**Rol:** customer autenticado. **HU:** 03.1

Request:
```json
{ "brand": "string", "model": "string", "year": 2020, "plate": "string", "vin": "string | null" }
```
`plate` única dentro de los vehículos del usuario en sesión. Response `201`. Errores: `409` placa duplicada para este cliente.

## GET /api/vehicles
**Rol:** customer autenticado (solo los propios). **HU:** 03.1

Response `200`: lista de vehículos del cliente en sesión.

## POST /api/admin/vehicles
**Rol:** admin. **HU:** 04.2

Igual que `POST /api/vehicles` pero requiere `customerId` en el body (el admin registra a nombre de un cliente existente).

## GET /api/admin/vehicles
**Rol:** admin. **HU:** 04.2

Query: `?customerId=&search=` (placa/marca/modelo). Response `200`.

## PATCH /api/admin/vehicles/:id
**Rol:** admin. **HU:** 04.2

Request: campos parciales (ej. corregir placa). Response `200`.

## GET /api/admin/vehicles/:id/service-orders
**Rol:** admin. **HU:** 04.2

Response `200`: historial de órdenes de servicio de ese vehículo (referencia a `ordenes-servicio.md`).
