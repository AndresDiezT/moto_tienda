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

### Refinamiento (Fase 3): pago presencial también queda registrado
Al construir el flujo se confirmó que, en la operación real del taller, algunos
clientes van a recoger la moto y pagan ahí mismo (efectivo/datáfono físico) en
vez de pagar en línea — el pago en línea es la vía principal, pero no la
única forma en que el taller cobra sus servicios. Como ADR-0005 ya establece
que el pago no bloquea el avance de la reparación, esto ya era posible en la
operación; lo que faltaba era dejarlo trazable en el sistema. Se agregó
`Payment.provider = "cash"` y un endpoint de admin
(`POST /api/admin/service-orders/:id/pay-in-person`) para registrar ese cobro
a mano — genera la misma factura simulada y el mismo evento de timeline que
un pago aprobado por Mercado Pago, solo que sin pasar por el webhook. No
cambia la decisión original: el checkout en línea sigue siendo la vía que el
cliente ve y usa por defecto en el portal.
