# 0003. Mecánicos como usuarios con rol propio y asignación de órdenes

## Estado
Aceptada

## Contexto
El seguimiento de vehículos requiere que alguien en el taller actualice el estado de cada orden de servicio (con notas y fotos). Había que decidir si esa actualización la hace únicamente el administrador (dueño del taller) o si cada mecánico tiene su propio acceso.

## Decisión
Los mecánicos tienen **usuario y login propios** (rol `mechanic`, creado únicamente por el admin — ver `docs/PRODUCT/historias-usuario/epic-01-autenticacion-y-cuentas/hu-01.3-creacion-usuario-mecanico-admin.md`). El admin **asigna** cada orden de servicio a un mecánico específico, y ese mecánico solo puede ver/actualizar las órdenes que tiene asignadas.

## Alternativas consideradas
- **Un único usuario admin que actualiza todo:** más simple de construir, pero no refleja cómo opera un taller con varios mecánicos, y no muestra al cliente (dueño del taller) el valor de dar trazabilidad por mecánico.

## Consecuencias
- `ServiceOrder.mechanic_id` y las reglas de autorización dependen de esta decisión (ver `docs/ARCHITECTURE/modelo-de-datos.md`, regla de negocio 4).
- El panel tiene una vista diferenciada para mecánicos (`docs/PRODUCT/historias-usuario/epic-04-panel-de-administracion/hu-04.3-panel-mecanico.md`), distinta de la del admin.
- Queda abierto (no bloqueante) definir si en el futuro un mecánico puede ver órdenes no asignadas en modo solo-lectura; por ahora no.
