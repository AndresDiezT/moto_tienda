# Contratos — Autenticación y cuentas

Base: `/api/auth`. Ver `docs/PRODUCT/historias-usuario/epic-01-autenticacion-y-cuentas/`.

## POST /api/auth/register
**Rol:** público. **HU:** 01.1

Request:
```json
{ "name": "string", "email": "string", "phone": "string", "password": "string" }
```
Response `201`:
```json
{ "user": { "id": "uuid", "name": "string", "email": "string", "role": "customer" } }
```
Al crear la cuenta se inicia sesión automáticamente (cookie de sesión).

Errores: `409` email ya registrado · `422` validación (password débil, email inválido).

## POST /api/auth/login
**Rol:** público. **HU:** 01.2

Request:
```json
{ "email": "string", "password": "string" }
```
Response `200`:
```json
{ "user": { "id": "uuid", "name": "string", "role": "customer|mechanic|admin" } }
```
Errores: `401` credenciales inválidas (mensaje genérico, no indica si el correo existe).

## POST /api/auth/logout
**Rol:** cualquier usuario autenticado. Response `204`.

## GET /api/auth/me
**Rol:** cualquier usuario autenticado. **HU:** 01.4

Response `200`: datos del usuario en sesión (id, name, email, role). `401` si no hay sesión.

## POST /api/auth/forgot-password
**Rol:** público. **HU:** 01.5

Request: `{ "email": "string" }`. Response `202` siempre (no revela si el correo existe).

## POST /api/auth/reset-password
**Rol:** público, requiere token. **HU:** 01.5

Request:
```json
{ "token": "string", "newPassword": "string" }
```
Response `200`. Errores: `400` token inválido o expirado.

## Notas de implementación
- Rutas de mecánico/admin (`POST /api/admin/mechanics`) están en `usuarios.md`, no aquí — el registro público (`/register`) solo puede crear rol `customer` (HU-01.3).
- Protección de rutas por rol (HU-01.4) se aplica como middleware sobre todos los endpoints de `admin/*` y sobre los de mecánico, no es un endpoint en sí.
