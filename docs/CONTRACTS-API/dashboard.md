# Contratos — Dashboard admin

Ver `docs/PRODUCT/historias-usuario/epic-04-panel-de-administracion/hu-04.1-dashboard-general.md`.

## GET /api/admin/dashboard/summary
**Rol:** admin. **HU:** 04.1

Response `200`:
```json
{
  "pendingOrders": 0,
  "activeServiceOrdersByStatus": { "received": 0, "diagnosing": 0, "quote_sent": 0, "approved": 0, "in_repair": 0, "quality_check": 0, "ready_for_pickup": 0 },
  "quotesPendingApproval": 0
}
```
Cada número enlaza (en la UI) al listado filtrado correspondiente — `GET /api/orders?status=pending_payment`, `GET /api/service-orders?status=...`, etc.
