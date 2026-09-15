# Contratos — Usuarios (mecánicos y clientes, gestión admin)

Base: `/api/admin`. Ver `docs/PRODUCT/historias-usuario/epic-01-autenticacion-y-cuentas/hu-01.3-*` y `epic-04-panel-de-administracion/hu-04.2-*`.

## POST /api/admin/mechanics
**Rol:** admin. **HU:** 01.3

Request:
```json
{ "name": "string", "email": "string", "phone": "string", "temporaryPassword": "string" }
```
Response `201`: usuario creado con `role: "mechanic"`, `active: true`.

Errores: `409` email ya registrado.

## GET /api/admin/mechanics
**Rol:** admin. **HU:** 01.3

Response `200`: lista de mecánicos con `id, name, email, active`.

## PATCH /api/admin/mechanics/:id
**Rol:** admin. **HU:** 01.3

Request: `{ "active": false }` — desactiva sin borrar (conserva historial de órdenes atendidas).

Response `200`.

## GET /api/admin/customers
**Rol:** admin. **HU:** 04.2

Query: `?search=` (nombre/email). Response `200`: lista de clientes con conteo de vehículos.

## GET /api/admin/customers/:id
**Rol:** admin. **HU:** 04.2

Response `200`: datos del cliente + sus vehículos (referencia a `vehiculos.md`).
