# Contratos — Facturas (simuladas)

Ver `docs/PRODUCT/historias-usuario/epic-05-facturacion-electronica-simulada/` y ADR-0002.

> La creación de una `Invoice` **no** es un endpoint que llame el frontend: ocurre automáticamente en el servidor cuando el webhook de Mercado Pago confirma un pago (`approved`), tanto para `Order` (HU-05.1) como para `ServiceOrder` (HU-05.2). Los endpoints de este documento son solo de **lectura**.

## GET /api/invoices
**Rol:** customer autenticado (solo las propias). **HU:** 05.3

Response `200`:
```json
{
  "items": [
    { "id": "uuid", "number": "string", "series": "store | service", "issuedAt": "string", "total": 0 }
  ]
}
```

## GET /api/invoices/:id
**Rol:** customer dueño de la factura, o admin. Response `200`: detalle completo (referencia al pedido u orden de servicio origen).

## GET /api/invoices/:id/pdf
**Rol:** customer dueño de la factura, o admin. **HU:** 05.3

Response `200`: archivo PDF (`Content-Type: application/pdf`).
