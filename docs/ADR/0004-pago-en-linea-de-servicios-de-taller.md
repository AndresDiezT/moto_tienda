# 0004. Los servicios de taller se cotizan y pagan en línea, no solo presencialmente

## Estado
Aceptada

## Contexto
Inicialmente se planteó que el pago de reparaciones/mantenimiento se hiciera presencialmente en el taller, y que solo los productos de la tienda se pagaran en línea. El cliente confirmó que prefiere que el pago del servicio también se haga por el sitio.

## Decisión
El flujo de una orden de servicio incluye cotización cargada por el taller, aprobación por el cliente, y **pago en línea vía Mercado Pago** (sandbox en esta fase) — el mismo mecanismo de pago que usa la tienda, no un flujo separado.

## Alternativas consideradas
- **Pago solo presencial para servicios:** más simple (no requiere estado de aprobación de cotización ni gateway de pago en ese flujo), pero el cliente pidió explícitamente que el pago de servicios también fuera en línea.

## Consecuencias
- `Payment` es una entidad compartida entre `Order` (tienda) y `ServiceOrder` (servicio), en vez de dos mecanismos de pago independientes (ver `docs/ARCHITECTURE/modelo-de-datos.md`).
- `ServiceOrder` necesita un estado de aprobación de cotización (`quote_status`) previo a habilitar el pago (ver HU-03.5, HU-03.6, HU-03.7).
- La facturación simulada (ADR-0002) aplica igual para pagos de servicio que para pagos de tienda.
