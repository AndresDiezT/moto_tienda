# Guion de demo

Guion sugerido para mostrarle el proyecto al dueño del taller. Antes de la
demo, corré `npm run db:seed` para dejar la base de datos en un estado
predecible y "vivo" (ver `prisma/seed.ts`) — es re-ejecutable, así que podés
correrlo de nuevo antes de cada ensayo sin miedo a duplicar datos.

Recordá el marco de la demo (ver `docs/01-requerimientos-y-arquitectura.md`
sección 0): el pago con Mercado Pago corre en modo sandbox, la facturación
DIAN está simulada y el envío usa una tarifa fija simulada. Vale la pena
decirlo explícitamente al cliente al arrancar, para que no espere una
pasarela de pago real ni un envío real.

## Credenciales (después de correr el seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | admin.demo@example.com | Admin12345 |
| Mecánico | mecanico.uno@example.com | Mecanico123 |
| Mecánico | mecanico.dos@example.com | Mecanico123 |
| Cliente | cliente.demo@example.com | Demo12345 |
| Cliente | cliente.dos@example.com | Demo12345 |

## Datos clave que deja el seed

- **Cliente Demo** tiene dos motos:
  - Yamaha FZ 2.0 (ABC123): una orden **entregada** (historial, con factura)
    y una orden **en reparación** (`Ruido en el motor...`) — esta es la
    orden "en vivo" que se actualiza durante la demo (ver paso 3).
  - Honda CB190R (XYZ789): una orden con **cotización enviada, pendiente de
    aprobación** (`Fuga de aceite...`, $220.000) — para aprobarla en vivo
    (ver paso 2).
- **Cliente Dos** tiene otras dos motos con órdenes en varios estados
  (recibido, control de calidad, listo para entrega, aprobado) y pedidos de
  tienda en distintos estados — útil para mostrar el panel de admin con
  datos variados sin tocar nada de Cliente Demo.
- Catálogo con 9 productos en 3 categorías, incluyendo uno agotado
  (Maletero trasero 32L) para mostrar ese estado.

## Flujo sugerido (≈10-15 min)

1. **Login como Cliente Demo → estado de su moto.**
   Entrar a "Mis vehículos" → Yamaha FZ 2.0 → mostrar la orden "En
   reparación" con su timeline completo (recibido → diagnóstico →
   cotización → aprobación → en reparación). Señalar que el cliente puede
   ver cada paso sin llamar al taller.

2. **Aprobar una cotización en vivo.**
   Desde el mismo cliente, ir a la Honda CB190R → la orden con cotización
   enviada → aprobarla ahí mismo. Mostrar que esto habilita el pago
   (HU-03.7) y que queda registrado en el timeline.

3. **Login como admin → dashboard general.**
   Mostrar `/panel`: pedidos de tienda pendientes, cotizaciones pendientes
   de aprobación (ya bajó en 1 tras el paso 2) y el desglose de órdenes de
   servicio activas por estado. Hacer clic en la orden "En reparación" de
   la Yamaha y agregar un evento nuevo (ej. pasarla a "Control de
   calidad") con una nota.

4. **Volver a Cliente Demo → ver el cambio en vivo.**
   Refrescar la vista de la Yamaha: el nuevo evento ya aparece en el
   timeline sin que el cliente haya hecho nada más que recargar. Este es
   el momento que más vende la propuesta: visibilidad en tiempo real del
   estado de la moto.

5. **Compra en la tienda.**
   Como Cliente Demo: ir a "Tienda", agregar 1-2 productos al carrito,
   completar el checkout (elegir retiro o envío), pagar con Mercado Pago
   sandbox (tarjeta de prueba). Mostrar "Mis pedidos" y luego "Mis
   facturas" con el PDF de la factura simulada.

6. **(Opcional, si hay tiempo) Vista de administración.**
   Mostrar `/panel/productos` (alta/edición de productos y categorías) y
   `/panel/pedidos` (gestión de pedidos de otros clientes) para transmitir
   que el taller tiene control total del catálogo y las ventas sin
   depender de terceros.

## Preguntas esperables del cliente

- **"¿Esto ya cobra de verdad?"** No en esta demo — Mercado Pago está en
  sandbox. Pasar a producción implica cuenta real de Mercado Pago y
  credenciales de producción (cambio de configuración, no de código).
- **"¿Y la factura electrónica ante la DIAN?"** La factura que ven es
  simulada (PDF con los mismos datos), para validar el flujo antes de
  integrar un proveedor de facturación electrónica real.
- **"¿Puedo tener más de un mecánico por orden?"** Hoy el modelo es un
  mecánico por orden de servicio — quedó identificado como una posible
  mejora futura, no incluida en este alcance.
