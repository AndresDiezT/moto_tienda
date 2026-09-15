# Épica 5 — Facturación electrónica (simulada)

## Objetivo
Demostrar el flujo completo de facturación por cada venta (producto o servicio) sin depender todavía de un proveedor autorizado por la DIAN.

## Roles involucrados
Cliente, Admin.

## Alcance
- Generación automática de una factura simulada (número consecutivo, PDF simple) al confirmarse el pago de un pedido de tienda o de una orden de servicio.
- La factura queda visible y descargable para el cliente desde su historial.
- Modelo de datos preparado para conectar un proveedor DIAN real más adelante (campos de proveedor/CUFE ya contemplados, ver `docs/01-requerimientos-y-arquitectura.md` sección 4.4).

## Fuera de alcance
- Integración real con un proveedor autorizado por la DIAN (fase futura si el cliente confirma continuar tras la demo).

## Historias de usuario
Ver carpeta [`../historias-usuario/epic-05-facturacion-electronica-simulada/`](../historias-usuario/epic-05-facturacion-electronica-simulada/).
