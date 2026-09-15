# Contratos — Subida de archivos (imágenes/fotos)

Usado por: `productos.md` (imágenes de producto, HU-02.7) y `ordenes-servicio.md` (fotos de eventos de servicio, HU-03.3).

Patrón de **URL firmada**: el cliente pide una URL de subida temporal, sube el archivo directo al proveedor de almacenamiento (sin pasar por el servidor de la app), y luego usa la URL pública resultante en el endpoint correspondiente (`POST /api/admin/products`, `POST /api/service-orders/:id/events`, etc.).

## POST /api/uploads/sign
**Rol:** admin o mechanic (según el `purpose`).

Request:
```json
{ "purpose": "product-image | service-order-photo", "contentType": "image/jpeg" }
```
Response `200`:
```json
{ "uploadUrl": "string", "publicUrl": "string", "expiresInSeconds": 300 }
```
El cliente hace `PUT` a `uploadUrl` con el archivo, y luego referencia `publicUrl` al crear/actualizar el recurso (producto o evento de orden).

Errores: `403` si el rol no coincide con el `purpose` (ej. un mecánico no puede pedir una URL con `purpose: "product-image"`).

## Notas de implementación
- Proveedor de almacenamiento aún por confirmar entre Supabase Storage y Cloudinary (ver `docs/01-requerimientos-y-arquitectura.md` sección 2) — el contrato de este endpoint no cambia independientemente de cuál se elija.
- Límite de tamaño y tipos de archivo permitidos (`image/jpeg`, `image/png`, ...) se define al implementar, no bloqueante para el diseño de la demo.
