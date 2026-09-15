# Plan de trabajo

Orden de implementación hacia la demo mostrable (ver alcance de esta fase en `docs/01-requerimientos-y-arquitectura.md` sección 0). Cada fase enumera las historias de usuario (`docs/PRODUCT/historias-usuario/`) que cubre.

Criterio de orden: primero lo que es prerrequisito de todo lo demás (auth), después el módulo que más diferencia al taller frente a un ecommerce genérico (seguimiento de vehículos), luego la tienda, y al final lo que consolida ambos módulos (dashboard) y el pulido para mostrar.

## Fase 0 — Fundaciones técnicas
Sin historias de usuario de producto; es base técnica.
- Setup del proyecto (Next.js + TypeScript, Prisma + PostgreSQL).
- Esqueleto de despliegue (Vercel + base de datos administrada).
- Componentes/UI base compartidos (layout, botones, formularios) para no repetirlos por módulo.
- Mecanismo de subida de archivos (`docs/CONTRACTS-API/archivos.md`) — lo necesitan tanto la Fase 2 (fotos de órdenes de servicio) como la Fase 4 (imágenes de producto).

## Fase 1 — Autenticación y cuentas
Épica 1 completa.
- HU-01.1 Registro de cliente
- HU-01.2 Inicio de sesión
- HU-01.3 Creación de usuario mecánico
- HU-01.4 Protección de rutas por rol
- HU-01.5 Recuperación de contraseña

## Fase 2 — Seguimiento de vehículos (base)
Parte de Épica 3 + lo mínimo de Épica 4 para poder operarlo.
- HU-03.1 Registrar mi vehículo
- HU-04.2 Gestionar clientes y vehículos (admin)
- HU-03.2 Crear orden de servicio y asignar mecánico
- HU-03.3 Actualizar el estado de una orden
- HU-03.4 Ver el estado de mi vehículo (cliente)
- HU-03.8 Ver solo mis órdenes asignadas (mecánico)
- HU-04.3 Panel de trabajo del mecánico

> Al final de esta fase ya es posible hacer una demo del flujo diferenciador: crear orden → mecánico actualiza estado con fotos → cliente ve el avance en tiempo real.

## Fase 3 — Cotización, pago y factura del servicio
Resto de Épica 3 + parte de Épica 5.
- HU-03.5 Cargar cotización del servicio
- HU-03.6 Aprobar la cotización
- HU-03.7 Pagar el servicio en línea (Mercado Pago sandbox)
- HU-05.2 Generar factura simulada de una orden de servicio

## Fase 4 — Tienda en línea
Épica 2 completa + parte de Épica 5.
- HU-02.1 Ver catálogo
- HU-02.2 Ver ficha de producto
- HU-02.3 Gestionar carrito
- HU-02.4 Elegir método de entrega
- HU-02.9 Gestionar mis direcciones de envío
- HU-02.5 Pagar el pedido (Mercado Pago sandbox)
- HU-02.6 Ver historial de pedidos
- HU-02.7 Gestionar productos y categorías (admin)
- HU-02.8 Gestionar pedidos de la tienda (admin)
- HU-05.1 Generar factura simulada de un pedido de tienda

## Fase 5 — Consolidación
Resto de Épica 4 + resto de Épica 5.
- HU-04.1 Dashboard general del taller (resume datos de tienda y servicio, por eso va al final)
- HU-05.3 Ver y descargar mis facturas (cliente)

## Fase 6 — Pulido y preparación de la demo
Sin historias de usuario nuevas; trabajo de cierre.
- Datos de ejemplo (seed): productos, vehículos, órdenes en distintos estados del timeline, para que la demo se vea "viva" y no vacía.
- Revisión de responsive/mobile (ver `docs/01-requerimientos-y-arquitectura.md` sección 6).
- Guion de demo: qué flujo mostrarle al taller y en qué orden (sugerido: login cliente → estado de su moto → login admin/mecánico → actualizar orden → login cliente de nuevo mostrando el cambio en vivo → compra en tienda).
- Despliegue en una URL accesible para compartir con el cliente.

## Fuera de este plan
Todo lo listado como "Fuera de alcance" en `docs/01-requerimientos-y-arquitectura.md` sección 7 (apps nativas, multi-sucursal, proveedores externos, integración real DIAN/transportadora, notificaciones WhatsApp/SMS) no se planea en ninguna fase — solo se retoma si el cliente confirma continuar tras ver la demo.
