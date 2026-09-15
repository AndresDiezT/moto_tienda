# 0002. Alcance de demo: pagos en sandbox, facturación y envíos simulados

## Estado
Aceptada

## Contexto
El proyecto nace de una conversación casual: un dueño de taller mencionó la necesidad pero no hubo compromiso ni contrato. El objetivo inmediato es construir una muestra funcional para que decida si quiere continuar, no un sistema de producción con dinero real ni integraciones legales/logísticas reales.

Dos de los requisitos mencionados por el cliente tienen implicaciones que exceden el alcance de una demo:
- **Facturación electrónica DIAN:** requiere habilitación legal ante la DIAN y/o contratar un proveedor autorizado (Factus, Alegra, Siigo, etc.), con costos y trámites que no tiene sentido asumir sin que el cliente haya confirmado el proyecto.
- **Envíos a domicilio:** requiere elegir e integrar una transportadora real.

## Decisión
Para esta fase:
- **Pagos:** Mercado Pago en modo sandbox/pruebas (checkout funcional, sin cuenta real del comercio ni dinero real).
- **Facturación electrónica:** simulada — se genera una `Invoice` local (consecutivo + PDF) al confirmarse un pago, sin envío real a la DIAN ni proveedor autorizado contratado.
- **Envíos a domicilio:** simulados — se captura la dirección y se cobra una tarifa fija, sin transportadora real integrada.

El modelo de datos (`docs/ARCHITECTURE/modelo-de-datos.md`) se diseña dejando los campos necesarios (`Invoice.provider`, `Invoice.cufe`) para que conectar los servicios reales después sea un cambio acotado, no un rediseño.

## Alternativas consideradas
- **Integrar todo real desde el inicio:** descartado — implica costos, trámites legales y tiempo de desarrollo no justificados antes de que el cliente confirme interés real en el proyecto.
- **No simular nada y dejar esas funciones fuera del todo:** descartado — el flujo de pago y factura es parte central de lo que hace atractiva la demo (mostrar el ciclo completo de compra/servicio), omitirlo le restaría valor a la muestra.

## Consecuencias
- La demo puede mostrarse sin dependencias externas contratadas ni riesgo de manejar dinero real.
- Si el cliente confirma continuar, queda pendiente una fase posterior para: contratar proveedor DIAN real, habilitar cuenta real de Mercado Pago, y decidir transportadora (ver preguntas abiertas en `docs/01-requerimientos-y-arquitectura.md` sección 9).
