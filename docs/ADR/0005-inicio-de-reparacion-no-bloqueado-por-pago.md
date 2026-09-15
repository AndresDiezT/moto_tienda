# 0005. El mecánico puede iniciar la reparación sin esperar el pago aprobado

## Estado
Aceptada

## Contexto
Tras aprobarse la cotización (HU-03.6), el cliente puede pagar el servicio en línea (HU-03.7). Quedaba ambiguo si el sistema debía **bloquear** el paso de la orden a "En reparación" hasta que ese pago quedara aprobado, o si el mecánico podía empezar a trabajar de inmediato.

## Decisión
El sistema **no bloquea** el avance de estado de la orden por el estado del pago. El mecánico puede marcar "En reparación" (y los estados siguientes) aunque el pago todavía no se haya confirmado. Esto refleja cómo opera hoy el taller: confianza con el cliente, cobro asociado a la entrega más que una condición dura para empezar el trabajo.

## Alternativas consideradas
- **Bloquear el inicio de reparación hasta pago aprobado:** protege al taller de hacer trabajo no pagado, pero no refleja la forma de operar actual del cliente y añade fricción/complejidad al flujo (habría que decidir qué pasa si el mecánico ya empezó a desarmar la moto y el pago nunca llega). Se descarta para esta fase.

## Consecuencias
- `POST /api/service-orders/:id/events` (ver `docs/CONTRACTS-API/ordenes-servicio.md`) no valida el estado del pago antes de aceptar una transición de estado.
- El estado de pago sigue siendo visible para el cliente y el taller (HU-03.7), como señal informativa, no como bloqueo.
- Si en una fase futura el taller pide protegerse del impago, esta decisión se revisita (ej. bloquear solo el paso a "Listo para entrega"/"Entregado" en vez de "En reparación").
