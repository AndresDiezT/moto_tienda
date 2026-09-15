# Épica 3 — Portal de seguimiento de vehículos

## Objetivo
Que el cliente vea en tiempo real el estado de la reparación/mantenimiento de su moto, desde que la deja en el taller hasta que la retira.

## Roles involucrados
Cliente, Mecánico, Admin.

## Alcance
- Registro de vehículos por parte del cliente (marca, modelo, año, placa).
- Creación de orden de servicio por el admin, asociada a un vehículo y con un mecánico asignado.
- Actualización de estado por el mecánico asignado (o admin), con notas y fotos, en una línea de tiempo (Recibido → En diagnóstico → Presupuesto enviado → Aprobado → En reparación → Control de calidad → Listo para entrega → Entregado).
- Cotización del servicio, aprobación por el cliente, y pago en línea (Mercado Pago sandbox).
- Vista del cliente con el estado actual e historial completo de su vehículo.
- Factura simulada al confirmarse el pago del servicio (ver Épica 5).

## Fuera de alcance
- Notificaciones push/WhatsApp/SMS.

## Historias de usuario
Ver carpeta [`../historias-usuario/epic-03-seguimiento-de-vehiculos/`](../historias-usuario/epic-03-seguimiento-de-vehiculos/).
