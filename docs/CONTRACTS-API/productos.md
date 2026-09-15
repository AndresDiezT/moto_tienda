# Contratos — Productos y categorías

Ver `docs/PRODUCT/historias-usuario/epic-02-tienda-en-linea/`.

> Las imágenes se suben antes mediante el flujo descrito en [`archivos.md`](./archivos.md); aquí solo se referencian las URLs ya subidas.

## GET /api/products
**Rol:** público. **HU:** 02.1

Query: `?category=uuid&search=string&page=1`

Response `200`:
```json
{
  "items": [
    { "id": "uuid", "name": "string", "price": 0, "stock": 0, "image": "url", "category": { "id": "uuid", "name": "string" } }
  ],
  "page": 1, "totalPages": 1
}
```
Solo devuelve productos con `active: true`.

## GET /api/products/:id
**Rol:** público. **HU:** 02.2

Response `200`: producto completo (descripción, imágenes[], precio, stock, categoría). `404` si no existe o está inactivo.

## GET /api/categories
**Rol:** público. Response `200`: lista de categorías.

## POST /api/admin/products
**Rol:** admin. **HU:** 02.7

Request:
```json
{ "name": "string", "description": "string", "price": 0, "stock": 0, "categoryId": "uuid", "images": ["url"] }
```
Response `201`.

## PATCH /api/admin/products/:id
**Rol:** admin. **HU:** 02.7

Request: campos parciales del producto, incluye `active: boolean` para desactivar. Response `200`.

## POST /api/admin/categories
**Rol:** admin. **HU:** 02.7

Request: `{ "name": "string" }`. Response `201`.

## PATCH /api/admin/categories/:id
**Rol:** admin. Request: `{ "name": "string" }`. Response `200`.
